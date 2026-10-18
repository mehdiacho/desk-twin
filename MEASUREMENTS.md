# What to measure, in order

The model currently stands at **0 measured · 21 surveyed · 7 estimated**.

"Surveyed" means read off the 1:15 elevation set, which is itself a drawing made
from the photographs — good, but not a tape measure. So everything here is worth
confirming eventually. This file is about *order*: what changes the most for the
least effort with a tape.

For each line: set the value in [`src/survey.js`](src/survey.js) and change its
`src` to `'MEAS'`. Nothing else needs editing.

---

## Tier 1 — the four numbers everything else hangs off

Get these and the whole model snaps into place, because every other object is
positioned relative to them.

| # | What | Survey path | Now | How |
|---|---|---|---|---|
| 1 | Desk length | `DESK.length` | 1500 | End to end along the front edge |
| 2 | Desk depth | `DESK.depth` | 700 | Wall face to front edge, at the left end |
| 3 | Desk height | `DESK.height` | 750 | Floor to **top** surface, not to the underside |
| 4 | Top thickness | `DESK.topThickness` | 25 | Calliper the exposed ply edge |

If 1 and 2 are off, every `x` and `z` in the file inherits the error. Measure
these first even though they are already tagged SURVEYED.

While the tape is out, also count the **ply laminations** on the exposed edge.
`materials.js` currently draws 9; it is the single most visible texture in the
model and it takes four seconds to count.

---

## Tier 2 — the seven estimates

These are the objects the UI colours red. Each is currently inferred from
photographs alone.

| # | What | Survey path | Now | Why it matters |
|---|---|---|---|---|
| 5 | NAS base height + inset | `NAS.base.height` `.inset` | 8 / 6 | The foot is detachable and modelled separately; the body sits on it, so an error here shifts the whole unit and the bay doors |
| 6 | Gas-spring arm reach | `MONITOR.arm.reach` | 420 | Sets how far the panel floats over the desk — the largest visual lever in the world view |
| 7 | Monitor bezel | `MONITOR.bezel.width` | 15 | Cheap to measure, very visible |
| 8 | Cable nest envelope | `CABLE_NEST` | 220×150×90 | A pure guess at a bundle; even a rough bounding box beats it |
| 9 | Headset hook position | `HEADSET.hookX` `.hookY` | 1430 / 600 | It hangs off the pedestal's right face; the height is inferred from nothing |
| 10 | Dumbbell plates per side | `DUMBBELL.platesPerSide` | 3 | Count them. Also weigh them if you want the spec line to be true |
| 11 | Chair position + size | `CHAIR` | est. throughout | Largest object in the room and the least constrained |

---

## Tier 3 — the small stuff, once the tape is already out

| What | Survey path | Now | Note |
|---|---|---|---|
| Frame member section | `DESK.frame.memberThickness` | 25 | Front elevation gives width but not depth; it is assumed square |
| Slide height | `DESK.keyboardTray.slideHeight` | 12 | The black ball-bearing slides under the tray |
| Carcass thickness | `DESK.drawers.carcassThickness` | 18 | And `frontProud` (4) — how far the white fronts stand off |
| Riser depth | `DESK.riserShelf.riserDepth` | 240 | The two blocks under the plank; only their width is drawn |
| Router fins | `ROUTER.finCount` | 7 | Count the ridges on the top shell |
| Mascom ribs | `ONT.ribCount` | 11 | Same |
| NAS LED strip | `NAS.led` | y 14, 26×3 | Position and size of the front indicator |

---

## Tier 4 — the room

`ROOM` is tagged `EST` in its entirety and is the least trustworthy part of the
model. The floor tiles are the one reliable thing in it: they are 600 mm, and
counting them along each wall gives the room dimensions to within a grout line.

- `ROOM.wallRightX`, `wallLeftX`, `frontZ` — tile counts from the desk's left end
- `ROOM.height` — floor to ceiling
- `ROOM.window` — sill height, width, head height, and its offset along the right wall
- `ROOM.wallBackZ` — the gap between the desk's rear edge and the wall (currently −30)

---

## Things a tape will not settle

Worth writing down when you find out, even though they are not dimensions:

- **The router model.** Currently `TP-Link Archer — model TBD`. The model number
  gives exact dimensions and antenna count from the spec sheet, which upgrades
  four `EST` values to `SPEC` for free.
- **The Mascom unit's function.** Drawn as a ribbed white box labelled
  "function unconfirmed" — likely an ONT, hence the `ONT` export name, but that
  is an assumption in the variable naming and should be corrected if wrong.
- **The monitor make and panel size.** A diagonal and an aspect ratio replace
  three estimated numbers.
- **The dumbbell plate weights.** Not geometry, but the reason the object exists.

---

## Recording a measurement

```js
// before
height: 750,            // finished floor to top surface

// after
src: 'MEAS',
height: 748,            // measured 2026-09-20, floor to top surface
```

The `src` tag can sit on the object or on any nested group — `NAS.base` carries
its own, separate from `NAS`. Measure a sub-assembly and only that sub-assembly
turns green.
