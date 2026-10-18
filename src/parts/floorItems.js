/* ============================================================================
   FLOOR ITEMS - the dumbbells, the bagged guitar, the chair, and the one
   object on the wall that explains nothing.
   ========================================================================== */

import { DUMBBELL, GUITAR, KNUCKLES, CHAIR, ROOM } from '../survey.js';
import { materials } from '../materials.js';
import { box, roundedBox, boxC, cyl, tube, group, mm } from '../build.js';

/* --- one spinlock dumbbell, lying on the floor ---------------------------- */
export function dumbbell(THREE, index) {
  const M = materials(THREE);
  const D = DUMBBELL;
  const pos = D.positions[index || 0];
  const parts = [];
  const y = D.plateRadius;   // lying on its plates

  // the bar, running along X before the group is rotated
  parts.push(cyl(M.chrome, 0, 0, 0, D.barRadius, D.barLength, 'x', 16, { name: 'bar' }));

  const inner = D.barLength / 2 - D.collarLength - D.platesPerSide * D.plateThickness;
  [-1, 1].forEach((side) => {
    // collar
    parts.push(cyl(M.castIron,
      side * (D.barLength / 2 - D.collarLength / 2), 0, 0,
      D.collarRadius, D.collarLength, 'x', 16, { name: 'collar' }));
    // plates, stacked inboard of the collar
    for (let p = 0; p < D.platesPerSide; p++) {
      const cx = side * (inner + D.plateThickness * (p + 0.5));
      // alternate chrome and cast iron, as in the photographs
      const mat = p % 2 === 0 ? M.chrome : M.castIron;
      parts.push(cyl(mat, cx, 0, 0,
        D.plateRadius, D.plateThickness - 2, 'x', 28, { name: 'plate' + p }));
      // the raised hub each plate has
      parts.push(cyl(M.castIron, cx, 0, 0,
        D.plateRadius * 0.34, D.plateThickness + 1, 'x', 18, { name: 'hub' + p }));
    }
  });

  const g = group('dumbbell' + (index || 0), parts);
  g.position.set(mm(pos.x), mm(y), mm(pos.z));
  g.rotation.y = pos.rotation;
  return g;
}

export function dumbbells(THREE) {
  const g = group('dumbbells', []);
  for (let i = 0; i < DUMBBELL.count; i++) g.add(dumbbell(THREE, i));
  return g;
}

/* --- the guitar, in its zipped gig bag ------------------------------------
   Built as an extruded silhouette, because that is honestly all the bag is:
   a flat-ish soft case standing against the wall.                         */
export function guitarBag(THREE) {
  const M = materials(THREE);
  const G = GUITAR;
  const lw = G.lowerBoutWidth / 2;
  const uw = G.upperBoutWidth / 2;
  const ww = G.waistWidth / 2;
  const nw = G.neckWidth / 2;

  // Soft continuous profile. The reference shows a padded case, with no
  // rigid horizontal straps projecting beyond its neck or body.
  const shape = new THREE.Shape();
  const line = (x,y) => shape.lineTo(mm(x),mm(y));
  const curve = (...v) => shape.bezierCurveTo(...v.map(mm));
  const edge = 10, wide = lw - edge;
  shape.moveTo(mm(-lw * 0.45), mm(edge));
  curve(-wide,edge,-wide,100,-wide,210);
  curve(-wide,330,-ww,G.bodyBottom-10,-ww,G.bodyBottom+45);
  curve(-ww,G.bodyTop-45,-uw,G.bodyTop-65,-uw,G.bodyTop-10);
  curve(-uw,G.bodyTop+40,-nw,G.bodyTop+75,-nw,G.bodyTop+120);
  line(-nw,G.totalHeight-75);
  curve(-nw,G.totalHeight-edge,nw,G.totalHeight-edge,nw,G.totalHeight-75);
  line(nw,G.bodyTop+120);
  curve(nw,G.bodyTop+75,uw,G.bodyTop+40,uw,G.bodyTop-10);
  curve(uw,G.bodyTop-65,ww,G.bodyTop-45,ww,G.bodyBottom+45);
  curve(ww,G.bodyBottom-10,wide,330,wide,210);
  curve(wide,100,wide,edge,lw*0.45,edge);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: mm(G.bodyDepth-24),
    bevelEnabled: true, bevelThickness: mm(12), bevelSize: mm(edge), bevelSegments: 4, curveSegments: 12 });
  geo.translate(0,0,mm(12));
  const bag = new THREE.Mesh(geo,M.nylonBag);
  bag.name='padded.case'; bag.castShadow=bag.receiveShadow=true;
  const parts=[bag];
  const outline=shape.getSpacedPoints(100).map(p=>[p.x/mm(1),p.y/mm(1),G.bodyDepth-9]);
  outline.push(outline[0]);
  parts.push(tube(M.fabricSeam,outline,2,{name:'perimeter.piping'}));
  parts.push(roundedBox(M.nylonBag,-lw*0.66,130,G.bodyDepth-8,
    lw*1.32,225,20,9,{name:'front.pocket'}));
  parts.push(tube(M.fabricSeam,[[-lw*.55,336,G.bodyDepth+13],
    [0,340,G.bodyDepth+13],[lw*.55,336,G.bodyDepth+13]],1.8,{name:'pocket.zip'}));
  parts.push(tube(M.rubber,[[lw*.81,330,G.bodyDepth*.55],
    [lw+28,356,G.bodyDepth*.55],[lw+25,447,G.bodyDepth*.55],
    [ww,468,G.bodyDepth*.55]],9,{name:'carry.handle'}));

  const g = group('guitarBag', parts);
  // stood against the rear wall, leaning back slightly
  g.position.set(mm(G.x), 0, mm(G.z));
  g.rotation.x = -0.10;
  g.rotation.y = -0.22;
  return g;
}

/* --- the knuckle duster on its wall hook ---------------------------------- */
export function knuckles(THREE) {
  const M = materials(THREE);
  const K = KNUCKLES;
  const z = ROOM.wallBackZ + 20;
  const parts = [];

  // the plastic hook
  parts.push(box(M.deviceWhite, K.x - 22, K.hookY, z, 44, 12, 16, { name: 'hookPlate' }));
  const lip = new THREE.Mesh(new THREE.TorusGeometry(mm(22), mm(4), 8, 16, Math.PI), M.deviceWhite);
  lip.position.set(mm(K.x), mm(K.hookY), mm(z + 12));
  lip.castShadow = true;
  lip.name = 'hookLip';
  parts.push(lip);

  // the body - four finger holes in a bar
  const span = K.holeSpacing * (K.holeCount - 1);
  parts.push(box(M.brass, K.x - span / 2 - 20, K.bodyY - 20, z + 8,
    span + 40, 46, 12, { name: 'body' }));
  for (let i = 0; i < K.holeCount; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(mm(K.holeRadius), mm(4.5), 8, 18), M.brass);
    ring.position.set(mm(K.x - span / 2 + i * K.holeSpacing), mm(K.bodyY), mm(z + 14));
    ring.castShadow = true;
    ring.name = 'hole' + i;
    parts.push(ring);
  }

  // the cable running past it
  parts.push(tube(M.cable, [
    [K.x - 60, K.cableTop, z + 4],
    [K.x - 66, (K.cableTop + K.cableBottom) / 2, z + 8],
    [K.x - 58, K.cableBottom, z + 4],
  ], 4, { name: 'cable', noShadow: true }));

  return group('knuckles', parts);
}

/* --- the office chair, pushed partly under the desk ----------------------- */
export function chair(THREE) {
  const M = materials(THREE);
  const C = CHAIR;
  const parts = [];

  // five-arm wooden base
  for (let i = 0; i < C.baseArms; i++) {
    const a = (Math.PI * 2 * i) / C.baseArms;
    const arm = roundedBox(M.wood,-C.baseRadius/2, 0, -35,
      C.baseRadius,C.baseHeight*.6,70,18,{name:'arm'+i});
    arm.position.set(mm(Math.cos(a)*C.baseRadius*.5),mm(C.baseHeight*.6),mm(Math.sin(a)*C.baseRadius*.5));
    arm.rotation.y = -a;
    parts.push(arm);
    const wheel = group('castor'+i,[-16,16].map(offset=>cyl(M.rubber,offset,25,0,
      25,14,'x',24,{name:'wheel'})));
    wheel.position.set(mm(Math.cos(a)*C.baseRadius),0,mm(Math.sin(a)*C.baseRadius));
    wheel.rotation.y=-a; parts.push(wheel);
  }

  // gas column
  parts.push(cyl(M.blackSteel,0,C.baseHeight*.7,0,52,C.baseHeight*.6,'y',24,{name:'base.hub'}));
  parts.push(cyl(M.blackSteel, 0, C.baseHeight + C.columnHeight / 2, 0,
    C.columnRadius, C.columnHeight, 'y', 14, { name: 'column' }));

  // seat and back, in the dark leather of the photographs
  const seatY = C.baseHeight + C.columnHeight;
  parts.push(roundedBox(M.blackSteel,-C.seatWidth*.36,seatY-20,-C.seatDepth*.36,
    C.seatWidth*.72,28,C.seatDepth*.72,12,{name:'seat.pan'}));
  parts.push(roundedBox(M.leather,-C.seatWidth/2,seatY,-C.seatDepth/2,
    C.seatWidth,C.seatThickness,C.seatDepth,38,{name:'seat.cushion'}));
  const back = group('back',[
    roundedBox(M.leather,-C.backWidth/2,0,-C.backThickness/2,
      C.backWidth,C.backHeight,C.backThickness,38,{name:'back.cushion'}),
    roundedBox(M.leather,-C.backWidth*.40,60,C.backThickness*.26,
      C.backWidth*.8,C.backHeight*.32,30,14,{name:'lumbar.pad'}),
  ]);
  for(const ratio of [0.40,0.70]) back.add(tube(M.leatherSeam,
    [[-C.backWidth*.39,C.backHeight*ratio,C.backThickness/2+0.6],
     [0,C.backHeight*ratio-3,C.backThickness/2+0.6],
     [C.backWidth*.39,C.backHeight*ratio,C.backThickness/2+0.6]],1.4,{name:'upholstery.seam'}));
  back.position.set(0,mm(seatY+C.seatThickness-18),mm(-C.seatDepth/2+C.backThickness/2));
  back.rotation.x=-0.10;
  parts.push(back);

  const g = group('chair', parts);
  g.position.set(mm(C.x), 0, mm(C.z));
  g.rotation.y = 0.95;
  return g;
}
