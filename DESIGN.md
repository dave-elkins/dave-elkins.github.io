# Design guide

This file is the source of truth for the site's look and feel. New pages and components
should reuse the tokens and shared classes below rather than introducing one-off values.
When a style is needed in more than one place, promote it to `src/styles/global.css` and
document it here.

## Principles

- **Writing first.** Article and series pages are the primary experience; the résumé is
  secondary and lives on its own page.
- **One visual language.** Every page uses the same colors, type scale, containers, and card
  treatment. The résumé keeps its semantic markup but uses the same tokens.
- **Tokens over literals.** Use CSS custom properties for colors, fonts, radii, and repeated
  widths. Avoid hard-coded hex values outside `:root`.
- **Global for shared, scoped for local.** Shared building blocks live in `global.css`.
  Component `<style>` blocks are only for layout unique to that component.
- **Progressive enhancement.** The site is static HTML with no client-side JS. All interactive
  elements must work as plain links, with visible focus styles.

## Tokens

Defined in `src/styles/global.css` under `:root`.

| Group | Token                 | Value                  | Use                                    |
| ----- | --------------------- | ---------------------- | -------------------------------------- |
| Color | `--color-bg`          | `#fbfaf8`              | Page background                        |
| Color | `--color-surface`     | `#ffffff`              | Cards                                  |
| Color | `--color-text`        | `#1d1d1f`              | Body text                              |
| Color | `--color-muted`       | `#6b6b70`              | Secondary text, metadata               |
| Color | `--color-border`      | `#dedbd5`              | Borders and dividers                   |
| Color | `--color-accent`      | `#9a3f2d`              | Links, eyebrows, hover states          |
| Color | `--color-accent-soft` | `#f5e8e3`              | Image placeholders, inline code        |
| Font  | `--font-sans`         | Open Sans, system sans | Body copy, UI text                     |
| Font  | `--font-serif`        | Lora, Georgia, serif   | Headings, article prose, subtitles     |
| Font  | `--font-mono`         | System monospace       | Code                                   |
| Width | `--measure`           | `46rem`                | Narrow reading text                    |
| Width | `--article-measure`   | `60rem`                | Article header, prose, footer, artwork |
| Width | `--thumb-size`        | `10rem`                | Card thumbnails                        |
| Width | `--thumb-size-sm`     | `7rem`                 | Card thumbnails under 600px            |
| Shape | `--radius`            | `0.5rem`               | Cards, artwork, buttons, code blocks   |

### Type scale

Headings use the serif stack; body copy uses sans. Sizes are intentionally few:

| Element             | Size                          | Notes                          |
| ------------------- | ----------------------------- | ------------------------------ |
| `h1`                | `clamp(2rem, 5vw, 3rem)`      | One per page                   |
| Article `h1`        | `clamp(1.75rem, 4vw, 2.5rem)` | Long titles need a smaller cap |
| `h2`                | `clamp(1.5rem, 3.5vw, 2rem)`  | Section headings               |
| `h3`                | `1.25rem`                     | Sub-sections                   |
| Card title          | `1.2rem`                      | `1.1rem` for `.card--compact`  |
| `.lede`             | `1.15rem`, muted              | Page intro                     |
| `.subtitle`         | `1.05rem`, serif italic       | Article/card subtitle          |
| Body                | `1rem`, line-height `1.6`     | Default                        |
| Card text           | `0.95rem`, muted              | Descriptions                   |
| `.meta`, `.eyebrow` | `0.85rem` / `0.78rem`         | Dates, series labels           |

Do not invent intermediate sizes. Prefer the row closest to the need.

## Layout

- `.page-shell` — the standard page container: `max-width: 64rem`, centered,
  `3rem` top and `5rem` bottom padding. Every page uses it.
- `.narrow` — constrains a block to `--measure` (46rem).
- `.article-header`, `.prose`, `.article-footer`, `.article-nav`, `.series-artwork` —
  centered within `--article-measure` (60rem) so a post's content lines up.
- `.card-list` — a one-column grid with `1rem` gaps, used for every list of cards.
- Under 600px the site header stacks, page padding shrinks, and card thumbnails shrink to
  `--thumb-size-sm`.

## Shared classes

These are defined in `global.css` and should be reused as-is.

| Class               | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `.eyebrow`          | Accent-colored uppercase label above a heading or inside a card          |
| `.lede`             | Muted introductory paragraph                                             |
| `.meta`             | Muted date/count line                                                    |
| `.subtitle`         | Serif italic subtitle, muted                                             |
| `.more-link`        | Emphasized "More writing →" / "← All series" style link                  |
| `.card`             | Standard card surface: border, radius, white background, hover treatment |
| `.card--compact`    | Smaller card title for dense listings                                    |
| `.card--horizontal` | Card with a thumbnail on the left and text on the right                  |
| `.card-thumb`       | Thumbnail image: fixed width, 11:6, inset, right divider                 |
| `.card__body`       | Text column of a horizontal card                                         |
| `.series-artwork`   | Series banner at the top of a post or series page                        |
| `.prose`            | Rendered Markdown article body                                           |

### Card anatomy

Every listing card — article or series — has the same markup shape:

```html
<article class="card card--horizontal">
    <a href="...">
        <img class="card-thumb" src="..." alt="..." />
        <div class="card__body">
            <p class="eyebrow">...</p>
            <h2>Title</h2>
            <p>Description</p>
            <p class="meta">Date</p>
        </div>
    </a>
</article>
```

`ArticleCard.astro` and `SeriesCard.astro` both follow this pattern. Artwork is optional:
cards for a series without an `image` simply omit `.card-thumb` and `.card--horizontal`.

## Pages

| Route              | Pattern                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `/`                | `.page-shell`, hero, Series cards, Recent writing cards, `.more-link`                                                   |
| `/writing/`        | `.page-shell`, eyebrow + `h1` + `.lede`, article cards                                                                  |
| `/series/`         | `.page-shell`, eyebrow + `h1` + `.lede`, series cards                                                                   |
| `/series/<key>/`   | `.page-shell`, eyebrow + `h1` + `.lede`, `.series-artwork`, article cards                                               |
| `/writing/<slug>/` | `.page-shell` article: header (eyebrow, `h1`, `.subtitle`, artwork, `.lede`, `.meta`), `.prose`, footer, `.article-nav` |
| `/about/`          | `.page-shell about-page`, résumé sections styled by `resume.css`                                                        |

Page-specific layout still lives in a component's `<style>` block (for example the home
hero spacing or the article title size). If a rule starts appearing on two pages, move it
to `global.css`.

## Résumé styles

`src/styles/resume.css` is intentionally separate because the résumé has print rules and
its own structural classes (`.header-identity`, `.section-header`, `.resume-item`). It uses
the same tokens from `global.css` and reuses `.page-shell`, `.lede`, and the shared heading
styles. Do not reintroduce a separate color palette or font stack there. Content lives in
`src/data/resume.ts`; components live in `src/components/resume/`.

## Brand assets

The logo source is `design/de_logo.jfif` (a 2048×2048 JPEG/JFIF). It is a design source,
not published to the site. The published PNGs are generated from it with `sharp` (already
installed as an Astro dependency):

- `public/favicon.png` — 32×32, referenced by `rel="icon"` in `BaseLayout.astro`
- `public/apple-touch-icon.png` — 180×180, for iOS home-screen shortcuts

Regenerate both when the logo changes:

```bash
node --input-type=module - <<'JS'
import sharp from 'sharp';
const src = 'design/de_logo.jfif';
await sharp(src).resize(32, 32, { fit: 'contain', background: '#fbfaf8' }).png().toFile('public/favicon.png');
await sharp(src).resize(180, 180, { fit: 'contain', background: '#fbfaf8' }).png().toFile('public/apple-touch-icon.png');
JS
```

Keep the raster small — a favicon should never be more than a few kilobytes. SVG is
preferable if a vector source becomes available.

## Checklist for new work

1. Does the page use `.page-shell`?
2. Are colors, fonts, widths, and radii coming from tokens?
3. Can an existing shared class do the job instead of a new one?
4. Is there exactly one `h1`, with section headings as `h2`/`h3`?
5. Do lists of items use `.card-list` + `.card`?
6. Does artwork use `.series-artwork` or `.card-thumb`?
7. Are links using `--color-accent`, with visible `:focus-visible` outlines?
8. Does it look right at 600px and below?
9. Did `npm run check`, `npm run build`, `npm run lint`, and `npm run audit:a11y` pass?

See `README.md` for the full list of checks and deployment instructions.
