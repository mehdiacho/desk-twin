/* ============================================================================
   SURVEY - the single source of truth for every dimension in the model.
   ----------------------------------------------------------------------------
   ALL VALUES ARE MILLIMETRES. Nothing else in this codebase hard-codes a size.

   Coordinate frame (right-handed, three.js convention):
     X  0 .......... 1500   left end of the desk  ->  right end
     Y  0 ..........        finished floor        ->  up
     Z  0 .......... 700    rear edge (the wall)  ->  front edge (the chair)

   Every entry carries a `src` field. That is the whole point of this file:
   when the tape measure comes out, you change the number and flip the tag,
   and the model, the labels and the confidence colouring all follow.

     'SHEET'  - read off Sheet 06 WORKSPACE ELEVATION (the 1:15 ortho set).
     'EST'    - inferred from the photographs. Plausible, not measured.
     'SPEC'   - manufacturer figure.
     'MEAS'   - you measured it. Nothing is in this state yet.

   When you measure something: set the value, set src:'MEAS'. That is all.
   MEASUREMENTS.md lists what is worth measuring first and why.
   ========================================================================== */

export const SOURCE = {
  SHEET: { key: 'SHEET', label: 'SURVEYED', note: 'Off the 1:15 elevation set' },
  EST:   { key: 'EST',   label: 'ESTIMATE', note: 'Inferred from photographs' },
  SPEC:  { key: 'SPEC',  label: 'SPEC',     note: 'Manufacturer figure' },
  MEAS:  { key: 'MEAS',  label: 'MEASURED', note: 'Tape measure' },
};

/* --- the desk ------------------------------------------------------------ */
export const DESK = {
  src: 'SHEET',
  length: 1500,           // '1500 OVERALL' on the front elevation
  depth: 700,
  height: 750,            // finished floor to top surface
  topThickness: 25,       // ply, exposed laminated edge

  frame: {
    src: 'SHEET',
    legInset: 70,         // left leg spine starts 70 from the left end
    spineWidth: 40,       // the vertical member, seen edge-on in front view
    spineDepthFrac: 0.18, // spine sits 18% of the depth back from the FRONT edge
    memberThickness: 25,  // EST - square section; front view only gives width
    footHeight: 20,
    footLength: 100,
    footOverhang: 30,     // foot pad projects forward of the spine
    railInsetFrac: 0.04,  // top rail spans 4%..96% of the depth
    footInsetFrac: 0.02,
    diagonalEndFrac: 0.94,
    spineMidFrac: 0.46,   // diagonals leave the spine at 46% of leg height
  },

  keyboardTray: {
    src: 'SHEET',
    x: 100, z: 390, width: 700, depth: 300,
    boardThickness: 20,
    topY: 660,            // top face of the tray board
    slideY: 668,          // exposed black ball-bearing slides
    slideHeight: 12,      // EST
  },

  drawers: {
    src: 'SHEET',
    x: 1030, z: 150, width: 400, depth: 500,
    top: 725,             // hangs off the underside of the desktop
    bottom: 260,          // suspended - the carcass stops clear of the floor
    carcassThickness: 18, // EST
    frontProud: 4,        // EST - the white fronts sit slightly proud
    divider: 493,         // 725 - 232, the line between the two drawers
    handleUpper: 610,
    handleLower: 378,
  },

  // 'Supplied with the desk for a tower you do not own' - a plank on two
  // risers, repurposed as the network shelf at the back right.
  riserShelf: {
    src: 'SHEET',
    x: 1015, z: 0, width: 480, depth: 300,
    plankThickness: 20,
    topY: 140,            // above the desktop
    riserWidth: 40, riserHeight: 120,
    riserAx: 1040, riserBx: 1440,
    riserDepth: 240,      // EST
  },
};

/* --- the network stack, back right --------------------------------------- */
export const NAS = {
  src: 'SHEET',
  id: 'D-03',
  unit: 'UGREEN NASync DXP2800',
  x: 1330, z: 40,
  width: 106, depth: 178, height: 158,
  // The body and the foot come apart. Split here so the base can be modelled,
  // measured and replaced on its own once it is off the unit.
  base: { src: 'EST', height: 8, inset: 6 },
  body: { src: 'SHEET', height: 150 },   // 158 overall less the 8 base
  bays: {
    src: 'SHEET',
    count: 2, width: 44, height: 120,
    offsets: [8, 56],     // from the left face of the NAS
    topInset: 10,         // from the top of the body
    labels: ['01', '02'],
  },
  led: { src: 'EST', y: 14, width: 26, height: 3 },
};

export const ROUTER = {
  src: 'SHEET',
  id: 'D-04',
  unit: 'TP-Link Archer AX55 (AX3000 Wi-Fi 6)',
  x: 1040, z: 40,
  width: 250, depth: 180, height: 40,
  antennas: {
    src: 'SHEET',
    count: 4, length: 130, thickness: 8,
    // Splay read off the four leader lines in the front elevation:
    // x-offset at the base, and the lean at the tip, in mm.
    mounts: [
      { x: 20,  lean: -40 }, { x: 80,  lean: -20 },
      { x: 170, lean: 20 },  { x: 230, lean: 40 },
    ],
  },
};

export const ONT = {
  src: 'SHEET',
  id: 'D-05',
  unit: 'Mascom white unit - function unconfirmed',
  x: 1300, z: 30,
  width: 180, depth: 140, height: 45,
  ribCount: 11,           // EST - the ribbed vent shell
};

export const FOLDER = {
  src: 'SHEET',
  id: 'D-05b',
  unit: 'Yellow Mascom folder',
  x: 1290, z: 20,
  width: 200, depth: 150, height: 25,
};

/* --- on the desktop ------------------------------------------------------ */
export const MONITOR = {
  src: 'SHEET',
  id: 'D-01',
  panel: { x: 430, z: 150, width: 540, depth: 60, height: 340, bottom: 980 },
  bezel: { src: 'EST', width: 15 },
  arm: {
    src: 'SHEET',
    clampX: 575, clampZ: 0, clampWidth: 120, clampDepth: 90, clampHeight: 55,
    poleThickness: 50, poleTop: 1150,
    reach: 420,           // EST - horizontal travel of the gas-spring arm
  },
};

export const DESK_MAT = {
  src: 'SHEET', id: 'D-15',
  x: 60, z: 180, width: 900, depth: 400, thickness: 3,
};

export const KEYBOARD = {
  src: 'SHEET', id: 'D-07b',
  x: 140, z: 420, width: 620, depth: 200, height: 40,
  // sits on the pull-out tray, so its Y comes from DESK.keyboardTray
};

export const MOUSE = {
  src: 'SHEET',
  x: 860, z: 400, width: 120, depth: 70, height: 40,
};

export const CONTROLLER = {
  src: 'SHEET', id: 'D-08',
  x: 150, z: 430, width: 160, depth: 110, height: 65,
};

export const BOOKS = {
  src: 'SHEET', id: 'D-14',
  x: 1080, z: 400, width: 150, depth: 190, height: 28,
  count: 2,
};

export const LAPTOP = {
  src: 'SHEET', id: 'D-02',
  x: 330, z: 230, width: 350, depth: 250, thickness: 24,
  y: 715,                 // bolted flat under the top, lid shut
};

export const CABLE_NEST = {
  src: 'SHEET', id: 'D-12',
  x: 80, z: 20, width: 220, depth: 150, height: 90,
  powerStrip: { x: 620, z: 300, width: 240, depth: 60, height: 45, y: 640 },
};

export const HEADSET = {
  src: 'SHEET', id: 'D-09',
  hookX: 1430, hookY: 600, hookReach: 48,
  cupWidth: 34, cupHeight: 90, cupDepth: 80,
  span: 146,              // 1570 - 1424, outside face to outside face
  bandRadiusX: 70, bandRadiusY: 80,
  bandTop: 500,           // top of the cups
  boomLength: 80,
};

/* --- the floor, right of the desk ---------------------------------------- */
export const GUITAR = {
  src: 'SHEET', id: 'D-10',
  x: 1810, z: 180,        // plan centre, 310 past the right end
  lowerBoutWidth: 400, upperBoutWidth: 280, waistWidth: 250,
  neckWidth: 140, bodyDepth: 240,
  totalHeight: 1050, bodyTop: 640, bodyBottom: 430,
};

export const DUMBBELL = {
  src: 'SHEET', id: 'D-11',
  count: 2,
  plateRadius: 75, plateThickness: 26,
  platesPerSide: 3,       // EST - the photographs show a loaded spinlock bar
  barLength: 400, barRadius: 13,
  collarRadius: 22, collarLength: 30,
  // plan positions, measured from the left end of the desk
  positions: [
    { x: 2070, z: 300, rotation: -0.15 },
    { x: 2325, z: 300, rotation: 0.08 },
  ],
};

/* --- the wall ------------------------------------------------------------ */
export const KNUCKLES = {
  src: 'SHEET', id: 'D-13',
  x: 1000, hookY: 1790, bodyY: 1730,
  holeRadius: 9, holeSpacing: 22, holeCount: 4,
  cableTop: 1760, cableBottom: 1240,
};

/* --- the room ------------------------------------------------------------ */
export const ROOM = {
  src: 'EST',
  tile: 600,              // the floor tiles are the scale reference in the photos
  groutWidth: 4,
  wallBackZ: -30,         // the desk is pushed to the wall, not hard against it
  wallRightX: 2600,
  wallLeftX: -900,
  frontZ: 2400,
  height: 2500,
  window: { y: 850, z: 700, width: 1100, height: 1200 },
  curtain: { width: 420, height: 1900, z: 480 },
};

/* --- office chair, partly under the desk --------------------------------- */
export const CHAIR = {
  src: 'EST',
  x: 1230, z: 1180,
  baseRadius: 320, baseArms: 5, baseHeight: 60,
  columnHeight: 380, columnRadius: 30,
  seatWidth: 480, seatDepth: 460, seatThickness: 110,
  backWidth: 460, backHeight: 520, backThickness: 90,
};
