import { DESTINATIONS } from './navigation.js';
import { SCREEN, fitRect } from './experience-state.js';
import { makeRoomEffects } from './room-effects.js';

export const AREAS = {
  projects: [23,18,23,21], games: [16.5,41,8,7], homelab: [61,26,6.5,14],
  network: [49,24,11,14], isp: [60,19,8,7], vault: [50,56,13,21],
  writing: [21,52,22,7], sound: [63,58,7,17], music: [69,20,11,49],
  'off-clock': [76,66,17,19], reading: [61.5,42,8,7],
  build: [44,55,5,7], 'how-it-works': [17,29,5,10],
  about: [31,40,11,8], 'easter-egg': [41,1,3.5,12],
};
export function mountRoom() {
  const picture=document.getElementById('room-picture'), viewport=document.getElementById('room-viewport');
  const root=document.getElementById('room-objects'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const screen=document.getElementById('monitor-screen');
  let route={},active=null,effects,pan=0,drag=null,dragged=false,width=0,height=0;
  let pose={x:0,y:0,scale:1},target=pose,first=true,hover=0;
  const mouse={x:.5,y:.5},drift={x:0,y:0},aim={x:0,y:0};
  for(const d of DESTINATIONS){
    const [x,y,w,h]=AREAS[d.id],a=document.createElement('a');
    a.href=`#/${d.id}`;a.className=`room-object${d.secret?' secret-object':''}`;
    a.setAttribute('aria-label',`${d.label} — ${d.caption}`);
    a.style.cssText=`left:${x}%;top:${y}%;width:${w}%;height:${h}%;`;
    const label=document.createElement('span');label.textContent=d.label;a.append(label);root.append(a);
    a.addEventListener('pointerenter',()=>active=d.id);a.addEventListener('pointerleave',()=>active=null);
    a.addEventListener('focus',()=>active=d.id);a.addEventListener('blur',()=>active=null);
  }
  document.getElementById('daylight').addEventListener('click',e=>{
    const night=document.body.classList.toggle('night');e.currentTarget.setAttribute('aria-pressed',night);
    e.currentTarget.textContent=night?'☾ Night':'☀ Day';
  });
  document.getElementById('reveal-objects').addEventListener('click',e=>{
    const show=document.body.classList.toggle('reveal-objects');e.currentTarget.setAttribute('aria-pressed',show);
    e.currentTarget.textContent=show?'Hide clues':'Show clues';
  });
  function measure(){
    width=viewport.clientWidth;height=viewport.clientHeight;if(!width||!height)return;
    if(!route.section){
      const scale=Math.max(width/1672,height/941)*1.025,min=width-1672*scale;
      target={scale,x:Math.max(min,Math.min(0,(width-1672*scale)*.48+pan)),y:(height-941*scale)/2};
    }else if(route.section==='projects'||route.section==='about'){
      target=fitRect(SCREEN,width,height,width<600?18:Math.max(46,width*.075));
    }else{
      const [x,y,w,h]=AREAS[route.section],rect=[x*16.72,y*9.41,w*16.72,h*9.41];
      const leftWidth=width<700?width:width*.44,topHeight=width<700?height*.38:height;
      target=fitRect(rect,leftWidth,topHeight,width<700?30:75);target.scale=Math.min(target.scale,3.4);
      target.x=leftWidth/2-(rect[0]+rect[2]/2)*target.scale;target.y=topHeight/2-(rect[1]+rect[3]/2)*target.scale;
    }
    if(first||reduced.matches){pose={...target};first=false;}
  }
  viewport.addEventListener('pointermove',e=>{
    const r=picture.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width;mouse.y=(e.clientY-r.top)/r.height;
    aim.x=(e.clientX/Math.max(width,1)-.5)*2;aim.y=(e.clientY/Math.max(height,1)-.5)*2;
    if(drag&&e.pointerId===drag.id&&!route.section){const delta=e.clientX-drag.x;if(Math.abs(delta)>6){dragged=true;pan=drag.pan+delta;measure();}}
  });
  viewport.addEventListener('pointerleave',()=>{aim.x=aim.y=0;active=null;});
  viewport.addEventListener('pointerdown',e=>{if(!route.section){drag={id:e.pointerId,x:e.clientX,pan};dragged=false;}});
  window.addEventListener('pointerup',()=>drag=null);window.addEventListener('pointercancel',()=>{drag=null;dragged=false;});
  viewport.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopPropagation();dragged=false;}},true);
  new ResizeObserver(measure).observe(viewport);
  document.getElementById('reset-view').addEventListener('click',()=>{pan=0;measure();});
  let last=0;
  function frame(now){
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(!document.hidden&&!route.model){
      const k=reduced.matches?1:1-Math.exp(-dt*7);
      for(const key of ['x','y','scale'])pose[key]+=(target[key]-pose[key])*k;
      for(const key of ['x','y'])drift[key]+=((route.section||reduced.matches?0:aim[key])-drift[key])*k;
      hover+=((active&&!route.section&&!reduced.matches?1:0)-hover)*k;
      picture.style.transform=`translate3d(${pose.x+drift.x*3}px,${pose.y+drift.y*2}px,0) scale(${pose.scale})`;
      if(!document.body.classList.contains('screen-expanded')){
        const [x,y,w,h]=SCREEN;
        Object.assign(screen.style,{left:`${pose.x+x*pose.scale}px`,top:`${pose.y+y*pose.scale}px`,width:`${w*pose.scale}px`,height:`${h*pose.scale}px`});
      }
      effects?.update(now/1000,mouse,drift,active,hover);
    }
    requestAnimationFrame(frame);
  }
  measure();requestAnimationFrame(frame);
  return {
    setRoute(next){route=next;root.inert=!!route.section||!!route.model;active=null;measure();},
    refit:measure,
    async enhance(THREE){
      const img=document.getElementById('room-art');await img.decode();
      try{effects=makeRoomEffects(THREE,picture,img,AREAS);}catch(error){console.warn('Room shader unavailable; illustration remains usable.',error);}
    },
  };
}
