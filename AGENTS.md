# Working on this repo (humans and coding agents)

Voyage Georgia Rezo: a static Astro 7 site (Preact islands, three.js model) for a private-tour agency in Georgia.
Start with [README.md](README.md); the decisions behind the build are in [docs/](docs/).

## The site is multilingual: every change ships in four languages

English (`/`), Russian (`/ru`), Georgian (`/ka`) and Latvian (`/lv`). Read **[docs/I18N.md](docs/I18N.md)** before
adding or changing anything a visitor (or Rezo, in the dashboard) can read, and translate with
**[docs/I18N-GLOSSARY.md](docs/I18N-GLOSSARY.md)**. In short:

- Never hard-code user-visible text (including `alt`, `aria-label`, `title`, `placeholder`, JSON-LD names,
  messages sent to Rezo). Add a key to `src/i18n/en/<namespace>.ts`, then the same key in `ru`, `ka` and `lv` in
  the same change — TypeScript fails until all four match.
- Pages live in `src/pages/[...lang]/` and use `getStaticPaths = () => langPaths()`, `getLang(Astro)`, `useT(lang)`.
- Write paths language-neutral and localize on output: `href={l(lang, '/contact')}`.
- Counts with `plural()`, lists with `listFormat()`, dates/numbers with `formatDate()`/`formatNumber()`,
  placeholders with `fmt()`. Never assemble sentences from fragments.
- Content: `src/content/<collection>/<lang>/<slug>.md`, one file per language; read it with `getLocalized()`.
- Islands get strings as props and import helpers only from `src/i18n/utils`.
- Check new screens in `ru` and `ka` at phone width: longer words, a taller script.

## Before you finish

```bash
npx tsc --noEmit
npm run build:verify   # build + SEO/GEO + i18n audit; must end with "All SEO checks passed."
```

Other conventions: business facts live in `src/config/site.ts` (empty = omitted everywhere); structure lives in
`src/data/*`, words in `src/i18n/*`; the homepage is built around the 3D model (see `src/components/home/World.astro`).
