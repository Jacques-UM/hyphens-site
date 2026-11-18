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
