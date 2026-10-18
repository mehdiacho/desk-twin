// Destinations from Sheet 06. Scene identifiers are independent of page URLs,
// so a future room object can lead to an existing section without duplicating it.
export const DESTINATIONS = [
  { id: 'projects', label: 'Projects', object: 'monitor', tag: 'D-01', caption: 'The monitor', primary: true },
  { id: 'build', label: 'Build environment', object: 'laptop', tag: 'D-02', caption: 'Under the desk' },
  { id: 'homelab', label: 'The NAS', object: 'nas', tag: 'D-03', caption: 'The network shelf', primary: true },
  { id: 'network', label: 'Network', object: 'router', tag: 'D-04', caption: 'Four antennas' },
  { id: 'isp', label: 'The ISP', object: 'ont', tag: 'D-05', caption: 'The white box' },
  { id: 'vault', label: 'The drawers', object: 'desk.drawers', tag: 'D-06', caption: 'The drawers', primary: true },
  { id: 'writing', label: 'Writing', object: 'keyboard', tag: 'D-07', caption: 'The keyboard' },
  { id: 'games', label: 'Games', object: 'controller', tag: 'D-08', caption: 'The blue controller', primary: true },
  { id: 'sound', label: 'Sound', object: 'headset', tag: 'D-09', caption: 'The hanging headset' },
  { id: 'music', label: 'Music', object: 'guitarBag', tag: 'D-10', caption: 'The guitar bag' },
  { id: 'off-clock', label: 'Off clock', object: 'dumbbells', tag: 'D-11', caption: 'The dumbbells' },
  { id: 'how-it-works', label: 'How it works', object: 'cableNest', tag: 'D-12', caption: 'Behind the desk' },
  { id: 'easter-egg', label: 'A small discovery', object: 'knuckles', tag: 'D-13', caption: 'The wall hook', secret: true },
  { id: 'reading', label: 'Reading & research', object: 'books', tag: 'D-14', caption: 'The books', primary: true },
  { id: 'about', label: 'Gaborone · about me', object: 'deskMat', tag: 'D-15', caption: 'The world-map mat' },
];
export const destination = id => DESTINATIONS.find(d => d.id === id);
export function destinationForObject(id) {
  const alias = { mouse: 'monitor', 'desk.keyboardTray': 'keyboard', folder: 'ont', chair: 'deskMat' };
  return DESTINATIONS.find(d => d.object === (alias[id] || id));
}
export function parseRoute(hash, projects) {
  const path = hash.replace(/^#\/?/, '').split('/');
  if (!path[0]) return { section: null };
  if (path[0] === 'model') return { model: path[1] === 'parts' ? 'parts' : 'world' };
  if (!destination(path[0])) return { section: null, invalid: true };
  if (path[1] && (path[0] !== 'projects' || !projects.some(p => p.id === path[1]))) return { section: null, invalid: true };
  if (path.length > 2) return { section: null, invalid: true };
  return { section: path[0], project: path[1] || null };
}

// A returning drag and a pinch must never become clicks at pointerup.
export function clickGesture() {
  const pointers = new Set();
  let start = null, moved = false;
  return {
    down(e) {
      pointers.add(e.pointerId);
      if (pointers.size > 1) { moved = true; return; }
      start = { id: e.pointerId, x: e.clientX, y: e.clientY };
      moved = e.button !== 0 || e.shiftKey || e.ctrlKey || e.metaKey;
    },
    move(e) {
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) moved = true;
    },
    up(e) {
      const click = start && start.id === e.pointerId && !moved && pointers.size === 1;
      pointers.delete(e.pointerId);
      if (!pointers.size) start = null;
      return !!click;
    },
    cancel(e) { pointers.delete(e.pointerId); moved = true; if (!pointers.size) start = null; },
  };
}
