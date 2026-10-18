/* ============================================================================
   BUILD - millimetre helpers.

   The survey is in millimetres; three.js works best in metres. This is the
   only place that conversion happens. Every helper takes a MIN CORNER
   (left, bottom, rear) because that is how the elevation set dimensions
   things - you never have to halve anything by hand.
   ========================================================================== */

export const MM = 0.001;
export const mm = (v) => v * MM;

let THREE = null;
export function useThree(t) { THREE = t; }

/** Axis-aligned box placed by its min corner, in mm. */
export function box(mat, x, y, z, w, h, d, opts) {
  const g = new THREE.BoxGeometry(mm(w), mm(h), mm(d));
  const mesh = new THREE.Mesh(g, mat);
  mesh.position.set(mm(x + w / 2), mm(y + h / 2), mm(z + d / 2));
  return finish(mesh, opts);
}

/** Rounded box within the supplied bounds. Radius and coordinates are mm.
 * The central faces stay planar; explicit normals join the curved edge seams.
 */
export function roundedBox(mat, x, y, z, w, h, d, radius, opts) {
  const r = mm(Math.min(radius, w / 2, h / 2, d / 2));
  if (!(r > 0)) return box(mat, x, y, z, w, h, d, opts);
  const core = [mm(w) / 2 - r, mm(h) / 2 - r, mm(d) / 2 - r];
  const g = new THREE.BoxGeometry(1, 1, 1, 7, 7, 7);
  const pos = g.attributes.position, normals = g.attributes.normal;
  const inner = 0.5 - 2 / 7;
  const p = new THREE.Vector3(), q = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    q.set(...p.toArray().map(v => Math.max(-inner, Math.min(inner, v))));
    n.copy(p).sub(q).normalize();
    pos.setXYZ(i, q.x / inner * core[0] + n.x * r,
      q.y / inner * core[1] + n.y * r, q.z / inner * core[2] + n.z * r);
    normals.setXYZ(i, n.x, n.y, n.z);
  }
  g.computeBoundingBox();
  g.computeBoundingSphere();
  const mesh = new THREE.Mesh(g, mat);
  mesh.position.set(mm(x + w / 2), mm(y + h / 2), mm(z + d / 2));
  return finish(mesh, opts);
}

/** Box placed by its centre, in mm. Useful for things that rotate. */
export function boxC(mat, cx, cy, cz, w, h, d, opts) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(mm(w), mm(h), mm(d)), mat);
  mesh.position.set(mm(cx), mm(cy), mm(cz));
  return finish(mesh, opts);
}

/** Cylinder by centre. `axis` is 'x' | 'y' | 'z', default 'y'. */
export function cyl(mat, cx, cy, cz, radius, length, axis, segments, opts) {
  const g = new THREE.CylinderGeometry(
    mm(radius), mm(radius), mm(length), segments || 24);
  const mesh = new THREE.Mesh(g, mat);
  if (axis === 'x') mesh.rotation.z = Math.PI / 2;
  if (axis === 'z') mesh.rotation.x = Math.PI / 2;
  mesh.position.set(mm(cx), mm(cy), mm(cz));
  return finish(mesh, opts);
}

/** A flat plane, by min corner, lying in the XZ plane (facing up). */
export function slab(mat, x, y, z, w, d, opts) {
  const g = new THREE.PlaneGeometry(mm(w), mm(d));
  const mesh = new THREE.Mesh(g, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(mm(x + w / 2), mm(y), mm(z + d / 2));
  return finish(mesh, opts);
}

/** Extrude a 2D profile (mm, in the XY plane) to a given depth along Z. */
export function extrude(mat, points, depth, opts) {
  const shape = new THREE.Shape();
  points.forEach((p, i) => {
    const [px, py] = p;
    i ? shape.lineTo(mm(px), mm(py)) : shape.moveTo(mm(px), mm(py));
  });
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: mm(depth), bevelEnabled: true,
    bevelThickness: mm(3), bevelSize: mm(3), bevelSegments: 2,
  });
  return finish(new THREE.Mesh(g, mat), opts);
}

/** A tube following a list of mm points - cables, headbands, antennas. */
export function tube(mat, points, radius, opts) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(mm(p[0]), mm(p[1]), mm(p[2]))));
  const g = new THREE.TubeGeometry(curve, Math.max(12, points.length * 6), mm(radius), 8, false);
  return finish(new THREE.Mesh(g, mat), opts);
}

function finish(mesh, opts) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (opts) {
    if (opts.name) mesh.name = opts.name;
    if (opts.noShadow) { mesh.castShadow = false; mesh.receiveShadow = false; }
    if (opts.noCast) mesh.castShadow = false;
    if (opts.rotY) mesh.rotation.y = opts.rotY;
    if (opts.rotX) mesh.rotation.x = opts.rotX;
    if (opts.rotZ) mesh.rotation.z = opts.rotZ;
  }
  return mesh;
}

/** A named group - the unit of the part registry. */
export function group(name, children) {
  const g = new THREE.Group();
  g.name = name;
  (children || []).forEach((c) => c && g.add(c));
  return g;
}

/** World-space bounding box of an object, in metres. */
export function bounds(obj) {
  // r147 Box3 ignores instance transforms. Include them for gallery framing
  // and explode offsets; a unit-sized instance template is not a scene bound.
  obj.updateWorldMatrix(true, true);
  const result = new THREE.Box3();
  const local = new THREE.Box3(), matrix = new THREE.Matrix4(), instance = new THREE.Matrix4();
  obj.traverse(mesh => {
    if (!mesh.geometry) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    if (mesh.isInstancedMesh) {
      for (let i = 0; i < mesh.count; i++) {
        mesh.getMatrixAt(i, instance);
        matrix.multiplyMatrices(mesh.matrixWorld, instance);
        result.union(local.copy(mesh.geometry.boundingBox).applyMatrix4(matrix));
      }
    } else result.union(local.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld));
  });
  return result;
}
