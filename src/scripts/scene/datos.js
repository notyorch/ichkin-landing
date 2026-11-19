import * as THREE from 'three';
import {
  C, f, mat, glow, box, rbox, cyl, sphere, room, windowPane, person, chair, plant,
  canvasTex, panel, stdLights, pointLamp, span, roundRect, lerp,
} from './kit.js';

function growBar(parent, x, z, w, hMax, material) {
  const wrap = new THREE.Group();
  wrap.position.set(x, 0, z);
  rbox(wrap, [w, hMax, 0.4], [0, 0, 0], material, 0.06, false);
  wrap.scale.y = 0.001;
  parent.add(wrap);
  return wrap;
}

/** Datos: el CEO ve en un panel de BI hacia dónde conviene mover la empresa. */
export function buildDatos() {
  const g = new THREE.Group();
  room(g, { floor: 0xcbc5b4, wall: 0x2a2f3a });
  stdLights(g, { sunI: 1.1, ambI: 1.0, amb: 0xaab6cc });
  pointLamp(g, 0x7fe0d3, 30, [0, 4.0, -2.4], 16);
  pointLamp(g, 0xffd7a8, 40, [-1.5, 6.2, 1.4], 16);

  windowPane(g, 3, 2.6, [-6.92, 3.0, 1.4], { rotY: Math.PI / 2, color: 0x3a4a66, intensity: 0.6, frame: C.grafito });

  // pantalla BI
  const SW = 10;
  const SH = 5.2;
  const baseY = 1.7;
  rbox(g, [SW + 0.5, SH + 0.5, 0.22], [0, baseY - 0.25, -4.85], mat(C.carbon), 0.12);
  panel(
    g, SW, SH, [0, baseY + SH / 2, -4.72],
    canvasTex(1500, 780, (ctx, w, h) => {
      ctx.fillStyle = '#0f1217';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f3f0e8';
      ctx.font = f('display', 52);
      ctx.textBaseline = 'middle';
      ctx.fillText('panel de dirección', 60, 70);
      ctx.fillStyle = '#d66a45';
      ctx.beginPath();
      ctx.arc(560, 84, 8, 0, 7);
      ctx.fill();
      const kpis = [['Ingresos', '▲', '#3db3a6'], ['Margen', '▲', '#3db3a6'], ['Costos', '▼', '#3db3a6']];
      kpis.forEach(([label, arrow, color], i) => {
        const x = 60 + i * 300;
        ctx.fillStyle = '#1a1f27';
        roundRect(ctx, x, 130, 270, 110, 18);
        ctx.fill();
        ctx.fillStyle = '#89909a';
        ctx.font = f('sans', 28);
        ctx.fillText(label, x + 24, 168);
        ctx.fillStyle = color;
        ctx.font = f('display', 44);
        ctx.fillText(arrow, x + 24, 212);
      });
      ctx.strokeStyle = '#252932';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(60, 330 + i * 85);
        ctx.lineTo(w - 60, 330 + i * 85);
        ctx.stroke();
      }
    }),
    { intensity: 0.8 },
  );

  // barras (crecen con el scroll)
  const heights = [1.2, 1.5, 1.35, 1.95, 2.3, 2.75, 3.1];
  const real = heights.map((hgt, i) => {
    const wrap = growBar(g, -4.2 + i * 0.62, -4.5, 0.42, hgt, glow(i === heights.length - 1 ? C.cobre : C.petroleoClaro, 0.55));
    wrap.position.y = 2.2;
    return wrap;
  });

  // línea de tendencia
  const pts = [[0.3, 2.8], [1.0, 3.1], [1.7, 2.95], [2.4, 3.55], [3.1, 3.95], [3.8, 4.55], [4.3, 4.9]].map(
    ([x, y]) => new THREE.Vector3(x, y, -4.55),
  );
  const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.06, 8, false);
  const line = new THREE.Mesh(tube, glow(C.cobre, 0.8));
  g.add(line);
  const idxCount = tube.index.count;
  for (const pt of pts) sphere(g, 0.1, [pt.x, pt.y, pt.z], glow(C.papel, 0.6), false);

  // flecha de rumbo
  const arrow = new THREE.Group();
  arrow.position.set(4.4, 4.95, -4.3);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 12), glow(C.cobre, 1.0));
  shaft.rotation.z = Math.PI / 2;
  shaft.position.x = -0.5;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 16), glow(C.cobre, 1.0));
  head.rotation.z = -Math.PI / 2;
  head.position.x = 0.35;
  arrow.add(shaft, head);
  g.add(arrow);

  const tag = panel(
    g, 2.4, 0.7, [3.9, 5.8, -4.4],
    canvasTex(480, 140, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#167a72';
      roundRect(ctx, 0, 0, w, h, 70);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = f('sans', 44);
      ctx.textBaseline = 'middle';
      ctx.fillText('rumbo sugerido', 40, 72);
    }),
    { transparent: true },
  );
  tag.material.opacity = 0;

  // CEO y compañero
  chair(g, [4.2, 0, 3.0], Math.PI, C.grafito);
  const ceo = person({ shirt: 0x39404d, pants: C.carbon, skin: C.piel2, hair: 0xb8b4aa });
  ceo.position.set(-1.2, 0, 1.2);
  ceo.rotation.y = Math.PI + 0.25;
  g.add(ceo);
  const cp = ceo.userData.parts;
  const mate = person({ shirt: C.cobre, pants: C.grafito, skin: C.piel1, hair: 0x4a3426 });
  mate.position.set(2.0, 0, 1.8);
  mate.rotation.y = Math.PI - 0.2;
  g.add(mate);
  const mp = mate.userData.parts;

  plant(g, [6.1, 0, -3.6], 1.2);
  rbox(g, [3.6, 0.2, 1.6], [4.6, 1.8, 2.6], mat(C.papel), 0.08);
  cyl(g, 0.12, 1.8, [4.6, 0, 2.6], mat(C.grafito), 10);

  return {
    group: g,
    update(t, p) {
      real.forEach((b, i) => {
        b.scale.y = Math.max(0.001, span(p, 0.02 + i * 0.05, 0.4 + i * 0.05));
      });
      tube.setDrawRange(0, Math.floor(idxCount * span(p, 0.25, 0.7) / 3) * 3);
      const decide = span(p, 0.55, 0.8);
      arrow.rotation.z = lerp(-0.1, 0.55, decide);
      arrow.scale.setScalar(0.6 + 0.4 * decide);
      arrow.position.y = 4.95 + Math.sin(t * 2) * 0.05;
      tag.material.opacity = decide;
      cp.armR.rotation.x = lerp(-0.1, -1.5, decide);
      cp.armR.rotation.z = lerp(0, -0.35, decide);
      cp.head.rotation.x = -0.05;
      cp.head.rotation.y = lerp(0, -0.35, decide) + Math.sin(t * 0.7) * 0.03;
      mp.head.rotation.y = Math.sin(t * 0.5) * 0.2 - 0.2;
    },
  };
}
