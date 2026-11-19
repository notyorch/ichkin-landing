import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePath = new URL('../src/pages/index.astro', import.meta.url);
// el contenido del inicio vive en la página, los datos compartidos y el encabezado
const sitePaths = [
  pagePath,
  new URL('../src/data/services.js', import.meta.url),
  new URL('../src/components/Header.astro', import.meta.url),
];
const readSite = async () => (await Promise.all(sitePaths.map((u) => readFile(u, 'utf8')))).join('\n');

test('presents all declared Ichkin capability areas', async () => {
  const page = await readSite();

  for (const area of ['Web', 'Sistemas', 'Datos', 'Inteligencia', 'Automatización', 'Colaboración']) {
    assert.match(page, new RegExp(`key: '${area}'`));
  }
});

test('keeps the contact form honest until an endpoint exists', async () => {
  const page = await readSite();

  // sin destino configurado no finge éxito: avisa que aún no puede recibir mensajes
  assert.match(page, /data-endpoint=""/);
  assert.match(page, /Todavía no podemos recibir mensajes/);
  assert.match(page, /if \(!endpoint\)/);
  assert.doesNotMatch(page, /testimonio|clientes satisfechos|casos de éxito/i);
});

test('form speaks plain language and does not gate on a company email', async () => {
  const page = await readSite();

  assert.match(page, /Responder dudas con tus documentos \(RAG\)/);
  // basta correo o WhatsApp: pocos campos obligatorios convierten mejor en pymes
  assert.match(page, /WhatsApp o teléfono/);
  assert.match(page, /Déjanos al menos uno/);
  assert.match(page, /email\.required = missing/);
  for (const area of ['Web', 'Sistemas', 'Datos', 'Inteligencia', 'Automatización', 'Colaboración']) {
    assert.match(page, new RegExp(`label: '${area}', prompt:.*solves:`));
  }
  assert.match(page, /nombre@empresa\.com/);
  assert.doesNotMatch(page, /Correo de empresa|Canal de contacto pendiente/);
  assert.match(page, /Iniciar conversación/);
  assert.match(page, /quien construye la solución/);
});

test('signs with the official wordmark and keeps the retired orbit out', async () => {
  const page = await readSite();

  assert.match(page, /ichkin-wordmark\.svg/);
  assert.doesNotMatch(page, /SystemMap|OrbitMark|orbit-mark/);
});

test('invites with "Hablemos" and links every call to action to the form', async () => {
  const page = await readSite();

  assert.doesNotMatch(page, /Solicitar (un )?diagnóstico/);
  assert.match(page, /Hablemos/);
  assert.match(page, /Sin compromiso/);
  assert.match(page, /id="hablemos"/);
  assert.doesNotMatch(page, /href="#diagnostico"/);
});

test('footer repeats the wordmark and links the privacy notice, which exists', async () => {
  const footer = await readFile(new URL('../src/components/Footer.astro', import.meta.url), 'utf8');
  const privacy = await readFile(new URL('../src/pages/aviso-de-privacidad.astro', import.meta.url), 'utf8');

  assert.match(footer, /ichkin-wordmark-inverso\.svg/);
  assert.match(footer, /\/aviso-de-privacidad\//);
  assert.match(privacy, /Aviso de privacidad/);
  assert.match(privacy, /no envía ni almacena información/);
});

test('offers a way to skip the pinned 3D section', async () => {
  const page = await readSite();

  assert.match(page, /data-skip/);
  assert.match(page, /href="#metodo"/);
});

test('contact form collects the fields the CRM needs, with preset options per area', async () => {
  const page = await readSite();

  for (const name of ['area', 'need', 'message', 'name', 'email', 'phone']) {
    assert.match(page, new RegExp(`name="${name}"`));
  }
  assert.match(page, /Nombre completo/);
  assert.match(page, /Describe lo que necesitas/);
  for (const option of ['Tienda en línea (ecommerce)', 'Sitio web', 'Portafolio', 'Otro']) {
    assert.ok(page.includes(`'${option}'`), `falta la opción ${option}`);
  }
  assert.match(page, /name="website"/); // señuelo anti-bots
});

test('positions ichkin as an open-source implementer, not as its own platform', async () => {
  const page = await readSite();

  assert.match(page, /código abierto/);
  assert.match(page, /ERP, CRM y procesos de código abierto/);
  assert.match(page, /A medida, solo cuando hace falta/);
  assert.match(page, /Desarrollo a medida, solo cuando hace falta/);
  assert.doesNotMatch(page, /Un sistema que organiza|Con ichkin: un sistema/);
});

test('site menu links home, services and about, and both pages exist', async () => {
  const header = await readFile(new URL('../src/components/Header.astro', import.meta.url), 'utf8');
  const servicios = await readFile(new URL('../src/pages/servicios.astro', import.meta.url), 'utf8');
  const nosotros = await readFile(new URL('../src/pages/nosotros.astro', import.meta.url), 'utf8');

  for (const [label, href] of [['Inicio', '/'], ['Servicios', '/servicios/'], ['Nosotros', '/nosotros/']]) {
    assert.ok(header.includes(`label: '${label}', href: '${href}'`), `falta ${label} en el menú`);
  }
  assert.doesNotMatch(header, />Home</);
  assert.match(header, /aria-expanded/); // menú móvil accesible
  assert.match(servicios, /Header current="servicios"/);
  assert.match(nosotros, /Header current="nosotros"/);
  assert.doesNotMatch(nosotros, /años de experiencia|clientes satisfechos|casos de éxito/i);
});

test('page changes animate natively and respect reduced motion', async () => {
  const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');

  assert.match(css, /@view-transition \{ navigation: auto; \}/);
  assert.match(css, /view-transition-name: site-header/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{ @view-transition \{ navigation: none; \} \}/);
});
