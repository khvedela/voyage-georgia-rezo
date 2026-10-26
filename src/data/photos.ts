import type { ImageMetadata } from 'astro';
import tbilisi from '../assets/photos/tbilisi.jpg';
import kakheti from '../assets/photos/kakheti.jpg';
import tusheti from '../assets/photos/tusheti.jpg';
import kutaisi from '../assets/photos/kutaisi.jpg';
import svaneti from '../assets/photos/svaneti.jpg';
import batumi from '../assets/photos/batumi.jpg';

export interface Photo {
  src: ImageMetadata;
  alt: string;
  /** Visible credit line, required by the CC licences. */
  credit: string;
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
 * arrive: replace the file in src/assets/photos and update the credit, or delete the credit lines.
 */
export const photos = {
  tbilisi: {
    src: tbilisi, alt: 'The sulphur-bath domes of Abanotubani below Narikala fortress in old Tbilisi',
    credit: 'Photo: Abanotubani from Narikala · Marcin Konsek · CC BY-SA 4.0',
    creditUrl: `${C}2014_Tbilisi,_Widoki_z_Twierdzy_Narikala_(55).jpg`,
    author: 'Marcin Konsek', licence: 'CC BY-SA 4.0', licenceUrl: CC_BY_SA_4,
  },
  kakheti: {
    src: kakheti, alt: 'Vineyards at Akhasheni in Kakheti beneath the Greater Caucasus',
    credit: 'Photo: Vineyards in Akhasheni · Chateau Zegaani · CC BY-SA 2.0',
    creditUrl: `${C}Chateau_Zegaani_Vineyards.jpg`,
    author: 'Chateau Zegaani', licence: 'CC BY-SA 2.0', licenceUrl: CC_BY_SA_2,
  },
  tusheti: {
    src: tusheti, alt: 'The dirt road over the Abano Pass into Tusheti',
    credit: 'Photo: The Abano Pass road · Daviti Zhorzholiani · CC BY-SA 4.0',
    creditUrl: `${C}%E1%83%90%E1%83%91%E1%83%90%E1%83%9C%E1%83%9D%E1%83%A1_%E1%83%A3%E1%83%A6%E1%83%94%E1%83%9A%E1%83%A2%E1%83%94%E1%83%AE%E1%83%98%E1%83%9A%E1%83%98_-_%E1%83%92%E1%83%96%E1%83%90_%E1%83%97%E1%83%A3%E1%83%A8%E1%83%94%E1%83%97%E1%83%98%E1%83%A1%E1%83%99%E1%83%94%E1%83%9C.jpg`,
    author: 'Daviti Zhorzholiani', licence: 'CC BY-SA 4.0', licenceUrl: CC_BY_SA_4,
  },
  kutaisi: {
    src: kutaisi, alt: 'Medieval frescoes in the Church of the Virgin at Gelati Monastery near Kutaisi',
    credit: 'Photo: Frescoes, Church of the Virgin, Gelati · Bernard Gagnon · CC BY 4.0',
    creditUrl: `${C}Church_of_the_Virgin_(Gelati)_02.jpg`,
    author: 'Bernard Gagnon', licence: 'CC BY 4.0', licenceUrl: CC_BY_4,
  },
  svaneti: {
    src: svaneti, alt: 'Stone defensive towers and houses of Ushguli in Upper Svaneti',
    credit: 'Photo: Ushguli, Upper Svaneti · Florian Pinel · CC BY-SA 3.0',
    creditUrl: `${C}Ushguli_Svaneti_Georgia.JPG`,
    author: 'Florian Pinel', licence: 'CC BY-SA 3.0', licenceUrl: CC_BY_SA_3,
  },
  batumi: {
    src: batumi, alt: 'The Black Sea coast of Georgia with the Batumi skyline on the horizon',
    credit: 'Photo: Black Sea coast, Batumi on the horizon · Jagermesh · CC BY-SA 2.0',
    creditUrl: `${C}Black_Sea_coast_of_Georgia_(country),_with_skyline_of_Batumi_on_the_horizon.jpg`,
    author: 'Jagermesh', licence: 'CC BY-SA 2.0', licenceUrl: CC_BY_SA_2,
  },
} satisfies Record<string, Photo>;

export type PhotoId = keyof typeof photos;
