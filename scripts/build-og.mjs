/**
 * Open Graph card generator — `npm run og`.
 *
 * Writes public/og.png (1200x630), the image every page shares when a link is
 * pasted into Slack, iMessage, LinkedIn or X.
 *
 * Deliberately NOT part of `npm run build`: the card changes about once a year,
 * it needs the network to fetch the real fonts, and CI should not depend on
 * fonts.googleapis.com being reachable. Run it by hand, commit the PNG.
 *
 * Colours are copied from src/styles/global.css rather than parsed, because
 * this runs outside the browser where the tokens live. `npm run contrast` does
 * not see this file — if the palette changes, update the block below to match.
 */
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const T = {
  canvas: '#0B1328',
  hairline: '#26314F',
  text: '#EDEEF2',
  prose: '#B7BCCB',
  muted: '#8F96AC',
  accent: '#B3A369',
};

const OUT = 'public/og.png';
const CACHE = 'node_modules/.cache/og-fonts';

/** Google serves TTF to user agents it does not recognise, which is what we want. */
async function font(family, weight) {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, `${family.replace(/\s+/g, '-')}-${weight}.ttf`);
  if (fs.existsSync(file)) return fs.readFileSync(file);

  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { 'User-Agent': 'og-builder' } },
  ).then((r) => r.text());

  const url = css.match(/src:\s*url\((https:[^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error(`no TTF in the Google Fonts response for ${family} ${weight}`);

  const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
  fs.writeFileSync(file, buf);
  return buf;
}

const mono = (size, color, letterSpacing = 2) => ({
  fontFamily: 'IBM Plex Mono',
  fontSize: size,
  color,
  letterSpacing,
  textTransform: 'uppercase',
});

const card = {
  type: 'div',
  props: {
    style: {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: T.canvas,
      padding: '64px 72px',
    },
    children: [
      /* mark */
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center', ...mono(20, T.text, 0) },
          children: [
            { type: 'span', props: { style: { fontFamily: 'Archivo', fontWeight: 800 }, children: 'RW' } },
            { type: 'span', props: { style: { fontFamily: 'Archivo', fontWeight: 800, color: T.accent }, children: '.' } },
          ],
        },
      },

      /* name + positioning line */
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column' },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: 'Archivo',
                  fontWeight: 800,
                  fontSize: 104,
                  lineHeight: 1,
                  letterSpacing: -3.6,
                  color: T.text,
                  textTransform: 'uppercase',
                  display: 'flex',
                },
                children: 'Ryan Walker',
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  marginTop: 26,
                  maxWidth: 860,
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 27,
                  lineHeight: 1.5,
                  color: T.prose,
                  display: 'flex',
                },
                children:
                  'Third-year CS at Georgia Tech — cloud infrastructure and tooling at Sonatype, and a production options-risk platform of my own.',
              },
            },
          ],
        },
      },

      /* footer rule */
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${T.hairline}`,
            paddingTop: 24,
          },
          children: [
            {
              type: 'div',
              props: {
                style: { display: 'flex', ...mono(19, T.muted) },
                children: 'Georgia Tech · BS Computer Science · Atlanta',
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', ...mono(19, T.accent) },
                children: 'ryanthw.github.io',
              },
            },
          ],
        },
      },
    ],
  },
};

const svg = await satori(card, {
  width: 1200,
  height: 630,
  fonts: [
    { name: 'Archivo', data: await font('Archivo', 800), weight: 800, style: 'normal' },
    { name: 'IBM Plex Sans', data: await font('IBM Plex Sans', 400), weight: 400, style: 'normal' },
    { name: 'IBM Plex Mono', data: await font('IBM Plex Mono', 500), weight: 500, style: 'normal' },
  ],
});

const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
fs.writeFileSync(OUT, png);
console.log(`${OUT} — ${(png.length / 1024).toFixed(0)} KB, 1200x630`);
