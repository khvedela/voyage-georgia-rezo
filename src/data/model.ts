import type { ImageMetadata } from 'astro';
import type { Dict } from '../i18n/dictionaries';
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
 * so every page shows the same model the homepage flies over. `ka` is the region's name in Georgian script
 * (decorative lettering, the same in every language). Alt text and captions: src/i18n/<lang>/data.ts (`model`).
 */
export type ModelId = keyof Dict['data']['model'];
export interface ModelView { src: ImageMetadata; alt: string; ka: string; see: string }

const renders: Record<ModelId, { src: ImageMetadata; ka: string }> = {
  tbilisi: { src: tbilisi, ka: 'თბილისი' },
  kakheti: { src: kakheti, ka: 'კახეთი' },
  tusheti: { src: tusheti, ka: 'თუშეთი' },
  'kutaisi-imereti': { src: kutaisi, ka: 'იმერეთი' },
  svaneti: { src: svaneti, ka: 'სვანეთი' },
  'batumi-adjara': { src: batumi, ka: 'აჭარა' },
  kazbegi: { src: kazbegi, ka: 'ყაზბეგი' },
};

/** The render for a destination slug, with alt text in the page's language (undefined if the model has none). */
export const modelView = (t: Dict, id: string): ModelView | undefined => {
  const r = renders[id as ModelId];
  return r && { ...r, ...t.data.model[id as ModelId] };
};

export const overviewView = (t: Dict) => ({ src: overview, alt: t.data.modelOverviewAlt });
