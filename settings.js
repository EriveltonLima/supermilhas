/* Configuração compartilhada entre popup e content script. */
(function attachMilhasSettings(global) {
  'use strict';

  const DEFAULT_SETTINGS = Object.freeze({
    latam: 18,
    avios: 39,
    smiles: null,
    azul: null,
    aegean: 68,
    pixKey: 'erivelton.lima.tech@gmail.com'
  });

  function normalizeCpm(value) {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    const text = String(value).trim().replace(/\s+/g, '');
    const brazilianGrouped = /^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/;
    const usGrouped = /^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/;
    const simpleDecimal = /^\d+(?:[.,]\d+)?$/;
    if (!brazilianGrouped.test(text) && !usGrouped.test(text) && !simpleDecimal.test(text)) return null;

    let normalized = text;
    if (text.includes(',') && text.includes('.')) {
      normalized = text.lastIndexOf(',') > text.lastIndexOf('.')
        ? text.replace(/\./g, '').replace(',', '.')
        : text.replace(/,/g, '');
    } else if (text.includes(',')) {
      normalized = text.replace(',', '.');
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  function mergeSettings(raw = {}) {
    const latam = normalizeCpm(raw.latam);
    const avios = normalizeCpm(raw.avios);
    const aegean = normalizeCpm(raw.aegean);
    return {
      latam: latam ?? DEFAULT_SETTINGS.latam,
      avios: avios ?? DEFAULT_SETTINGS.avios,
      smiles: normalizeCpm(raw.smiles),
      azul: normalizeCpm(raw.azul),
      aegean: aegean ?? DEFAULT_SETTINGS.aegean,
      pixKey: typeof raw.pixKey === 'string' && raw.pixKey.trim()
        ? raw.pixKey.trim()
        : DEFAULT_SETTINGS.pixKey
    };
  }

  global.MilhasSettings = Object.freeze({ DEFAULT_SETTINGS, normalizeCpm, mergeSettings });
}(globalThis));
