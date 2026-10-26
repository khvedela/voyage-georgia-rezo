export interface Vehicle {
  id: string;
  name: string;
  count?: number;
  tags: { label: string; red?: boolean }[];
  text: string;
  detailLabel: string;
}

export const vehicles: Vehicle[] = [
  { id: 'sprinter-long', name: 'Mercedes Sprinter — long', tags: [{ label: 'Long wheelbase' }, { label: 'Groups' }], text: 'Private tours and group transport over longer touring days.', detailLabel: 'Seats & luggage' },
  { id: 'sprinter-accessible', name: 'Mercedes Sprinter — short, wheelchair-accessible', tags: [{ label: 'Wheelchair-accessible', red: true }, { label: 'Short wheelbase' }], text: 'For travellers who use a wheelchair. Rezo confirms access at every stop before you commit.', detailLabel: 'Adaptation details' },
  { id: 'sprinter-4x4', name: 'Mercedes Sprinter — short, 4×4 off-road', tags: [{ label: '4×4', red: true }, { label: 'Mountain roads' }], text: 'For mountain valleys and rough tracks that ordinary vans avoid.', detailLabel: 'Seats & luggage' },
  { id: 'delica', name: 'Mitsubishi Delica', count: 2, tags: [{ label: 'Couples & families' }, { label: 'Small groups' }], text: 'Smaller vans for couples, families and small groups.', detailLabel: 'Seats & luggage' },
];
