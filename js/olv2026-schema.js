// ============================================================================
// OLv2026a — декларативна схема журналу наукового спостерігача (ярусний промисел).
// Англійські назви полів (en) відтворюють реальні заголовки колонок офіційного
// електронного журналу CCAMLR Observer Logbook (OLv2026a), досліджені на
// реальному заповненому прикладі (SEVEN PARK, Ross Sea, груд. 2025).
//
// Кожне поле: { k: ключ, en: назва (EN, іде в експорт), type, ua: переклад
// (лише в UI), hint: підказка (призначення + формат + приклад + допустимі
// значення), req: обов'язкове, list/opts: код-листи чи select-варіанти }
//
// Розширення: щоб додати нове поле — додайте один запис F(...) у потрібну
// секцію; рушій (olv2026-form.js) підхопить його автоматично без змін коду.
// ============================================================================

function F(k, en, type, ua, hint, req, extra) {
  return Object.assign({ k, en, type, ua, hint, req: !!req }, extra || {});
}

const YESNO = [["Yes", "Так"], ["No", "Ні"]];
const SEX = [["Female", "Самка"], ["Male", "Самець"], ["Unknown", "Не визначено"]];
const SUCCESS_OPT = [["Yes", "Успішно"], ["No", "Невдало"]];

// Автопідказки (datalist) для «відкритих» код-листів — не вичерпний офіційний
// перелік CCAMLR (він налічує сотні кодів і залежить від сезону), а
// найпоширеніші коди цього промислу для зручного автозаповнення. Поле
// залишається вільним текстовим — можна ввести будь-який чинний код.
const SPECIES_CODES = ["TOA — Dissostichus mawsoni (іклач антарктичний)", "TOP — Dissostichus eleginoides (іклач патагонський)", "GRV — Macrourus spp. (довгохвости)", "SRX — Rajiformes (скати, загальний код)", "ANI — Notothenia spp.", "Code Missing — код відсутній у списку (вказати вид у коментарі)"];
const VME_SPECIES_CODES = ["DMO — Demospongiae (губки)", "DWR — Octocorallia (горгонарії/м'які корали)", "CWH — Hydrozoa (гідроїди)", "AGZ — Actiniaria (актинії)", "BRY — Bryozoa (мохуватки)", "CWS — Stony corals"];
const PROCESSING_CODES = ["HGT — Headed and gutted (обезголовлена, патрана)", "WHO — Whole (ціла риба)", "HEA — Headed (обезголовлена)", "GUT — Gutted (патрана)", "FIL — Filleted (філе)"];
const GEAR_TYPES_VESSEL = ["Autoline", "Spanish line", "Trotline", "Pot"];

const OLV_SCHEMA = {
  version: "OLv2026a",
  sections: [
    // -------------------------------------------------------------- 1 -----
    {
      id: "vessel", num: "1", en: "Vessel and Gear", ua: "Судно, знаряддя, спостерігачі", kind: "single",
      groups: [
        { en: "(1) Vessel information", ua: "Дані судна", fields: [
          F("imo", "Vessel IMO Number", "text", "Номер IMO судна", "Постійний реєстраційний номер судна (7 цифр), не змінюється при зміні прапора чи назви. Формат: 7 цифр. Приклад: 8608822. Звірте з судновим журналом C2 — номери мають повністю збігатися.", true, { ph: "8608822", pattern: "^\\d{7}$" }),
          F("vname", "Vessel Name", "text", "Назва судна", "Точна назва судна латиницею, як у міжнародній реєстрації та нотифікації CCAMLR. Приклад: SEVEN PARK.", true, { ph: "SEVEN PARK" }),
          F("callsign", "Vessel Call Sign", "text", "Позивний судна", "Міжнародний радіопозивний судна. Формат: 4–7 літер/цифр. Приклад: DTBT2.", true, { ph: "DTBT2" }),
          F("flag", "Vessel Flag", "text", "Прапор судна", "Держава прапора судна. Приклад: Republic of Korea.", false, { ph: "Republic of Korea" }),
        ]},
        { en: "(2) SISO Designated Observer (Observer ID 1)", ua: "Основний спостерігач (ID 1)", fields: [
          F("obs1_name", "Observer Name", "text", "Ім'я спостерігача", "Повне ім'я основного (SISO) спостерігача. Це ID 1 — саме цей номер потім використовується в колонці «Observer ID» на інших листах.", true, { ph: "KIM SE CHEOL" }),
          F("obs1_nat", "Observer Nationality", "text", "Громадянство", "Громадянство спостерігача. Приклад: Korean.", false, { ph: "Korean" }),
          F("obs1_email", "Contact Email Address", "email", "Контактний email", "Дійсна електронна адреса для зв'язку зі спостерігачем. Формат: [email protected]. Приклад: [email protected].", false, { ph: "[email protected]" }),
          F("obs1_start", "Observation Program Start Date", "date", "Дата початку програми", "Дата початку спостереження на цьому судні. Формат: дд.мм.рррр (UTC). Приклад: 01.12.2025.", true, {}),
          F("obs1_end", "Observation Program End Date", "date", "Дата завершення програми", "Планована/фактична дата завершення спостереження. Формат: дд.мм.рррр.", false, {}),
          F("obs1_board", "Boarding Location", "text", "Порт посадки", "Порт, де спостерігач сів на судно. Приклад: Lyttelton, NZ.", false, {}),
          F("obs1_disembark", "Disembarkation Location", "text", "Порт висадки", "Порт, де спостерігач завершив рейс.", false, {}),
        ]},
        { en: "(3) Scientific Observer (Observer ID 2)", ua: "Другий спостерігач (ID 2)", fields: [
          F("obs2_name", "Observer Name", "text", "Ім'я спостерігача", "Ім'я другого спостерігача (якщо є). Це ID 2 у колонці «Observer ID» інших листів.", false, { ph: "VALERII PARAMONOV" }),
          F("obs2_nat", "Observer Nationality", "text", "Громадянство", "Приклад: Ukrainian.", false, { ph: "Ukrainian" }),
          F("obs2_start", "Observation Program Start Date", "date", "Дата початку програми", "Формат: дд.мм.рррр.", false, {}),
          F("obs2_end", "Observation Program End Date", "date", "Дата завершення програми", "Формат: дд.мм.рррр.", false, {}),
        ]},
        { en: "(5) Fishing Details", ua: "Деталі промислу", fields: [
          F("gear_match", "Does gear configuration match vessel notification details provided?", "select", "Чи відповідає конфігурація яруса нотифікації?", "Порівняйте фактичне знаряддя з тим, що судно подало у нотифікації CCAMLR перед рейсом. Оберіть Yes/No.", true, { opts: YESNO }),
          F("gear_type", "Longline Type", "text", "Тип ярусної снасті", "Тип ярусної снасті цього судна.", false, { ph: "Autoline / Spanish line / Trotline / Pot", list: GEAR_TYPES_VESSEL }),
          F("set_position", "Longline setting position", "select", "Борт вимітування", "З якого борту судно вимітує ярус.", false, { opts: [["Starboard", "Правий борт"], ["Port", "Лівий борт"]] }),
          F("offal_position", "Offal dumping position", "select", "Борт скидання відходів", "З якого борту скидають рибні відходи під час виборки.", false, { opts: [["Stern", "Корма"], ["Port", "Лівий борт"], ["Starboard", "Правий борт"]] }),
        ]},
        { en: "(6) Streamer Line Details", ua: "Стример-лінія (відлякування птахів)", fields: [
          F("streamer_used", "Was vessel equiped with a CCAMLR configured streamer line?", "select", "Чи використано стример-лінію за конфігурацією CCAMLR?", "Стример-лінія — обов'язковий захід пом'якшення для відлякування птахів під час вимітування.", true, { opts: YESNO }),
          F("streamer_height", "Streamer line attachment height above water (m)", "num", "Висота кріплення над водою (м)", "Висота точки кріплення стример-лінії над поверхнею води. Формат: число, метри. Приклад: 6.2.", false, { min: 0, max: 30, step: 0.1, ph: "6.2" }),
        ]},
      ],
    },
    // -------------------------------------------------------------- 2 -----
    {
      id: "sethaul", num: "2", en: "Set and Haul Details", ua: "Постановка та виборка яруса", kind: "table", note: "Один рядок = один Haul (постановка + виборка). Set/Haul Number — наскрізний ключ, який зв'язує цей рядок з усіма іншими листами.",
      fields: [
        F("haul_no", "Set/ Haul Number", "int", "№ Haul", "Наскрізний послідовний номер постановки/виборки. Використовується як ключ на всіх інших листах. Формат: ціле число з 1. Приклад: 1.", true, { min: 1, ph: "1", seq: true }),
        F("set_start", "Date & Time (UTC) Set Start", "datetime", "Початок постановки (UTC)", "Дата й час початку вимітування яруса, за UTC (не судновий час). Формат: дд.мм.рррр гг:хв.", true, {}),
        F("set_finish", "Date & Time (UTC) Set Finish", "datetime", "Кінець постановки (UTC)", "Дата й час завершення вимітування яруса, UTC.", true, {}),
        F("set_lat_deg", "Set Start Latitude degrees (-DD)", "num", "Широта початку постановки, град.", "Градуси широти початку постановки. Від'ємне значення = південна широта. Формат: ціле число −90…90. Приклад: −75.", true, { min: -90, max: 90, step: 1, ph: "-75" }),
        F("set_lat_min", "Set Start Latitude minutes (MM.mm)", "num", "хвилини широти", "Хвилини широти (десяткові). Формат: 0–59.99. Приклад: 26.18.", false, { min: 0, max: 59.99, step: 0.01, ph: "26.18" }),
        F("set_lon_deg", "Set Start Longitude degrees (DDD)", "num", "Довгота початку постановки, град.", "Градуси довготи. Від'ємне значення = західна довгота. Формат: −180…180. Приклад: −175.", true, { min: -180, max: 180, step: 1, ph: "-175" }),
        F("set_lon_min", "Set Start Longitude minutes (MM.mm)", "num", "хвилини довготи", "Хвилини довготи (десяткові), 0–59.99.", false, { min: 0, max: 59.99, step: 0.01, ph: "32.7" }),
        F("hooks_set", "Number hooks set", "int", "К-сть гачків виставлено", "Загальна кількість гачків, виставлених у цій постановці. Формат: ціле число. Приклад: 8640.", true, { min: 0, ph: "8640" }),
        F("mag_set", "Number Magazines/Cases/Trots Set", "int", "К-сть магазинів/тротів", "Кількість магазинів (autoline), кейсів (Spanish line) або тротів (trotline), виставлених за цю постановку.", false, { min: 0, ph: "720" }),
        F("deck_light", "Deck lighting", "select", "Освітлення палуби", "Чи було увімкнено палубне освітлення під час постановки (впливає на приваблення птахів).", false, { opts: [["On", "Увімкнено"], ["Off", "Вимкнено"]] }),
        F("bait1_pct", "% Bait Type 1", "num", "% наживки типу 1", "Відсоток основної наживки, використаної в цій постановці. Формат: 0–100. Приклад: 100.", false, { min: 0, max: 100, ph: "100" }),
        F("haul_start", "Date & Time (UTC) Haul Start", "datetime", "Початок виборки (UTC)", "Дата й час початку підйому яруса, UTC.", true, {}),
        F("haul_finish", "Date & Time (UTC) Haul Finish", "datetime", "Кінець виборки (UTC)", "Дата й час завершення підйому яруса, UTC. Має бути пізніше за початок постановки.", true, {}),
        F("bird_device", "Bird scaring device used", "select", "Пристрій відлякування птахів", "Чи використовувався пристрій відлякування птахів під час виборки.", false, { opts: YESNO }),
        F("offal_haul", "Offal discharge during haul", "select", "Скидання відходів під час виборки", "Чи скидались рибні відходи в море під час виборки (сприяє приваблюванню птахів — має фіксуватись чесно).", false, { opts: YESNO }),
        F("haul_interrupt", "Haul interruption duration (hrs decimal)", "num", "Тривалість перерви виборки (год)", "Якщо виборку переривали (обрив яруса, шторм) — тривалість перерви в годинах, десятковим числом. Приклад: 1.0.", false, { min: 0, step: 0.1, ph: "1.0" }),
        F("hooks_lost", "Number hooks lost attached to line", "int", "Втрачено гачків (з лінією)", "Кількість гачків, втрачених разом з ділянкою лінії (обрив).", false, { min: 0, ph: "0" }),
        F("comment", "Comment", "textarea", "Коментар", "Опис нештатних ситуацій: обрив яруса, шторм, довга перерва тощо. Приклад: «cut line 04/DEC/2025 04:05, all fishing gear retrieved».", false, {}),
      ],
    },
    // -------------------------------------------------------------- 3 -----
    {
      id: "obscatch", num: "3", en: "Observed Haul Catch", ua: "Улов за тальовий період", kind: "table", note: "Один рядок = один вид улову на конкретному Haul протягом тальового (облікового) періоду.",
      fields: [
        F("haul_no", "Haul Number", "int", "№ Haul", "Номер Haul з листа «Set and Haul Details», до якого належить цей улов.", true, { min: 1, ph: "1" }),
        F("obs_id", "Observer ID", "int", "ID спостерігача", "Номер спостерігача (1, 2 або 3), який вів облік — див. лист «Vessel and Gear».", false, { min: 1, max: 3, ph: "2" }),
        F("species", "Species Code", "text", "Код виду", "Код виду за списком кодів CCAMLR. Формат: 3 великі літери. Приклад: TOA.", true, { ph: "TOA", list: SPECIES_CODES }),
        F("ret_tag", "Number retained with tags", "int", "Залишено з міткою", "Кількість риби залишеної на борту, яка вже мала мітку.", false, { min: 0, ph: "0" }),
        F("ret_notag", "Number retained without tags", "int", "Залишено без мітки", "Кількість риби залишеної на борту без мітки. Формат: ціле число.", false, { min: 0, ph: "118" }),
        F("disc_dead", "Number discarded dead", "int", "Викинуто мертвим", "Кількість прилову, повернутого в море мертвим.", false, { min: 0, ph: "0" }),
        F("rel_alive", "Number released alive", "int", "Випущено живим", "Кількість риби, випущеної живою назад у море.", false, { min: 0, ph: "12" }),
        F("lost_surface", "Number lost/dropped off at surface", "int", "Загублено на поверхні", "Кількість риби, втраченої (зірвалась з гачка) біля поверхні під час підйому.", false, { min: 0, ph: "0" }),
        F("heads_hooks", "Number of heads on hooks", "int", "Голів на гачках", "Ознака хижацтва (депредації) — кількість гачків, де залишилась лише голова риби.", false, { min: 0, ph: "0" }),
        F("lips_hooks", "Number of lips on hooks", "int", "Губ на гачках", "Ознака хижацтва — кількість гачків, де залишились лише губи риби.", false, { min: 0, ph: "0" }),
      ],
    },
    // -------------------------------------------------------------- 4 -----
    {
      id: "imaf", num: "4", en: "Haul IMAF", ua: "Побічна смертність птахів і ссавців", kind: "table", note: "Заповнюйте лише за фактом випадку. Якщо за рейс подій не було — лист залишається без жодного рядка (це нормально).",
      fields: [
        F("haul_no", "Haul number", "int", "№ Haul", "Номер Haul, на якому стався випадок.", true, { min: 1 }),
        F("species", "Species Code", "text", "Вид", "Вид птаха/ссавця. Латинська назва або код.", true, { ph: "Diomedea exulans" }),
        F("observed", "Observed?", "select", "Спостережено особисто?", "Чи спостерігач особисто бачив підйом тварини на борт.", true, { opts: YESNO }),
        F("when", "Caught during hauling or setting?", "select", "Момент інциденту", "Під час постановки чи виборки трапився випадок.", false, { opts: [["Hauling", "Виборка"], ["Setting", "Постановка"]] }),
        F("fate", "Fate of animal", "select", "Результат", "Стан тварини на момент виявлення.", true, { opts: [["Dead", "Загинула"], ["Alive released", "Випущена живою"], ["Alive injured", "Випущена живою, травмована"]] }),
        F("cause", "Cause of injury", "text", "Ймовірна причина", "Опис ймовірної причини травмування/загибелі.", false, {}),
        F("sample", "Sample retained?", "select", "Зразок відібрано?", "Чи взято зразок (пір'я/тканина) для аналізу.", false, { opts: YESNO }),
      ],
    },
    // -------------------------------------------------------------- 5 -----
    {
      id: "mmo", num: "5", en: "Marine Mammal Observation", ua: "Спостереження морських ссавців", kind: "table", note: "Заповнюйте за кожен тальовий період — навіть коли ссавців не виявлено (Observation Possible = No/Yes), а не лише позитивні спостереження.",
      fields: [
        F("haul_no", "Haul number", "int", "№ Haul", "Номер Haul тальового періоду.", true, { min: 1 }),
        F("obs_id", "Observer ID", "int", "ID спостерігача", "Номер спостерігача, який вів облік.", false, { min: 1, max: 3 }),
        F("obs_possible", "Observation Possible", "select", "Спостереження можливе?", "Чи дозволяли умови (видимість, освітлення) вести спостереження взагалі.", true, { opts: YESNO }),
        F("depred", "Depredation Observed", "select", "Депредація спостерігалась?", "Чи ссавці об'їдали рибу з яруса під час виборки.", false, { opts: YESNO }),
        F("presence", "Presence or Absence", "select", "Наявність", "Presence — тварин виявлено (навіть якщо лише чутно); Absence — не виявлено.", false, { opts: [["Presence", "Виявлено"], ["Absence", "Не виявлено"]] }),
        F("time_obs", "Time first observed (UTC, hh:mm)", "time", "Час першого спостереження (UTC)", "Час першого спостереження, формат гг:хв, UTC.", false, {}),
        F("species", "Species Code", "text", "Вид", "Код або назва виду ссавця.", false, { ph: "Baleen whales nei" }),
        F("min_n", "Minimum Number Observed", "int", "Мін. к-сть особин", "Оціночна мінімальна кількість спостережених тварин.", false, { min: 0 }),
        F("max_n", "Maximum Number Observed", "int", "Макс. к-сть особин", "Оціночна максимальна кількість спостережених тварин.", false, { min: 0 }),
      ],
    },
    // -------------------------------------------------------------- 6 -----
    {
      id: "vme", num: "6", en: "Haul VME", ua: "Вразливі морські екосистеми", kind: "table", note: "Ярус ділиться на сегменти; для кожного сегмента, де піднято індикаторні таксони ВМЕ, — окремий рядок.",
      fields: [
        F("haul_no", "Haul number", "int", "№ Haul", "Номер Haul, до якого належить сегмент.", true, { min: 1 }),
        F("segment_no", "VME Segment Number", "int", "№ сегмента", "Порядковий номер сегмента яруса в межах Haul.", true, { min: 1, ph: "1", seq: true }),
        F("bucket_unit", "Observed Bucket VME Unit(s)", "select", "К-сть одиниць у відерці", "Категорія кількості знайденого матеріалу ВМЕ.", false, { opts: [["Less than 5 units", "Менше 5 одиниць"], ["5 or more units", "5 і більше одиниць"]] }),
        F("sample_type", "Sample Type", "select", "Тип вибірки", "Random — випадкова вибірка сегментів (~30%); Trigger — сегмент із ≥5 одиниць-індикаторів. Тип не змінюється заднім числом.", true, { opts: [["Random", "Випадкова"], ["Trigger", "Тригерна"]] }),
        F("lat_deg", "Latitude degrees (-DD)", "num", "Широта, град.", "Градуси широти середини сегмента. Від'ємне = південна широта.", false, { min: -90, max: 90, ph: "-75" }),
        F("lon_deg", "Longitude degrees (DDD)", "num", "Довгота, град.", "Градуси довготи середини сегмента. Від'ємне = західна довгота.", false, { min: -180, max: 180, ph: "-175" }),
        F("vme_species", "VME Species Code", "text", "Код таксона ВМЕ", "Код таксона-індикатора ВМЕ (губки, корали, горгонарії тощо).", true, { ph: "DWR", list: VME_SPECIES_CODES }),
        F("volume", "Volume (litres)", "num", "Об'єм (л)", "Об'єм знайденого матеріалу цього таксона в сегменті, літри.", false, { min: 0, step: 0.1, ph: "0.5" }),
        F("weight", "Weight (kg)", "num", "Вага (кг)", "Вага знайденого матеріалу, кг (для гіллястих форм — замість об'єму).", false, { min: 0, step: 0.01, ph: "0.4" }),
      ],
    },
    // -------------------------------------------------------------- 7 -----
    {
      id: "bio", num: "7", en: "Biological Sampling", ua: "Біологічні проби", kind: "table", note: "Один рядок = один індивідуальний біологічний промір однієї риби.",
      fields: [
        F("haul_no", "Haul Number", "int", "№ Haul", "Номер Haul, з якого відібрана риба.", true, { min: 1 }),
        F("fish_no", "Fish Serial Number", "int", "№ риби", "Порядковий номер риби в межах цього Haul (не наскрізний за весь рейс). Приклад: 1.", true, { min: 1, ph: "1", seq: true }),
        F("obs_id", "Observer ID", "int", "ID спостерігача", "Номер спостерігача, який виконав промір.", false, { min: 1, max: 3 }),
        F("species", "Species Code", "text", "Код виду", "Код виду риби.", true, { ph: "TOA", list: SPECIES_CODES }),
        F("total_len", "Total Length (cm)", "num", "Загальна довжина (см)", "Довжина від писка до кінця хвостового плавця. Формат: число, см. Приклад: 146.", true, { min: 0, max: 300, step: 0.1, ph: "146" }),
        F("std_len", "Standard Length (cm)", "num", "Стандартна довжина (см)", "Довжина до кінця луски (без хвостового плавця). Приклад: 132.", false, { min: 0, max: 300, step: 0.1, ph: "132" }),
        F("weight", "Weight (kg)", "num", "Вага (кг)", "Загальна вага риби, кг. Приклад: 48.", true, { min: 0, max: 500, step: 0.1, ph: "48" }),
        F("sex", "Sex", "select", "Стать", "Стать риби, за візуальним/анатомічним визначенням.", true, { opts: SEX }),
        F("maturity", "Fish Maturity Stage", "select", "Стадія зрілості", "Код стадії статевої зрілості: 1 = незріла, 2 = дозріваюча, 3 = дозріла, 4 = нерест, 5 = відзерест.", false, { opts: [["1", "1 — незріла"], ["2", "2 — дозріваюча"], ["3", "3 — дозріла"], ["4", "4 — нерест"], ["5", "5 — відзерест"]] }),
        F("gonad_w", "Gonad Weight (g)", "num", "Вага гонад (г)", "Вага гонад, грами. Фіксується лише за визначеної статі й стадії. Приклад: 700.", false, { min: 0, step: 1, ph: "700" }),
        F("otolith", "Otolith(s) collected", "select", "Отоліт відібрано?", "Чи відібрано отоліт для визначення віку.", false, { opts: YESNO }),
        F("otolith_no", "Otolith Serial Number(s)", "text", "№ отоліта", "Серійний номер відібраного отоліта для лабораторного аналізу.", false, {}),
      ],
    },
    // -------------------------------------------------------------- 8 -----
    {
      id: "tagging", num: "8", en: "Tagging", ua: "Мічення риби", kind: "table", note: "Кожна помічена й випущена риба отримує пару T-bar міток (First Tag / Second Tag) з унікальними номерами.",
      fields: [
        F("haul_no", "Haul Number", "int", "№ Haul", "Номер Haul, на якому мічено рибу.", true, { min: 1 }),
        F("species", "Species Code", "text", "Код виду", "Код виду міченої риби.", true, { ph: "TOA", list: SPECIES_CODES }),
        F("tag1_id", "Tag Number (First Tag)", "text", "№ першої мітки", "Номер першої (основної) мітки. Формат: літера + цифри. Приклад: A689522.", true, { ph: "A689522" }),
        F("tag2_id", "Tag Number (Second Tag)", "text", "№ другої мітки", "Номер другої (дублюючої) мітки, поставленої тій самій рибі. Приклад: A689523.", false, { ph: "A689523" }),
        F("person", "Person Tagging", "select", "Хто мітив", "Хто фактично здійснив мічення.", false, { opts: [["Crew", "Член екіпажу"], ["Observer", "Спостерігач"]] }),
        F("total_len", "Total Length (cm)", "num", "Довжина (см)", "Загальна довжина риби перед випуском.", true, { min: 0, max: 300, step: 0.1, ph: "118" }),
        F("release_lat", "Release Latitude degrees (-DD)", "num", "Широта випуску, град.", "Градуси широти фактичного місця випуску риби.", false, { min: -90, max: 90 }),
        F("release_lon", "Release Longitude degrees (DDD)", "num", "Довгота випуску, град.", "Градуси довготи фактичного місця випуску риби.", false, { min: -180, max: 180 }),
        F("successful", "Successful", "select", "Успішність", "Чи мічення визнано успішним (риба в задовільному стані випущена живою).", true, { opts: SUCCESS_OPT }),
        F("comment", "Comments", "textarea", "Коментар", "Будь-які додаткові зауваження щодо мічення цієї риби.", false, {}),
      ],
    },
    // -------------------------------------------------------------- 9 -----
    {
      id: "conv", num: "9", en: "Conversion Factors", ua: "Коефіцієнти перерахунку ваги", kind: "table", note: "Мінімум 20 риб на тест, повторювати щонайменше раз на тиждень для кожного району управління.",
      fields: [
        F("haul_no", "Haul Number", "int", "№ Haul", "Номер Haul, на якому проведено тест.", true, { min: 1 }),
        F("species", "Species Code", "text", "Код виду", "Код виду.", true, { ph: "TOA", list: SPECIES_CODES }),
        F("proc_code", "Processing Code", "text", "Код обробки", "Спосіб переробки тушки.", true, { ph: "HGT", list: PROCESSING_CODES }),
        F("green_w", "Green Weight (kg)", "num", "Необроблена вага (кг)", "Вага риби до обробки («як є»), кг. Приклад: 1091.4.", true, { min: 0, step: 0.1, ph: "1091.4" }),
        F("proc_w", "Processed Weight (kg)", "num", "Оброблена вага (кг)", "Вага тушки після обробки, кг. Приклад: 642.", true, { min: 0, step: 0.1, ph: "642" }),
        F("cut_type", "Cut Type", "select", "Спосіб різання", "Спосіб різання тушки.", false, { opts: [["Straight cut - hand", "Прямий розріз, вручну"], ["Straight cut - machine", "Прямий розріз, машинно"]] }),
        F("comment", "Comment", "textarea", "Коментар", "Додаткові зауваження до тесту конверсійного коефіцієнта.", false, {}),
      ],
    },
    // ------------------------------------------------------------- 10 -----
    {
      id: "recapture", num: "10", en: "Tag Recapture", ua: "Повторна поімка меченої риби", kind: "table", note: "Увага: заповнюйте лише реальні значення під кожним заголовком; порожні «слоти» (Second/Third Tag, якщо тегів менше) залишайте порожніми — не копіюйте текст заголовків у клітинки даних (типова помилка).",
      fields: [
        F("haul_no", "Haul Number", "int", "№ Haul", "Номер Haul, на якому знайдено мічену рибу.", true, { min: 1 }),
        F("finder", "Tag Finder", "select", "Хто знайшов мітку", "Хто виявив мітку на рибі.", false, { opts: [["Crew", "Член екіпажу"], ["Observer", "Спостерігач"]] }),
        F("species", "Species Code", "text", "Код виду", "Код виду повторно спійманої риби.", true, { ph: "TOA", list: SPECIES_CODES }),
        F("tag1_number", "Tag Number (First Tag)", "text", "№ першої мітки", "Номер першої знайденої мітки, списаний точно з фізичної мітки.", true, { ph: "A608892" }),
        F("tag1_wording", "Tag Wording (First Tag)", "text", "Текст на першій мітці", "Текст, вигравіюваний на мітці. Приклад: «Rtn CCAMLR».", false, { ph: "Rtn CCAMLR" }),
        F("tag2_number", "Tag Number (Second Tag)", "text", "№ другої мітки", "Номер другої мітки, якщо риба мала дві. Залиште порожнім, якщо була лише одна мітка.", false, { ph: "A608893" }),
        F("length", "Length (cm)", "num", "Довжина (см)", "Довжина риби на момент повторної поімки.", true, { min: 0, max: 300, step: 0.1, ph: "117" }),
        F("weight", "Weight (kg)", "num", "Вага (кг)", "Вага риби на момент повторної поімки.", false, { min: 0, step: 0.1, ph: "20" }),
        F("sex", "Sex", "select", "Стать", "Стать риби.", false, { opts: SEX }),
        F("maturity", "Maturity Stage", "select", "Стадія зрілості", "Стадія статевої зрілості на момент повторної поімки.", false, { opts: [["Immature", "Незріла"], ["Maturing", "Дозріваюча"], ["Mature", "Дозріла"]] }),
        F("gonad_w", "Gonad Weight (gm)", "num", "Вага гонад (г)", "Вага гонад, грами.", false, { min: 0, ph: "100" }),
        F("samples", "Samples retained", "text", "Відібрані зразки", "Які зразки відібрано (наприклад, Otolith(s)).", false, { ph: "Otolith(s)" }),
        F("comment", "Comments", "textarea", "Коментар", "Додаткові зауваження щодо повторної поімки.", false, {}),
      ],
    },
    // ------------------------------------------------------------- 11 -----
    {
      id: "waste", num: "11", en: "Waste Disposal", ua: "Утилізація відходів", kind: "mixed",
      groups: [
        { en: "Vessel equipment", ua: "Обладнання судна", fields: [
          F("incinerator", "Is vessel equipped with an incinerator?", "select", "Є інсинератор?", "Чи обладнане судно інсинератором для утилізації відходів.", true, { opts: YESNO }),
          F("holding", "Does vessel have waste holding facilities?", "select", "Є накопичувачі відходів?", "Чи є на судні накопичувальні ємності для тимчасового зберігання відходів.", true, { opts: YESNO }),
          F("gear_marked", "Is fishing gear marked with vessel identification?", "select", "Знаряддя марковане?", "Чи марковане знаряддя лову ідентифікацією судна (на випадок втрати в морі).", false, { opts: YESNO }),
          F("plastic_bands", "Were plastic bands present on bait boxes?", "select", "Пластикові стрічки на коробках наживки?", "Пластикові стрічки з коробок наживки небезпечні для морської фауни, якщо потрапляють у море.", false, { opts: YESNO }),
        ]},
      ],
      table: {
        titleEn: "Fishing Gear", titleUa: "Знаряддя лову (підсумок за рейс)",
        fields: [
          F("item", "Fishing Gear", "text", "Категорія знаряддя", "Категорія знаряддя лову. Приклад: Hooks attached to lines.", true, { ph: "Hooks attached to lines" }),
          F("lost", "Lost", "int", "Втрачено", "Кількість втраченого в морі знаряддя цієї категорії за рейс.", false, { min: 0, ph: "27120" }),
          F("discarded", "Discarded", "int", "Викинуто", "Кількість навмисно викинутого знаряддя цієї категорії.", false, { min: 0, ph: "0" }),
          F("retained", "Retained", "int", "Утилізовано на борту", "Кількість знаряддя, утилізованого штатно на борту.", false, { min: 0, ph: "0" }),
        ],
      },
    },
    // ------------------------------------------------------------- 12 -----
    {
      id: "iuu", num: "12", en: "IUU Sightings", ua: "Спостереження ННН-промислу", kind: "multitable",
      tables: [
        { key: "gear", titleEn: "Gear Sightings", titleUa: "Виявлені безхазяйні знаряддя", fields: [
          F("gear_type", "Gear Type", "text", "Тип знаряддя", "Тип виявленого безхазяйного знаряддя лову.", true, { ph: "Longline / Gillnet / Pot" }),
          F("sight_dt", "Date and Time (UTC) of Sighting", "datetime", "Дата й час виявлення (UTC)", "Дата й час виявлення знаряддя, UTC.", true, {}),
          F("lat_deg", "Latitude degrees (-DD)", "num", "Широта, град.", "Градуси широти місця виявлення.", false, { min: -90, max: 90 }),
          F("lon_deg", "Longitude degrees (DDD)", "num", "Довгота, град.", "Градуси довготи місця виявлення.", false, { min: -180, max: 180 }),
          F("photo", "Photos/ video taken?", "select", "Фото/відео зроблено?", "Чи зроблено фото- чи відеофіксацію знахідки.", false, { opts: YESNO }),
          F("mesh", "Mesh Size (mm)", "num", "Розмір вічка (мм)", "Тільки для зябрових сіток — розмір вічка, мм.", false, { min: 0 }),
        ]},
        { key: "vessel", titleEn: "Vessel Sightings", titleUa: "Спостереження суден", fields: [
          F("vessel_type", "Vessel Type", "text", "Тип судна", "Тип підозрілого судна.", true, {}),
          F("vessel_name", "Vessel Name (if observed)", "text", "Назва судна", "Назва судна, якщо вдалося встановити.", false, {}),
          F("call_sign", "Call Sign (if observed)", "text", "Позивний", "Радіопозивний судна, якщо відомий.", false, {}),
          F("flag", "Flag State (if observed)", "text", "Прапор", "Держава прапора судна, якщо відома.", false, {}),
          F("sight_dt", "Date and Time (UTC) of Sighting", "datetime", "Дата й час спостереження (UTC)", "Дата й час спостереження судна, UTC.", true, {}),
          F("comm", "Communication attempted with vessel?", "select", "Спроба зв'язку?", "Чи намагалися вийти на зв'язок із судном.", false, { opts: YESNO }),
          F("activity", "Activity", "text", "Діяльність", "Опис діяльності судна на момент спостереження.", false, {}),
          F("heading", "Heading (degrees)", "num", "Курс (град.)", "Курс судна в градусах, 0–360.", false, { min: 0, max: 360 }),
        ]},
      ],
    },
  ],
};

if (typeof window !== "undefined") { window.OLV_SCHEMA = OLV_SCHEMA; }
if (typeof module !== "undefined" && module.exports) { module.exports = OLV_SCHEMA; }
