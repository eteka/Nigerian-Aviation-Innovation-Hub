const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, '..', 'server', 'data', 'navigator');
const AREAS = ['aircraft-tech', 'operations', 'sustainable-fuel', 'offsets'];
const files = AREAS.map((a) => JSON.parse(fs.readFileSync(path.join(DIR, `${a}.json`), 'utf8')));
const ideas = files.flatMap((f) => f.idea_types);

const ALLOWED_HOSTS = [/(^|\.)icao\.int$/, /(^|\.)astm\.org$/];
const NATIONAL_BODIES = /\b(FAA|EASA|CAAN|Nigerian Civil Aviation|Transport Canada|CAA UK)\b/i;

test('four areas, at least 3 idea types each, 12 in total', () => {
  assert.equal(files.length, 4);
  files.forEach((f, i) => {
    assert.equal(f.area, AREAS[i]);
    assert.ok(f.area_name && f.area_description);
    assert.ok(f.idea_types.length >= 3, `${f.area} needs at least 3 idea types`);
  });
  assert.ok(ideas.length >= 12);
  assert.equal(new Set(ideas.map((i) => i.id)).size, ideas.length, 'ids are unique');
});

test('required idea types are present', () => {
  const ids = ideas.map((i) => i.id);
  for (const id of ['saf-production', 'saf-feedstock', 'drones', 'electric-aircraft', 'flight-ops-efficiency', 'corsia-offsetting']) {
    assert.ok(ids.includes(id), `missing ${id}`);
  }
});

test('each idea type has the full shape and is unreviewed', () => {
  for (const i of ideas) {
    assert.ok(i.name && i.description, `${i.id}: name and description`);
    assert.ok(Array.isArray(i.also_called) && i.also_called.length > 0, `${i.id}: also_called`);
    assert.ok(Array.isArray(i.rules) && i.rules.length > 0, `${i.id}: rules`);
    assert.ok(i.readiness_checklist.length >= 5 && i.readiness_checklist.length <= 8, `${i.id}: checklist 5-8`);
    assert.ok(i.reviewer_questions.length >= 4 && i.reviewer_questions.length <= 6, `${i.id}: questions 4-6`);
    assert.equal(i.reviewed, false, `${i.id}: reviewed must be false`);
    assert.equal(i.national_requirements, 'Check with your civil aviation authority for the national requirements that also apply.');
  }
});

test('every rule names a body, document, reason and an https source on the issuer\'s own site', () => {
  for (const i of ideas) {
    for (const r of i.rules) {
      assert.ok(r.issuing_body, `${i.id}: issuing_body`);
      assert.ok(r.document, `${i.id}: document`);
      assert.ok(r.why_it_applies, `${i.id}: why_it_applies`);
      const u = new URL(r.source_url);
      assert.equal(u.protocol, 'https:', `${i.id}: ${r.source_url} must be https`);
      assert.ok(ALLOWED_HOSTS.some((h) => h.test(u.hostname)), `${i.id}: unexpected host ${u.hostname}`);
      const owner = r.issuing_body.startsWith('ICAO') ? /icao\.int$/ : /astm\.org$/;
      assert.ok(owner.test(u.hostname), `${i.id}: ${r.document} link must be on ${r.issuing_body}'s own site`);
    }
  }
});

test('no national regulator and no partner claims', () => {
  const text = JSON.stringify(files);
  assert.doesNotMatch(text, NATIONAL_BODIES);
  assert.doesNotMatch(text, /partner/i);
});
