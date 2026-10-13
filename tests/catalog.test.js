import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  CASE_CATEGORIES,
  caseCategory,
  caseSearchFields,
  matchesSearch,
  searchTerms
} from '../public/catalog.js';

// Market entries as /api/cases returns them: { case_id, cargo, case }.
const files = [
  'data/demo-case.json',
  ...fs.readdirSync('data/cases').filter((name) => name.endsWith('.case.json')).map((name) => `data/cases/${name}`)
];
const entries = files.map((file) => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { case_id: data.case_id, cargo: data.bill_of_lading?.cargo ?? null, case: data };
});
const byId = (id) => entries.find((entry) => entry.case_id === id);
const found = (query) => entries.filter((entry) => matchesSearch(caseSearchFields(entry), query)).map((e) => e.case_id);

test('catalog: every market case falls into exactly one known category', () => {
  const counts = {};
  for (const entry of entries) {
    const category = caseCategory(entry);
    assert.ok(CASE_CATEGORIES.includes(category), `${entry.case_id} -> ${category}`);
    counts[category] = (counts[category] ?? 0) + 1;
  }
  assert.equal(entries.length, 22);
  assert.deepEqual(counts, { metal: 16, energy: 2, ore: 2, agriculture: 2 });
});

test('catalog: ores and concentrates are not metals, rubber and soy are agriculture', () => {
  assert.equal(caseCategory(byId('CASE-EBL-2026-IRONORE-AU-TJ')), 'ore');
  assert.equal(caseCategory(byId('CASE-EBL-2026-CUCONC-ANF-LYG')), 'ore');
  assert.equal(caseCategory(byId('CASE-EBL-2026-RUBBER-BKK-QD')), 'agriculture');
  assert.equal(caseCategory(byId('CASE-EBL-2026-SOY-SH-SG')), 'agriculture');
  assert.equal(caseCategory(byId('CASE-EBL-2026-REFINED-SG-JKT')), 'energy');
});

test('catalog: aluminium warehouse receipts without "aluminum" in the cargo line are metals', () => {
  const entry = byId('CASE-EWR-2025-ALU-FS-WH-00008');
  assert.doesNotMatch(entry.cargo, /alumin/iu);
  assert.equal(caseCategory(entry), 'metal');
});

test('catalog: unknown cargo falls back to other', () => {
  assert.equal(caseCategory({ case_id: 'CASE-X', cargo: 'Industrial widgets' }), 'other');
});

test('catalog: search needs every term, ignores case and punctuation', () => {
  assert.deepEqual(searchTerms('  Copper, Shanghai  '), ['copper', 'shanghai']);
  assert.equal(found('').length, 22);
  assert.equal(found('aluminum').length, 13);
  // Copper cargo that also mentions Shanghai (as loading or discharge port).
  assert.deepEqual(found('copper shanghai').sort(), [
    'CASE-EBL-2026-0001', 'CASE-EBL-2026-CU-SG-SHA', 'CASE-EBL-2026-CU-SG-SHA-WARCRISIS'
  ]);
  assert.deepEqual(found('ebl-2026-cu-sg-sha-warcrisis'), ['CASE-EBL-2026-CU-SG-SHA-WARCRISIS']);
  assert.deepEqual(found('no-such-cargo'), []);
});
