(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    navigation.removeAttribute('data-open');
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    navigation.toggleAttribute('data-open', open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  matchMedia('(min-width: 1001px)').addEventListener('change', closeMenu);
  document.documentElement.dataset.navigation = 'ready';

  const form = document.querySelector('#project-form');
  const fields = document.querySelector('#project-fields');
  const preview = document.querySelector('#project-preview');
  const previewText = document.querySelector('#project-preview-text');
  const status = document.querySelector('#project-status');
  fields.disabled = false;
  const requestedMission = new URL(location.href).searchParams.get('mission');
  if ([...form.elements.mission.options].some(option => option.value === requestedMission)) form.elements.mission.value = requestedMission;

  const $ = selector => form.querySelector(selector);
  const rules = {
    name: () => form.elements.name.value.trim() ? '' : 'Indiquez votre nom.',
    reach: () => {
      const email = form.elements.email.value.trim();
      const phone = form.elements.phone.value.trim();
      if (!email && !phone) return 'Indiquez un email ou un téléphone, l’un des deux suffit.';
      if (email && !form.elements.email.checkValidity()) return 'Cette adresse email semble incomplète.';
      if (phone && phone.replace(/\D/g, '').length < 6) return 'Ce numéro de téléphone semble incomplet.';
      return '';
    },
    message: () => form.elements.message.value.trim() ? '' : 'Décrivez brièvement votre projet.'
  };
  const targets = {
    name: ['#contact-name'], reach: ['#contact-email', '#contact-phone'], message: ['#contact-message']
  };
  function showError(key, text) {
    const box = $(`#contact-${key}-error`);
    box.textContent = text;
    targets[key].forEach(selector => {
      const field = $(selector);
      if (text) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
    });
    box.closest('.contact-group, .contact-field')?.toggleAttribute('data-invalid', Boolean(text));
  }
  const steps = [...document.querySelectorAll('.contact-steps li')];
  function updateSteps() {
    const done = [
      !rules.name(),
      !rules.reach(),
      !rules.message()
    ];
    steps.forEach((step, index) => step.toggleAttribute('data-done', done[index]));
    form.querySelectorAll('.contact-group').forEach((group, index) => group.toggleAttribute('data-done', done[index]));
  }
  const counter = $('#contact-message-count');
  function updateCount() { counter.textContent = `${form.elements.message.value.length} / 4000`; }
  form.addEventListener('input', event => {
    const field = event.target;
    for (const key of Object.keys(targets)) {
      if (targets[key].some(selector => $(selector) === field) && field.hasAttribute('aria-invalid')) showError(key, rules[key]());
    }
    if (field === form.elements.message) updateCount();
    updateSteps();
  });
  form.addEventListener('focusout', event => {
    const field = event.target;
    for (const key of Object.keys(targets)) {
      if (!targets[key].some(selector => $(selector) === field)) continue;
      // L'erreur de contact n'apparaît qu'une fois les deux champs quittés ou remplis d'une valeur invalide.
      if (key === 'reach' && !form.elements.email.value.trim() && !form.elements.phone.value.trim()) continue;
      if (field.value.trim() || key === 'name' || key === 'message') showError(key, rules[key]());
    }
    updateSteps();
  });
  updateCount();
  updateSteps();
  form.addEventListener('submit', event => {
    event.preventDefault();
    let first = null;
    for (const key of Object.keys(targets)) {
      const text = rules[key]();
      showError(key, text);
      if (text && !first) first = $(targets[key][0]);
    }
    updateSteps();
    if (first) { first.focus(); return; }
    const values = Object.fromEntries(new FormData(form));
    const clean = key => String(values[key] || '').trim();
    previewText.textContent = [
      'HYPHENS | Présentation de projet', '',
      `Nom : ${clean('name')}`,
      `Organisation : ${clean('organisation') || 'Non précisée'}`,
      `Email : ${clean('email') || 'Non précisé'}`,
      `Téléphone : ${clean('phone') || 'Non précisé'}`,
      `Besoin : ${clean('mission')}`, '', clean('message')
    ].join('\n');
    form.hidden = true;
    preview.hidden = false;
    status.textContent = '';
    document.querySelector('#project-preview-title').focus();
    preview.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  document.querySelector('#edit-project').addEventListener('click', () => {
    preview.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
  document.querySelector('#copy-project').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(previewText.textContent);
      status.textContent = 'Votre message est copié.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(previewText);
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Votre message est sélectionné. Utilisez Ctrl+C ou le bouton Télécharger.';
    }
  });
  document.querySelector('#download-project').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([previewText.textContent], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hyphens-mon-projet.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Le téléchargement de votre message a été demandé.';
  });
})();
