import { mm, bounds } from './build.js';

/** A closed shell lofted through smooth outline rings, in local millimetres.
 * Profiles are star-shaped around their origin. Separate volumes can share
 * a ring to form casing seams without overlapping slabs or sphere bulges.
 */
export function contourShell(THREE, shape, rings, material, name, slope = () => 0) {
  let outline = shape.getSpacedPoints(96).slice(0, -1);
  if (THREE.ShapeUtils.isClockWise(outline)) outline.reverse();
  const positions = [], indices = [], uvs = [], n = outline.length;
  rings.forEach((r, ri) => outline.forEach((p, i) => {
    const x = p.x * r.scale, z = p.y * r.scale;
    positions.push(mm(x), mm(r.y + slope(x, z)), mm(z));
    uvs.push(i / n, ri / (rings.length - 1));
  }));
  for (let r = 0; r < rings.length - 1; r++) for (let i = 0; i < n; i++) {
    const a = r * n + i, b = r * n + (i + 1) % n;
    indices.push(a, a + n, b + n, a, b + n, b);
  }
  // The center fans close the small crown and underside rings.
  for (const [ring, top] of [[0, false], [rings.length - 1, true]]) {
    const center = positions.length / 3;
    positions.push(0, mm(rings[ring].y + slope(0, 0)), 0);
    uvs.push(.5, top ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const a = ring * n + i, b = ring * n + (i + 1) % n;
      indices.push(...(top ? [center, b, a] : [center, a, b]));
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name; mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

/** Keep refined shapes inside the existing provisional survey envelope. */
export function placeInEnvelope(THREE, object, x, y, z, width, height, depth) {
  const box = bounds(object), size = box.getSize(new THREE.Vector3());
  object.scale.set(mm(width) / size.x, mm(height) / size.y, mm(depth) / size.z);
  object.position.set(mm(x) - box.min.x * object.scale.x,
    mm(y) - box.min.y * object.scale.y, mm(z) - box.min.z * object.scale.z);
  return object;
}
