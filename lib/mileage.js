/* Lógica sem dependências, carregada antes de content.js pelo Manifest V3. */
(function attachMilhasCalculator(global) {
  'use strict';

  const DEFAULT_CPM = Object.freeze({ avios: 55, latam: 25, smiles: null, azul: null, aegean: 68 });
  const CPM = { ...DEFAULT_CPM };

  function setCpms(settings = {}) {
    ['avios', 'latam', 'smiles', 'azul', 'aegean'].forEach((program) => {
      const value = Number(settings[program]);
      if (Number.isFinite(value) && value > 0) {
        CPM[program] = value;
      } else if (!Object.hasOwn(DEFAULT_CPM, program) || DEFAULT_CPM[program] === null) {
        CPM[program] = null;
      }
    });
    return Object.freeze({ ...CPM });
  }
  const QUANTITY = '(?:\\d{1,3}(?:[.\\s,]\\d{3})+|\\d+(?:[.,]\\d+)?[kK])';
  const AVIOS_PATTERN = new RegExp(`(${QUANTITY})\\s+(?:(Iberia|Finnair|Qatar)\\s+)?(Avios)\\b`, 'gi');
  const LATAM_PATTERN = new RegExp(`(${QUANTITY})\\s+(LATAM\\s+Pass|pontos\\s+LATAM|LATAM)\\b`, 'gi');
  const SMILES_PATTERN = new RegExp(`(${QUANTITY})\\s+(?:pontos\\s+)?(Smiles)\\b`, 'gi');
  const AZUL_PATTERN = new RegExp(`(${QUANTITY})\\s+(?:pontos\\s+)?(Azul(?:\\s+Fidelidade)?)\\b`, 'gi');
  const AEGEAN_PATTERN = new RegExp(`(${QUANTITY})\\s+(?:pontos\\s+)?(Aegean(?:\\s+Miles(?:\\+|\\s*&\\s*)Bonus)?)\\b`, 'gi');
  const LABEL_SELECTOR = '[data-milhas-calculator-label]';
  const LATAM_PARTNER_SELECTOR = '[data-milhas-calculator-latam-partner]';
  const FLAG_SELECTOR = '[data-milhas-calculator-flag]';
  const NAV_BADGE_SELECTOR = '[data-milhas-calculator-nav-badge]';
  const FEATURED_ROUTE_SELECTOR = '[data-milhas-calculator-featured-route]';
  const NAV_SEPARATOR_SELECTOR = '[data-milhas-calculator-nav-separator]';
  const LATAM_SEARCH_LINK_SELECTOR = '[data-milhas-calculator-latam-search]';
  const TARGET_ATTRIBUTE = 'data-milhas-calculator-annotated';
  const SEATS_TARGET_ATTRIBUTE = 'data-milhas-calculator-seats-annotated';
  const SEATS_TRIP_TARGET_ATTRIBUTE = 'data-milhas-calculator-seats-trip-annotated';
  const GOOGLE_FLIGHTS_TARGET_ATTRIBUTE = 'data-milhas-calculator-gfl-annotated';
  const EXCLUDED_SELECTOR = 'script, style, noscript, textarea, input, select, option, template';
  const SEATS_PROGRAMS = Object.freeze({
    'british airways club': { program: 'British Airways Club', cpmProgram: 'avios', latamPartner: true },
    'finnair plus': { program: 'Finnair Plus', cpmProgram: 'avios', latamPartner: true },
    'iberia plus': { program: 'Iberia Plus', cpmProgram: 'avios', latamPartner: true },
    'iberia club': { program: 'Iberia Club', cpmProgram: 'avios', latamPartner: true },
    'latam pass': { program: 'LATAM Pass', cpmProgram: 'latam', latamPartner: false },
    'gol smiles': { program: 'GOL Smiles', cpmProgram: 'smiles', latamPartner: false },
    'smiles': { program: 'Smiles', cpmProgram: 'smiles', latamPartner: false },
    'azul fidelidade': { program: 'Azul Fidelidade', cpmProgram: 'azul', latamPartner: false },
    'azul tudoazul': { program: 'Azul Fidelidade', cpmProgram: 'azul', latamPartner: false },
    'aegean miles+bonus': { program: 'Aegean Miles+Bonus', cpmProgram: 'aegean', latamPartner: false },
    'aegean miles & bonus': { program: 'Aegean Miles+Bonus', cpmProgram: 'aegean', latamPartner: false },
    'qatar airways privilege club': { program: 'Qatar Airways Privilege Club', cpmProgram: 'avios', latamPartner: true }
  });
  const SEATS_POINTS_PATTERN = new RegExp(`^\\s*(${QUANTITY})\\s+pts\\s*$`, 'i');
  const EXPLORE_REDEMPTION_PROGRAMS = Object.freeze({
    CM: 'Aegean Miles+Bonus',
    DL: 'LATAM Pass',
    AM: 'LATAM Pass',
    CX: 'Qatar Avios',
    AA: 'Qatar Avios'
  });
  const EXPLORE_NAV_BADGES = Object.freeze({
    '/finnair': ['Avios'],
    '/qatar': ['Avios'],
    '/azul': ['Azul'],
    '/smiles': ['Smiles'],
    '/delta': ['Parceira LATAM'],
    '/aeromexico': ['Parceira LATAM'],
    '/american': ['Busca Avios'],
    '/aeroplan': ['Busca Aegean'],
    '/united': ['Busca Aegean'],
    '/flyingblue': ['Busca parceiros'],
    '/qantas': ['Busca Avios'],
    '/alaska': ['Busca Avios', 'Parceira LATAM'],
    '/virginatlantic': ['Parceira LATAM']
  });
  const EXPLORE_NAV_PRIORITY = Object.freeze([
    '/qatar', '/american', '/finnair', '/azul', '/smiles',
    '/delta', '/aeromexico', '/aeroplan', '/united', '/flyingblue'
  ]);
  const QATAR_FEATURED_BUSINESS_ROUTES = new Set([
    'DOH-HEL', 'DOH-MAD', 'DOH-GRU', 'GRU-JFK', 'GRU-SEZ',
    'GRU-BKK', 'GRU-HKG', 'GRU-NRT', 'GRU-DPS', 'GRU-PER'
  ]);
  // Mapeamento fechado por prefixo IATA: a companhia operadora determina
  // a moeda própria usada no custo estimado do trip-card.
  const SEATS_FLIGHT_PREFIXES = Object.freeze({
    QR: { program: 'Qatar Avios', cpmProgram: 'avios' },
    BA: { program: 'British Airways Avios', cpmProgram: 'avios' },
    AY: { program: 'Finnair Avios', cpmProgram: 'avios' },
    IB: { program: 'Iberia Avios', cpmProgram: 'avios' },
    EI: { program: 'Aer Lingus Avios', cpmProgram: 'avios' },
    VY: { program: 'Vueling Avios', cpmProgram: 'avios' },
    LM: { program: 'Loganair Avios', cpmProgram: 'avios' },
    LA: { program: 'LATAM Pass', cpmProgram: 'latam' },
    A3: { program: 'Aegean Miles+Bonus', cpmProgram: 'aegean' },
    AD: { program: 'Azul Fidelidade', cpmProgram: 'azul' },
    G3: { program: 'GOL Smiles', cpmProgram: 'smiles' }
  });

  const LATAM_REGIONS = Object.freeze({
    AMS: { label: 'Am. Sul', economyFromBrazil: 24000 },
    AMC: { label: 'Am. Central', economyFromBrazil: 42000 },
    AMN: { label: 'Am. Norte', economyFromBrazil: 57000 },
    EUR: { label: 'Europa', economyFromBrazil: 80700 },
    OCE: { label: 'Oceania', economyFromBrazil: 95000 },
    OM: { label: 'Oriente Médio', economyFromBrazil: 121500 },
    AFR: { label: 'África', economyFromBrazil: 62000 },
    ASO: { label: 'Ásia Oriental', economyFromBrazil: 125500 },
    ASOC: { label: 'Ásia Ocidental', economyFromBrazil: 82500 }
  });

  const LATAM_BRAZIL_AIRPORTS = new Set([
    'GIG', 'GRU', 'CGH', 'SSA', 'REC', 'FOR', 'BSB', 'CNF', 'POA', 'FLN', 'VCP'
  ]);

  const LATAM_AIRPORT_REGION = Object.freeze({
    // Oriente Médio
    DOH: 'OM', AUH: 'OM', DXB: 'OM', BAH: 'OM', RUH: 'OM', JED: 'OM', RKT: 'OM',
    // Am. Norte
    JFK: 'AMN', LGA: 'AMN', EWR: 'AMN', MIA: 'AMN', FLL: 'AMN', ORD: 'AMN',
    DFW: 'AMN', LAX: 'AMN', SFO: 'AMN', ATL: 'AMN', BOS: 'AMN', IAD: 'AMN',
    SEA: 'AMN', MCO: 'AMN', CLT: 'AMN', YYZ: 'AMN', YVR: 'AMN', YUL: 'AMN',
    // Europa
    MAD: 'EUR', BCN: 'EUR', LHR: 'EUR', LGW: 'EUR', CDG: 'EUR', ORY: 'EUR',
    FRA: 'EUR', MUC: 'EUR', ZRH: 'EUR', AMS: 'EUR', FCO: 'EUR', MXP: 'EUR',
    LIS: 'EUR', OPO: 'EUR', HEL: 'EUR', CPH: 'EUR', ARN: 'EUR', OSL: 'EUR',
    VIE: 'EUR', DUB: 'EUR', BRU: 'EUR', GVA: 'EUR', IST: 'EUR', ATH: 'EUR',
    // Am. Central / Caribe
    MEX: 'AMC', CUN: 'AMC', HAV: 'AMC', PUJ: 'AMC', SDQ: 'AMC', AUA: 'AMC',
    PTY: 'AMC', SJO: 'AMC', NAS: 'AMC', MBJ: 'AMC', KIN: 'AMC', BZE: 'AMC',
    // Ásia Oriental
    NRT: 'ASO', HND: 'ASO', ICN: 'ASO', PEK: 'ASO', PVG: 'ASO', CAN: 'ASO',
    HKG: 'ASO', TPE: 'ASO', SIN: 'ASO', BKK: 'ASO', MNL: 'ASO', KUL: 'ASO',
    CGK: 'ASO', SGN: 'ASO', DPS: 'ASO',
    // Ásia Ocidental
    BOM: 'ASOC', DEL: 'ASOC', MAA: 'ASOC', BLR: 'ASOC', CCU: 'ASOC',
    // África
    JNB: 'AFR', CPT: 'AFR', LAD: 'AFR', ADD: 'AFR', CAI: 'AFR', LOS: 'AFR',
    // Oceania
    SYD: 'OCE', MEL: 'OCE', BNE: 'OCE', AKL: 'OCE', WLG: 'OCE',
    // Am. Sul
    EZE: 'AMS', AEP: 'AMS', SCL: 'AMS', LIM: 'AMS', BOG: 'AMS', UIO: 'AMS', MVD: 'AMS',
    // Brasil (a origem é tratada separadamente para consultar a coluna correta)
    GIG: null, GRU: null, CGH: null, SSA: null, REC: null, FOR: null,
    BSB: null, CNF: null, POA: null, FLN: null, VCP: null
  });

  function parseQuantity(value) {
    const compact = String(value).trim().replace(/\s+/g, '');
    if (/k$/i.test(compact)) {
      return Number.parseFloat(compact.slice(0, -1).replace(',', '.')) * 1000;
    }
    return Number(compact.replace(/[.,]/g, ''));
  }

  function extractCashAmount(text) {
    const value = String(text || '');
    // A LATAM identifica a parcela original como BRL. Não aceite R$ aqui:
    // esse formato é usado pelas próprias etiquetas do Supermilhas e poderia
    // fazer a extensão reler uma estimativa como se fosse dinheiro da tarifa.
    const brlMatches = Array.from(value.matchAll(/\bBRL\s*([\d.]+,\d{2})/gi));
    const brl = brlMatches[brlMatches.length - 1];
    if (brl) return Number(brl[1].replace(/\./g, '').replace(',', '.'));
    const spoken = /mais\s+([\d,]+\.\d{2})\s+Reais/i.exec(value);
    if (spoken) return Number(spoken[1].replace(/,/g, ''));
    return null;
  }

  function isIberiaPeak(date) {
    const m = date.getMonth(); // 0-indexed
    const d = date.getDate();
    const year = date.getFullYear();

    // 2027+ not yet published — use 2026 pattern as approximation
    // Natal/Ano Novo: 18 a 30 Dez e 1 a 7 Jan
    if (year <= 2026) {
      if ((m === 11 && d >= 18 && d <= 30) || (m === 0 && d >= 1 && d <= 7)) return true;
      // Easter 2026: 27/3–28/3, 1/4–6/4, 30/4
      if ((m === 2 && d >= 27 && d <= 28) || (m === 3 && d >= 1 && d <= 6) || (m === 3 && d === 30)) return true;
      // May 2026: 1–3, 14, 15, 17
      if (m === 4 && ((d >= 1 && d <= 3) || [14, 15, 17].includes(d))) return true;
      // Summer peak: 12 Jun – 17 Sep
      if ((m === 5 && d >= 12) || m === 6 || m === 7 || (m === 8 && d <= 17)) return true;
      // October: 8, 9, 12, 13, 30, 31
      if (m === 9 && [8, 9, 12, 13, 30, 31].includes(d)) return true;
      // November: 2, 5, 6, 7, 9, 10
      if (m === 10 && [2, 5, 6, 7, 9, 10].includes(d)) return true;
      // December: 3, 4, 8, 9 + 18–24, 26–30 (covered above)
      if (m === 11 && [3, 4, 8, 9].includes(d)) return true;
    } else {
      // 2027+ approximate: natal/verão
      if ((m === 11 && d >= 15) || (m === 0 && d <= 10) || (m === 5 && d >= 15) || m === 6 || m === 7 || (m === 8 && d <= 17)) return true;
    }
    return false;
  }

  function getLatamRegion(code) {
    const region = LATAM_AIRPORT_REGION[code.toUpperCase()];
    if (!region) return null;
    const info = LATAM_REGIONS[region];
    return info ? { region, label: info.label } : null;
  }

  function getLatamFixedEconomyValue(origin, destination) {
    if (!LATAM_BRAZIL_AIRPORTS.has(String(origin || '').toUpperCase())) return null;
    const destinationRegion = getLatamRegion(String(destination || ''));
    if (!destinationRegion) return null;
    const quantity = LATAM_REGIONS[destinationRegion.region]?.economyFromBrazil;
    return Number.isFinite(quantity) ? { ...destinationRegion, quantity } : null;
  }

  function parseSeatsDate(text) {
    const match = /[A-Z][a-z]{2},\s+(\w+)\s+(\d{1,2}),\s+(\d{4})/.exec(text);
    if (!match) return null;
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const month = months[match[1]];
    if (month === undefined) return null;
    return new Date(Number(match[3]), month, Number(match[2]));
  }

  function getActiveCabin(document) {
    const activeTab = document.querySelector('[role="tablist"] [role="tab"][aria-selected="true"]');
    if (activeTab) return activeTab.textContent.trim();
    return null;
  }

  function findMentions(text) {
    const mentions = [];
    const collect = (pattern, kind) => {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const quantity = parseQuantity(match[1]);
        if (!Number.isFinite(quantity) || quantity <= 0) continue;
        if (!Number.isFinite(CPM[kind]) || CPM[kind] <= 0) continue;
        const program = kind === 'avios'
          ? (match[2] ? `${match[2]} ${match[3]}` : match[3])
          : match[2];
        mentions.push({ quantity, program, cpmProgram: kind, cpm: CPM[kind], index: match.index });
      }
    };
    collect(AVIOS_PATTERN, 'avios');
    collect(LATAM_PATTERN, 'latam');
    collect(SMILES_PATTERN, 'smiles');
    collect(AZUL_PATTERN, 'azul');
    collect(AEGEAN_PATTERN, 'aegean');
    return mentions.sort((a, b) => a.index - b.index);
  }

  function calculateCost(quantity, cpm) {
    return (quantity / 1000) * cpm;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(value);
  }

  function formatFixedTableValue(quantity, cpmProgram, unit) {
    const cpm = CPM[cpmProgram];
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(cpm) || cpm <= 0) return '';
    const points = quantity.toLocaleString('pt-BR');
    const cost = formatCurrency(calculateCost(quantity, cpm));
    return `${points} ${unit} · ≈ ${cost}`;
  }

  function createLabel(document, mention) {
    const cost = formatCurrency(calculateCost(mention.quantity, mention.cpm));
    const label = document.createElement('span');
    label.className = 'milhas-calculator-label';
    label.setAttribute('data-milhas-calculator-label', 'true');
    if (mention.cpmProgram) {
      label.setAttribute('data-milhas-calculator-currency', mention.cpmProgram);
    }
    // Não usar live region: a alteração automática não deve interromper leitores de tela.
    label.setAttribute('aria-label', `Custo estimado para ${mention.program}: ${cost}`);
    label.textContent = `≈ ${cost}`;
    return label;
  }

  function createMissingCpmLabel(document, program) {
    const label = document.createElement('span');
    label.className = 'milhas-calculator-label milhas-calculator-label--missing';
    label.setAttribute('data-milhas-calculator-label', 'true');
    label.textContent = `Defina o CPM ${program}`;
    label.title = 'Abra o popup do Supermilhas para configurar este CPM.';
    return label;
  }

  function removeLatamPartnerTag(programElement) {
    const tag = programElement.nextElementSibling;
    if (tag?.matches(LATAM_PARTNER_SELECTOR)) tag.remove();
  }

  function annotateLatamPartner(programElement, program) {
    removeLatamPartnerTag(programElement);
    if (!program.latamPartner) return;
    const tag = programElement.ownerDocument.createElement('span');
    tag.className = 'milhas-calculator-latam-partner';
    tag.setAttribute('data-milhas-calculator-latam-partner', 'true');
    tag.setAttribute('aria-label', `${program.program} é parceira resgatável da LATAM Pass`);
    tag.textContent = 'Parceira LATAM Pass';
    programElement.parentNode.insertBefore(tag, programElement.nextSibling);
  }

  function removeFlagTag(container) {
    const tag = container.querySelector(FLAG_SELECTOR);
    if (tag) tag.remove();
  }

  function createFlagTag(document, text) {
    const tag = document.createElement('span');
    tag.className = 'milhas-calculator-flag';
    tag.setAttribute('data-milhas-calculator-flag', 'true');
    tag.textContent = text;
    return tag;
  }

  function isExcluded(element) {
    return !element || element.nodeType !== 1 || element.matches(LABEL_SELECTOR) || element.matches(LATAM_PARTNER_SELECTOR) || element.matches(FLAG_SELECTOR) || element.matches(NAV_BADGE_SELECTOR) || element.matches(FEATURED_ROUTE_SELECTOR) || element.matches(NAV_SEPARATOR_SELECTOR) || element.matches(LATAM_SEARCH_LINK_SELECTOR)
      || Boolean(element.closest(`${LABEL_SELECTOR}, ${LATAM_PARTNER_SELECTOR}, ${FLAG_SELECTOR}, ${NAV_BADGE_SELECTOR}, ${FEATURED_ROUTE_SELECTOR}, ${NAV_SEPARATOR_SELECTOR}, ${LATAM_SEARCH_LINK_SELECTOR}, ${EXCLUDED_SELECTOR}`))
      || element.isContentEditable
      || Boolean(element.closest('[contenteditable]:not([contenteditable="false"])'));
  }

  function removeLabels(element) {
    let label = element.nextElementSibling;
    while (label?.matches(LABEL_SELECTOR)) {
      const nextLabel = label.nextElementSibling;
      label.remove();
      label = nextLabel;
    }
  }

  function removeLabelBefore(element) {
    const prev = element.previousElementSibling;
    if (prev?.matches(LABEL_SELECTOR)) prev.remove();
  }

  // Cada elemento é avaliado somente pelo seu texto direto. Isso impede que um
  // contêiner e um descendente recebam etiquetas para a mesma menção.
  function annotateElement(element) {
    if (isExcluded(element)) return false;
    if (isLatamDocument(element.ownerDocument)) {
      const wasAnnotated = element.hasAttribute(TARGET_ATTRIBUTE);
      if (wasAnnotated) {
        removeLabels(element);
        element.removeAttribute(TARGET_ATTRIBUTE);
      }
      return wasAnnotated;
    }
    const text = Array.from(element.childNodes)
      .filter((node) => node.nodeType === 3)
      .map((node) => node.nodeValue)
      .join('');
    const mentions = findMentions(text);
    const wasAnnotated = element.hasAttribute(TARGET_ATTRIBUTE);
    if (!mentions.length && !wasAnnotated) return false;

    removeLabels(element);
    if (!mentions.length) {
      element.removeAttribute(TARGET_ATTRIBUTE);
      return wasAnnotated;
    }

    element.setAttribute(TARGET_ATTRIBUTE, 'true');
    const reference = element.nextSibling;
    mentions.forEach((mention) => {
      element.parentNode.insertBefore(createLabel(element.ownerDocument, mention), reference);
    });
    return true;
  }

  function isSeatsAeroDocument(document) {
    return document?.location?.hostname?.toLowerCase() === 'seats.aero';
  }

  function isSeatSpyDocument(document) {
    const hostname = document?.location?.hostname?.toLowerCase();
    return hostname === 'seatspy.com' || hostname === 'www.seatspy.com';
  }

  function isQatarDocument(document) {
    const hostname = document?.location?.hostname?.toLowerCase() || '';
    return hostname === 'qatarairways.com' || hostname.endsWith('.qatarairways.com');
  }

  function isLatamDocument(document) {
    const hostname = document?.location?.hostname?.toLowerCase() || '';
    return hostname === 'latamairlines.com' || hostname.endsWith('.latamairlines.com');
  }

  function isGoogleFlightsDocument(document) {
    const hostname = document?.location?.hostname?.toLowerCase() || '';
    return hostname.includes('google') && document.location.pathname.startsWith('/travel/flights');
  }

  function parseGflDateFromUrl(url) {
    const yyyymmdd = /itinerary=.*?-(\d{4})(\d{2})(\d{2})/.exec(url || '');
    if (yyyymmdd) {
      return new Date(Number(yyyymmdd[1]), Number(yyyymmdd[2]) - 1, Number(yyyymmdd[3]));
    }
    return null;
  }

  function parseGflDateFromAriaLabel(text) {
    const months = { janeiro: 0, fevereiro: 1, março: 2, março: 2, abril: 3, maio: 4, junho: 5, julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11, jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
    // "dia sexta-feira, agosto 14" or "dia sexta-feira, outubro 9"
    const match = /dia\s+\w+,?\s+(\w+)\s+(\d{1,2})/i.exec(text);
    const yearMatch = /\b(20\d{2})\b/.exec(text);
    if (match && yearMatch) {
      const month = months[match[1].toLowerCase().slice(0, 3)];
      if (month !== undefined) {
        return new Date(Number(yearMatch[1]), month, Number(match[2]));
      }
    }
    return null;
  }

  function parseGflDateFromEoText(text) {
    // "16:30 em sex., 14 de ago."
    const months = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
    const match = /(\d{1,2})\s+de\s+(\w+)/i.exec(text);
    const yearMatch = /\b(20\d{2})\b/.exec(text);
    if (match && yearMatch) {
      const month = months[match[2].slice(0, 3)];
      if (month !== undefined) {
        return new Date(Number(yearMatch[1]), month, Number(match[1]));
      }
    }
    return null;
  }

  function extractFlightDateFromRow(row) {
    const envUrl = row.querySelector('[data-travelimpactmodelwebsiteurl]')?.getAttribute('data-travelimpactmodelwebsiteurl');
    const urlDate = parseGflDateFromUrl(envUrl);
    if (urlDate) return urlDate;

    const ariaLabel = row.querySelector('[aria-label*="dia"]')?.getAttribute('aria-label') || '';
    const ariaDate = parseGflDateFromAriaLabel(ariaLabel);
    if (ariaDate) return ariaDate;

    const eoText = row.querySelector('.eoY5cb')?.textContent || '';
    const eoDate = parseGflDateFromEoText(eoText);
    if (eoDate) return eoDate;

    return null;
  }

  function extractGoogleFlightsDate(document) {
    const url = document.location.href;
    const urlDates = Array.from(url.matchAll(/(\d{4})-(\d{2})-(\d{2})/g));
    const choosingReturn = /escolher\s+volta/i.test(document.body?.textContent || '');
    const dateMatch = choosingReturn && urlDates.length > 1 ? urlDates[1] : urlDates[0];
    if (dateMatch) {
      return new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]));
    }
    const dateEls = document.querySelectorAll('.S90skc, [data-iso]');
    for (const el of dateEls) {
      const iso = el.getAttribute('data-iso');
      if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const [y, m, d] = iso.split('-');
        return new Date(Number(y), Number(m) - 1, Number(d));
      }
    }
    return null;
  }

  function annotateGoogleFlights(document) {
    if (!isGoogleFlightsDocument(document)) return 0;
    const globalDate = extractGoogleFlightsDate(document);
    let annotated = 0;
    const candidateRows = new Set();
    document.querySelectorAll('.yR1fYc, li[role="listitem"], [role="listitem"]').forEach((row) => {
      const text = row.textContent || '';
      if (/\bLATAM\b/i.test(text) || row.querySelector('[style*="LA.png"]')) candidateRows.add(row);
    });

    candidateRows.forEach((row) => {
      if (!row.matches('.yR1fYc') && row.querySelector('.yR1fYc')) return;
      // O Google pode reconstruir parcialmente o resultado, removendo nosso
      // link mas preservando atributos do nó externo. A presença do botão —
      // não apenas do marcador — é a fonte de verdade.
      if (row.querySelector(LATAM_SEARCH_LINK_SELECTOR)) return;
      const routeMatch = /\b([A-Z]{3})\s*[–—-]\s*([A-Z]{3})\b/.exec(row.textContent || '');
      const origin = row.querySelector('.G2WY5c')?.textContent.trim() || routeMatch?.[1] || '';
      const destination = row.querySelector('.c8rWCd')?.textContent.trim() || routeMatch?.[2] || '';
      if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) return;

      const date = extractFlightDateFromRow(row) || globalDate;
      const href = buildLatamSearchUrl(origin, destination, date);

      const link = document.createElement('a');
      link.className = 'milhas-calculator-latam-search milhas-calculator-google-flights-link';
      link.setAttribute('data-milhas-calculator-latam-search', 'true');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Milhas ↗';
      link.href = href;
      link.title = `Consultar ${origin} \u2192 ${destination} no LATAM Pass — disponibilidade não garantida`;
      link.addEventListener('click', (event) => event.stopPropagation());

      const gKm = row.querySelector('.gKm0ye');
      if (gKm) {
        gKm.parentNode.insertBefore(link, gKm.nextSibling);
      } else {
        row.appendChild(link);
      }

      row.setAttribute(GOOGLE_FLIGHTS_TARGET_ATTRIBUTE, 'true');
      annotated += 1;
    });
    return annotated;
  }

  function getLatamEstimate(quantity, cashAmount) {
    const milesCost = calculateCost(quantity, CPM.latam);
    const milesText = formatCurrency(milesCost);
    if (!Number.isFinite(cashAmount) || cashAmount < 0) {
      return {
        text: `Milhas ≈ ${milesText}`,
        aria: `Custo estimado das milhas LATAM Pass: ${milesText}`
      };
    }
    const totalText = formatCurrency(milesCost + cashAmount);
    return {
      text: `Milhas ≈ ${milesText} · Total ≈ ${totalText}`,
      aria: `Custo estimado das milhas LATAM Pass: ${milesText}. Total com dinheiro: ${totalText}`
    };
  }

  function getNativeFareText(element) {
    if (!element) return '';
    const clone = element.cloneNode(true);
    clone.querySelectorAll(LABEL_SELECTOR).forEach((label) => label.remove());
    clone.querySelectorAll('span, div').forEach((candidate) => {
      if (/^\s*milhas\s*≈/i.test(candidate.textContent || '')
        && !Array.from(candidate.children).some((child) => /^\s*milhas\s*≈/i.test(child.textContent || ''))) {
        candidate.remove();
      }
    });
    return clone.textContent || '';
  }

  function hasNestedLatamMilesAmount(element) {
    if (!element?.querySelectorAll) return false;
    return Array.from(element.querySelectorAll('span.latam-typography')).some((candidate) =>
      /^\s*(\d{1,3}(?:[.\s,]\d{3})+|\d+(?:[.,]\d+)?[kK]?)\s+milhas/i.test(candidate.textContent || '')
    );
  }

  function upsertLatamPageLabel(document, container, quantity, cashAmount = null) {
    if (!Number.isFinite(quantity) || quantity <= 0 || !container) return 0;
    container.querySelectorAll(`${LABEL_SELECTOR}:not([data-milhas-calculator-latam-page])`)
      .forEach((legacyLabel) => legacyLabel.remove());
    container.querySelectorAll('span, div').forEach((candidate) => {
      if (candidate.hasAttribute('data-milhas-calculator-latam-page')
        || candidate.querySelector('[data-milhas-calculator-latam-page]')) return;
      const text = candidate.textContent || '';
      const hasMatchingChild = Array.from(candidate.children)
        .some((child) => /^\s*milhas\s*≈/i.test(child.textContent || ''));
      if (/^\s*milhas\s*≈/i.test(text) && !hasMatchingChild) candidate.remove();
    });
    const estimate = getLatamEstimate(quantity, cashAmount);
    let label = container.querySelector('[data-milhas-calculator-latam-page]');
    if (!label) {
      label = createLabel(document, { quantity, program: 'LATAM Pass', cpmProgram: 'latam', cpm: CPM.latam });
      label.setAttribute('data-milhas-calculator-latam-page', 'true');
      container.appendChild(label);
    }
    label.textContent = estimate.text;
    label.setAttribute('aria-label', estimate.aria);
    return 1;
  }

  function annotateLatamAirlines(document) {
    if (!isLatamDocument(document)) return 0;
    let annotated = 0;

    document.querySelectorAll('#redemption-options-group [data-testid$="--radio"]').forEach((option) => {
      const aria = option.querySelector('input[aria-label]')?.getAttribute('aria-label') || '';
      const match = /(\d[\d.,\s]*)\s+Milhas/i.exec(aria)
        || /(\d{1,3}(?:[.\s,]\d{3})+|\d+)\s+milhas/i.exec(option.textContent);
      if (!match) return;
      const content = option.querySelector('label > div') || option.querySelector('label') || option;
      annotated += upsertLatamPageLabel(document, content, parseQuantity(match[1]), extractCashAmount(aria || option.textContent));
    });

    document.querySelectorAll('p.latam-typography').forEach((amount) => {
      const nativeText = getNativeFareText(amount);
      const match = /^\s*(\d{1,3}(?:[.\s,]\d{3})+|\d+)\s+milhas/i.exec(nativeText);
      if (!match) return;
      annotated += upsertLatamPageLabel(document, amount, parseQuantity(match[1]), extractCashAmount(nativeText));
    });

    document.querySelectorAll('span.latam-typography').forEach((amount) => {
      if (amount.closest('#redemption-options-group, p.latam-typography')) return;
      const oldLabel = amount.nextElementSibling?.matches('[data-milhas-calculator-latam-page]')
        ? amount.nextElementSibling
        : null;
      // A LATAM pode envolver o valor real em outro span.latam-typography que
      // também contém taxas em BRL. Anotar esse wrapper criaria uma segunda
      // etiqueta e trataria a taxa como se fosse uma opção Milhas + Dinheiro.
      if (hasNestedLatamMilesAmount(amount)) {
        oldLabel?.remove();
        return;
      }
      const nativeText = getNativeFareText(amount);
      const match = /^\s*(\d{1,3}(?:[.\s,]\d{3})+|\d+(?:[.,]\d+)?[kK])\s+milhas/i.exec(nativeText);
      if (!match) {
        oldLabel?.remove();
        return;
      }
      const quantity = parseQuantity(match[1]);
      if (!Number.isFinite(quantity) || quantity <= 0) return;
      const estimate = getLatamEstimate(quantity, extractCashAmount(nativeText));
      if (!oldLabel) {
        const label = createLabel(document, { quantity, program: 'LATAM Pass', cpmProgram: 'latam', cpm: CPM.latam });
        label.setAttribute('data-milhas-calculator-latam-page', 'true');
        label.textContent = estimate.text;
        label.setAttribute('aria-label', estimate.aria);
        amount.parentNode.insertBefore(label, amount.nextSibling);
      } else {
        if (oldLabel.textContent !== estimate.text) oldLabel.textContent = estimate.text;
        oldLabel.setAttribute('aria-label', estimate.aria);
      }
      annotated += 1;
    });
    return annotated;
  }

  function annotateQatarPointsElement(document, element, quantity, kind) {
    const oldLabel = element.querySelector(':scope > [data-milhas-calculator-qatar]');
    if (!Number.isFinite(quantity) || quantity <= 0) {
      oldLabel?.remove();
      return 0;
    }
    const cost = formatCurrency(calculateCost(quantity, CPM.avios));
    if (!oldLabel) {
      const label = createLabel(document, { quantity, program: 'Qatar Avios', cpmProgram: 'avios', cpm: CPM.avios });
      label.setAttribute('data-milhas-calculator-qatar', kind);
      element.appendChild(label);
    } else {
      if (oldLabel.textContent !== `≈ ${cost}`) oldLabel.textContent = `≈ ${cost}`;
      oldLabel.setAttribute('aria-label', `Custo estimado para Qatar Avios: ${cost}`);
    }
    return 1;
  }

  function annotateQatarAirways(document) {
    if (!isQatarDocument(document)) return 0;
    let annotated = 0;
    document.querySelectorAll('.cabin-class-price[aria-label]').forEach((price) => {
      const match = /^\s*([\d.,\s]+|\d+(?:[.,]\d+)?[kK])\s+Avios\s*$/i.exec(price.getAttribute('aria-label') || '');
      if (match) annotated += annotateQatarPointsElement(document, price, parseQuantity(match[1]), 'cabin');
    });
    document.querySelectorAll('.weekly-calendar__day__inner').forEach((day) => {
      const hasAvios = Array.from(day.querySelectorAll('.sr-only'))
        .some((element) => /^Avios$/i.test(element.textContent.trim()));
      if (!hasAvios) return;
      const directText = Array.from(day.childNodes)
        .filter((node) => node.nodeType === 3)
        .map((node) => node.nodeValue)
        .join(' ');
      const candidates = directText.match(/\d{1,3}(?:[.,\s]\d{3})+|\d+(?:[.,]\d+)?[kK]/g) || [];
      const quantities = candidates.map(parseQuantity).filter((value) => Number.isFinite(value) && value > 1000);
      if (quantities.length) annotated += annotateQatarPointsElement(document, day, Math.max(...quantities), 'calendar');
    });
    return annotated;
  }

  // O modal do SeatSpy não informa a unidade em cada célula. Limitamos a
  // leitura exclusivamente à linha "Points" para não converter assentos.
  function annotateSeatSpy(document) {
    if (!isSeatSpyDocument(document)) return 0;
    let annotated = 0;

    const annotatePointsCell = (cell, kind) => {
      const ownText = Array.from(cell.childNodes)
        .filter((node) => node.nodeType === 3)
        .map((node) => node.nodeValue)
        .join('').trim();
      const quantity = parseQuantity(ownText);
      const oldLabel = cell.querySelector(':scope > [data-milhas-calculator-seatspy]');
      if (!Number.isFinite(quantity) || quantity <= 0) {
        oldLabel?.remove();
        return;
      }
      const cost = formatCurrency(calculateCost(quantity, CPM.avios));
      if (!oldLabel) {
        const label = createLabel(document, { quantity, program: 'Avios', cpmProgram: 'avios', cpm: CPM.avios });
        label.setAttribute('data-milhas-calculator-seatspy', kind);
        cell.appendChild(label);
      } else {
        if (oldLabel.textContent !== `≈ ${cost}`) oldLabel.textContent = `≈ ${cost}`;
        oldLabel.setAttribute('aria-label', `Custo estimado para Avios: ${cost}`);
      }
      annotated += 1;
    };

    document.querySelectorAll('#modal-table-body tr').forEach((row) => {
      const title = row.querySelector('.modal-title')?.textContent.trim().toLowerCase();
      if (title !== 'points') return;
      row.querySelectorAll('td.bold').forEach((cell) => annotatePointsCell(cell, 'modal'));
    });

    // O calendário recria o conteúdo de #popover a cada hover. O observer
    // chama este adaptador novamente e converte todas as cabines exibidas.
    document.querySelectorAll('#popover td.popover-col-points, #modal-popover td.popover-col-points')
      .forEach((cell) => annotatePointsCell(cell, 'hover'));
    return annotated;
  }

  // Cada Booking Option do Seats.aero é um .booking-card. Os seletores
  // estáveis abaixo mantêm programa e pontos no mesmo cartão, sem inferir
  // relações entre elementos irmãos de opções diferentes.
  function annotateSeatsAero(document) {
    if (!isSeatsAeroDocument(document)) return 0;
    const root = document.body || document.documentElement;
    if (!root) return 0;

    // Extract contextual data from the dialog once
    const dateText = document.querySelector('.date-text')?.textContent || '';
    const flightDate = parseSeatsDate(dateText);
    const routeEl = document.querySelector('.route-airports');
    const routeAirports = routeEl
      ? (routeEl.textContent.match(/\b[A-Z]{3}\b/g) || [])
      : [];
    const routeOrigin = routeAirports[0] || '';
    const routeDest = routeAirports[routeAirports.length - 1] || '';
    const cabin = getActiveCabin(document);

    let annotated = 0;
    root.querySelectorAll('.booking-card').forEach((card) => {
      if (isExcluded(card)) return;
      const programElement = card.querySelector('.booking-program');
      const pointsElement = card.querySelector('.booking-points');
      if (!programElement || !pointsElement || isExcluded(pointsElement)) return;

      // Limpar flags e parceiras antigas ANTES de detectar o programa
      removeFlagTag(card);
      removeLatamPartnerTag(programElement);

      const programKey = programElement.textContent.trim().toLowerCase().replace(/\s+/g, ' ');
      const program = SEATS_PROGRAMS[programKey];
      const pointsMatch = SEATS_POINTS_PATTERN.exec(pointsElement.textContent);
      const displayedPoints = pointsMatch ? parseQuantity(pointsMatch[1]) : 0;
      // Parcerias dependem da companhia operadora, não do programa exibido
      // neste card. Elas são tratadas na aba Explore apenas para voos diretos.

      // Inserir flag como irmã após .booking-program (inline na mesma linha)
      const insertFlag = (text) => {
        const tag = createFlagTag(document, text);
        programElement.parentNode.insertBefore(tag, programElement.nextSibling);
        return tag;
      };

      if (program?.program === 'LATAM Pass') {
        annotateLatamProgramSearchLink(document, card, programElement, {
          origin: routeOrigin,
          destination: routeDest,
          date: flightDate,
          cabin: cabin || 'Economy'
        });
      }
      if (program && flightDate && (program.program === 'Iberia Plus' || program.program === 'Iberia Club')) {
        const season = isIberiaPeak(flightDate) ? 'Peak' : 'Off-Peak';
        const fixedValue = formatFixedTableValue(displayedPoints, 'avios', 'Avios');
        const operatingFlight = card.closest('.trip-card')?.querySelector('.flight-number-text')?.textContent.trim().toUpperCase() || '';
        const tableKind = operatingFlight.startsWith('QR')
          ? 'Tabela Iberia/Qatar · região + temporada'
          : 'Tabela Iberia · distância + temporada';
        const tag = insertFlag(`${tableKind} · ${season}${fixedValue ? ` · ${fixedValue}` : ''}`);
        tag.title = 'Confirme o valor final no Iberia Club.';
      } else if (program?.program === 'British Airways Club') {
        const tag = insertFlag('Tabela British · distância');
        tag.title = 'Confirme o valor final no British Airways Club.';
      } else if (program?.program === 'Finnair Plus') {
        const tag = insertFlag('Tabela Finnair');
        tag.title = 'Confirme o valor final no Finnair Plus.';
      } else if (program?.program === 'Qatar Airways Privilege Club') {
        const flightText = card.closest('.trip-card')?.querySelector('.flight-number-text')?.textContent.trim() || '';
        const ownFlight = flightText.toUpperCase().startsWith('QR');
        const tag = insertFlag(ownFlight
          ? 'Tabela Qatar · região + temporada'
          : 'Tabela Qatar parceiros · distância');
        tag.title = 'Valores podem variar por Peak/Off-Peak e tarifa Regular/Flexi. Confirme no Privilege Club.';
      }

      // O valor exibido é uma estimativa do Seats.aero. Em metal LATAM o
      // preço é dinâmico; em parceiras, a disponibilidade deve ser confirmada.
      if (program && program.program === 'LATAM Pass' && routeDest) {
        const operatingFlight = card.closest('.trip-card')?.querySelector('.flight-number-text')?.textContent.trim().toUpperCase() || '';
        const region = getLatamRegion(routeDest);
        if (operatingFlight.startsWith('LA')) {
          const tag = insertFlag('Preço dinâmico LATAM Pass');
          tag.title = 'Consulte o valor atualizado diretamente no LATAM Pass.';
        } else if (region) {
          const cabinLabel = cabin || '';
          const fixedEconomy = /^Economy$/i.test(cabinLabel)
            ? getLatamFixedEconomyValue(routeOrigin, routeDest)
            : null;
          const officialPoints = fixedEconomy?.quantity;
          const points = officialPoints || displayedPoints;
          const fixedValue = formatFixedTableValue(points, 'latam', 'milhas');
          const tableValue = `${region.label} · ${cabinLabel}${fixedValue ? ` · ${fixedValue}` : ''}`;
          const tag = insertFlag(`${officialPoints ? 'Tabela fixa LATAM' : 'Estimativa LATAM parceiro'}: ${tableValue}`);
          tag.title = 'Disponibilidade e valor não são garantidos. Confirme diretamente no LATAM Pass.';
        }
      }

      // Cost label
      const match = pointsMatch;
      const hasCpm = program && Number.isFinite(CPM[program.cpmProgram]) && CPM[program.cpmProgram] > 0;
      if (!program || !match || !hasCpm) {
        if (pointsElement.hasAttribute(SEATS_TARGET_ATTRIBUTE)) {
          removeLabelBefore(pointsElement);
          pointsElement.removeAttribute(SEATS_TARGET_ATTRIBUTE);
          pointsElement.removeAttribute(TARGET_ATTRIBUTE);
        }
        removeLabelBefore(pointsElement);
        if (program && match && !hasCpm) {
          pointsElement.parentNode.insertBefore(
            createMissingCpmLabel(document, program.program),
            pointsElement
          );
        }
        return;
      }

      const quantity = parseQuantity(match[1]);
      if (!Number.isFinite(quantity) || quantity <= 0) return;
      removeLabelBefore(pointsElement);
      pointsElement.setAttribute(TARGET_ATTRIBUTE, 'true');
      pointsElement.setAttribute(SEATS_TARGET_ATTRIBUTE, 'true');
      pointsElement.parentNode.insertBefore(
        createLabel(document, { quantity, program: program.program, cpmProgram: program.cpmProgram, cpm: CPM[program.cpmProgram] }),
        pointsElement
      );
      annotated += 1;
    });
    return annotated;
  }

  // O total do trip-card pertence ao programa pesquisado no Seats.aero,
  // não necessariamente à companhia operadora. Sem uma moeda explícita,
  // não fazemos conversão; as Booking Options abaixo são a fonte segura.
  function annotateSeatsTripCards(document) {
    if (!isSeatsAeroDocument(document)) return 0;
    const root = document.body || document.documentElement;
    if (!root) return 0;

    let annotated = 0;
    root.querySelectorAll('.trip-card').forEach((card) => {
      if (isExcluded(card)) return;
      const flightElement = card.querySelector('.flight-number-text');
      const pointsElement = card.querySelector('.trip-right .points');
      if (!flightElement || !pointsElement || isExcluded(pointsElement)) return;

      const flightText = flightElement.textContent.trim();
      const flightProgram = getFlightProgram(flightText);
      if (!flightProgram) return;

      removeLabelBefore(pointsElement);
      pointsElement.removeAttribute(TARGET_ATTRIBUTE);
      pointsElement.removeAttribute(SEATS_TRIP_TARGET_ATTRIBUTE);
      if (flightProgram.cpmProgram === 'latam') annotateLatamSearchLink(document, card, flightElement);
    });
    return annotated;
  }

  function formatLatamDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function buildLatamSearchUrl(origin, destination, date, cabin = 'Economy') {
    const base = 'https://www.latamairlines.com/br/pt/oferta-voos/';
    if (!/^[A-Z]{3}$/.test(origin || '') || !/^[A-Z]{3}$/.test(destination || '') || !formatLatamDate(date)) {
      return 'https://www.latamairlines.com/br/pt';
    }
    const params = new URLSearchParams({
      origin,
      outbound: formatLatamDate(date),
      destination,
      inbound: 'undefined', adt: '1', chd: '0', inf: '0', trip: 'OW',
      cabin: /business|executiva/i.test(cabin) ? 'Business' : 'Economy',
      redemption: 'true', sort: 'PRICE,asc'
    });
    return `${base}?${params.toString()}`;
  }

  function extractTripRoute(cardText, flightText) {
    const text = String(cardText);
    const flight = String(flightText).trim();
    const routeSection = flight && text.includes(flight) ? text.slice(0, text.indexOf(flight)) : text;
    const airports = routeSection.match(/\b[A-Z]{3}(?:\/[A-Z]{3})?\b/g) || [];
    if (airports.length < 2) return { origin: '', destination: '' };
    return {
      origin: airports[0].split('/')[0],
      destination: airports[airports.length - 1].split('/').pop()
    };
  }

  function annotateLatamSearchLink(document, card, flightElement) {
    const { origin, destination } = extractTripRoute(card.textContent, flightElement.textContent);
    const dateText = document.querySelector('.date-text')?.textContent
      || document.querySelector('[role="dialog"] h2')?.textContent
      || '';
    const date = parseSeatsDate(dateText);
    const href = buildLatamSearchUrl(origin, destination, date, getActiveCabin(document) || 'Economy');
    let link = card.querySelector(LATAM_SEARCH_LINK_SELECTOR);
    if (!link) {
      link = document.createElement('a');
      link.className = 'milhas-calculator-latam-search';
      link.setAttribute('data-milhas-calculator-latam-search', 'true');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Ver no LATAM Pass ↗';
      flightElement.parentNode.insertBefore(link, flightElement.nextSibling);
    }
    link.href = href;
    link.title = origin && destination && date
      ? `Buscar ${origin} → ${destination} com milhas LATAM Pass`
      : 'Abrir o LATAM Pass para consultar o valor em milhas';
    return link;
  }

  function annotateLatamProgramSearchLink(document, card, programElement, search) {
    const href = buildLatamSearchUrl(
      search.origin,
      search.destination,
      search.date,
      search.cabin
    );
    let link = card.querySelector(LATAM_SEARCH_LINK_SELECTOR);
    if (!link) {
      link = document.createElement('a');
      link.className = 'milhas-calculator-latam-search';
      link.setAttribute('data-milhas-calculator-latam-search', 'true');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Buscar no LATAM Pass ↗';
      programElement.parentNode.insertBefore(link, programElement.nextSibling);
    }
    link.href = href;
    link.title = search.origin && search.destination && search.date
      ? `Buscar ${search.origin} → ${search.destination} com milhas LATAM Pass`
      : 'Abrir o LATAM Pass para consultar o valor em milhas';
    return link;
  }

  function getFlightProgram(flightText) {
    const normalized = String(flightText).trim().toUpperCase();
    const prefix = Object.keys(SEATS_FLIGHT_PREFIXES).find((code) => normalized.startsWith(code));
    return prefix ? SEATS_FLIGHT_PREFIXES[prefix] : null;
  }

  function isDirectExploreTitle(title) {
    return String(title).split('•').some((part) => /^(direct|direto)$/i.test(part.trim()));
  }

  // Na aba Explore, o tooltip de cada badge lista as companhias que operam
  // aquele inventário. A etiqueta indica alternativas de resgate conhecidas,
  // mas não reaproveita o preço do programa pesquisado como se fosse do parceiro.
  // Tabelas fixas são sugeridas somente quando o Seats.aero confirma voo direto.
  function annotateSeatsExplore(document) {
    if (!isSeatsAeroDocument(document)) return 0;
    let annotated = 0;
    document.querySelectorAll('table tbody span.badge[data-bs-original-title]').forEach((badge) => {
      const cell = badge.parentElement;
      if (!cell) return;
      cell.querySelectorAll(':scope > [data-milhas-calculator-explore]').forEach((tag) => tag.remove());

      const title = badge.getAttribute('data-bs-original-title') || '';
      if (!isDirectExploreTitle(title)) return;
      const carrierSegment = title.split('•')
        .map((part) => part.trim())
        .find((part) => /^(?:[A-Z0-9]{2,3})(?:,\s*[A-Z0-9]{2,3})*$/.test(part));
      if (!carrierSegment) return;

      const programs = new Set(getAlternativePrograms(carrierSegment));
      programs.forEach((program) => {
        const tag = createFlagTag(document, `Possível resgate: ${program}`);
        tag.setAttribute('data-milhas-calculator-explore', 'true');
        tag.title = 'Confirme disponibilidade e preço diretamente no programa parceiro.';
        cell.appendChild(tag);
        annotated += 1;
      });
    });
    return annotated;
  }

  function getAlternativePrograms(carrierSegment) {
    const programs = new Set();
    String(carrierSegment).split(',').map((code) => code.trim().toUpperCase()).forEach((code) => {
      const program = EXPLORE_REDEMPTION_PROGRAMS[code];
      if (program) programs.add(program);
    });
    return Array.from(programs);
  }

  function getExploreNavBadges(pathname) {
    const normalized = String(pathname).replace(/\/$/, '').replace(/\/routes$/, '');
    return EXPLORE_NAV_BADGES[normalized] || [];
  }

  function getExploreBadgeKind(text) {
    const kinds = {
      Avios: 'avios', Azul: 'azul', Smiles: 'smiles',
      'Parceira LATAM': 'latam', 'Busca Avios': 'qatar',
      'Busca Aegean': 'aegean', 'Busca parceiros': 'search'
    };
    return kinds[text] || 'default';
  }

  function normalizeExplorePath(pathname) {
    return String(pathname).replace(/\/$/, '').replace(/\/routes$/, '');
  }

  function getExploreNavPriority(pathname) {
    const index = EXPLORE_NAV_PRIORITY.indexOf(normalizeExplorePath(pathname));
    return index < 0 ? Number.POSITIVE_INFINITY : index;
  }

  function getExploreNavGroup(pathname) {
    if (Number.isFinite(getExploreNavPriority(pathname))) return 0;
    return getExploreNavBadges(pathname).length ? 1 : 2;
  }

  function reorderExploreNav(document) {
    let moved = 0;
    document.querySelectorAll('.nav-menu').forEach((menu) => {
      const links = Array.from(menu.querySelectorAll(':scope > a.nav-menu-item[href]'));
      if (links.length < 2) return;
      const originalIndex = new Map(links.map((link, index) => [link, index]));
      const desired = [...links].sort((a, b) => {
        const aPath = new URL(a.getAttribute('href'), document.location.href).pathname;
        const bPath = new URL(b.getAttribute('href'), document.location.href).pathname;
        const groupDifference = getExploreNavGroup(aPath) - getExploreNavGroup(bPath);
        if (groupDifference !== 0) return groupDifference;
        const aPriority = getExploreNavPriority(aPath);
        const bPriority = getExploreNavPriority(bPath);
        return aPriority !== bPriority
          ? aPriority - bPriority
          : originalIndex.get(a) - originalIndex.get(b);
      });
      if (!links.every((link, index) => link === desired[index])) {
        desired.forEach((link) => menu.appendChild(link));
        moved += 1;
      }

      menu.querySelectorAll(`:scope > ${NAV_SEPARATOR_SELECTOR}`).forEach((separator) => separator.remove());
      const labels = ['Prioridade Brasil', 'Outras buscas úteis', 'Outros programas'];
      labels.forEach((label, group) => {
        const firstLink = desired.find((link) => {
          const path = new URL(link.getAttribute('href'), document.location.href).pathname;
          return getExploreNavGroup(path) === group;
        });
        if (!firstLink) return;
        const separator = document.createElement('div');
        separator.className = 'milhas-calculator-nav-separator';
        separator.setAttribute('data-milhas-calculator-nav-separator', 'true');
        separator.setAttribute('role', 'presentation');
        separator.textContent = label;
        menu.insertBefore(separator, firstLink);
      });
    });
    return moved;
  }

  function annotateSeatsExploreNav(document) {
    if (!isSeatsAeroDocument(document)) return 0;
    let annotated = reorderExploreNav(document);
    document.querySelectorAll('.nav-menu a.nav-menu-item[href]').forEach((link) => {
      let pathname;
      try {
        pathname = new URL(link.getAttribute('href'), document.location.href).pathname;
      } catch (_error) {
        return;
      }
      const wanted = getExploreNavBadges(pathname);
      const current = Array.from(link.querySelectorAll(`:scope > ${NAV_BADGE_SELECTOR}`));
      const currentTexts = current.map((badge) => badge.textContent.trim());
      if (currentTexts.length === wanted.length && currentTexts.every((text, index) => text === wanted[index])) return;
      current.forEach((badge) => badge.remove());
      wanted.forEach((text) => {
        const badge = document.createElement('span');
        badge.className = 'milhas-calculator-nav-badge';
        badge.setAttribute('data-milhas-calculator-nav-badge', 'true');
        badge.setAttribute('data-milhas-calculator-badge-kind', getExploreBadgeKind(text));
        badge.textContent = text;
        link.appendChild(badge);
        annotated += 1;
      });
    });
    return annotated;
  }

  function isQatarFeaturedBusinessRoute(origin, destination) {
    const forward = `${String(origin).toUpperCase()}-${String(destination).toUpperCase()}`;
    const reverse = `${String(destination).toUpperCase()}-${String(origin).toUpperCase()}`;
    return QATAR_FEATURED_BUSINESS_ROUTES.has(forward) || QATAR_FEATURED_BUSINESS_ROUTES.has(reverse);
  }

  function annotateQatarFeaturedRoutes(document) {
    if (!isSeatsAeroDocument(document) || !/^\/qatar(?:\/|$)/.test(document.location.pathname)) return 0;
    const table = document.querySelector('table');
    if (!table) return 0;
    const headers = Array.from(table.querySelectorAll('thead th'));
    const businessIndex = headers.findIndex((header) => /^(business|executiva)$/i.test(header.textContent.trim()));
    if (businessIndex < 0) return 0;

    let annotated = 0;
    table.querySelectorAll('tbody tr').forEach((row) => {
      row.querySelectorAll(FEATURED_ROUTE_SELECTOR).forEach((star) => star.remove());
      const origin = row.querySelector('a[href*="/departing/"]')?.textContent.trim();
      const destination = row.querySelector('a[href*="/arriving/"]')?.textContent.trim();
      if (!origin || !destination || !isQatarFeaturedBusinessRoute(origin, destination)) return;
      const cell = row.children[businessIndex];
      const points = cell?.querySelector('span.badge:not(.bg-secondary)');
      if (!points) return;
      const star = document.createElement('span');
      star.className = 'milhas-calculator-featured-route';
      star.setAttribute('data-milhas-calculator-featured-route', 'true');
      star.setAttribute('aria-label', 'Emissão executiva em destaque no Qatar Privilege Club');
      star.title = 'Rota destacada para emissão em Executiva com Qatar Privilege Club. Confirme disponibilidade e valor.';
      star.textContent = '★';
      points.parentNode.insertBefore(star, points);
      annotated += 1;
    });
    return annotated;
  }

  function collectCandidateElements(root, candidates) {
    if (!root) return;
    const document = root.ownerDocument || root;
    const showText = global.NodeFilter?.SHOW_TEXT || 4;
    const accept = global.NodeFilter?.FILTER_ACCEPT || 1;
    const reject = global.NodeFilter?.FILTER_REJECT || 2;
    const walker = document.createTreeWalker(root, showText, {
      acceptNode(node) {
        return node.nodeValue.trim() && !isExcluded(node.parentNode) ? accept : reject;
      }
    });
    let node;
    let foundText = false;
    while ((node = walker.nextNode())) {
      foundText = true;
      if (node.nodeValue.trim() && !isExcluded(node.parentNode)) candidates.add(node.parentNode);
    }
    // happy-dom ainda não percorre SHOW_TEXT; o fallback também visita somente
    // nós de texto e mantém o comportamento do TreeWalker no navegador.
    if (!foundText) {
      const stack = [root];
      while (stack.length) {
        const current = stack.pop();
        if (current.nodeType === 3) {
          if (current.nodeValue.trim() && !isExcluded(current.parentNode)) candidates.add(current.parentNode);
        } else if (!isExcluded(current)) {
          for (let index = current.childNodes.length - 1; index >= 0; index -= 1) {
            stack.push(current.childNodes[index]);
          }
        }
      }
    }
  }

  function annotateDocument(document) {
    const root = document.body || document.documentElement;
    if (!root) return 0;
    const candidates = new Set();
    collectCandidateElements(root, candidates);
    let annotated = 0;
    candidates.forEach((element) => { if (annotateElement(element)) annotated += 1; });
    if (isSeatsAeroDocument(document)) {
      annotated += annotateSeatsAero(document);
      annotated += annotateSeatsTripCards(document);
      annotated += annotateSeatsExplore(document);
      annotated += annotateSeatsExploreNav(document);
      annotated += annotateQatarFeaturedRoutes(document);
    }
    annotated += annotateSeatSpy(document);
    annotated += annotateQatarAirways(document);
    annotated += annotateLatamAirlines(document);
    annotated += annotateGoogleFlights(document);
    return annotated;
  }

  function observeDocument(document) {
    annotateDocument(document);
    const pending = new Set();
    let scheduled = false;
    const flush = () => {
      scheduled = false;
      const batch = Array.from(pending);
      pending.clear();
      batch.forEach(annotateElement);
      if (isSeatsAeroDocument(document)) {
        annotateSeatsAero(document);
        annotateSeatsTripCards(document);
        annotateSeatsExplore(document);
        annotateSeatsExploreNav(document);
        annotateQatarFeaturedRoutes(document);
      }
      annotateSeatSpy(document);
      annotateQatarAirways(document);
      annotateLatamAirlines(document);
      annotateGoogleFlights(document);
    };
    const queue = (element) => {
      if (!isExcluded(element)) pending.add(element);
      if (!scheduled) {
        scheduled = true;
        (global.queueMicrotask || ((callback) => Promise.resolve().then(callback)))(flush);
      }
    };
    const queueDescendantText = (node) => {
      if (node.nodeType === 3) {
        queue(node.parentElement);
      } else if (node.nodeType === 1 || node.nodeType === 11) {
        const candidates = new Set();
        collectCandidateElements(node, candidates);
        candidates.forEach(queue);
      }
    };
    const isOnlyLabelChange = (mutation) => {
      const removedLatamSearchLink = Array.from(mutation.removedNodes).some((node) => node.nodeType === 1
        && (node.matches(LATAM_SEARCH_LINK_SELECTOR) || node.querySelector?.(LATAM_SEARCH_LINK_SELECTOR)));
      if (removedLatamSearchLink && isGoogleFlightsDocument(document)) return false;
      const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
      return nodes.length > 0 && nodes.every((node) => node.nodeType === 1
        && (node.matches(LABEL_SELECTOR) || node.matches(LATAM_PARTNER_SELECTOR) || node.matches(FLAG_SELECTOR) || node.matches(NAV_BADGE_SELECTOR) || node.matches(FEATURED_ROUTE_SELECTOR) || node.matches(NAV_SEPARATOR_SELECTOR) || node.matches(LATAM_SEARCH_LINK_SELECTOR)));
    };
    const observer = new global.MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') {
          queue(mutation.target.parentElement);
        } else if (!isOnlyLabelChange(mutation)) {
          queue(mutation.target);
          mutation.addedNodes.forEach(queueDescendantText);
        }
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    return observer;
  }

  global.MilhasCalculator = Object.freeze({
    isIberiaPeak, getLatamRegion, getLatamFixedEconomyValue, parseSeatsDate, getActiveCabin, getFlightProgram, getExploreNavBadges, getExploreBadgeKind, getExploreNavPriority, getExploreNavGroup, getAlternativePrograms, isDirectExploreTitle, isQatarFeaturedBusinessRoute, buildLatamSearchUrl, extractTripRoute, setCpms, parseQuantity, extractCashAmount, getLatamEstimate, findMentions, calculateCost, formatCurrency, formatFixedTableValue, hasNestedLatamMilesAmount, annotateElement, annotateSeatsAero, annotateSeatsTripCards, annotateSeatsExplore, annotateSeatsExploreNav, annotateQatarFeaturedRoutes, annotateSeatSpy, annotateQatarAirways, annotateLatamAirlines, annotateGoogleFlights, annotateDocument, observeDocument
  });
}(globalThis));
