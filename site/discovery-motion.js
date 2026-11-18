(() => {
  'use strict';
  const section = document.querySelector('.home-discovery');
  if (!section || !document.body.classList.contains('home-motion')) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ui = getComputedStyle(document.documentElement);
  const revealDuration = parseFloat(ui.getPropertyValue('--ui-duration-reveal')) || 560;
  const easing = ui.getPropertyValue('--ui-ease').trim() || 'cubic-bezier(.22,1,.36,1)';
  const animations = new Set();
  let visible = false;
  let revealed = false;
  let frame = 0;

  function stopAnimations() {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  }
  function updateProgress() {
    frame = 0;
    if (!visible || preference.matches || document.hidden) return;
    const bounds = section.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - bounds.top) / (innerHeight + bounds.height)));
    section.style.setProperty('--discovery-progress', progress.toFixed(4));
  }
  function schedule() {
    if (visible && !preference.matches && !document.hidden && !frame) frame = requestAnimationFrame(updateProgress);
  }
  function reveal() {
    if (revealed || preference.matches || typeof section.animate !== 'function') return;
    revealed = true;
    section.querySelectorAll('.discovery-heading, .discovery-panel').forEach((element, index) => {
      const animation = element.animate([
        { opacity: .45, transform: 'translateY(16px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: revealDuration, delay: index * 80, fill: 'backwards', easing });
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    });
  }
  function syncPreference() {
    stopAnimations();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (preference.matches) section.style.removeProperty('--discovery-progress');
    else schedule();
  }
  // Le contenu reste visible sans JavaScript ou sans IntersectionObserver.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) { reveal(); schedule(); }
      else { stopAnimations(); if (frame) cancelAnimationFrame(frame); frame = 0; }
    }, { threshold: .06 });
    observer.observe(section);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopAnimations(); else schedule(); });
    if (typeof preference.addEventListener === 'function') preference.addEventListener('change', syncPreference);
    else if (typeof preference.addListener === 'function') preference.addListener(syncPreference);
  }
})();
