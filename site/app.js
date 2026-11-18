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

  const filterButtons = [...document.querySelectorAll('[data-reference-filter]')];
  const referenceCards = [...document.querySelectorAll('[data-reference-category]')];
  const referenceCount = document.querySelector('#reference-count');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.referenceFilter;
    let visible = 0;
    filterButtons.forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    referenceCards.forEach(card => {
      const show = filter === 'all' || card.dataset.referenceCategory === filter;
      card.hidden = !show;
      if (show) {
        card.dataset.revealed = 'true';
        animate(card, [{ opacity: .45, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, delay: visible * 40 });
        visible += 1;
      }
    });
    if (referenceCount) referenceCount.textContent = `${visible} emplacement${visible > 1 ? 's' : ''} affiché${visible > 1 ? 's' : ''}. Références à renseigner.`;
  }));

  const pageTitle = document.querySelector('.hero h1, .page-intro h1');
  animate(pageTitle, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 850 });
  animate(document.querySelector('.hero-image-wrap'), [{ opacity: .2, clipPath: 'inset(7% 0 0 0)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)' }], { duration: 1100 });
  animate(document.querySelector('.hero-image-wrap > img'), [{ transform: 'scale(1.045)' }, { transform: 'scale(1)' }], { duration: 1350 });

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
  // Le contenu reste natif et visible sans JavaScript. La hauteur n'est figée
  // que pendant la transition, y compris lorsqu'un clic inverse le mouvement.
  const accordions = [...document.querySelectorAll('details')].map(details => ({
    details,
    summary: details.querySelector('summary'),
    content: details.querySelector('.mission-content, dl'),
    group: details.getAttribute('name'),
    targetOpen: details.open,
    animation: null
  })).filter(state => state.summary && state.content);

  function settleAccordion(state, open) {
    state.details.open = open;
    state.details.style.height = '';
    state.details.style.overflow = '';
    state.targetOpen = open;
    state.animation = null;
  }

  function transitionAccordion(state, open) {
    const details = state.details;
    const start = details.getBoundingClientRect().height;
    const previous = state.animation;
    state.animation = null;
    previous?.cancel();
    state.targetOpen = open;
    if (reducedMotion.matches || typeof details.animate !== 'function') {
      settleAccordion(state, open);
      return;
    }
    details.style.height = 'auto';
    details.open = open;
    const end = details.getBoundingClientRect().height;
    details.open = true;
    details.style.height = `${start}px`;
    details.style.overflow = 'hidden';
    if (Math.abs(end - start) < 1) {
      settleAccordion(state, open);
      return;
    }
    const animation = animate(details, [{ height: `${start}px` }, { height: `${end}px` }], { duration: 380 });
    if (!animation) { settleAccordion(state, open); return; }
    state.animation = animation;
    const finish = () => { if (state.animation === animation) settleAccordion(state, open); };
    animation.finished.then(finish, finish);
  }

  accordions.forEach(state => {
    // Le groupe natif fermerait l'autre volet avant la fin de son animation.
    // La règle d'un seul volet ciblé reste appliquée ci-dessous.
    if (state.group) state.details.removeAttribute('name');
    state.summary.addEventListener('click', event => {
      event.preventDefault();
      const open = !state.targetOpen;
      if (open && state.group) accordions.forEach(other => {
        if (other !== state && other.group === state.group && other.targetOpen) transitionAccordion(other, false);
      });
      transitionAccordion(state, open);
    });
    state.details.addEventListener('toggle', () => {
      if (!state.animation) state.targetOpen = state.details.open;
    });
  });
})();
