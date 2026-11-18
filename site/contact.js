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

  for (const key of ['name', 'message']) {
    const input = form.elements[key];
    input.addEventListener('input', () => input.setCustomValidity(''));
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const key of ['name', 'message']) {
      const input = form.elements[key];
      input.setCustomValidity(input.value.trim() ? '' : 'Veuillez renseigner ce champ.');
    }
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    const clean = key => String(values[key] || '').trim();
    previewText.textContent = [
      'HYPHENS | Présentation de projet', '',
      `Nom : ${clean('name')}`,
      `Organisation : ${clean('organisation') || 'Non précisée'}`,
      `Email : ${clean('email')}`,
      `Besoin : ${clean('mission')}`, '', clean('message')
    ].join('\n');
    form.hidden = true;
    preview.hidden = false;
    status.textContent = '';
    document.querySelector('#project-preview-title').focus();
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
