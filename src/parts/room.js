/* ============================================================================
   ROOM - floor, two walls, the window and the curtain.

   The room is the least-measured thing here. It exists so the desk has
   somewhere to stand and something to bounce light off; every number in
   ROOM is an estimate until you measure the corner.
   ========================================================================== */

import { ROOM } from '../survey.js';
import { materials } from '../materials.js';
import { box, group, mm } from '../build.js';
import * as TEX from '../textures.js';

export function floor(THREE) {
  const M = materials(THREE);
  const w = ROOM.wallRightX - ROOM.wallLeftX;
  const d = ROOM.frontZ - ROOM.wallBackZ;

  // one tile per texture repeat
  const tex = TEX.floorTile(THREE).clone();
  tex.needsUpdate = true;
  tex.repeat.set(w / ROOM.tile, d / ROOM.tile);
  const mat = M.floor.clone();
  mat.map = tex;

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(mm(w), mm(d)), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(mm(ROOM.wallLeftX + w / 2), 0, mm(ROOM.wallBackZ + d / 2));
  mesh.receiveShadow = true;
  mesh.name = 'floor';
  return group('room.floor', [mesh]);
}

export function walls(THREE) {
  const M = materials(THREE);
  const parts = [];
  const w = ROOM.wallRightX - ROOM.wallLeftX;
  const d = ROOM.frontZ - ROOM.wallBackZ;

  // rear wall - the one the desk is against
  parts.push(box(M.wall, ROOM.wallLeftX, 0, ROOM.wallBackZ - 120,
    w, ROOM.height, 120, { name: 'wall.rear' }));

  // right wall, with a hole for the window built from four pieces
  const win = ROOM.window;
  const wx = ROOM.wallRightX;
  const winZ0 = win.z, winZ1 = win.z + win.width;
  parts.push(box(M.wall, wx, 0, ROOM.wallBackZ, 120, win.y, d, { name: 'wall.r.sill' }));
  parts.push(box(M.wall, wx, win.y + win.height, ROOM.wallBackZ,
    120, ROOM.height - win.y - win.height, d, { name: 'wall.r.head' }));
  parts.push(box(M.wall, wx, win.y, ROOM.wallBackZ,
    120, win.height, winZ0 - ROOM.wallBackZ, { name: 'wall.r.left' }));
  parts.push(box(M.wall, wx, win.y, winZ1,
    120, win.height, ROOM.frontZ - winZ1, { name: 'wall.r.right' }));

  return group('room.walls', parts);
}

export function window_(THREE) {
  const M = materials(THREE);
  const win = ROOM.window;
  const wx = ROOM.wallRightX;
  const parts = [];

  // a bright pane - this is where most of the light in the photographs is
  const glass = new THREE.MeshBasicMaterial({ color: 0xf4f0e2 });
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(mm(win.width), mm(win.height)), glass);
  pane.rotation.y = -Math.PI / 2;
  pane.position.set(mm(wx + 60), mm(win.y + win.height / 2), mm(win.z + win.width / 2));
  pane.name = 'pane';
  parts.push(pane);

  // timber frame - one mullion, one transom
  parts.push(box(M.deviceWhite, wx + 20, win.y + win.height / 2 - 20, win.z,
    50, 40, win.width, { name: 'transom' }));
  parts.push(box(M.deviceWhite, wx + 20, win.y, win.z + win.width / 2 - 20,
    50, win.height, 40, { name: 'mullion' }));

  return group('room.window', parts);
}

export function curtain(THREE) {
  const M = materials(THREE);
  const c = ROOM.curtain;
  const win = ROOM.window;
  const wx = ROOM.wallRightX;

  // a gathered sage curtain, pushed to the rear side of the window
  const geo = new THREE.PlaneGeometry(mm(c.width), mm(c.height), 18, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getX(i) / mm(c.width) + 0.5);
    pos.setZ(i, Math.sin(t * Math.PI * 5) * mm(55));
  }
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, M.curtain);
  mesh.rotation.y = -Math.PI / 2;
  mesh.position.set(mm(wx - 70), mm(c.height / 2 + 500), mm(win.z + c.width / 2 - 120));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'curtain';
  return group('room.curtain', [mesh]);
}

export function room(THREE) {
  return group('room', [
    floor(THREE), walls(THREE), window_(THREE), curtain(THREE),
  ]);
}
