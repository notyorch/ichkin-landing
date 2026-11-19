import * as THREE from 'three';
import {
  C, f, mat, glow, box, rbox, cyl, sphere, room, windowPane, person, plant,
  canvasTex, panel, stdLights, span, roundRect, lerp,
} from './kit.js';

const NIGHT = new THREE.Color(0x1d2a4b);
const DAWN = new THREE.Color(0xf4a46d);
const MORNING = new THREE.Color(0xffe6b8);
const tmp = new THREE.Color();

function reportCard(w, h, big) {
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#111318';
    ctx.font = f('display', big ? 40 : 26);
    ctx.textBaseline = 'middle';
    ctx.fillText('reporte semanal', w * 0.07, h * 0.1);
    ctx.fillStyle = '#d66a45';
    ctx.beginPath();
    ctx.arc(w * (big ? 0.86 : 0.88), h * 0.11, big ? 7 : 5, 0, 7);
    ctx.fill();
    const hs = [0.25, 0.4, 0.32, 0.55, 0.7];
    hs.forEach((v, i) => {
      ctx.fillStyle = i === hs.length - 1 ? '#d66a45' : '#167a72';
      const bh = (h * 0.5 * v) / 0.7;
      roundRect(ctx, w * (0.08 + i * 0.17), h * 0.82 - bh, w * 0.12, bh, 8);
      ctx.fill();
    });
    ctx.fillStyle = '#89909a';
    ctx.font = f('sans', big ? 26 : 18);
    ctx.fillText('desde tu ERP', w * 0.07, h * 0.93);
  });
}

/** Automatización: a las 7:00 el reporte del ERP llega solo al celular. */
export function buildAutomatizacion() {
  const g = new THREE.Group();
  room(g, { floor: C.madera, wall: 0xdcd3c3 });
  const { hemi, dir } = stdLights(g, { sun: 0xffc9a0, sunI: 0.4, ambI: 0.5, amb: 0x93a2c4, pos: [9, 11, 8] });

  const win = windowPane(g, 3.8, 3.6, [2.6, 2.5, -4.92], { color: 0x1d2a4b, intensity: 1.0 });
  const win2 = windowPane(g, 2.6, 3.2, [-6.92, 2.6, 1.0], { rotY: Math.PI / 2, color: 0x1d2a4b, intensity: 0.9 });
  // materiales propios: el color del cielo cambia con el scroll
  win.glass.material = win.glass.material.clone();
  win2.glass.material = win.glass.material;

  // cortinas
  rbox(g, [0.7, 4.4, 0.25], [0.2, 1.4, -4.75], mat(C.cobre), 0.1);
  rbox(g, [0.7, 4.4, 0.25], [5.1, 1.4, -4.75], mat(C.cobre), 0.1);

  // cama
  rbox(g, [4.6, 0.8, 6.6], [-2.4, 0, -1.7], mat(C.maderaOscura), 0.12);
  rbox(g, [4.2, 0.55, 6.2], [-2.4, 0.8, -1.7], mat(C.marfil), 0.2);
  rbox(g, [4.8, 3.2, 0.3], [-2.4, 0, -4.85], mat(C.maderaOscura), 0.1);
  rbox(g, [2.6, 0.4, 1.3], [-2.4, 1.35, -4.1], mat(C.papel), 0.18);
  rbox(g, [4.25, 0.6, 3.6], [-2.4, 1.2, -0.1], mat(C.petroleo), 0.25);

  const sleeper = person({ shirt: C.cobre, pants: C.grafito, skin: C.piel3, hair: C.carbon, seated: true });
  sleeper.position.set(-2.4, 0.4, -3.2);
  g.add(sleeper);
  const sp = sleeper.userData.parts;

  // celular en mano
  const phone = new THREE.Group();
  sp.armR.add(phone);
  phone.position.set(0, -1.2, 0.08);
  rbox(phone, [0.42, 0.72, 0.05], [0, -0.36, 0], mat(C.carbon), 0.05);
  phone.rotation.x = 0.4;

  // clóset de noche y despertador
  rbox(g, [1.7, 1.6, 1.5], [0.5, 0, -4.0], mat(C.maderaOscura), 0.1);
  const clock = new THREE.Group();
  clock.position.set(0.5, 1.6, -4.0);
  g.add(clock);
  rbox(clock, [1.1, 0.7, 0.5], [0, 0, 0], mat(C.cobre), 0.14);
  panel(
    clock, 0.85, 0.42, [0, 0.38, 0.26],
    canvasTex(256, 128, (ctx, w, h) => {
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#3db3a6';
      ctx.font = f('display', 84);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText('7:00', w / 2, h / 2 + 4);
    }),
    { intensity: 1.0 },
  );

  // tapete, planta, cómoda
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.04, 40), mat(C.petroleoClaro));
  rug.position.set(3.2, 0.02, 2.4);
  rug.receiveShadow = true;
  g.add(rug);
  plant(g, [6.0, 0, -4.0], 1.2);
  rbox(g, [3.2, 2.0, 1.4], [3.2, 0, -4.0], mat(C.madera), 0.1);

  // nube ERP
  const cloud = new THREE.Group();
  cloud.position.set(4.6, 6.4, -2.6);
  g.add(cloud);
  sphere(cloud, 0.7, [0, 0, 0], glow(C.papel, 0.5), false);
  sphere(cloud, 0.55, [-0.8, -0.12, 0], glow(C.papel, 0.5), false);
  sphere(cloud, 0.55, [0.8, -0.12, 0], glow(C.papel, 0.5), false);
  const cloudLabel = panel(
    cloud, 1.3, 0.55, [0, -0.05, 0.75],
    canvasTex(260, 110, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#167a72';
      ctx.font = f('display', 78);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText('ERP', w / 2, h / 2 + 4);
    }),
    { transparent: true },
  );

  // tarjeta ampliada del reporte
  const card = new THREE.Group();
  card.position.set(2.6, 5.2, -0.2);
  card.rotation.y = 0.45;
  g.add(card);
  rbox(card, [2.5, 3.2, 0.12], [0, 0, 0], mat(C.carbon), 0.2);
  panel(card, 2.3, 3.0, [0, 1.6, 0.07], reportCard(520, 680, true), { intensity: 0.7 });
  card.scale.setScalar(0.01);

  // partículas de datos del ERP a la tarjeta
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(4.6, 6.0, -2.6),
    new THREE.Vector3(4.4, 5.4, -1.2),
    new THREE.Vector3(3.6, 5.0, -0.4),
    new THREE.Vector3(2.8, 5.0, -0.2),
  ]);
  const orbs = [0, 1, 2, 3].map(() => sphere(g, 0.11, [0, 0, 0], glow(C.cobre, 1.6), false));

  // zzz
  const zTex = canvasTex(128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#d6dcf0';
    ctx.font = f('display', 100);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('z', w / 2, h / 2);
  });
  const zs = [0, 1, 2].map(() => panel(g, 0.7, 0.7, [-2.4, 5, -3.2], zTex, { transparent: true, rotY: 0.5 }));

  return {
    group: g,
    update(t, p) {
      const wake = span(p, 0.12, 0.35);
      const dawn = span(p, 0, 0.35);
      const morning = span(p, 0.3, 0.7);
      tmp.copy(NIGHT).lerp(DAWN, dawn).lerp(MORNING, morning);
      win.glass.material.color.copy(tmp);
      win.glass.material.emissive.copy(tmp);
      hemi.intensity = lerp(0.5, 1.4, dawn);
      dir.intensity = lerp(0.4, 2.6, morning);
      dir.color.copy(tmp);

      // despierta
      sp.torso.rotation.x = lerp(0.35, 0.02, wake);
      sp.head.rotation.x = lerp(0.55, -0.06, wake);
      sp.armR.rotation.x = lerp(-0.2, -1.5, wake);
      sp.armL.rotation.x = lerp(-0.15, -0.3, wake);

      // despertador suena antes de que se despierte
      const ring = p < 0.2 ? Math.sin(t * 40) * 0.06 : 0;
      clock.rotation.z = ring;

      zs.forEach((z, i) => {
        const k = (t * 0.35 + i / 3) % 1;
        z.position.set(-2.4 + k * 0.9, 4.6 + k * 1.2, -3.0);
        z.material.opacity = Math.sin(k * Math.PI) * (1 - wake);
      });

      // el ERP envía el reporte
      const send = span(p, 0.38, 0.55);
      card.scale.setScalar(0.01 + 0.99 * span(p, 0.5, 0.75));
      card.position.y = 5.0 + Math.sin(t * 1.8) * 0.05;
      orbs.forEach((o, i) => {
        const on = p > 0.38 && p < 0.78;
        o.visible = on;
        const k = (t * 0.6 + i / orbs.length) % 1;
        o.position.copy(curve.getPoint(k));
      });
      cloudLabel.material.opacity = 1;
    },
  };
}
