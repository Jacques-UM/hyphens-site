/* Signature décorative courte, indépendante du chargement réseau. */
(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'hyphens-brand-intro-v1';
  const replay = new URLSearchParams(location.search).get('intro') === '1';
  if (preference.matches || !customElements.get('hyphens-mark')) return;
  // Sans stockage disponible, éviter de rejouer à chaque changement de page.
  try {
    if (!replay && sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, 'seen');
  } catch {
    if (!replay) return;
  }
  const overlay = document.createElement('div');
  overlay.className = 'brand-intro';
  overlay.setAttribute('aria-hidden', 'true');
  const symbol = document.createElement('div');
  symbol.className = 'brand-intro-symbol';
  for (const fragment of ['first', 'second']) {
    const mark = document.createElement('hyphens-mark');
    mark.setAttribute('fragment', fragment);
    mark.setAttribute('aria-hidden', 'true');
    symbol.append(mark);
  }
  overlay.append(symbol);
  document.body.prepend(overlay);

  let timer;
  function finish() {
    clearTimeout(timer);
    overlay.remove();
    document.removeEventListener('keydown', finish);
    overlay.removeEventListener('pointerdown', finish);
    preference.removeEventListener('change', finish);
    window.removeEventListener('pagehide', finish);
  }
  overlay.addEventListener('animationend', event => {
    if (event.target === overlay) finish();
  });
  // Une interaction donne immédiatement accès au site, y compris au clavier.
  document.addEventListener('keydown', finish, { once: true });
  overlay.addEventListener('pointerdown', finish, { once: true });
  preference.addEventListener('change', finish, { once: true });
  window.addEventListener('pagehide', finish, { once: true });
  timer = setTimeout(finish, 1600);
})();
