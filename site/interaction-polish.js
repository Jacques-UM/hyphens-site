(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.menu-toggle');
  const navigation = header?.querySelector('#navigation');
  if (!toggle || !navigation) return;

  // Complète les commandes existantes sans dupliquer les clics ou Échap.
  const syncMenuLabel = () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  syncMenuLabel();
  new MutationObserver(syncMenuLabel).observe(toggle, {
    attributes: true,
    attributeFilter: ['aria-expanded']
  });

  // Attendre une cible réellement focalisée hors de l'en-tête : pendant focusout,
  // activeElement peut être temporairement body avant le lien suivant du menu.
  document.addEventListener('focusin', event => {
    if (header.contains(event.target)) return;
    if (event.target === document.body || event.target === document.documentElement) return;
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    toggle.setAttribute('aria-expanded', 'false');
    navigation.removeAttribute('data-open');
    navigation.getAnimations?.().forEach(animation => animation.cancel());
  });
})();
(() => {
  'use strict';
  // En-tête fixe : translucide au défilement, rétracté, masqué en descendant,
  // de retour dès que l'on remonte. Sans script, il reste statique.
  const header = document.querySelector('.site-header');
  if (!header || !document.body.classList.contains('home-motion')) return;
  const root = document.documentElement;
  const toggle = header.querySelector('.menu-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const SCROLLED = 8;
  const COMPACT = 56;
  const DELTA = 6;
  let lastY = Math.max(0, window.scrollY);
  let hidden = false;
  let ticking = false;

  const menuOpen = () => toggle?.getAttribute('aria-expanded') === 'true';
  const keepVisible = () => menuOpen() || header.contains(document.activeElement) || reducedMotion.matches;

  function setFlag(name, on) {
    if (header.hasAttribute(name) !== on) header.toggleAttribute(name, on);
  }

  function update() {
    ticking = false;
    const y = Math.max(0, window.scrollY);
    const delta = y - lastY;
    const hideAfter = header.offsetHeight * 3;
    if (y <= hideAfter || keepVisible()) hidden = false;
    else if (delta > DELTA) hidden = true;
    else if (delta < -DELTA) hidden = false;
    if (Math.abs(delta) > DELTA || y <= hideAfter) lastY = y;
    setFlag('data-scrolled', y > SCROLLED);
    setFlag('data-compact', y > COMPACT);
    setFlag('data-hidden', hidden);
    root.dataset.header = hidden ? 'hidden' : y > COMPACT ? 'visible' : 'top';
  }

  function request() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  window.addEventListener('pageshow', request);
  // Le clavier et le menu ramènent toujours l'en-tête et ses liens de navigation.
  header.addEventListener('focusin', () => { hidden = false; update(); });
  if (toggle) new MutationObserver(update).observe(toggle, { attributes: true, attributeFilter: ['aria-expanded'] });
  update();
})();
