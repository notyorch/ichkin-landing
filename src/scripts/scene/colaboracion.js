import * as THREE from 'three';
import {
  C, f, mat, glow, box, rbox, cyl, sphere, room, windowPane, person, chair, plant,
  canvasTex, panel, stdLights, pointLamp, span, roundRect, lerp,
} from './kit.js';

function nameTag(name, color) {
  return canvasTex(256, 96, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    roundRect(ctx, 0, 8, w, 64, 32);
    ctx.fill();
    ctx.fillStyle = color === '#111318' ? '#f3f0e8' : '#ffffff';
    ctx.font = f('sans', 36);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(name, w / 2, 42);
  });
}

/** Colaboración: un equipo de diseño gráfico edita el mismo lienzo a la vez. */
export function buildColaboracion() {
  const g = new THREE.Group();
  room(g, { floor: 0xd9d1be, wall: 0xede8db });
  stdLights(g, { sunI: 2.1, ambI: 1.4 });
  pointLamp(g, 0xffd9a8, 45, [1.0, 5.0, 1.5], 18);

  windowPane(g, 3.0, 3.2, [-6.92, 2.6, 1.8], { rotY: Math.PI / 2 });

  // lienzo compartido
  const W = 8;
  const H = 4.4;
  const baseY = 2.0;
  rbox(g, [W + 0.5, H + 0.5, 0.2], [0.4, baseY - 0.25, -4.85], mat(C.carbon), 0.1);
  panel(
    g, W, H, [0.4, baseY + H / 2, -4.72],
    canvasTex(1400, 770, (ctx, w, h) => {
      ctx.fillStyle = '#1b2028';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2d3440';
      for (let x = 40; x < w; x += 40) for (let y = 40; y < h; y += 40) ctx.fillRect(x, y, 3, 3);
      ctx.fillStyle = '#f7f5ef';
      roundRect(ctx, 220, 90, 960, 590, 24);
      ctx.fill();
      ctx.fillStyle = '#89909a';
      ctx.font = f('sans', 28);
      ctx.fillText('lienzo · en vivo', 240, 66);
      ctx.fillStyle = '#c9c4b5';
      roundRect(ctx, 260, 560, 500, 20, 10);
      ctx.fill();
      roundRect(ctx, 260, 600, 360, 20, 10);
      ctx.fill();
    }),
    { intensity: 0.75 },
  );
  const ux = (u) => 0.4 - W / 2 + u * W;
  const uy = (v) => baseY + H - v * H;

  // piezas del diseño
  const circle = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 40), glow(C.petroleo, 0.5));
  circle.rotation.x = Math.PI / 2;
  const square = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.1), glow(C.cobre, 0.5));
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.28, 0.1), glow(C.carbon, 0.2));
  const tri = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.1, 3), glow(C.petroleoClaro, 0.5));
  tri.rotation.x = Math.PI / 2;
  [circle, square, bar, tri].forEach((m) => {
    m.position.z = -4.6;
    g.add(m);
  });

  // cursores con nombre
  const who = [
    { name: 'Ana', color: '#167a72', hex: C.petroleo },
    { name: 'Luis', color: '#d66a45', hex: C.cobre },
    { name: 'Mar', color: '#111318', hex: C.carbon },
  ];
  const cursors = who.map((w) => {
    const grp = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.38, 3), glow(w.hex, 0.4));
    cone.rotation.z = 0.5;
    grp.add(cone);
    panel(grp, 0.95, 0.36, [0.55, -0.3, 0], nameTag(w.name, w.color), { transparent: true });
    grp.position.z = -4.5;
    g.add(grp);
    return grp;
  });

  // moodboard en pared izquierda
  const tiles = [
    [C.petroleo, 1.3, 1.6], [C.cobre, 1.0, 1.0], [C.marfil, 1.4, 1.0],
    [C.carbon, 1.0, 1.5], [C.petroleoClaro, 1.4, 1.1], [C.linea, 1.0, 1.0],
  ];
  tiles.forEach(([color, w, h], i) => {
    const m = rbox(g, [0.08, h, w], [-6.88, 1.8 + (i % 2) * 1.5 + (i > 3 ? 0.3 : 0), -3.6 + i * 1.0 - (i > 2 ? 0.5 : 0)], mat(color), 0.03, false);
    m.position.z = -4.0 + (i % 3) * 1.45;
    m.position.y = 2.3 + Math.floor(i / 3) * 1.9;
  });

  // mesa de trabajo
  rbox(g, [7.4, 0.2, 3.2], [1.0, 1.8, 1.4], mat(C.papel), 0.08);
  for (const sx of [-2.4, 4.4]) for (const sz of [0.2, 2.6]) cyl(g, 0.12, 1.8, [sx, 0, sz], mat(C.grafito), 10);
  // muestras de color y tabletas
  [C.petroleo, C.cobre, C.carbon, C.petroleoClaro, C.linea].forEach((c, i) => rbox(g, [0.5, 0.06, 0.8], [-1.4 + i * 0.6, 2.0, 0.4], mat(c), 0.03, false));
  [[-0.4, 2.0], [3.2, 2.0]].forEach(([x, y], i) => {
    const m = rbox(g, [1.5, 0.06, 1.0], [x, y, 1.9], mat(C.grafito), 0.04);
    m.rotation.y = i ? -0.2 : 0.15;
  });

  // equipo
  const crew = [
    { x: -0.4, z: 3.6, rot: Math.PI, shirt: C.petroleo, skin: C.piel1, hair: 0x4a3426, seated: true },
    { x: 3.2, z: 3.6, rot: Math.PI, shirt: C.cobre, skin: C.piel3, hair: C.carbon, seated: true },
  ].map((c) => {
    chair(g, [c.x, 0, c.z], c.rot, c.seated && c.shirt === C.cobre ? C.petroleo : C.grafito);
    const pr = person({ shirt: c.shirt, skin: c.skin, hair: c.hair, seated: true });
    pr.position.set(c.x, 0, c.z);
    pr.rotation.y = c.rot;
    g.add(pr);
    return pr.userData.parts;
  });
  const lead = person({ shirt: C.carbon, pants: C.grafito, skin: C.piel2, hair: 0x2a2018 });
  lead.position.set(-3.2, 0, -2.4);
  lead.rotation.y = Math.PI - 0.5;
  g.add(lead);
  const lp = lead.userData.parts;

  // notas adhesivas y lámparas
  [[C.cobre, 5.2, 3.8], [C.petroleoClaro, 5.9, 4.4], [C.marfil, 5.4, 5.0], [C.cobre, 6.0, 3.3]].forEach(([c, x, y], i) =>
    rbox(g, [0.62, 0.62, 0.05], [x, y, -4.8], mat(c), 0.03, false).rotateZ(0.1 * (i - 1.5)),
  );
  for (const x of [-1.0, 3.0]) {
    cyl(g, 0.03, 1.0, [x, 6.5, 2.6], mat(C.carbon), 6);
    sphere(g, 0.34, [x, 6.3, 2.6], glow(C.cobreClaro, 1.5), false);
  }
  plant(g, [6.2, 0, -3.6], 1.2);
  plant(g, [-6.0, 0, 4.0], 1.0);

  const paths = [
    { cx: 0.35, cy: 0.5, rx: 0.2, ry: 0.22, a: 0.9, b: 1.3, ph: 0 },
    { cx: 0.55, cy: 0.45, rx: 0.2, ry: 0.2, a: 0.7, b: 1.1, ph: 2 },
    { cx: 0.45, cy: 0.6, rx: 0.2, ry: 0.15, a: 1.1, b: 0.8, ph: 4 },
  ];

  return {
    group: g,
    update(t, p) {
      const k = span(p, 0, 0.8);
      const mv = (i, a, b, c) => {
        const pa = paths[i];
        const u = pa.cx + Math.sin(t * pa.a + pa.ph) * pa.rx;
        const v = pa.cy + Math.cos(t * pa.b + pa.ph) * pa.ry;
        cursors[i].position.set(ux(u) - 0.1, uy(v), -4.5);
        return [ux(u) + 0.35, uy(v) - 0.2];
      };
      const c0 = mv(0);
      const c1 = mv(1);
      const c2 = mv(2);
      // cada pieza sigue a su cursor y, con el scroll, se acomoda en la composición final
      circle.position.set(lerp(c0[0] - 1.6, ux(0.3), k), lerp(c0[1], uy(0.4), k), -4.6);
      square.position.set(lerp(c1[0] + 1.2, ux(0.6), k), lerp(c1[1], uy(0.42), k), -4.6);
      square.rotation.z = (1 - k) * Math.sin(t) * 0.3;
      tri.position.set(lerp(c2[0], ux(0.46), k), lerp(c2[1] + 0.8, uy(0.28), k), -4.6);
      bar.position.set(ux(0.45), uy(0.62), -4.6);

      crew.forEach((c, i) => {
        c.armL.rotation.x = -1.1 + Math.sin(t * 3 + i) * 0.1;
        c.armR.rotation.x = -1.1 + Math.sin(t * 4 + i * 2) * 0.12;
        c.head.rotation.x = 0.1;
        c.torso.rotation.x = 0.08;
      });
      lp.armR.rotation.x = -1.7 + Math.sin(t * 1.5) * 0.08;
      lp.armR.rotation.z = -0.2;
      lp.head.rotation.y = -0.2 + Math.sin(t * 0.6) * 0.1;
    },
  };
}
