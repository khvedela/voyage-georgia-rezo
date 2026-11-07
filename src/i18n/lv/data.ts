/**
 * Latvian copy for the structured data in src/data/*.ts (shape: src/i18n/en/data.ts).
 * Ids stay in the data files; only the words live here.
 */
import type { Dict } from '../dictionaries';

const data: Dict['data'] = {
  faqs: {
    packages: {
      q: 'Vai jūs pārdodat gatavas tūrisma paketes?',
      a: 'Nē. Katrs ceļojums tiek plānots cilvēkam, kurš to lūdz. Šajā vietnē redzamie maršrutu piemēri ir tikai sākumpunkti; maršrutu, tempu, auto un cenu Rezo nosaka tieši jums.',
    },
    price: {
      q: 'Kā tiek aprēķināta cena?',
      a: 'Rezo to aprēķina pats, ņemot vērā jūsu maršrutu, datumus, grupas lielumu, auto un izvēlētās aktivitātes. Jūs saņemat skaidru cenu piedāvājumu, kurā norādīts, kas ir iekļauts un kas nav. Ja mainās plāns, mainās arī cena, un nekas nav galīgs, kamēr Rezo to nav apstiprinājis. Šajā vietnē cenas nav norādītas, jo nav gatavas paketes, kurai to noteikt.',
    },
    change: {
      q: 'Vai plānu var mainīt pēc tam, kad to esat apskatījuši?',
      a: 'Jā. Palūdziet to savā privātajā maršruta lapā vai ziņā. Rezo pārskata grafiku un cenu, un jūs varat salīdzināt katru versiju.',
    },
    wheelchair: {
      q: 'Vai varat ceļot ar cilvēkiem ratiņkrēslā vai ar ierobežotām pārvietošanās spējām?',
      a: 'Mums ir ratiņkrēslam pielāgots Sprinter. Rezo vispirms pārrunā jūsu vajadzības un pirms jūsu lēmuma apstiprina, kas ir iespējams katrā vietā un katrā dienā. Ja kaut kas nav iespējams, viņš to pateiks un ieteiks, kas ir iespējams.',
    },
    reply: {
      q: 'Cik ātri saņemšu atbildi?',
      a: 'Rezo pats izlasa katru pieprasījumu un atbild personīgi. Mēs nesolām tūlītēju atbildi – mēs solām personīgu.',
    },
    pay: {
      q: 'Kā rezervēt un samaksāt?',
      a: 'Pieprasījuma nosūtīšana ir bez maksas un nav rezervācija. Nekas netiek rezervēts un nekas netiek iekasēts, kamēr jūs un Rezo neesat vienojušies par plānu. Pēc tam viņš apstiprina pieejamību un tieši ar jums pārrunā nākamos soļus un maksājuma noteikumus.',
    },
    who: {
      q: 'Ar ko es patiesībā sarunāšos?',
      a: 'Ar Rezo. Viņam pieder Voyage Georgia Rezo, un viņš pats to vada; Gruzijas tūrismā viņš strādā vairāk nekā divdesmit gadus un ir pieredzējis privāto ceļojumu gids. Katru ceļojumu viņš plāno pats un pats atbild uz jūsu ziņām. Ceļojumus un pārbraucienus palīdz īstenot vadītāji, ar kuriem viņš sadarbojas.',
    },
    geography: {
      q: 'Vai, lai sāktu, man jāpārzina Gruzijas ģeogrāfija?',
      a: 'Nē. Izvēlieties to, kas jūs saista (vīns, kalni, senas baznīcas, jūra), vai uzrakstiet dažas rindiņas saviem vārdiem. Rezo izdomā, kurp šīs intereses ved un kādā secībā, un rūpējas, lai braukšanas dienas būtu pietiekami īsas, lai tās varētu baudīt.',
    },
    vehicles: {
      q: 'Kādus auto jūs izmantojat?',
      a: 'Piecus privātus auto: garās bāzes Mercedes Sprinter grupām, īso, ratiņkrēslam pielāgoto Mercedes Sprinter, īso 4×4 Mercedes Sprinter kalnu ceļiem un divus Mitsubishi Delica pāriem, ģimenēm un mazām grupām. Rezo izvēlas auto pēc maršruta, nevis otrādi.',
    },
    tusheti: {
      q: 'Vai Tušetija ir pieejama visu gadu?',
      a: 'Nē. Ceļš uz Tušetiju šķērso Abano pāreju apmēram 2850 m augstumā, un pa to var braukt tikai ar 4×4. Parasti tas ir atvērts no jūnija līdz oktobrim, ja to atļauj sniegs, un precīzus datumus katru gadu nosaka sniegs. Rezo plāno Tušetijas dienas atbilstoši sezonai.',
    },
    bestTime: {
      q: 'Kad ir labākais laiks ceļojumam uz Gruziju?',
      a: 'Tas atkarīgs no tā, ko vēlaties. Vasara ir labākais laiks augstiem kalniem, Svanetijai un pārgājieniem. Septembrī un oktobrī Kahetijā notiek vīnogu raža un kalni ir labi redzami, un tie ir vieni no noslogotākajiem mēnešiem. Pavasaris ir zaļš un kluss, bet vēls rudens un ziema piemēroti pilsētām, vīna pagrabiem un ēdienam. Sīkāk skatiet ceļvedi pa mēnešiem.',
    },
    children: {
      q: 'Vai varam ceļot ar bērniem?',
      a: 'Jā. Nosūtot pieprasījumu, norādiet bērnu vecumu. Ar maziem bērniem vai gados vecākiem vecākiem lēnākas dienas un retāka viesnīcu maiņa ļoti palīdz, un Rezo plāno, ņemot to vērā.',
    },
    private: {
      q: 'Vai šis ir ceļojums kopā ar svešiem cilvēkiem?',
      a: 'Nē. Voyage Georgia Rezo rīko privātus ceļojumus jums un tiem, ar kuriem ceļojat. Jūsu auto neviens cits nepievienojas.',
    },
  },

  steps: [
    { title: 'Pastāstiet Rezo, ko vēlaties', body: 'Izvēlieties to, kas jūs saista, – vīnu, kalnus, senas baznīcas, jūru – vai vienkārši uzrakstiet dažas rindiņas. Karte nav jāzina.' },
    { title: 'Rezo plāno jūsu ceļojumu', body: 'Viņš izstrādā maršrutu pa dienām un stundām: attālumus, ceļus, tempu, auto, naktsmītnes – un pats arī cenu.' },
    { title: 'Apskatiet to privāti', body: 'Jūs saņemat personīgu saiti ar karti, dienas grafiku, iekļauto un cenu piedāvājumu, ko Rezo uzrakstījis pats, nevis ģenerējis.' },
    { title: 'Mainiet, līdz viss ir kā vajag', body: 'Palūdziet vēl vienu nakti kalnos vai lēnāku dienu. Rezo pārskata plānu un cenu. Apstipriniet, kad esat apmierināti.' },
  ],

  vehicles: {
    'sprinter-long': { name: 'Mercedes Sprinter — garais', tags: ['Gara bāze', 'Grupām'], text: 'Privātiem ceļojumiem un grupu pārvadājumiem garākās brauciena dienās.', detailLabel: 'Sēdvietas un bagāža' },
    'sprinter-accessible': { name: 'Mercedes Sprinter — īsais, pielāgots ratiņkrēslam', tags: ['Pielāgots ratiņkrēslam', 'Īsa bāze'], text: 'Ceļotājiem, kuri pārvietojas ratiņkrēslā. Rezo pirms jūsu lēmuma pārliecinās par piekļuvi katrā pieturā.', detailLabel: 'Pielāgojuma detaļas' },
    'sprinter-4x4': { name: 'Mercedes Sprinter — īsais, 4×4 bezceļu', tags: ['4×4', 'Kalnu ceļi'], text: 'Kalnu ielejām un grubuļainiem ceļiem, no kuriem parasti mikroautobusi izvairās.', detailLabel: 'Sēdvietas un bagāža' },
    delica: { name: 'Mitsubishi Delica', tags: ['Pāriem un ģimenēm', 'Mazām grupām'], text: 'Mazāki mikroautobusi pāriem, ģimenēm un mazām grupām.', detailLabel: 'Sēdvietas un bagāža' },
  },

  /** `phrase` goes into "Es labprāt redzētu {places}.", so it is in the accusative. */
  regions: {
    'batumi-adjara': { name: 'Batumi', phrase: 'Batumi un Melnās jūras piekrasti' },
    svaneti: { name: 'Svanetija', phrase: 'Svanetiju un tās torņus' },
    'kutaisi-imereti': { name: 'Kutaisi', phrase: 'Kutaisi un Imeretiju' },
    kazbegi: { name: 'Kazbegi', phrase: 'Kazbegi un Lielo Kaukāzu' },
    tbilisi: { name: 'Tbilisi', phrase: 'Tbilisi' },
    tusheti: { name: 'Tušetija', phrase: 'Tušetiju ar 4×4' },
    kakheti: { name: 'Kahetija', phrase: 'Kahetijas vīna zemi' },
  },
  stops: {
    tbilisi: {
      name: 'Tbilisi', title: 'Sāciet vecpilsētā, bez steigas.',
      line: 'Sēra pirtu kupoli, kokgriezumiem rotāti balkoni un pagalmi, kas atveras vīna bāros. Lielākā daļa ceļojumu sākas šeit, tāpēc pirmais vakars ir viegls.',
      facts: [['≈ 400 m', 'Mtkvari upes krastā'], ['25 min', 'līdz Mchetai, UNESCO objektam']],
    },
    kakheti: {
      name: 'Kahetija', title: 'Uz austrumiem, vīna zemē.',
      line: 'Vīna dārzi zem Lielā Kaukāza, vīns, ko joprojām gatavo zemē ieraktos māla kvevri, Signahi mūri un garas pusdienas.',
      facts: [['Sept.–okt.', 'rtveli – vīnogu raža'], ['≈ 570 m', 'Telavi']],
    },
    tusheti: {
      name: 'Tušetija', title: 'Pāri Abano pārejai.',
      line: 'Ceļš, pa kuru var braukt tikai ar 4×4, kāpj līdz apmēram 2850 m un nolaižas pie akmens ciemiem, slānekļa torņiem un vasaras ganībām.',
      facts: [['Jūn.–okt.', 'kad ceļš ir atvērts'], ['≈ 1880 m', 'Omalo']],
    },
    kutaisi: {
      name: 'Kutaisi', title: 'Uz zaļajiem rietumiem.',
      line: 'Aiz Lihi grēdas zeme kļūst maigāka – sākas Imeretija: Gelati klosteris, Prometeja ala un Martvili kanjons.',
      facts: [['UNESCO', 'Gelati klosteris'], ['≈ 150 m', 'Rioni upes krastā']],
    },
    svaneti: {
      name: 'Svanetija', title: 'Augšup pie torņiem.',
      line: 'Pa Enguri aizu augšup līdz Mestijas viduslaiku torņiem, tad tālāk uz Ušguli zem Šharas – Gruzijas augstākās virsotnes.',
      facts: [['5193 m', 'Šhara'], ['≈ 2100 m', 'Ušguli']],
    },
    batumi: {
      name: 'Batumi', title: 'Noslēgums pie jūras.',
      line: 'Palmas, piejūras bulvāris un Botāniskais dārzs Zaļajā ragā: viegla pēdējā diena pirms lidojuma mājās.',
      facts: [['Jūras līmenis', 'Melnā jūra'], ['Subtropi', 'silts, bieži lietains']],
    },
  },
  legs: [
    { dist: '≈ 85 km', time: 'apmēram 2 h', via: 'pāri Gombori pārejai' },
    { dist: '≈ 100 km', time: '4–5 h ar 4×4', via: 'pāri Abano pārejai apmēram 2850 m augstumā' },
    { dist: 'Divas dienas', time: 'atpakaļ caur Telavi', via: 'ar nakti Tbilisi ceļā uz rietumiem' },
    { dist: '≈ 225 km', time: 'apmēram 4½ h', via: 'caur Zugdidi un Enguri aizu' },
    { dist: '≈ 260 km', time: 'apmēram 5 h', via: 'no kalniem lejup līdz piekrastei' },
  ],

  model: {
    tbilisi: { see: 'Sameba, Narikalas cietoksnis, Mtkvari upe un vecpilsēta', alt: 'Tbilisi modelī: Samebas katedrāle, Narikalas cietoksnis virs Mtkvari upes un vecpilsētas sarkanie jumti.' },
    kakheti: { see: 'vīna dārzi, Alaverdi, Signahi mūri un gaisa balons', alt: 'Kahetija modelī: vīnogulāju rindas, māla kvevri, Alaverdi klosteris un mūriem apjoztā Signahi pilsēta.' },
    tusheti: { see: 'Keselo torņi, Omalo un vasaras ganāmpulki', alt: 'Tušetija modelī: Keselo akmens torņi virs Omalo un aitas augstkalnu ganībās.' },
    'kutaisi-imereti': { see: 'Bagrati, Gelati un Baltais tilts', alt: 'Kutaisi modelī: Bagrati katedrāle kalnā, Gelati klosteris un Rioni upe.' },
    svaneti: { see: 'Mestijas un Ušguli torņi un Enguri upe', alt: 'Svanetija modelī: viduslaiku svanu torņu puduri Mestijā un Ušguli zem sniegotām virsotnēm.' },
    'batumi-adjara': { see: 'Alfabēta tornis, bulvāris un jūra', alt: 'Batumi modelī: Alfabēta tornis, piekrastes stikla torņi, palmas un Melnā jūra.' },
    kazbegi: { see: 'Gergeti Svētās Trīsvienības baznīca un Stepancminda zem Kazbeka kalna', alt: 'Kazbegi modelī: Gergeti Svētās Trīsvienības baznīca uz kalna kores virs Stepancmindas ciema un Tereka upe.' },
  },
  modelOverviewAlt: 'Viss Gruzijas modelis uz pamatnes: pa kreisi Melnā jūra, augšmalā Kaukāzs, bet starp tiem – reģioni.',
  modelCaption: '{name} modelī: {see}.',

  photos: {
    tbilisi: { alt: 'Abanotubani sēra pirtu kupoli zem Narikalas cietokšņa vecajā Tbilisi', title: 'Abanotubani no Narikalas' },
    kakheti: { alt: 'Vīna dārzi Ahašeni ciemā Kahetijā zem Lielā Kaukāza', title: 'Vīna dārzi Ahašeni' },
    tusheti: { alt: 'Grunts ceļš pāri Abano pārejai uz Tušetiju', title: 'Abano pārejas ceļš' },
    kutaisi: { alt: 'Viduslaiku freskas Dievmātes baznīcā Gelati klosterī pie Kutaisi', title: 'Freskas, Dievmātes baznīca, Gelati' },
    svaneti: { alt: 'Ušguli akmens aizsardzības torņi un mājas Augšsvanetijā', title: 'Ušguli, Augšsvanetija' },
    batumi: { alt: 'Gruzijas Melnās jūras piekraste ar Batumi siluetu pie apvāršņa', title: 'Melnās jūras piekraste, pie apvāršņa Batumi' },
  },
  photoCredit: 'Foto: {title} · {author} · {licence}',

  maps: {
    kazbegi: 'Gruzijas kara ceļa karte no Mchetas uz ziemeļiem līdz Stepancmindai zem Kazbeka kalna',
    kakheti: 'Kahetijas karte ar Telavi, Signahi un Dāvida Garedžu',
    svaneti: 'Augšsvanetijas karte ar Mestiju, Ušguli, Ušbu un Šharu',
    batumi: 'Melnās jūras piekrastes karte pie Batumi',
    kutaisi: 'Kutaisi karte Imeretijā, uz ceļa starp Tbilisi, Svanetiju un Batumi',
    tusheti: 'Karte: ceļš no Telavi Kahetijā uz ziemeļiem līdz Tušetijai pāri Abano pārejai',
    tbilisi: 'Tbilisi un Mchetas karte',
    mountainsWineSea: 'Karte: Tbilisi, Kazbegi, Kahetija, Kutaisi un Batumi pa autoceļiem',
    wineToHighVillages: 'Karte: Tbilisi, Signahi, Telavi un Tušetija',
    firstTaste: 'Karte: Tbilisi, Kazbegi un Kahetija',
  },
};

export default data;
