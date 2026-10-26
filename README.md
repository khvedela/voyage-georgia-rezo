# Voyage Georgia Rezo

Private tours of Georgia, designed by Rezo. This repository implements the design hand-off ("Voyage Georgia Rezo": public website, Personal Itinerary Studio, Rezo's field dashboard) as a static, search-first website.

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
| `.env.example` | `PUBLIC_SITE_URL`, WhatsApp, email, social links, inquiry endpoint. |
| `src/content/destinations`, `guides`, `journeys` | Page content as Markdown + validated front matter (`src/content.config.ts`). Add a file, get a page, sitemap entry, `llms.txt` entry and OG image. |
| `src/data/pages.ts` | Registry of top-level pages (titles, descriptions, dates): feeds sitemap, `llms.txt` and OG images. |
| `src/data/faqs.ts`, `vehicles.ts`, `home.ts` | Shared copy. |
| `src/data/routes.ts`, `maps.ts` | Real road geometry and map crops from the design. |
| `src/components/home/StopPrint.astro` | A stop's photo as a matted print; on the homepage the prints stack up as the van travels. |
| `src/lib/schema.ts` | JSON-LD builders (one linked `@graph` per page). |
| `src/layouts/Base.astro` | Every `<head>` tag: canonical, hreflang, Open Graph, Twitter, robots, preloads, JSON-LD. |
| `src/pages/` | Routes. Endpoints: `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `rss.xml`, `og/*.png`. |
| `src/components/builder/` | "Design my trip" (Preact). `model.ts` is the pure logic. |
| `src/components/studio/` + `src/pages/trip/demo.astro` | Traveller's private itinerary view (sample, `noindex`). |
| `src/pages/studio/*` | Rezo's mobile dashboard prototype (sample data, `noindex`). |
| `public/_headers` | Security, caching and `X-Robots-Tag` rules (Cloudflare Pages / Netlify syntax). |
| `scripts/verify-seo.mjs` | Post-build audit. |

## Pages

Indexable: `/`, `/design-my-trip`, `/journeys` (+3), `/destinations` (+7), `/guides` (+3), `/rezo`, `/vehicles`, `/accessible-travel`, `/adventure-4x4`, `/faq`, `/contact`.
Private (`noindex`, disallowed in robots.txt, never linked from public pages): `/trip/*`, `/studio/*`.

## Read next

- [docs/SEO-GEO.md](docs/SEO-GEO.md): every search / AI-answer decision and why.
- [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md): facts Rezo must supply and the steps to go live.
