(() => {
  'use strict';

  const { DEFAULT_SETTINGS, mergeSettings, normalizeCpm } = globalThis.MilhasSettings;
  const fields = ['latam', 'avios', 'smiles', 'azul', 'aegean', 'pixKey'];
  const form = document.querySelector('#settingsForm');
  const status = document.querySelector('#status');
  const pixKey = document.querySelector('#pixKey');
  const copyPix = document.querySelector('#copyPix');

  function formatInput(value) {
    return value === null || value === undefined ? '' : String(value).replace('.', ',');
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function fillForm(rawSettings) {
    const settings = mergeSettings(rawSettings);
    fields.forEach((field) => {
      document.querySelector(`#${field}`).value = field === 'pixKey' ? settings[field] : formatInput(settings[field]);
    });
    copyPix.disabled = !settings.pixKey;
  }

  function saveSettings(event) {
    event.preventDefault();
    const raw = {};
    ['latam', 'avios', 'smiles', 'azul', 'aegean'].forEach((field) => {
      const value = document.querySelector(`#${field}`).value;
      raw[field] = value === '' ? null : normalizeCpm(value);
    });
    raw.pixKey = pixKey.value.trim();

    if (!raw.latam || !raw.avios) {
      setStatus('LATAM Pass e Avios precisam de CPM maior que zero.');
      return;
    }
    chrome.storage.local.set(raw, () => {
      fillForm(raw);
      setStatus('Configurações salvas. Recarregue o Seats.aero se necessário.');
    });
  }

  async function copyDonationKey() {
    const value = pixKey.value.trim();
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setStatus('Chave Pix copiada. Obrigado pelo apoio!');
  }

  chrome.storage.local.get(DEFAULT_SETTINGS, fillForm);
  form.addEventListener('submit', saveSettings);
  pixKey.addEventListener('input', () => { copyPix.disabled = !pixKey.value.trim(); });
  copyPix.addEventListener('click', () => { copyDonationKey().catch(() => setStatus('Não foi possível copiar a chave Pix.')); });
})();
