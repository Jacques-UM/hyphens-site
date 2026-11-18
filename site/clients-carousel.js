(() => {
  'use strict';
  const section = document.querySelector('#clients');
  if (!section) return;
  const list = section.querySelector('.clients-list');
  const controls = section.querySelector('.clients-controls');
  const pause = section.querySelector('.clients-pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const originals = [...list.children];
  // Deux copies décoratives gardent la même séquence de part et d’autre du raccord.
  const copy = () => originals.map(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('inert', '');
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    return clone;
  });
  list.prepend(...copy());
  list.append(...copy());
  list.classList.add('is-infinite');
  let visible = false;
  let paused = false;
  let focused = false;
  let interacting = false;
  let frame = 0;
  let last = 0;
  let period = 0;
  let position = 0;
  const normalize = value => period + ((value - period) % period + period) % period;
  function measure() {
    period = originals[0].offsetLeft - list.firstElementChild.offsetLeft;
    position = period ? normalize(list.scrollLeft) : 0;
    list.scrollLeft = position;
    controls.hidden = !period;
    sync();
  }
  function tick(time) {
    if (last) position = normalize(position + Math.min(time - last, 64) * .032);
    last = time;
    list.scrollLeft = position;
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    pause.disabled = reduced.matches;
    pause.textContent = reduced.matches ? 'Mouvement réduit' : paused ? 'Reprendre' : 'Mettre en pause';
    pause.setAttribute('aria-pressed', String(paused));
    if (visible && !document.hidden && !paused && !focused && !interacting && !reduced.matches && period) {
      position = normalize(list.scrollLeft);
      frame = requestAnimationFrame(tick);
    }
  }
  function move(direction) {
    position = normalize(list.scrollLeft + direction * originals[0].getBoundingClientRect().width);
    list.scrollLeft = position;
    last = 0;
  }
  section.querySelector('.clients-previous').addEventListener('click', () => move(-1));
  section.querySelector('.clients-next').addEventListener('click', () => move(1));
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  list.addEventListener('focusin', () => { focused = true; sync(); });
  list.addEventListener('focusout', event => { focused = list.contains(event.relatedTarget); sync(); });
  list.addEventListener('pointerdown', () => { interacting = true; sync(); });
  const release = () => { if (interacting) { interacting = false; sync(); } };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);
  list.addEventListener('scroll', () => {
    if (!frame && period) {
      position = normalize(list.scrollLeft);
      if (Math.abs(position - list.scrollLeft) > 1) list.scrollLeft = position;
    }
  }, { passive: true });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(measure).observe(list);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); sync(); }).observe(section);
  } else { visible = true; }
  measure();
})();
