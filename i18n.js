// Języki strony: PL (domyślny, treść w index.html), UA i EN (słownik niżej).
// Elementy z data-i18n dostają innerHTML z słownika, data-i18n-alt → alt, data-i18n-aria → aria-label.
// Polski tekst czytamy z HTML przy starcie, więc index.html zostaje jedynym źródłem wersji polskiej.
// Wybór zapamiętany w localStorage; ?lang=pl|uk|en w adresie ustawia język (do linków dla kierowców).
(() => {
  const LANGS = ['pl', 'uk', 'en'];
  const KEY = 'rejs-lang';

  // Teksty sterowane z main.js (licznik, bańka) — tu także polskie, bo nie ma ich w HTML.
  const JS = {
    pl: { m0: 'utarg z aplikacji', m1: 'po prowizji platformy', m2: 'po czynszu za auto', m3: 'po paliwie', m4: 'zarobek po kosztach', cur: 'zł', 'b.new': 'Nowy kurs', 'b.end': 'Koniec kursu', 'b.saved': 'Kurs zapisany', min: 'min', km: 'km', dec: ',' },
    uk: { m0: 'виручка із застосунку', m1: 'після комісії платформи', m2: 'після оренди авто', m3: 'після пального', m4: 'заробіток після витрат', cur: 'зл', 'b.new': 'Нова поїздка', 'b.end': 'Кінець поїздки', 'b.saved': 'Поїздку збережено', min: 'хв', km: 'км', dec: ',' },
    en: { m0: 'fares from the app', m1: 'after platform commission', m2: 'after car rent', m3: 'after fuel', m4: 'earnings after costs', cur: 'zł', 'b.new': 'New ride', 'b.end': 'End ride', 'b.saved': 'Ride saved', min: 'min', km: 'km', dec: '.' },
  };

  const T = {
    uk: {
      title: 'Rejs OS · Зміна під контролем',
      desc: 'Rejs OS рахує в реальному часі, скільки лишається водієві таксі на застосунку після комісії, оренди, пального і ZUS. Графік, документи й бульбашка поверх навігації. Дані залишаються на вашому телефоні.',
      'nav.aria': 'Розділи сторінки',
      'nav.meter': 'Як рахує',
      'nav.features': 'Функції',
      'nav.privacy': 'Приватність',
      'nav.price': 'Ціна',
      'nav.cta': '14 днів безплатно',
      'lang.aria': 'Мова сторінки',
      'hero.aria': 'Вступ',
      'hero.eyebrow': 'Для водіїв на застосунках',
      'hero.title': 'Знаєте, скільки заробили. А скільки <em>лишилось вам</em>?',
      'hero.sub': 'Rejs OS рахує це просто під час зміни. Ви їдете, а застосунок стежить за витратами, годинами й документами.',
      'hero.cta': 'Спробуйте 14 днів безкоштовно',
      'hero.cta2': 'Подивіться, як рахує',
      'costs.0': 'Після <b>комісії</b>.',
      'costs.1': 'Після <b>оренди</b>.',
      'costs.2': 'Після <b>пального</b>.',
      'costs.3': 'Після <b>ZUS</b>.',
      'reveal.title': 'Одне число, яке має значення: <em>скільки лишається вам.</em>',
      'hero.hint': 'Гортайте й їдьте',
      'meter.eyebrow': 'Лічильник заробітку',
      'meter.title': 'Таксометр, який рахує для вас.',
      'meter.split': '<span>відкласти <b>123 зл</b></span><span>залишається вам <b>237 зл</b></span>',
      'meter.l0': '<span>Виручка із застосунку</span><b>737 зл</b>',
      'meter.l1': '<span>Комісія платформи</span><b>−184 зл</b>',
      'meter.l2': '<span>Оренда авто</span><b>−129 зл</b>',
      'meter.l3': '<span>Пальне (за кілометрами)</span><b>−52 зл</b>',
      'meter.l5': '<span>Витрати (кава, вода)</span><b>−12 зл</b>',
      'meter.l4': '<span>Заробіток після витрат</span><b>360 зл</b>',
      'meter.note': 'Приклад одного дня. У застосунку числа беруться з ваших поїздок, налаштувань оренди й витрати пального.',
      'feat.eyebrow': 'Увесь тиждень у кишені',
      'feat.title': 'Зміна, графік, документи. Без Excel.',
      'feat.text': 'Великі кнопки, одне число на плитку, темний екран, що не сліпить уночі. У тримачі видно все за секунду.',
      'feat.arrow': 'Гортайте →',
      'c1.alt': 'Екран «Сьогодні»: понеділок, 2 листопада, робочий день «Легкий + вечір», рух вільний, плитки «Нотатка», «Музика», «Ваша мапа» і «Прогноз», найближча зміна 17:00–19:30 і кнопка «Старт зміни»',
      'c1.tag': 'Перед зміною',
      'c1.h': 'Сьогодні на одному екрані',
      'c1.p': 'Найближча зміна, рух у місті й список справ перед виїздом. Нотатка, музика, мапа й прогноз під пальцем.',
      'c2.alt': 'Екран плейлистів, категорія «Настрій» (зосередженість, спокій, енергія, відпочинок): Driver Mode, Traffic Zen, Second Wind, Between Rides, Rain on Glass і Airport Run з обкладинками',
      'c2.tag': 'У дорозі',
      'c2.h': 'Плейлисти й радіо',
      'c2.p': 'Плейлисти під будь-який настрій, ваші власні списки й радіо з Польщі та світу одним дотиком, без пошуку в телефоні під час їзди.',
      'c3.alt': 'Екран «Прогноз» на понеділок: найкраще 8–11, близько 2,5 поїздки на годину, зазвичай 2,2, і графік поїздок за годинами дня',
      'c3.tag': 'Прогноз',
      'c3.h': 'Коли вигідно їхати',
      'c3.p': 'Найкращі години дня, пораховані з ваших власних поїздок. Видно, скільки поїздок на годину зазвичай буває і коли виїжджати.',
      'c4.alt': 'Екран «Графік»: цілі тижня, 48,7 год онлайн при цілі 40,5 год, тобто на 8,2 год більше, і 911 зл з 1 038 зл на руки',
      'c4.tag': 'План',
      'c4.h': 'Графік під ціль',
      'c4.p': 'Вкажіть, скільки годин онлайн хочете на тиждень. Rejs OS складе зміни й нагадає про них перед виїздом.',
      'c5.alt': 'Екран «Тиждень»: рух грошей від 4 497 зл доходу брутто через комісію, платежі автопарку, оренду, пальне й інші витрати до 2 339 зл заробітку за тиждень; після ZUS, медичного внеску і PIT лишається 1 565 зл',
      'c5.tag': 'Тиждень',
      'c5.h': 'Куди пішли гроші',
      'c5.p': 'Дохід брутто, комісія платформ, платежі автопарку, оренда, пальне. І скільки лишається вам після сплати податків.',
      'c6.alt': 'Екран «Документи»: жовтень 2026, разом 988 зл, пальне 831 зл за 6 заправок, чеки 157 зл, фактури 0, нотатки 1, кнопки «Заправка» і «Витрата»',
      'c6.tag': 'Документи',
      'c6.h': 'Чеки в одному місці',
      'c6.p': 'Фото чека чи фактури, заправка, витрата. Наприкінці місяця — один пакет для бухгалтера.',
      'c7.alt': 'Екран «Налаштування»: профіль водія Bolt, програма BETER, пальне 0,2173 зл/км, ZUS 1 927 зл на місяць і ціль 4 500 зл на місяць при 40,5 год онлайн на тиждень',
      'c7.tag': 'Ваше авто',
      'c7.h': 'Налаштовано під вас',
      'c7.p': 'Платформи, автопарк, пальне, ZUS і цілі в одному місці. Кожна опція має опис, що вона робить.',
      'bub.eyebrow': 'Бульбашка поверх навігації',
      'bub.title': 'Один дотик. Не виходячи з мапи.',
      'bub.text': '«Нова поїздка» і «Кінець поїздки» висять поверх навігації. Маршрут записується лише між цими двома дотиками, ніколи на порожньому пробігу.',
      'priv.eyebrow': 'Приватність',
      'priv.title': 'Ваші цифри залишаються у вашому телефоні.',
      'priv.lede': 'Скільки ви заробляєте, де їздите й що заправляєте — ваша справа. Rejs OS не створює вам акаунт і не зберігає ваші дані в себе.',
      'priv.p0': '<b>Без акаунта</b><span>Встановили — і їдете. Ні e-mail, ні номера не треба.</span>',
      'priv.p1': '<b>Дані в памʼяті телефону</b><span>Поїздки, заробіток, чеки й маршрути. Автор їх не бачить.</span>',
      'priv.p2': '<b>Без реклами</b><span>Ви платите підписку, тож ви не товар.</span>',
      'priv.p3': '<b>Без стеження</b><span>Без аналітики. Маршрут записується лише під час поїздки.</span>',
      'priv.more': 'Політика конфіденційності (польською) →',
      'node.server': '<b>Сервер автора</b><span>не отримує ваших даних</span><em>✕</em>',
      'node.s1': '<b><i>Ваш </i>Google Диск</b><span>копія на вашому акаунті</span>',
      'node.s2': '<b><i>Ваша </i>погода</b><span>ваш ключ</span>',
      'node.s3': '<b><i>Ваш </i>TomTom</b><span>затори, ваш ключ</span>',
      'chip.0': 'Поїздки',
      'chip.1': 'Заробіток',
      'chip.2': 'Чеки',
      'chip.3': 'Маршрути',
      'chip.4': 'Нотатки',
      'chip.5': 'Графік',
      'perks.eyebrow': 'Чому Rejs OS',
      'perks.title': 'Зроблено під справжню зміну за кермом.',
      'perk0.h': 'Легка поруч із Bolt і Uber',
      'perk0.p': 'Декоративні анімації зупиняються, коли ви гортаєте, тож застосунок не гальмує телефон, на якому працює навігація.',
      'perk1.h': 'Стежить за лімітом роботи',
      'perk1.p': 'Рахує години без 6 год відпочинку, Bolt і Uber разом, і попереджає перед лімітом 12 год.',
      'perk2.h': 'Заробіток після витрат на авто',
      'perk2.p': 'Комісія, платежі, оренда, пальне й витрати віднімаються одразу. Видно також, скільки відкласти на ZUS і податок і скільки насправді лишається.',
      'perk3.h': 'Радіо при пасажирі',
      'perk3.p': 'Коли хтось сідає, робить тихіше, вимикає звук або змінює станцію. Після поїздки повертає вашу музику.',
      'perk4.h': 'Віджети на головному екрані',
      'perk4.p': 'Зміна, ціль дня й швидкі дії без відкриття застосунку. Суми приховані, доки не торкнетеся ока.',
      'perk5.h': 'Польською, українською та англійською',
      'perk5.p': 'Мову змінюєте в Налаштуваннях, щоб кожен водій читав цифри своєю мовою.',
      'price.eyebrow': 'Ціна',
      'price.title': '14 днів безкоштовно.',
      'price.li0': 'усі функції з першого дня',
      'price.li1': 'без реклами',
      'price.li2': 'без акаунта',
      'price.li3': 'скасовуєте в Google Play',
      'price.amount': '24 <small>зл</small>',
      'price.per': 'на місяць, після пробного періоду',
      'price.store': 'Незабаром у Google Play',
      'foot.policy': 'Політика конфіденційності (польською)',
      'foot.contact': 'Контакт:',
    },
    en: {
      title: 'Rejs OS · Shift under control',
      desc: 'Rejs OS works out live how much a ride-hailing driver keeps after commission, car rent, fuel and ZUS. Schedule, paperwork and a bubble over your navigation. Your data stays on your phone.',
      'nav.aria': 'Page sections',
      'nav.meter': 'How it counts',
      'nav.features': 'Features',
      'nav.privacy': 'Privacy',
      'nav.price': 'Price',
      'nav.cta': '14 days free',
      'lang.aria': 'Page language',
      'hero.aria': 'Intro',
      'hero.eyebrow': 'For ride-hailing drivers',
      'hero.title': 'You know what you earned. But what do <em>you keep</em>?',
      'hero.sub': 'Rejs OS works it out live, during your shift. You drive, the app keeps track of costs, hours and paperwork.',
      'hero.cta': 'Try 14 days free',
      'hero.cta2': 'See how it counts',
      'costs.0': 'After <b>commission</b>.',
      'costs.1': 'After <b>rent</b>.',
      'costs.2': 'After <b>fuel</b>.',
      'costs.3': 'After <b>ZUS</b>.',
      'reveal.title': 'One number that matters: <em>what you keep.</em>',
      'hero.hint': 'Scroll and drive',
      'meter.eyebrow': 'Earnings meter',
      'meter.title': 'A taximeter that counts for you.',
      'meter.split': '<span>to set aside <b>123 zł</b></span><span>you keep <b>237 zł</b></span>',
      'meter.l0': '<span>Fares from the app</span><b>737 zł</b>',
      'meter.l1': '<span>Platform commission</span><b>−184 zł</b>',
      'meter.l2': '<span>Car rent</span><b>−129 zł</b>',
      'meter.l3': '<span>Fuel (from kilometres)</span><b>−52 zł</b>',
      'meter.l5': '<span>Expenses (coffee, water)</span><b>−12 zł</b>',
      'meter.l4': '<span>Earnings after costs</span><b>360 zł</b>',
      'meter.note': 'A sample day. In the app the numbers come from your rides, your rent and your fuel consumption settings.',
      'feat.eyebrow': 'Your whole week in your pocket',
      'feat.title': 'Shift, schedule, paperwork. No Excel.',
      'feat.text': 'Big buttons, one number per tile, a dark screen that won’t dazzle you at night. Readable in the phone holder at a glance.',
      'feat.arrow': 'Keep scrolling →',
      'c1.alt': 'Today screen: Monday 2 November, work day Light + evening, light traffic, Note, Music, Your map and Forecast tiles, next shift 17:00–19:30 and the Start shift button',
      'c1.tag': 'Before the shift',
      'c1.h': 'Today on one screen',
      'c1.p': 'Your next shift, city traffic and a to-do list before you set off. Note, music, map and forecast right under your thumb.',
      'c2.alt': 'Playlists screen, Mood category (focus, calm, energy, chill): Driver Mode, Traffic Zen, Second Wind, Between Rides, Rain on Glass and Airport Run with cover art',
      'c2.tag': 'On the road',
      'c2.h': 'Playlists and radio',
      'c2.p': 'Playlists for every mood, your own lists and radio from Poland and around the world in one tap, no digging through your phone while driving.',
      'c3.alt': 'Forecast screen for Monday: best 8–11, about 2.5 rides an hour, usually 2.2, and a chart of rides by hour of the day',
      'c3.tag': 'Forecast',
      'c3.h': 'When it pays to drive',
      'c3.p': 'The best hours of the day, worked out from your own rides. You see how many rides an hour usually come in and when to head out.',
      'c4.alt': 'Schedule screen: weekly goals, 48.7 h online against a 40.5 h goal, 8.2 h over, and 911 zł of 1,038 zł in hand',
      'c4.tag': 'Plan',
      'c4.h': 'A schedule for your goal',
      'c4.p': 'Set how many online hours you want a week. Rejs OS lays out your shifts and reminds you before you head out.',
      'c5.alt': 'Week screen: money flow from 4,497 zł gross income through commission, fleet fees, rent, fuel and other costs to 2,339 zł earned this week; after ZUS, health contribution and PIT you keep 1,565 zł',
      'c5.tag': 'Week',
      'c5.h': 'Where the money went',
      'c5.p': 'Gross income, platform commission, fleet fees, rent, fuel. And what you keep after paying your taxes.',
      'c6.alt': 'Papers screen: October 2026, 988 zł in total, fuel 831 zł from 6 fill-ups, receipts 157 zł, invoices 0, notes 1, Fill-up and Expense buttons',
      'c6.tag': 'Papers',
      'c6.h': 'Receipts in one place',
      'c6.p': 'A photo of a receipt or invoice, a fill-up, an expense. At month end, one pack for your accountant.',
      'c7.alt': 'Settings screen: driver profile Bolt, BETER programme, fuel 0.2173 zł/km, ZUS 1,927 zł a month and a goal of 4,500 zł a month at 40.5 h online a week',
      'c7.tag': 'Your car',
      'c7.h': 'Set up for you',
      'c7.p': 'Platforms, fleet, fuel, ZUS and goals in one place. Every option tells you what it does.',
      'bub.eyebrow': 'Bubble over navigation',
      'bub.title': 'One tap. Without leaving the map.',
      'bub.text': '“New ride” and “End ride” float over your navigation. The route is recorded only between those two taps, never on empty miles.',
      'priv.eyebrow': 'Privacy',
      'priv.title': 'Your numbers stay on your phone.',
      'priv.lede': 'What you earn, where you drive and what you fill up with is your business. Rejs OS doesn’t make you create an account and doesn’t keep your data on its servers.',
      'priv.p0': '<b>No account</b><span>Install and drive. No e-mail or phone number needed.</span>',
      'priv.p1': '<b>Data in your phone’s memory</b><span>Rides, earnings, receipts and routes. The developer never sees them.</span>',
      'priv.p2': '<b>No ads</b><span>You pay a subscription, so you’re not the product.</span>',
      'priv.p3': '<b>No tracking</b><span>No analytics. The route is recorded only during a ride.</span>',
      'priv.more': 'Read the privacy policy (in Polish) →',
      'node.server': '<b>Developer’s server</b><span>never gets your data</span><em>✕</em>',
      'node.s1': '<b><i>Your </i>Google Drive</b><span>backup on your account</span>',
      'node.s2': '<b><i>Your </i>weather</b><span>your key</span>',
      'node.s3': '<b><i>Your </i>TomTom</b><span>traffic, your key</span>',
      'chip.0': 'Rides',
      'chip.1': 'Earnings',
      'chip.2': 'Receipts',
      'chip.3': 'Routes',
      'chip.4': 'Notes',
      'chip.5': 'Schedule',
      'perks.eyebrow': 'Why Rejs OS',
      'perks.title': 'Built for a real shift behind the wheel.',
      'perk0.h': 'Light next to Bolt and Uber',
      'perk0.p': 'Decorative animations pause while you scroll, so the app doesn’t choke the phone that’s running your navigation.',
      'perk1.h': 'Watches your work limit',
      'perk1.p': 'Counts hours without a 6 h rest, Bolt and Uber together, and warns you before the 12 h limit.',
      'perk2.h': 'Earnings after car costs',
      'perk2.p': 'Commission, fees, rent, fuel and expenses taken off straight away. You also see how much to set aside for ZUS and tax, and what you really keep.',
      'perk3.h': 'Radio with a passenger',
      'perk3.p': 'When someone gets in, it turns down, mutes or changes station. After the ride, your music comes back.',
      'perk4.h': 'Home screen widgets',
      'perk4.p': 'Shift, daily goal and quick actions without opening the app. Amounts stay hidden until you tap the eye.',
      'perk5.h': 'In Polish, Ukrainian and English',
      'perk5.p': 'Switch the language in Settings so every driver reads the numbers in their own language.',
      'price.eyebrow': 'Price',
      'price.title': '14 days free.',
      'price.li0': 'every feature from day one',
      'price.li1': 'no ads',
      'price.li2': 'no account',
      'price.li3': 'cancel in Google Play',
      'price.amount': '24 <small>zł</small>',
      'price.per': 'a month, after the trial',
      'price.store': 'Coming soon to Google Play',
      'foot.policy': 'Privacy policy (in Polish)',
      'foot.contact': 'Contact:',
    },
  };

  const doc = document.documentElement;
  const metaDesc = document.querySelector('meta[name="description"]');
  // Polski oryginał z HTML
  const PL = { title: document.title, desc: metaDesc ? metaDesc.content : '' };
  const html = [...document.querySelectorAll('[data-i18n]')];
  const alts = [...document.querySelectorAll('[data-i18n-alt]')];
  const arias = [...document.querySelectorAll('[data-i18n-aria]')];
  html.forEach((el) => { PL[el.dataset.i18n] = el.innerHTML; });
  alts.forEach((el) => { PL[el.dataset.i18nAlt] = el.getAttribute('alt'); });
  arias.forEach((el) => { PL[el.dataset.i18nAria] = el.getAttribute('aria-label'); });

  let lang = 'pl';
  const pick = (k) => (lang !== 'pl' && T[lang][k] != null ? T[lang][k] : PL[k]);

  function apply(next, save) {
    lang = LANGS.includes(next) ? next : 'pl';
    doc.lang = lang;
    document.title = pick('title');
    if (metaDesc) metaDesc.content = pick('desc');
    html.forEach((el) => { const v = pick(el.dataset.i18n); if (el.innerHTML !== v) el.innerHTML = v; });
    alts.forEach((el) => el.setAttribute('alt', pick(el.dataset.i18nAlt)));
    arias.forEach((el) => el.setAttribute('aria-label', pick(el.dataset.i18nAria)));
    document.querySelectorAll('.lang [data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    if (save) { try { localStorage.setItem(KEY, lang); } catch (e) { /* prywatne okno — język tylko na tę wizytę */ } }
    document.dispatchEvent(new CustomEvent('rejs:lang', { detail: lang }));
  }

  window.rejsI18n = {
    get lang() { return lang; },
    t: (k) => (JS[lang] && JS[lang][k] != null ? JS[lang][k] : JS.pl[k]),
  };

  let start = 'pl';
  try { start = localStorage.getItem(KEY) || 'pl'; } catch (e) { /* brak dostępu do pamięci */ }
  try { const q = new URLSearchParams(location.search).get('lang'); if (q && LANGS.includes(q)) start = q; } catch (e) { /* stara przeglądarka */ }
  if (start !== 'pl') apply(start, false);

  document.querySelectorAll('.lang [data-lang]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.lang !== lang) apply(b.dataset.lang, true);
  }));
})();
