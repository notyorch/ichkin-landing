/** Capa de interfaz del escenario: narración flotante, pasos y navegación. */
export function createUI(stage) {
  const articles = [...stage.querySelectorAll('[data-room]')];
  const ticks = [...stage.querySelectorAll('[data-tick]')];
  const hint = stage.querySelector('[data-hint]');
  const beats = articles.map((a) => JSON.parse(a.dataset.beats || '[]'));
  let room = -1;
  let beat = -1;

  function setRoom(i) {
    if (i === room) return;
    room = i;
    beat = -1;
    articles.forEach((a, k) => {
      const on = k === i;
      a.toggleAttribute('data-active', on);
      a.inert = !on;
      a.setAttribute('aria-hidden', String(!on));
    });
    ticks.forEach((t, k) => {
      t.toggleAttribute('data-active', k === i);
      if (k === i) t.setAttribute('aria-current', 'step');
      else t.removeAttribute('aria-current');
    });
  }

  /** p: avance 0..1 dentro de la habitación visible. */
  function setProgress(i, p) {
    if (i !== room) return;
    const list = beats[i];
    let b = 0;
    list.forEach((x, k) => {
      if (p >= x.at) b = k;
    });
    if (b === beat) return;
    beat = b;
    const a = articles[i];
    const el = a.querySelector('[data-beat]');
    el.textContent = list[b].text;
    el.classList.remove('beat-in');
    void el.offsetWidth; // reinicia la entrada del texto
    el.classList.add('beat-in');
    a.querySelectorAll('[data-seg]').forEach((s, k) => s.toggleAttribute('data-on', k <= b));
    const counter = a.querySelector('[data-count]');
    if (counter) counter.textContent = `${b + 1} / ${list.length}`;
  }

  function setHint(visible) {
    if (hint) hint.toggleAttribute('data-hidden', !visible);
  }

  return { setRoom, setProgress, setHint, ticks };
}
