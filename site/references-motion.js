/* Références HYPHENS : données à compléter avec les opérations validées. */
(() => {
  'use strict';

  const dialog = document.querySelector('#project-dialog');
  const sheet = dialog?.querySelector('.project-sheet');
  const cards = [...document.querySelectorAll('.project-card[data-project]')];
  const status = document.querySelector('#projects-status');
  if (!dialog || !sheet || typeof dialog.showModal !== 'function') return;

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const easing = getComputedStyle(document.documentElement).getPropertyValue('--ui-ease').trim() || 'cubic-bezier(.22,1,.36,1)';
  const animations = new Set();
  let projects = new Map();
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

  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  // Seuls les visuels du site sont consommés, sans HTML fourni par les données.
  function localImage(value) {
    if (!text(value)) return null;
    try {
      const url = new URL(value, document.baseURI);
      return url.origin === location.origin && ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }

  function renderVisual(project, target) {
    if (!target) return;
    const source = localImage(project.image);
    target.replaceChildren();
    if (source) {
      const image = document.createElement('img');
      image.src = source;
      image.alt = text(project.imageAlt);
      image.decoding = 'async';
      image.addEventListener('error', () => {
        const placeholder = document.createElement('span');
        placeholder.textContent = 'Photo à ajouter';
        target.replaceChildren(placeholder);
      }, { once: true });
      target.append(image);
    } else {
      const placeholder = document.createElement('span');
      placeholder.textContent = 'Photo à ajouter';
      target.append(placeholder);
    }
  }

  function renderProject(project) {
    const title = text(project.title) || 'Nom de l’opération à renseigner';
    dialog.querySelector('#project-title').textContent = title;
    renderVisual(project, dialog.querySelector('#project-visual'));
    const facts = dialog.querySelector('#project-facts');
    facts.replaceChildren();
    [
      ['location', 'Localisation'], ['mission', 'Mission HYPHENS'],
      ['client', 'Maîtrise d’ouvrage'], ['architect', 'Architecte'],
      ['year', 'Année'], ['area', 'Surface']
    ].forEach(([key, label]) => {
      const value = text(project[key]);
      if (!value) return;
      const group = document.createElement('div');
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = label;
      detail.textContent = value;
      group.append(term, detail);
      facts.append(group);
    });
    if (!facts.children.length) {
      const group = document.createElement('div');
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = 'L’opération';
      detail.textContent = 'Les informations de cette opération seront ajoutées ici.';
      group.append(term, detail);
      facts.append(group);
    }
    let hasPresentation = false;
    ['description', 'challenges', 'contribution'].forEach(key => {
      const content = dialog.querySelector(`#project-${key}`);
      const value = text(project[key]);
      content.textContent = value;
      content.closest('.project-detail').hidden = !value;
      hasPresentation ||= Boolean(value);
    });
    const empty = dialog.querySelector('#project-empty');
    empty.textContent = 'La présentation détaillée de cette référence sera ajoutée ici.';
    empty.hidden = hasPresentation;
  }

  function openProject(card) {
    if (dialog.open || closing) return;
    const project = projects.get(card.dataset.project);
    if (!project) return;
    renderProject(project);
    opener = card;
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    card.setAttribute('aria-expanded', 'true');
    dialog.removeAttribute('data-closing');
    dialog.showModal();
    sheet.querySelector('.project-sheet-scroll').scrollTop = 0;
    dialog.querySelector('[data-close-project]')?.focus({ preventScroll: true });
    sheetAnimation = animate(sheet,
      [{ transform: 'translateX(40px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }],
      { duration: 420, easing }
    );
  }

  async function closeProject() {
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
    card.disabled = true;
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-controls', dialog.id);
    card.setAttribute('aria-expanded', 'false');
    card.addEventListener('click', () => openProject(card));
  });
  dialog.querySelectorAll('[data-close-project]').forEach(button => button.addEventListener('click', closeProject));
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeProject();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = sheet.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeProject();
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
  document.querySelectorAll('.projects-hero-copy > *').forEach((target, index) => {
    const bounds = target.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
    animate(target,
      [{ transform: 'translateY(12px)', opacity: .35 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 560, easing, delay: index * 60, fill: 'backwards' }
    );
  });

  fetch('assets/references.json')
    .then(response => {
      if (!response.ok) throw new Error('Références indisponibles');
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error('Format de références invalide');
      projects = new Map(data.filter(project => project && text(project.id)).map(project => [project.id, project]));
      if (cards.some(card => !projects.has(card.dataset.project))) throw new Error('Références incomplètes');
      cards.forEach(card => {
        const project = projects.get(card.dataset.project);
        const title = text(project.title) || 'Nom de l’opération à renseigner';
        const heading = card.querySelector('[data-project-title]');
        if (heading) heading.textContent = title;
        card.setAttribute('aria-label', `Découvrir la référence : ${title}`);
        if (project.image) renderVisual(project, card.querySelector('[data-project-visual]'));
        card.disabled = false;
      });
      if (status) status.hidden = true;
    })
    .catch(() => {
      cards.forEach(card => { card.disabled = true; });
      if (status) {
        status.textContent = 'Les fiches ne sont pas disponibles pour le moment. Rechargez la page pour réessayer.';
        status.hidden = false;
      }
    });
})();
