// The dashboard picks a cargo picture by name at runtime; a renamed or missing file only shows up
// as a broken image in the browser. Keep the names the code can produce and the files on disk in step.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.join(import.meta.dirname, '..', 'public');
const imageDir = path.join(publicDir, 'img', 'cargo');
const read = (name) => fs.readFileSync(path.join(publicDir, name), 'utf8');

test('every cargo picture the frontend can request exists as WebP', () => {
  const requested = new Set();

  // mystery.js returns literal paths.
  for (const match of read('mystery.js').matchAll(/\/img\/cargo\/([a-z]+)\.([a-z]+)/gu)) {
    assert.equal(match[2], 'webp', `mystery.js must reference .webp (found .${match[2]})`);
    requested.add(match[1]);
  }

  // app.js builds the name from `cargoType = '<name>'` assignments.
  const app = read('app.js');
  assert.match(app, /\/img\/cargo\/\$\{cargoType\}\.webp/u);
  for (const match of app.matchAll(/cargoType = '([a-z]+)'/gu)) requested.add(match[1]);

  assert.ok(requested.size >= 6, `expected the six cargo types, found ${[...requested].join(', ')}`);
  for (const name of requested) {
    const file = path.join(imageDir, `${name}.webp`);
    assert.ok(fs.existsSync(file), `public/img/cargo/${name}.webp is referenced but missing`);
    const header = fs.readFileSync(file).subarray(0, 12);
    assert.equal(header.subarray(0, 4).toString('latin1'), 'RIFF');
    assert.equal(header.subarray(8, 12).toString('latin1'), 'WEBP');
  }
});

test('the cargo pictures stay web-sized', () => {
  for (const file of fs.readdirSync(imageDir)) {
    const bytes = fs.statSync(path.join(imageDir, file)).size;
    assert.ok(bytes < 300 * 1024, `${file} is ${Math.round(bytes / 1024)} KB; compress it (they load on the first screen)`);
  }
});
