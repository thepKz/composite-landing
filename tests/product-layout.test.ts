import assert from 'node:assert/strict';
import test from 'node:test';
import { emptySection, moveSectionImage, productLayoutSchema, sectionImageIds } from '../src/lib/product-layout';

const image = (n: number) => ({ media_id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`, alt: `Bể ${n}`, caption: '', fit: 'contain' as const });

test('section images validate limits and preserve image-specific settings', () => {
  const section = { ...emptySection('scale'), images: [image(1), image(2)] };
  assert.deepEqual(productLayoutSchema.parse([section]), [section]);
  assert.doesNotThrow(() => productLayoutSchema.parse([{ ...section, images: [{ ...image(1), alt: 'a'.repeat(500), caption: 'b'.repeat(500) }] }]));
  assert.throws(() => productLayoutSchema.parse([{ ...section, images: [{ ...image(1), alt: 'a'.repeat(501) }] }]));
  assert.throws(() => productLayoutSchema.parse([section, section]));
  assert.throws(() => productLayoutSchema.parse([{ ...section, images: [image(1), image(1)] }]));
  assert.throws(() => productLayoutSchema.parse([{ ...section, images: Array.from({ length: 7 }, (_, n) => image(n)) }]));
  assert.throws(() => productLayoutSchema.parse([{ ...section, position: 'absolute' }]));
  assert.throws(() => productLayoutSchema.parse([{ ...section, images: [{ ...image(1), media_id: 'https://evil.example/image' }] }]));
});

test('move within a section and across sections without losing settings', () => {
  const original = [{ ...emptySection('scale'), images: [image(1), image(2), image(3)] }];
  const reordered = moveSectionImage(original, 'scale', image(3).media_id, 'scale', image(1).media_id);
  assert.deepEqual(reordered[0].images, [image(3), image(1), image(2)]);
  const moved = moveSectionImage(reordered, 'scale', image(1).media_id, 'features');
  assert.deepEqual(moved[0].images, [image(3), image(2)]);
  assert.deepEqual(moved[1].images, [image(1)]);
  assert.deepEqual(original[0].images, [image(1), image(2), image(3)]);
  assert.deepEqual(sectionImageIds(moved), [image(3).media_id, image(2).media_id, image(1).media_id]);
});

test('invalid, duplicate and full drops never remove the original', () => {
  const original = [{ ...emptySection('scale'), images: [image(1)] }, { ...emptySection('features'), images: Array.from({ length: 6 }, (_, n) => image(n + 2)) }];
  assert.equal(moveSectionImage(original, 'scale', image(1).media_id, 'features'), original);
  assert.equal(moveSectionImage(original, 'scale', image(1).media_id, 'scale', image(1).media_id), original);
  assert.equal(moveSectionImage(original, 'scale', image(99).media_id, 'faq'), original);
  const duplicate = [original[0], { ...emptySection('features'), images: [image(1)] }];
  assert.equal(moveSectionImage(duplicate, 'scale', image(1).media_id, 'features'), duplicate);
});
