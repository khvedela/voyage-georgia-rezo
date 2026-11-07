/**
 * Site-wide copy in Latvian (shape: src/i18n/en/common.ts).
 * Strings may contain {placeholders}; keys ending in `Html` are trusted HTML rendered with set:html.
 */
import type { Dict } from '../dictionaries';
import type { Plural } from '../utils';

const p = (forms: Plural) => forms;

const common: Dict['common'] = {
  site: {
    tagline: 'Jūsu Gruzija, ko izplānojis Rezo.',
    titleTagline: 'Jūsu Gruzija. Personīgi izplānojis Rezo.',
    description:
      'Privāti ceļojumi pa Gruziju, ko plāno Rezo – gids ar vairāk nekā divdesmit gadu pieredzi Gruzijas tūrismā. Pastāstiet, ko iztēlojaties, un viņš pats izplāno maršrutu, dienas un cenu.',
    founderJobTitle: 'Privāto ceļojumu gids un dibinātājs',
    privateTours: 'Privāti ceļojumi pa Gruziju, ko plāno Rezo',
  },

  a11y: {
    skip: 'Pāriet uz saturu',
    homeLink: 'Voyage Georgia Rezo, sākumlapa',
    mainNav: 'Galvenā navigācija',
    breadcrumb: 'Navigācijas ceļš',
    feedTitle: 'Ceļveži par Gruziju',
    llmsTitle: 'Vietnes kopsavilkums valodas modeļiem',
  },

  lang: {
    label: 'Valoda',
    current: 'Valoda: {name}',
  },

  nav: {
    destinations: 'Galamērķi',
    journeys: 'Maršruti',
    vehicles: 'Autoparks',
    guides: 'Ceļveži',
    rezo: 'Iepazīstieties ar Rezo',
    faq: 'Jautājumi',
    designTrip: 'Plānot ceļojumu',
    designTripShort: 'Plānot',
    home: 'Sākums',
  },

  footer: {
    about:
      'Ģimenes uzņēmums – privātu ceļojumu aģentūra Gruzijā. Plānojam attālināti, ceļojumu īstenojam klātienē: biroja, kur ienākt no ielas, nav – ir Rezo, un viņš ir tikai vienas ziņas attālumā.',
    plan: 'Plānot',
    planLabel: 'Plānojiet savu ceļojumu',
    learn: 'Uzzināt',
    talk: 'Sazināties ar Rezo',
    designTrip: 'Plānot ceļojumu',
    journeys: 'Maršrutu piemēri',
    destinations: 'Galamērķi',
    vehicles: 'Autoparks',
    guides: 'Ceļveži',
    accessible: 'Pieejams ceļojums',
    adventure: '4×4 piedzīvojumi',
    faq: 'Jautājumi',
    aboutRezo: 'Par Rezo',
    contact: 'Kontakti',
    registrationTodo: 'Uzņēmuma reģistrācijas dati – jāpievieno',
    credits:
      'Kartes: robežas no Natural Earth; reljefs no SRTM (NASA), GMTED2010 (USGS) un ETOPO1 (NOAA) datiem, visi ir publiski pieejami (public domain). Fotoattēlu autori norādīti pie katra attēla. Fotoattēlu laukumi, kas atzīmēti kā vietturi, gaida paša Rezo fotogrāfijas.',
  },

  cta: {
    title: 'Pastāstiet Rezo, ko iztēlojaties.',
    text: 'Bez maksas, apmēram trīs minūtes, un nekas netiek rezervēts. Viņš pats izlasa katru pieprasījumu un kopā ar jums plāno īsto ceļojumu.',
    label: 'Sākt plānot',
    designTrip: 'Plānot ceļojumu',
    message: 'Rakstīt Rezo',
  },

  contactCta: {
    title: 'Sāciet ar vienu teikumu.',
    text: 'Pastāstiet Rezo, ko iztēlojaties. Pārējo viņš paveiks pats.',
    label: 'Aprakstiet savu ideālo ceļojumu',
    placeholder: 'Mums ir desmit dienas septembrī. Gribētos kalnus, vīnu, senas baznīcas un mazliet jūras – bez nogurdinošām braukšanas dienām.',
    submit: 'Turpināt',
    then: 'Tad daži ātri, uzskatāmi jautājumi.',
    preferTalk: 'Vēlaties vienkārši parunāt?',
  },

  channels: {
    whatsapp: 'WhatsApp',
    messenger: 'Messenger',
    email: 'E-pasts: {address}',
    mailSubject: 'Ceļojums uz Gruziju',
  },

  intro: {
    by: 'Autors: {name}',
    updated: 'Atjaunināts: {date}',
  },

  cards: {
    addToTrip: 'Pievienot ceļojumam',
    readJourney: 'Lasīt par šo maršrutu',
    readGuide: 'Lasīt ceļvedi',
    minRead: 'Lasīšanas laiks: {n} min',
    vehiclePhoto: 'Šī auto fotoattēls',
    toVerify: 'jāpārbauda',
  },

  meetRezo: {
    photo: 'Šeit būs Rezo portrets – vislabāk ceļā, dienas gaismā.',
    title: 'Cilvēks, kas plāno jūsu ceļojumu, ir tas pats, kuram rakstāt.',
    text: 'Rezo pieder Voyage Georgia Rezo, un viņš pats to vada. Gruzijas tūrismā viņš strādā vairāk nekā divdesmit gadus un ir pieredzējis privāto ceļojumu gids. Ceļojumus un pārbraucienus palīdz īstenot vadītāji, ar kuriem viņš sadarbojas.',
    wordsTodo: 'Paša Rezo vārdi par to, kāpēc viņš to dara – jāuzraksta kopā ar viņu.',
    years: '20+ gadi',
    yearsNote: 'Gruzijas tūrismā',
    handBuilt: 'Ar roku veidoti',
    handBuiltNote: 'maršruti, grafiki un cenas',
    licenceTodo: 'Licence',
    licenceNote: 'gida kvalifikācija – jāpārbauda',
    more: 'Vairāk par Rezo',
  },

  notFound: {
    title: 'Lapa nav atrasta',
    description: 'Šāda lapa nepastāv. Sāciet no sākumlapas vai plānojiet savu ceļojumu.',
    heading: 'Šis ceļš nekur neved.',
    text: 'Meklētās lapas šeit nav. Izmēģiniet kādu no šīm.',
    home: 'Atpakaļ uz sākumu',
    destinations: 'Galamērķi',
    designTrip: 'Plānot ceļojumu',
  },

  units: {
    days: p({ zero: '{n} dienas', one: '{n} diena', other: '{n} dienas' }),
    nights: p({ zero: '{n} naktis', one: '{n} nakts', other: '{n} naktis' }),
  },

  places: {
    Tbilisi: 'Tbilisi',
    Mtskheta: 'Mcheta',
    Ananuri: 'Ananuri',
    Gudauri: 'Gudauri',
    Kazbegi: 'Kazbegi',
    Stepantsminda: 'Stepancminda',
    'Mt Kazbek': 'Kazbeka kalns',
    Kakheti: 'Kahetija',
    Telavi: 'Telavi',
    Sighnaghi: 'Signahi',
    'David Gareja': 'Dāvida Garedža',
    Tusheti: 'Tušetija',
    Omalo: 'Omalo',
    Borjomi: 'Bordžomi',
    Vardzia: 'Vardzija',
    Kutaisi: 'Kutaisi',
    Svaneti: 'Svanetija',
    Mestia: 'Mestija',
    Ushguli: 'Ušguli',
    Ushba: 'Ušba',
    Shkhara: 'Šhara',
    Batumi: 'Batumi',
    Gori: 'Gori',
    'BLACK SEA': 'MELNĀ JŪRA',
  },
};

export default common;
