/* ============================================================================
   APP - the viewer.

   Three modes sharing the same model:
     EXPLORE - the portfolio entrance and object stories.
     WORLD  - everything in place, with an explode slider.
     PARTS  - one object at a time on a turntable, with its dimensions.

   The whole UI reads out of registry.js, so it never needs editing when a
   new object is added to the twin.
   ========================================================================== */

import { PARTS, SECTIONS, byId, galleryParts } from './registry.js';
import { SOURCE, DESK } from './survey.js';
import { useThree, mm, bounds } from './build.js';
import {
  makeRenderer, makeEnvironment, addLighting, buildWorld, applyExplode,
  buildPart, partsLighting,
} from './scene.js';
import { orbitControls } from './controls.js';
import { DESTINATIONS, destination, destinationForObject, clickGesture } from './navigation.js';

const THREE = window.THREE;
// r147 defaults to treating CSS/hex colours as linear. Our palette is sRGB;
// enable conversion before creating materials, lights or scene backgrounds.
THREE.ColorManagement.legacyMode = false;
useThree(THREE);

const canvas = document.getElementById('view');
const renderer = makeRenderer(THREE, canvas);
const environment = makeEnvironment(THREE, renderer);
const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 60);
const controls = orbitControls(THREE, camera, canvas);

/* --- two scenes, swapped rather than rebuilt ----------------------------- */
const worldScene = new THREE.Scene();
worldScene.environment = environment.texture;
worldScene.background = new THREE.Color(0xeeeae1);
const lights = addLighting(THREE, worldScene);
const { world, index } = buildWorld(THREE);
worldScene.add(world);
// A seamless studio ground lets the actual objects carry the entrance.
// The photographed room shell remains available in the technical inspector.
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0xedece8, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.004;
ground.receiveShadow = true;
worldScene.add(ground);

const partScene = new THREE.Scene();
partScene.environment = environment.texture;
partScene.background = new THREE.Color(0xf7f5f0);
partsLighting(THREE, partScene);
let partObject = null;

const state = {
  mode: 'explore',
  partId: 'desk',
  explode: 0,
  spin: true,
  showRoom: true,
};
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
state.spin = !reducedMotion.matches;
let selectedDestination = null;
let portfolio;
let lastWidth = 0, lastHeight = 0;
let roomPose = null;
let hoverId = null;
let initialized = false;
const outline = new THREE.BoxHelper(new THREE.Object3D(), 0x2e6f9e);
outline.visible = false;
worldScene.add(outline);

/* --- camera presets -------------------------------------------------------
   theta is the azimuth: 0 looks from the FRONT (+Z), +PI/2 from the RIGHT
   (+X). phi is measured from straight down the +Y axis, so small phi is
   overhead and phi near PI/2 is eye level.                              */
const V3 = (x, y, z) => new THREE.Vector3(mm(x), mm(y), mm(z));

const VIEWS = {
  // the whole corner, from where the photographs were taken
  iso:   { t: V3(1150, 620, 350),  r: 4.3, theta: -0.62, phi: 1.02 },
  front: { t: V3(750, 780, 350),   r: 3.5, theta: 0,     phi: 1.46 },
  right: { t: V3(900, 720, 350),   r: 3.4, theta: 1.52,  phi: 1.40 },
  plan:  { t: V3(900, 200, 350),   r: 4.4, theta: 0.02,  phi: 0.07 },
  // the tallest thing on the desk: shelf, NAS, ONT, folder
  stack: { t: V3(1330, 1010, 150), r: 1.15, theta: -0.5, phi: 1.18 },
};

function setView(name, instant) {
  const v = VIEWS[name];
  if (!v) return;
  if (instant || reducedMotion.matches) controls.set(v.t.clone(), v.r, v.theta, v.phi);
  else controls.flyTo(v.t.clone(), v.r, v.theta, v.phi);
}

/* --- UI ------------------------------------------------------------------ */
const els = {
  list: document.getElementById('list'),
  meta: document.getElementById('meta'),
  modeWorld: document.getElementById('mode-world'),
  modeParts: document.getElementById('mode-parts'),
  explodeRow: document.getElementById('explode-row'),
  explode: document.getElementById('explode'),
  explodeVal: document.getElementById('explode-val'),
  spinRow: document.getElementById('spin-row'),
  spin: document.getElementById('spin'),
  roomRow: document.getElementById('room-row'),
  room: document.getElementById('room'),
  views: document.getElementById('views'),
  counts: document.getElementById('counts'),
};

function badge(src) {
  const s = SOURCE[src] || SOURCE.EST;
  return '<span class="badge b-' + src + '" title="' + s.note + '">' + s.label + '</span>';
}

function renderList() {
  const items = state.mode === 'parts' ? galleryParts() : PARTS.filter((p) => !p.parent);
  let html = '';
  SECTIONS.forEach((section) => {
    const inSection = items.filter((p) => p.section === section);
    if (!inSection.length) return;
    html += '<div class="sec">' + section + '</div>';
    inSection.forEach((p) => {
      const active = p.id === state.partId;
      html += '<button class="row' + (active ? ' on' : '') + (p.parent ? ' sub' : '') +
        '" data-id="' + p.id + '">' +
        '<span class="tag">' + p.tag + '</span>' +
        '<span class="nm">' + p.label + '</span>' +
        badge(p.src) + '</button>';
    });
  });
  els.list.innerHTML = html;
  els.list.querySelectorAll('.row').forEach((b) => {
    b.addEventListener('click', () => selectPart(b.dataset.id));
  });
}

function renderMeta() {
  const p = byId(state.partId);
  if (!p) { els.meta.innerHTML = ''; return; }
  const d = p.dims;
  els.meta.innerHTML =
    '<div class="mt-tag">' + p.tag + ' &middot; ' + p.label + '</div>' +
    '<div class="mt-dim">' +
      '<span>W <b>' + Math.round(d.w) + '</b></span>' +
      '<span>D <b>' + Math.round(d.d) + '</b></span>' +
      '<span>H <b>' + Math.round(d.h) + '</b></span>' +
      '<span class="mm">mm</span>' +
    '</div>' +
    '<div class="mt-note">' + p.note + '</div>' +
    '<div class="mt-src">' + badge(p.src) + '<span>' +
      (SOURCE[p.src] || SOURCE.EST).note + '</span></div>';
}

function renderCounts() {
  const g = galleryParts();
  const n = { SHEET: 0, EST: 0, SPEC: 0, MEAS: 0 };
  g.forEach((p) => { n[p.src] = (n[p.src] || 0) + 1; });
  els.counts.innerHTML =
    g.length + ' objects &middot; ' +
    '<b>' + (n.MEAS || 0) + '</b> measured &middot; ' +
    '<b>' + (n.SHEET || 0) + '</b> surveyed &middot; ' +
    '<b class="warn">' + (n.EST || 0) + '</b> estimated';
}

function selectPart(id) {
  state.partId = id;
  if (state.mode === 'parts') loadPart(id);
  renderList();
  renderMeta();
}

function loadPart(id) {
  if (partObject) { partScene.remove(partObject); disposeTree(partObject); }
  partObject = buildPart(THREE, id);
  if (!partObject) return;
  partScene.add(partObject);

  fitPart();
}

/* Frame the part against BOTH half-angles of the frustum. A 1500 desk base is
   wide and shallow; on a tall thin viewport the horizontal field is the
   binding constraint, and a radius taken off the vertical one clips it. */
function fitPart() {
  if (!partObject) return;
  const s = partObject.userData.size;
  const vFov = (camera.fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(camera.aspect, 0.2));

  // the part spins, so the worst case is its diagonal presented edge-on
  const spread = Math.hypot(s.x, s.z);
  const radius = Math.max(
    (spread / 2) / Math.tan(hFov / 2),
    (s.y / 2) / Math.tan(vFov / 2),
  ) * 1.25 + 0.18;

  controls.set(new THREE.Vector3(0, s.y * 0.45, 0), radius, 0.9, 1.12);
}

function disposeTree(root) {
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
  });
}

function setMode(mode) {
  const oldMode = state.mode;
  state.mode = mode;
  document.body.classList.toggle('model-mode', mode !== 'explore');
  els.modeWorld.classList.toggle('on', mode === 'world');
  els.modeParts.classList.toggle('on', mode === 'parts');
  els.explodeRow.style.display = mode === 'world' ? '' : 'none';
  els.roomRow.style.display = mode === 'world' ? '' : 'none';
  els.spinRow.style.display = mode === 'parts' ? '' : 'none';
  els.views.style.display = mode === 'world' ? '' : 'none';

  if (mode === 'parts') {
    loadPart(state.partId);
  } else {
    if (partObject) { partScene.remove(partObject); disposeTree(partObject); partObject = null; }
    if (oldMode === 'parts') setView('iso', true);
  }
  renderList();
  renderMeta();
}

/* --- wiring -------------------------------------------------------------- */
els.modeWorld.addEventListener('click', () => portfolio.navigate('#/model'));
els.modeParts.addEventListener('click', () => portfolio.navigate('#/model/parts'));
els.spin.checked = state.spin;

els.explode.addEventListener('input', () => {
  state.explode = Number(els.explode.value) / 100;
  els.explodeVal.textContent = els.explode.value + '%';
  applyExplode(THREE, index, state.explode);
});

els.spin.addEventListener('change', () => { state.spin = els.spin.checked; });

els.room.addEventListener('change', () => {
  state.showRoom = els.room.checked;
  const r = index.get('room');
  if (r) r.visible = state.showRoom;
});

els.views.querySelectorAll('button').forEach((b) => {
  b.addEventListener('click', () => setView(b.dataset.view));
});

document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea, select, [contenteditable=true]') || e.ctrlKey || e.metaKey || e.altKey || e.repeat || state.mode === 'explore') return;
  if (e.key === 'w') portfolio.navigate('#/model');
  if (e.key === 'p') portfolio.navigate('#/model/parts');
  if (state.mode !== 'world') return;
  if (e.key === '1') setView('iso');
  if (e.key === '2') setView('front');
  if (e.key === '3') setView('right');
  if (e.key === '4') setView('plan');
  if (e.key === '5') setView('stack');
});

/* --- object navigation; a solid object occludes the things behind it ----- */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const gesture = clickGesture();
const tooltip = document.getElementById('hover-label');
function hitPart(e) {
  const rect = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  const roots = [...index.values()].filter(o => o.visible);
  const hit = ray.intersectObjects(roots, true)[0];
  return hit?.object.userData.partId;
}
function highlight(id) {
  const obj = index.get(id);
  outline.visible = !!obj && state.mode === 'explore' && !selectedDestination;
  if (obj) outline.setFromObject(obj);
}
canvas.addEventListener('pointerdown', e => { gesture.down(e); tooltip.hidden = true; });
canvas.addEventListener('pointercancel', e => gesture.cancel(e));
canvas.addEventListener('lostpointercapture', e => gesture.cancel(e));
canvas.addEventListener('pointermove', e => {
  gesture.move(e);
  if (state.mode !== 'explore' || selectedDestination || e.buttons || e.pointerType === 'touch') return;
  const id = hitPart(e);
  const d = destinationForObject(id);
  hoverId = d ? id : null;
  canvas.style.cursor = d ? 'pointer' : 'grab';
  highlight(hoverId || selectedDestination?.object);
  tooltip.hidden = !d;
  if (d) {
    const rect = canvas.getBoundingClientRect();
    tooltip.textContent = `${d.label} →`;
    tooltip.style.left = Math.max(8, Math.min(e.clientX - rect.left + 15, rect.width - 235)) + 'px';
    tooltip.style.top = Math.max(8, Math.min(e.clientY - rect.top + 15, rect.height - 45)) + 'px';
  }
});
canvas.addEventListener('pointerleave', () => { hoverId = null; tooltip.hidden = true; highlight(selectedDestination?.object); });
canvas.addEventListener('pointerup', e => {
  const isClick = gesture.up(e);
  if (!isClick || state.mode === 'parts' || selectedDestination) return;
  const id = hitPart(e);
  if (state.mode === 'explore') {
    const d = destinationForObject(id);
    if (d) portfolio.navigate(`#/${d.id}`);
  } else if (id && id !== 'room') selectPart(id);
});

function moveCamera(t, r, theta, phi, instant = false) {
  controls[instant || reducedMotion.matches ? 'set' : 'flyTo'](t, r, theta, phi);
}

function homeView(instant = false) {
  // Leave headroom for the identity and room introduction on portrait screens.
  const r = Math.max(4.1, 3.4 / Math.max(camera.aspect, 0.35));
  moveCamera(V3(920, 620, 570), r, -0.55, 1.03, instant);
}

function focusDestination(d, instant = false) {
  const obj = index.get(d.object);
  if (!obj) return;
  const box = bounds(obj), size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const spread = Math.max(size.x, size.y, size.z, 0.3);
  const r = Math.max(0.85, spread * 2 / Math.min(camera.aspect, 1));
  moveCamera(center, r, d.object === 'headset' ? 0.7 : -0.25, 1.18, instant);
}

function setLighting() {
  const studio = state.mode === 'explore';
  const night = studio && document.body.classList.contains('night');
  const background = night ? 0x202a38 : studio ? 0xedece8 : 0xeeeae1;
  worldScene.background.setHex(background);
  worldScene.fog = studio ? new THREE.Fog(background, 7, 18) : null;
  ground.material.color.setHex(background);
  lights.key.intensity = night ? 0.55 : 2;
  lights.key.color.setHex(night ? 0xbed4ff : 0xfff3dd);
  lights.fill.intensity = night ? 0.12 : 0.34;
  lights.hemi.intensity = night ? 0.14 : 0.34;
  lights.key.position.set(studio ? 3.2 : 3.6, studio ? 5.6 : 2.3, studio ? 3 : 1.9);
  // A higher key and filtered variance shadow reduce the long, hard silhouette.
  const shadowType = studio ? THREE.VSMShadowMap : THREE.PCFSoftShadowMap;
  if (renderer.shadowMap.type !== shadowType) {
    renderer.shadowMap.type = shadowType;
    renderer.shadowMap.needsUpdate = true;
  }
  lights.key.shadow.radius = studio ? 10 : 1;
  lights.key.shadow.blurSamples = 8;
}

document.getElementById('daylight').addEventListener('click', setLighting);
document.getElementById('reset-view').addEventListener('click', () => homeView());

// Five primary entrances get compact, keyboard-focusable markers. Everything
// else is clickable in the scene and available through the complete text index.
const hotspots = document.getElementById('hotspots');
const markers = DESTINATIONS.filter(d => d.primary).map(d => {
  const link = document.createElement('a');
  link.className = 'scene-hotspot'; link.href = `#/${d.id}`;
  link.setAttribute('aria-label', `${d.label} — ${d.caption}`);
  const label = document.createElement('span'); label.textContent = d.label;
  link.append(label); hotspots.append(link);
  const box = bounds(index.get(d.object));
  const point = box.getCenter(new THREE.Vector3());
  point.y = box.max.y + 0.045;
  if (d.object === 'nas' || d.object === 'desk.drawers') {
    point.y = (box.min.y + box.max.y) / 2;
    point.z = box.max.z + 0.035;
  }
  return { link, point };
});
const projected = new THREE.Vector3();
function placeMarkers() {
  hotspots.hidden = state.mode !== 'explore' || !!selectedDestination;
  if (hotspots.hidden) return;
  for (const { link, point } of markers) {
    projected.copy(point).project(camera);
    link.hidden = projected.z < -1 || projected.z > 1 || Math.abs(projected.x) > 0.95 || Math.abs(projected.y) > 0.9;
    link.style.left = `${(projected.x + 1) * lastWidth / 2}px`;
    link.style.top = `${(1 - projected.y) * lastHeight / 2}px`;
  }
}

export function setSceneRoute(route, navigate) {
  portfolio = { navigate };
  const wasModel = state.mode !== 'explore';
  const previous = selectedDestination;
  if (!wasModel && !previous && route.section && initialized) {
    roomPose = { target: controls.target.clone(), sph: controls.sph.clone() };
  }
  selectedDestination = destination(route.section) || null;
  tooltip.hidden = true; outline.visible = false;
  setMode(route.model || 'explore');
  applyExplode(THREE, index, route.model ? state.explode : 0);
  index.get('room').visible = !!route.model && state.showRoom;
  index.get('knuckles').visible = !!route.model || route.section === 'easter-egg';
  ground.visible = !route.model;
  setLighting();
  resize(false);
  if (route.model) {
    roomPose = null;
    if (state.mode === 'world') setView('iso', true);
  } else if (selectedDestination) {
    if (previous?.id !== selectedDestination.id || wasModel || !initialized) focusDestination(selectedDestination, !initialized);
  } else if (previous && roomPose) {
    moveCamera(roomPose.target, roomPose.sph.radius, roomPose.sph.theta, roomPose.sph.phi);
    roomPose = null;
  } else if (!initialized || wasModel || previous) homeView(true);
  initialized = true;
  placeMarkers();
}

/* --- resize + loop ------------------------------------------------------- */
function resize(refit = true) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (w > 0 && h > 0 && (lastWidth !== w || lastHeight !== h)) {
    lastWidth = w; lastHeight = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (state.mode === 'parts') fitPart();
    else if (refit && state.mode === 'explore') {
      if (selectedDestination) focusDestination(selectedDestination, true);
      else homeView(true);
    }
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (!initialized || document.hidden || !document.body.classList.contains('model-mode')) { requestAnimationFrame(frame); return; }
  resize();
  controls.update(dt);
  if (state.mode === 'parts' && state.spin && partObject) {
    partObject.rotation.y += dt * 0.45;
  }
  renderer.render(state.mode === 'parts' ? partScene : worldScene, camera);
  placeMarkers();
  requestAnimationFrame(frame);
}

/* --- go ------------------------------------------------------------------ */
renderCounts();
resize(false);
requestAnimationFrame(frame);
