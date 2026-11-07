# Voyage Georgia Rezo

Private tours of Georgia, designed by Rezo. This repository implements the design hand-off ("Voyage Georgia Rezo": public website, Personal Itinerary Studio, Rezo's field dashboard) as a static, search-first website in **English, Russian, Georgian and Latvian**.

> Changing anything a visitor can read? Read [AGENTS.md](AGENTS.md) and [docs/I18N.md](docs/I18N.md) first: every string ships in all four languages.

**Stack:** [Astro 7](https://astro.build) (static HTML, zero JS by default) · Preact islands for the two interactive tools · three.js (lazy) for the terrain journey · Markdown content collections · self-hosted variable fonts · no CSS framework (design tokens in `src/styles/global.css`).

## Run it

```bash
npm install
npm run dev            # http://localhost:4321
npm run build:verify   # production build + SEO/GEO audit (fails on problems)
npm run preview        # serve ./dist
```

Node 22.12+.

## Where things live

| Path | What |
| --- | --- |
| `src/config/site.ts` | Business facts and contact channels. Anything empty is omitted everywhere, including structured data. |
| `src/i18n/` | Languages: `config.ts` (locales), `en/` (source dictionaries), `ru/`, `ka/`, `lv/` (translations), helpers (`l`, `fmt`, `plural`, `getLocalized`). See [docs/I18N.md](docs/I18N.md). |
| `.env.example` | `PUBLIC_SITE_URL`, WhatsApp, email, social links, inquiry endpoint. |
| `src/content/destinations`, `guides`, `journeys` | Page content as Markdown + validated front matter (`src/content.config.ts`), one folder per language (`en/`, `ru/`, `ka/`, `lv/`). Add a file in every language, get a page, sitemap entry, `llms.txt` entry and OG image. |
| `src/data/pages.ts` | Registry of top-level pages (paths, dates, priorities; titles and descriptions in `src/i18n/<lang>/pages.ts`): feeds sitemap, `llms.txt` and OG images. |
| `src/data/faqs.ts`, `vehicles.ts`, `home.ts`, `drive.ts`, `model.ts`, `photos.ts` | Structure of shared data; the words are in `src/i18n/<lang>/data.ts`, keyed by the same ids. |
| `src/data/routes.ts`, `maps.ts` | Real road geometry and map crops from the design. |
| `src/lib/schema.ts` | JSON-LD builders (one linked `@graph` per page). |
| `src/layouts/Base.astro` | Every `<head>` tag: `<html lang>`, canonical, hreflang for all four languages + `x-default`, Open Graph (+ locale alternates), Twitter, robots, per-language font preloads, JSON-LD. |
| `src/pages/[...lang]/` | Every page, built once per language (`lang` is undefined for English). Endpoints: `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt` (root), `[...lang]/rss.xml`, `og/[...lang]/*.png`. |
| `src/components/builder/` | "Design my trip" (Preact). `model.ts` is the pure logic. |
| `src/components/studio/` + `src/pages/[...lang]/trip/demo.astro` | Traveller's private itinerary view (sample, `noindex`). |
| `src/pages/[...lang]/studio/*` | Rezo's mobile dashboard prototype (sample data, `noindex`). |
| `public/_headers` | Security, caching and `X-Robots-Tag` rules (Cloudflare Pages / Netlify syntax). |
| `scripts/verify-seo.mjs` | Post-build audit, including the i18n checks (every page in every language, hreflang, untranslated pages). |

## Pages

Indexable, in each of `/` (English), `/ru`, `/ka`, `/lv`: `/`, `/design-my-trip`, `/journeys` (+3), `/destinations` (+7), `/guides` (+3), `/rezo`, `/vehicles`, `/accessible-travel`, `/adventure-4x4`, `/faq`, `/contact`.
Private in every language (`noindex`, disallowed in robots.txt, never linked from public pages): `/trip/*`, `/studio/*`.

## Read next

- [AGENTS.md](AGENTS.md): working rules for humans and coding agents.
- [docs/I18N.md](docs/I18N.md): how the four languages work, and the rules every feature follows.
- [docs/I18N-GLOSSARY.md](docs/I18N-GLOSSARY.md): names, voice and typography for translators.
- [docs/SEO-GEO.md](docs/SEO-GEO.md): every search / AI-answer decision and why.
- [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md): facts Rezo must supply and the steps to go live.
