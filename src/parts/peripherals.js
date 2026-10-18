/* ============================================================================
   PERIPHERALS - everything on, under and hanging off the desk.
   ========================================================================== */

import {
  MONITOR, DESK_MAT, KEYBOARD, MOUSE, CONTROLLER,
  BOOKS, LAPTOP, CABLE_NEST, HEADSET,
} from '../survey.js';
import { materials } from '../materials.js';
import { box, roundedBox, boxC, cyl, slab, tube, group, mm } from '../build.js';
import { KEY_LAYOUT, KEYBOARD_GRID } from '../keyboard-layout.js';
import { DESK_TOP_Y, TRAY_TOP_Y } from './desk.js';
import { DESK } from '../survey.js';

/* --- desk mat ------------------------------------------------------------- */
export function deskMat(THREE) {
  const M = materials(THREE);
  const m = DESK_MAT;
  return group('deskMat', [
    box(M.mat, m.x, DESK_TOP_Y, m.z, m.width, m.thickness, m.depth, { name: 'mat' }),
  ]);
}

/* --- monitor on a gas-spring arm ------------------------------------------ */
export function monitorArm(THREE) {
  const M = materials(THREE);
  const a = MONITOR.arm;
  const parts = [];

  // rear-edge clamp
  parts.push(box(M.deviceBlack, a.clampX, DESK_TOP_Y - 30, a.clampZ,
    a.clampWidth, a.clampHeight + 30, a.clampDepth, { name: 'clamp' }));
  // the pole
  parts.push(box(M.deviceBlack,
    a.clampX + (a.clampWidth - a.poleThickness) / 2,
    DESK_TOP_Y + a.clampHeight,
    a.clampZ + 20,
    a.poleThickness, a.poleTop - DESK_TOP_Y - a.clampHeight, a.poleThickness,
    { name: 'pole' }));

  // two arm segments reaching forward to the panel
  const poleCx = a.clampX + a.clampWidth / 2;
  const panelCx = MONITOR.panel.x + MONITOR.panel.width / 2;
  const seg1 = boxC(M.deviceBlack,
    (poleCx + panelCx) / 2 - 60, a.poleTop - 40, a.clampZ + 70,
    a.reach * 0.62, 44, 46, { name: 'arm.upper' });
  seg1.rotation.z = -0.22;
  parts.push(seg1);

  const seg2 = boxC(M.deviceBlack,
    panelCx - 30, a.poleTop - 110, MONITOR.panel.z + 10,
    a.reach * 0.5, 38, 40, { name: 'arm.lower' });
  seg2.rotation.z = 0.4;
  seg2.rotation.y = 0.12;
  parts.push(seg2);

  // the VESA head
  parts.push(box(M.deviceBlack,
    panelCx - 45, MONITOR.panel.bottom + 120, MONITOR.panel.z - 30,
    90, 110, 34, { name: 'vesa' }));

  return group('monitor.arm', parts);
}

export function monitorPanel(THREE) {
  const M = materials(THREE);
  const p = MONITOR.panel;
  const bez = MONITOR.bezel.width;
  const parts = [];

  // shell
  parts.push(box(M.deviceBlack, p.x, p.bottom, p.z, p.width, p.height, p.depth,
    { name: 'shell' }));
  // the lit panel, inset on the front face
  parts.push(box(M.screenOn,
    p.x + bez, p.bottom + bez, p.z + p.depth,
    p.width - bez * 2, p.height - bez * 2, 2,
    { name: 'screen', noShadow: true }));

  return group('monitor.panel', parts);
}

export function monitor(THREE) {
  return group('monitor', [monitorArm(THREE), monitorPanel(THREE)]);
}

/* --- keyboard, on the pull-out tray --------------------------------------- */
export function keyboard(THREE) {
  const M = materials(THREE);
  const k = KEYBOARD;
  const parts = [];
  parts.push(roundedBox(M.deviceBlack, k.x, TRAY_TOP_Y, k.z,
    k.width, k.height * 0.55, k.depth, 5, { name: 'chassis' }));
  parts.push(roundedBox(M.nasBezel, k.x + 7, TRAY_TOP_Y + k.height * 0.55, k.z + 7,
    k.width - 14, 2, k.depth - 14, 0.9, { name: 'key.well' }));
  const pitchX = (k.width - 28) / KEYBOARD_GRID.width;
  const pitchZ = (k.depth - 24) / KEYBOARD_GRID.depth;
  const capY = TRAY_TOP_Y + k.height * 0.55 + 2;
  const capHeight = k.height * 0.20;
  KEY_LAYOUT.forEach((key, i) => {
    const x = k.x + 14 + key.x * pitchX, z = k.z + 12 + key.z * pitchZ;
    const w = key.w * pitchX - 2.4, d = key.d * pitchZ - 2.4;
    const cap = roundedBox(M.keyCap, x, capY, z, w, capHeight, d, 2,
      { name: 'key.' + i + '.' + (key.label || 'Space') });
    // Taper the skirt to a smaller key top while retaining flat top normals.
    const p = cap.geometry.attributes.position;
    for (let j = 0; j < p.count; j++) {
      const t = (p.getY(j) + mm(capHeight / 2)) / mm(capHeight);
      p.setXYZ(j, p.getX(j) * (1 - 0.12 * t), p.getY(j), p.getZ(j) * (1 - 0.12 * t));
    }
    cap.geometry.computeVertexNormals();
    cap.geometry.computeBoundingBox(); cap.geometry.computeBoundingSphere();
    parts.push(cap);
    if (!key.label) return;
    const label = slab(M.keyLegends, x + w * 0.16, capY + capHeight + 0.06,
      z + d * 0.16, w * 0.68, d * 0.68, { name: 'legend.' + i, noShadow: true });
    const uv = label.geometry.attributes.uv;
    const tileX = i % 16, tileY = Math.floor(i / 16);
    for (let j = 0; j < uv.count; j++) uv.setXY(j,
      (tileX + uv.getX(j)) / 16, 1 - (tileY + 1 - uv.getY(j)) / 16);
    parts.push(label);
  });
  return group('keyboard', parts);
}

// Detailed, independently buildable handheld peripherals.
export { mouse, controller } from './handhelds.js';

/* --- two books on the bare ply -------------------------------------------- */
export function books(THREE) {
  const M = materials(THREE);
  const b = BOOKS;
  const parts = [];
  const each = b.height / b.count;
  [M.bookGrey, M.bookGreen].forEach((mat, i) => {
    const bk = box(mat, b.x - i * 12, DESK_TOP_Y + i * each, b.z + i * 16,
      b.width, each - 2, b.depth, { name: 'book' + i });
    bk.rotation.y = i ? 0.09 : -0.04;
    parts.push(bk);
  });
  return group('books', parts);
}

/* --- headless laptop, underslung ------------------------------------------ */
export function laptop(THREE) {
  const M = materials(THREE);
  const l = LAPTOP;
  return group('laptop', [
    box(M.deviceDark, l.x, l.y - l.thickness, l.z, l.width, l.thickness, l.depth,
      { name: 'lid' }),
  ]);
}

/* --- cable nest and the underslung power strip ---------------------------- */
export function cableNest(THREE) {
  const M = materials(THREE);
  const c = CABLE_NEST;
  const parts = [];

  // the charger brick
  parts.push(box(M.deviceWhite, c.x + 20, DESK_TOP_Y, c.z + 30, 90, 55, 60,
    { name: 'brick' }));
  // plug adapters
  parts.push(box(M.deviceWhite, c.x + 130, DESK_TOP_Y, c.z + 20, 60, 60, 55,
    { name: 'adapter' }));
  // the green tin
  parts.push(cyl(M.bookGreen, c.x + 175, DESK_TOP_Y + 22, c.z + 110, 40, 44, 'y', 20,
    { name: 'tin' }));
  // a coiled lead
  const coil = new THREE.Mesh(
    new THREE.TorusGeometry(mm(70), mm(9), 8, 28), M.cable);
  coil.rotation.x = Math.PI / 2;
  coil.position.set(mm(c.x + 90), mm(DESK_TOP_Y + 10), mm(c.z + 100));
  coil.castShadow = coil.receiveShadow = true;
  coil.name = 'coil';
  parts.push(coil);

  // power strip, hanging under the top
  const p = c.powerStrip;
  const strip = box(M.deviceWhite, p.x, p.y, p.z, p.width, p.height, p.depth,
    { name: 'powerStrip' });
  strip.rotation.z = 0.16;
  parts.push(strip);
  // the lead it hangs from
  parts.push(tube(M.cable, [
    [p.x + 40, DESK.height - DESK.topThickness, p.z + 20],
    [p.x + 30, p.y + p.height + 40, p.z + 26],
    [p.x + 24, p.y + p.height, p.z + 30],
  ], 4, { name: 'stripLead', noShadow: true }));

  return group('cableNest', parts);
}

/* --- headset, hanging off the right face of the pedestal ------------------ */
export function headset(THREE) {
  const M = materials(THREE);
  const H = HEADSET;
  const parts = [];
  const z = DESK.drawers.z + DESK.drawers.depth * 0.55;
  const leftX = H.hookX - 6;
  const rightX = leftX + H.span;

  // the hook itself
  parts.push(box(M.deviceWhite, H.hookX, H.hookY, z - 10, H.hookReach, 10, 20,
    { name: 'hook' }));
  parts.push(box(M.deviceWhite, H.hookX + H.hookReach - 8, H.hookY - 34, z - 10,
    8, 34, 20, { name: 'hookLip' }));

  // headband arc, from the top of one cup to the other
  const band = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const ang = Math.PI * t;
    band.push([
      leftX + (H.span / 2) * (1 - Math.cos(ang)),
      H.bandTop + Math.sin(ang) * H.bandRadiusY,
      z,
    ]);
  }
  parts.push(tube(M.rubber, band, 11, { name: 'band' }));

  // the two cups
  [leftX + H.cupWidth / 2, rightX - H.cupWidth / 2].forEach((cx, i) => {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(mm(H.cupHeight / 2), mm(H.cupHeight / 2), mm(H.cupWidth), 20),
      M.rubber);
    cup.rotation.z = Math.PI / 2;
    cup.position.set(mm(cx), mm(H.bandTop - H.cupHeight / 2), mm(z));
    cup.scale.set(1, 1, H.cupDepth / H.cupHeight);
    cup.castShadow = cup.receiveShadow = true;
    cup.name = 'cup' + i;
    parts.push(cup);
  });

  // the boom mic, swung down
  parts.push(tube(M.rubber, [
    [leftX + 6, H.bandTop - 40, z + 30],
    [leftX - 4, H.bandTop - 70, z + 60],
    [leftX + 2, H.bandTop - H.boomLength - 30, z + 74],
  ], 5, { name: 'boom' }));

  return group('headset', parts);
}
