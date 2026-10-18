import { CONTROLLER, MOUSE, DESK_MAT } from '../survey.js';
import { DESK_TOP_Y } from './desk.js';
import { materials } from '../materials.js';
import { roundedBox, cyl, tube, group, mm } from '../build.js';
import { contourShell, placeInEnvelope } from '../contours.js';

// Layout and relief are photo-derived, not measured product CAD.
export function controller(THREE) {
  const M = materials(THREE), c = CONTROLLER;
  const outline = new THREE.Shape();
  outline.moveTo(-48, -48);
  outline.bezierCurveTo(-20, -53, 20, -53, 48, -48);
  outline.bezierCurveTo(64, -46, 69, -28, 74, -7);
  outline.bezierCurveTo(80, 17, 84, 41, 73, 50);
  outline.bezierCurveTo(63, 60, 55, 47, 43, 32);
  outline.bezierCurveTo(35, 23, 31, 20, 25, 20);
  outline.lineTo(-25, 20);
  outline.bezierCurveTo(-31, 20, -35, 23, -43, 32);
  outline.bezierCurveTo(-55, 47, -63, 60, -73, 50);
  outline.bezierCurveTo(-84, 41, -80, 17, -74, -7);
  outline.bezierCurveTo(-69, -28, -64, -46, -48, -48);
  const slope = (x, z) => -Math.max(0, z) * 0.18;
  const parts = [
    contourShell(THREE, outline, [{scale:.80,y:11},{scale:.93,y:14},{scale:1,y:23}], M.deviceWhite, 'shell.lower', slope),
    contourShell(THREE, outline, [{scale:1.001,y:23},{scale:1.001,y:23.7}], M.nasBezel, 'shell.seam', slope),
    contourShell(THREE, outline, [{scale:1,y:23.7},{scale:.985,y:29},{scale:.95,y:35},
      {scale:.87,y:39},{scale:.65,y:41},{scale:.28,y:42}], M.controllerBlue, 'shell.upper', slope),
  ];
  const height = (x, z) => 41 + slope(x, z) - Math.pow(Math.abs(x) / 80, 4) * 6;
  function ring(material, x, y, z, radius, thickness, name) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(mm(radius), mm(thickness), 8, 40), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(mm(x), mm(y), mm(z)); mesh.name = name;
    mesh.castShadow = mesh.receiveShadow = true; parts.push(mesh);
  }
  function label(tile, x, y, z, size) {
    const geo = new THREE.PlaneGeometry(mm(size), mm(size));
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (tile + uv.getX(i)) / 8, uv.getY(i));
    const mesh = new THREE.Mesh(geo, M.controllerLegends);
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(mm(x), mm(y), mm(z));
    mesh.name = 'button.print.' + tile; parts.push(mesh);
  }
  // Asymmetric analogue sticks: blue sculpted caps inside black circular wells.
  [[-42,-18],[22,10]].forEach(([x,z], i) => {
    const y = height(x,z);
    parts.push(cyl(M.nasBezel,x,y,z,14,2,'y',48,{name:'stick.well.'+i}));
    parts.push(cyl(M.controllerBlue,x,y+4,z,7,8,'y',32,{name:'stick.stem.'+i}));
    parts.push(cyl(M.controllerBlue,x,y+9,z,10.3,3,'y',48,{name:'stick.cap.'+i}));
    parts.push(cyl(M.controllerInset,x,y+10.55,z,7.8,0.3,'y',40,{name:'stick.dish.'+i}));
    ring(M.controllerBlue,x,y+10.5,z,9.6,1.3,'stick.rim.'+i);
    // Fine knurl marks around the cap edge, merged into one geometry draw.
    const teeth = new THREE.InstancedMesh(new THREE.BoxGeometry(mm(.65),mm(2),mm(.7)), M.controllerInset, 40);
    const transform = new THREE.Object3D();
    for (let j=0;j<40;j++) {
      const a=j*Math.PI/20;
      transform.position.set(mm(x+10.1*Math.sin(a)),mm(y+9.8),mm(z+10.1*Math.cos(a)));
      transform.rotation.y=a; transform.updateMatrix(); teeth.setMatrixAt(j,transform.matrix);
    }
    teeth.name='stick.knurl.'+i; parts.push(teeth);
  });
  // The Series hybrid D-pad is a shallow faceted dish, not a raised plus sign.
  const dx=-21,dz=10,dy=height(dx,dz);
  parts.push(cyl(M.nasBezel,dx,dy,dz,14,1.4,'y',48,{name:'dpad.well'}));
  const dp = new THREE.Shape();
  for (let i=0;i<8;i++) {
    const a=i*Math.PI/4+Math.PI/8;
    i ? dp.lineTo(Math.cos(a)*13,Math.sin(a)*13) : dp.moveTo(Math.cos(a)*13,Math.sin(a)*13);
  }
  dp.closePath();
  const dish = contourShell(THREE,dp,[{scale:1,y:dy+1},{scale:1,y:dy+3},{scale:.38,y:dy+1.8}],M.controllerPad,'dpad.facets');
  dish.position.set(mm(dx),0,mm(dz)); parts.push(dish);
  parts.push(roundedBox(M.deviceDark,dx-4,dy+1.9,dz-11,8,.5,22,.2,{name:'dpad.vertical'}));
  parts.push(roundedBox(M.deviceDark,dx-11,dy+1.9,dz-4,22,.5,8,.2,{name:'dpad.horizontal'}));
  // Glossy black ABXY caps with blue legends match the official blue reference.
  [[44,-9,'A'],[55,-21,'B'],[33,-21,'X'],[44,-33,'Y']].forEach(([x,z,text], i) => {
    const y=height(x,z);
    parts.push(cyl(M.nasBezel,x,y,z,6.2,1.5,'y',32,{name:'face.well.'+text}));
    parts.push(cyl(M.glassDark,x,y+2.2,z,5.2,3.5,'y',32,{name:'face.'+text}));
    label(i,x,y+4,z,8);
  });
  [[-12,-21,4],[12,-21,5],[0,-9,6],[0,-39,7]].forEach(([x,z,tile]) => {
    const y=height(x,z), r=tile===7?6:3.8;
    parts.push(cyl(tile===7?M.nasBezel:M.controllerInset,x,y+1,z,r,2.5,'y',32,{name:'system.'+tile}));
    label(tile,x,y+2.3,z,r*1.6);
  });
  for (const s of [-1,1]) {
    parts.push(roundedBox(M.nasBezel,s<0?-64:31,26,-52,33,10,12,4,{name:'bumper.'+s}));
    parts.push(roundedBox(M.nasBezel,s<0?-64:42,13,-54,22,17,18,6,{name:'trigger.'+s}));
  }
  parts.push(roundedBox(M.nasBezel,-5,26,-51.5,10,4,1,1,{name:'usb-c.recess'}));
  const result = group('controller',parts);
  return placeInEnvelope(THREE,result,c.x,DESK_TOP_Y+DESK_MAT.thickness,c.z,c.width,c.height,c.depth);
}

export function mouse(THREE) {
  const M=materials(THREE), m=MOUSE;
  const outline=new THREE.Shape();
  outline.moveTo(0,-60);
  outline.bezierCurveTo(12,-60,26,-56,29,-49);
  outline.bezierCurveTo(33,-38,35,-10,35,17);
  outline.bezierCurveTo(35,44,28,59,0,60);
  outline.bezierCurveTo(-28,59,-35,44,-35,17);
  outline.bezierCurveTo(-35,-10,-33,-38,-29,-49);
  outline.bezierCurveTo(-26,-56,-12,-60,0,-60);
  const slope=(x,z)=>z*.05;
  const parts=[
    contourShell(THREE,outline,[{scale:.8,y:3},{scale:.95,y:5},{scale:1,y:13},{scale:.995,y:18}],M.mouseSide,'lower.shell',slope),
    contourShell(THREE,outline,[{scale:.998,y:18},{scale:.998,y:18.7}],M.nasBezel,'perimeter.seam',slope),
    contourShell(THREE,outline,[{scale:.995,y:18.7},{scale:.94,y:23},{scale:.80,y:29},{scale:.55,y:33},{scale:.18,y:35}],M.mouseTop,'upper.shell',slope),
  ];
  // Recessed narrow center strip and distinct left/right click-panel seams.
  const surface = z => z < -20 ? 35+(z+20)*.32 : 35+z*.05;
  for (const x of [-6,6]) {
    const points=[];
    for(let z=-58;z<=7;z+=5) points.push([x,surface(z)+.3,z]);
    parts.push(tube(M.nasBezel,points,.55,{name:'click.seam.'+x,noShadow:true}));
  }
  parts.push(tube(M.nasBezel,[[-6,surface(7),7],[-4,surface(10),10],[0,surface(11),11],[4,surface(10),10],[6,surface(7),7]],.55,{name:'strip.end',noShadow:true}));
  parts.push(roundedBox(M.nasBezel,-5,surface(-37)-2,-46,10,2,22,3,{name:'wheel.recess'}));
  parts.push(cyl(M.rubber,0,surface(-36),-36,9,7,'x',40,{name:'wheel'}));
  // Tread rings stay on the rotating wheel, rather than decorative dots on top.
  for(let x=-2.8;x<3;x+=1.4) {
    const ring=new THREE.Mesh(new THREE.TorusGeometry(mm(8.9),mm(.35),6,36),M.deviceDark);
    ring.rotation.y=Math.PI/2; ring.position.set(mm(x),mm(surface(-36)),mm(-36));
    ring.name='wheel.tread'; parts.push(ring);
  }
  parts.push(roundedBox(M.nasBezel,-4.4,surface(-8),-12.4,8.8,1.3,8.8,1.5,{name:'dpi.recess'}));
  parts.push(roundedBox(M.mouseTop,-3.7,surface(-8)+.8,-11.7,7.4,1.5,7.4,1.2,{name:'dpi.button'}));
  parts.push(roundedBox(M.nasBezel,-4.5,12,-59.8,9,3.5,1.5,1,{name:'usb-c.recess'}));
  const shell=group('mouse.shell',parts);
  // The source plan has the mouse's long axis along X. Preserve that envelope
  // and placement rather than misreading its 120 x 70 footprint as a wide mouse.
  shell.rotation.y=Math.PI/2;
  return placeInEnvelope(THREE,group('mouse',[shell]),m.x,DESK_TOP_Y+DESK_MAT.thickness,m.z,m.width,m.height,m.depth);
}
