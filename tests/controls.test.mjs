import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { orbitControls } from '../src/controls.js';

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(readFileSync(new URL('../vendor/three.min.js', import.meta.url), 'utf8'), sandbox);
const THREE = sandbox.THREE;
function setup() {
  const events = new Map();
  const camera = new THREE.PerspectiveCamera();
  const controls = orbitControls(THREE, camera, {
    addEventListener: (name, fn) => events.set(name, fn), setPointerCapture() {},
  });
  controls.set(new THREE.Vector3(0.9, 0.6, 0.5), 4.1, -0.55, 1.03);
  return { controls, events };
}

test('story camera arrives at the same exact pose at 24, 60 and 144 fps', () => {
  for (const fps of [24, 60, 144]) {
    const { controls } = setup();
    const target = new THREE.Vector3(1.3, 1.1, 0.15);
    controls.flyTo(target, 0.9, -0.25, 1.18);
    for (let frame = 0; frame < fps; frame++) controls.update(1 / fps);
    assert.ok(controls.target.distanceTo(target) < 1e-12);
    assert.equal(controls.sph.radius, 0.9);
    assert.equal(controls.sph.theta, -0.25);
    assert.equal(controls.sph.phi, 1.18);
  }
});

test('drag cancels a camera flight and an immediate pose cancels motion', () => {
  const { controls, events } = setup();
  controls.flyTo(new THREE.Vector3(1, 1, 1), 1, 0, 1);
  controls.update(0.2);
  events.get('pointerdown')({pointerId: 1, clientX: 20, clientY: 20, button: 0});
  events.get('pointermove')({pointerId: 1, clientX: 50, clientY: 20});
  const paused = controls.sph.clone();
  controls.update(1);
  assert.equal(controls.sph.theta, paused.theta);
  assert.equal(controls.sph.radius, paused.radius);
  const pose = new THREE.Vector3(0, 0.7, 0);
  controls.flyTo(new THREE.Vector3(3, 2, 1), 3, 1, 1);
  controls.set(pose, 4, 0.2, 1.2);
  controls.update(1);
  assert.ok(controls.target.equals(pose));
  assert.equal(controls.sph.radius, 4);
});
