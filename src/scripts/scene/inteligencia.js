import * as THREE from 'three';
import {
  C, f, mat, glow, box, rbox, cyl, sphere, room, windowPane, person, chair, laptop, plant,
  canvasTex, panel, bubbleTex, stdLights, pointLamp, span, roundRect, lerp,
} from './kit.js';

/** Inteligencia: un agente de IA atiende a un cliente y apoya a una persona del equipo. */
export function buildInteligencia() {
  const g = new THREE.Group();
  room(g, { floor: 0xd2ccbb, wall: 0xe4e0d3 });
  stdLights(g, { sunI: 2.0, ambI: 1.35 });
  pointLamp(g, 0x9fe8dd, 35, [0, 4.6, 1.6], 16);

  windowPane(g, 3, 3, [-3.8, 2.7, -4.92]);
  windowPane(g, 3, 3, [3.8, 2.7, -4.92]);
  panel(
    g, 3.2, 0.9, [0, 5.0, -4.93],
    canvasTex(640, 180, (ctx, w, h) => {
      ctx.fillStyle = '#111318';
      roundRect(ctx, 0, 0, w, h, 24);
      ctx.fill();
      ctx.fillStyle = '#f3f0e8';
      ctx.font = f('display', 62);
      ctx.textBaseline = 'middle';
      ctx.fillText('atención', 44, 92);
      ctx.fillStyle = '#d66a45';
      ctx.beginPath();
      ctx.arc(318, 108, 8, 0, 7);
      ctx.fill();
    }),
    { intensity: 0.4 },
  );

  // agente de IA
  const bot = new THREE.Group();
  bot.position.set(0, 0, -0.4);
  g.add(bot);
  cyl(g, 1.3, 0.35, [0, 0, -0.4], mat(C.grafito), 36);
  rbox(bot, [2.3, 2.5, 1.7], [0, 1.0, 0], mat(C.petroleo), 0.4);
  rbox(bot, [1.8, 1.2, 0.12], [0, 1.65, 0.86], mat(0x0f1217), 0.2);
  const eyes = [-0.38, 0.38].map((x) => {
    const e = sphere(bot, 0.17, [x, 2.35, 0.95], glow(C.petroleoClaro, 1.6), false);
    e.scale.set(1, 1.35, 0.4);
    return e;
  });
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.045, 8, 24, Math.PI), glow(C.petroleoClaro, 1.4));
  smile.position.set(0, 2.05, 0.95);
  smile.rotation.z = Math.PI;
  bot.add(smile);
  cyl(bot, 0.05, 0.55, [0, 3.5, 0], mat(C.carbon), 8);
  const bulb = sphere(bot, 0.16, [0, 4.15, 0], glow(C.cobre, 1.6), false);
  for (const s of [-1, 1]) {
    rbox(bot, [0.3, 1.0, 0.4], [s * 1.4, 1.5, 0], mat(C.petroleo), 0.12);
  }

  // cliente
  const customer = person({ shirt: C.cobre, pants: C.grafito, skin: C.piel2, hair: 0x2a2018 });
  customer.position.set(-4.0, 0, 1.4);
  customer.rotation.y = Math.PI / 2 - 0.1;
  g.add(customer);
  const cu = customer.userData.parts;
  rbox(g, [0.4, 0.8, 0.06], [-3.4, 1.9, 1.7], mat(C.carbon), 0.05); // celular

  // persona del equipo con laptop
  rbox(g, [2.4, 0.2, 3.2], [3.5, 1.8, 0.7], mat(C.papel), 0.08);
  cyl(g, 0.12, 1.8, [4.4, 0, 0.7], mat(C.grafito), 10);
  chair(g, [5.4, 0, 0.7], -Math.PI / 2, C.petroleo);
  const worker = person({ shirt: C.carbon, pants: C.grafito, skin: C.piel1, hair: 0x4a3426, seated: true });
  worker.position.set(5.4, 0, 0.7);
  worker.rotation.y = -Math.PI / 2;
  g.add(worker);
  const wk = worker.userData.parts;
  laptop(
    g, [3.4, 2.0, 0.7], Math.PI / 2,
    canvasTex(360, 230, (ctx, w, h) => {
      ctx.fillStyle = '#f7f5ef';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#167a72';
      ctx.fillRect(0, 0, w, 40);
      ctx.fillStyle = '#c9c4b5';
      for (let i = 0; i < 4; i++) {
        roundRect(ctx, 20, 64 + i * 36, 300 - i * 40, 16, 8);
        ctx.fill();
      }
    }),
  );

  plant(g, [-6.0, 0, -4.0], 1.15);
  plant(g, [6.2, 0, -4.0], 1.0);

  // burbujas de chat
  const bubbleSpecs = [
    { text: '¿Dónde está mi pedido?', pos: [-4.3, 5.3, 1.4], bg: '#ffffff', fg: '#111318', at: 0.1 },
    { text: 'Sale hoy y llega mañana. Te aviso por mensaje.', pos: [-2.3, 6.4, 0.2], bg: '#167a72', fg: '#ffffff', at: 0.3 },
    { text: '¿Qué política de garantía aplica?', pos: [4.6, 5.3, 0.6], bg: '#ffffff', fg: '#111318', at: 0.52 },
    { text: '30 días con factura. Te dejo el documento.', pos: [2.3, 6.4, 0.2], bg: '#167a72', fg: '#ffffff', at: 0.74 },
  ];
  const bubbles = bubbleSpecs.map((b) => {
    const m = panel(g, 3.3, 1.12, b.pos, bubbleTex(b.text, { bg: b.bg, fg: b.fg }), { transparent: true, rotY: 0.5 });
    m.material.opacity = 0;
    return { m, ...b };
  });

  return {
    group: g,
    update(t, p) {
      bot.position.y = 0.15 + Math.sin(t * 1.6) * 0.12;
      bulb.material.emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.5;
      const blink = Math.sin(t * 0.9) > 0.97 ? 0.1 : 1.35;
      eyes.forEach((e) => (e.scale.y = blink));
      bubbles.forEach((b) => {
        const k = span(p, b.at, b.at + 0.1);
        b.m.material.opacity = k;
        b.m.scale.setScalar(0.92 + 0.08 * k);
        b.m.position.y = b.pos[1] - (1 - k) * 0.3 + Math.sin(t * 1.4 + b.at * 10) * 0.04;
      });
      const talkC = p > 0.1 && p < 0.3;
      cu.armR.rotation.x = -1.2;
      cu.head.rotation.y = Math.sin(t * 0.8) * 0.1;
      cu.torso.rotation.x = talkC ? 0.04 : 0;
      wk.armL.rotation.x = -1.15;
      wk.armR.rotation.x = -1.15 + (Math.sin(t * 7) > 0 ? 0.06 : 0);
      wk.head.rotation.x = 0.05;
    },
  };
}
