import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import { buildWeb } from './web.js';
import { buildSistemas } from './sistemas.js';
import { buildDatos } from './datos.js';
import { buildInteligencia } from './inteligencia.js';
import { buildAutomatizacion } from './automatizacion.js';
import { buildColaboracion } from './colaboracion.js';
import { createUI } from './ui.js';

gsap.registerPlugin(ScrollTrigger);

const SPACING = 36;
const BG = 0x111318;
const builders = [buildWeb, buildSistemas, buildDatos, buildInteligencia, buildAutomatizacion, buildColaboracion];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * Escenario a pantalla completa: una habitación a la vez, fija mientras corre el scroll.
 * Entre habitaciones, un degradado oscuro barre la pantalla y revela la siguiente.
 */
export async function start({ section, stage, canvas, wipe }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    section.dataset.state = 'fallback';
    return;
  }
  renderer.setClearColor(BG);
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
  scene.background = new THREE.Color(BG);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);

  const stations = builders.map((build, i) => {
    const s = build();
    s.group.position.x = i * SPACING;
    s.group.visible = i === 0;
    scene.add(s.group);
    return s;
  });
  const N = stations.length;

  const ui = createUI(stage);
  let current = 0; // habitación visible
  let roomFloat = 0; // posición continua del scroll: 0..N
  let dirty = true;
  let onScreen = true;
  // teléfonos y pantallas táctiles: densidad de píxeles limitada (los 3x de un teléfono son ~2.25x más píxeles que 2x)
  const phone = matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 768;
  let pixelCap = phone ? 1.5 : 2;

  // ---- encuadre: la habitación siempre cabe completa, también en vertical (móvil)
  const frame = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const aspect = w / h;
    const wide = w >= 1024 && aspect >= 1.5; // texto a la izquierda, habitación a la derecha
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const base = Math.hypot(12.5, 11, 17);
    // ancho/alto de escena que debe caber (la habitación mide ~20 unidades en pantalla)
    const needW = wide ? 33 : 20;
    const needH = wide ? 19.5 : 21;
    const dist = Math.max(needW / (2 * tanV * aspect), needH / (2 * tanV));
    const k = dist / base;
    const x = current * SPACING;
    camera.position.set(x + 12.5 * k, 11 * k, 17 * k);
    camera.lookAt(x + 0.3, 2.4, 0.4);
    if (wide) camera.setViewOffset(w, h, -w * 0.14, 0, w, h);
    else camera.clearViewOffset();
  };

  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, pixelCap));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  // ---- progreso local de una habitación (con reposo al inicio y al final)
  const pFor = (i) => clamp((roomFloat - i - 0.08) / 0.84);

  // ---- degradado entre habitaciones
  let want = 0;
  let busy = false;
  const swap = () => {
    current = want;
    stations.forEach((s, i) => (s.group.visible = i === current));
    ui.setRoom(current);
    dirty = true;
  };
  const transition = () => {
    if (busy || want === current) return;
    busy = true;
    if (reduced || !wipe.animate) {
      swap();
      busy = false;
      return;
    }
    const duration = 780;
    const anim = wipe.animate(
      [{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)', offset: 0.5 }, { transform: 'translateY(-100%)' }],
      { duration, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' },
    );
    // la habitación cambia justo cuando el degradado cubre la pantalla
    const mid = setTimeout(swap, duration * 0.5);
    anim.onfinish = anim.oncancel = () => {
      clearTimeout(mid);
      busy = false;
      transition(); // si el usuario siguió avanzando, encadena la siguiente
    };
  };

  const measure = () => {
    const scrollable = section.offsetHeight - innerHeight;
    const top = section.getBoundingClientRect().top;
    const s = scrollable > 0 ? clamp(-top / scrollable) : 0;
    roomFloat = s * N;
    want = Math.min(N - 1, Math.floor(roomFloat));
    transition();
    ui.setProgress(current, pFor(current));
    ui.setHint(s < 0.02);
    dirty = true;
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: measure,
    onRefresh: measure,
  });

  // navegación por puntos: salto directo al inicio de cada habitación
  ui.ticks.forEach((tick, i) => {
    tick.addEventListener('click', () => {
      const scrollable = section.offsetHeight - innerHeight;
      const y = section.getBoundingClientRect().top + scrollY + ((i + 0.1) / N) * scrollable;
      window.scrollTo({ top: y, behavior: 'auto' });
    });
  });

  new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { rootMargin: '120px' }).observe(stage);

  // ---- calidad adaptativa: si los cuadros tardan, baja resolución y luego sombras
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
  ui.setRoom(0);
  measure();
  frame();
  renderer.render(scene, camera);

  renderer.setAnimationLoop(() => {
    if (!onScreen) return;
    if (reduced && !dirty) return;
    const dt = clock.getDelta();
    if (!reduced && quality > 0 && dt < 1) {
      ema = ema * 0.9 + dt * 0.1;
      if (++sampled > 40 && ema > 0.045) lowerQuality();
    }
    t = reduced ? 0 : t + Math.min(dt, 0.05);
    stations[current].update(t, pFor(current));
    frame();
    if (!reduced) {
      camera.position.x += Math.sin(t * 0.25) * 0.3;
      camera.position.y += Math.sin(t * 0.2) * 0.18;
      camera.lookAt(current * SPACING + 0.3, 2.4, 0.4);
    }
    renderer.render(scene, camera);
    dirty = false;
  });

  section.dataset.state = 'ready';
  ScrollTrigger.refresh();
}
