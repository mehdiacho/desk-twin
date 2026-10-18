/* ============================================================================
   NETWORK STACK - the tallest thing on the desk, back right.

   Bottom to top: riser shelf -> NAS -> Mascom unit -> yellow folder, with the
   router sitting on the shelf to the left of the NAS.

   The NAS is split into body and base because the foot detaches. Everything
   here is placed relative to SHELF_TOP_Y, so raising the shelf moves the whole
   stack with it.
   ========================================================================== */

import { NAS, ROUTER, ONT, FOLDER } from '../survey.js';
import { materials } from '../materials.js';
import { box, roundedBox, cyl, group, mm } from '../build.js';
import { SHELF_TOP_Y } from './desk.js';

/* --- NAS base: the detachable foot ---------------------------------------- */
export function nasBase(THREE, y) {
  const M = materials(THREE);
  const b = NAS.base;
  const baseY = y === undefined ? SHELF_TOP_Y : y;
  const parts = [];

  parts.push(roundedBox(M.nasBezel,
    NAS.x + b.inset, baseY + 2, NAS.z + b.inset,
    NAS.width - b.inset * 2, b.height - 2, NAS.depth - b.inset * 2,
    2, { name: 'basePlate' }));

  // four rubber feet
  const fx = [NAS.x + b.inset + 10, NAS.x + NAS.width - b.inset - 18];
  const fz = [NAS.z + b.inset + 10, NAS.z + NAS.depth - b.inset - 18];
  fx.forEach((x, i) => fz.forEach((z, j) => {
    parts.push(cyl(M.rubber, x + 4, baseY + 1.5, z + 4, 7, 3, 'y', 20,
      { name: 'foot' + i + j }));
  }));

  return group('nas.base', parts);
}

/* --- NAS body: the chassis and the two bays ------------------------------- */
export function nasBody(THREE, y) {
  const M = materials(THREE);
  const baseY = (y === undefined ? SHELF_TOP_Y : y) + NAS.base.height;
  const parts = [];

  const { x, z, width: w, depth: d } = NAS;
  const h = NAS.body.height, front = z + d;
  // Relief proportions inferred from the shelf photo; outer survey is unchanged.
  parts.push(roundedBox(M.nasShell, x, baseY, z, w, h, d - 4, 5,
    { name: 'chassis' }));
  parts.push(roundedBox(M.nasBezel, x + 2, baseY + 2, front - 7,
    w - 4, h - 4, 6, 3, { name: 'front.bezel' }));
  parts.push(roundedBox(M.rubber, x + 7, baseY + 17, front - 2,
    w - 14, h - 25, 1.5, 0.7, { name: 'bay.recess' }));

  const doorWidth = (w - 23) / 2;
  const doorHeight = h - 32;
  NAS.bays.labels.forEach((label, i) => {
    const bx = x + 10 + i * (doorWidth + 3);
    const by = baseY + 20;
    const door = group('bay.' + label, []);
    door.add(roundedBox(M.nasDoor, bx, by, front - 3,
      doorWidth, doorHeight, 3, 1.4, { name: 'bay.panel' }));
    // Lower latch sits in a dark pocket rather than a featureless raised slab.
    door.add(roundedBox(M.nasBezel, bx + 1.5, by + 1, front - 0.2,
      doorWidth - 3, 19, 0.4, 0.18, { name: 'latch.recess' }));
    door.add(roundedBox(M.nasDoor, bx + 3, by + 3, front + 0.1,
      doorWidth - 6, 14, 0.8, 0.35, { name: 'latch' }));
    door.add(cyl(M.rubber, bx + doorWidth / 2, by + 9, front + 1,
      2.3, 0.25, 'z', 20, { name: 'latch.keyhole', noCast: true }));
    parts.push(door);
  });

  // Printing goes in front of the doors, never behind opaque geometry.
  const print = new THREE.Mesh(new THREE.PlaneGeometry(mm(w), mm(h)), M.nasLabel);
  print.position.set(mm(x + w / 2), mm(baseY + h / 2), mm(front + 0.25));
  print.name = 'front.print';
  parts.push(print);

  for (let i = 0; i < 5; i++) {
    parts.push(cyl(i < 3 ? M.statusLed : M.nasDoor,
      x + 13 + i * 8, baseY + 12, front + 0.3, 0.7, 0.4, 'z', 12,
      { name: 'status.' + i, noShadow: true }));
  }
  parts.push(roundedBox(M.rubber, x + w - 29, baseY + 8, front - 0.2,
    8, 3, 0.5, 0.2, { name: 'usb.recess', noCast: true }));
  parts.push(cyl(M.nasDoor, x + w - 13, baseY + 11, front + 0.2,
    2.6, 0.5, 'z', 24, { name: 'power', noCast: true }));

  // Rear grille is provisional detail; no unverified connector layout is implied.
  parts.push(roundedBox(M.nasBezel, x + 7, baseY + 10, z - 0.1,
    w - 14, h - 20, 1, 0.4, { name: 'rear.panel' }));
  for (let i = 0; i < 16; i++) {
    parts.push(box(M.rubber, x + 15, baseY + 31 + i * 5.5, z - 0.2,
      w - 30, 2, 0.2, { name: 'rear.vent.' + i, noCast: true }));
  }

  return group('nas.body', parts);
}

/** Whole unit - what you place in the world. */
export function nas(THREE, y) {
  return group('nas', [nasBase(THREE, y), nasBody(THREE, y)]);
}

/* --- router --------------------------------------------------------------- */
export function router(THREE, y) {
  const M = materials(THREE);
  const R = ROUTER;
  const baseY = y === undefined ? SHELF_TOP_Y : y;
  const parts = [];

  const topY = baseY + R.height - 2;
  parts.push(roundedBox(M.deviceBlack, R.x + 4, baseY + 3, R.z + 3,
    R.width - 8, R.height - 6, R.depth - 6, 6, { name: 'lower.case' }));
  parts.push(roundedBox(M.deviceDark, R.x, topY - 7, R.z,
    R.width, 7, R.depth, 2.5, { name: 'lid' }));
  for (const dx of [16, R.width - 26]) for (const dz of [16, R.depth - 26]) {
    parts.push(roundedBox(M.rubber, R.x + dx, baseY, R.z + dz,
      10, 4, 10, 1.5, { name: 'foot' }));
  }

  // Fine diagonal slats, clipped to the lid. Instances keep this to one draw call.
  const slats = [];
  const inset = 5, width = R.width - inset * 2, depth = R.depth - inset * 2;
  for (let offset = -depth; offset < width; offset += 4.2) {
    const z0 = Math.max(0, -offset), z1 = Math.min(depth, width - offset);
    if (z1 <= z0) continue;
    slats.push({ x: R.x + inset + offset + (z0 + z1) / 2,
      z: R.z + inset + (z0 + z1) / 2, length: (z1 - z0) * Math.SQRT2 });
  }
  const vents = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.nasBezel, slats.length);
  const transform = new THREE.Object3D();
  slats.forEach((s, i) => {
    transform.position.set(mm(s.x), mm(topY + 0.65), mm(s.z));
    transform.rotation.y = -Math.PI / 4;
    transform.scale.set(mm(s.length), mm(1.3), mm(1.6));
    transform.updateMatrix(); vents.setMatrixAt(i, transform.matrix);
  });
  vents.name = 'diagonal.vents'; vents.castShadow = vents.receiveShadow = true;
  parts.push(vents);

  // The AX55's raised angular polished panel, observed in the official gallery.
  const panel = new THREE.Shape();
  [[0.38,0.02],[0.98,0.02],[0.98,0.33],[0.60,0.67],[0.34,0.42]].forEach(([u,v],i) => {
    const px = mm(R.x + u * R.width), pz = -mm(R.z + v * R.depth);
    if (i) panel.lineTo(px,pz); else panel.moveTo(px,pz);
  });
  panel.closePath();
  const gloss = new THREE.Mesh(new THREE.ExtrudeGeometry(panel,
    { depth: mm(1.2), bevelEnabled: false }), M.routerGloss);
  gloss.rotation.x = -Math.PI / 2;
  gloss.position.y = mm(topY + 1.4);
  gloss.name = 'polished.panel'; gloss.castShadow = gloss.receiveShadow = true;
  parts.push(gloss);

  // Six small front indicators; lit state is an illustrative pose.
  for (let i = 0; i < 6; i++) {
    parts.push(cyl(M.routerLed, R.x + R.width * 0.37 + i * 10,
      topY - 7, R.z + R.depth - 1, 0.8, 1.4, 'z', 12,
      { name: 'led' + i, noShadow: true }));
  }

  // Pivot at each hinge, so splay cannot detach the antenna from the casing.
  R.antennas.mounts.forEach((m, i) => {
    const hinge = group('antenna.' + i, [
      cyl(M.deviceDark, 0, 0, 0, 5.5, 10, 'x', 16, { name: 'hinge' }),
      roundedBox(M.deviceBlack, -R.antennas.thickness / 2, 0, -3,
        R.antennas.thickness, R.antennas.length, 6, 2, { name: 'blade' }),
    ]);
    hinge.position.set(mm(R.x + m.x), mm(topY - 2), mm(R.z + 8));
    hinge.rotation.z = -Math.atan2(m.lean, R.antennas.length);
    hinge.rotation.x = -0.12;
    parts.push(hinge);
  });

  return group('router', parts);
}

/* --- Mascom white unit, on top of the NAS --------------------------------- */
export function ont(THREE, y) {
  const M = materials(THREE);
  const baseY = (y === undefined ? SHELF_TOP_Y : y) + NAS.height;
  const parts = [];

  parts.push(box(M.deviceWhite, ONT.x, baseY, ONT.z, ONT.width, ONT.height, ONT.depth,
    { name: 'body' }));

  // the ribbed vent shell, cut into the sides
  const pitch = ONT.depth / (ONT.ribCount + 1);
  for (let i = 0; i < ONT.ribCount; i++) {
    [ONT.x - 1, ONT.x + ONT.width - 1].forEach((rx, s) => {
      parts.push(box(M.deviceDark, rx, baseY + 6, ONT.z + pitch * (i + 0.7),
        2, ONT.height - 14, pitch * 0.45, { name: 'rib' + i + '.' + s, noShadow: true }));
    });
  }

  return group('ont', parts);
}

/* --- the yellow folder balanced on top ------------------------------------ */
export function folder(THREE, y) {
  const M = materials(THREE);
  const baseY = (y === undefined ? SHELF_TOP_Y : y) + NAS.height + ONT.height;
  const parts = [];

  // paper block
  parts.push(box(M.deviceWhite, FOLDER.x + 4, baseY, FOLDER.z + 4,
    FOLDER.width - 8, FOLDER.height - 6, FOLDER.depth - 8, { name: 'paper' }));
  // yellow cover, tilted the way it sits in the photograph
  const cover = box(M.folderYellow, FOLDER.x, baseY + FOLDER.height - 6, FOLDER.z,
    FOLDER.width, 6, FOLDER.depth, { name: 'cover' });
  cover.rotation.z = -0.035;
  cover.rotation.x = 0.02;
  parts.push(cover);

  return group('folder', parts);
}

/** The whole stack, as one placeable thing. */
export function networkStack(THREE) {
  return group('networkStack', [
    router(THREE), nas(THREE), ont(THREE), folder(THREE),
  ]);
}
