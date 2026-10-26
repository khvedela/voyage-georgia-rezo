# Launch checklist

## 1. Facts only Rezo can supply

Every bracketed `[placeholder]` in the design is one of these. They are hidden on the live site until provided (see `src/config/site.ts` and the components that use `<Todo>`).

- [ ] **Domain.** Set `PUBLIC_SITE_URL` (default `https://voyagegeorgiarezo.com` is an assumption: canonicals, sitemap, JSON-LD and OG all derive from it).
- [ ] WhatsApp number, email, Messenger link, Facebook, Instagram, Google Business Profile URL → `.env` (`.env.example`). Use the **same name and contact details** everywhere.
- [ ] Seats and luggage for each vehicle; wheelchair-accessible Sprinter details (ramp or lift, securing points, seating) → `src/data/vehicles.ts`, `src/pages/accessible-travel.astro`.
- [ ] Guide licence and business registration → `Meet Rezo`, footer.
- [ ] Typical reply time; deposit, payment and cancellation terms → `src/data/faqs.ts`, contact page.
- [ ] A portrait of Rezo, photos of each vehicle, and photos of the destinations (replace the Wikimedia images in `src/assets/photos` and update credits in `src/data/photos.ts`).
- [ ] Rezo's own words ("why he does this") and real testimonials with permission.
- [ ] **Review all page copy.** Destination, guide and journey text was written from the design's facts plus general knowledge; Rezo should correct anything and add first-hand notes (this is the strongest E-E-A-T signal you can add).
- [ ] Privacy policy (inquiry data and itinerary links) and cookie wording if analytics are added. No analytics or cookies are used today.

## 2. Connect the form

`/design-my-trip` posts JSON to `PUBLIC_INQUIRY_ENDPOINT` (Formspree, Web3Forms, a Cloudflare/Netlify function...). Without it the form hands the message to WhatsApp or email. Payload: `{ name, contact, channel, answers{...}, message }`. A honeypot or Turnstile check should be added at the endpoint.

## 3. Deploy

Any static host works. `public/_headers` is written for Cloudflare Pages / Netlify; replicate it elsewhere. Use HTTPS, redirect `www` ↔ apex to one canonical host, and enable Brotli.

## 4. After launch (search visibility)

- [ ] Verify the domain in **Google Search Console** and **Bing Webmaster Tools**; submit `/sitemap.xml`.
- [ ] Create/claim the **Google Business Profile** as a *service-area business* (hide the address) and use the same NAP as the site.
- [ ] Submit the URLs via **IndexNow** (Bing, Yandex) once the host supports a key file.
- [ ] Add the Facebook / Instagram / GBP URLs to `.env` so they appear as `sameAs` in structured data.
- [ ] Check rich results with Google's Rich Results Test and the Schema Markup Validator on `/`, a destination, a journey, a guide and `/faq`.
- [ ] Re-run Lighthouse on the live URL; watch Core Web Vitals in Search Console after a few weeks.
- [ ] Ask each real traveller for a Google review once trips are delivered; add `Review` markup only for genuine, published reviews.
- [ ] Publish a new first-hand guide from Rezo roughly monthly (road conditions, seasons, what he is seeing now), and bump `updated` when facts change.
- [ ] If more languages are added, use real translations per URL (`/ru`, `/de`...) with reciprocal `hreflang`, not machine overlays.

## 5. Production work not in this repo

The traveller link (`/trip/<token>`) and Rezo's dashboard (`/studio`) are **front-end prototypes with sample data**, exactly as in the design. They need a backend (auth for Rezo; unguessable, revocable tokens for travellers; versioned itineraries; offline sync) before real use. Keep them `noindex`.
