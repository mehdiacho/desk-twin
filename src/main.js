import { mountPortfolio } from './portfolio.js';
import { mountRoom } from './room.js';

const room=mountRoom();
let threePromise,modelPromise,revision=0;
function loadThree(){
  return threePromise ||= new Promise((resolve,reject)=>{
    if(window.THREE){resolve(window.THREE);return;}
    const script=document.createElement('script');script.src='./vendor/three.min.js';
    script.onload=()=>resolve(window.THREE);script.onerror=()=>reject(new Error('3D library could not load.'));
    document.head.append(script);
  });
}
const portfolio=mountPortfolio({async onRoute(route){
  const current=++revision;room.setRoute(route);
  const loading=document.getElementById('loading');loading.hidden=true;
  if(!route.model)return;
  loading.textContent='Building the model…';loading.hidden=false;
  try{
    await loadThree();const model=await(modelPromise ||= import('./app.js'));
    if(current!==revision)return;model.setSceneRoute(route,portfolio.navigate);loading.hidden=true;
  }catch(error){
    if(current!==revision)return;loading.innerHTML='<p>The 3D inspector could not start.<br><a href="#/">Return to the room</a></p>';console.error(error);
  }
}});
portfolio.start();
// The illustration and all destinations work immediately. Load the decorative
// GPU effects when the visitor starts exploring, rather than blocking the room.
function enhanceRoom(){
 document.removeEventListener('pointermove',enhanceRoom);
 document.removeEventListener('keydown',enhanceRoom);
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)
  loadThree().then(THREE=>room.enhance(THREE)).catch(error=>console.warn('Using the illustrated room without the shader.',error));
}
document.addEventListener('pointermove',enhanceRoom,{once:true,passive:true});
document.addEventListener('keydown',enhanceRoom,{once:true});
