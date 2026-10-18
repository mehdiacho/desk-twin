import { diskActivity, fanLoad } from './experience-state.js';

const FILES={
  ssd:[{name:'Welcome.txt',type:'Text document',text:'Welcome to the public side of the shelf. This is a local demonstration of a storage interface. The files here are authored examples; nothing connects to the physical NAS.'},
    {name:'Desk study.png',type:'Image',image:'./assets/room-day.png'}],
  hdd:[{name:'About this archive.txt',type:'Text document',text:'An archive for things worth keeping. Mehdi’s public collection will live here. For now this example lets you hear the drives wake up, seek, and settle again.'},
    {name:'Room composition.png',type:'Image',image:'./assets/room-day.png'}],
};
export function mountObjectExperiences(root,sound){
  let cleanup=()=>{};
  function show(id){
    cleanup();sound.activity();root.className=`object-experience experience-${id}`;
    if(id==='homelab')nas();
    else if(id==='games')games();
    else if(id==='music')music();
    else if(id==='sound')ambience();
    else if(['network','isp','how-it-works'].includes(id))network(id);
    else if(id==='vault')drawer();
    else if(id==='off-clock')offClock();
    else if(id==='build')machine();
    else notebook(id);
  }
  function nas(){
    let volume='ssd',idle;
    root.innerHTML=`<div class="device-caption"><span class="status-dot"></span> UGREEN / DXP2800 <small>Public storage demo</small></div><div class="storage-shell"><header><b>Files</b><span class="nas-wordmark">my little server</span></header><div class="storage-main"><nav aria-label="Storage volumes"><small>STORAGE</small><button data-volume="ssd" aria-pressed="true">▱ <span>SSD<small>Everyday things</small></span></button><button data-volume="hdd" aria-pressed="false">▤ <span>HDD<small>The archive</small></span></button><div class="disk-meter"><i></i><i></i><span id="disk-status" role="status">Disks sleeping</span></div></nav><section><div class="file-path" id="file-path">SSD / Public</div><div id="file-list"></div><article id="file-preview" hidden></article></section></div><footer>Local demo files · a future home for a curated public collection</footer></div>`;
    const list=root.querySelector('#file-list'),preview=root.querySelector('#file-preview'),status=root.querySelector('#disk-status');
    const activity=on=>{sound.activity(0,on);root.classList.toggle('disk-active',on);status.textContent=on?'HDD reading · disks spinning':'Disks sleeping';};
    const listFiles=()=>{
      preview.hidden=true;list.hidden=false;root.querySelector('#file-path').textContent=`${volume.toUpperCase()} / Public`;
      list.innerHTML=FILES[volume].map((f,i)=>`<button class="file-row" data-file="${i}"><span>${f.image?'▧':'▤'}</span><b>${f.name}</b><small>${f.type}</small><span>↗</span></button>`).join('');
    };
    root.querySelectorAll('[data-volume]').forEach(b=>b.addEventListener('click',()=>{
      volume=b.dataset.volume;clearTimeout(idle);activity(false);sound.click();
      root.querySelectorAll('[data-volume]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));listFiles();
    }));
    list.addEventListener('click',e=>{
      const b=e.target.closest('[data-file]');if(!b)return;const f=FILES[volume][Number(b.dataset.file)];
      const reading=diskActivity(volume,true);activity(reading);clearTimeout(idle);if(reading)idle=setTimeout(()=>activity(false),6500);
      list.hidden=true;preview.hidden=false;
      preview.innerHTML=`<button class="app-back" data-files-back>← Public folder</button><h2 tabindex="-1">${f.name}</h2>${f.image?`<img src="${f.image}" alt="Illustrated desk composition">`:`<p>${f.text}</p>`}`;
      preview.querySelector('[data-files-back]').addEventListener('click',listFiles);preview.querySelector('h2').focus({preventScroll:true});
    });
    listFiles();cleanup=()=>{clearTimeout(idle);};
  }
  function games(){
    let hits=0,playing=false,started=0;
    root.innerHTML=`<div class="games-title"><small>AFTER HOURS</small><h2 tabindex="-1">One more round.</h2><p>A place for games, away from the workbench.</p></div><div class="game-library"><button id="launch-game"><span class="game-cover"><i></i><i></i><i></i></span><b>Signal chase</b><small>A tiny game for this room · Play →</small></button><div class="library-empty"><span>＋</span><b>The personal shelf</b><p>Games and favourites will be added here.</p></div></div><div id="game-play" hidden><div class="game-score"><span id="game-score" role="status">0 / 10</span><button id="game-stop">Leave game</button></div><div class="game-field"><button id="game-target" aria-label="Catch the signal">＋</button></div><p id="game-note">Catch ten signals. Click, tap, or press Enter on the target.</p></div>`;
    const library=root.querySelector('.game-library'),play=root.querySelector('#game-play'),target=root.querySelector('#game-target'),score=root.querySelector('#game-score');
    root.querySelector('#launch-game').addEventListener('click',()=>{
      hits=0;playing=true;started=performance.now();score.textContent='0 / 10';library.hidden=true;play.hidden=false;target.hidden=false;
      root.querySelector('#game-note').textContent='Catch ten signals. Click, tap, or press Enter on the target.';
      target.style.left='50%';target.style.top='50%';target.focus();sound.activity(fanLoad(0,true));
    });
    target.addEventListener('click',()=>{
      if(!playing)return;hits++;sound.click();score.textContent=`${hits} / 10`;
      target.style.left=`${15+Math.random()*70}%`;target.style.top=`${18+Math.random()*64}%`;
      if(hits===10){playing=false;target.hidden=true;sound.activity();root.querySelector('#game-note').textContent=`All ten in ${((performance.now()-started)/1000).toFixed(1)} seconds. Fans settling down.`;root.querySelector('#game-stop').focus();}
    });
    root.querySelector('#game-stop').addEventListener('click',()=>{playing=false;sound.activity();play.hidden=true;library.hidden=false;root.querySelector('#launch-game').focus();});
    cleanup=()=>{playing=false;};
  }
  function music(){
    root.innerHTML=`<div class="music-copy"><small>AWAY FROM THE KEYBOARD</small><h2 tabindex="-1">Six strings.<br>A different rhythm.</h2><p>The guitar’s story is still being written.</p><button id="unzip" aria-expanded="false">Unzip the bag ↓</button><p class="prototype-note">Instrument study · the actual guitar and its story will follow.</p></div><div class="guitar-study"><svg viewBox="0 0 300 640" aria-hidden="true"><defs><linearGradient id="wood"><stop stop-color="#6e341b"/><stop offset=".45" stop-color="#d19752"/><stop offset="1" stop-color="#804022"/></linearGradient></defs><g class="instrument"><path d="M129 339 C73 305 49 356 82 401 C116 446 34 454 44 532 C50 610 249 610 256 532 C266 454 184 446 218 401 C251 356 227 305 171 339Z" fill="url(#wood)" stroke="#efc592" stroke-width="6"/><circle cx="150" cy="419" r="38" fill="#21140d" stroke="#edc390" stroke-width="7"/><path d="M131 104h38l-6 324h-26z" fill="#38251a"/><path d="M126 110l-5-78 53-9 4 88z" fill="#9f6939"/><rect x="115" y="501" width="70" height="18" rx="4" fill="#302018"/>${Array.from({length:15},(_,i)=>`<path d="M133 ${128+i*17}h34" stroke="#d8b481"/>`).join('')}</g><g class="bag-cover"><path d="M111 26 Q149 2 185 26 L190 291 C197 345 228 364 244 416 L273 544 Q276 615 151 618 Q25 615 29 544 L52 416 C68 364 98 345 107 291Z" fill="#282827" stroke="#9e9585" stroke-width="3"/><path d="M153 28v559" stroke="#a9a095" stroke-dasharray="3 5" stroke-width="2"/><rect x="145" y="32" width="15" height="32" rx="3" fill="#c4b9a3" class="zip-pull"/><rect x="66" y="455" width="164" height="119" rx="24" fill="#33332f" stroke="#68685d"/></g></svg><div class="strings" hidden>${[82.41,110,146.83,196,246.94,329.63].map((f,i)=>`<button data-note="${f}" aria-label="Pluck ${['low E','A','D','G','B','high E'][i]} string"><i></i><span>${['E','A','D','G','B','e'][i]}</span></button>`).join('')}</div></div>`;
    const unzip=root.querySelector('#unzip'),strings=root.querySelector('.strings');
    unzip.addEventListener('click',()=>{
      const open=root.classList.toggle('unzipped');unzip.setAttribute('aria-expanded',String(open));unzip.textContent=open?'Zip up ↑':'Unzip the bag ↓';strings.hidden=!open;sound.click();
    });
    root.querySelectorAll('[data-note]').forEach(b=>{
      const pluck=()=>{sound.pluck(Number(b.dataset.note));b.classList.remove('plucked');void b.offsetWidth;b.classList.add('plucked');};
      b.addEventListener('click',pluck);b.addEventListener('pointerenter',e=>{if(e.buttons)pluck();});
    });cleanup=()=>{};
  }
  function ambience(){
    root.innerHTML=`<div class="sound-station"><small>LISTEN TO THE ROOM</small><h2 tabindex="-1">A window left open.</h2><div class="waveform" aria-hidden="true">${Array.from({length:35},(_,i)=>`<i style="--h:${10+(Math.sin(i*2.4)+1)*32}px;--d:${i*.07}s"></i>`).join('')}</div><p>Leaves outside. A computer at work. A little quiet between them.</p><button data-sound>Sound off</button><p class="muted">An early sound study. Real yard and machine recordings will replace these synthesized sounds.</p><a href="#/music">Try the guitar →</a></div>`;sound.sync();cleanup=()=>{};
  }
  function network(id){
    root.innerHTML=`<div class="network-study"><small>FOLLOW THE CONNECTION</small><h2 tabindex="-1">A desk, connected.</h2><div class="network-path"><button data-hop="0">Outside<small>Connection</small></button><span>↔</span><button data-hop="1">Archer AX55<small>Router</small></button><span>↔</span><button data-hop="2">DXP2800<small>Storage</small></button></div><p id="network-note" role="status">Trace the path by selecting a device.</p><p class="muted">Illustrative path, not a live network map.</p><a href="#/homelab">Browse the NAS →</a></div>`;
    const notes=['The white Mascom unit is part of this corner. Its exact role still needs confirmation.','The TP-Link Archer AX55 is the four-antenna router on the shelf.','The UGREEN DXP2800 holds SSDs and hard disks. The storage demo shows how their behavior differs.'];
    root.querySelectorAll('[data-hop]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-hop]').forEach(x=>x.classList.toggle('selected',x===b));root.querySelector('#network-note').textContent=notes[b.dataset.hop];sound.click();}));cleanup=()=>{};
  }
  function drawer(){
    root.innerHTML=`<div class="drawer-study"><small>THE LITTLE THINGS</small><h2 tabindex="-1">A place to keep things.</h2><button id="open-drawer" aria-expanded="false">Pull open ↓</button><div class="drawer-box"><div class="drawer-interior"><span>Notes for later</span><p>This drawer is waiting for its own story.</p></div><div class="drawer-front"><i></i></div></div><p class="muted">Software projects, including Secure Vault, are in the monitor’s Projects app.</p><a href="#/projects">Go to the monitor →</a></div>`;
    root.querySelector('button').addEventListener('click',e=>{const open=root.classList.toggle('drawer-open');e.currentTarget.textContent=open?'Push closed ↑':'Pull open ↓';e.currentTarget.setAttribute('aria-expanded',open);sound.click();});cleanup=()=>{};
  }
  function notebook(id){
    let page=0;
    const pages=id==='reading'?[['A book left open.','A personal reading shelf will live here. The titles in the photographs have not been identified yet.'],['A margin for thoughts.','Reading notes and favourite passages will be added with the actual books.']]:id==='writing'?[['A thought, before the code.','This is a place for personal notes from the desk. Longer entries are still to come.'],['Leave room for an idea.','The published software and research are all in Projects, on the monitor.']]:[['You looked closer.','There are small things here that have not found their story yet.'],['Still a work in progress.','This room will grow a little at a time.']];
    root.innerHTML=`<div class="open-notebook"><div class="notebook-spine"></div><small>${id==='reading'?'THE READING SHELF':'NOTES FROM THE DESK'}</small><h2 tabindex="-1"></h2><p></p><footer><button data-page="-1" aria-label="Previous page">←</button><span></span><button data-page="1" aria-label="Next page">→</button></footer></div>`;
    const draw=()=>{root.querySelector('h2').textContent=pages[page][0];root.querySelector('p').textContent=pages[page][1];root.querySelector('footer span').textContent=`${page+1} / ${pages.length}`;root.querySelector('[data-page="-1"]').disabled=page===0;root.querySelector('[data-page="1"]').disabled=page===pages.length-1;};
    root.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>{page+=Number(b.dataset.page);draw();sound.click();}));draw();cleanup=()=>{};
  }
  function offClock(){
    let seconds=30,interval;
    root.innerHTML=`<div class="rest-clock"><small>STEP AWAY FOR A MOMENT</small><h2 tabindex="-1">Between sets.</h2><output>0:30</output><button>Start a short break</button><p>The routine and the story behind these weights are still to come.</p></div>`;
    root.querySelector('button').addEventListener('click',e=>{clearInterval(interval);seconds=30;e.currentTarget.disabled=true;interval=setInterval(()=>{seconds--;root.querySelector('output').textContent=`0:${String(seconds).padStart(2,'0')}`;if(seconds===0){clearInterval(interval);e.currentTarget.disabled=false;e.currentTarget.textContent='Take another break';sound.click();}},1000);});cleanup=()=>clearInterval(interval);
  }
  function machine(){
    root.innerHTML=`<div class="machine-study"><small>UNDER THE DESK</small><h2 tabindex="-1">The quiet workhorse.</h2><p>The closed laptop drives the monitor. Let the browser-within-a-browser put its imaginary fans to work.</p><a href="#/projects">Wake the monitor →</a><div class="machine-vents" aria-hidden="true"></div><a href="#/model">Inspect the actual 3D pieces ↗</a></div>`;cleanup=()=>{};
  }
  return {show,stop(){cleanup();sound.activity();}};
}
