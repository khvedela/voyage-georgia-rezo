import type { RoadId } from './routes';

export interface MapPin { x: number; y: number; r?: number }
export interface MapLabel { text: string; x: number; y: number; anchor?: 'start' | 'middle' | 'end' }
export interface MapSpec {
  /** Accessible description (also used as the SVG's aria-label). */
  label: string;
  viewBox: string;
  /** Crop to fill the frame (destination cards) instead of fitting it (route maps). */
  slice?: boolean;
  roads: { id: RoadId; dash?: string }[];
  pins: MapPin[];
  labels: MapLabel[];
  stroke: number;
  pinR: number;
  pinFill: string;
  pinStroke: string;
  pinStrokeW: number;
  fontSize: number;
  textStrokeW: number;
  extra?: { text: string; x: number; y: number; size: number; spacing: number }[];
}

const wide = {
  viewBox: '60 60 880 490', stroke: 3.6, pinR: 8, pinFill: '#D62839', pinStroke: '#FFFFFF', pinStrokeW: 3, fontSize: 30, textStrokeW: 6,
};
const crop = {
  slice: true, stroke: 2.2, pinR: 3.4, pinFill: '#D62839', pinStroke: '#14161A', pinStrokeW: 1.2, fontSize: 8.5, textStrokeW: 2.4,
};

export const maps = {
  // ----- destination crops (4:5) -----
  kazbegi: {
    ...crop, viewBox: '590 150 160 200',
    label: 'Map of the Georgian Military Highway from Mtskheta north to Stepantsminda, below Mount Kazbek',
    roads: [{ id: 'tbilisiKazbegi' }],
    pins: [{ x: 662, y: 228 }, { x: 642, y: 259, r: 2.6 }, { x: 670, y: 312, r: 2.6 }],
    labels: [{ text: 'Stepantsminda', x: 670, y: 226 }, { text: 'Gudauri', x: 650, y: 262 }, { text: 'Ananuri', x: 678, y: 315 }, { text: 'Mt Kazbek', x: 640, y: 219, anchor: 'end' }],
  },
  kakheti: {
    ...crop, viewBox: '700 320 160 200',
    label: 'Map of Kakheti with Telavi, Sighnaghi and David Gareja',
    roads: [{ id: 'telaviSighnaghi' }],
    pins: [{ x: 767, y: 354 }, { x: 824, y: 405 }, { x: 754, y: 434, r: 2.6 }],
    labels: [{ text: 'Telavi', x: 775, y: 352 }, { text: 'Sighnaghi', x: 816, y: 395, anchor: 'end' }, { text: 'David Gareja', x: 762, y: 437 }],
  },
  svaneti: {
    ...crop, viewBox: '350 86 160 200',
    label: 'Map of Upper Svaneti with Mestia, Ushguli, Ushba and Shkhara',
    roads: [],
    pins: [{ x: 420, y: 162 }, { x: 457, y: 184, r: 3 }, { x: 419, y: 294, r: 2.6 }],
    labels: [{ text: 'Mestia', x: 428, y: 165 }, { text: 'Ushguli', x: 465, y: 187 }, { text: 'Ushba', x: 398, y: 148, anchor: 'end' }, { text: 'Shkhara', x: 475, y: 168 }, { text: 'Kutaisi', x: 427, y: 297 }],
  },
  batumi: {
    ...crop, viewBox: '205 330 160 200',
    label: 'Map of the Black Sea coast at Batumi',
    roads: [{ id: 'batumiCoast' }],
    pins: [{ x: 283, y: 405 }],
    labels: [{ text: 'Batumi', x: 291, y: 410 }],
    extra: [{ text: 'BLACK SEA', x: 212, y: 470, size: 8, spacing: 1.6 }],
  },
  kutaisi: {
    ...crop, viewBox: '340 215 160 200',
    label: 'Map of Kutaisi in Imereti, on the road between Tbilisi, Svaneti and Batumi',
    roads: [{ id: 'kutaisiBatumi' }],
    pins: [{ x: 419, y: 294 }],
    labels: [{ text: 'Kutaisi', x: 427, y: 292 }],
  },
  tusheti: {
    ...crop, viewBox: '700 210 160 200',
    label: 'Map of the road from Telavi in Kakheti north to Tusheti over the Abano Pass',
    roads: [{ id: 'telaviTusheti', dash: '1 6' }],
    pins: [{ x: 787, y: 276 }, { x: 767, y: 354, r: 2.6 }],
    labels: [{ text: 'Tusheti', x: 795, y: 274 }, { text: 'Telavi', x: 775, y: 357 }],
  },
  tbilisi: {
    ...crop, viewBox: '610 310 160 200',
    label: 'Map of Tbilisi and Mtskheta',
    roads: [{ id: 'tbilisiKazbegi' }],
    pins: [{ x: 681, y: 387 }, { x: 672, y: 366, r: 2.6 }],
    labels: [{ text: 'Tbilisi', x: 690, y: 393 }, { text: 'Mtskheta', x: 664, y: 364, anchor: 'end' }],
  },

  // ----- example journeys (wide) -----
  mountainsWineSea: {
    ...wide,
    label: 'Map: Tbilisi, Kazbegi, Kakheti, Kutaisi and Batumi by road',
    roads: [{ id: 'tbilisiKazbegi' }, { id: 'kazbegiTelavi' }, { id: 'telaviKutaisi' }, { id: 'kutaisiBatumi' }],
    pins: [{ x: 681, y: 387 }, { x: 662, y: 228 }, { x: 767, y: 354 }, { x: 419, y: 294 }, { x: 283, y: 405 }],
    labels: [{ text: 'Tbilisi', x: 698, y: 425 }, { text: 'Kazbegi', x: 680, y: 222 }, { text: 'Kakheti', x: 786, y: 344 }, { text: 'Kutaisi', x: 419, y: 268, anchor: 'middle' }, { text: 'Batumi', x: 266, y: 440, anchor: 'end' }],
  },
  wineToHighVillages: {
    ...wide,
    label: 'Map: Tbilisi, Sighnaghi, Telavi and Tusheti',
    roads: [{ id: 'tbilisiSighnaghi' }, { id: 'sighnaghiTelavi' }, { id: 'telaviTusheti', dash: '1 9' }],
    pins: [{ x: 681, y: 387 }, { x: 824, y: 405 }, { x: 767, y: 354 }, { x: 787, y: 276 }],
    labels: [{ text: 'Tbilisi', x: 698, y: 425 }, { text: 'Sighnaghi', x: 838, y: 432 }, { text: 'Telavi', x: 748, y: 344, anchor: 'end' }, { text: 'Tusheti', x: 806, y: 270 }],
  },
  firstTaste: {
    ...wide,
    label: 'Map: Tbilisi, Kazbegi and Kakheti',
    roads: [{ id: 'tbilisiKazbegi' }, { id: 'kazbegiTelavi' }],
    pins: [{ x: 681, y: 387 }, { x: 662, y: 228 }, { x: 767, y: 354 }],
    labels: [{ text: 'Tbilisi', x: 698, y: 425 }, { text: 'Kazbegi', x: 680, y: 222 }, { text: 'Kakheti', x: 786, y: 344 }],
  },
} satisfies Record<string, MapSpec>;

export type MapId = keyof typeof maps;
