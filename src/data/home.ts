import type { Dict } from '../i18n/dictionaries';

/** The four steps of working with Rezo, shown on the homepage and the Meet Rezo page (words in data.steps). */
export const steps = (t: Dict) => t.data.steps.map((s, i) => ({ n: String(i + 1).padStart(2, '0'), ...s }));
