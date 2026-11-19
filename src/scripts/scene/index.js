import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { C } from './kit.js';
import { buildWeb } from './web.js';
import { buildSistemas } from './sistemas.js';
import { buildDatos } from './datos.js';
import { buildInteligencia } from './inteligencia.js';
import { buildAutomatizacion } from './automatizacion.js';
import { buildColaboracion } from './colaboracion.js';

gsap.registerPlugin(ScrollTrigger);

const SPACING = 36;
const builders = [buildWeb, buildSistemas, buildDatos, buildInteligencia, buildAutomatizacion, buildColaboracion];

/** Monta el escenario 3D y lo liga al scroll de la lista de capacidades. */
export async function start({ wrap, canvas, items }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    wrap.dataset.state = 'fallback';
    return;
  }
  renderer.setClearColor(0x15181e);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // las texturas de canvas necesitan las fuentes ya cargadas
  try {
    await Promise.all([
      document.fonts.load('600 40px "Bricolage Grotesque Variable"'),
      document.fonts.load('500 24px Inter'),
    ]);
  } catch {}

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x15181e);
  scene.fog = new THREE.Fog(0x15181e, 45, 90);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);

  const stations = builders.map((build, i) => {
    const s = build();
    s.group.position.x = i * SPACING;
    s.group.visible = i === 0;
    scene.add(s.group);
    return s;
  });

  const state = { x: 0 };
  let target = 0;
  let pixelCap = 2;
  const progress = stations.map(() => 0);
  let active = 0;
  let dirty = true;
  let onScreen = true;

  const aim = () => {
    const vertical = wrap.clientWidth / wrap.clientHeight;
    const dist = vertical < 1.2 ? 1.34 : 1.17;
    camera.position.set(state.x + 12.5 * dist, 11 * dist, 17 * dist);
    camera.lookAt(state.x + 0.3, 2.2, 0.4);
  };

  const resize = () => {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, pixelCap));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    aim();
    dirty = true;
  };
  new ResizeObserver(resize).observe(wrap);
  resize();

  const goTo = (i) => {
    active = i;
    items.forEach((li, k) => li.toggleAttribute('data-active', k === i));
    target = i * SPACING;
    if (reduced) state.x = target;
    dirty = true;
  };

  // Una sola referencia: la línea al 62 % del viewport decide qué elemento está activo
  // y cuánto ha avanzado dentro de él (sin huecos entre elementos).
  const measure = () => {
    const line = innerHeight * 0.62;
    let found = 0;
    items.forEach((li, i) => {
      const r = li.getBoundingClientRect();
      progress[i] = Math.min(1, Math.max(0, (line - r.top) / r.height));
      if (r.top <= line) found = i;
    });
    if (found !== active) goTo(found);
    dirty = true;
  };
  ScrollTrigger.create({
    trigger: items[0].parentElement,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: measure,
    onRefresh: measure,
  });
  goTo(0);
  measure();

  new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { rootMargin: '120px' }).observe(wrap);

  // Calidad adaptativa: si los cuadros tardan, baja la resolución y luego apaga sombras.
  let quality = 2;
  let ema = 0.016;
  let sampled = 0;
  const lowerQuality = () => {
    quality -= 1;
    sampled = 0;
    if (quality === 1) {
      pixelCap = 1;
      resize();
    } else {
      renderer.shadowMap.enabled = false;
      scene.traverse((o) => {
        if (o.isLight) o.castShadow = false;
        if (o.material) o.material.needsUpdate = true;
      });
    }
  };

  const clock = new THREE.Clock();
  let t = 0;
  renderer.setAnimationLoop(() => {
    if (!onScreen) return;
    if (reduced && !dirty) return;
    const dt = clock.getDelta();
    if (!reduced && quality > 0 && dt < 1) {
      ema = ema * 0.9 + dt * 0.1;
      if (++sampled > 40 && ema > 0.045) lowerQuality();
    }
    t = reduced ? 0 : t + Math.min(dt, 0.05);
    // la cámara viaja entre maquetas con suavizado exponencial (tiempo real)
    if (Math.abs(target - state.x) > 0.01) {
      state.x += (target - state.x) * (1 - Math.exp(-Math.min(dt, 0.25) * 4.2));
      dirty = true;
    } else state.x = target;
    const here = state.x / SPACING;
    stations.forEach((s, i) => {
      const near = Math.abs(i - here) < 1.15;
      s.group.visible = near;
      if (near) s.update(t, i === active ? progress[i] : i < active ? 1 : 0);
    });
    aim();
    if (!reduced) {
      camera.position.x += Math.sin(t * 0.25) * 0.35;
      camera.position.y += Math.sin(t * 0.2) * 0.2;
      camera.lookAt(state.x + 0.3, 2.2, 0.4);
    }
    renderer.render(scene, camera);
    dirty = false;
  });

  wrap.dataset.state = 'ready';
}
