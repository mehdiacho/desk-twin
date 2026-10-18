import { PROJECTS } from './portfolio-data.js';
import { DESTINATIONS, destination, parseRoute } from './navigation.js';
import { mountDesktop } from './desktop.js';
import { mountObjectExperiences } from './object-experiences.js';
import { createSoundscape } from './soundscape.js';

export function mountPortfolio({onRoute}){
  const sound=createSoundscape(),screen=document.getElementById('monitor-screen'),experience=document.getElementById('object-experience');
  const menu=document.getElementById('explore-menu'),navigation=document.getElementById('destinations');
  const toolbar=document.getElementById('experience-toolbar');
  let route={},opener=null,focusTimer,screenTimer,lastHash;
  navigation.innerHTML=DESTINATIONS.filter(d=>!d.secret).map(d=>`<a href="#/${d.id}"><small>${d.tag}</small><span>${d.label}</span><em>${d.caption}</em></a>`).join('');
  function navigate(hash){if(location.hash!==hash)history.pushState(null,'',hash);render();}
  const desktop=mountDesktop(screen,sound,navigate),objects=mountObjectExperiences(experience,sound);
  function render(){
    const previous=route;route=parseRoute(location.hash,PROJECTS);
    if(route.invalid)history.replaceState(null,'','#/');
    // popstate + hashchange may describe the same traversal.
    if(lastHash===location.hash)return;lastHash=location.hash;
    clearTimeout(focusTimer);clearTimeout(screenTimer);menu.open=false;
    if(!previous.section&&route.section)opener=document.activeElement;
    const monitor=['projects','about'].includes(route.section),entering=previous.section!==route.section;
    document.body.classList.toggle('model-mode',!!route.model);
    document.body.classList.toggle('in-experience',!!route.section);
    document.body.classList.toggle('at-monitor',monitor);
    if(entering)document.body.classList.remove('screen-entered','screen-expanded');
    document.body.dataset.experience=route.section||'room';
    screen.hidden=!monitor;experience.hidden=!route.section||monitor;toolbar.hidden=!route.section;
    document.getElementById('room-intro').hidden=!!route.section||!!route.model;
    for(const id of ['sitebar','room-tools','room-viewport'])document.getElementById(id).inert=!!route.section;
    objects.stop();desktop.stop();
    if(monitor){
      desktop.show(route,entering);
      const button=screen.querySelector('#expand-screen');button.textContent='Expand screen';button.setAttribute('aria-pressed','false');
      screenTimer=setTimeout(()=>{
        document.body.classList.add('screen-entered');
        if(innerWidth<700){document.body.classList.add('screen-expanded');button.textContent='Fit to monitor';button.setAttribute('aria-pressed','true');}
      },matchMedia('(prefers-reduced-motion: reduce)').matches?0:800);
    }else if(route.section)objects.show(route.section);
    sound.sync();onRoute(route);
    navigation.querySelectorAll('a').forEach(a=>a.toggleAttribute('aria-current',a.hash===`#/${route.section}`));
    document.title=route.section?`${destination(route.section).label} — Mehdi Acho`:'Mehdi Acho — A working room';
    if(route.section){
      focusTimer=setTimeout(()=>{
        const target=(monitor?screen:experience).querySelector('h2');
        (target||document.getElementById('leave-experience')).focus({preventScroll:true});
      },matchMedia('(prefers-reduced-motion: reduce)').matches?0:900);
    }else if(previous.section){
      (opener?.isConnected&&opener.matches('a,button,input,summary')&&!opener.closest('[hidden],details:not([open])')?opener:document.getElementById('index-toggle')).focus({preventScroll:true});
    }
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-sound]')){sound.toggle();return;}
    const a=e.target.closest('a[href^="#/"]');
    if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    e.preventDefault();sound.click();navigate(a.hash);
  });
  document.getElementById('leave-experience').addEventListener('click',()=>navigate('#/'));
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    if(menu.open){menu.open=false;document.getElementById('index-toggle').focus();}
    else if(route.section)navigate(route.project?'#/projects':'#/');
  });
  window.addEventListener('popstate',render);window.addEventListener('hashchange',render);
  return {start:render,navigate,get route(){return route;}};
}
