import type { ImageMetadata } from 'astro';
import tbilisi from '../assets/model/tbilisi.png';
import kakheti from '../assets/model/kakheti.png';
import tusheti from '../assets/model/tusheti.png';
import kutaisi from '../assets/model/kutaisi.png';
import svaneti from '../assets/model/svaneti.png';
import batumi from '../assets/model/batumi.png';
import kazbegi from '../assets/model/kazbegi.png';
import overview from '../assets/model/overview.png';

/**
 * Close-up renders of the Blender miniature (blender/render.py, from the scene's own cameras), one per region,
 * so every page shows the same model the homepage flies over. `ka` is the region's name in Georgian script.
 */
export interface ModelView { src: ImageMetadata; alt: string; ka: string; see: string }

export const modelViews: Record<string, ModelView> = {
  tbilisi: { src: tbilisi, ka: 'თბილისი', see: 'Sameba, Narikala fortress, the Mtkvari and the old town',
    alt: 'Tbilisi on the model: Sameba cathedral, Narikala fortress above the Mtkvari river and the red roofs of the old town.' },
  kakheti: { src: kakheti, ka: 'კახეთი', see: 'Vineyards, Alaverdi, Sighnaghi’s walls and a hot-air balloon',
    alt: 'Kakheti on the model: rows of vines, clay qvevri, Alaverdi monastery and the walled town of Sighnaghi.' },
  tusheti: { src: tusheti, ka: 'თუშეთი', see: 'Keselo towers, Omalo and the summer flocks',
    alt: 'Tusheti on the model: the stone towers of Keselo above Omalo, with sheep on the high pastures.' },
  'kutaisi-imereti': { src: kutaisi, ka: 'იმერეთი', see: 'Bagrati, Gelati and the White Bridge',
    alt: 'Kutaisi on the model: Bagrati cathedral on its hill, Gelati monastery and the Rioni river.' },
  svaneti: { src: svaneti, ka: 'სვანეთი', see: 'The towers of Mestia and Ushguli and the Enguri',
    alt: 'Svaneti on the model: clusters of medieval Svan towers at Mestia and Ushguli beneath snowy peaks.' },
  'batumi-adjara': { src: batumi, ka: 'აჭარა', see: 'The Alphabet Tower, the boulevard and the sea',
    alt: 'Batumi on the model: the Alphabet Tower, the glass towers of the seafront, palms and the Black Sea.' },
  kazbegi: { src: kazbegi, ka: 'ყაზბეგი', see: 'Gergeti Trinity and Stepantsminda below Kazbek',
    alt: 'Kazbegi on the model: Gergeti Trinity church on its ridge above the village of Stepantsminda and the Terek river.' },
};

export const overviewView = {
  src: overview,
  alt: 'The whole model of Georgia on its plinth: the Black Sea on the left, the Caucasus along the top and the regions in between.',
};

/** Georgian names for the six stops of the homepage route. */
export const stopKa: Record<string, string> = {
  Tbilisi: 'თბილისი', Kakheti: 'კახეთი', Tusheti: 'თუშეთი', Kutaisi: 'ქუთაისი', Svaneti: 'სვანეთი', Batumi: 'ბათუმი',
};
