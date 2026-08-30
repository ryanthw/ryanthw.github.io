# ryanthw.github.io

Personal portfolio site — [ryanthw.github.io](https://ryanthw.github.io)

Astro + Tailwind CSS, statically built and deployed to GitHub Pages by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `main`.

## Commands

| Command | Does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Static build to `./dist` |
| `npm run preview` | Serve the built output locally |
| `npm run check` | Astro + TypeScript diagnostics |
| `npm run icons` | Regenerate `src/data/icons.json` and merge `src/data/skills.json` |

## Layout

```
design/            Approved artboards (.dc.html) + the icon generator they came from
public/            Static assets served as-is
scripts/
  build-icons.mjs  Simple Icons + Devicon -> src/data/icons.json, src/data/skills.json
src/
  components/      Nav, Footer, ThemeToggle, TechIcon
  content/         jobs/ and projects/ markdown entries
  data/            icons.json (generated), skills.json, courses.json
  layouts/         BaseLayout — head, fonts, theme, motion
  pages/           One file per route
  styles/          global.css — the design token layer
  content.config.ts  Collection schemas for jobs, projects, courses, skills
```

## Design system

Tokens live in `src/styles/global.css` and nowhere else. Components reference
`var(--accent)`, `var(--hairline)` and friends — never a raw hex value. Both
themes are built from the same semantic roles, so a theme swap on `<html>`
recolours everything without a rebuild.

Type: Archivo (display) · IBM Plex Sans (body) · IBM Plex Mono (data and labels),
self-hosted and preloaded by Astro's font pipeline — no runtime request to Google.

See `PLAN.md` for the full, locked system.
