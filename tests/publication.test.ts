import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { publicationState, vietnamInputToUtc, vietnamDateTimeInput, formatVietnamDateTime } from '../src/lib/post-time';
import { resolvePublicationTime } from '../src/lib/publication';

const now = new Date('2026-11-04T03:00:00.000Z');
const later = '2026-11-04T04:00:00.000Z';

test('Vietnamese local input maps to UTC across midnight and leap days', () => {
  assert.equal(vietnamInputToUtc('2026-11-04T00:30'), '2026-11-03T17:30:00.000Z');
  assert.equal(vietnamDateTimeInput('2026-11-03T17:30:00.000Z'), '2026-11-04T00:30');
  assert.equal(vietnamInputToUtc('2028-02-29T08:00'), '2028-02-29T01:00:00.000Z');
  for (const value of ['2026-02-29T10:00', '2026-04-31T10:00', '2026-11-04T24:00', '2026-11-04T10:60', '', '2026-11-04T10:00Z']) assert.equal(vietnamInputToUtc(value), null, value);
});

test('input and display use Vietnam time under different host zones', () => {
  const expected = JSON.stringify([vietnamInputToUtc('2026-11-04T00:30'), vietnamDateTimeInput('2026-11-03T17:30:00Z'), formatVietnamDateTime('2026-11-03T17:30:00Z')]);
  for (const zone of ['UTC', 'America/Los_Angeles', 'Asia/Tokyo']) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', "import {vietnamInputToUtc,vietnamDateTimeInput,formatVietnamDateTime} from './src/lib/post-time.ts';console.log(JSON.stringify([vietnamInputToUtc('2026-11-04T00:30'),vietnamDateTimeInput('2026-11-03T17:30:00Z'),formatVietnamDateTime('2026-11-03T17:30:00Z')]));"], { env: { ...process.env, TZ: zone }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), expected, zone);
  }
});

test('publication becomes visible at the exact instant, never before', () => {
  const at = new Date(later).getTime();
  assert.equal(publicationState('published', later, at - 1), 'scheduled');
  assert.equal(publicationState('published', later, at), 'published');
  assert.equal(publicationState('published', later, at + 1), 'published');
  assert.equal(publicationState('draft', later, at + 1), 'draft');
  assert.equal(publicationState('published', null, at), 'draft');
});

test('schedule requires an explicit valid future UTC instant', () => {
  assert.equal(resolvePublicationTime('published', 'schedule', later, null, now)?.toISOString(), later);
  for (const value of [undefined, 'invalid', '2026-11-04T10:00', '2027-02-30T10:00:00Z', now.toISOString(), '2026-11-04T02:59:59Z']) assert.throws(() => resolvePublicationTime('published', 'schedule', value, null, now));
  assert.throws(() => resolvePublicationTime('published', 'publish', later, null, now));
  assert.throws(() => resolvePublicationTime('draft', 'schedule', later, null, now));
});

test('editing a scheduled post retains its schedule; explicit publishing advances it', () => {
  const previous = { status: 'published', published_at: later };
  assert.equal(resolvePublicationTime('published', 'save', undefined, previous, now)?.toISOString(), later);
  assert.equal(resolvePublicationTime('published', undefined, undefined, previous, now)?.toISOString(), later);
  assert.equal(resolvePublicationTime('published', 'publish', undefined, previous, now)?.toISOString(), now.toISOString());
  assert.equal(resolvePublicationTime('published', 'schedule', '2026-11-05T01:00:00Z', previous, now)?.toISOString(), '2026-11-05T01:00:00.000Z');
});

test('cancelling a schedule leaves a private draft with no pending publication', () => {
  assert.equal(resolvePublicationTime('draft', undefined, undefined, { status: 'published', published_at: later }, now), null);
  assert.equal(resolvePublicationTime('published', 'publish', undefined, { status: 'draft', published_at: null }, now)?.toISOString(), now.toISOString());
});

test('updates to an already published post retain its original publication date', () => {
  const original = '2026-11-01T01:00:00Z';
  assert.equal(resolvePublicationTime('published', 'publish', undefined, { status: 'published', published_at: original }, now)?.toISOString(), new Date(original).toISOString());
  assert.throws(() => resolvePublicationTime('published', 'save', undefined, null, now));
});
