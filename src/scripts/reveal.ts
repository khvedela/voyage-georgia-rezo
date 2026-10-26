/**
 * Scroll reveals ("clip-ins"). Content below the fold is revealed as it scrolls into view:
 *   words – headings rise line by line out of a mask
 *   clip  – cards, photos and maps wipe open upwards while the image inside settles
 *   edge  – eyebrows slide open from the left
 *   up    – paragraphs, list items and FAQ rows ease up
 *
 * Only elements that start below the fold are ever hidden, so first paint, LCP and crawlers see the page
 * exactly as served. Nothing runs for visitors who prefer reduced motion.
 */

type Kind = 'words' | 'clip' | 'edge' | 'up';

const SKIP = '.journey, .tb, .st, .dash-app, [data-no-reveal]';
const RULES: [Kind, string][] = [
  ['words', 'main h1, main h2'],
  ['clip', 'main .card, main .pf, main .mapbox, main .mapcard, main .jprint--inline, main .slot, main .callout'],
  ['edge', 'main .eyebrow, main .card-eyebrow'],
  ['up', 'main .answer, main .body-lg, main .prose > *, main .steps li, main .how li, main .stat-grid > div, main .trust li, main details.faq, main .facts, main .next li, main .ico-ring, main .tb-q'],
];
const STAGGER = 70; // ms between neighbours revealed together
const DONE_AFTER = 1900; // ms: then the reveal styles are dropped, so hover effects and shadows behave normally

function splitWords(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  for (const t of texts) {
    if (!t.data.trim()) continue;
    const frag = document.createDocumentFragment();
    for (const part of t.data.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { frag.append(part); continue; }
      const outer = document.createElement('span');
      outer.className = 'rw';
      const inner = document.createElement('span');
      inner.className = 'rw-i';
      inner.textContent = part;
      outer.append(inner);
      frag.append(outer);
    }
    t.replaceWith(frag);
  }
  // Group words into visual lines so each line rises a beat after the one above it.
  let line = -1;
  let lastTop = -Infinity;
  for (const w of el.querySelectorAll<HTMLElement>('.rw')) {
    const top = w.offsetTop;
    if (top > lastTop + 4) { line++; lastTop = top; }
    w.style.setProperty('--rv-line', String(line));
  }
}

export function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fold = window.innerHeight * 0.92;
  const seen = new Set<Element>();
  const pending: HTMLElement[] = [];

  for (const [kind, sel] of RULES) {
    for (const el of document.querySelectorAll<HTMLElement>(sel)) {
      if (seen.has(el) || el.closest(SKIP)) continue;
      // Inside an element that is itself revealed (e.g. a card's title): let the parent carry it.
      if (el.parentElement?.closest('.card, .pf, details.faq, .callout')) continue;
      seen.add(el);
      if (el.getBoundingClientRect().top < fold) continue; // already on screen: never hide it
      if (kind === 'words') splitWords(el);
      el.classList.add('rv', `rv-${kind}`);
      pending.push(el);
    }
  }
  if (!pending.length) return;

  // A per-frame position check rather than IntersectionObserver: an element clipped to zero by its own
  // clip-path never reports as intersecting in Chrome. Only the still-hidden elements are measured,
  // and only while scrolling, with layout reads and no writes in between.
  let queued = false;
  const check = () => {
    queued = false;
    const line = window.innerHeight * 0.88;
    const batch: { el: HTMLElement; top: number; left: number }[] = [];
    for (let k = pending.length - 1; k >= 0; k--) {
      const r = pending[k].getBoundingClientRect();
      // Anything at or above the line counts, so content skipped past (anchor jumps) is never left hidden.
      if (r.top < line) {
        batch.push({ el: pending[k], top: r.top, left: r.left });
        pending.splice(k, 1);
      }
    }
    // Reveal neighbours in reading order, a beat apart.
    batch.sort((x, y) => x.top - y.top || x.left - y.left);
    batch.forEach(({ el }, i) => {
      const delay = Math.min(i, 6) * STAGGER;
      el.style.setProperty('--rv-delay', `${delay}ms`);
      el.classList.add('rv-in');
      window.setTimeout(() => el.classList.add('rv-done'), DONE_AFTER + delay);
    });
    if (!pending.length) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}
