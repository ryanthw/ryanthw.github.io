import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/* ------------------------------------------------------------------ *
 * Shared fragments
 * ------------------------------------------------------------------ */

/** A tech tag. Must match a `label` in src/data/icons.json so <TechIcon> resolves. */
const tech = z.string();

/** "May 2026" / "Present" — display strings, ordered by the sibling sort key. */
const dateLabel = z.string();

/* ------------------------------------------------------------------ *
 * jobs — Experience page. One .md per role; body is optional context.
 * ------------------------------------------------------------------ */

const jobs = defineCollection({
  loader: glob({ base: './src/content/jobs', pattern: '**/*.md' }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    location: z.string(),
    start: dateLabel,
    /** Omit for a current role — renders as "Present". */
    end: dateLabel.optional(),
    /** Sort key, descending. Higher = more recent = listed first. */
    order: z.number(),
    /** Exactly one job should be true — it renders default-open in the accordion. */
    defaultOpen: z.boolean().default(false),
    /** One line under the role, shown in the collapsed state. */
    summary: z.string(),
    /** Bullets grouped under mono sub-heads, per the approved accordion pattern. */
    groups: z
      .array(
        z.object({
          heading: z.string(),
          bullets: z.array(z.string()).min(1),
        }),
      )
      .min(1),
    stack: z.array(tech).default([]),
    /** Optional strip under the bullets — e.g. the Sonatype "text only" caveat. */
    note: z.string().optional(),
    /** Links out to evidence. Sonatype must stay empty: text only, no artifacts. */
    evidence: z
      .array(z.object({ label: z.string(), href: z.string().url() }))
      .default([]),
    leadership: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ *
 * projects — grid + detail pages. Body is the long-form write-up.
 * ------------------------------------------------------------------ */

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One line on the card. */
      tagline: z.string(),
      /** Drives the filter chips: All / Quant / ML / Web. */
      categories: z.array(z.enum(['quant', 'ml', 'web'])).min(1),
      /** Sort key, ascending — 1 is the flagship. See PLAN.md §12. */
      order: z.number(),
      featured: z.boolean().default(false),
      year: z.string(),
      stack: z.array(tech).default([]),
      /**
       * Coursework projects ship as write-ups with NO repo link (honor code,
       * PLAN.md §9). Leave `repo` undefined for those — never a private URL.
       */
      repo: z.string().url().optional(),
      live: z.string().url().optional(),
      cover: image().optional(),
      media: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .default([]),
      /** Structured summary shown above the body on the detail page. */
      problem: z.string(),
      approach: z.string(),
      result: z.string(),
      draft: z.boolean().default(false),
    }),
});

/* ------------------------------------------------------------------ *
 * courses — Education page. Single data file, transcript-derived.
 * ------------------------------------------------------------------ */

const courses = defineCollection({
  loader: file('./src/data/courses.json'),
  schema: z.object({
    id: z.string(),
    code: z.string(),
    title: z.string(),
    term: z.string(),
    /** Sort key, ascending by chronology. */
    termOrder: z.number(),
    grade: z.string().default('A'),
    inProgress: z.boolean().default(false),
    /** Pull-quote treatment for the courses that matter to the audience. */
    highlight: z.boolean().default(false),
    /** e.g. "GT Lorraine, Metz" */
    campus: z.string().optional(),
  }),
});

/* ------------------------------------------------------------------ *
 * skills — Stack page. Editorial layer over src/data/icons.json.
 * `label` is the join key into the icon registry.
 * ------------------------------------------------------------------ */

const skills = defineCollection({
  loader: file('./src/data/skills.json'),
  schema: z.object({
    id: z.string(),
    label: z.string(),
    group: z.enum([
      'Languages',
      'ML & Data',
      'Web',
      'Cloud & Infrastructure',
      'Tools & Observability',
    ]),
    order: z.number(),
    /** Sub-label on monogram tiles, e.g. "x86 · LC-3". */
    note: z.string().optional(),
    /** Each chip links to where the tech was actually used. */
    usedIn: z
      .object({
        jobs: z.array(reference('jobs')).default([]),
        projects: z.array(reference('projects')).default([]),
      })
      .default({ jobs: [], projects: [] }),
  }),
});

export const collections = { jobs, projects, courses, skills };
