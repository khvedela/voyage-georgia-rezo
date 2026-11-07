/** Words inside JSON-LD and the generated Open Graph images, in Latvian (shape: src/i18n/en/schema.ts). */
import type { Dict } from '../dictionaries';

const schema: Dict['schema'] = {
  country: 'Gruzija',
  serviceType: ['Privāti ceļojumi', 'Individuāla maršruta plānošana', 'Vīna ceļojumi', 'Pieejami ceļojumi', '4x4 kalnu ceļojumi'],
  orgKnowsAbout: [
    'Privāti ceļojumi pa Gruziju', 'Individuāli maršruti pa Gruziju', 'Kahetijas vīna tūrisms un kvevri vīndarība',
    'Gruzijas kara ceļš un Kazbegi', 'Augšsvanetija', 'Tušetija un Abano pāreja',
    'Ceļojumi pa Gruziju ratiņkrēslā', 'Batumi un Melnās jūras piekraste', 'Tbilisi',
  ],
  catalogName: 'Privāti ceļojumi pa Gruziju',
  services: {
    custom: { name: 'Individuāls privāts ceļojums pa Gruziju', description: 'Vairāku dienu privāts ceļojums, kura maršrutu, dienas grafiku, auto un cenu Rezo izplāno katram ceļotājam atsevišķi.' },
    accessible: { name: 'Privāts ceļojums, pielāgots ratiņkrēslam' },
    adventure: { name: '4x4 kalnu ceļojums uz Tušetiju, Svanetiju un Kazbegi' },
  },
  personDescription: 'Voyage Georgia Rezo īpašnieks. Vairāk nekā divdesmit gadu Gruzijas tūrismā un pieredzējis privāto ceļojumu gids, kas pats plāno katru maršrutu.',
  personKnowsAbout: ['Gruzijas tūrisms', 'Privāto ceļojumu gida darbs', 'Kahetijas vīns', 'Gruzijas kalnu ceļi', 'Pieejami ceļojumi'],
  og: {
    homeEyebrow: 'Privāti ceļojumi pa Gruziju',
  },
};

export default schema;
