import type { APIRoute } from 'astro';
import { site } from '../config/site';

// Private areas: kept out of crawling AND marked noindex on-page + via X-Robots-Tag (see public/_headers).
const PRIVATE = ['/studio', '/trip/', '/api/'];

// Search/answer engines and AI assistants. Each group repeats the private rules because a more specific
// User-agent group replaces (does not extend) the "*" group.
const AI_AGENTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'Amazonbot', 'meta-externalagent',
  'DuckAssistBot', 'MistralAI-User', 'CCBot',
];

export const GET: APIRoute = () => {
  const priv = PRIVATE.map((p) => `Disallow: ${p}`).join('\n');
  const lines = [
    '# Voyage Georgia Rezo: private tours of Georgia, designed by Rezo.',
    `# Site summary for language models: ${site.url}/llms.txt`,
    '',
    'User-agent: *',
    'Allow: /',
    priv,
    '',
  ];
  for (const ua of AI_AGENTS) {
    lines.push(`User-agent: ${ua}`);
    lines.push(site.allowAiCrawlers ? 'Allow: /' : 'Disallow: /');
    if (site.allowAiCrawlers) lines.push(priv);
    lines.push('');
  }
  lines.push(`Sitemap: ${site.url}/sitemap.xml`);
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
