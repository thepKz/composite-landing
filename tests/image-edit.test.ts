import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { applyImageEdit, cropRectangle, parseImageEdit } from '../src/lib/upload';
import { RequestError } from '../src/lib/http';

const rejects = (value: unknown, label: string) => assert.throws(() => parseImageEdit(value), RequestError, label);

test('image edit accepts rotation, flips and a crop inside the picture', () => {
  assert.deepEqual(parseImageEdit({ rotate: 90 }), { rotate: 90, flip_h: false, flip_v: false, crop: null });
  assert.deepEqual(parseImageEdit({ flip_h: true, crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.4 } }), { rotate: 0, flip_h: true, flip_v: false, crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.4 } });
  const edge = parseImageEdit({ crop: { x: 0.5, y: 0.5, width: 0.5, height: 0.5 } });
  assert.equal(edge.crop?.width, 0.5);
});

test('image edit rejects every unsafe or meaningless parameter set', () => {
  rejects(null, 'null');
  rejects([], 'array');
  rejects({}, 'no change');
  rejects({ rotate: 0, crop: null }, 'no change explicit');
  for (const rotate of [45, 360, -90, '90', 91]) rejects({ rotate, flip_h: true }, `rotate ${String(rotate)}`);
  rejects({ flip_h: 'yes' }, 'flip type');
  rejects({ flip_v: 1 }, 'flip number');
  rejects({ crop: 'all' }, 'crop string');
  rejects({ crop: { x: 0, y: 0, width: 1 } }, 'crop missing height');
  rejects({ crop: { x: -0.1, y: 0, width: 0.5, height: 0.5 } }, 'negative x');
  rejects({ crop: { x: 0.6, y: 0, width: 0.6, height: 0.5 } }, 'overflow right');
  rejects({ crop: { x: 0, y: 0.7, width: 0.5, height: 0.5 } }, 'overflow bottom');
  rejects({ crop: { x: 0, y: 0, width: 0.01, height: 0.5 } }, 'too thin');
  rejects({ crop: { x: 0, y: 0, width: Number.NaN, height: 0.5 } }, 'NaN');
  rejects({ crop: { x: 0, y: 0, width: Infinity, height: 0.5 } }, 'Infinity');
  rejects({ crop: { x: '0', y: 0, width: 0.5, height: 0.5 } }, 'string number');
});

test('crop rectangle always stays inside the picture and at least one pixel wide', () => {
  assert.deepEqual(cropRectangle(1000, 500, { x: 0.25, y: 0.5, width: 0.5, height: 0.5 }), { left: 250, top: 250, width: 500, height: 250 });
  const edge = cropRectangle(100, 100, { x: 0.999, y: 0.999, width: 0.02, height: 0.02 });
  assert.ok(edge.left + edge.width <= 100 && edge.top + edge.height <= 100 && edge.width >= 1 && edge.height >= 1);
});

test('applyImageEdit rotates, flips and crops into a NEW file and leaves the source untouched', async () => {
  const folder = await mkdtemp(path.join(tmpdir(), 'image-edit-'));
  try {
    // Ảnh 200x100: nửa trái đỏ, nửa phải xanh. Dùng để kiểm hướng lật.
    const left = await sharp({ create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } } }).png().toBuffer();
    const source = path.join(folder, 'source.webp');
    await sharp({ create: { width: 200, height: 100, channels: 3, background: { r: 0, g: 0, b: 255 } } }).composite([{ input: left, left: 0, top: 0 }]).webp({ lossless: true }).toFile(source);
    const before = await sharp(source).metadata();

    const turned = await applyImageEdit(source, path.join(folder, 'rotated.webp'), parseImageEdit({ rotate: 90 }));
    assert.deepEqual([turned.width, turned.height], [100, 200]);

    const cropped = await applyImageEdit(source, path.join(folder, 'cropped.webp'), parseImageEdit({ crop: { x: 0, y: 0, width: 0.5, height: 1 } }));
    assert.deepEqual([cropped.width, cropped.height], [100, 100]);
    const red = await sharp(path.join(folder, 'cropped.webp')).raw().toBuffer();
    assert.ok(red[0] > 240 && red[2] < 20, 'the kept half is the red half');

    const flipped = await applyImageEdit(source, path.join(folder, 'flipped.webp'), parseImageEdit({ flip_h: true, crop: { x: 0, y: 0, width: 0.5, height: 1 } }));
    assert.deepEqual([flipped.width, flipped.height], [100, 100]);
    const blue = await sharp(path.join(folder, 'flipped.webp')).raw().toBuffer();
    assert.ok(blue[2] > 240 && blue[0] < 20, 'after a horizontal flip the left half is blue');

    // Cắt tính trên ảnh đã xoay: xoay 90 độ thì ảnh cao 200, cắt nửa trên còn 100 x 100.
    const both = await applyImageEdit(source, path.join(folder, 'both.webp'), parseImageEdit({ rotate: 90, crop: { x: 0, y: 0, width: 1, height: 0.5 } }));
    assert.deepEqual([both.width, both.height], [100, 100]);

    const after = await sharp(source).metadata();
    assert.deepEqual([after.width, after.height], [before.width, before.height]);
  } finally { await rm(folder, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
});
