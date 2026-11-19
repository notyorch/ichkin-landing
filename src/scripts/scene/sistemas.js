import * as THREE from 'three';
import {
  C, f, mat, glow, box, rbox, cyl, sphere, room, windowPane, person, chair, laptop, plant,
  canvasTex, panel, stdLights, pointLamp, span, roundRect, clamp, lerp,
} from './kit.js';

const COLS = ['Cuenta', 'Concepto', 'Debe', 'Haber', 'Saldo'];
const ROWS = ['Ventas', 'Compras', 'Nómina', 'Bancos', 'Impuestos', 'Clientes', 'Proveedores', 'Inventario'];

function ledger(w, h, small = false) {
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#f7f5ef';
    ctx.fillRect(0, 0, w, h);
    const top = h * 0.17;
    ctx.fillStyle = '#167a72';
    ctx.fillRect(0, 0, w, top);
    ctx.fillStyle = '#ffffff';
    ctx.font = f('display', small ? 28 : 46);
    ctx.textBaseline = 'middle';
    ctx.fillText('libro contable', w * 0.03, top / 2);
    ctx.fillStyle = '#d66a45';
    ctx.beginPath();
    ctx.arc(w * (small ? 0.5 : 0.36), top / 2 + 4, small ? 4 : 7, 0, 7);
    ctx.fill();
    const rh = (h - top) / (ROWS.length + 1);
    ctx.font = f('sans', small ? 18 : 30);
    ctx.fillStyle = '#5b6573';
    COLS.forEach((c, i) => ctx.fillText(c, w * 0.03 + (i * w * 0.94) / 5, top + rh / 2));
    ROWS.forEach((r, ri) => {
      const y = top + rh * (ri + 1);
      ctx.fillStyle = ri % 2 ? '#f0ede4' : '#f7f5ef';
      ctx.fillRect(0, y, w, rh);
      ctx.fillStyle = '#111318';
      ctx.fillText(r, w * 0.03, y + rh / 2);
      ctx.fillStyle = '#c9c4b5';
      for (let c = 1; c < 5; c++) {
        roundRect(ctx, w * 0.03 + (c * w * 0.94) / 5, y + rh * 0.32, w * 0.12, rh * 0.36, 6);
        ctx.fill();
      }
    });
  });
}

/** Sistemas: un equipo trabaja el mismo ERP al mismo tiempo, cada quien con su cursor. */
export function buildSistemas() {
  const g = new THREE.Group();
  room(g, { floor: 0xd2ccbb, wall: 0xe9e4d6 });
  stdLights(g, { sunI: 2.2, ambI: 1.35 });

  windowPane(g, 3.4, 3.4, [-6.92, 2.6, -1.6], { rotY: Math.PI / 2 });
  windowPane(g, 3.4, 3.4, [-6.92, 2.6, 2.2], { rotY: Math.PI / 2 });

  // pantalla grande del ERP
  const W = 8;
  const H = 4.1;
  const wallY = 2.45;
  rbox(g, [W + 0.5, H + 0.5, 0.2], [0.3, wallY - 0.25, -4.85], mat(C.carbon), 0.1);
  panel(g, W, H, [0.3, wallY + H / 2, -4.72], ledger(1400, 718), { intensity: 0.75 });
  const px = (u) => 0.3 - W / 2 + u * W; // u 0..1 -> x
  const py = (v) => wallY + H - v * H; // v 0..1 (desde arriba) -> y
  const rowH = (H * (1 - 0.17)) / (ROWS.length + 1);

  // cursores y celdas resaltadas
  const palette = [C.petroleo, C.cobre, C.carbon, C.petroleoClaro];
  const cursors = palette.map((color, i) => {
    const hl = new THREE.Mesh(
      new THREE.PlaneGeometry((W * 0.94) / 5, rowH * 0.95),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28, depthWrite: false }),
    );
    hl.position.z = -4.7;
    g.add(hl);
    const cur = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.34, 3), glow(color, 0.4));
    cur.rotation.z = 0.5;
    cur.position.z = -4.62;
    g.add(cur);
    return { hl, cur, target: new THREE.Vector2(), at: new THREE.Vector2(px(0.5), py(0.5)) };
  });

  // barra de avance sincronizado
  box(g, [W * 0.94, 0.14, 0.05], [0.3, wallY - 0.75, -4.6], mat(0x2b3039), false);
  const fill = new THREE.Mesh(new THREE.BoxGeometry(W * 0.94, 0.14, 0.06), glow(C.petroleoClaro, 0.7));
  fill.position.set((W * 0.94) / 2, wallY - 0.68, -4.58);
  const fillWrap = new THREE.Group();
  fillWrap.position.set(0.3 - (W * 0.94) / 2, 0, 0);
  fillWrap.add(fill);
  g.add(fillWrap);

  // mesa larga compartida
  const TY = 1.8;
  rbox(g, [9.4, 0.2, 3.5], [0.3, TY, 1.0], mat(C.papel), 0.08);
  for (const sx of [-4.2, 4.8]) for (const sz of [-0.4, 2.4]) cyl(g, 0.12, TY, [sx, 0, sz], mat(C.grafito), 10);

  const shirts = [C.petroleo, C.cobre, C.carbon, C.petroleoClaro];
  const skins = [C.piel1, C.piel3, C.piel2, C.piel1];
  const hairs = [C.carbon, 0x4a3426, 0xb0aaa0, 0x2a2018];
  const seats = [
    { x: -2.2, z: 3.7, rot: Math.PI },
    { x: 2.8, z: 3.7, rot: Math.PI },
    { x: -2.2, z: -1.7, rot: 0 },
    { x: 2.8, z: -1.7, rot: 0 },
  ];
  const team = seats.map((s, i) => {
    chair(g, [s.x, 0, s.z], s.rot, i % 2 ? C.petroleo : C.grafito);
    const pr = person({ shirt: shirts[i], skin: skins[i], hair: hairs[i], seated: true });
    pr.position.set(s.x, 0, s.z);
    pr.rotation.y = s.rot;
    g.add(pr);
    const near = s.rot !== 0;
    laptop(g, [s.x, 2.0, near ? 1.65 : 0.35], near ? 0 : Math.PI, near ? ledger(360, 230, true) : null);
    return pr.userData.parts;
  });

  // luces de techo
  for (const x of [-2.5, 3]) {
    box(g, [3, 0.12, 0.9], [x, 6.0, 1.0], glow(0xfff4dc, 1.3), false);
    cyl(g, 0.03, 1.4, [x, 6.1, 1.0], mat(C.carbon), 6);
  }
  pointLamp(g, 0xffe6bd, 45, [0.3, 5.0, 1.2]);

  // detalles
  plant(g, [-6.0, 0, -4.0], 1.15);
  plant(g, [6.2, 0, 3.8], 1.0);
  rbox(g, [2.4, 3.0, 1.0], [5.4, 0, -4.2], mat(C.maderaOscura), 0.1);

  return {
    group: g,
    update(t, p) {
      cursors.forEach((c, i) => {
        const step = Math.floor(t * 0.55 + i * 1.7);
        const col = (step * 3 + i * 2) % 5;
        const row = (step * 5 + i * 3) % ROWS.length;
        c.target.set(px(0.03 + ((col + 0.5) * 0.94) / 5), py(0.17 + ((row + 1.5) * (1 - 0.17)) / (ROWS.length + 1)));
        c.at.lerp(c.target, 0.08);
        c.hl.position.set(c.at.x + 0.35, c.at.y, -4.7);
        c.cur.position.set(c.at.x + 0.6, c.at.y - 0.12, -4.62);
      });
      fillWrap.scale.x = Math.max(0.001, span(p, 0.05, 0.85));
      team.forEach((tm, i) => {
        const s = Math.sin(t * (6 + i) + i * 2);
        tm.armL.rotation.x = -1.15 + (s > 0 ? 0.08 : 0);
        tm.armR.rotation.x = -1.15 + (s > 0.3 ? 0 : 0.08);
        tm.head.rotation.x = 0.05 + Math.sin(t * 0.8 + i) * 0.03;
        tm.torso.rotation.x = 0.08;
      });
    },
  };
}
