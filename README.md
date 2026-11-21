# dave-elkins.github.io

Astro site for Dave Elkins' writing and printable résumé, hosted on GitHub Pages.

## Local development

```bash
npm ci
npm run dev
```

Open <http://localhost:4321>.

Follow `DESIGN.md` for the site's colors, type scale, shared classes, and card patterns.

## Checks

```bash
npm run format:check   # Prettier
npm run lint:md        # markdownlint-cli2
npm run lint:prose     # cspell + sentencefmt
npm run check          # astro check
npm run build          # astro build
npm run lint:html      # html-validate against dist/
npm run lint:links     # internal links against dist/
npm run audit:a11y     # advisory WCAG A/AA audit against dist/
```

Vale runs in CI via `vale-cli/vale-action`; external links are checked weekly by the
`External link check` workflow.

## Writing

Articles live in `src/content/articles/` as Markdown with frontmatter:

```yaml
---
title: 'Post title'
subtitle: 'Optional series subtitle'
description: 'One-paragraph summary used by cards and RSS.'
date: 2026-11-17
series: 'wysiwid-petstore' # optional
order: 9 # optional, within the series
originalUrl: 'https://medium.com/...' # optional, for republished posts
source: 'medium' # optional, medium or blog
tags: []
draft: false
---
```

The H1 is rendered from `title`, so article bodies should start with the first paragraph.
Repeated boilerplate (AI disclosure, consulting CTA) lives in
`src/components/ArticleFooter.astro`; generated series navigation lives in
`src/components/SeriesNav.astro`.

Series metadata lives in `src/data/series.ts`. Optional `image` and `imageAlt` fields add
artwork to the top of that series' posts, its series page, and its series cards. Place image
files in `public/images/`.

## Migrating the old manuscript repo

The one-time migration script reads `../blog` by default:

```bash
BLOG_SOURCE=/path/to/blog npm run migrate:articles
```

It copies the numbered Markdown files from `blog/series/`, adds frontmatter, rewrites
relative `.md` links and known Medium URLs to `/writing/<slug>/` routes, resolves the old
`#` placeholders, and removes the repeated boilerplate sections.

Dates in migrated posts were originally approximated from the first git commit in the old
`blog` repo, then corrected from Medium publication dates (except for site-only posts).
Keep `date` aligned with the real publication date when adding or updating articles.

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`, which builds with Astro and deploys
the `dist/` directory with the official GitHub Pages actions.

In the GitHub repository settings, **Settings → Pages → Build and deployment → Source**
must be set to **GitHub Actions**. An empty `public/.nojekyll` is copied into `dist/` so
GitHub Pages does not run Jekyll over the generated output.

Site URL and trailing-slash behavior are configured in `astro.config.mjs`.

## Résumé data and design sources

The résumé content is maintained in `src/data/resume.ts`, with components in
`src/components/resume/` and styles in `src/styles/resume.css`. Original icon and template
design sources, plus the favicon source (`design/de_logo.jfif`), are preserved in `design/`
and are not published. See `DESIGN.md` for how the favicon PNGs are generated.
