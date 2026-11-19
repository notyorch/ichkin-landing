import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePath = new URL('../src/pages/index.astro', import.meta.url);

test('presents all declared Ichkin capability areas', async () => {
  const page = await readFile(pagePath, 'utf8');

  for (const area of ['Web', 'Sistemas', 'Datos', 'Inteligencia', 'Automatización', 'Colaboración']) {
    assert.match(page, new RegExp(`key: '${area}'`));
  }
});

test('keeps the diagnostic form honest until a contact channel exists', async () => {
  const page = await readFile(pagePath, 'utf8');

  assert.match(page, /Aún no envía ni almacena información/);
  assert.match(page, /Canal de contacto pendiente/);
  assert.doesNotMatch(page, /testimonio|clientes satisfechos|casos de éxito/i);
});

test('signs with the official wordmark and keeps the retired orbit out', async () => {
  const page = await readFile(pagePath, 'utf8');

  assert.match(page, /ichkin-wordmark\.svg/);
  assert.doesNotMatch(page, /SystemMap|OrbitMark|orbit-mark/);
});
