(() => {
  'use strict';

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const homeUI = document.body.classList.contains('home-motion') ? getComputedStyle(document.documentElement) : null;
  const runningAnimations = new Set();
  function animate(element, keyframes, options = {}) {
    if (!element || reducedMotion.matches || typeof element.animate !== 'function') return;
    runningAnimations.forEach(active => { if (active.effect?.target === element) active.cancel(); });
    const settings = { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)', ...options };
    if (homeUI) {
      settings.duration = parseFloat(homeUI.getPropertyValue('--ui-duration-base')) || 240;
      settings.easing = homeUI.getPropertyValue('--ui-ease').trim() || settings.easing;
    }
    const animation = element.animate(keyframes, settings);
    runningAnimations.add(animation);
    animation.finished.then(() => runningAnimations.delete(animation), () => runningAnimations.delete(animation));
    return animation;
  }
  function syncMotionPreference() {
    document.documentElement.dataset.motion = reducedMotion.matches ? 'reduced' : 'full';
    if (reducedMotion.matches) runningAnimations.forEach(animation => animation.cancel());
  }
  syncMotionPreference();
  reducedMotion.addEventListener('change', syncMotionPreference);
  // Les anciennes préférences et paramètres ne doivent plus modifier la charte.
  try { localStorage.removeItem('hyphens-prototype'); } catch { /* Stockage facultatif. */ }
  const url = new URL(location.href);
  if (url.searchParams.has('palette') || url.searchParams.has('variant')) {
    url.searchParams.delete('palette');
    url.searchParams.delete('variant');
    try { history.replaceState(null, '', url); } catch { /* Ouverture locale éventuelle. */ }
  }
  document.documentElement.dataset.palette = 'charte-2026';

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    nav.removeAttribute('data-open');
    nav.getAnimations?.().forEach(animation => animation.cancel());
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    nav.toggleAttribute('data-open', open);
    if (open) animate(nav, [{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 250 });
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') { closeMenu(); menuToggle.focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  matchMedia('(min-width: 1001px)').addEventListener('change', closeMenu);
  document.documentElement.dataset.navigation = 'ready';

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        nav.querySelectorAll('a').forEach(link => {
          if (link.getAttribute('aria-current') === 'page') return;
          const isLocal = new URL(link.href).pathname === location.pathname;
          if (isLocal && link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-10% 0px -45% 0px' });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target.dataset.revealed !== 'true') animate(entry.target, [{ opacity: .2, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 700 });
        entry.target.dataset.revealed = 'true';
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('[data-reveal]:not(.page-intro)').forEach(element => revealObserver.observe(element));
  }
})();
