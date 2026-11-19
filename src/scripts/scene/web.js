import * as THREE from 'three';
import {
  C, f, mat, glow, box, rbox, cyl, sphere, room, windowPane, person, chair, laptop, plant,
  canvasTex, panel, screenMat, stdLights, pointLamp, span, roundRect,
} from './kit.js';

/** Web: una persona en una cafetería revisa un portafolio y decide contratar. */
export function buildWeb() {
  const g = new THREE.Group();
  room(g, { floor: C.madera, wall: 0xf0e4cd });
  stdLights(g, { sunI: 2.0, ambI: 1.4 });

  windowPane(g, 2.6, 3.0, [-3.2, 2.5, -4.92]);
  windowPane(g, 2.6, 3.0, [3.2, 2.5, -4.92]);
  windowPane(g, 3.2, 3.0, [-6.92, 2.5, 0.5], { rotY: Math.PI / 2 });

  // pizarra de menú
  panel(
    g, 2.2, 1.5, [0, 3.2, -4.93],
    canvasTex(512, 350, (ctx, w, h) => {
      ctx.fillStyle = '#111318';
      roundRect(ctx, 0, 0, w, h, 24);
      ctx.fill();
      ctx.fillStyle = '#f3f0e8';
      ctx.font = f('display', 76);
      ctx.textBaseline = 'middle';
      ctx.fillText('café', 44, 100);
      ctx.fillStyle = '#d66a45';
      ctx.beginPath();
      ctx.arc(250, 120, 9, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#89909a';
      for (let i = 0; i < 3; i++) {
        roundRect(ctx, 44, 190 + i * 40, 260 - i * 50, 10, 5);
        ctx.fill();
      }
    }),
    { intensity: 0.35 },
  );

  // mostrador y barista
  rbox(g, [6.2, 2.3, 1.3], [3.3, 0, -2.5], mat(C.maderaOscura), 0.1);
  rbox(g, [6.5, 0.18, 1.6], [3.3, 2.3, -2.5], mat(C.papel), 0.08);
  rbox(g, [1.6, 1.3, 0.9], [4.6, 2.48, -2.7], mat(C.carbon), 0.12);
  sphere(g, 0.12, [4.2, 3.2, -2.22], glow(C.cobre, 1.4), false);
  rbox(g, [4.6, 0.14, 0.6], [3.3, 3.9, -4.7], mat(C.maderaOscura), 0.05);
  plant(g, [1.6, 4.04, -4.7], 0.55);
  plant(g, [5.2, 4.04, -4.7], 0.55);
  const barista = person({ shirt: C.cobre, pants: C.carbon, skin: C.piel2, hair: C.carbon });
  barista.position.set(2.6, 0, -3.9);
  g.add(barista);

  // lámparas colgantes
  const lampXs = [-4.2, -1.8, 0.6];
  for (const x of lampXs) {
    cyl(g, 0.03, 2.0, [x, 5.6, 1.2], mat(C.carbon), 6);
    sphere(g, 0.5, [x, 5.3, 1.2], glow(C.cobreClaro, 1.6), false);
  }
  pointLamp(g, 0xffc58a, 55, [-1.8, 4.6, 1.4]);

  // mesa, silla y cliente
  const T = [-1.8, 0, 1.2];
  cyl(g, 1.5, 0.15, [T[0], 1.85, T[2]], mat(C.papel), 40);
  cyl(g, 0.14, 1.85, [T[0], 0, T[2]], mat(C.grafito), 12);
  cyl(g, 0.8, 0.1, [T[0], 0, T[2]], mat(C.grafito), 28);
  chair(g, [T[0], 0, 3.0], Math.PI, C.petroleo);
  const guest = person({ shirt: C.petroleo, skin: C.piel3, hair: C.carbon, seated: true });
  guest.position.set(T[0], 0, 3.0);
  guest.rotation.y = Math.PI;
  g.add(guest);
  const gp = guest.userData.parts;

  // pantalla: portafolio -> contratado
  const texPortfolio = canvasTex(640, 400, (ctx, w, h) => {
    ctx.fillStyle = '#f3f0e8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#111318';
    ctx.font = f('display', 40);
    ctx.textBaseline = 'middle';
    ctx.fillText('portafolio', 36, 44);
    ctx.fillStyle = '#d66a45';
    ctx.beginPath();
    ctx.arc(228, 56, 5, 0, 7);
    ctx.fill();
    const tiles = ['#167a72', '#111318', '#3db3a6', '#d0cabb', '#252932', '#e07b57'];
    tiles.forEach((c, i) => {
      ctx.fillStyle = c;
      roundRect(ctx, 36 + (i % 3) * 196, 96 + Math.floor(i / 3) * 112, 180, 98, 14);
      ctx.fill();
    });
    ctx.fillStyle = '#111318';
    roundRect(ctx, 36, 330, 190, 48, 24);
    ctx.fill();
    ctx.fillStyle = '#f3f0e8';
    ctx.font = f('sans', 22);
    ctx.fillText('Contratar', 70, 355);
  });
  const texHired = canvasTex(640, 400, (ctx, w, h) => {
    ctx.fillStyle = '#167a72';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(240, 190);
    ctx.lineTo(300, 250);
    ctx.lineTo(410, 130);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = f('display', 44);
    ctx.textAlign = 'center';
    ctx.fillText('contratado', w / 2, 320);
  });
  const matPortfolio = screenMat(texPortfolio, 0.9);
  const matHired = screenMat(texHired, 0.9);
  const lap = laptop(g, [T[0], 2.0, 1.45], 0, texPortfolio);
  lap.screen.material = matPortfolio;

  // taza con vapor
  cyl(g, 0.22, 0.34, [-0.55, 2.0, 1.75], mat(C.papel), 16, 0.18);
  const steam = [0, 1, 2].map((i) => sphere(g, 0.07, [-0.55, 2.4, 1.75], new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }), false));

  // sello de aprobación flotante
  const badgeTex = canvasTex(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#167a72';
    ctx.beginPath();
    ctx.arc(128, 128, 118, 0, 7);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(78, 134);
    ctx.lineTo(115, 170);
    ctx.lineTo(182, 90);
    ctx.stroke();
  });
  const badge = panel(g, 1.5, 1.5, [-1.8, 4.6, 1.4], badgeTex, { transparent: true, rotY: 0.55 });
  badge.material.opacity = 0;

  return {
    group: g,
    update(t, p) {
      const decided = p > 0.55;
      lap.screen.material = decided ? matHired : matPortfolio;
      const pop = span(p, 0.55, 0.72);
      badge.material.opacity = pop;
      badge.scale.setScalar(0.85 + 0.15 * pop);
      badge.position.y = 4.4 + pop * 0.3 + Math.sin(t * 2) * 0.05;

      gp.head.rotation.x = 0.08 + Math.sin(t * 1.3) * 0.02 - (decided ? 0 : 0.04);
      gp.torso.rotation.x = decided ? 0.02 : 0.12;
      gp.armR.rotation.x = -1.12 + Math.sin(t * 2.4) * 0.04 + (decided ? Math.max(0, Math.sin((p - 0.55) * 40)) * -0.12 : 0);
      gp.armL.rotation.x = -1.1;

      const bp = barista.userData.parts;
      bp.armR.rotation.x = -0.9 + Math.sin(t * 2) * 0.35;
      bp.armL.rotation.x = -0.5;
      bp.head.rotation.y = Math.sin(t * 0.6) * 0.3;

      steam.forEach((s, i) => {
        const k = (t * 0.5 + i / 3) % 1;
        s.position.y = 2.4 + k * 1.1;
        s.position.x = -0.55 + Math.sin(k * 6 + i) * 0.08;
        s.material.opacity = Math.sin(k * Math.PI) * 0.5;
      });
    },
  };
}
