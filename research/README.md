# Research and background material

This directory holds source material for future series and articles: book notes, paper summaries, quotes, citations, outlines, and half-formed ideas.

**Nothing in this directory is published.** Astro only emits pages from `src/pages/` and copies `public/` into `dist/`. A top-level `research/` is untouched by the build, and `npm run lint:research` fails CI and the deploy build if a `research` path ever appears in `public/` or `dist/`.

## Structure

Organize by series or topic, one directory each:

```text
research/
  legible-by-design-the-long-search/
    sources.md
    outline.md
  wysiwid-petstore/
    sources.md
  future-series/
    ideas.md
```

There is no required frontmatter or filename convention. Use whatever helps you think.

## Promoting a note into an article

When a note is ready to publish, create a new file in `src/content/articles/` with the frontmatter described in the root `README.md`. Leave the original research here — it is background, not the article.

If you want a piece held back temporarily but still validated against the article schema, use `draft: true` in `src/content/articles/` instead. Drafts are excluded from routes and RSS.
