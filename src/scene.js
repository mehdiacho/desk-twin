/* ============================================================================
   SCENE - lighting, the world assembly, and the parts turntable.
   ========================================================================== */

import { PARTS, worldParts, byId } from './registry.js';
import { useThree, mm, bounds, group } from './build.js';
import { DESK, ROOM } from './survey.js';

export function makeRenderer(THREE, canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;

  // three changed these names across versions; set whichever exists.
  if ('outputColorSpace' in r && THREE.SRGBColorSpace) r.outputColorSpace = THREE.SRGBColorSpace;
  else if ('outputEncoding' in r && THREE.sRGBEncoding) r.outputEncoding = THREE.sRGBEncoding;
  if (THREE.ACESFilmicToneMapping) r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 0.98;
  return r;
}

/** A small procedural studio environment: broad windows reflected by dark
 * plastic and metal. Shared by World/Parts, no external HDR image required.
 */
export function makeEnvironment(THREE, renderer) {
  const studio = new THREE.Scene();
  const enclosure = new THREE.Mesh(new THREE.SphereGeometry(12, 24, 12),
    new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.075, 0.08, 0.09), side: THREE.BackSide }));
  studio.add(enclosure);
  for (const light of [
    { p: [4,3,2], size: [3,4], rgb: [2.1,1.95,1.8] },
    { p: [-4,2,3], size: [2,4], rgb: [0.85,0.95,1.1] },
    { p: [0,5,-1], size: [3,3], rgb: [1.3,1.3,1.3] },
  ]) {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(...light.size),
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...light.rgb) }));
    panel.position.set(...light.p); panel.lookAt(0, 0, 0); studio.add(panel);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(studio, 0.04, 0.1, 30);
  pmrem.dispose();
  studio.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
  return target;
}

/* --- lighting -------------------------------------------------------------
   One strong key from the window (right, high, slightly forward), a cool
   bounce off the tiled floor, and a soft fill from the left so the K-legs
   do not go solid black. Matches the 12:05 light in the photographs.     */
export function addLighting(THREE, scene) {
  const lights = group('lighting', []);

  const hemi = new THREE.HemisphereLight(0xfdf6e6, 0xb9b2a4, 0.34);
  hemi.position.set(0, mm(ROOM.height), 0);
  lights.add(hemi);

  const key = new THREE.DirectionalLight(0xfff3dd, 2.0);
  key.position.set(mm(3600), mm(2300), mm(1900));
  key.target.position.set(mm(DESK.length / 2), mm(600), mm(DESK.depth / 2));
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.002;
  const s = key.shadow.camera;
  s.near = mm(500); s.far = mm(9000);
  s.left = -3.2; s.right = 3.2; s.top = 3.0; s.bottom = -2.2;
  s.updateProjectionMatrix();
  lights.add(key);
  lights.add(key.target);

  const fill = new THREE.DirectionalLight(0xdfe6f2, 0.34);
  fill.position.set(mm(-2200), mm(1800), mm(2400));
  lights.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.20);
  rim.position.set(mm(400), mm(1600), mm(-2600));
  lights.add(rim);

  const amb = new THREE.AmbientLight(0xffffff, 0.05);
  lights.add(amb);

  scene.add(lights);
  return { key, fill, rim, hemi };
}

/* --- the world ----------------------------------------------------------- */
export function buildWorld(THREE, opts) {
  useThree(THREE);
  const world = group('world', []);
  const index = new Map();

  worldParts().forEach((p) => {
    if (p.id === 'room' && opts && opts.room === false) return;
    const obj = p.build(THREE);
    obj.userData.partId = p.id;
    obj.traverse((c) => { c.userData.partId = p.id; });
    index.set(p.id, obj);
    world.add(obj);
  });

  return { world, index };
}

/* --- explode -------------------------------------------------------------
   Pushes every part away from the centre of the desk along its own offset
   vector, so the assembly comes apart without anything passing through
   anything else. `t` runs 0..1.                                          */
export function applyExplode(THREE, index, t) {
  const centre = new THREE.Vector3(
    mm(DESK.length / 2), mm(DESK.height / 2), mm(DESK.depth / 2));

  index.forEach((obj) => {
    if (!obj.userData.home) {
      obj.userData.home = obj.position.clone();
      const b = bounds(obj);
      const c = b.getCenter(new THREE.Vector3());
      const dir = c.sub(centre);
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      // vertical separation is worth more than horizontal for a stacked desk
      dir.normalize();
      dir.y = dir.y * 1.6 + 0.35;
      obj.userData.explodeDir = dir.normalize();
    }
    obj.position.copy(obj.userData.home)
      .addScaledVector(obj.userData.explodeDir, t * 0.9);
  });
}

/* --- parts turntable ------------------------------------------------------
   Builds one part in isolation and recentres it on the origin, so the
   camera framing does not depend on where the thing lives in the room.  */
export function buildPart(THREE, id) {
  useThree(THREE);
  const spec = byId(id);
  if (!spec) return null;

  const obj = spec.build(THREE);
  const holder = group('turntable', [obj]);

  const b = bounds(obj);
  const size = b.getSize(new THREE.Vector3());
  const centre = b.getCenter(new THREE.Vector3());
  obj.position.sub(new THREE.Vector3(centre.x, b.min.y, centre.z));

  // a small plinth so the part is not floating in space
  const radius = Math.max(size.x, size.z) * 0.75 + 0.06;
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.006, 64),
    new THREE.MeshStandardMaterial({ color: 0xe6e2d8, roughness: 0.85 }));
  plinth.position.y = -0.003;
  plinth.receiveShadow = true;
  plinth.name = 'plinth';
  holder.add(plinth);

  holder.userData.size = size;
  holder.userData.spec = spec;
  return holder;
}

export function partsLighting(THREE, scene) {
  const lights = group('partsLighting', []);
  lights.add(new THREE.HemisphereLight(0xfffaf0, 0xc8c2b4, 0.5));

  const key = new THREE.DirectionalLight(0xfff6e8, 2.0);
  key.position.set(2.4, 3.0, 2.0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.001;
  const s = key.shadow.camera;
  s.near = 0.1; s.far = 12;
  s.left = -1.6; s.right = 1.6; s.top = 1.6; s.bottom = -1.6;
  s.updateProjectionMatrix();
  lights.add(key);

  const fill = new THREE.DirectionalLight(0xe4ecf7, 0.65);
  fill.position.set(-2.2, 1.4, 1.6);
  lights.add(fill);

  const back = new THREE.DirectionalLight(0xffffff, 0.4);
  back.position.set(0.2, 1.8, -2.6);
  lights.add(back);

  lights.add(new THREE.AmbientLight(0xffffff, 0.08));
  scene.add(lights);
  return lights;
}
