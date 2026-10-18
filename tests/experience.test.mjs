import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_BROWSER_DEPTH, nextDepth, fanLoad, diskActivity, SCREEN, fitRect } from '../src/experience-state.js';

test('recursive browsing caps at three levels and authored fan load resets',()=>{
  let depth=0;for(let i=0;i<10;i++)depth=nextDepth(depth);
  assert.equal(depth,MAX_BROWSER_DEPTH);assert.equal(depth,3);
  assert.equal(fanLoad(depth),1);assert.equal(fanLoad(0),0);assert.equal(fanLoad(0,true),1);
});
test('only accessing an HDD file wakes disks; SSD and folder browsing remain silent',()=>{
  assert.equal(diskActivity('hdd',true),true);
  for(const volume of ['hdd','ssd'])assert.equal(diskActivity(volume,false),false);
  assert.equal(diskActivity('ssd',true),false);
});
test('monitor focus remains centered, in bounds and proportionate across viewport sizes',()=>{
  for(const [w,h] of [[1440,900],[390,844],[844,390]]){
    const p=fitRect(SCREEN,w,h,18),[x,y,sw,sh]=SCREEN;
    assert.ok(Math.abs(p.x+(x+sw/2)*p.scale-w/2)<1e-8);
    assert.ok(Math.abs(p.y+(y+sh/2)*p.scale-h/2)<1e-8);
    assert.ok(sw*p.scale<=w-36+1e-8&&sh*p.scale<=h-36+1e-8);
  }
});
