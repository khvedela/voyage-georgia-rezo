/**
 * Latvian page copy (shape: src/i18n/en/pages.ts). `meta` feeds <title>, the meta description, the sitemap,
 * llms.txt and OG images. Keys ending in `Html` are trusted HTML; internal links stay unprefixed.
 */
import type { Dict } from '../dictionaries';

const pages: Dict['pages'] = {
  meta: {
    home: {
      nav: 'Sākums',
      title: 'Privāti ceļojumi pa Gruziju, ko plāno Rezo',
      description: 'Privāti ceļojumi pa Gruziju, ko personīgi plāno Rezo – 20+ gadu Gruzijas tūrismā. Pastāstiet, ko iztēlojaties; viņš izplāno maršrutu, dienas un cenu.',
    },
    'design-my-trip': {
      nav: 'Plānot ceļojumu',
      title: 'Plānot ceļojumu uz Gruziju: bez maksas, ap 3 minūtēm',
      description: 'Atbildiet uz dažiem jautājumiem vai uzrakstiet teikumu. Rezo pats izlasa katru pieprasījumu un izplāno privātu maršrutu pa Gruziju. Bez maksas, bez rezervācijas.',
    },
    journeys: {
      nav: 'Maršrutu piemēri',
      title: 'Maršrutu piemēri pa Gruziju: 6, 8 un 10 dienas',
      description: 'Trīs sākumpunkti ceļojumam uz Gruziju: kalni, vīns un jūra; no vīna ielejām līdz augstkalnu ciemiem; pirmā iepazīšanās. Nevis paketes – cenu nosaka Rezo.',
    },
    destinations: {
      nav: 'Galamērķi',
      title: 'Kurp braukt Gruzijā: reģioni un ceļu piezīmes',
      description: 'Tbilisi, Kazbegi, Kahetija, Tušetija, Kutaisi, Svanetija un Batumi: kāds ir katrs reģions, attālumi starp tiem, kad ceļi ir atvērti un kā Rezo tos savieno.',
    },
    guides: {
      nav: 'Ceļveži',
      title: 'Ceļveži par Gruziju: sezonas, vīns un kalnu ceļi',
      description: 'Praktiski un vienkārši ceļveži ceļojuma uz Gruziju plānošanai: labākais laiks pa mēnešiem, kā top Kahetijas vīns un ko gaidīt no augstkalnu ceļiem.',
    },
    rezo: {
      nav: 'Iepazīstieties ar Rezo',
      title: 'Iepazīstieties ar Rezo – jūsu ceļojuma plānotāju un gidu',
      description: 'Rezo pieder Voyage Georgia Rezo, un viņš pats to vada. Divdesmit gadu Gruzijas tūrismā, pieredzējis privātais gids un cilvēks, kuram jūs patiešām rakstāt.',
    },
    vehicles: {
      nav: 'Autoparks',
      title: 'Mūsu auto: Sprinter, 4×4 un pielāgots ratiņkrēslam',
      description: 'Pieci privāti auto ceļojumiem pa Gruziju: garais un īsais Mercedes Sprinter, ratiņkrēslam pielāgots Sprinter, 4×4 Sprinter un divi Mitsubishi Delica.',
    },
    'accessible-travel': {
      nav: 'Pieejams ceļojums',
      title: 'Ratiņkrēslam pielāgoti ceļojumi pa Gruziju',
      description: 'Ratiņkrēslam pielāgots Sprinter un godīga plānošana: Rezo pārrunā jūsu vajadzības, iepriekš pārbauda katru pieturu un pasaka, kas nav iespējams.',
    },
    'adventure-4x4': {
      nav: '4×4 piedzīvojumi',
      title: '4×4 ceļojumi Gruzijā: Tušetija, Svanetija un Kazbegi',
      description: 'Īsais 4×4 Sprinter un Rezo zināšanas par nomaļiem ceļiem paver Gruzijas kalnu ielejas, augstas pārejas un ciemus. Katru plānu nosaka ceļš un laikapstākļi.',
    },
    faq: {
      nav: 'BUJ',
      title: 'Jautājumi par ceļojumiem pa Gruziju: cena, izmaiņas',
      description: 'Kā Rezo nosaka ceļojuma cenu, vai plānu var mainīt, pieejamība ratiņkrēslā, auto un kas notiek pēc pieprasījuma nosūtīšanas. Tiešas atbildes.',
    },
    contact: {
      nav: 'Kontakti',
      title: 'Sazinieties ar Rezo: ziņa, e-pasts vai ceļojuma plāns',
      description: 'Sāciet ar vienu teikumu vai rakstiet Rezo tieši. Katru pieprasījumu izlasa īsts cilvēks. Nekas nav jāmaksā un nekas netiek rezervēts, kamēr neesat vienojušies.',
    },
  },

  home: {
    world: {
      label: 'Gruzija modelī: izvēlieties vietas vai noskatieties maršruta piemēru',
      canvas: 'Gruzijas trīsdimensiju modelis. Jūsu izvēlētie reģioni tiek atzīmēti ar sarkaniem karodziņiem un savienoti maršrutā; ar atskaņošanas pogu pa modeli virzās maršruta piemērs.',
      h1: 'Jūsu Gruzija, ko izplānojis Rezo.',
      lead: 'Pieskarieties vietām, kas jūs vilina, un iespraudiet karodziņu. Rezo – privātais gids ar divdesmit gadu pieredzi šajos ceļos – pats izplāno dienas starp tām.',
      regionsLabel: 'Reģioni modelī',
      trayKicker: 'Jūsu ceļojums',
      trayEmpty: 'Vēl nekas nav izvēlēts. Pieskarieties kādam reģionam modelī.',
      trayGoOne: 'Plānot to kopā ar Rezo',
      trayGoMany: 'Plānot tās kopā ar Rezo',
      idea: 'Es labprāt redzētu {places}.',
      trayDays: 'aptuveni {days}',
      play: 'Skatīt maršruta piemēru',
      playMeta: 'No Tbilisi līdz Melnajai jūrai pusminūtē',
      pause: 'Apturēt maršrutu',
      resume: 'Turpināt maršrutu',
      exit: 'Atpakaļ pie modeļa',
      replay: 'Skatīt vēlreiz',
      hint: 'Velciet, lai pagrieztu modeli',
      stopOf: ', pietura {i} no {n}',
      moreAbout: 'Uzzināt vairāk: {name}',
      to: ', tālāk ',
      barLabel: 'Maršruta piemēra pieturas',
      outroTitle: 'Tas bija viens maršruts. Jūsējais būs citāds.',
      outroText: 'Pievienojiet nedēļu kalnos, atmetiet jūru, pakavējieties ilgāk pie galda. Rezo veido maršrutu ap jums, izplāno katru dienu un pats nosaka cenu.',
      outroPick: 'Izvēlēties vietas modelī',
    },
    howTitle: 'Nevis pakete. Saruna.',
    howText: 'Lielākā daļa aģentūru jums iedod maršrutu no brošūras. Rezo sāk ar tukšu karti un jūsu pašu vārdiem, tad plāno ceļojumu ap jums.',
    calloutHtml: '<strong>Tehnoloģijas mums palīdz nepazaudēt pavedienu. Rezo tās nekad neaizstāj.</strong> Katru maršrutu un katru cenu viņš pārskata un apstiprina, pirms jūs to redzat, un nekas nav galīgs, kamēr viņš to nav teicis.',
    whereTitle: 'Kur jūs gribētu pamosties?',
    whereText: 'Katru reģionu modelī Rezo pazīst pēc tā ceļiem. Izvēlieties, kas jūs aizrauj, un viņš savienos punktus.',
    alsoHtml: '<strong>Rezo kartē ir arī:</strong> Mcheta, Bordžomi, Vardzija, Rača, Dāvida Garedža, Martvili kanjons un mazie ceļi starp tiem.',
    allDestinations: 'Visi galamērķi',
    journeysTitle: 'Maršruti, ko Rezo varētu izplānot',
    journeysText: 'Sākumpunkti, nevis gatavas paketes. Maršrutu, ilgumu, tempu un cenu vienmēr nosaka tieši jums.',
    fleetTitle: 'Pieci auto – katram ceļam savs',
    fleetText: 'Auto izvēlas pēc maršruta, nevis otrādi.',
    aboutVehicles: 'Par autoparku',
    testimonialsLabel: 'Atsauksmes (vietturis)',
    testimonialsTitle: 'Ceļotāju vārdiem',
    testimonialsText: 'Tikai īstas atsauksmes, publicētas ar atļauju. Šeit nekas neparādīsies, kamēr Rezo nebūs īstu atsauksmju, ar ko dalīties.',
    testimonialQuote: '[Īsta ceļotāja citāts par savu ceļojumu.]',
    testimonialWho: '[Vārds, valsts, ceļojums]: {hint}',
    testimonialHints: ['foto ar atļauju', 'ceļojuma datumi', 'saite uz oriģinālo ierakstu'],
    faqTitle: 'Ko ceļotāji jautā',
    moreFaq: 'Vairāk jautājumu un atbilžu',
    listJourneys: 'Maršrutu piemēri',
    listDestinations: 'Galamērķi',
  },

  designTrip: {
    crumb: 'Plānot ceļojumu',
    howTitle: 'Kā darbojas ceļojuma plānotājs',
    howHtml:
      '<p>Voyage Georgia Rezo nepārdod gatavas tūrisma paketes. Šis plānotājs apkopo, ko jūs vēlaties (intereses, aptuvenus datumus, grupu, tempu), un uzzīmē pirmo skici – kurp Gruzijā šīs intereses parasti aizved. Pēc tam Rezo, kuram ir vairāk nekā divdesmit gadu pieredze Gruzijas tūrismā, pats izlasa jūsu pieprasījumu un izplāno īsto maršrutu, dienas grafiku, auto un cenu.</p>' +
      '<p>Karte nav jāzina. Ja gribat sākt no idejas, apskatiet <a href="/journeys">maršrutu piemērus</a> vai <a href="/destinations">galamērķus</a>, un, ja datumi vēl nav zināmi, izlasiet <a href="/guides/best-time-to-visit-georgia">par labāko laiku ceļojumam uz Gruziju</a>.</p>',
    faqs: [
      { q: 'Vai pieprasījuma nosūtīšana kaut ko maksā?', a: 'Nē. Pieprasījuma nosūtīšana ir bez maksas un nav rezervācija. Rezo to izlasa pats un kopā ar jums plāno īsto ceļojumu; nekas netiek iekasēts, kamēr neesat vienojušies.' },
      { q: 'Vai es redzēšu cenu?', a: 'Plānotājā – nē. Jūsu izvēles uzzīmē pirmo maršruta skici, bet īstu cenu piedāvājumu, pozīciju pa pozīcijai, Rezo uzraksta, kad jūsu ceļojums ir izplānots.' },
      { q: 'Ko darīt, ja Gruziju nemaz nepazīstu?', a: 'Tieši tam plānotājs ir domāts. Pieskarieties tam, kas jūs saista (kalni, vīns, senas baznīcas, jūra), un tas parādīs, kurp šīs intereses parasti ved. Varat arī vienkārši uzrakstīt teikumu.' },
    ],
    serviceName: 'Individuāla privāta ceļojuma plānošana Gruzijā',
    serviceDescription: 'Bezmaksas pieprasījuma forma: izvēlieties intereses, datumus, grupu un tempu vai uzrakstiet teikumu. Rezo pats izplāno privātu maršrutu un sagatavo cenu piedāvājumu.',
    serviceType: 'Privātu ceļojumu plānošana',
    channelName: 'Ceļojuma pieprasījums tiešsaistē',
  },

  journeys: {
    eyebrow: 'Maršrutu piemēri',
    title: 'Maršruti, ko Rezo varētu izplānot',
    summary: 'Trīs sākumpunkti privātam ceļojumam uz Gruziju: sešas, astoņas un desmit dienas. Tās ir idejas, nevis gatavas tūrisma paketes. Maršrutu, ilgumu, tempu un cenu vienmēr nosaka tieši jums, un cena netiek rādīta, kamēr Rezo nav izplānojis jūsu ceļojumu.',
    listName: 'Gruzijas maršrutu piemēri',
    ctaTitle: 'Neviens īsti neder?',
    ctaText: 'Aprakstiet savu ceļojumu vienā teikumā vai atbildiet uz dažiem vienkāršiem jautājumiem. Rezo plāno no tukšas kartes un jūsu pašu vārdiem.',
  },
  journey: {
    best: 'Labākais laiks: {months}',
    nightsTitle: 'Kur paiet naktis',
    mapLabel: 'Maršruta karte',
    start: 'Sākt no šīs idejas',
    faqTitle: 'Jautājumi par šo maršrutu',
    othersTitle: 'Citi sākumpunkti',
    ctaTitle: 'Sāciet no šīs idejas.',
    ctaText: 'Izvēloties to, atbildes tiks aizpildītas jūsu vietā, un katru no tām varēsiet mainīt. Nekas netiek rezervēts, un cena netiek rādīta, kamēr Rezo nav izplānojis īsto ceļojumu.',
    tripName: '{title} ({days} dienu maršruta piemērs)',
    ogEyebrow: 'Maršruta piemērs · {meta}',
  },

  destinations: {
    eyebrow: 'Galamērķi',
    title: 'Kurp braukt Gruzijā',
    summary: 'Gruzija ir pietiekami maza, lai lielākā daļa reģionu būtu puses dienas brauciena attālumā cits no cita, un pietiekami daudzveidīga, lai katrs šķistu kā cita valsts. Šie septiņi ir vietas, kurp parasti ved Rezo maršruti; izvēlieties, kas jūs aizrauj, un viņš savienos punktus.',
    listName: 'Gruzijas galamērķi',
    legsTitle: 'Cik tālu tie ir cits no cita?',
    legsText: 'Tipiski attālumi un laiki bez pieturām. Īsto dienu nosaka jūsu temps, un garos posmus Rezo sadala ar nakti starpā.',
    colLeg: 'Posms',
    colDistance: 'Attālums',
    colTime: 'Tipisks laiks',
    legs: [
      ['Tbilisi → Kahetija (Telavi)', '≈ 85 km', 'apmēram 2 h pāri Gombori pārejai'],
      ['Tbilisi → Kazbegi (Stepancminda)', 'Gruzijas kara ceļš', 'apmēram 3 h bez pieturām'],
      ['Tbilisi → Kutaisi', '≈ 230 km', 'apmēram 3½ h'],
      ['Kutaisi → Mestija (Svanetija)', '≈ 225 km', 'apmēram 4½ h caur Zugdidi'],
      ['Mestija → Batumi', '≈ 260 km', 'apmēram 5 h'],
      ['Telavi → Omalo (Tušetija)', '≈ 100 km', '4–5 h ar 4×4, no jūnija līdz oktobrim'],
    ],
  },
  destination: {
    asideLabel: 'Karte un foto',
    mapNote: 'Maršruti seko īstiem autoceļiem. Reljefs no SRTM, GMTED2010 un ETOPO1 augstuma datiem.',
    add: 'Pievienot ceļojumam: {name}',
    faqTitle: '{name}: biežāk uzdotie jautājumi',
    nearbyTitle: 'Tuvumā kartē',
    readNext: 'Vērts izlasīt',
  },

  guides: {
    eyebrow: 'Ceļveži',
    title: 'Gruzijas plānošana – vienkārši',
    summary: 'Praktiskas piezīmes par to, kas nosaka ceļojumu uz Gruziju: kad braukt, kā top vīns un ko gaidīt no kalnu ceļiem. Rakstītas tajā pašā balsī, kādā mēs plānojam: konkrēti, bez pārspīlējumiem un godīgi par ierobežojumiem.',
    listName: 'Ceļveži par Gruziju',
  },
  guide: {
    eyebrow: 'Ceļvedis · lasīšanas laiks {n} min',
    asideLabel: 'Šajā lapā',
    contents: 'Saturs',
    onThisPage: 'Šajā lapā',
    faqTitle: 'Īsas atbildes',
    placesTitle: 'Vietas šajā ceļvedī',
    moreTitle: 'Citi ceļveži',
    ogEyebrow: 'Ceļvedis par Gruziju',
    feedTitle: '{site} — ceļveži par Gruziju',
  },

  rezo: {
    eyebrow: 'Par mums',
    title: 'Iepazīstieties ar Rezo',
    summary: 'Rezo pieder Voyage Georgia Rezo, un viņš pats to vada. Gruzijas tūrismā viņš strādā vairāk nekā divdesmit gadus, ir pieredzējis privāto ceļojumu gids un katru maršrutu plāno pats. Rakstot aģentūrai, jūs rakstāt viņam.',
    howTitle: 'Kā notiek ceļojuma plānošana ar Rezo',
    howText: 'Lielākā daļa aģentūru jums iedod maršrutu no brošūras. Rezo sāk ar tukšu karti un jūsu pašu vārdiem, tad plāno ceļojumu ap jums.',
    techEyebrow: 'Tehnoloģijas Rezo palīdz',
    techTitle: 'Palīgi sagatavo melnrakstus. Lemj Rezo.',
    techHtml: '<strong>Palīdz:</strong> apkopot pieprasījumus, ieskicēt reģionus pēc interesēm, sagatavot dienas melnrakstu pēc viņa šabloniem, pārbaudīt brauciena laikus, tulkot ziņas un atgādināt viņam par atbildēm.',
    techRules: [
      'Nekas ģenerēts nenonāk līdz ceļotājam, kamēr Rezo to nav publicējis.',
      'Cenas raksta pats Rezo; jebkura aplēse paliek viņa privātajā skatā tikai kā atskaites punkts.',
      'Katrā maršrutā ir rakstīts „Izplānojis Rezo“, un versiju vēsturē redzams, kurš ko mainījis.',
    ],
    ctaTitle: 'Uzrakstiet Rezo vienu teikumu.',
  },

  vehicles: {
    eyebrow: 'Autoparks',
    title: 'Pieci auto. Katram ceļam savs.',
    summary: 'Auto izvēlas pēc maršruta, nevis otrādi. Voyage Georgia Rezo autoparkā ir garais un īsais Mercedes Sprinter, ratiņkrēslam pielāgots Sprinter, 4×4 Sprinter un divi Mitsubishi Delica, un tos vada vadītāji, ar kuriem Rezo sadarbojas.',
    listName: 'Voyage Georgia Rezo autoparks',
    chooseTitle: 'Kā Rezo izvēlas',
    chooseHtml:
      '<p>Auto nosaka grupas lielums, bagāža, ceļa apstākļi un piekļuves vajadzības, un Rezo izdara izvēli, kad maršruts ir uzzīmēts. Pārim vīna maršrutā nevajag to pašu, ko sešu cilvēku ģimenei, kas šķērso kalnu ielejas.</p>' +
      '<ul>' +
      '<li><strong>Kalnu ielejas un grubuļaini ceļi</strong> (piemēram, <a href="/destinations/tusheti">Tušetija</a>): īsais <a href="/adventure-4x4">4×4 Sprinter</a>.</li>' +
      '<li><strong>Ceļotāji, kuri pārvietojas ratiņkrēslā</strong>: īsais, <a href="/accessible-travel">ratiņkrēslam pielāgotais Sprinter</a>, piekļuvi apstiprinot katrā pieturā.</li>' +
      '<li><strong>Garākas brauciena dienas ar grupu</strong>: garās bāzes Sprinter.</li>' +
      '<li><strong>Pāri, ģimenes un mazas grupas</strong>: Delica.</li>' +
      '</ul>' +
      '<p>Kad plāns ir saskaņots, jūsu privātajā maršrutā ir norādīts auto, ko Rezo piešķīris.</p>',
  },

  accessible: {
    eyebrow: 'Pieejams ceļojums',
    title: 'Pieejams ceļojums, plānots godīgi.',
    summary: 'Viens no mūsu Mercedes Sprinter ir pielāgots ratiņkrēslam. Katram pieprasījumam Rezo vispirms pārrunā jūsu vajadzības un pēc tam pārbauda katru pieturu, pirms to iekļauj jūsu maršrutā. Ja kaut kas nav iespējams, viņš to pateiks un ieteiks, kas ir iespējams.',
    bodyHtml:
      '<h2 style="margin-top:0">Ko Rezo dara citādi</h2>' +
      '<p>Gruzijas vecpilsētas, kalnu ciemi un klosteri nav būvēti, domājot par ratiņkrēsliem, un brošūra nevar pateikt, kuras pieturas būs piemērotas tieši jums. Tāpēc standarta pieejamas paketes nav. Tā vietā:</p>' +
      '<ol>' +
      '<li><strong>Vispirms viņš uzklausa.</strong> Pirms maršruts tiek uzzīmēts, Rezo pārrunā jūsu vajadzības: kā jūs ceļojat, kas palīdz un kas ne.</li>' +
      '<li><strong>Viņš pārbauda katru pieturu.</strong> Katra vieta tiek apstiprināta, pirms tā nonāk jūsu maršrutā, dienu pēc dienas.</li>' +
      '<li><strong>Viņš pasaka patiesību.</strong> Ja kaut kas nav iespējams, viņš to pateiks un ieteiks, kas ir iespējams.</li>' +
      '</ol>' +
      '<h2>Auto</h2>',
    vehicleText: 'Pieejamais auto ir īsās bāzes Mercedes Sprinter. Rezo pārliecinās par piekļuvi katrā pieturā, pirms jūs pieņemat lēmumu.',
    vehicleTodo: 'Pielāgojuma detaļas (rampa vai pacēlājs, stiprinājuma punkti, sēdvietas) – jāpārbauda un jānorāda šeit.',
    earlyHtml:
      '<h2>Pastāstiet laikus</h2>' +
      '<p><a href="/design-my-trip">Ceļojuma plānotājā</a> izvēlieties <em>Kāds pārvietojas ratiņkrēslā</em> vai <em>Ierobežotas iespējas staigāt vai kāpt pa kāpnēm</em>, tad pēdējā solī pievienojiet sīkāku informāciju. Varat arī <a href="/contact">rakstīt Rezo tieši</a>. Nekas netiek rezervēts un nekas netiek iekasēts, kamēr neesat vienojušies par plānu.</p>' +
      '<p>Noderīgi arī: lēnākas dienas un retāka viesnīcu maiņa ļoti palīdz, ceļojot ar gados vecākiem vecākiem vai maziem bērniem, – neatkarīgi no tā, vai ir vajadzīgs ratiņkrēsls.</p>',
    photo: 'Šeit būs pieejamā Sprinter fotoattēls',
    faqTitle: 'Jautājumi par pieejamu ceļošanu',
    faqs: [
      { q: 'Vai jums Gruzijā ir ratiņkrēslam pielāgots auto?', a: 'Jā. Viens no mūsu Mercedes Sprinter ir pielāgots ratiņkrēslam. Rezo pārliecinās par piekļuvi katrā pieturā, pirms jūs pieņemat lēmumu.' },
      { q: 'Ko darīt, ja kāda vieta nav pieejama?', a: 'Rezo to pasaka atklāti un iesaka, kas tā vietā ir iespējams. Viņš pārbauda katru pieturu, pirms to iekļauj jūsu maršrutā, lai ceļojuma dienā nebūtu pārsteigumu.' },
      { q: 'Vai šāda ceļojuma cena ir citāda?', a: 'Katra ceļojuma cenu Rezo nosaka pēc maršruta, grupas un auto, un jūs redzat skaidru cenu piedāvājumu ar visu, kas iekļauts. Piekļuves vajadzības ir daļa no šī plāna, nevis piemaksa, ko pieliek vēlāk.' },
      { q: 'Kā pastāstīt par piekļuves vajadzībām?', a: 'Ceļojuma plānotājā izvēlieties „Kāds pārvietojas ratiņkrēslā“ vai „Ierobežotas iespējas staigāt vai kāpt pa kāpnēm“ un pēdējā solī pievienojiet sīkāku informāciju vai vienkārši uzrakstiet Rezo. Pirms kaut ko plānot, viņš pārrunā jūsu vajadzības.' },
    ],
    ctaTitle: 'Pastāstiet Rezo, kas jums vajadzīgs.',
    ctaText: 'Vispirms viņš pārrunā jūsu vajadzības, tad plāno, ņemot tās vērā. Bez maksas, un nekas netiek rezervēts, kamēr neesat vienojušies.',
  },

  adventure: {
    eyebrow: '4×4 piedzīvojumi',
    title: 'Kur ceļš kļūst interesants.',
    summary: 'Īsāks 4×4 Sprinter un Rezo zināšanas par Gruzijas nomaļajiem ceļiem paver kalnu ielejas, augstas pārejas un ciemus, kurus parastie mikroautobusi izlaiž. Katru kalnu plānu nosaka ceļa un laikapstākļi.',
    bodyHtml:
      '<h2 style="margin-top:0">Ceļotājiem, kuri vēlas, lai ceļš būtu daļa no piedzīvojuma</h2>' +
      '<p>Dažas no Gruzijas neaizmirstamākajām vietām atrodas grunts ceļu galā. Rezo plāno šos ceļojumus atbilstoši sezonai un auto, nevis otrādi.</p>' +
      '<h2>Kur 4×4 ir svarīgs</h2>' +
      '<ul>' +
      '<li><a href="/destinations/tusheti"><strong>Tušetija</strong></a>: grunts ceļš tikai 4×4 auto pāri Abano pārejai (apmēram 2850 m) uz akmens ciemiem un vasaras ganībām; no Telavi apmēram 100 km un četras līdz piecas stundas, parasti atvērts no jūnija līdz oktobrim.</li>' +
      '<li><a href="/destinations/svaneti"><strong>Ušguli un Augšsvanetija</strong></a>: dienas brauciens no Mestijas pa kalnu ceļu, auto izvēloties pēc tās dienas apstākļiem.</li>' +
      '<li><a href="/destinations/kazbegi"><strong>Gergeti un Džutas ieleja</strong></a>: virs Stepancmindas tām var piekļūt ar 4×4 vai kājām; Rezo izlemj uz vietas atkarībā no laikapstākļiem.</li>' +
      '</ul>' +
      '<h2>Auto</h2>' +
      '<p>Īsās bāzes Mercedes Sprinter 4×4 – viens no pieciem <a href="/vehicles">autoparka</a> auto. Pirms izvēlaties datumus, <a href="/guides/georgia-mountain-roads-guide">izlasiet, ko gaidīt no Gruzijas kalnu ceļiem</a>.</p>',
    photo: 'Šeit būs 4×4 Sprinter fotoattēls',
    faqTitle: 'Jautājumi par ceļošanu ar 4×4',
    faqs: [
      { q: 'Kādu auto jūs izmantojat kalnu ceļiem?', a: 'Īso Mercedes Sprinter ar 4×4, kas izvēlēts kalnu ielejām un grubuļainiem ceļiem, no kuriem parastie mikroautobusi izvairās.' },
      { q: 'Vai pa šiem ceļiem varu braukt pats?', a: 'Rezo ceļojumos pie stūres ir vadītāji, ar kuriem viņš sadarbojas un kuri pazīst ceļus. Ceļi ir sezonāli un atkarīgi no laikapstākļiem – tas ir galvenais iemesls, kāpēc auto un vadītājs ir svarīgāki par grafiku.' },
      { q: 'Kad ir atvērts ceļš uz Tušetiju?', a: 'Parasti no jūnija līdz oktobrim, ja to atļauj sniegs. Maršruts šķērso Abano pāreju apmēram 2850 m augstumā, un pa to var braukt tikai ar 4×4.' },
      { q: 'Kas notiek, ja laikapstākļi maina plānu?', a: 'Katru kalnu plānu nosaka ceļa un laikapstākļi. Rezo kalnu dienās paredz laika rezervi un, ja apstākļi mainās, pārplāno dienu un jums to pasaka.' },
    ],
    ctaTitle: 'Sāciet ar augstkalnu ciemiem.',
    ctaText: 'Izvēloties ideju „No vīna ielejām līdz augstkalnu ciemiem“, atbildes tiks aizpildītas jūsu vietā. Katru no tām varēsiet mainīt.',
  },

  faq: {
    eyebrow: 'BUJ',
    crumb: 'Jautājumi',
    title: 'Ko ceļotāji jautā',
    summary: 'Tiešas atbildes par to, kā Rezo plāno privātu ceļojumu uz Gruziju: kā tiek noteikta cena, vai plānu var mainīt, pieejamība ratiņkrēslā, auto un kas notiek pēc pieprasījuma nosūtīšanas.',
    groups: {
      planning: 'Ceļojuma plānošana',
      pricing: 'Cena un maksājums',
      access: 'Pieejamība',
      roads: 'Ceļi un sezonas',
      practical: 'Praktiski jautājumi',
    },
    ctaTitle: 'Vēl ir kāds jautājums?',
    ctaText: 'Pajautājiet Rezo tieši. Katru ziņu izlasa īsts cilvēks.',
  },

  contact: {
    eyebrow: 'Kontakti',
    title: 'Sazinieties ar Rezo.',
    summary: 'Sāciet ar teikumu par ceļojumu, ko iztēlojaties, vai rakstiet Rezo tieši. Katru pieprasījumu izlasa īsts cilvēks. Tas ir bez maksas, nekas netiek rezervēts un nekas netiek iekasēts, kamēr jūs un Rezo neesat vienojušies par plānu.',
    nextTitle: 'Kas notiks tālāk',
    steps: [
      { title: 'Rezo to izlasa pats.', text: 'Iespējams, viņš vispirms uzdos kādu jautājumu jūsu izvēlētajā saziņas kanālā.' },
      { title: 'Viņš izplāno pirmo piedāvājumu.', text: 'Maršruts, dienas grafiks, auto un cena, izstrādāti ar roku. Cik ilgi tas aizņem, atkarīgs no sezonas un ceļojuma.' },
      { title: 'Jūs saņemat privātu saiti.', text: 'Apskatiet ceļojumu un lūdziet izmaiņas. Nekas netiek rezervēts, kamēr jūs un Rezo neesat vienojušies.' },
    ],
    responseTodo: 'Rezo jāpievieno, cik ātri viņš parasti atbild.',
    prefer: 'Labprātāk atbildētu uz dažiem vienkāršiem jautājumiem, nevis rakstītu?',
    designTrip: 'Plānot ceļojumu',
  },
};

export default pages;
