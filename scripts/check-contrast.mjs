/**
 * Contrast audit over the shipped design tokens.
 *
 * Parses src/styles/global.css rather than a hand-kept copy, so this can never
 * drift from what actually renders. Run with `npm run contrast`; the GitHub
 * Actions build runs it too, so a token change that breaks WCAG AA fails CI
 * instead of shipping.
 */
import fs from 'node:fs';

const css = fs.readFileSync('src/styles/global.css', 'utf8');

/**
 * Pull one theme's custom properties out of its declaration block.
 *
 * Must match `[data-theme="x"] {` specifically — a plain indexOf also hits the
 * `@custom-variant` line at the top of the file and silently parses the wrong
 * block, which makes both themes report identical numbers and every check pass.
 */
function tokens(theme) {
  const re = new RegExp(`\\[data-theme="${theme}"\\][^{;]*\\{`, 'g');
  const match = [...css.matchAll(re)].find(
    (m) => !css.slice(Math.max(0, m.index - 80), m.index).includes('@custom-variant'),
  );
  if (!match) throw new Error(`No declaration block for [data-theme="${theme}"]`);

  const open = match.index + match[0].length - 1;
  const close = css.indexOf('}', open);
  const body = css.slice(open, close);

  const out = {};
  for (const [, k, v] of body.matchAll(/--([\w-]+):\s*(#[0-9A-Fa-f]{6})/g)) {
    out[k] = v.toUpperCase();
  }

  const required = ['canvas', 'surface', 'hairline', 'text', 'prose', 'muted', 'faint', 'accent', 'on-accent', 'monogram-border', 'icon-plate'];
  const missing = required.filter((k) => !out[k]);
  if (missing.length) {
    throw new Error(`[data-theme="${theme}"] is missing: ${missing.join(', ')}`);
  }
  return out;
}

const lum = (raw) => {
  let h = raw.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const hex = '#' + h;
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const l = c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
};

const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Every foreground/background pair the site actually renders.
 * `min` follows WCAG 2.2: 4.5 for normal text, 3.0 for UI components and
 * focus indicators. Structural hairlines are decorative and reported only.
 */
const PAIRS = [
  ['text', 'canvas', 4.5, 'headings, primary text'],
  ['text', 'surface', 4.5, 'text on cards and tiles'],
  ['prose', 'canvas', 4.5, 'body paragraphs'],
  ['prose', 'surface', 4.5, 'body text on cards'],
  ['muted', 'canvas', 4.5, 'eyebrows, nav links, dates'],
  ['muted', 'surface', 4.5, 'labels on tiles'],
  ['faint', 'canvas', 4.5, 'footer meta'],
  ['faint', 'surface', 4.5, 'monogram sub-labels'],
  ['accent', 'canvas', 4.5, 'links, active state'],
  ['accent', 'surface', 4.5, 'accent on cards'],
  ['on-accent', 'accent', 4.5, 'text on the primary button'],
  ['accent', 'canvas', 3.0, 'focus ring on the page'],
  ['accent', 'surface', 3.0, 'focus ring on a card'],
];

const DECORATIVE = [
  ['hairline', 'canvas', 'dividers'],
  ['hairline', 'surface', 'card borders'],
  ['monogram-border', 'surface', 'monogram tile edge'],
  ['icon-plate', 'surface', 'polychrome logo plate'],
  ['surface', 'canvas', 'card lift off the page'],
];

let failed = 0;

for (const [label, selector] of [
  ['DARK', 'dark'],
  ['LIGHT', 'light'],
]) {
  const t = tokens(selector);
  console.log(`\n${label}  canvas ${t.canvas} · surface ${t.surface} · accent ${t.accent}`);

  for (const [fg, bg, min, why] of PAIRS) {
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (min ${min.toFixed(1)})  ` +
        `${fg} on ${bg}  — ${why}`,
    );
  }

  console.log('  decorative (no WCAG minimum, reported for judgement):');
  for (const [fg, bg, why] of DECORATIVE) {
    console.log(`         ${ratio(t[fg], t[bg]).toFixed(2).padStart(5)}:1  ${fg} on ${bg} — ${why}`);
  }
}

// Brand marks on the Stack tiles. A logo is a meaningful graphic, so 3:1
// (WCAG 2.2 SC 1.4.11). Each theme is checked against ITS OWN colour variant —
// checking one set of colours against both surfaces is what hid the original
// failure, where marks lifted for the dark canvas were invisible on light.
const registry = JSON.parse(fs.readFileSync('src/data/icons.json', 'utf8')).flatMap((g) => g.items);

for (const [label, theme] of [
  ['DARK', 'dark'],
  ['LIGHT', 'light'],
]) {
  const { surface } = tokens(theme);

  const marks = [];
  for (const i of registry) {
    if (i.src === 'si') {
      marks.push({ label: i.label, r: ratio(i[theme], surface) });
    } else if (i.src === 'dv') {
      // Grade a multi-colour mark on its most legible fill: the mark is
      // discernible if any part of it clears the threshold. A plated mark is
      // graded against its plate, which is the ground it actually sits on.
      const markup = i.plate ? i.svg : theme === 'dark' ? i.svgDark : i.svgLight;
      const ground = i.plate ? tokens(theme)['icon-plate'] : surface;
      const fills = [...new Set(markup.match(/fill="(#[0-9A-Fa-f]{3,6})"/g) || [])].map((f) =>
        f.slice(6, -1),
      );
      if (fills.length) {
        marks.push({
          label: i.label + (i.plate ? ' (plated)' : ''),
          r: Math.max(...fills.map((f) => ratio(f, ground))),
        });
      }
    }
  }

  const ranked = marks.sort((a, b) => a.r - b.r);
  const under = ranked.filter((i) => i.r < 3);
  if (under.length) failed++;
  console.log(
    `\n${label} logos on ${surface}: ${under.length ? 'FAIL' : 'PASS'}  ` +
      `min ${ranked[0].r.toFixed(2)}:1 (${ranked[0].label}), ${under.length} of ${ranked.length} under 3:1`,
  );
  if (under.length) {
    console.log('  ' + under.map((i) => `${i.label} ${i.r.toFixed(2)}`).join(', '));
  }
}

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll contrast checks passed');
process.exit(failed ? 1 : 0);
