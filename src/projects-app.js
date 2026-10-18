import { PROJECTS, PROFILE, TIMELINE } from './portfolio-data.js';
export const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name=p=>p.title.replaceAll('_',' ');
const link=(href,label)=>/^https:\/\//.test(href||'')?`<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`:'';
const state={query:'',status:'all',scroll:0};
export function mountProjects(root,projectId){
  const p=PROJECTS.find(p=>p.id===projectId);
  if(p){
    root.innerHTML=`<a class="app-back" href="#/projects">← All projects</a><article class="project-detail"><img src="${esc(p.image)}" alt=""><div><small>${p.id} · ${esc(p.status)}</small><h2 tabindex="-1">${esc(name(p))}</h2><p>${esc(p.pitch)}</p><div class="stack">${p.stack.map(s=>`<span>${esc(s)}</span>`).join('')}</div><div class="outlinks">${link(p.link||p.action?.href,'Open project')}${link(p.github,'Source code')}</div>${p.private?'<p class="muted">Source is private.</p>':''}</div></article>`;
    return;
  }
  root.innerHTML=`<div class="app-heading"><div><small>SOFTWARE / RESEARCH / EXPERIMENTS</small><h2 tabindex="-1">Projects</h2></div><span class="app-count">${PROJECTS.length} on the workbench</span></div><label class="sr-only" for="project-search">Find a project</label><input id="project-search" type="search" placeholder="Search name, idea or technology…"><div class="filters" aria-label="Project status">${['all','live','wip','concept'].map(s=>`<button data-filter="${s}" aria-pressed="${state.status===s}">${{all:'All',live:'Live',wip:'In build',concept:'Concept'}[s]}</button>`).join('')}</div><p id="result-count" role="status"></p><div id="project-grid"></div>`;
  const input=root.querySelector('input');input.value=state.query;
  const update=()=>{
    state.query=input.value;const q=state.query.trim().toLowerCase();
    const items=PROJECTS.filter(p=>(state.status==='all'||state.status===p.status)&&`${p.title} ${p.pitch} ${p.stack.join(' ')}`.toLowerCase().includes(q));
    root.querySelector('#result-count').textContent=`${items.length} of ${PROJECTS.length} projects`;
    root.querySelector('#project-grid').innerHTML=items.length?items.map(p=>`<a class="project-card" href="#/projects/${p.id}"><img src="${esc(p.image)}" alt="" loading="lazy"><div><small>${p.id} / ${esc(p.status)}</small><h3>${esc(name(p))}</h3><p>${esc(p.pitch)}</p></div></a>`).join(''):'<p>No matching projects.</p>';
  };
  input.addEventListener('input',update);
  root.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
    state.status=b.dataset.filter;root.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));update();
  }));update();
}
export function mountAbout(root){
  root.innerHTML=`<div class="about-page"><small>GABORONE, BOTSWANA</small><h2 tabindex="-1">Mehdi Acho.</h2><p class="lead">${esc(PROFILE.bio)} ${esc(PROFILE.bioSub)}</p><blockquote>${esc(PROFILE.mission)}</blockquote>${TIMELINE.map(t=>`<article class="timeline"><small>${esc(t.period)}</small><h3>${esc(t.role)}</h3><p>${esc(t.company)} · ${esc(t.description)}</p></article>`).join('')}<div class="outlinks">${link(PROFILE.socials.github,'GitHub')}${link(PROFILE.socials.linkedin,'LinkedIn')}</div></div>`;
}
