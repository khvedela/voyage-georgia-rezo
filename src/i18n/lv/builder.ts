/**
 * Latvian trip builder copy (shape: src/i18n/en/builder.ts).
 * Interest, access, pace, budget and channel keys are ids used in the code: only the values are translated.
 * Latvian plural categories: zero (0, 10–20, 30 …), one (1, 21, 31 …), other.
 */
import type { Dict } from '../dictionaries';
import type { Plural } from '../utils';

const p = (forms: Plural) => forms;

const builder: Dict['builder'] = {
  header: {
    homeLabel: 'Voyage Georgia Rezo, sākumlapa',
    stepsNav: 'Soļi',
    close: 'Aizvērt',
    steps: { interests: 'Intereses', dates: 'Datumi', group: 'Grupa', pace: 'Temps', send: 'Nosūtīt' },
  },

  nav: {
    back: 'Atpakaļ',
    continue: 'Turpināt',
    review: 'Pārskatīt ceļojumu',
    send: 'Nosūtīt Rezo',
    sending: 'Sūta…',
    skip: 'Izlaist – Rezo var pajautāt vēlāk',
    timeLeft: { interests: 'Atlikušas apmēram 2 min', dates: 'Atlikušas apmēram 90 s', group: 'Atlikusi apmēram 1 min', pace: 'Gandrīz galā' },
  },

  units: {
    days: p({ zero: '{n} dienas', one: '{n} diena', other: '{n} dienas' }),
    daysWord: p({ zero: 'dienas', one: 'diena', other: 'dienas' }),
    nightsRange: p({ zero: '{from}–{n} naktis', one: '{from}–{n} nakts', other: '{from}–{n} naktis' }),
    adults: p({ zero: '{n} pieaugušie', one: '{n} pieaugušais', other: '{n} pieaugušie' }),
    children: p({ zero: '{n} bērni', one: '{n} bērns', other: '{n} bērni' }),
  },

  start: {
    eyebrow: 'Plānot ceļojumu',
    title: 'Ieskicēsim jūsu Gruziju.',
    lead: 'Nav nepareiza veida, kā sākt, un nekas šeit nav galīgs. Izvēlieties to, kas šķiet visvieglāk. Rezo pats izlasa katru pieprasījumu un kopā ar jums plāno īsto ceļojumu.',
    guided: 'Atbildēt uz dažiem vienkāršiem jautājumiem',
    guidedBadge: 'Visnoderīgākais',
    guidedNote: '4 īsi soļi, apmēram 2 minūtes. Pa ceļam redzēsiet pirmo maršruta skici.',
    sample: 'Sākt no ceļojuma parauga',
    sampleNote: 'Izvēlieties līdzīgu ideju un mainiet, ko vien vēlaties.',
    write: 'Vienkārši uzrakstīt Rezo',
    writeNote: 'Aprakstiet to saviem vārdiem. Pietiek ar vienu teikumu.',
    assure: ['Bez maksas, bez rezervācijas', 'Visu var mainīt vēlāk', 'Atbild īsts cilvēks'],
  },

  samples: {
    eyebrow: 'Ceļojumu paraugi',
    title: 'Kurš ir vistuvākais?',
    lead: 'Tie ir sākumpunkti, nevis gatavas tūrisma paketes. Izvēloties kādu, atbildes tiks aizpildītas jūsu vietā, un nākamajā ekrānā katru no tām varēsiet mainīt.',
    items: {
      classic: {
        title: 'Kalni, vīns un mazliet jūras',
        meta: '10 dienas · līdzsvaroti',
        route: 'Augsti kalni, Kahetijas vīna dārzi, seni klosteri un dažas dienas pie Melnās jūras',
      },
      wild: {
        title: 'No vīna ielejām līdz augstkalnu ciemiem',
        meta: '8 dienas · piedzīvojumiem',
        route: 'Kahetijas vīna pagrabi, tad ar 4×4 pāri Abano pārejai uz Tušetijas ciemiem',
      },
      first: {
        title: 'Pirmā iepazīšanās ar Gruziju',
        meta: '6 dienas · nesteidzīgi',
        route: 'Tbilisi vecpilsēta, Mcheta un diena Kahetijas vīna dārzos',
      },
    },
  },

  write: {
    eyebrow: 'Saviem vārdiem',
    title: 'Kāda izskatītos jūsu ideālā Gruzija?',
    lead: 'Rakstiet, kā nāk prātā. Datumi, kas brauks līdzi, kas jums patīk, ko labāk izlaist. Par visu, kas būs vajadzīgs, Rezo pajautās.',
    label: 'Aprakstiet savu ideālo ceļojumu',
    placeholder: 'Mums ir desmit dienas septembrī. Gribētos kalnus, vīnu, senas baznīcas un mazliet jūras, bez gariem braucieniem katru dienu.',
    nudge: 'Vajag ierosmi? Pieskarieties kādam teikumam, lai sāktu ar to:',
    examples: [
      'Desmit dienas septembrī: kalni, vīns, senas baznīcas un mazliet jūras, bez gariem braucieniem katru dienu.',
      'Nesteidzīga nedēļa divatā: laba virtuve, mazi ciemi un pāris nakšu kalnos.',
      'Mēs esam četri, viens no mums pārvietojas ratiņkrēslā. Mums patīk vēsture un garas pusdienas.',
    ],
  },

  interests: {
    eyebrow: '1. solis no 4',
    title: 'Ko jūs labprāt redzētu?',
    lead: 'Pieskarieties dažiem vai tikai vienam. Nav jāzina, kur kas atrodas. Karte aizpildās, kamēr izvēlaties.',
    more: 'Vēl kas, kas jums varētu patikt',
    surprise: 'Nezinu – parādiet Rezo iecienītākās vietas',
    labels: {
      mountains: 'Augsti kalni',
      wine: 'Vīns un vīna dārzi',
      churches: 'Klosteri un freskas',
      history: 'Vecpilsētas un pilsētas',
      adventure: 'Nomaļas ielejas ar 4×4',
      sea: 'Melnā jūra',
      food: 'Ēdiens un supra mielasti',
      hiking: 'Pastaigas un pārgājieni',
      villages: 'Ciemi un vietējā dzīve',
      nature: 'Kanjoni un alas',
    },
  },

  dates: {
    eyebrow: '2. solis no 4',
    title: 'Kad un uz cik ilgu laiku?',
    lead: 'Pietiek ar aptuvenu priekšstatu. No sezonas atkarīgs, kuri ceļi ir atvērti un kas tajā brīdī ir visskaistākais.',
    months: ['janv.', 'febr.', 'marts', 'apr.', 'maijs', 'jūn.', 'jūl.', 'aug.', 'sept.', 'okt.', 'nov.', 'dec.'],
    notDecided: 'Vēl nav izlemts',
    seasonLabel: '{season} · {month}',
    seasons: {
      winter: { name: 'Ziema', text: 'Kalnos sniegs, slēpošana Gudauri un Bakuriani. Pilsētas, vīna pagrabi un ēdiens šajā laikā ir vismājīgākie. Pēc snigšanas augstkalnu ceļus var slēgt, un Tušetija ir nepieejama līdz vasarai.' },
      earlySpring: { name: 'Agrs pavasaris', text: 'Līdzenumi kļūst zaļi, un zied augļu dārzi. Tbilisi, Kahetijā un rietumos ir patīkami; augstie kalni vēl ir zem sniega.' },
      lateSpring: { name: 'Vēls pavasaris', text: 'Zaļš, svaigs un lielākoties bez pūļiem. Piemērots gandrīz visam; ceļu uz Tušetiju parasti atver jūnijā.' },
      summer: { name: 'Vasara', text: 'Labākais laiks augstiem kalniem, Svanetijai un pārgājieniem. Tbilisi un līdzenumos kļūst karsti, un piekrastē ir visvairāk cilvēku.' },
      autumn: { name: 'Rudens', text: 'Vīnogu raža Kahetijā un skaidri skati uz kalniem. Viena no populārākajām sezonām. Ceļu uz Tušetiju parasti slēdz oktobrī.' },
      lateAutumn: { name: 'Vēls rudens', text: 'Klusi un izdevīgi. Lieliski Tbilisi, vīnam un ēdienam; kalnos laiks mainās, un daži augstkalnu ceļi tiek slēgti.' },
    },
    tushetiClosed: 'Tušetijas kalnu ceļš parasti ir atvērts tikai no jūnija līdz oktobrim, tāpēc skicē tā nav iekļauta (izvēlētais laiks: {month}). Izvēlieties kādu vasaras mēnesi, lai to iekļautu, vai paturiet šos datumus, un Rezo ieteiks citas augstkalnu ielejas.',
    theseDates: 'jūsu datumi',
    howMany: 'Cik dienas?',
    dayFewer: 'Par vienu dienu mazāk',
    dayMore: 'Par vienu dienu vairāk',
    suggest: 'Ieteikt ilgumu',
    lenTipPicked: p({
      zero: 'Jūsu izvēlētajam bez steigas pietiks ar apmēram {from}–{n} dienām. Der arī mazāk dienu: Rezo vienkārši izvēlēsies mazāk vietu.',
      one: 'Jūsu izvēlētajam bez steigas pietiks ar apmēram {from}–{n} dienu. Der arī mazāk dienu: Rezo vienkārši izvēlēsies mazāk vietu.',
      other: 'Jūsu izvēlētajam bez steigas pietiks ar apmēram {from}–{n} dienām. Der arī mazāk dienu: Rezo vienkārši izvēlēsies mazāk vietu.',
    }),
    lenTipNone: 'Lielākā daļa pirmo ceļojumu ilgst no 7 līdz 12 dienām. Īsāks ceļojums labi der, ja koncentrējaties uz vienu vai diviem reģioniem.',
  },

  group: {
    eyebrow: '3. solis no 4',
    title: 'Kas brauks līdzi?',
    lead: 'Lai Rezo varētu padomāt par auto, istabām un to, cik garai jābūt katrai dienai.',
    adults: 'Pieaugušie',
    children: 'Bērni',
    adultFewer: 'Par vienu pieaugušo mazāk',
    adultMore: 'Par vienu pieaugušo vairāk',
    childFewer: 'Par vienu bērnu mazāk',
    childMore: 'Par vienu bērnu vairāk',
    accessQ: 'Vai ir kaut kas, kas ietekmē to, kā jūs ceļojat?',
    access: {
      none: 'Nekā īpaša',
      wheel: 'Kāds pārvietojas ratiņkrēslā',
      walk: 'Ierobežotas iespējas staigāt vai kāpt pa kāpnēm',
      other: 'Kaut kas cits',
    },
    accessNote: 'Viens no Rezo Sprinter ir pielāgots ratiņkrēslam. Viņš vispirms pārrunā jūsu vajadzības un pārbauda katru pieturu, pirms to iesaka. Sīkāku informāciju pievienojiet pēdējā solī.',
    kidsNote: 'Pēdējā solī norādiet bērnu vecumu, lai dienas varētu plānot, ņemot viņus vērā.',
  },

  pace: {
    eyebrow: '4. solis no 4',
    title: 'Kādas dienas jums der?',
    lead: 'No tā atkarīgs, cik daudz var iekļaut. Lielākā daļa izvēlas vidējo variantu.',
    options: {
      slow: { label: 'Nesteidzīgs, ar brīvu laiku', note: 'Īsi braucieni, garas pusdienas un laiks pakavēties. Iekļautas atpūtas dienas.' },
      balanced: { label: 'Līdzsvarots', note: 'Piesātinātākas dienas mijas ar vieglākām. Populārākā izvēle.' },
      full: { label: 'Piesātināts un aktīvs', note: 'Redzēt pēc iespējas vairāk. Agri rīti nav problēma.' },
    },
    budgetQ: 'Un kādas naktsmītnes un papildu iespējas?',
    budgets: {
      simple: 'Vienkārši un izdevīgi',
      comfort: 'Ērti',
      treat: 'Atļausimies ko īpašu',
      advise: 'Nezinu, ieteiciet',
    },
    budgetNote: 'Tikai sajūta. Cenas vēl nav: īstu cenu piedāvājumu, pozīciju pa pozīcijai, Rezo uzrakstīs, kad jūsu ceļojums būs izplānots.',
  },

  send: {
    eyebrow: 'Gandrīz galā',
    title: 'Pārbaudiet un nosūtiet Rezo.',
    lead: 'Jebko varat mainīt ar vienu pieskārienu. Nosūtīšana ir bez maksas un nav rezervācija.',
    change: 'Mainīt',
    rows: { words: 'Jūsu vārdi', drawnTo: 'Jūs saista', when: 'Kad', who: 'Kas', daysStays: 'Dienas un naktsmītnes' },
    changeAria: {
      words: 'Mainīt aprakstu',
      interests: 'Mainīt intereses',
      dates: 'Mainīt datumus un ilgumu',
      group: 'Mainīt ceļotājus',
      pace: 'Mainīt tempu un budžetu',
    },
    nothingWritten: 'Vēl nekas nav uzrakstīts',
    name: 'Jūsu vārds',
    namePlaceholder: 'Pietiek ar vārdu',
    contact: 'WhatsApp numurs vai e-pasts',
    contactPlaceholder: 'Lai Rezo varētu atbildēt',
    channelQ: 'Kur Rezo jums atbildēt?',
    channels: { WhatsApp: 'WhatsApp', Messenger: 'Messenger', Email: 'E-pasts' },
    extra: 'Vēl kaut kas?',
    optional: 'Nav obligāti',
    extraPlaceholder: 'Dzimšanas diena, bērnu vecums, vieta, ko vienmēr esat gribējuši redzēt, kaut kas, ko labāk izlaist…',
    privacy: 'Jūsu dati nonāk tikai pie Rezo.',
    error: 'Neizdevās nosūtīt. Lūdzu, mēģiniet vēlreiz vai nosūtiet pieprasījumu tieši Rezo ar tālāk redzamajām pogām.',
  },

  done: {
    sent: 'Paldies, {name}! Jūsu pieprasījums nu ir pie Rezo.',
    handoff: 'Gandrīz galā, {name}! Vēl viens pieskāriens.',
    ready: 'Jūsu pieprasījums ir gatavs, {name}.',
    /** Vocative: used for {name} in the greetings above. */
    traveller: 'ceļotāj',
    handoffLead: 'Mēs atvērām ziņu Rezo, kurā jūsu atbildes jau ir ierakstītas. Nospiediet tur „Sūtīt“, un tā nonāks pie viņa.',
    noneLeadHtml: 'Šī forma vēl nevar nosūtīt ziņas. Nokopējiet savu pieprasījumu zemāk un nosūtiet to Rezo no <a href="/contact">kontaktu lapas</a>.',
    requestLabel: 'Jūsu pieprasījums',
    next: 'Lūk, kas notiks tālāk.',
    steps: [
      { title: 'Rezo to izlasa pats.', text: 'Iespējams, viņš vispirms uzdos kādu jautājumu pa {channel}.' },
      { title: 'Viņš izplāno pirmo piedāvājumu.', text: 'Maršruts, dienas grafiks, auto un cena, izstrādāti ar roku. Cik ilgi tas aizņem, atkarīgs no sezonas un ceļojuma.' },
      { title: 'Jūs saņemat privātu saiti.', text: 'Apskatiet ceļojumu un lūdziet izmaiņas. Nekas netiek rezervēts, kamēr jūs un Rezo neesat vienojušies.' },
    ],
    /** After "pa" (accusative). */
    channelInText: { WhatsApp: 'WhatsApp', Messenger: 'Messenger', Email: 'e-pastu' },
    journeys: 'Skatīt maršrutu piemērus',
    home: 'Atpakaļ uz sākumu',
  },

  aside: {
    title: 'Jūsu ceļojums līdz šim',
    badge: 'Pirmā skice · nevis plāns',
    tipTitle: 'Noder zināt',
    mapLabel: 'Gruzijas karte',
    mapLabelRoute: 'Gruzijas karte ar pirmo skici: {route}',
    routeTitle: 'Šāds maršruts varētu būt',
    nightsEach: 'Apmēram {nights} katrā vietā, kopā {days}. Īsto secību, ceļus un laikus nosaka Rezo.',
    empty: 'Jūsu izvēles šeit uzzīmēs pirmo skici: kurp jūsu intereses parasti aizved un aptuveni kādā secībā.',
    rows: { words: 'Jūsu vārdi', drawnTo: 'Jūs saista', when: 'Kad', length: 'Ilgums', who: 'Kas', pace: 'Temps', soFar: 'Līdz šim' },
    nothingYet: 'Vēl nekā. Šeit parādīsies jūsu atbildes.',
  },

  tips: {
    start: 'Šeit nevar kļūdīties. Rezo pietiek pat ar vienu rindiņu, lai sāktu, un par visu, kas vajadzīgs, viņš pajautās.',
    samples: 'Katru paraugu var pagarināt, saīsināt vai apvienot ar citu. Izvēlieties to, kas šķiet vistuvākais, nevis ideāls.',
    write: 'Pieminiet arī to, no kā labāk izvairīties, piemēram, garus braucienus vai agrus rītus. Tas palīdz tikpat daudz kā tas, ko vēlaties.',
    interests: 'Kalni un jūra ir tālu viens no otra. Ja gribat abus, dažas papildu dienas ļaus braukt ērti.',
    dates: 'Septembris un oktobris ir noslogotākie mēneši. Ja jūsu plāni ir elastīgi, maijs, jūnijs un oktobra beigas ir klusāki un joprojām skaisti.',
    datesTushetiClosed: 'Tušetija ir sasniedzama tikai vasarā, tāpēc šiem datumiem skicē tā nav iekļauta. Svanetijā vai Kazbegi augsti kalni ir pieejami visu gadu, ja to atļauj laikapstākļi.',
    group: 'Ceļojat ar gados vecākiem vecākiem vai maziem bērniem? Lēnākas dienas un retāka viesnīcu maiņa ļoti palīdz.',
    pace: 'Nesteidzīgs temps parasti nozīmē divas vai trīs naktis katrā vietā, tāpēc mazāk jākravā koferi un vairāk var redzēt.',
    send: 'Kad būsiet to nosūtījuši, Rezo atbildēs personīgi. Nekas netiek rezervēts un nekas netiek iekasēts, kamēr neesat vienojušies.',
    done: 'Kamēr gaidāt, apskatiet kādu maršruta paraugu, lai redzētu, kā Rezo izplāno katru dienu.',
  },

  answers: {
    favourites: 'Rezo iecienītākās vietas',
    notChosenYet: 'Vēl nav izvēlēts',
    notDecided: 'Vēl nav izlemts',
    rezoSuggests: 'Ieteiks Rezo',
    notChosen: 'Nav izvēlēts',
    rezoWillSuggest: 'Ieteiks Rezo',
    travellersWithKids: '{adults}, {children}',
    whenLength: '{when} · {length}',
    whoAccess: '{who} · {access}',
    paceBudget: '{pace} · {budget}',
  },

  message: {
    subject: 'Ceļojums uz Gruziju',
    hello: 'Labdien, Rezo! Esmu {name} un vēlos plānot ceļojumu uz Gruziju.',
    anonymous: 'ceļotājs',
    words: 'Saviem vārdiem: {text}',
    nothingWritten: '(nekas nav uzrakstīts)',
    drawnTo: 'Mani saista: {value}',
    when: 'Kad: {when} · {length}',
    who: 'Kas: {value}',
    access: 'Piekļuve: {value}',
    pace: 'Temps: {value}',
    budget: 'Budžeta sajūta: {value}',
    extra: 'Vēl: {value}',
    replyOn: 'Lūdzu, atbildiet, izmantojot: {channel}.',
  },
};

export default builder;
