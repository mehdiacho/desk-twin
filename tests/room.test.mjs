import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { AREAS } from '../src/room.js';
import { DESTINATIONS } from '../src/navigation.js';
import { PROJECTS, PROFILE } from '../src/portfolio-data.js';

test('every room destination has a hit area inside the picture', () => {
  assert.equal(Object.keys(AREAS).length, DESTINATIONS.length);
  for (const d of DESTINATIONS) {
    const [x,y,w,h] = AREAS[d.id];
    assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x+w <= 100 && y+h <= 100, d.id);
  }
});

test('all project covers exist and outbound project links use HTTPS', async () => {
  for (const p of PROJECTS) {
    await access(new URL('../'+p.image, import.meta.url));
    for (const href of [p.link,p.github,p.action?.href].filter(Boolean)) assert.equal(new URL(href).protocol, 'https:');
  }
  assert.ok(!('birthDate' in PROFILE) && !('coordinates' in PROFILE));
});
