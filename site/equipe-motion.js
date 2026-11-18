/* Fiches de l'équipe : portraits et parcours à renseigner avec HYPHENS. */
(() => {
  'use strict';

  const dialog = document.querySelector('#member-dialog');
  const sheet = dialog?.querySelector('.member-sheet');
  const cards = [...document.querySelectorAll('.people-card[data-member]')];
  if (!dialog || !sheet || typeof dialog.showModal !== 'function') return;

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const tokens = getComputedStyle(document.documentElement);
  const easing = tokens.getPropertyValue('--ui-ease').trim() || 'cubic-bezier(.22,1,.36,1)';
  // Remplacer chaque entrée par les informations validées de la personne concernée.
  const members = Object.fromEntries(cards.map(card => [card.dataset.member, {
    name: 'Nom à renseigner',
    role: 'Fonction à renseigner',
    portrait: 'Portrait à ajouter',
    intro: 'La présentation de cette personne sera ajoutée ici.',
    career: 'À renseigner',
    expertise: 'À renseigner'
  }]));
  const animations = new Set();
  let opener = null;
  let savedOverflow = '';
  let closing = false;
  let sheetAnimation = null;

  function animate(target, frames, options) {
    if (motionPreference.matches || typeof target.animate !== 'function') return null;
    const animation = target.animate(frames, options);
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    return animation;
  }

  function openMember(card) {
    if (dialog.open || closing) return;
    const member = members[card.dataset.member];
    if (!member) return;
    const fields = {
      'member-name': member.name,
      'member-function': member.role,
      'member-photo-label': member.portrait,
      'member-intro': member.intro,
      'member-career': member.career,
      'member-expertise': member.expertise
    };
    Object.entries(fields).forEach(([id, value]) => {
      const field = dialog.querySelector(`#${id}`);
      if (field) field.textContent = value;
    });
    opener = card;
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    card.setAttribute('aria-expanded', 'true');
    dialog.removeAttribute('data-closing');
    dialog.showModal();
    sheet.querySelector('.member-sheet-scroll').scrollTop = 0;
    dialog.querySelector('[data-close-member]')?.focus({ preventScroll: true });
    sheetAnimation = animate(sheet,
      [{ transform: 'translateX(40px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }],
      { duration: 420, easing }
    );
  }

  async function closeMember() {
    if (!dialog.open || closing) return;
    closing = true;
    const current = getComputedStyle(sheet);
    const start = { transform: current.transform, opacity: current.opacity };
    sheetAnimation?.cancel();
    dialog.setAttribute('data-closing', '');
    sheetAnimation = animate(sheet,
      [start, { transform: 'translateX(32px)', opacity: 0 }],
      { duration: 240, easing, fill: 'forwards' }
    );
    if (sheetAnimation) await sheetAnimation.finished.catch(() => {});
    if (dialog.open) dialog.close();
    sheetAnimation?.cancel();
    sheetAnimation = null;
    closing = false;
  }

  cards.forEach(card => {
    card.disabled = false;
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-controls', dialog.id);
    card.setAttribute('aria-expanded', 'false');
    card.addEventListener('click', () => openMember(card));
  });
  dialog.querySelectorAll('[data-close-member]').forEach(button => button.addEventListener('click', closeMember));
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeMember();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = sheet.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMember();
  });
  dialog.addEventListener('close', () => {
    dialog.removeAttribute('data-closing');
    document.body.style.overflow = savedOverflow;
    cards.forEach(card => card.setAttribute('aria-expanded', 'false'));
    opener?.focus({ preventScroll: true });
    opener = null;
  });

  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) animations.forEach(animation => animation.cancel());
  });
  document.querySelectorAll('.people-hero-copy > *').forEach((target, index) => {
    const bounds = target.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
    animate(target,
      [{ transform: 'translateY(12px)', opacity: .35 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 560, easing, delay: index * 60, fill: 'backwards' }
    );
  });
})();
