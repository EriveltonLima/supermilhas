(() => {
  'use strict';

  function refreshAnnotations(savedSettings) {
    if (!globalThis.MilhasCalculator || !globalThis.MilhasSettings) return;
    const settings = globalThis.MilhasSettings.mergeSettings(savedSettings);
    globalThis.MilhasCalculator.setCpms(settings);
    globalThis.MilhasCalculator.annotateDocument(document);
  }

  function loadSettings() {
    if (!globalThis.chrome?.storage?.local) return;
    globalThis.chrome.storage.local.get(globalThis.MilhasSettings.DEFAULT_SETTINGS, refreshAnnotations);
    globalThis.chrome.storage.onChanged.addListener((_changes, areaName) => {
      if (areaName !== 'local') return;
      globalThis.chrome.storage.local.get(globalThis.MilhasSettings.DEFAULT_SETTINGS, refreshAnnotations);
    });
  }

  function start() {
    if (!globalThis.MilhasCalculator || globalThis.__milhasCalculatorObserver) return;
    globalThis.__milhasCalculatorObserver = globalThis.MilhasCalculator.observeDocument(document);
    loadSettings();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
