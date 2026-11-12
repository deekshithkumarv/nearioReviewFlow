import { test } from 'node:test';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import { qrMatrix } from '../lib/qr.js';

// Render the matrix to RGBA pixels with a quiet zone and decode it with an independent reader.
function decode(text) {
  const m = qrMatrix(text);
  assert.ok(m, 'encoder returned a matrix');
  const scale = 6, quiet = 4, n = m.length, size = (n + quiet * 2) * scale;
  const px = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!m[r][c]) continue;
    for (let y = 0; y < scale; y++) for (let x = 0; x < scale; x++) {
      const i = (((r + quiet) * scale + y) * size + (c + quiet) * scale + x) * 4;
      px[i] = px[i + 1] = px[i + 2] = 0;
    }
  }
  return jsQR(px, size, size)?.data;
}

test('QR codes decode back to the exact URL, across lengths and versions', () => {
  const base = 'https://nearioreviewflow.glcdemo.workers.dev/feedback/';
  for (const s of ['1', '12345', 'demo-cafe-1', 'x'.repeat(60), 'y'.repeat(78)]) {
    assert.equal(decode(base + s), base + s);
  }
});

test('text that is too long returns null instead of a broken code', () => {
  assert.equal(qrMatrix('a'.repeat(135)), null);
});
