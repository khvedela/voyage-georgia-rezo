/**
 * Trip builder copy (src/components/builder/, the "Design my trip" page).
 * Strings may contain {placeholders}; plural values use p({ one, other, … }) and are filled with plural(lang, n, …).
 * Keys ending in `Html` are trusted HTML (internal links inside them are localized automatically).
 * Interest, access, pace and budget keys are ids used in the code: translate the values only.
 */
import type { Plural } from '../utils';

const p = (forms: Plural) => forms;

export default {
  /** Top bar: brand link, the step names in the progress bar, and the close link. */
  header: {
    homeLabel: 'Voyage Georgia Rezo, home',
    stepsNav: 'Steps',
    close: 'Close',
    steps: { interests: 'Interests', dates: 'Dates', group: 'Group', pace: 'Pace', send: 'Send' },
  },

  /** Buttons under every question, and the "time left" hint at the right of them. */
  nav: {
    back: 'Back',
    continue: 'Continue',
    review: 'Review my trip',
    send: 'Send to Rezo',
    sending: 'Sending…',
    skip: 'Skip, Rezo can ask later',
    timeLeft: { interests: 'About 2 min left', dates: 'About 90 s left', group: 'About 1 min left', pace: 'Nearly there' },
  },

  /** Counts used across the builder. {n} is the number; {from} is the lower end of a range ("2–3 nights"). */
  units: {
    days: p({ one: '{n} day', other: '{n} days' }),
    /** The word after the big day counter (the number is shown separately). */
    daysWord: p({ one: 'day', other: 'days' }),
    nightsRange: p({ one: '{from}–{n} night', other: '{from}–{n} nights' }),
    adults: p({ one: '{n} adult', other: '{n} adults' }),
    children: p({ one: '{n} child', other: '{n} children' }),
  },

  /** First screen: the three ways to start. */
  start: {
    eyebrow: 'Design my trip',
    title: 'Let’s sketch your Georgia.',
    lead: 'There’s no wrong way to start, and nothing here is final. Pick whatever feels easiest. Rezo reads every request himself and plans the real trip with you.',
    guided: 'Answer a few easy questions',
    guidedBadge: 'Most helpful',
    guidedNote: '4 short steps, about 2 minutes. You see a first sketch of the route as you go.',
    sample: 'Start from a sample trip',
    sampleNote: 'Pick an idea that’s close, then change anything you like.',
    write: 'Just write to Rezo',
    writeNote: 'Describe it in your own words. A sentence is plenty.',
    /** Three reassurances under the options (each shown after a ✓). */
    assure: ['Free, no booking', 'Change everything later', 'A real person replies'],
  },

  /** "Start from a sample trip": the list of sample trips. */
  samples: {
    eyebrow: 'Sample trips',
    title: 'Which one is closest?',
    lead: 'These are starting points, never fixed packages. Choosing one fills in the answers for you, and you can change each one on the next screen.',
    items: {
      classic: {
        title: 'Mountains, wine and a little sea',
        meta: '10 days · balanced',
        route: 'High mountains, Kakheti’s vineyards, old monasteries and a few days by the Black Sea',
      },
      wild: {
        title: 'Wine valleys to high villages',
        meta: '8 days · adventurous',
        route: 'Kakheti’s cellars, then a 4×4 over the Abano Pass into Tusheti’s villages',
      },
      first: {
        title: 'A first taste of Georgia',
        meta: '6 days · slow',
        route: 'Tbilisi’s old town, Mtskheta and a day among Kakheti’s vines',
      },
    },
  },

  /** "Just write to Rezo": free-text description, with example sentences to tap. */
  write: {
    eyebrow: 'In your own words',
    title: 'What would your perfect Georgia look like?',
    lead: 'Write it however it comes. Dates, who’s coming, what you love, what you’d rather skip. Rezo will ask about anything he needs.',
    label: 'Describe your ideal trip',
    placeholder: 'We have ten days in September. We’d love mountains, wine, old churches and a little sea, without long drives every day.',
    nudge: 'Need a nudge? Tap one to use it as a start:',
    examples: [
      'Ten days in September: mountains, wine, old churches and a little sea, without long drives every day.',
      'A slow week for two: good food, small villages and a couple of nights in the mountains.',
      'Four of us, one uses a wheelchair. We love history and long lunches.',
    ],
  },

  /** Step 1: interests (photo tiles, then smaller chips). */
  interests: {
    eyebrow: 'Step 1 of 4',
    title: 'What would you love to see?',
    lead: 'Tap a few, or just one. You don’t need to know where anything is. The map fills in as you choose.',
    more: 'More things you might enjoy',
    surprise: 'Not sure, show me Rezo’s favourites',
    labels: {
      mountains: 'High mountains',
      wine: 'Wine & vineyards',
      churches: 'Monasteries & frescoes',
      history: 'Old towns & cities',
      adventure: 'Remote valleys by 4×4',
      sea: 'The Black Sea',
      food: 'Food & supra feasts',
      hiking: 'Walking & hiking',
      villages: 'Villages & local life',
      nature: 'Canyons & caves',
    },
  },

  /** Step 2: month, season note and trip length. */
  dates: {
    eyebrow: 'Step 2 of 4',
    title: 'When, and for how long?',
    lead: 'A rough idea is perfect. Each season changes which roads are open and what’s at its best.',
    /** Short month names on the month chips and in summaries, January to December. */
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    notDecided: 'Not decided yet',
    /** Heading of the season note: "Autumn · Sep". */
    seasonLabel: '{season} · {month}',
    seasons: {
      winter: { name: 'Winter', text: 'Snow in the mountains and skiing at Gudauri and Bakuriani. Cities, wine cellars and food are at their cosiest. High roads can close after snowfall, and Tusheti is cut off until summer.' },
      earlySpring: { name: 'Early spring', text: 'The lowlands turn green and orchards blossom. Tbilisi, Kakheti and the west are pleasant; high mountains are still under snow.' },
      lateSpring: { name: 'Late spring', text: 'Green, fresh and mostly uncrowded. Good for nearly everything; the Tusheti road usually opens in June.' },
      summer: { name: 'Summer', text: 'The best time for high mountains, Svaneti and hiking. Tbilisi and the lowlands get hot, and the coast is at its busiest.' },
      autumn: { name: 'Autumn', text: 'Harvest time in Kakheti and clear mountain views. One of the most popular seasons. Tusheti’s road usually closes during October.' },
      lateAutumn: { name: 'Late autumn', text: 'Quiet and good value. Lovely for Tbilisi, wine and food; mountain weather turns and some high roads close.' },
    },
    /** Warning when 4×4 valleys are picked for a month when the Tusheti road is closed. {month} is a short month name. */
    tushetiClosed: 'Tusheti’s mountain road is usually closed outside June to October, so it’s left out of the sketch for {month}. Pick a summer month to include it, or keep these dates and Rezo will suggest other high valleys.',
    theseDates: 'these dates',
    howMany: 'How many days?',
    dayFewer: 'One day fewer',
    dayMore: 'One day more',
    suggest: 'Suggest a length',
    /** Hint under the day counter when interests are picked: "about 3–4 days". {from}–{n} is the range. */
    lenTipPicked: p({
      one: 'For what you’ve picked, about {from}–{n} day lets you enjoy it without rushing. Fewer days is fine too: Rezo simply chooses fewer places.',
      other: 'For what you’ve picked, about {from}–{n} days lets you enjoy it without rushing. Fewer days is fine too: Rezo simply chooses fewer places.',
    }),
    lenTipNone: 'Most first trips are 7 to 12 days. Shorter works well if you focus on one or two regions.',
  },

  /** Step 3: who is travelling and access needs. */
  group: {
    eyebrow: 'Step 3 of 4',
    title: 'Who’s coming along?',
    lead: 'So Rezo can think about the vehicle, rooms and how long each day should be.',
    adults: 'Adults',
    children: 'Children',
    /** Screen-reader labels of the − and + buttons. */
    adultFewer: 'One adult fewer',
    adultMore: 'One adult more',
    childFewer: 'One child fewer',
    childMore: 'One child more',
    accessQ: 'Anything that changes how you travel?',
    access: {
      none: 'Nothing special',
      wheel: 'Someone uses a wheelchair',
      walk: 'Limited walking or stairs',
      other: 'Something else',
    },
    accessNote: 'One of Rezo’s Sprinters is wheelchair-accessible. He talks through your needs first and checks each stop before suggesting it. Add any details in the last step.',
    kidsNote: 'Add the children’s ages in the last step, so the days can be planned around them.',
  },

  /** Step 4: pace of the days and budget feeling. */
  pace: {
    eyebrow: 'Step 4 of 4',
    title: 'What kind of days suit you?',
    lead: 'This decides how much fits in. Most people choose the middle option.',
    options: {
      slow: { label: 'Slow & spacious', note: 'Short drives, long lunches and time to linger. Rest days included.' },
      balanced: { label: 'Balanced', note: 'A mix of fuller days and easy ones. The most popular choice.' },
      full: { label: 'Full & active', note: 'See as much as possible. Early starts are fine.' },
    },
    budgetQ: 'And for stays and extras?',
    budgets: {
      simple: 'Simple and good value',
      comfort: 'Comfortable',
      treat: 'Treat ourselves',
      advise: 'Not sure, advise me',
    },
    budgetNote: 'Just a feeling. There is no price yet: Rezo writes a real quote, line by line, once your trip is planned.',
  },

  /** Last step: review the answers, contact details and send. */
  send: {
    eyebrow: 'Almost done',
    title: 'Check it over, then send it to Rezo.',
    lead: 'Change anything with one tap. Sending is free and isn’t a booking.',
    change: 'Change',
    /** Row labels of the review list. */
    rows: { words: 'Your words', drawnTo: 'Drawn to', when: 'When', who: 'Who', daysStays: 'Days & stays' },
    /** Screen-reader labels of each row's "Change" button. */
    changeAria: {
      words: 'Change your description',
      interests: 'Change interests',
      dates: 'Change dates and length',
      group: 'Change travellers',
      pace: 'Change pace and budget',
    },
    nothingWritten: 'Nothing written yet',
    name: 'Your name',
    namePlaceholder: 'First name is fine',
    contact: 'WhatsApp number or email',
    contactPlaceholder: 'So Rezo can reply',
    channelQ: 'Where should Rezo reply?',
    /** Reply channel chips (and the links in the error message). WhatsApp and Messenger are brand names. */
    channels: { WhatsApp: 'WhatsApp', Messenger: 'Messenger', Email: 'Email' },
    extra: 'Anything else?',
    optional: 'Optional',
    extraPlaceholder: 'A birthday, children’s ages, a place you’ve always wanted to see, something you’d rather skip…',
    privacy: 'Your details go to Rezo only.',
    error: 'That did not go through. Please try again, or send it straight to Rezo with the buttons below.',
  },

  /** Confirmation screen after sending. {name} is the traveller's first name. */
  done: {
    sent: 'Thank you, {name}. It’s with Rezo now.',
    handoff: 'Almost there, {name}. One more tap.',
    ready: 'Your request is ready, {name}.',
    /** Used for {name} when no name was given. */
    traveller: 'traveller',
    handoffLead: 'We opened a message to Rezo with your answers already written. Press send there and it reaches him.',
    noneLeadHtml: 'This form can’t deliver messages yet. Copy your request below and send it to Rezo from the <a href="/contact">contact page</a>.',
    requestLabel: 'Your request',
    next: 'Here is what happens next.',
    /** The three "what happens next" steps. {channel} is a name from channelInText. */
    steps: [
      { title: 'Rezo reads it himself.', text: 'He may reply on {channel} with a question or two first.' },
      { title: 'He plans your first proposal.', text: 'Route, daily schedule, vehicle and price, worked out by hand. How long it takes depends on the season and the trip.' },
      { title: 'You get a private link.', text: 'Review the journey and ask for changes. Nothing is booked until you and Rezo agree.' },
    ],
    /** Channel names inside the sentence above. */
    channelInText: { WhatsApp: 'WhatsApp', Messenger: 'Messenger', Email: 'email' },
    journeys: 'See example journeys',
    home: 'Back to home',
  },

  /** Side panel: Rezo's tip, the map sketch and the running summary. */
  aside: {
    title: 'Your trip so far',
    badge: 'First sketch · not a plan',
    tipTitle: 'Good to know',
    mapLabel: 'Map of Georgia',
    /** {route} is the place names joined with arrows. */
    mapLabelRoute: 'Map of Georgia with a first sketch: {route}',
    routeTitle: 'A route like this could be',
    /** {nights} is units.nightsRange ("2–3 nights"), {days} is units.days ("10 days"). */
    nightsEach: 'About {nights} in each place over {days}. Rezo sets the real order, roads and timing.',
    empty: 'Your choices draw a first sketch here: where your interests usually take you, and roughly in what order.',
    rows: { words: 'Your words', drawnTo: 'Drawn to', when: 'When', length: 'Length', who: 'Who', pace: 'Pace', soFar: 'So far' },
    nothingYet: 'Nothing yet. Your answers appear here.',
  },

  /** "Good to know" tips in the side panel, one per screen. */
  tips: {
    start: 'You can’t get this wrong. Even a single line is enough for Rezo to start, and he’ll ask about anything he needs.',
    samples: 'Every sample can be stretched, shortened or mixed. Pick the one that feels closest, not perfect.',
    write: 'Mention what you’d rather avoid too, like long drives or early starts. It helps as much as what you want.',
    interests: 'Mountains and the sea are a long way apart. If you want both, a few more days keeps the driving comfortable.',
    dates: 'September and October are the busiest months. If you’re flexible, May, June and late October are quieter and still beautiful.',
    datesTushetiClosed: 'Tusheti is only reachable in summer, so the sketch leaves it out for these dates. Svaneti or Kazbegi give you high mountains all year, weather permitting.',
    group: 'Travelling with older parents or small children? Slower days and fewer hotel changes make a big difference.',
    pace: 'A slow pace usually means staying two or three nights in each place, so you unpack less and see more.',
    send: 'After you send this, Rezo replies personally. Nothing is booked and nothing is charged until you both agree.',
    done: 'While you wait, have a look at a sample itinerary to see how Rezo lays out each day.',
  },

  /** Answer values shown in the review list and the side panel when something is not chosen, and how answers combine. */
  answers: {
    favourites: 'Rezo’s favourites',
    notChosenYet: 'Not chosen yet',
    notDecided: 'Not decided yet',
    rezoSuggests: 'Rezo suggests',
    notChosen: 'Not chosen',
    rezoWillSuggest: 'Rezo will suggest',
    /** "2 adults, 1 child". */
    travellersWithKids: '{adults}, {children}',
    /** "Sep · 10 days". */
    whenLength: '{when} · {length}',
    /** "2 adults · Someone uses a wheelchair". */
    whoAccess: '{who} · {access}',
    /** "Balanced · Comfortable". */
    paceBudget: '{pace} · {budget}',
  },

  /** The message sent to Rezo by WhatsApp, email or the form (written in the visitor's language). */
  message: {
    subject: 'Trip to Georgia',
    hello: 'Hello Rezo, I’m {name}. I’d like to plan a trip to Georgia.',
    /** Used for {name} when no name was given. */
    anonymous: 'a traveller',
    words: 'In my words: {text}',
    nothingWritten: '(nothing written)',
    drawnTo: 'Drawn to: {value}',
    when: 'When: {when} · {length}',
    who: 'Who: {value}',
    access: 'Access: {value}',
    pace: 'Pace: {value}',
    budget: 'Budget feeling: {value}',
    extra: 'Anything else: {value}',
    /** {channel} is a name from send.channels. */
    replyOn: 'Please reply on {channel}.',
  },
};
