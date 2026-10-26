import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// The canonical origin drives canonical URLs, hreflang, sitemap, JSON-LD and Open Graph.
// Set PUBLIC_SITE_URL in the host's environment once the domain is final.
const site = (process.env.PUBLIC_SITE_URL || 'https://voyagegeorgiarezo.com').replace(/\/$/, '');

export default defineConfig({
  site,
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [preact()],
  image: { layout: 'constrained' },
  devToolbar: { enabled: false },
});
