import * as si from 'simple-icons';
import fs from 'fs';

const byTitle = new Map();
for (const k of Object.keys(si)) { const i = si[k]; if (i && i.title) byTitle.set(i.title.toLowerCase(), i); }

// extra availability probe
const probe = ['PythonAnywhere','Google','Kubernetes','Dialogflow','Amazon','Assembly','GNU Bash','Markdown','Pytest','Sentence Transformers'];
console.log('--- PROBE ---');
for (const p of probe) console.log(' ', p.padEnd(24), byTitle.has(p.toLowerCase()) ? 'YES ' + byTitle.get(p.toLowerCase()).hex : 'no');

// ---------------------------------------------------------------------------
// Per-theme brand colours.
//
// A brand colour is kept EXACTLY as-is when it already clears 3:1 against the
// surface it sits on (WCAG 2.2 non-text contrast, which is what a logo is).
// When it does not, it is blended toward white on the dark theme, or toward
// black on the light theme, until it passes. Blending preserves hue — an
// earlier attempt scaled RGB channels instead and turned pandas magenta.
//
// Both themes have to be computed. The first version of this file lifted every
// mark toward white for the dark canvas only, which left 18 of 38 logos
// invisible once a light theme existed (JavaScript sat at 1.21:1).
// ---------------------------------------------------------------------------

const SURFACE_DARK = '#161F3C';
const SURFACE_LIGHT = '#EFF2F7';
const MIN_RATIO = 3;

const expand = (hex) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return h.toLowerCase();
};

function lum(hex) {
  const h = expand(hex);
  const v = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}

function ratio(a, b) {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Blend `hex` toward white or black until it clears MIN_RATIO on `surface`. */
function fit(hex, surface) {
  if (ratio(hex, surface) >= MIN_RATIO) return '#' + expand(hex);

  const h = expand(hex);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const toward = lum(surface) < 0.5 ? 255 : 0;
  const out = (a) => '#' + a.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');

  for (let t = 0.02; t <= 1.0001; t += 0.02) {
    const mixed = out([r, g, b].map((c) => c + (toward - c) * t));
    if (ratio(mixed, surface) >= MIN_RATIO) return mixed;
  }
  return toward === 255 ? '#ffffff' : '#000000';
}

/** Rewrite every fill in a multi-colour inline SVG for one theme. */
function fitSvg(svg, surface) {
  return svg.replace(/fill="(#[0-9A-Fa-f]{3,6})"/g, (_, c) => `fill="${fit(c, surface)}"`);
}

/** Simple Icons: one path, one brand colour, fitted per theme. */
const S = (title, label) => {
  const i = byTitle.get(title.toLowerCase());
  if (!i) { console.error('MISSING simple-icon:', title); return null; }
  const raw = '#' + i.hex;
  return {
    label: label || i.title,
    src: 'si',
    path: i.path,
    dark: fit(raw, SURFACE_DARK),
    light: fit(raw, SURFACE_LIGHT),
    raw,
  };
};

/**
 * Devicon: full multi-colour markup.
 *
 * Two-or-three-colour marks are refitted per theme like any other. A truly
 * polychrome mark cannot be — Matplotlib's nine fills span near-black to
 * near-white, so pushing them all one direction collapses the rainbow into
 * mud. Those keep their real colours and sit on a neutral plate, which is the
 * background they were drawn for in the first place.
 */
const PLATE_MIN_FILLS = 4;

const D = (dir, file, label) => {
  const p = `node_modules/devicon/icons/${dir}/${file}`;
  if (!fs.existsSync(p)) { console.error('MISSING devicon:', p); return null; }
  const svg = fs.readFileSync(p, 'utf8')
    .replace(/<\?xml[^>]*\?>/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  const fills = new Set((svg.match(/fill="#[0-9A-Fa-f]{3,6}"/g) || []));
  if (fills.size >= PLATE_MIN_FILLS) {
    return { label, src: 'dv', plate: true, svg };
  }

  return {
    label,
    src: 'dv',
    plate: false,
    svgDark: fitSvg(svg, SURFACE_DARK),
    svgLight: fitSvg(svg, SURFACE_LIGHT),
  };
};

/**
 * Hand-authored and extracted marks, for technologies neither package covers.
 *
 * Same shape as a Simple Icon, so they go through `fit()` and are audited by
 * `npm run contrast` like everything else. `viewBox` is optional and defaults
 * to the 24x24 grid Simple Icons uses.
 *
 *  - SQL and Assembly have no logo to license: SQL is an ISO standard and
 *    "assembly" is a family of languages. Both are drawn here, in-house, on the
 *    Simple Icons grid. (AssemblyScript and WebAssembly exist in the packages
 *    but are different technologies — using either would be a lie.)
 *  - Observe is a real company mark, lifted from their own wordmark SVG and
 *    reduced to the arc-over-ring glyph. Nominative use, brand colour intact.
 */
const C = ({ label, path, hex, note, viewBox }) => ({
  label,
  src: 'si',
  path,
  dark: fit(hex, SURFACE_DARK),
  light: fit(hex, SURFACE_LIGHT),
  raw: '#' + expand(hex),
  ...(note ? { note } : {}),
  ...(viewBox ? { viewBox } : {}),
});

const CUSTOM = {
  sql: {
    label: 'SQL',
    hex: '#7BA7D4',
    path: [
      'M12 2C7.03 2 3 3.343 3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5c0-1.657-4.03-3-9-3z',
      'M12 3.4c3.866 0 7 .717 7 1.6s-3.134 1.6-7 1.6S5 5.883 5 5s3.134-1.6 7-1.6z',
      'M5 9.06c1.79.9 4.28 1.34 7 1.34s5.21-.44 7-1.34v1.98c-1.79.9-4.28 1.34-7 1.34s-5.21-.44-7-1.34V9.06z',
      'M5 15.06c1.79.9 4.28 1.34 7 1.34s5.21-.44 7-1.34v1.98c-1.79.9-4.28 1.34-7 1.34s-5.21-.44-7-1.34v-1.98z',
    ].join(' '),
  },
  assembly: {
    label: 'Assembly',
    note: 'x86 · LC-3',
    hex: '#9AA4B8',
    path: [
      'M9 1h1.6v2.4H9zM13.4 1H15v2.4h-1.6zM9 20.6h1.6V23H9zM13.4 20.6H15V23h-1.6z',
      'M1 9h2.4v1.6H1zM1 13.4h2.4V15H1zM20.6 9H23v1.6h-2.4zM20.6 13.4H23V15h-2.4z',
      'M5 3.4h14a1.6 1.6 0 0 1 1.6 1.6v14a1.6 1.6 0 0 1-1.6 1.6H5A1.6 1.6 0 0 1 3.4 19V5A1.6 1.6 0 0 1 5 3.4z',
      'M8.2 8.2h7.6v7.6H8.2z',
    ].join(' '),
  },
  observe: {
    label: 'Observe',
    hex: '#00A259',
    viewBox: '0 0 27 30',
    path:
      'M0 5.307l2.796 2.785A15.069 15.069 0 0 1 13.18 4.008 15.068 15.068 0 0 1 23.53 8.183l2.696-2.881a18.851 18.851 0 0 0-13.114-5.3A18.851 18.851 0 0 0 0 5.308v-.001z M5.247 15.493a9.321 9.321 0 0 1 3.272-3.399 8.565 8.565 0 0 1 8.98 0 9.495 9.495 0 0 1 3.295 3.412 9.275 9.275 0 0 1 .938 6.968 9.306 9.306 0 0 1-4.222 5.632 8.772 8.772 0 0 1-8.991.013 9.069 9.069 0 0 1-3.272-3.35 9.523 9.523 0 0 1 0-9.276zm2.51 7.857a6.331 6.331 0 0 0 2.234 2.34c.93.58 2.005.882 3.1.873a5.637 5.637 0 0 0 3.043-.857 6.208 6.208 0 0 0 2.185-2.341 6.92 6.92 0 0 0-.012-6.515 6.314 6.314 0 0 0-2.22-2.366 5.848 5.848 0 0 0-6.145 0 6.254 6.254 0 0 0-2.197 2.366 6.742 6.742 0 0 0-.808 3.263 6.52 6.52 0 0 0 .82 3.237z',
  },
};

/** No logo exists — a mono monogram tile. */
const T = (label, note) => ({ label, src:'txt', note: note||'' });

const groups = [
  { name:'Languages', items:[
    S('Python'), D('java','java-original.svg','Java'), S('C'), S('TypeScript'), S('JavaScript'),
    D('matlab','matlab-original.svg','MATLAB'), S('TradingView','Pine Script'),
    S('HTML5','HTML'), S('CSS'), S('LaTeX'), C(CUSTOM.assembly), C(CUSTOM.sql)
  ]},
  { name:'ML & Data', items:[
    S('PyTorch'), S('NumPy'), S('SciPy'), D('matplotlib','matplotlib-original.svg','Matplotlib'),
    S('pandas'), S('Meta','FAISS'), S('Hugging Face','sentence-transformers'),
    S('Google Gemini','Gemini API'), S('Google Colab'), S('Jupyter')
  ]},
  { name:'Web', items:[
    S('React'), S('Astro'), S('Django'), S('Flask'), S('Tailwind CSS'),
    S('Chart.js'), S('Streamlit'), S('Node.js')
  ]},
  { name:'Cloud & Infrastructure', items:[
    D('amazonwebservices','amazonwebservices-original-wordmark.svg','AWS'),
    T('ECS Fargate','AWS'), T('EKS','AWS'),
    S('Terraform'), S('Docker'), S('Vercel'), S('Supabase'), S('PostgreSQL'), S('SQLite'), S('PythonAnywhere')
  ]},
  { name:'Tools & Observability', items:[
    S('Git'), S('GitHub'), S('Datadog'), C(CUSTOM.observe), S('JUnit5','JUnit'),
    S('Google','Google OR-Tools'), S('Dialogflow','Dialogflow CX'), T('Finnhub API'), T('YFinance')
  ]}
].map(g => ({ ...g, items: g.items.filter(Boolean) }));

fs.writeFileSync('src/data/icons.json', JSON.stringify(groups, null, 1));
const n = groups.reduce((a,g)=>a+g.items.length,0);
console.log(`\nwrote icons.json — ${groups.length} groups, ${n} entries`);
console.log('adjusted brand colours (kept as-is where already legible):');
for (const g of groups) {
  for (const i of g.items) {
    if (i.src !== 'si') continue;
    const d = i.dark.toLowerCase() !== i.raw.toLowerCase() ? i.dark : '     —     ';
    const l = i.light.toLowerCase() !== i.raw.toLowerCase() ? i.light : '     —     ';
    if (d.trim() !== '—' || l.trim() !== '—') {
      console.log(`  ${i.label.padEnd(22)} ${i.raw}   dark ${d}   light ${l}`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * skills.json — the editorial layer the Stack page actually renders.
 * Regenerating icons.json must not clobber hand-authored `usedIn`
 * links, so existing entries are merged forward by id.
 * ------------------------------------------------------------------ */

const SKILLS = 'src/data/skills.json';
const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const previous = new Map(
  (fs.existsSync(SKILLS) ? JSON.parse(fs.readFileSync(SKILLS, 'utf8')) : []).map(
    (s) => [s.id, s],
  ),
);

let order = 0;
const skills = groups.flatMap((g) =>
  g.items.map((i) => {
    const id = slug(i.label);
    const prior = previous.get(id);
    return {
      id,
      label: i.label,
      group: g.name,
      order: order++,
      ...(i.note ? { note: i.note } : {}),
      usedIn: prior?.usedIn ?? { jobs: [], projects: [] },
    };
  }),
);

fs.writeFileSync(SKILLS, JSON.stringify(skills, null, 2) + '\n');
const kept = skills.filter((s) => previous.has(s.id)).length;
console.log(
  `wrote ${SKILLS} — ${skills.length} entries (${kept} merged from existing)`,
);
