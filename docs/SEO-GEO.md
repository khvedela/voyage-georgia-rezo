# SEO and GEO decisions

Goal: be the answer when someone searches for, or asks an AI assistant about, a private tour operator in Georgia (the country). Every choice below serves discoverability first.

## 1. Rendering and speed (Core Web Vitals are a ranking input)

- **Static HTML for every public page.** Crawlers and LLM fetchers get complete content with no JavaScript. The two interactive tools are islands that are also server-rendered, so their first screen is in the HTML.
- **Measured (Lighthouse, mobile profile, production build):** content pages 100 / 100 / 100 / 100; homepage 97 performance (LCP 2.2 s, CLS 0, TBT 130 ms), 100 accessibility, best practices, SEO.
- **The 3D terrain never competes with first paint.** three.js is a lazy chunk loaded after `load` + idle. It is skipped entirely on `Save-Data`, 2G/3G and `prefers-reduced-data`; phones and ≤4-core devices get lighter geometry and shadow maps; without WebGL the flat SVG map from the design appears.
- **Fonts:** self-hosted, latin-only variable files, two preloaded, `font-display: swap`. No third-party requests at all.
- **Images:** Astro generates responsive WebP `srcset`s with explicit dimensions (no layout shift); only above-the-fold images are eager.
- **CSS inlined** (`inlineStylesheets: 'always'`), so there is no render-blocking stylesheet request.
- **Cache policy** in `public/_headers`: fingerprinted assets immutable for a year; sitemap/robots/llms short.

## 2. Classic on-page SEO

- One `<h1>` per page answering the visitor's intent; descending heading levels; landmarks; skip link.
- Unique `<title>` (brand suffix only while ≤ 62 characters) and meta description per page; canonical on every page; self-referencing `hreflang` + `x-default` (ready for more languages).
- Disambiguation: copy and metadata say "Georgia (the country)" / Caucasus where it matters so the site is not confused with the US state.
- **Information architecture** follows the design's brief: one action ("Design my trip") reachable everywhere; destination, journey and guide pages answer questions and feed that action. Added one page beyond the brief, `/destinations/kutaisi-imereti`: Kutaisi is a major arrival hub and a stop on the sample route, and had no page.
- Internal linking: header, footer, cards, breadcrumbs (visible + `BreadcrumbList`), contextual links inside every body text, "nearby" and "read next" blocks.
- `sitemap.xml`: `lastmod`, hreflang alternates and image entries (with licence). Private pages are never listed.
- `robots.txt`: open crawling, explicit sitemap, private areas disallowed. Private pages are also `noindex` on-page and via `X-Robots-Tag`.
- OG/Twitter images generated at build for every page (`/og/<slug>.png`, 1200×630).

## 3. Structured data (one linked `@graph` per page)

Stable `@id`s so every page points at the same entities:

- `TravelAgency` (service-area business: **no street address is published**, matching the brief), `Person` (Rezo, `founder`), `WebSite`, `Country` (Georgia, linked to Wikidata).
- Per page: `WebPage` (or `CollectionPage` / `ProfilePage` / `ContactPage` / `FAQPage`), `BreadcrumbList`, `TouristDestination` with coordinates, `TouristTrip` + `ItemList` itinerary for example journeys, `Article` for guides (with `datePublished` / `dateModified`), `FAQPage` where FAQs are visible, `Service` for the trip builder.
- **Not marked up on purpose:** reviews and ratings (none exist yet), prices (Rezo quotes every trip), opening hours, street address, credentials.

## 4. GEO: being quoted by AI assistants

- **Answer-first pages.** Every page opens with a 1–3 sentence factual summary that can be lifted whole ("Tusheti is … usually open June to October … four to five hours from Telavi").
- **Quotable facts in structured blocks:** fact strips (elevations, distances, seasons), a distances table, month-by-month table, FAQs written as complete sentences.
- **`/llms.txt` and `/llms-full.txt`** generated from the same content (summary, key facts, link list; full text). Updated on every build.
- **`robots.txt` explicitly welcomes** GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Amazonbot, Meta, DuckAssistBot, MistralAI-User, CCBot. The design calls this a deliberate choice for the owner: set `allowAiCrawlers: false` in `src/config/site.ts` to reverse it.
- **Freshness signals:** visible "Last updated" with `<time>`, `dateModified` in schema, `lastmod` in the sitemap. Bump `updated` in front matter when content materially changes.
- **Entity consistency:** one name, one description and the same founder everywhere; `sameAs` is filled from the social/Business Profile URLs in `.env`.
- **Honest sourcing:** photo credits are visible and in image schema; maps credit Natural Earth; no claim without a source in the design or a clearly general fact.

## 5. Trust and E-E-A-T

- A real "Rezo" page with `Person` markup, first-person process, and how technology is used ("Assistants draft. Rezo decides.").
- Facts Rezo has not supplied are **not published**: bracketed placeholders from the design render only in `astro dev` (or when `PUBLIC_SHOW_PLACEHOLDERS=true`), never in production HTML. `npm run verify` fails if a bracketed placeholder leaks into an indexable page.
- Testimonials section renders nothing until real ones exist (no fake reviews, no empty review markup).

## 6. Accessibility (shared with SEO, and now a legal expectation in the EU)

Contrast ≥ 4.5:1 (the design's dimmed chapters were rebuilt to stay compliant), 44 px targets, real buttons/labels, focus rings, `prefers-reduced-motion` honoured, the map never carries information the text does not.

## Keeping it good

`npm run build:verify` checks: one H1; unique titles and descriptions; canonical = sitemap URL; OG tags; valid JSON-LD with unique `@id`s; alt text; broken internal links and anchors; indexable pages in the sitemap and noindex pages out; thin content; leaked placeholders; robots/llms/sitemap present.
