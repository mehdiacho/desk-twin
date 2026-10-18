import test from 'node:test';
import assert from 'node:assert/strict';
import { DESTINATIONS, destinationForObject, parseRoute, clickGesture } from '../src/navigation.js';
import { PROJECTS } from '../src/portfolio-data.js';
import { PARTS } from '../src/registry.js';

test('every doorway references a real scene object; structural shelf has no destination', () => {
  for (const d of DESTINATIONS) {
    assert.ok(PARTS.some(p => p.id === d.object && !p.parent), d.object);
    assert.equal(parseRoute(`#/${d.id}`, PROJECTS).section, d.id);
  }
  assert.equal(destinationForObject('desk.riserShelf'), undefined);
  assert.equal(destinationForObject('mouse').id, 'projects');
  assert.equal(destinationForObject('desk.keyboardTray').id, 'writing');
});
test('all 20 projects are addressable and malformed routes safely return home', () => {
  assert.equal(PROJECTS.length, 20);
  for (const p of PROJECTS) assert.equal(parseRoute(`#/projects/${p.id}`, PROJECTS).project, p.id);
  for (const h of ['#/projects/P999', '#/nope', '#/about/P01', '#/projects/P01/extra', '#/%3Cscript%3E']) assert.equal(parseRoute(h, PROJECTS).invalid, true);
  assert.equal(parseRoute('#/', PROJECTS).section, null);
  assert.equal(parseRoute('#/model/parts', PROJECTS).model, 'parts');
});
const pointer = (x=10, y=10, extra={}) => ({ pointerId: 1, clientX:x, clientY:y, button:0, ...extra });
test('tap opens, but drags returning to their starting position never open', () => {
  const g = clickGesture();
  g.down(pointer()); assert.equal(g.up(pointer(12,12)), true);
  g.down(pointer()); g.move(pointer(120,120)); g.move(pointer()); assert.equal(g.up(pointer()), false);
});
test('pinch, cancellation, modifier and right clicks do not navigate', () => {
  const g = clickGesture();
  g.down(pointer()); g.down(pointer(20,20,{pointerId:2}));
  assert.equal(g.up(pointer(20,20,{pointerId:2})), false);
  assert.equal(g.up(pointer()), false);
  g.down(pointer()); g.cancel(pointer()); assert.equal(g.up(pointer()), false);
  g.down(pointer(10,10,{button:2})); assert.equal(g.up(pointer()), false);
  g.down(pointer(10,10,{shiftKey:true})); assert.equal(g.up(pointer()), false);
  g.down(pointer()); assert.equal(g.up(pointer()), true);
});
