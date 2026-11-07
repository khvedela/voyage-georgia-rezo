/**
 * Structure of the homepage model: the regions a visitor can pick on it, and the sample drive that plays when the
 * visitor presses play. `node` is the object's name in public/models/georgia.glb (see blender/README.md). The words (names,
 * titles, facts, legs) are in src/i18n/<lang>/data.ts (`regions`, `stops`, `legs`); `localizeDrive` joins them.
 */
import type { Dict } from '../i18n/dictionaries';

/** `days` is the stay Rezo would usually suggest for the region, used for the rough length shown as visitors pick. */
export interface Region { id: keyof Dict['data']['regions']; node: string; ka: string; days: number }

/** Every region on the model that can be tapped, west to east so the chip row reads like the map. */
export const regions: Region[] = [
  { id: 'batumi-adjara', node: 'Batumi', ka: 'ბათუმი', days: 2 },
  { id: 'svaneti', node: 'Svaneti', ka: 'სვანეთი', days: 3 },
  { id: 'kutaisi-imereti', node: 'Scenery_Kutaisi', ka: 'ქუთაისი', days: 2 },
  { id: 'kazbegi', node: 'Scenery_Kazbegi', ka: 'ყაზბეგი', days: 2 },
  { id: 'tbilisi', node: 'Tbilisi', ka: 'თბილისი', days: 2 },
  { id: 'tusheti', node: 'Tusheti', ka: 'თუშეთი', days: 3 },
  { id: 'kakheti', node: 'Kakheti', ka: 'კახეთი', days: 2 },
];

/**
 * The order a trip usually runs in: arrive in Tbilisi, the mountains north and east, then west to the sea.
 * Picked regions are joined on the model, and listed in the tray, in this order.
 */
export const tripOrder: Region['id'][] = ['tbilisi', 'kazbegi', 'tusheti', 'kakheti', 'kutaisi-imereti', 'svaneti', 'batumi-adjara'];

export interface Stop { key: keyof Dict['data']['stops']; node: string; ka: string; href: string }

/** The sample drive, in order. Facts and times are typical, without stops. */
export const stops: Stop[] = [
  { key: 'tbilisi', node: 'Tbilisi', ka: 'თბილისი', href: '/destinations/tbilisi' },
  { key: 'kakheti', node: 'Kakheti', ka: 'კახეთი', href: '/destinations/kakheti' },
  { key: 'tusheti', node: 'Tusheti', ka: 'თუშეთი', href: '/destinations/tusheti' },
  { key: 'kutaisi', node: 'Scenery_Kutaisi', ka: 'ქუთაისი', href: '/destinations/kutaisi-imereti' },
  { key: 'svaneti', node: 'Svaneti', ka: 'სვანეთი', href: '/destinations/svaneti' },
  { key: 'batumi', node: 'Batumi', ka: 'ბათუმი', href: '/destinations/batumi-adjara' },
];

/** Regions, stops and the legs between them (leg i joins stop i and stop i + 1) in the page's language. */
export const localizeDrive = (t: Dict) => ({
  regions: regions.map((r) => ({ ...r, ...t.data.regions[r.id] })),
  stops: stops.map((s) => ({ ...s, ...t.data.stops[s.key] })),
  legs: t.data.legs,
});
