/* ============================================================================
   DESK - tabletop, base, and the three things bolted to it.

   Deliberately split the way you asked for: the tabletop is its own object,
   the base is its own object, and the base is itself two K-legs plus feet.
   `desk()` just composes them. When the measurements arrive you can keep
   splitting downwards - the K-leg is already a function that takes a side,
   so a screw-level breakdown is a change inside kLeg(), not a rewrite.
   ========================================================================== */

import { DESK } from '../survey.js';
import { materials } from '../materials.js';
import { box, boxC, group, mm } from '../build.js';

const D = DESK;

/* --- tabletop ------------------------------------------------------------- */
export function tabletop(THREE) {
  const M = materials(THREE);
  // Six faces so the laminated ply edge shows on the four edges only.
  // three.js box material order: +X, -X, +Y, -Y, +Z, -Z
  const faces = [M.plyEdge, M.plyEdge, M.plyFace, M.plyPlain, M.plyEdge, M.plyEdge];
  const g = new THREE.BoxGeometry(mm(D.length), mm(D.topThickness), mm(D.depth));
  const mesh = new THREE.Mesh(g, faces);
  mesh.position.set(
    mm(D.length / 2),
    mm(D.height - D.topThickness / 2),
    mm(D.depth / 2));
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.name = 'tabletop';
  return group('desk.tabletop', [mesh]);
}

/* --- one K-leg ------------------------------------------------------------
   Spine near the FRONT edge, diagonals splaying back to the rear at top and
   bottom, a top rail under the desktop and a foot pad on the floor.        */
function kLeg(THREE, xLeft) {
  const M = materials(THREE);
  const f = D.frame;
  const t = f.memberThickness;
  const legTop = D.height - D.topThickness;       // underside of the top
  const legHeight = legTop - f.footHeight;

  // depth positions, measured from the REAR of the desk
  const spineZ = D.depth - D.depth * f.spineDepthFrac;   // 18% back from FRONT
  const railFrontZ = D.depth * (1 - f.railInsetFrac);
  const railRearZ = D.depth * f.railInsetFrac;
  const diagRearZ = D.depth * (1 - f.diagonalEndFrac);
  const footFrontZ = D.depth * (1 - f.footInsetFrac);
  const footRearZ = D.depth * f.footInsetFrac;
  const spineMidY = f.footHeight + legHeight * (1 - f.spineMidFrac);

  const parts = [];

  // top rail, under the desktop
  parts.push(box(M.whiteSteel,
    xLeft, legTop - t, railRearZ,
    f.spineWidth, t, railFrontZ - railRearZ, { name: 'toprail' }));

  // the spine
  parts.push(box(M.whiteSteel,
    xLeft, f.footHeight, spineZ - t / 2,
    f.spineWidth, legHeight, t, { name: 'spine' }));

  // two diagonals, spine mid-height out to the rear top and rear bottom
  [legTop - t / 2, f.footHeight + t / 2].forEach((endY, i) => {
    const dz = diagRearZ - spineZ;
    const dy = endY - spineMidY;
    const len = Math.hypot(dz, dy);
    const bar = boxC(M.whiteSteel,
      xLeft + f.spineWidth / 2,
      (spineMidY + endY) / 2,
      (spineZ + diagRearZ) / 2,
      f.spineWidth, len, t, { name: 'diagonal' + i });
    bar.rotation.x = Math.atan2(dz, dy);
    parts.push(bar);
  });

  // foot pad
  parts.push(box(M.whiteSteel,
    xLeft - (f.footLength - f.spineWidth) / 2, 0, footRearZ,
    f.footLength, f.footHeight, footFrontZ - footRearZ, { name: 'foot' }));

  return group('kleg', parts);
}

/* --- the base (both legs) ------------------------------------------------- */
export function deskBase(THREE) {
  const f = D.frame;
  const left = kLeg(THREE, f.legInset);
  const right = kLeg(THREE, D.length - f.legInset - f.spineWidth);
  left.name = 'kleg.left';
  right.name = 'kleg.right';
  return group('desk.base', [left, right]);
}

/* --- pull-out keyboard tray ----------------------------------------------- */
export function keyboardTray(THREE) {
  const M = materials(THREE);
  const k = D.keyboardTray;
  const parts = [];

  parts.push(box(M.plyPlain,
    k.x, k.topY - k.boardThickness, k.z,
    k.width, k.boardThickness, k.depth, { name: 'trayboard' }));

  // exposed black ball-bearing slides, one each side
  [k.x - 8, k.x + k.width].forEach((sx, i) => {
    parts.push(box(M.blackSteel,
      sx, k.slideY - k.slideHeight, k.z + 20,
      8, k.slideHeight, k.depth - 40, { name: 'slide' + i }));
  });
  // the fixed rail the tray rides on, under the desktop
  parts.push(box(M.blackSteel,
    k.x, k.slideY, k.z + 30, k.width, 6, k.depth - 60, { name: 'railfixed' }));

  return group('desk.keyboardTray', parts);
}

/* --- suspended two-drawer pedestal ---------------------------------------- */
export function drawerPedestal(THREE) {
  const M = materials(THREE);
  const p = D.drawers;
  const t = p.carcassThickness;
  const h = p.top - p.bottom;
  const parts = [];

  // oak carcass: two sides, a back, a top and a bottom
  parts.push(box(M.plyPlain, p.x, p.bottom, p.z, t, h, p.depth, { name: 'side.l' }));
  parts.push(box(M.plyPlain, p.x + p.width - t, p.bottom, p.z, t, h, p.depth, { name: 'side.r' }));
  parts.push(box(M.plyPlain, p.x, p.bottom, p.z, p.width, t, p.depth, { name: 'carcass.bottom' }));
  parts.push(box(M.plyPlain, p.x, p.top - t, p.z, p.width, t, p.depth, { name: 'carcass.top' }));
  parts.push(box(M.plyPlain, p.x, p.bottom, p.z, p.width, h, t, { name: 'carcass.back' }));

  // two white fronts, split at the divider line
  const frontZ = p.z + p.depth - p.frontProud;
  const upperH = p.top - p.divider - 3;
  const lowerH = p.divider - p.bottom - 3;
  parts.push(box(M.whitePanel, p.x + 2, p.divider + 1.5, frontZ,
    p.width - 4, upperH, p.frontProud + 6, { name: 'front.upper' }));
  parts.push(box(M.whitePanel, p.x + 2, p.bottom + 1.5, frontZ,
    p.width - 4, lowerH, p.frontProud + 6, { name: 'front.lower' }));

  // recessed finger pulls
  [p.handleUpper, p.handleLower].forEach((hy, i) => {
    parts.push(box(M.deviceDark, p.x + 100, hy - 6, frontZ + p.frontProud + 4,
      200, 12, 4, { name: 'pull' + i }));
  });

  return group('desk.drawers', parts);
}

/* --- the raised network shelf, back right --------------------------------- */
export function riserShelf(THREE) {
  const M = materials(THREE);
  const s = D.riserShelf;
  const top = D.height;
  const parts = [];

  [s.riserAx, s.riserBx].forEach((rx, i) => {
    parts.push(box(M.plyPlain, rx, top, s.z + 20,
      s.riserWidth, s.riserHeight, s.riserDepth, { name: 'riser' + i }));
  });

  const plankY = top + s.topY - s.plankThickness;
  const faces = [M.plyEdge, M.plyEdge, M.plyFace, M.plyPlain, M.plyEdge, M.plyEdge];
  const g = new THREE.BoxGeometry(mm(s.width), mm(s.plankThickness), mm(s.depth));
  const plank = new THREE.Mesh(g, faces);
  plank.position.set(
    mm(s.x + s.width / 2),
    mm(plankY + s.plankThickness / 2),
    mm(s.z + s.depth / 2));
  plank.castShadow = plank.receiveShadow = true;
  plank.name = 'plank';
  parts.push(plank);

  return group('desk.riserShelf', parts);
}

/* --- everything, assembled ------------------------------------------------ */
export function desk(THREE) {
  return group('desk', [
    tabletop(THREE),
    deskBase(THREE),
    keyboardTray(THREE),
    drawerPedestal(THREE),
  ]);
}

/** The Y of the desk's top surface - what everything on it sits on. */
export const DESK_TOP_Y = D.height;
/** The Y of the shelf's top surface - what the network stack sits on. */
export const SHELF_TOP_Y = D.height + D.riserShelf.topY;
/** The Y of the keyboard tray's top surface. */
export const TRAY_TOP_Y = D.keyboardTray.topY;
