import type { Dict } from '../i18n/dictionaries';

export type VehicleId = keyof Dict['data']['vehicles'];

/** The fleet. Structure here; names, tags and text in src/i18n/<lang>/data.ts (`vehicles`). */
const fleet: { id: VehicleId; count?: number; red: boolean[] }[] = [
  { id: 'sprinter-long', red: [false, false] },
  { id: 'sprinter-accessible', red: [true, false] },
  { id: 'sprinter-4x4', red: [true, false] },
  { id: 'delica', count: 2, red: [false, false] },
];

export interface Vehicle { id: VehicleId; name: string; count?: number; tags: { label: string; red?: boolean }[]; text: string; detailLabel: string }

export const vehicles = (t: Dict): Vehicle[] =>
  fleet.map((v) => {
    const w = t.data.vehicles[v.id];
    return { id: v.id, count: v.count, name: w.name, text: w.text, detailLabel: w.detailLabel, tags: w.tags.map((label, i) => ({ label, red: v.red[i] })) };
  });
