import type { Dict } from '../i18n/dictionaries';

export type FaqId = keyof Dict['data']['faqs'];
export interface FaqItem {
  id: FaqId;
  /** Appears in the short list on the homepage. */
  home?: boolean;
  topic: 'planning' | 'pricing' | 'access' | 'roads' | 'practical';
}

/**
 * Only answers Rezo can stand behind today. Questions that depend on facts he has not yet supplied
 * (reply time, deposit, cancellation terms) are answered at the level the design supports, and
 * the specifics are listed in docs/LAUNCH-CHECKLIST.md. The words are in src/i18n/<lang>/data.ts (`faqs`).
 */
export const faqs: FaqItem[] = [
  { id: 'packages', home: true, topic: 'planning' },
  { id: 'price', home: true, topic: 'pricing' },
  { id: 'change', home: true, topic: 'planning' },
  { id: 'wheelchair', home: true, topic: 'access' },
  { id: 'reply', home: true, topic: 'practical' },
  { id: 'pay', home: true, topic: 'pricing' },
  { id: 'who', topic: 'practical' },
  { id: 'geography', topic: 'planning' },
  { id: 'vehicles', topic: 'practical' },
  { id: 'tusheti', topic: 'roads' },
  { id: 'bestTime', topic: 'planning' },
  { id: 'children', topic: 'planning' },
  { id: 'private', topic: 'planning' },
];

/** The FAQ items with their question and answer in the page's language. */
export const faqText = (t: Dict, items: FaqItem[] = faqs) => items.map((f) => ({ ...f, ...t.data.faqs[f.id] }));
export const homeFaqs = (t: Dict) => faqText(t, faqs.filter((f) => f.home));
