import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/* Paleta ichkin + neutros cálidos de apoyo para las escenas */
export const C = {
  carbon: 0x111318,
  noche: 0x171a21,
  grafito: 0x252932,
  marfil: 0xf3f0e8,
  papel: 0xffffff,
  petroleo: 0x167a72,
  petroleoClaro: 0x3db3a6,
  cobre: 0xd66a45,
  cobreClaro: 0xe07b57,
  gris: 0x89909a,
  pizarra: 0x5b6573,
  linea: 0xd0cabb,
  madera: 0xc79d6d,
  maderaOscura: 0x8f6a47,
  pared: 0xe6dfcf,
  piso: 0xd8cfbb,
  piel1: 0xf0c4a0,
  piel2: 0xc98f66,
  piel3: 0x8d5a3b,
  cielo: 0xbfe3df,
};

export const font = {
  display: '600 {s}px "Bricolage Grotesque Variable", "Bricolage Grotesque", system-ui, sans-serif',
  sans: '500 {s}px Inter, system-ui, sans-serif',
};
export const f = (kind, size) => font[kind].replace('{s}', size);

const cache = new Map();
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!cache.has(key)) {
    cache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...opts }));
  }
  return cache.get(key);
}
export function glow(color, intensity = 1) {
  return mat(color, { emissive: color, emissiveIntensity: intensity, roughness: 1 });
}

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
/** Progreso local de a..b con salida suave (ease-out exponencial). */
export function span(p, a, b) {
  const t = clamp((p - a) / (b - a));
  return 1 - Math.pow(1 - t, 3);
}

function shadows(mesh, cast = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  return mesh;
}

/** Caja redondeada. pos = [x, yBase, z]. */
export function rbox(parent, size, pos, material, radius = 0.07, cast = true) {
  const [w, h, d] = size;
  const r = Math.min(radius, Math.min(w, h, d) / 2 - 0.001);
  const m = shadows(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.max(r, 0.001)), material), cast);
  m.position.set(pos[0], pos[1] + h / 2, pos[2]);
  parent.add(m);
  return m;
}

export function box(parent, size, pos, material, cast = true) {
  const m = shadows(new THREE.Mesh(new THREE.BoxGeometry(...size), material), cast);
  m.position.set(pos[0], pos[1] + size[1] / 2, pos[2]);
  parent.add(m);
  return m;
}

export function cyl(parent, r, h, pos, material, seg = 28, rTop = r) {
  const m = shadows(new THREE.Mesh(new THREE.CylinderGeometry(rTop, r, h, seg), material));
  m.position.set(pos[0], pos[1] + h / 2, pos[2]);
  parent.add(m);
  return m;
}

export function sphere(parent, r, pos, material, cast = true) {
  const m = shadows(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), material), cast);
  m.position.set(...pos);
  parent.add(m);
  return m;
}

/** Texturas de canvas: texto y pantallas dibujadas una sola vez. */
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function screenMat(tex, intensity = 0.85) {
  return new THREE.MeshStandardMaterial({
    map: tex,
    emissiveMap: tex,
    emissive: 0xffffff,
    emissiveIntensity: intensity,
    roughness: 1,
  });
}

/** Plano con textura (pantallas, carteles). Mira a +z; rota con rotY. */
export function panel(parent, w, h, pos, tex, { rotY = 0, rotX = 0, intensity = 0.85, transparent = false } = {}) {
  const material = transparent
    ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    : screenMat(tex, intensity);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  m.position.set(...pos);
  m.rotation.set(rotX, rotY, 0);
  parent.add(m);
  return m;
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Habitación tipo maqueta: piso, pared al fondo y pared izquierda. */
export function room(parent, { w = 14, d = 10, floor = C.piso, wall = C.pared, base = C.grafito, wallH = 7.5 } = {}) {
  box(parent, [w + 0.8, 0.8, d + 0.8], [0, -1.0, 0], mat(base), false);
  box(parent, [w, 0.2, d], [0, -0.2, 0], mat(floor), false);
  box(parent, [w, wallH, 0.4], [0, 0, -d / 2 - 0.2], mat(wall));
  box(parent, [0.4, wallH, d], [-w / 2 - 0.2, 0, 0], mat(wall));
  // zócalo
  box(parent, [w, 0.35, 0.14], [0, 0, -d / 2 + 0.07], mat(C.linea), false);
  box(parent, [0.14, 0.35, d], [-w / 2 + 0.07, 0, 0], mat(C.linea), false);
}

/** Ventana en pared de fondo (rotY=0) o pared izquierda (rotY=Math.PI/2). */
export function windowPane(parent, w, h, pos, { rotY = 0, color = C.cielo, intensity = 0.9, frame = C.papel } = {}) {
  const g = new THREE.Group();
  g.position.set(...pos);
  g.rotation.y = rotY;
  box(g, [w + 0.35, h + 0.35, 0.16], [0, -0.175, 0], mat(frame), false);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glow(color, intensity));
  glass.position.set(0, h / 2, 0.1);
  g.add(glass);
  box(g, [0.1, h, 0.08], [0, 0, 0.1], mat(frame), false);
  box(g, [w, 0.1, 0.08], [0, h / 2 - 0.05, 0.1], mat(frame), false);
  parent.add(g);
  return { group: g, glass };
}

/** Personaje de maqueta. Mira hacia +z; usa rotation.y para girarlo. */
export function person({ shirt = C.petroleo, pants = C.grafito, skin = C.piel1, hair = C.carbon, seated = false } = {}) {
  const g = new THREE.Group();
  const parts = {};
  const pelvis = seated ? 1.3 : 1.45;

  if (seated) {
    for (const s of [-1, 1]) {
      rbox(g, [0.42, 0.42, 1.05], [s * 0.27, pelvis - 0.42, 0.52], mat(pants), 0.15);
      rbox(g, [0.4, pelvis - 0.4, 0.4], [s * 0.27, 0, 1.0], mat(pants), 0.12);
      rbox(g, [0.46, 0.2, 0.66], [s * 0.27, 0, 1.12], mat(C.carbon), 0.1);
    }
  } else {
    for (const s of [-1, 1]) {
      rbox(g, [0.44, pelvis - 0.2, 0.44], [s * 0.27, 0.2, 0], mat(pants), 0.15);
      rbox(g, [0.48, 0.22, 0.7], [s * 0.27, 0, 0.1], mat(C.carbon), 0.1);
    }
  }

  const torso = new THREE.Group();
  torso.position.set(0, pelvis, 0);
  g.add(torso);
  rbox(torso, [1.1, 1.4, 0.62], [0, 0, 0], mat(shirt), 0.22);

  const head = new THREE.Group();
  head.position.set(0, 1.7, 0);
  torso.add(head);
  sphere(head, 0.46, [0, 0.46, 0], mat(skin));
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
    mat(hair),
  );
  cap.position.set(0, 0.52, -0.04);
  cap.castShadow = true;
  head.add(cap);
  for (const s of [-1, 1]) sphere(head, 0.055, [s * 0.17, 0.5, 0.43], mat(C.carbon), false);

  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(s * 0.72, 1.18, 0);
    torso.add(arm);
    rbox(arm, [0.3, 1.1, 0.3], [0, -1.05, 0], mat(shirt), 0.13);
    sphere(arm, 0.17, [0, -1.18, 0], mat(skin));
    parts[s < 0 ? 'armL' : 'armR'] = arm;
  }

  Object.assign(parts, { torso, head });
  g.userData.parts = parts;
  return g;
}

/** Silla simple (asiento + respaldo). Respaldo en -z. */
export function chair(parent, pos, rotY = 0, color = C.cobre) {
  const g = new THREE.Group();
  g.position.set(...pos);
  g.rotation.y = rotY;
  rbox(g, [1.5, 0.22, 1.5], [0, 1.0, 0], mat(color), 0.09);
  rbox(g, [1.5, 1.5, 0.2], [0, 1.2, -0.7], mat(color), 0.09);
  cyl(g, 0.09, 1.0, [0, 0, 0], mat(C.grafito), 10);
  cyl(g, 0.55, 0.1, [0, 0, 0], mat(C.grafito), 20);
  parent.add(g);
  return g;
}

/** Laptop de maqueta. Pantalla hacia +z; devuelve el mesh de pantalla. */
export function laptop(parent, pos, rotY, tex) {
  const g = new THREE.Group();
  g.position.set(...pos);
  g.rotation.y = rotY;
  rbox(g, [1.3, 0.08, 0.9], [0, 0, 0], mat(C.gris), 0.03);
  const lid = new THREE.Group();
  lid.position.set(0, 0.08, -0.42);
  lid.rotation.x = -0.28;
  g.add(lid);
  rbox(lid, [1.3, 0.85, 0.05], [0, 0, 0], mat(C.grafito), 0.03);
  let screen = null;
  if (tex) {
    screen = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.74), screenMat(tex, 0.9));
    screen.position.set(0, 0.43, 0.03);
    lid.add(screen);
  }
  parent.add(g);
  return { group: g, screen };
}

export function plant(parent, pos, scale = 1) {
  const g = new THREE.Group();
  g.position.set(...pos);
  g.scale.setScalar(scale);
  cyl(g, 0.5, 0.7, [0, 0, 0], mat(C.cobre), 18, 0.4);
  sphere(g, 0.55, [0, 1.1, 0], mat(C.petroleo));
  sphere(g, 0.42, [0.35, 1.55, 0.1], mat(C.petroleoClaro));
  sphere(g, 0.4, [-0.3, 1.5, -0.1], mat(C.petroleo));
  parent.add(g);
  return g;
}

/** Luces estándar de cada maqueta: ambiente, sol de ventana y sombras. */
export function stdLights(group, { sun = 0xfff1d6, sunI = 2.4, amb = 0xcfd8e6, ambI = 1.3, pos = [8, 14, 10] } = {}) {
  const hemi = new THREE.HemisphereLight(amb, 0x4a4338, ambI);
  group.add(hemi);
  const dir = new THREE.DirectionalLight(sun, sunI);
  dir.position.set(...pos);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  const s = 13;
  Object.assign(dir.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 50 });
  dir.shadow.bias = -0.0006;
  dir.shadow.normalBias = 0.04;
  group.add(dir);
  return { hemi, dir };
}

export function pointLamp(group, color, intensity, pos, distance = 18) {
  const l = new THREE.PointLight(color, intensity, distance, 1.6);
  l.position.set(...pos);
  group.add(l);
  return l;
}

/** Burbuja de chat como textura (se dibuja una vez). */
export function bubbleTex(text, { bg = '#ffffff', fg = '#111318', w = 560, h = 190, tail = 'left' } = {}) {
  return canvasTex(w, h, (ctx) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bg;
    roundRect(ctx, 8, 8, w - 16, h - 40, 34);
    ctx.fill();
    ctx.beginPath();
    const tx = tail === 'left' ? 70 : w - 70;
    ctx.moveTo(tx - 22, h - 34);
    ctx.lineTo(tx + 12, h - 34);
    ctx.lineTo(tx + (tail === 'left' ? -8 : 8), h - 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.font = f('sans', 34);
    ctx.textBaseline = 'middle';
    const words = text.split(' ');
    const lines = [''];
    for (const word of words) {
      const test = `${lines[lines.length - 1]} ${word}`.trim();
      if (ctx.measureText(test).width > w - 80) lines.push(word);
      else lines[lines.length - 1] = test;
    }
    const lh = 44;
    const top = (h - 40) / 2 - ((lines.length - 1) * lh) / 2 + 8;
    lines.forEach((ln, i) => ctx.fillText(ln, 40, top + i * lh));
  });
}
