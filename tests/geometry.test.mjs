import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { useThree, roundedBox, bounds } from '../src/build.js';

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(readFileSync(new URL('../vendor/three.min.js', import.meta.url), 'utf8'), sandbox);
const THREE = sandbox.THREE;
useThree(THREE);

test('gallery bounds include all instance transforms inside a translated assembly', () => {
  const instances = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), 2);
  instances.setMatrixAt(0, new THREE.Matrix4().makeScale(0.2, 0.01, 0.04).setPosition(1.2, 0.95, 0.1));
  instances.setMatrixAt(1, new THREE.Matrix4().makeScale(0.1, 0.01, 0.04).setPosition(1.4, 0.95, 0.2));
  const assembly = new THREE.Group(); assembly.add(instances); assembly.position.y = 0.1;
  const actual = bounds(assembly);
  for (const [got, want] of [[actual.min.x, 1.1], [actual.max.x, 1.45],
    [actual.min.y, 1.045], [actual.max.y, 1.055], [actual.min.z, 0.08], [actual.max.z, 0.22]]) {
    assert.ok(Math.abs(got - want) < 1e-6, `${got} != ${want}`);
  }
});

test('rounded parts preserve millimetre bounds and valid unit normals, including thin panels', () => {
  for (const [w, h, d, r] of [[106, 150, 174, 5], [40, 118, 3, 1.4], [8, 3, 0.5, 0.2], [10, 10, 10, 5]]) {
    const mesh = roundedBox(new THREE.MeshStandardMaterial(), 1330, 920, 40, w, h, d, r);
    const bounds = new THREE.Box3().setFromObject(mesh);
    const expectedMin = [1.33, 0.92, 0.04];
    const expectedMax = [(1330 + w) / 1000, (920 + h) / 1000, (40 + d) / 1000];
    for (let i = 0; i < 3; i++) {
      assert.ok(Math.abs(bounds.min.getComponent(i) - expectedMin[i]) < 1e-7);
      assert.ok(Math.abs(bounds.max.getComponent(i) - expectedMax[i]) < 1e-7);
    }
    const n = mesh.geometry.attributes.normal;
    for (let i = 0; i < n.count; i++) {
      assert.ok(Math.abs(Math.hypot(n.getX(i), n.getY(i), n.getZ(i)) - 1) < 1e-6);
    }
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
});
