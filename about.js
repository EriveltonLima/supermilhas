(() => {
  'use strict';
  const pixValue = document.querySelector('#pixValue');
  const copyButton = document.querySelector('#copyPix');
  const status = document.querySelector('#copyStatus');
  const version = document.querySelector('#version');
  let pixKey = '';

  version.textContent = `v${chrome.runtime.getManifest().version}`;
  chrome.storage.local.get(globalThis.MilhasSettings.DEFAULT_SETTINGS, (raw) => {
    pixKey = globalThis.MilhasSettings.mergeSettings(raw).pixKey;
    pixValue.textContent = pixKey || 'Configure uma chave Pix no popup';
    copyButton.disabled = !pixKey;
  });

  copyButton.addEventListener('click', async () => {
    if (!pixKey) return;
    try {
      await navigator.clipboard.writeText(pixKey);
      status.textContent = 'Chave Pix copiada. Obrigado por apoiar o desenvolvedor!';
    } catch (_error) {
      status.textContent = 'Não foi possível copiar. Selecione a chave Pix manualmente.';
    }
  });
})();
