import type { Locale } from './config';
import en from './en';
import ru from './ru';
import ka from './ka';
import lv from './lv';

/** Every language must provide exactly the shape of the English dictionary (TypeScript enforces it). */
export type Dict = typeof en;

export const dictionaries: Record<Locale, Dict> = { en, ru, ka, lv };
