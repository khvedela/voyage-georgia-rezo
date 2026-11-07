import type { ImageMetadata } from 'astro';
import type { Dict } from '../i18n/dictionaries';
import { fmt } from '../i18n/utils';
import tbilisi from '../assets/photos/tbilisi.jpg';
import kakheti from '../assets/photos/kakheti.jpg';
import tusheti from '../assets/photos/tusheti.jpg';
import kutaisi from '../assets/photos/kutaisi.jpg';
import svaneti from '../assets/photos/svaneti.jpg';
import batumi from '../assets/photos/batumi.jpg';

export interface Photo {
  src: ImageMetadata;
  creditUrl: string;
  author: string;
  licence: string;
  licenceUrl: string;
}

const CC_BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0/';
const CC_BY_SA_3 = 'https://creativecommons.org/licenses/by-sa/3.0/';
const CC_BY_SA_2 = 'https://creativecommons.org/licenses/by-sa/2.0/';
const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/';
const C = 'https://commons.wikimedia.org/wiki/File:';

/**
 * Six Wikimedia Commons photographs of the places (not of Rezo's trips). Swap for his own pictures as they
 * arrive: replace the file in src/assets/photos and update the credit, or delete the credit lines. Alt text and the
 * photo's title for the credit line are in src/i18n/<lang>/data.ts (`photos`).
 */
export const photos = {
  tbilisi: {
    src: tbilisi,
    creditUrl: `${C}2014_Tbilisi,_Widoki_z_Twierdzy_Narikala_(55).jpg`,
    author: 'Marcin Konsek', licence: 'CC BY-SA 4.0', licenceUrl: CC_BY_SA_4,
  },
  kakheti: {
    src: kakheti,
    creditUrl: `${C}Chateau_Zegaani_Vineyards.jpg`,
    author: 'Chateau Zegaani', licence: 'CC BY-SA 2.0', licenceUrl: CC_BY_SA_2,
  },
  tusheti: {
    src: tusheti,
    creditUrl: `${C}%E1%83%90%E1%83%91%E1%83%90%E1%83%9C%E1%83%9D%E1%83%A1_%E1%83%A3%E1%83%A6%E1%83%94%E1%83%9A%E1%83%A2%E1%83%94%E1%83%AE%E1%83%98%E1%83%9A%E1%83%98_-_%E1%83%92%E1%83%96%E1%83%90_%E1%83%97%E1%83%A3%E1%83%A8%E1%83%94%E1%83%97%E1%83%98%E1%83%A1%E1%83%99%E1%83%94%E1%83%9C.jpg`,
    author: 'Daviti Zhorzholiani', licence: 'CC BY-SA 4.0', licenceUrl: CC_BY_SA_4,
  },
  kutaisi: {
    src: kutaisi,
    creditUrl: `${C}Church_of_the_Virgin_(Gelati)_02.jpg`,
    author: 'Bernard Gagnon', licence: 'CC BY 4.0', licenceUrl: CC_BY_4,
  },
  svaneti: {
    src: svaneti,
    creditUrl: `${C}Ushguli_Svaneti_Georgia.JPG`,
    author: 'Florian Pinel', licence: 'CC BY-SA 3.0', licenceUrl: CC_BY_SA_3,
  },
  batumi: {
    src: batumi,
    creditUrl: `${C}Black_Sea_coast_of_Georgia_(country),_with_skyline_of_Batumi_on_the_horizon.jpg`,
    author: 'Jagermesh', licence: 'CC BY-SA 2.0', licenceUrl: CC_BY_SA_2,
  },
} satisfies Record<string, Photo>;

export type PhotoId = keyof typeof photos;

/** Alt text and the visible credit line (required by the CC licences) in the page's language. */
export const photoText = (t: Dict, id: PhotoId) => {
  const p = photos[id];
  const w = t.data.photos[id];
  return { alt: w.alt, credit: fmt(t.data.photoCredit, { title: w.title, author: p.author, licence: p.licence }) };
};
