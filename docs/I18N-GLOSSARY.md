# Translation glossary and style

Every translator (human or agent) follows this file so the four languages stay consistent.
Source language is **English** (`en`). Targets: **Russian** (`ru`), **Georgian** (`ka`), **Latvian** (`lv`).

## Voice

The English voice is warm, plain and specific: short sentences, no superlatives, honest about limits
("If something isn't possible, he'll say so"). Keep that voice. Translate meaning, not word order; the result
must read as if it were written in the target language first.

- Address the reader politely and consistently: ru **вы** (lower case), ka **თქვენ**, lv **jūs** (lower case).
- Rezo is a man: use masculine forms (ru «он планирует», lv «viņš plāno»).
- Never add claims, prices, guarantees or facts that are not in the English.
- Keep sentence-level structure in UI strings short: buttons stay short, headings stay headings.

## Never translate

- The brand **Voyage Georgia Rezo** (and the short form **Voyage Georgia**). Always Latin script.
- Vehicle models: **Mercedes Sprinter**, **Mitsubishi Delica**, **Sprinter**, **Delica**.
- Channel names: **WhatsApp**, **Messenger**, **Facebook**, **Instagram**. ("Email" *is* translated.)
- URLs, link targets, slugs, ids, `{placeholders}` in curly braces, HTML tags and their attributes, Markdown syntax.
- Photo credit author names and licence names (CC BY-SA 4.0 …).

## Names

| English | ru | ka | lv |
| --- | --- | --- | --- |
| Rezo (the person) | Резо | რეზო | Rezo |
| Georgia (the country) | Грузия | საქართველო | Gruzija |
| Tbilisi | Тбилиси | თბილისი | Tbilisi |
| Kazbegi / Stepantsminda | Казбеги / Степанцминда | ყაზბეგი / სტეფანწმინდა | Kazbegi / Stepancminda |
| Mount Kazbek | гора Казбек | მყინვარწვერი (ყაზბეგი) | Kazbeka kalns |
| Kakheti | Кахетия | კახეთი | Kahetija |
| Telavi | Телави | თელავი | Telavi |
| Sighnaghi | Сигнахи | სიღნაღი | Signahi |
| Tusheti | Тушетия | თუშეთი | Tušetija |
| Omalo | Омало | ომალო | Omalo |
| Abano Pass | перевал Абано | აბანოს უღელტეხილი | Abano pāreja |
| Kutaisi | Кутаиси | ქუთაისი | Kutaisi |
| Imereti | Имеретия | იმერეთი | Imeretija |
| Svaneti / Upper Svaneti | Сванетия / Верхняя Сванетия | სვანეთი / ზემო სვანეთი | Svanetija / Augšsvanetija |
| Mestia | Местиа | მესტია | Mestija |
| Ushguli | Ушгули | უშგული | Ušguli |
| Batumi | Батуми | ბათუმი | Batumi |
| Adjara | Аджария | აჭარა | Adžārija |
| Mtskheta | Мцхета | მცხეთა | Mcheta |
| Black Sea | Чёрное море | შავი ზღვა | Melnā jūra |
| Greater Caucasus / High Caucasus | Большой Кавказ | დიდი კავკასიონი | Lielais Kaukāzs |
| Georgian Military Highway | Военно-Грузинская дорога | საქართველოს სამხედრო გზა | Gruzijas kara ceļš |
| Gergeti Trinity Church | церковь Святой Троицы в Гергети (Цминда Самеба) | გერგეტის სამება | Gergeti Svētās Trīsvienības baznīca |
| qvevri | квеври | ქვევრი | kvevri |
| rtveli (harvest) | ртвели | რთველი | rtveli |
| supra | супра | სუფრა | supra |

Other places: use the established exonym in the target language; Georgian always in Georgian script.

## Typography and numbers

- Quotes: ru «…», ka „…“, lv „…“. Keep the curly apostrophe style of the target language.
- Thousands and decimals: ru `2 850 м`, `3,5 ч`; ka `2850 მ`; lv `2850 m`, `3,5 h`.
  Use a no-break space (U+00A0) between a number and its unit where the language expects one.
- Units: km → ru `км`, ka `კმ`, lv `km`; h (hours) → ru `ч`, ka `სთ`, lv `h`; min → ru `мин`, ka `წთ`, lv `min`; m (metres) → ru `м`, ka `მ`, lv `m`.
- Keep `≈`, `–` (ranges) and `×` (4×4, × 2) exactly as in English.
- Month names are written out in the target language (lower case in ru and lv inside sentences).

## Search-facing fields

`seoTitle`/`title` stay under ~60 characters and `description` between ~120 and 160 characters in the target
language. Use the words people in that language actually search for (ru «туры по Грузии», lv «ceļojumi uz Gruziju»,
ka «ტურები საქართველოში»), without keyword stuffing.

## Recurring UI terms (match these everywhere)

| English | ru | ka | lv |
| --- | --- | --- | --- |
| Design my trip (button, page) | Спланировать поездку | დაგეგმეთ მოგზაურობა | Plānot ceļojumu |
| Example journeys | Примеры маршрутов | მარშრუტების მაგალითები | Maršrutu piemēri |
| A first taste of Georgia | Первое знакомство с Грузией | პირველი გაცნობა საქართველოსთან | Pirmā iepazīšanās ar Gruziju |
| Mountains, wine and a little sea | Горы, вино и немного моря | მთები, ღვინო და ცოტა ზღვა | Kalni, vīns un mazliet jūras |
| Wine valleys to high villages | Из винных долин в высокогорные сёла | ღვინის ველებიდან მაღალმთიან სოფლებამდე | No vīna ielejām līdz augstkalnu ciemiem |
| Slow & spacious (pace) | Неспешно и свободно | აუჩქარებელი და თავისუფალი | Nesteidzīgs, ar brīvu laiku |
| Full & active (pace) | Насыщенно и активно | დატვირთული და აქტიური | Piesātināts un aktīvs |
| not a (fixed) package | не готовый тур | არა მზა პაკეტი | nevis gatava tūrisma pakete |
| travel guide | путеводитель | გზამკვლევი | ceļvedis |
| 4×4-only road | дорога только для 4×4 | მხოლოდ 4×4 მანქანით სავალი გზა | ceļš tikai 4×4 auto |
| Gombori Pass | Гомборский перевал | გომბორის უღელტეხილი | Gombori pāreja |
| Enguri gorge | ущелье Ингури | ენგურის ხეობა | Enguri aiza |
| Mtkvari (river) | Кура (Мтквари) | მტკვარი | Mtkvari upe |
| David Gareja | Давид-Гареджа | დავითგარეჯა | Dāvida Garedža |
| Gelati Monastery | монастырь Гелати | გელათის მონასტერი | Gelati klosteris |
| Shkhara / Ushba | Шхара / Ушба | შხარა / უშბა | Šhara / Ušba |

The translated Markdown in src/content/<collection>/<lang>/ is the reference for any other place or term.
