(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const ui = getComputedStyle(document.documentElement);
  const uiDuration = (token, fallback) => parseFloat(ui.getPropertyValue(token)) || fallback;
  const easing = ui.getPropertyValue('--ui-ease').trim() || 'cubic-bezier(.22,1,.36,1)';
  const revealDuration = uiDuration('--ui-duration-reveal', 560);
  const root = document.documentElement;
  const hero = document.querySelector('.home-hero');
  const heroCopy = document.querySelector('.home-hero-copy');
  const heroFrame = document.querySelector('.home-hero-frame');
  const heroShapes = document.querySelector('.home-hero-shapes');
  const contactMark = document.querySelector('.contact .contact-mark');
  const contactSection = document.querySelector('#contact');
  // Titres révélés mot à mot : le texte reste identique pour les lecteurs d'écran.
  document.querySelectorAll('[data-apparition="mots"]').forEach(title => {
    const words = title.textContent.trim().split(/\s+/);
    title.setAttribute('aria-label', title.textContent.trim());
    title.textContent = '';
    words.forEach((word, index) => {
      const outer = document.createElement('span');
      outer.className = 'mot';
      outer.setAttribute('aria-hidden', 'true');
      outer.style.setProperty('--i', index);
      const inner = document.createElement('span');
      inner.textContent = word;
      outer.append(inner);
      title.append(outer, index < words.length - 1 ? ' ' : '');
    });
  });
  const motionTargets = [...document.querySelectorAll('main [data-apparition]')];
  const role = document.querySelector('.home-role');
  const roleImage = document.querySelector('.home-role-image');
  const approach = document.querySelector('.home-approach-layout');
  const approachVisual = approach.querySelector('.home-approach-visual');
  const services = document.querySelectorAll('.home-service');
  const servicesSection = document.querySelector('.home-services');
  const backgroundToggle = document.querySelector('.home-services-motion-toggle');
  let backgroundVisible = false;
  let backgroundPaused = false;
  function syncBackground() {
    servicesSection.toggleAttribute('data-background-active', backgroundVisible && !backgroundPaused && !motion.matches && !document.hidden);
    backgroundToggle.hidden = motion.matches;
    backgroundToggle.textContent = backgroundPaused ? 'Animer le fond' : 'Figer le fond';
  }
  backgroundToggle.addEventListener('click', () => {
    backgroundPaused = !backgroundPaused;
    syncBackground();
  });
  // Sans JavaScript les volets restent ouverts et les boutons sont masqués.
  const disclosures = [...document.querySelectorAll('.home-service-toggle')].map(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const state = { button, panel, open: false, animation: null };
    panel.hidden = true;
    button.hidden = false;
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="home-service-toggle-label">Voir plus</span><span class="home-service-toggle-icon" aria-hidden="true"></span>';
    const label = button.querySelector('.home-service-toggle-label');
    function settle() {
      state.animation = null;
      panel.hidden = !state.open;
      panel.inert = !state.open;
      panel.style.height = '';
      panel.style.overflow = '';
    }
    state.settle = settle;
    state.setOpen = open => {
      if (state.open === open) return;
      const start = panel.hidden ? 0 : panel.getBoundingClientRect().height;
      const startOpacity = panel.hidden ? 0 : Number(getComputedStyle(panel).opacity);
      const previous = state.animation;
      state.animation = null;
      previous?.cancel();
      state.open = open;
      button.setAttribute('aria-expanded', String(state.open));
      label.textContent = state.open ? 'Voir moins' : 'Voir plus';
      panel.hidden = false;
      panel.inert = !state.open;
      panel.style.height = '';
      const end = state.open ? panel.scrollHeight : 0;
      if (motion.matches || typeof panel.animate !== 'function' || Math.abs(start - end) < 1) { settle(); return; }
      panel.style.height = start + 'px';
      panel.style.overflow = 'hidden';
      const animation = panel.animate([
        { height: start + 'px', opacity: startOpacity },
        { height: end + 'px', opacity: state.open ? 1 : 0 }
      ], { duration: uiDuration('--ui-duration-disclosure', 420), easing });
      state.animation = animation;
      animation.finished.then(() => { if (state.animation === animation) settle(); }, () => {});
    };
    button.addEventListener('click', () => {
      const open = !state.open;
      disclosures.forEach(disclosure => { if (disclosure !== state) disclosure.setOpen(false); });
      state.setOpen(open);
    });
    return state;
  });
  const animations = new Set();
  let frame = 0;
  let observer;
  let revealObserver;
  const clamp = value => Math.min(1, Math.max(0, value));
  function animate(element, frames, options) {
    if (!element || motion.matches || typeof element.animate !== 'function') return;
    const a = element.animate(frames, options);
    animations.add(a);
    a.finished.then(() => animations.delete(a), () => animations.delete(a));
  }
  function update() {
    frame = 0;
    const roleRect = role.getBoundingClientRect();
    const roleProgress = clamp((innerHeight - roleRect.top) / (innerHeight + roleRect.height));
    roleImage.style.transform = motion.matches ? '' : `translate3d(0,${((roleProgress - .5) * -64).toFixed(1)}px,0)`;
    // Parallaxe discrète du hero, calculée seulement tant qu'il est visible.
    const heroHeight = hero.offsetHeight;
    if (!motion.matches && scrollY < heroHeight) {
      const ratio = scrollY / Math.max(1, heroHeight);
      heroFrame.style.transform = `translate3d(0,${(scrollY * .22).toFixed(1)}px,0)`;
      heroShapes.style.transform = `translate3d(0,${(scrollY * -.1).toFixed(1)}px,0)`;
      heroCopy.style.transform = `translate3d(0,${(scrollY * .08).toFixed(1)}px,0)`;
      heroCopy.style.opacity = (1 - ratio * .7).toFixed(3);
    } else if (motion.matches) {
      heroFrame.style.transform = heroShapes.style.transform = heroCopy.style.transform = heroCopy.style.opacity = '';
    }
    if (contactMark && contactSection) {
      const contactRect = contactSection.getBoundingClientRect();
      const contactProgress = clamp((innerHeight - contactRect.top) / (innerHeight + contactRect.height));
      contactMark.style.transform = motion.matches ? '' : `translate3d(0,${((1 - contactProgress) * 60).toFixed(1)}px,0) rotate(${((1 - contactProgress) * -6).toFixed(2)}deg)`;
    }
    // Au zoom ou avec de grandes polices, ne jamais fixer un bloc trop haut.
    const stickyClearance = parseFloat(getComputedStyle(document.documentElement).fontSize) * 3;
    const headerOffset = parseFloat(getComputedStyle(approachVisual).getPropertyValue('--ui-header-offset')) || 0;
    approachVisual.toggleAttribute('data-sticky-overflow', approachVisual.offsetHeight > innerHeight - stickyClearance - headerOffset);
    const steps = [...approach.querySelectorAll('.home-step')];
    const first = steps[0].getBoundingClientRect();
    const last = steps[steps.length - 1].getBoundingClientRect();
    const span = Math.max(1, last.top - first.top);
    const progress = clamp((innerHeight * .55 - first.top) / span);
    approach.style.setProperty('--approach-progress', progress.toFixed(3));
    // Une étape devient courante quand son début atteint le milieu de l'écran.
    const current = steps.reduce((active, step, index) => step.getBoundingClientRect().top <= innerHeight * .55 ? index : active, 0);
    steps.forEach((step, index) => step.toggleAttribute('data-active', index === current));
    approach.querySelectorAll('[data-step-node]').forEach((node, index) => node.toggleAttribute('data-active', index === current));
    approach.querySelector('.home-current-label').textContent = steps[current].querySelector('h3').textContent;
    const currentIcon = approach.querySelector('.home-current-icon');
    if (currentIcon.getAttribute('name') !== steps[current].dataset.icon) currentIcon.setAttribute('name', steps[current].dataset.icon);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function configureMotion() {
    disclosures.forEach(state => { if (state.animation) { const active = state.animation; state.animation = null; active.cancel(); state.settle(); } });
    syncBackground();
    animations.forEach(a => a.cancel());
    animations.clear();
    if (observer) observer.disconnect();
    if (revealObserver) revealObserver.disconnect();
    // Sans IntersectionObserver ou avec réduction des mouvements, tout reste affiché.
    if (motion.matches || !('IntersectionObserver' in window)) {
      root.classList.remove('motion-pret');
      motionTargets.forEach(target => target.setAttribute('data-visible', ''));
    } else {
      root.classList.add('motion-pret');
      revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-visible', '');
        revealObserver.unobserve(entry.target);
      }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
      motionTargets.forEach(target => { if (!target.hasAttribute('data-visible')) revealObserver.observe(target); });
    }
    if (!motion.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = [...services].indexOf(entry.target);
        animate(entry.target, [{ opacity: 0, transform: 'translateY(48px) scale(.97)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: revealDuration * 1.6, delay: index * 120, fill: 'backwards', easing });
        observer.unobserve(entry.target);
      }), { threshold: .12 });
      services.forEach(service => observer.observe(service));
    }
    schedule();
  }
  configureMotion();
  // Entrée du hero : elle attend la fin de la signature (brand-intro.js) sans la modifier.
  let heroLance = false;
  function lancerHero() {
    if (heroLance) return;
    heroLance = true;
    if (!root.classList.contains('hero-attente')) return;
    root.classList.add('hero-entree');
    void hero.offsetWidth; // fixe l'état de départ avant de lancer les transitions
    root.classList.remove('hero-attente');
  }
  const intro = document.querySelector('.brand-intro');
  if (motion.matches || !intro || !intro.isConnected) lancerHero();
  else {
    // Le texte arrive pendant le fondu de sortie, pour un enchaînement continu.
    const surveillance = new MutationObserver(() => { if (!intro.isConnected) finIntro(); });
    const secours = setTimeout(finIntro, 2000);
    function finIntro() { surveillance.disconnect(); clearTimeout(secours); lancerHero(); }
    surveillance.observe(document.body, { childList: true });
    intro.addEventListener('animationstart', event => {
      if (event.target === intro) setTimeout(finIntro, 180);
    });
  }
  motion.addEventListener('change', configureMotion);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(approachVisual);
  if ('IntersectionObserver' in window) {
    const backgroundObserver = new IntersectionObserver(entries => {
      backgroundVisible = entries.some(entry => entry.isIntersecting);
      syncBackground();
    });
    backgroundObserver.observe(servicesSection);
  }
  document.addEventListener('visibilitychange', syncBackground);
})();
