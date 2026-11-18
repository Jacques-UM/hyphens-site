/* Suivi natif des missions et entrée discrète du premier écran. */
(() => {
  'use strict';

  if (!document.body.classList.contains('missions-page')) return;

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const tokens = getComputedStyle(document.documentElement);
  const animations = new Set();
  const links = [...document.querySelectorAll('.mis-index a[href^="#"]')];
  const sections = [...document.querySelectorAll('.mis-list .mis-item[id]')];
  const progress = document.querySelector('.mis-index');
  const list = document.querySelector('.mis-list');
  let pendingFrame = 0;
  document.documentElement.classList.add('mis-js');

  function updateCurrentMission() {
    pendingFrame = 0;
    const threshold = window.innerHeight * .4;
    let activeId = '';
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= threshold) activeId = section.id;
    });
    if (progress && list) {
      const box = list.getBoundingClientRect();
      const ratio = (window.innerHeight * .5 - box.top) / Math.max(1, box.height);
      progress.style.setProperty('--mis-progress', Math.min(1, Math.max(0, ratio)).toFixed(3));
    }
    links.forEach(link => {
      const active = link.hash === `#${activeId}`;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function scheduleUpdate() {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(updateCurrentMission);
  }

  function revealHero() {
    if (motionPreference.matches) return;
    const duration = parseFloat(tokens.getPropertyValue('--ui-duration-reveal')) || 560;
    const easing = tokens.getPropertyValue('--ui-ease').trim() || 'cubic-bezier(.22,1,.36,1)';
    const targets = new Set(document.querySelectorAll('.mis-intro-copy > *, .mis-summary'));
    let index = 0;
    targets.forEach(target => {
      if (typeof target.animate !== 'function') return;
      // Ne pas animer une image hors écran lors d'une arrivée par lien profond.
      const bounds = target.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const animation = target.animate(
        [{ opacity: .35, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration, easing, delay: index++ * 60, fill: 'backwards' }
      );
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    });
  }

  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) animations.forEach(animation => animation.cancel());
  });
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate, { once: true });
  window.addEventListener('pageshow', scheduleUpdate);
  if (document.fonts?.ready) document.fonts.ready.then(scheduleUpdate);

  // Apparition des chapitres : sans IntersectionObserver ou avec réduction des mouvements, tout reste visible.
  const chapters = document.querySelectorAll('.mis-reveal');
  if ('IntersectionObserver' in window && !motionPreference.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -12% 0px', threshold: .08 });
    chapters.forEach(chapter => observer.observe(chapter));
  } else chapters.forEach(chapter => chapter.classList.add('is-in'));

  updateCurrentMission();
  revealHero();
})();
