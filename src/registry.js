/* ============================================================================
   REGISTRY - the catalogue of everything that can be rendered.

   This is the file that makes the two modes possible. Each entry knows how to
   build itself in isolation, so PARTS mode can put any one of them on a
   turntable, and WORLD mode can ask for all of them at once. Adding a new
   object to the twin is one entry here and one builder function - nothing
   else in the app changes.

   `parent` marks a sub-assembly: it is buildable and inspectable on its own,
   but WORLD mode skips it, because its parent already draws it.
   ========================================================================== */

import * as Desk from './parts/desk.js';
import * as Net from './parts/network.js';
import * as Per from './parts/peripherals.js';
import * as Floor from './parts/floorItems.js';
import * as Room from './parts/room.js';

import {
  DESK, NAS, ROUTER, ONT, FOLDER, MONITOR, DESK_MAT, KEYBOARD,
  MOUSE, CONTROLLER, BOOKS, LAPTOP, CABLE_NEST, HEADSET,
  GUITAR, DUMBBELL, KNUCKLES, CHAIR,
} from './survey.js';

/** w x d x h in mm, for the part inspector. */
const dims = (w, d, h) => ({ w, d, h });

export const PARTS = [
  /* --- structure -------------------------------------------------------- */
  {
    id: 'desk', tag: 'D-00', label: 'Desk', section: 'Structure',
    build: Desk.desk, src: 'SHEET',
    dims: dims(DESK.length, DESK.depth, DESK.height),
    note: 'Ply top on two white steel K-frames. The whole assembly.',
  },
  {
    id: 'desk.tabletop', tag: 'D-00a', label: 'Tabletop', section: 'Structure',
    build: Desk.tabletop, src: 'SHEET', parent: 'desk',
    dims: dims(DESK.length, DESK.depth, DESK.topThickness),
    note: 'One sheet of ply, laminated edge left exposed on all four sides.',
  },
  {
    id: 'desk.base', tag: 'D-00b', label: 'Base (two K-legs)', section: 'Structure',
    build: Desk.deskBase, src: 'SHEET', parent: 'desk',
    dims: dims(DESK.length, DESK.depth, DESK.height - DESK.topThickness),
    note: 'Spine near the front edge, diagonals splaying to the rear. Splits again into legs, then members, then fixings.',
  },
  {
    id: 'desk.keyboardTray', tag: 'D-07', label: 'Keyboard tray', section: 'Structure',
    build: Desk.keyboardTray, src: 'SHEET',
    dims: dims(DESK.keyboardTray.width, DESK.keyboardTray.depth, 40),
    note: 'Pull-out board on exposed black ball-bearing slides.',
  },
  {
    id: 'desk.drawers', tag: 'D-06', label: 'Drawer pedestal', section: 'Structure',
    build: Desk.drawerPedestal, src: 'SHEET',
    dims: dims(DESK.drawers.width, DESK.drawers.depth, DESK.drawers.top - DESK.drawers.bottom),
    note: 'Suspended off the underside. White fronts, ply carcass, clear of the floor.',
  },
  {
    id: 'desk.riserShelf', tag: 'D-16', label: 'Raised shelf', section: 'Structure',
    build: Desk.riserShelf, src: 'SHEET',
    dims: dims(DESK.riserShelf.width, DESK.riserShelf.depth, DESK.riserShelf.topY),
    note: 'Plank on two risers. Came with the desk for a tower you do not own.',
  },

  /* --- network ---------------------------------------------------------- */
  {
    id: 'nas', tag: 'D-03', label: 'NAS', section: 'Network',
    build: Net.nas, src: 'SHEET',
    dims: dims(NAS.width, NAS.depth, NAS.height),
    note: NAS.unit + '. Bays 01 and 02. Rounded shell and front relief inferred from the shelf photo; dimensions remain provisional.',
  },
  {
    id: 'nas.body', tag: 'D-03a', label: 'NAS body', section: 'Network',
    build: Net.nasBody, src: 'SHEET', parent: 'nas',
    dims: dims(NAS.width, NAS.depth, NAS.body.height),
    note: 'Chassis and the two bay doors, with the foot removed.',
  },
  {
    id: 'nas.base', tag: 'D-03b', label: 'NAS base', section: 'Network',
    build: Net.nasBase, src: 'EST', parent: 'nas',
    dims: dims(NAS.width - NAS.base.inset * 2, NAS.depth - NAS.base.inset * 2, NAS.base.height),
    note: 'The detachable foot. Estimated until the unit is lifted off it.',
  },
  {
    id: 'router', tag: 'D-04', label: 'Router', section: 'Network',
    build: Net.router, src: 'SHEET',
    dims: dims(ROUTER.width, ROUTER.depth, ROUTER.height + ROUTER.antennas.length),
    note: ROUTER.unit + '. Four antennas.',
  },
  {
    id: 'ont', tag: 'D-05', label: 'Mascom unit', section: 'Network',
    build: Net.ont, src: 'SHEET',
    dims: dims(ONT.width, ONT.depth, ONT.height),
    note: ONT.unit,
  },
  {
    id: 'folder', tag: 'D-05b', label: 'Yellow folder', section: 'Network',
    build: Net.folder, src: 'SHEET',
    dims: dims(FOLDER.width, FOLDER.depth, FOLDER.height),
    note: 'Balanced on the Mascom unit, top of the stack.',
  },

  /* --- desktop ---------------------------------------------------------- */
  {
    id: 'monitor', tag: 'D-01', label: 'Monitor + arm', section: 'Desktop',
    build: Per.monitor, src: 'SHEET',
    dims: dims(MONITOR.panel.width, MONITOR.panel.depth, MONITOR.panel.height),
    note: 'Single panel on a gas-spring arm, clamped to the rear edge.',
  },
  {
    id: 'monitor.panel', tag: 'D-01a', label: 'Panel', section: 'Desktop',
    build: Per.monitorPanel, src: 'SHEET', parent: 'monitor',
    dims: dims(MONITOR.panel.width, MONITOR.panel.depth, MONITOR.panel.height),
    note: 'Approx. 24 in. Make and size not legible in the photographs.',
  },
  {
    id: 'monitor.arm', tag: 'D-01b', label: 'Gas-spring arm', section: 'Desktop',
    build: Per.monitorArm, src: 'EST', parent: 'monitor',
    dims: dims(MONITOR.arm.reach, MONITOR.arm.clampDepth, MONITOR.arm.poleTop - DESK.height),
    note: 'Clamp position is surveyed; the arm geometry is inferred.',
  },
  {
    id: 'deskMat', tag: 'D-15', label: 'Desk mat', section: 'Desktop',
    build: Per.deskMat, src: 'SHEET',
    dims: dims(DESK_MAT.width, DESK_MAT.depth, DESK_MAT.thickness),
    note: 'World-map mat. Splits the desktop into an input zone and bare ply.',
  },
  {
    id: 'keyboard', tag: 'D-07b', label: 'Keyboard', section: 'Desktop',
    build: Per.keyboard, src: 'SHEET',
    dims: dims(KEYBOARD.width, KEYBOARD.depth, KEYBOARD.height),
    note: 'Dixon CS-7200G reference. Separate keycaps and number pad; ANSI legends are provisional, not a verified Dixon layout. On the pull-out tray.',
  },
  {
    id: 'mouse', tag: 'D-07c', label: 'Mouse', section: 'Desktop',
    build: Per.mouse, src: 'SHEET',
    dims: dims(MOUSE.width, MOUSE.depth, MOUSE.height),
    note: 'On the mat, not on the tray.',
  },
  {
    id: 'controller', tag: 'D-08', label: 'Controller', section: 'Desktop',
    build: Per.controller, src: 'SHEET',
    dims: dims(CONTROLLER.width, CONTROLLER.depth, CONTROLLER.height),
    note: 'Xbox pad, blue, parked on the left end of the mat.',
  },
  {
    id: 'books', tag: 'D-14', label: 'Books', section: 'Desktop',
    build: Per.books, src: 'SHEET',
    dims: dims(BOOKS.width, BOOKS.depth, BOOKS.height),
    note: 'Two small hardbacks on the uncovered right half.',
  },
  {
    id: 'laptop', tag: 'D-02', label: 'Laptop', section: 'Desktop',
    build: Per.laptop, src: 'SHEET',
    dims: dims(LAPTOP.width, LAPTOP.depth, LAPTOP.thickness),
    note: 'Headless, lid shut, bolted flat under the top.',
  },
  {
    id: 'cableNest', tag: 'D-12', label: 'Cable nest', section: 'Desktop',
    build: Per.cableNest, src: 'EST',
    dims: dims(CABLE_NEST.width, CABLE_NEST.depth, CABLE_NEST.height),
    note: 'Adapters, brick, coiled lead, and the power strip hanging underneath.',
  },
  {
    id: 'headset', tag: 'D-09', label: 'Headset', section: 'Desktop',
    build: Per.headset, src: 'EST',
    dims: dims(HEADSET.span, HEADSET.cupDepth, HEADSET.bandRadiusY + HEADSET.cupHeight),
    note: 'On a hook on the right face of the pedestal, not the desktop edge.',
  },

  /* --- floor and wall --------------------------------------------------- */
  {
    id: 'dumbbells', tag: 'D-11', label: 'Dumbbells', section: 'Floor',
    build: Floor.dumbbells, src: 'SHEET',
    dims: dims(DUMBBELL.barLength, DUMBBELL.plateRadius * 2, DUMBBELL.plateRadius * 2),
    note: 'Two loaded spinlock bars, lying where they were put down.',
  },
  {
    id: 'dumbbell.one', tag: 'D-11a', label: 'Dumbbell (single)', section: 'Floor',
    build: (T) => Floor.dumbbell(T, 0), src: 'EST', parent: 'dumbbells',
    dims: dims(DUMBBELL.barLength, DUMBBELL.plateRadius * 2, DUMBBELL.plateRadius * 2),
    note: 'Plate count per side is an estimate.',
  },
  {
    id: 'guitarBag', tag: 'D-10', label: 'Guitar in gig bag', section: 'Floor',
    build: Floor.guitarBag, src: 'EST',
    dims: dims(GUITAR.lowerBoutWidth, GUITAR.bodyDepth, GUITAR.totalHeight),
    note: 'Bagged, zipped, upright against the rear wall. Drawn as the bag.',
  },
  {
    id: 'chair', tag: 'D-17', label: 'Office chair', section: 'Floor',
    build: Floor.chair, src: 'EST',
    dims: dims(CHAIR.seatWidth, CHAIR.seatDepth, CHAIR.baseHeight + CHAIR.columnHeight + CHAIR.seatThickness + CHAIR.backHeight),
    note: 'Wooden five-arm base, dark leather. Not on the elevation set.',
  },
  {
    id: 'knuckles', tag: 'D-13', label: 'Knuckle duster', section: 'Floor',
    build: Floor.knuckles, src: 'SHEET',
    dims: dims(KNUCKLES.holeSpacing * (KNUCKLES.holeCount - 1) + 40, 12, 46),
    note: 'On a wall hook above the deck. The easter egg.',
  },

  /* --- the room --------------------------------------------------------- */
  {
    id: 'room', tag: 'R-00', label: 'Room shell', section: 'Room',
    build: Room.room, src: 'EST', worldOnly: true,
    dims: dims(2600 - -900, 2400 - -30, 2500),
    note: 'Floor, two walls, window and curtain. Every number here is a guess.',
  },
];

export const SECTIONS = ['Structure', 'Network', 'Desktop', 'Floor', 'Room'];

export const byId = (id) => PARTS.find((p) => p.id === id);

/** What WORLD mode draws: everything that is not a sub-assembly. */
export const worldParts = () => PARTS.filter((p) => !p.parent);

/** What PARTS mode lists: everything except the room shell. */
export const galleryParts = () => PARTS.filter((p) => !p.worldOnly);
