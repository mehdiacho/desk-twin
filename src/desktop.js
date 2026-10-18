import { mountProjects, mountAbout } from './projects-app.js';
import { MAX_BROWSER_DEPTH, nextDepth, fanLoad } from './experience-state.js';
export function mountDesktop(root,sound,navigate){
  root.innerHTML=`<div class="desktop-bar"><button data-app="home" aria-label="Desktop home">m<span> / room</span></button><span id="desktop-title">Home</span><button id="expand-screen" aria-pressed="false">Expand screen</button></div><div id="desktop-content" tabindex="-1"></div><nav class="desktop-dock" aria-label="Computer applications"><button data-app="projects">▦ <span>Projects</span></button><button data-app="browser">◎ <span>Browser</span></button><button data-app="files">▤ <span>Files</span></button><button data-app="games">✣ <span>Games</span></button><button data-app="about">◉ <span>About</span></button></nav>`;
  const content=root.querySelector('#desktop-content');let app='home',depth=0;
  function open(name,project){
    app=name;depth=0;sound.activity();
    root.querySelector('#desktop-title').textContent=name==='home'?'A working room':name[0].toUpperCase()+name.slice(1);
    root.querySelectorAll('[data-app]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.app===name)));
    content.scrollTop=0;
    if(name==='projects')mountProjects(content,project);
    else if(name==='about')mountAbout(content);
    else if(name==='browser')renderBrowser();
    else content.innerHTML=`<div class="desktop-welcome"><small>MEHDI'S DESKTOP</small><h2 tabindex="-1">A few windows<br>into my world.</h2><p>Software, research and things made along the way.</p><button class="primary" data-app="projects">Open Projects ↗</button></div><div class="wallpaper-line" aria-hidden="true"></div>`;
  }
  function renderBrowser(){
    sound.activity(fanLoad(depth));
    const nested=n=>`<div class="recursive-room"><img src="./assets/room-day.png" alt="Room preview at depth ${n}">${n>1?`<div class="recursive-screen">${nested(n-1)}</div>`:''}</div>`;
    content.innerHTML=`<div class="browser-address"><span>⌂ room.local</span><span>Depth ${depth} / ${MAX_BROWSER_DEPTH}</span></div><div class="browser-preview">${nested(Math.max(depth,1))}</div><div class="browser-actions"><button data-deeper ${depth>=MAX_BROWSER_DEPTH?'disabled':''}>${depth>=MAX_BROWSER_DEPTH?'Three levels deep':'Open this room inside the screen'} ↗</button><button data-browser-reset>Back to the surface</button></div><p class="muted">${depth>=3?'Enough rooms for one computer. The fans are catching up.':'A bounded miniature of this room. Go deeper and listen to the fans.'}</p>`;
    content.querySelector('[data-deeper]').addEventListener('click',()=>{depth=nextDepth(depth);renderBrowser();});
    content.querySelector('[data-browser-reset]').addEventListener('click',()=>{depth=0;renderBrowser();});
  }
  root.addEventListener('click',e=>{
    const b=e.target.closest('[data-app]');if(!b)return;sound.click();
    const id=b.dataset.app;if(id==='files'){navigate('#/homelab');return;}if(id==='games'){navigate('#/games');return;}
    if(location.hash.includes('/P')){navigate('#/projects');}
    open(id);
  });
  root.querySelector('#expand-screen').addEventListener('click',e=>{
    const expanded=document.body.classList.toggle('screen-expanded');e.currentTarget.textContent=expanded?'Fit to monitor':'Expand screen';e.currentTarget.setAttribute('aria-pressed',String(expanded));
  });
  return {
    show(route,entering){
      if(route.project)open('projects',route.project);
      else if(route.section==='about')open('about');
      else if(entering)open('home');
      else open('projects');
    },
    stop(){sound.activity();},
  };
}
