// TK-088-FE — Auditoría de contraste WCAG 2.1 del Sistema FEFO v4.1.0 (ambos turnos).
// Fórmula de luminancia relativa WCAG + compositing sRGB de color-mix sobre fondo real.

const hex = (h) => {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const srgbToLin = (c) => {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
};
const relLum = (rgb) => {
  const [r, g, b] = rgb.map(srgbToLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg, bg) => {
  const l1 = relLum(fg), l2 = relLum(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};
// color-mix(in srgb, X p%, transparent) compuesto sobre `over`:
const mixOver = (x, p, over) => hex(x).map((c, i) => Math.round(p * c + (1 - p) * hex(over)[i]));

const THEMES = {
  DÍA: {
    'bg-root': '#efe8d8', 'bg-card': '#f7f2e6', 'rule': '#18140f',
    'color-primary': '#2e5f76', 'color-primary-on': '#fbf8ef', 'color-primary-text': '#244d61',
    'color-secondary': '#6e6555',
    'color-danger': '#b43a24', 'color-danger-text': '#a03420', 'color-danger-on': '#fbf8ef',
    'color-warning': '#8a6414', 'color-warning-text': '#6b4c0e',
    'color-success': '#3e6b3a', 'color-success-text': '#345c2f',
    'text-primary': '#18140f', 'text-secondary': '#6e6555',
  },
  NOCHE: {
    'bg-root': '#171c18', 'bg-card': '#1f251f', 'rule': '#e9e4d0',
    'color-primary': '#6faac7', 'color-primary-on': '#171c18', 'color-primary-text': '#6faac7',
    'color-secondary': '#9aa394',
    'color-danger': '#e1573a', 'color-danger-text': '#f0806a', 'color-danger-on': '#171c18',
    'color-warning': '#e6be55', 'color-warning-text': '#e6be55',
    'color-success': '#7cb36e', 'color-success-text': '#7cb36e',
    'text-primary': '#f2eedd', 'text-secondary': '#9aa394',
  },
};

// [nombre, fg(theme)->hex, bg(theme)->hex, objetivo, tipo]
const PAIRS = [
  ['text-primary / bg-root (label nav, cuerpo)', (t) => t['text-primary'], (t) => t['bg-root'], 7.0, 'texto'],
  ['text-primary / bg-card (tarjetas)', (t) => t['text-primary'], (t) => t['bg-card'], 7.0, 'texto'],
  ['text-secondary / bg-root', (t) => t['text-secondary'], (t) => t['bg-root'], 4.5, 'texto-sec'],
  ['text-secondary / bg-card (leyenda health bar)', (t) => t['text-secondary'], (t) => t['bg-card'], 4.5, 'texto-sec'],
  // UrgencyChip DÍA: -text sobre tinte 15% del color sobre bg-card ; NOCHE: color base sobre bg-card (contorno)
  ['UrgencyChip crítico (texto sobre su tinte/contorno)',
    (t) => t === THEMES.DÍA ? t['color-danger-text'] : t['color-danger-text'],
    (t) => t === THEMES.DÍA ? '#' + mixOver(t['color-danger'], 0.15, t['bg-card']).map((c) => c.toString(16).padStart(2, '0')).join('') : t['bg-card'],
    4.5, 'texto'],
  ['UrgencyChip atención',
    (t) => t === THEMES.DÍA ? t['color-warning-text'] : t['color-warning-text'],
    (t) => t === THEMES.DÍA ? '#' + mixOver(t['color-warning'], 0.15, t['bg-card']).map((c) => c.toString(16).padStart(2, '0')).join('') : t['bg-card'],
    4.5, 'texto'],
  ['UrgencyChip vigente',
    (t) => t === THEMES.DÍA ? t['color-success-text'] : t['color-success-text'],
    (t) => t === THEMES.DÍA ? '#' + mixOver(t['color-success'], 0.15, t['bg-card']).map((c) => c.toString(16).padStart(2, '0')).join('') : t['bg-card'],
    4.5, 'texto'],
  // ActionButton relleno DÍA / contorno NOCHE (icono = elemento gráfico, 3:1)
  ['ActionButton extract (icono sobre relleno/contorno)',
    (t) => t === THEMES.DÍA ? t['color-danger-on'] : t['color-danger'],
    (t) => t === THEMES.DÍA ? t['color-danger'] : t['bg-card'], 3.0, 'gráfico'],
  ['ActionButton add',
    (t) => t === THEMES.DÍA ? t['color-primary-on'] : t['color-primary'],
    (t) => t === THEMES.DÍA ? t['color-primary'] : t['bg-card'], 3.0, 'gráfico'],
  ['ActionButton recipe',
    (t) => t === THEMES.DÍA ? t['color-primary-on'] : t['color-warning'],
    (t) => t === THEMES.DÍA ? t['color-warning'] : t['bg-card'], 3.0, 'gráfico'],
  // RowButton--urgent: TEXTO sobre relleno sólido --color-danger (ambos turnos)
  ['RowButton--urgent (texto "-1.0"/"Usar")', (t) => t['color-danger-on'], (t) => t['color-danger'], 4.5, 'texto'],
  // RowButton--default: texto --bg-root sobre relleno --rule
  ['RowButton--default (texto sobre --rule)', (t) => t['bg-root'], (t) => t['rule'], 4.5, 'texto'],
  // Wordmark barra lateral: --bg-root sobre --rule (display, AAA)
  ['Wordmark sidebar (--bg-root sobre --rule)', (t) => t['bg-root'], (t) => t['rule'], 7.0, 'texto'],
  // Nav activa: borde --color-primary sobre --bg-root (no textual, 3:1)
  ['Nav activa (borde --color-primary sobre --bg-root)', (t) => t['color-primary'], (t) => t['bg-root'], 3.0, 'gráfico'],
  // Indicador "Conectado": --color-success-text sobre --bg-card
  ['Indicador Conectado (--color-success-text sobre --bg-card)', (t) => t['color-success-text'], (t) => t['bg-card'], 4.5, 'texto'],
  // Cubetas panel Estado: -text variants sobre --bg-card (números grandes, AAA-large 4.5, AAA 7 deseable)
  ['Cubeta Vigentes (--color-success-text sobre --bg-card)', (t) => t['color-success-text'], (t) => t['bg-card'], 4.5, 'texto-grande'],
  ['Cubeta Próximo (--color-warning-text sobre --bg-card)', (t) => t['color-warning-text'], (t) => t['bg-card'], 4.5, 'texto-grande'],
  ['Cubeta Críticos (--color-danger-text sobre --bg-card)', (t) => t['color-danger-text'], (t) => t['bg-card'], 4.5, 'texto-grande'],
  // btn-primary sólido (Estaciones "Extraer de Bodega", etc.): --color-primary-on sobre --color-primary
  ['btn-primary sólido (--color-primary-on sobre --color-primary)', (t) => t['color-primary-on'], (t) => t['color-primary'], 4.5, 'texto'],
  ['btn-danger sólido (--color-danger-on sobre --color-danger)', (t) => t['color-danger-on'], (t) => t['color-danger'], 4.5, 'texto'],
];

let fails = 0;
for (const [tname, theme] of Object.entries(THEMES)) {
  console.log(`\n═══ TURNO ${tname} ═══`);
  console.log('ratio  | AA  | AAA | par');
  for (const [name, fg, bg, target, kind] of PAIRS) {
    const r = ratio(hex(fg(theme)), hex(bg(theme)));
    const aa = kind === 'gráfico' ? r >= 3 : (kind === 'texto-sec' || kind === 'texto-grande') ? r >= 3 : r >= 4.5;
    const aaa = kind === 'gráfico' ? r >= 3 : (kind === 'texto-sec' || kind === 'texto-grande') ? r >= 4.5 : r >= 7;
    const ok = r >= target;
    if (!ok) fails++;
    console.log(`${r.toFixed(2).padStart(5)} | ${aa ? '✓' : '✗'}  | ${aaa ? '✓' : '✗'}  | ${name}  (obj ≥${target})${ok ? '' : '  ⚠️ FALLA OBJETIVO'}`);
  }
}
console.log(`\n${fails === 0 ? '✅ Todos los pares cumplen su objetivo.' : `⚠️ ${fails} par(es) por debajo de su objetivo.`}`);
