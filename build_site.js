const fs = require("fs");
const path = require("path");

// =====================================================================
// SHARED LAYOUT
// =====================================================================

const NAV = [
  ["index.html", "Головна", "🏠"],
  { group: "Основи" },
  ["01-governing.html", "Керівні документи", "📜"],
  ["02-measures.html", "Заходи зі збереження", "⚖️"],
  ["18-inspection.html", "Інспекційна система", "🔍"],
  { group: "Промисел і види" },
  ["06-identification.html", "Визначники", "🔬"],
  ["12-species-cards.html", "Картки видів", "🖼️"],
  ["05-gear.html", "Знаряддя лова", "🎣"],
  ["17-other-fisheries.html", "Інші промисли (криль/кальмари/краби)", "🦐"],
  ["07-vme.html", "VME", "🪸"],
  ["08-tagging.html", "Мічення (Tagging)", "🏷️"],
  { group: "Форми спостерігача" },
  ["03-forms-main.html", "Форми головні", "📝"],
  ["04-forms-instructions.html", "Форми та інструкції", "📋"],
  ["11-templates.html", "Заповнення журналів", "📓"],
  { group: "Довідники" },
  ["13-library.html", "Бібліотека документів", "📚"],
  ["14-glossary.html", "Глосарій термінів", "🔤"],
  ["15-flashcards.html", "Флеш-картки", "🗂️"],
  { group: "Підготовка до іспиту" },
  ["16-checklist.html", "Чек-лист підготовки", "✅"],
  ["19-internship.html", "Програма стажування", "🎓"],
  ["09-cheatsheet.html", "Шпаргалка", "🧾"],
  ["10-test.html", "Самоперевірка (тест)", "📊"]
];

const SITE_DESCRIPTION_DEFAULT = "Український сайт підготовки до іспиту CCAMLR SISO (сезон 2026/27): повний виклад керівних документів, заходів зі збереження, форм спостерігача, визначників видів, VME та протоколів мічення.";

function layout(title, active, bodyHtml, opts) {
  opts = opts || {};
  const navHtml = NAV.map((item) => {
    if (!Array.isArray(item)) {
      return `<div class="nav-group-label">${item.group}</div>`;
    }
    const [href, label, icon] = item;
    const iconHtml = icon ? `<span class="nav-icon" aria-hidden="true">${icon}</span>` : "";
    return `<a href="${href}" class="navlink${href === active ? " active" : ""}">${iconHtml}<span class="nav-label">${label}</span></a>`;
  }).join("\n");
  const pageDescription = opts.description || SITE_DESCRIPTION_DEFAULT;
  const canonicalUrl = "https://starunovserhii.github.io/CCAMLR/" + active;
  return `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Підготовка CCAMLR SISO</title>
<meta name="description" content="${escAttr(pageDescription)}">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escAttr(title)} — Підготовка CCAMLR SISO">
<meta property="og:description" content="${escAttr(pageDescription)}">
<meta property="og:url" content="${canonicalUrl}">
<meta name="theme-color" content="#1F4E79">
<link rel="manifest" href="manifest.json">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐟</text></svg>">
<link rel="stylesheet" href="css/style.css">
<script>(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.setAttribute("data-theme","dark");}}catch(e){}})();</script>
</head>
<body>
<button id="navToggle" class="nav-toggle" aria-label="Меню">☰</button>
<div class="layout">
  <nav class="sidebar" id="sidebar">
    <div class="brand">🐟 CCAMLR&nbsp;SISO<br><span>Підготовка до іспиту</span></div>
    <div class="search-box">
      <input type="text" id="siteSearch" placeholder="Пошук по сайту…" autocomplete="off">
      <div id="searchResults" class="search-results"></div>
    </div>
    ${navHtml}
    <button id="themeToggle" class="theme-toggle" type="button" aria-label="Перемкнути темну тему">🌙 Темна тема</button>
    <div class="sidebar-footer">Сезон 2026/27<br>Сайт підготовлено 13.07.2026</div>
  </nav>
  <main class="content">
    ${opts.noHeader ? "" : `<h1 class="page-title">${title}</h1>`}
    ${bodyHtml}
    <footer class="page-footer">
      <p>Сайт створено на основі 21 офіційного та довідкового документа CCAMLR/SISO, наданих для підготовки до семінару та іспиту. Усі коментарі позначені як <strong>Коментар</strong> є авторськими примітками і не є офіційною позицією CCAMLR.</p>
    </footer>
  </main>
</div>
${speciesModalHtml}
<button id="backToTop" class="back-to-top" type="button" aria-label="Нагору">↑</button>
<script src="js/search-index.js"></script>
<script src="js/script.js"></script>
<script>if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}</script>
</body>
</html>`;
}

function section(id, title, innerHtml) {
  return `<section id="${id}" class="card">
    <h2>${title}</h2>
    ${innerHtml}
  </section>`;
}
function h3(t) { return `<h3>${t}</h3>`; }
function p(t) { return `<p>${t}</p>`; }
function comment(t) { return `<div class="comment"><strong>Коментар:</strong> ${t}</div>`; }
function ul(items) { return `<ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>`; }
function ol(items) { return `<ol>${items.map(i => `<li>${i}</li>`).join("")}</ol>`; }
function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${
    rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")
  }</tbody></table></div>`;
}
const docMap = {
  "2026 Observer Longline Logbook Instructions.pdf": "docs/2026-observer-longline-logbook-instructions.pdf",
  "CCAMLR Scientific Observer Longline Vessel Cruise Report 2026.docx": "docs/ccamlr-scientific-observer-longline-vessel-cruise-report-2026.docx",
  "CCAMLR Tag Overlap Statistic Calculator_v2026.xlsm": "docs/ccamlr-tag-overlap-statistic-calculator-v2026.xlsm",
  "CCAMLR protocols for pinniped identification (1).docx": "docs/ccamlr-protocols-for-pinniped-identification-1.docx",
  "CCAMLR_VME_guide_2023V2.pdf": "docs/ccamlr-vme-guide-2023v2.pdf",
  "DIssostichis eleginoides gonad guide.docx": "docs/dissostichis-eleginoides-gonad-guide.docx",
  "EN - C2 Longline Fisheries Commercial data manual 2025_1.pdf": "docs/en-c2-longline-fisheries-commercial-data-manual-2025-1.pdf",
  "EN - Movement_10-04 Annex A.xlsx": "docs/en-movement-10-04-annex-a.xlsx",
  "EN - Toothfish and Skate Tagging Manual 2025.docx": "docs/en-toothfish-and-skate-tagging-manual-2025.docx",
  "EN - schedule 2025-26.pdf": "docs/en-schedule-2025-26.pdf",
  "Easy Identification Keys for Grenadiers in 88.1 and 88.3_Sagndeok.pdf": "docs/easy-identification-keys-for-grenadiers-in-88-1-and-88-3-sagndeok.pdf",
  "Fishes of the Ross Sea Region_A field guide to common species caught in the longline fishery (2015).pdf": "docs/fishes-of-the-ross-sea-region-a-field-guide-to-common-species-caught-in-the-longline-fishery-2015.pdf",
  "Identification Guide for Toothfish (poster).pdf": "docs/identification-guide-for-toothfish-poster.pdf",
  "Illustrated generic gear diagrams_2023 v1.3.docx": "docs/illustrated-generic-gear-diagrams-2023-v1-3.docx",
  "SOUTHERN OCEAN whales and dolphins (ASOC poster).pdf": "docs/southern-ocean-whales-and-dolphins-asoc-poster.pdf",
  "e-SISO Manual Finfish Fisheries 2026.pdf": "docs/e-siso-manual-finfish-fisheries-2026.pdf",
  "e-pt10_4.pdf": "docs/e-pt10-4.pdf",
  "e-pt1_3.pdf": "docs/e-pt1-3.pdf",
  "e-tagging procedures-2020.docx": "docs/e-tagging-procedures-2020.docx",
  "en_C2_2026a.xlsx": "docs/en-c2-2026a.xlsx",
  "риба.doc": "docs/riba.doc"
};
// Maps each of the 21 original documents to its "розгорнутий структурований
// переказ українською" (own-words summary, NOT a verbatim translation — see
// note inside each file) prepared for Library section 9.
const docMapUa = {
  "e-pt1_3.pdf": "docs_ua/01-convention.docx",
  "e-pt10_4.pdf": "docs_ua/02-siso-scheme.docx",
  "e-SISO Manual Finfish Fisheries 2026.pdf": "docs_ua/03-observer-manual.docx",
  "EN - schedule 2025-26.pdf": "docs_ua/04-schedule-cm.docx",
  "en_C2_2026a.xlsx": "docs_ua/05-c2-form.docx",
  "CCAMLR Scientific Observer Longline Vessel Cruise Report 2026.docx": "docs_ua/06-cruise-report.docx",
  "EN - Movement_10-04 Annex A.xlsx": "docs_ua/07-movement-annex.docx",
  "CCAMLR Tag Overlap Statistic Calculator_v2026.xlsm": "docs_ua/08-tag-overlap-calc.docx",
  "2026 Observer Longline Logbook Instructions.pdf": "docs_ua/09-logbook-instructions.docx",
  "EN - C2 Longline Fisheries Commercial data manual 2025_1.pdf": "docs_ua/10-commercial-data-manual.docx",
  "Illustrated generic gear diagrams_2023 v1.3.docx": "docs_ua/11-gear-diagrams.docx",
  "Identification Guide for Toothfish (poster).pdf": "docs_ua/12-toothfish-poster.docx",
  "DIssostichis eleginoides gonad guide.docx": "docs_ua/13-gonad-guide.docx",
  "Easy Identification Keys for Grenadiers in 88.1 and 88.3_Sagndeok.pdf": "docs_ua/14-grenadiers-key.docx",
  "Fishes of the Ross Sea Region_A field guide to common species caught in the longline fishery (2015).pdf": "docs_ua/15-ross-sea-fishes.docx",
  "риба.doc": "docs_ua/16-riba-doc.docx",
  "CCAMLR protocols for pinniped identification (1).docx": "docs_ua/17-pinniped-protocol.docx",
  "SOUTHERN OCEAN whales and dolphins (ASOC poster).pdf": "docs_ua/18-whales-poster.docx",
  "CCAMLR_VME_guide_2023V2.pdf": "docs_ua/19-vme-guide.docx",
  "EN - Toothfish and Skate Tagging Manual 2025.docx": "docs_ua/20-tagging-manual.docx",
  "e-tagging procedures-2020.docx": "docs_ua/21-etag-survey.docx"
};
function fileTag(name) {
  const href = docMap[name];
  if (!href) return `<div class="filetag">📄 Файл: <code>${name}</code></div>`;
  return `<div class="filetag">📄 Файл: <code>${name}</code>
    <span class="filetag-actions">
      <a href="${href}" target="_blank" rel="noopener">↗ Відкрити</a>
      <a href="${href}" download>⬇ Завантажити</a>
    </span>
  </div>`;
}
function img(src, caption, cls) {
  return `<figure class="${cls || ""}"><img src="${src}" loading="lazy" alt="${(caption||"").replace(/"/g,'')}"><figcaption>${caption || ""}</figcaption></figure>`;
}
function gallery(items, cls) {
  return `<div class="gallery ${cls||""}">${items.map(([src, cap]) => img(src, cap)).join("")}</div>`;
}
function bilingual(enHtml, uaHtml) {
  return `<div class="bilingual">
    <div class="bilingual-col bilingual-en"><div class="bilingual-label">EN — оригінал</div>${enHtml}</div>
    <div class="bilingual-col bilingual-ua"><div class="bilingual-label">UA — переклад</div>${uaHtml}</div>
  </div>`;
}
function escAttr(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function speciesCard(c) {
  const imgHtml = c.img
    ? `<div class="species-card-img"><img src="${c.img}" loading="lazy" alt="${(c.ua||"").replace(/"/g,'')}"></div>`
    : `<div class="species-card-img species-card-noimg">${c.icon || "🐟"}</div>`;
  // sourceLink: an optional external link to a verified, appropriately licensed photo
  // (FishBase, iNaturalist, Wikimedia Commons with CC license, etc.) — used instead of
  // embedding the actual photo file, since the actual bitmap belongs to its author/license
  // and copying it into this repo would require clearing that per-image, per-source.
  const sourceHtml = c.sourceLink
    ? `<a class="species-source-link" href="${escAttr(c.sourceLink)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">🔗 ${escAttr(c.sourceLabel || "Фото виду (зовнішнє джерело)")}</a>`
    : "";
  return `<div class="species-card" tabindex="0" role="button"
      data-img="${escAttr(c.img || "")}"
      data-icon="${escAttr(c.icon || "🐟")}"
      data-code="${escAttr(c.code || "")}"
      data-ua="${escAttr(c.ua)}"
      data-latin="${escAttr(c.latin)}"
      data-note="${escAttr(c.note || "")}">
    ${imgHtml}
    <div class="species-card-body">
      ${c.code ? `<span class="species-code">${c.code}</span>` : ""}
      <div class="species-ua">${c.ua}</div>
      ${c.latin ? `<div class="species-latin">${c.latin}</div>` : ""}
      ${c.note ? `<div class="species-note">${c.note}</div>` : ""}
      ${sourceHtml}
    </div>
  </div>`;
}
function speciesGrid(cards) {
  return `<div class="species-grid">${cards.map(speciesCard).join("")}</div>`;
}
// gearCard/gearGrid reuse the exact same card + click-to-expand-modal
// mechanism built for species cards (same CSS classes, same script.js
// listener which binds to .species-card) — no need to duplicate any of that
// plumbing just because the content is gear instead of animals.
function gearCard(g) {
  return speciesCard({ img: g.img, ua: g.ua, latin: g.latin, code: g.category, note: g.note });
}
function gearGrid(cards) {
  return `<div class="species-grid">${cards.map(gearCard).join("")}</div>`;
}
// figureCard/figureGrid: same reused click-to-expand-modal mechanism, for plain
// numbered figures/scans (e.g. tagging manual illustrations) that only need an
// image + caption — no species name/code/latin fields involved.
function figureCard([src, caption]) {
  return speciesCard({ img: src, ua: caption, icon: "📷" });
}
function figureGrid(items) {
  return `<div class="species-grid">${items.map(figureCard).join("")}</div>`;
}
const speciesModalHtml = `<div class="species-modal-overlay" id="speciesModalOverlay">
  <div class="species-modal" role="dialog" aria-modal="true" aria-labelledby="speciesModalUa">
    <button class="species-modal-close" id="speciesModalClose" aria-label="Закрити">✕</button>
    <div id="speciesModalImgWrap"></div>
    <div class="species-modal-body">
      <span class="species-modal-code" id="speciesModalCode" style="display:none;"></span>
      <div class="species-modal-ua" id="speciesModalUa"></div>
      <div class="species-modal-latin" id="speciesModalLatin"></div>
      <div class="species-modal-note" id="speciesModalNote"></div>
    </div>
  </div>
</div>`;

// =====================================================================
// PAGE: INDEX
// =====================================================================

const scheduleRows = [
["13–19 липня<br><span class='muted'>Тиждень 1, самостійно</span>","Загальне ознайомлення","Весь пакет матеріалів + поглиблено: розділи <a href='01-governing.html'>«Керівні документи»</a> і <a href='02-measures.html'>«Заходи зі збереження»</a>"],
["20–21 липня, 11:00–15:00","<strong>Семінар 1</strong> (відеоконференція)","Вступ до програми SISO, огляд заходів зі збереження, загальні обов'язки спостерігача"],
["22–26 липня<br><span class='muted'>Тиждень 2</span>","Форми головні + Форми та інструкції","Розділи <a href='03-forms-main.html'>«Форми головні»</a> і <a href='04-forms-instructions.html'>«Форми та інструкції»</a> — практика заповнення"],
["27–28 липня, 11:00–15:00","<strong>Семінар 2 + Q&A</strong> з Іллею Сліпко","Практичні питання щодо заповнення форм, роз'яснення спірних моментів"],
["29 липня – 4 серпня<br><span class='muted'>Тиждень 3</span>","Знаряддя лова + Визначники","Розділи <a href='05-gear.html'>«Знаряддя лова»</a> та <a href='06-identification.html'>«Визначники»</a>"],
["5–11 серпня<br><span class='muted'>Тиждень 4</span>","VME + Tagging","Розділи <a href='07-vme.html'>«VME»</a> та <a href='08-tagging.html'>«Мічення»</a>"],
["12–14 серпня<br><span class='muted'>Тиждень 5</span>","Повторення й самоперевірка","<a href='09-cheatsheet.html'>Шпаргалка</a> + <a href='10-test.html'>інтерактивний тест (80 питань)</a>"],
["не пізніше 15 серпня","<strong>ІСПИТ</strong>","—"]
];

const categoryMap = [
["1. Керівні документи","Головні документи CCAMLR","Конвенція CCAMLR, текст Схеми SISO, Посібник наукового спостерігача 2026"],
["2. Заходи зі збереження","Головні правила для суден цього сезону (щороку змінюються)","Schedule of Conservation Measures 2025/26, карта підрайонів 88.1/88.2"],
["3. Форми головні","Форми, які безпосередньо заповнюють спостерігачі на судні","en_C2v2026a, Звіт про рейс, Movement Annex A, Tag Overlap Calculator"],
["4. Форми та інструкції","Роз'яснення, як заповнювати форми головні","Instructions до ярусного журналу, Commercial data manual"],
["5. Знаряддя лова","Типи ярусної снасті, пасток і пристроїв виключення ссавців","Illustrated generic gear diagrams v1.3"],
["6. Визначники","Гонади іклача, два види іклача, інші риби, птахи, морські ссавці","Toothfish poster, Grenadiers key, Ross Sea Fishes guide, Gonad guide, риба.doc, Pinniped protocol, Whales poster"],
["7. VME","Визначник вразливих морських екосистем","CCAMLR VME Taxa Classification Guide 2023 v2"],
["8. Tagging","Правила мічення іклача (та скатів)","Toothfish and Skate Tagging Manual 2025, опитування судна"]
];

const heroBanner = `
<div class="hero-banner" role="img" aria-label="Стилізована ілюстрація: судно ярусного лову серед айсбергів моря Росса під зоряним антарктичним небом, риба-іклач під водою, пінгвіни на кризі">
<svg viewBox="0 0 1200 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b2138"/>
      <stop offset="55%" stop-color="#163a5c"/>
      <stop offset="100%" stop-color="#2E86AB"/>
    </linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1F4E79"/>
      <stop offset="100%" stop-color="#0d2b45"/>
    </linearGradient>
    <linearGradient id="berg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f2f9ff"/>
      <stop offset="100%" stop-color="#bcdcf2"/>
    </linearGradient>
    <linearGradient id="shelf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#dceefb"/>
      <stop offset="100%" stop-color="#9cc7e4"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1200" height="320" fill="url(#sky)"/>
  <g fill="#ffffff" opacity="0.8">
    <circle cx="80" cy="30" r="1.3"/><circle cx="150" cy="55" r="1"/><circle cx="230" cy="20" r="1.4"/>
    <circle cx="320" cy="45" r="1"/><circle cx="410" cy="18" r="1.2"/><circle cx="480" cy="60" r="1"/>
    <circle cx="560" cy="25" r="1.4"/><circle cx="650" cy="15" r="1"/><circle cx="720" cy="50" r="1.2"/>
    <circle cx="800" cy="22" r="1"/><circle cx="880" cy="40" r="1.3"/><circle cx="960" cy="18" r="1"/>
    <circle cx="1040" cy="55" r="1.2"/><circle cx="1110" cy="28" r="1"/><circle cx="1160" cy="48" r="1.3"/>
  </g>
  <ellipse cx="980" cy="70" rx="46" ry="46" fill="#eaf1f8" opacity="0.9"/>
  <ellipse cx="980" cy="70" rx="46" ry="46" fill="#0b2138" opacity="0.18"/>
  <path d="M0,175 L60,150 120,168 190,140 260,165 330,145 410,170 480,150 560,172 640,148 720,168 800,150 880,172 960,155 1040,175 1120,158 1200,172 L1200,210 L0,210 Z" fill="url(#shelf)"/>
  <path d="M0,190 L90,178 180,195 270,180 360,198 460,182 560,200 660,183 760,200 860,184 960,202 1060,186 1160,200 1200,192 L1200,220 L0,220 Z" fill="#c9e3f5" opacity="0.85"/>
  <rect x="0" y="205" width="1200" height="115" fill="url(#sea)"/>
  <g opacity="0.35" stroke="#eaf1f8" stroke-width="2" fill="none">
    <path d="M0,232 Q60,224 120,232 T240,232 T360,232 T480,232 T600,232 T720,232 T840,232 T960,232 T1080,232 T1200,232"/>
    <path d="M0,258 Q60,250 120,258 T240,258 T360,258 T480,258 T600,258 T720,258 T840,258 T960,258 T1080,258 T1200,258"/>
    <path d="M0,284 Q60,276 120,284 T240,284 T360,284 T480,284 T600,284 T720,284 T840,284 T960,284 T1080,284 T1200,284"/>
  </g>
  <g transform="translate(140,196)">
    <path d="M0,26 L28,0 L58,10 L70,30 L46,40 L10,38 Z" fill="url(#berg)" stroke="#8fbfe0" stroke-width="1"/>
    <path d="M8,26 L28,10 L48,18 L34,30 Z" fill="#ffffff" opacity="0.6"/>
  </g>
  <g transform="translate(1000,204)">
    <path d="M0,22 L20,2 L44,8 L54,24 L34,34 L6,32 Z" fill="url(#berg)" stroke="#8fbfe0" stroke-width="1"/>
  </g>
  <g transform="translate(600,214) scale(0.9)">
    <path d="M0,24 L16,4 L40,0 L56,14 L64,28 L34,36 L4,34 Z" fill="url(#berg)" stroke="#8fbfe0" stroke-width="1"/>
    <path d="M10,24 L28,10 L44,16 L30,28 Z" fill="#ffffff" opacity="0.55"/>
    <ellipse cx="30" cy="4" rx="9" ry="5" fill="#0b2138"/>
    <ellipse cx="12" cy="6" rx="7" ry="4" fill="#0b2138"/>
  </g>
  <g transform="translate(300,240)" opacity="0.9">
    <path d="M0,10 Q40,-14 80,10 Q120,-8 160,8 L160,22 L0,22 Z" fill="#dceefb"/>
    <g transform="translate(55,-6) scale(0.9)">
      <ellipse cx="0" cy="14" rx="6" ry="9" fill="#1a1a1a"/>
      <ellipse cx="0" cy="16" rx="5" ry="6" fill="#f4f4f4"/>
      <circle cx="0" cy="4" r="4.5" fill="#1a1a1a"/>
      <path d="M-4,3 L0,-4 L4,3 Z" fill="#e8963c"/>
    </g>
    <g transform="translate(78,-2) scale(0.75)">
      <ellipse cx="0" cy="14" rx="6" ry="9" fill="#1a1a1a"/>
      <ellipse cx="0" cy="16" rx="5" ry="6" fill="#f4f4f4"/>
      <circle cx="0" cy="4" r="4.5" fill="#1a1a1a"/>
      <path d="M-4,3 L0,-4 L4,3 Z" fill="#e8963c"/>
    </g>
  </g>
  <g transform="translate(770,180)">
    <path d="M0,40 L0,18 L14,10 L120,10 L134,18 L134,40 Z" fill="#eaf1f8"/>
    <rect x="18" y="20" width="98" height="14" fill="#1F4E79"/>
    <rect x="40" y="0" width="10" height="20" fill="#eaf1f8"/>
    <rect x="34" y="-4" width="22" height="6" fill="#1F4E79"/>
    <rect x="70" y="4" width="8" height="16" fill="#eaf1f8"/>
    <line x1="118" y1="10" x2="150" y2="-16" stroke="#dceefb" stroke-width="2"/>
    <line x1="112" y1="12" x2="150" y2="-16" stroke="#dceefb" stroke-width="2"/>
    <path d="M0,40 L134,40 L128,48 L6,48 Z" fill="#163a5c"/>
  </g>
  <g transform="translate(500,270)" opacity="0.55">
    <path d="M0,10 C20,-6 55,-6 75,10 C60,8 55,16 40,10 C28,18 12,16 0,10 Z" fill="#bcdcf2"/>
  </g>
  <g transform="translate(900,286)" opacity="0.5">
    <path d="M0,8 C16,-5 44,-5 60,8 C48,7 44,13 32,8 C22,14 10,13 0,8 Z" fill="#bcdcf2"/>
  </g>
</svg>
</div>
`;

const indexBody = `
${heroBanner}
${section("intro", "Ласкаво просимо", `
<div id="examCountdown" class="countdown-widget" data-dates='[["2026-07-20","Семінару 1"],["2026-07-27","Семінару 2"],["2026-08-15","ІСПИТУ"]]'></div>
<div id="examCountdownFixed" class="countdown-widget countdown-exam" data-target="2026-08-15" data-label="ІСПИТУ (не пізніше)"></div>
<p><a href="ccamlr-seminars-2026.ics" download class="btn" style="display:inline-block;text-decoration:none;">📅 Додати дати семінарів та іспиту в календар (.ics)</a></p>
<div class="filetag" style="flex-direction:column;align-items:flex-start;gap:6px;">
  <div><strong>🎓 Ілюстрований посібник-презентація</strong> для кваліфікаційної атестації наукових спостерігачів ККАМЛР (ДНУ ІРГЕМО) — 42 слайди, узагальнюють весь матеріал цього сайту з ілюстраціями.</div>
  <div class="filetag-actions">
    <a href="downloads/CCAMLR-IRGEMO-posibnyk-atestatsiya.pptx" download>⬇ Завантажити PPTX (презентація)</a>
    <a href="downloads/CCAMLR-IRGEMO-posibnyk-atestatsiya.pdf" download>⬇ Завантажити PDF (для друку)</a>
  </div>
</div>
${p("Цей сайт створено як єдине джерело для самостійної підготовки до іспиту SISO CCAMLR (сезон 2026/27). Він об'єднує <strong>повний текстовий і візуальний зміст усіх 21 наданого документа</strong> — конвенцію, заходи зі збереження, форми спостерігача, інструкції, визначники видів, протоколи мічення та довідник ВМЕ — структурований у 8 тематичних розділів, за якими організовано сам семінар.")}
${p("Заплановано два семінари у форматі відеоконференції та іспит. Перший семінар — <strong>20 та 21 липня, 11:00–15:00</strong>. Другий семінар — <strong>27 та 28 липня, 11:00–15:00</strong>; до нього приєднається український координатор CCAMLR <strong>Ілля Сліпко</strong> для відповідей на запитання. Іспит буде призначено <strong>не пізніше 15 серпня</strong>. План попередній і може коригуватися.")}
${comment("За кілька годин семінарів неможливо викласти весь матеріал — основне навантаження припадає на самостійну підготовку. Розклад нижче синхронізує читання розділів сайту з датами семінарів, щоб ви приходили на кожен з уже сформованими питаннями.")}
`)}
${section("schedule", "Розклад підготовки", table(["Період","Захід","Тема / розділи сайту"], scheduleRows))}
${section("catmap", "Вісім тематичних розділів", table(["Розділ","Пояснення","Ключові документи"], categoryMap))}
${section("howto", "Як користуватися сайтом", `
${ul([
  "Навігація зліва (на мобільному — через кнопку ☰) відповідає 8 розділам семінару плюс шпаргалка й тест.",
  "У кожному розділі — повний виклад змісту документів українською мовою: текст, таблиці, оригінальні зображення й скани документів.",
  "Сині блоки «Коментар» — це авторські примітки: на що звернути увагу, де документи перетинаються, де знайдені розбіжності.",
  "Розділ <a href='10-test.html'>«Самоперевірка»</a> — інтерактивний тест на 80 запитань з миттєвим підрахунком результату.",
  "Розділ <a href='09-cheatsheet.html'>«Шпаргалка»</a> — стисле зведення найважливіших цифр і критеріїв для повторення в останні дні перед іспитом."
])}
`)}
${section("useful-links", "Корисні офіційні посилання CCAMLR", `
${p("Ці ресурси не входять до пакету з 21 наданого документа, але корисні під час реального рейсу — не лише для підготовки до іспиту. Знайдено на офіційному сайті <a href='https://www.ccamlr.org' target='_blank' rel='noopener'>ccamlr.org</a>.")}
${table(["Ресурс","Навіщо спостерігачу"], [
  ["<a href='https://www.ccamlr.org/ru/organisation/об-антком' target='_blank' rel='noopener'>Про АНТКОМ (офіційна сторінка, рос.)</a>","Загальний опис організації, мандату та структури Комісії з питань збереження морських живих ресурсів Антарктики — корисно для розуміння контексту роботи спостерігача"],
  ["<a href='https://www.ccamlr.org/en/compliance/list-vessel-authorisations' target='_blank' rel='noopener'>Список авторизованих суден</a>","Звірити судно з офіційним переліком — актуально для розділу «IUU Sightings» (4.12)"],
  ["<a href='https://www.ccamlr.org/en/node/124626' target='_blank' rel='noopener'>Vessel sighting form</a>","Офіційна форма звітування про спостереження суден — доповнює журнал IUU"],
  ["<a href='https://www.ccamlr.org/en/node/121823' target='_blank' rel='noopener'>Unidentified gear reporting</a>","Форма звітування про невідоме знаряддя, знайдене в морі — доповнює розділ «Waste Disposal» (4.11)"],
  ["<a href='https://www.ccamlr.org/en/node/127564' target='_blank' rel='noopener'>Cetacean interaction data form</a>","Окрема офіційна форма для випадків заплутування/затиснення китоподібних — не входить у стандартний журнал спостерігача"],
  ["<a href='https://www.ccamlr.org/en/science/tag-ordering-information' target='_blank' rel='noopener'>Tag Ordering Information</a>","Як замовити мітки CCAMLR — практична інформація до розділу 8 «Мічення»"],
  ["<a href='https://www.ccamlr.org/en/data/forms' target='_blank' rel='noopener'>CCAMLR data forms</a>","Повний офіційний перелік усіх форм CCAMLR (трал, пастки, CEMP тощо) — довідково, за межами ярусного лову"],
  ["<a href='https://www.ccamlr.org/en/publications/fishery-reports' target='_blank' rel='noopener'>Fishery Reports</a>","Щорічні звіти по кожному промислу/підрайону — контекст для розуміння, як використовуються дані спостерігача"],
  ["<a href='https://ecds.ccamlr.org' target='_blank' rel='noopener'>e-CDS (Catch Documentation Scheme)</a>","Електронна система документації вилову іклача — допомагає зрозуміти, куди йдуть дані з форми C2"],
  ["<a href='https://www.ccamlr.org/en/document/conservation-and-management/schedule-conservation-measures-force-2025/26' target='_blank' rel='noopener'>Schedule of CM 2025/26 (офіційна сторінка)</a>","Той самий документ, що й у розділі 2, але з офіційної сторінки — зручно перевірити, чи виходило оновлення"],
  ["<a href='https://www.ccamlr.org/en/organisation/secretariat-services-correspondence' target='_blank' rel='noopener'>Контакти Секретаріату CCAMLR</a>","ccamlr@ccamlr.org, +61 3 6210 1111, 181 Macquarie Street, Hobart, Tasmania, Australia"]
])}
${comment("Список складено вручну після перегляду офіційного сайту CCAMLR (розділи Data → Forms, Science → SISO, Science → HPAI resources) — це не вичерпний перелік усього сайту, а вибірка, релевантна саме ярусному спостерігачу.")}
`)}
`;

// =====================================================================
// PAGE 01 — GOVERNING DOCUMENTS
// =====================================================================

const conventionArticles = [
["I","Сфера дії Конвенції — води на південь від 60° пд. ш. та між цією широтою і Антарктичною конвергенцією."],
["II","Мета Конвенції — збереження морських живих ресурсів Антарктики; поняття «збереження» включає раціональне використання."],
["III","Договірні Сторони зобов'язуються не діяти всупереч принципам Договору про Антарктику."],
["IV","Прив'язка до статей IV та VI Договору про Антарктику щодо територіальних претензій та прав."],
["V","Визнання особливих обов'язків Консультативних Сторін Договору про Антарктику."],
["VI","Ніщо в Конвенції не применшує прав за Міжнародною конвенцією з регулювання китобійного промислу та Конвенцією про збереження тюленів Антарктики."],
["VII","Заснування Комісії зі збереження морських живих ресурсів Антарктики (CCAMLR)."],
["VIII","Комісія має правосуб'єктність та правоздатність, необхідну для виконання своїх функцій."],
["IX","Функції Комісії: сприяння дослідженням, збір даних, визначення видів-мішеней, встановлення заходів зі збереження (ліміти вилову, райони, методи, сезони)."],
["X","Комісія звертає увагу держав, що не є Сторонами, на дії їхніх суден, які впливають на виконання цілей Конвенції."],
["XI","Співпраця Комісії з іншими органами щодо суміжних морських районів."],
["XII","Рішення Комісії з питань суті ухвалюються консенсусом; інші рішення — простою більшістю."],
["XIII","Штаб-квартира Комісії в м. Хобарт, Тасманія, Австралія; проведення щорічних засідань."],
["XIV","Заснування Науково-технічного комітету CCAMLR як консультативного органу."],
["XV","Науковий комітет — форум для консультацій та обміну інформацією про морські живі ресурси."],
["XVI","Перше засідання Наукового комітету — протягом трьох місяців після першого засідання Комісії."],
["XVII","Комісія призначає Виконавчого секретаря для обслуговування Комісії та Наукового комітету."],
["XVIII","Офіційні мови Комісії та Наукового комітету — англійська, французька, російська та іспанська."],
["XIX","Комісія щорічно ухвалює консенсусом бюджет Комісії та Наукового комітету."],
["XX","Члени Комісії надають статистичні, біологічні та інші дані в максимально можливому обсязі."],
["XXI","Кожна Договірна Сторона вживає заходів у межах своєї компетенції для забезпечення дотримання Конвенції."],
["XXII","Кожна Сторона докладає зусиль, щоб ніхто не здійснював діяльність, що суперечить меті Конвенції."],
["XXIII","Співпраця Комісії й Наукового комітету з Консультативними Сторонами Договору про Антарктику та іншими організаціями."],
["XXIV","Заснування системи спостереження та інспекції (основа Схеми міжнародного наукового спостереження, SISO)."],
["XXV","Порядок вирішення спорів між Договірними Сторонами."],
["XXVI","Відкриття Конвенції для підписання в Канберрі з 1 серпня по 31 грудня 1980 р."],
["XXVII","Конвенція підлягає ратифікації, прийняттю або затвердженню державами, що підписали."],
["XXVIII","Набуття чинності на 30-й день після депонування восьмого документа про ратифікацію."],
["XXIX","Приєднання до Конвенції відкрите для будь-якої держави, зацікавленої в дослідженнях чи промислі."],
["XXX","Порядок внесення поправок до Конвенції."],
["XXXI","Порядок виходу Договірної Сторони з Конвенції."],
["XXXII","Функції Депозитарію (Уряду Австралії) щодо повідомлень."],
["XXXIII","Автентичні тексти Конвенції — англійською, французькою, російською та іспанською мовами."]
];

const sisoScheme = [
["A","Кожен Член Комісії може призначати наукових спостерігачів (ст. XXIV Конвенції). Визначено функції спостерігачів (Додаток I), статус «Держави, що призначає» та «Держави, що приймає», вимоги до кваліфікації, мовної підготовки, посвідчення особи, обов'язок подати звіти й журнали протягом місяця після завершення рейсу."],
["B","Держави-члени зобов'язуються брати на борт призначених наукових спостерігачів відповідно до двосторонніх домовленостей: статус офіцера судна, повний доступ до даних і обладнання, безпечні умови праці."],
["C","Перелік інформації, яку Держава, що призначає, надає Секретаріату до розгортання спостерігача."],
["D","Вимоги до об'єктивності та наукової доброчесності даних: заборони для спостерігача та для власника/капітана судна; обмеження щодо повторних послідовних рейсів; конфіденційність даних."],
["E","Порядок дій Держав у разі порушень цієї Схеми з боку спостерігача або екіпажу судна."],
["F","Держави, які призначили спостерігачів, беруть на себе ініціативу у виконанні завдань, визначених Комісією."],
["G","Обсяг функцій і завдань (Додаток I) не визначає кількість спостерігачів, обов'язкових на борту судна."],
["H","План дій у надзвичайних ситуаціях (Додаток II) — обов'язковий для впровадження Державами, що приймають."]
];

const annexITasks = [
"відбір проб улову для визначення біологічних характеристик;",
"реєстрація біологічних даних за видами вилову;",
"реєстрація прилову, його кількості та інших біологічних даних відповідно до заходів зі збереження;",
"реєстрація заплутування та випадкової смертності морських птахів і морських ссавців;",
"звітування про заходи, вжиті для запобігання випадковій смертності;",
"реєстрація методики та параметрів вимірювання заявленої ваги вилову;",
"підготовка звітів про спостереження та подання їх через Державу, що призначає;",
"сприяння веденню обліку і звітності вилову на судні (за взаємною згодою Держав);",
"виконання інших завдань за взаємною згодою Держав;",
"збір і звітування про спостереження несанкціонованих або невпізнаних суден, немаркованих знарядь лову;",
"збір інформації про втрату знарядь лову та скидання сміття суднами в морі."
];

const annexIIPoints = [
"У разі смерті, зникнення або падіння спостерігача за борт судно негайно припиняє промислові операції, розпочинає пошуково-рятувальну операцію (щонайменше 72 години) та повідомляє MRCC.",
"Держава, що приймає, невідкладно повідомляє Державу, що призначає, і надає регулярні оновлення.",
"У разі смерті — тіло зберігається для розтину та розслідування.",
"У разі серйозної хвороби чи травми — судно припиняє промислові операції, надає можливу медичну допомогу на борту та організовує евакуацію.",
"У разі нападу, залякування чи переслідування спостерігача — судно вживає заходів для убезпечення спостерігача.",
"Договірні Сторони сприяють заходу суден із наглядачами CCAMLR SISO у порти для висадження спостерігача."
];

const sisoManualTOC = [
["1","Вступ"], ["2","Ролі та обов'язки спостерігача SISO"], ["3","Визначення термінів"],
["4","Регламенти CCAMLR"], ["5","Загальні операційні процедури"], ["6","Одиниці та формати"],
["7","Стандартні виміри (риба, скати/раї)"], ["8","Вага"], ["9","Визначення статі та стадій зрілості"],
["10","Збір і зберігання отолітів"], ["11","Тести коефіцієнта переведення — рибний промисел"],
["12","Визначник цільових видів"], ["13","Відбір і визначення цільового вилову й прилову"],
["14","Мічення іклача та скатів"], ["15","Спостереження за морськими ссавцями та птахами"],
["16","Уразливі морські екосистеми"], ["17","Список літератури"],
["Дод. 1","Карта району дії Конвенції CAMLR"], ["Дод. 2","Функції та завдання наукових спостерігачів"],
["Дод. 3","Вимоги до відбору проб Dissostichus spp."], ["Дод. 4","Протокол мічення іклача та скатів"]
];

const page01 = section("art", "1.1 Конвенція про збереження морських живих ресурсів Антарктики", `
  ${fileTag("e-pt1_3.pdf")}
  ${p("Конвенція CCAMLR складається з 33 статей. Нижче — короткий зміст кожної українською мовою.")}
  ${table(["Стаття","Зміст"], conventionArticles)}
  ${comment("Стаття XXIV — правова основа Схеми міжнародного наукового спостереження (SISO), розписаної нижче. Стаття IX визначає повноваження Комісії ухвалювати заходи зі збереження — саме вони складають «Schedule 2025/26» (розділ 2).")}
`) +
section("siso", "1.2 Схема міжнародного наукового спостереження CCAMLR (SISO)", `
  ${fileTag("e-pt10_4.pdf")}
  ${p("Текст Схеми структурований у восьми розділах (A–H):")}
  ${table(["Розділ","Зміст"], sisoScheme)}
  ${h3("Додаток I. Функції та завдання наукових спостерігачів")}
  ${ol(annexITasks)}
  ${h3("Додаток II. План дій у надзвичайних ситуаціях")}
  ${ul(annexIIPoints)}
  ${comment("Розділ D (заборони для спостерігача та для екіпажу/капітана) є юридичною основою для розділу «Операційні проблеми» у звіті про рейс — саме туди спостерігач вносить факти тиску, хабарництва чи перешкоджання.")}
`) +
section("manual", "1.3 Scientific Observer's Manual — Finfish Fisheries 2026", `
  ${fileTag("e-SISO Manual Finfish Fisheries 2026.pdf")}
  ${p("Основне робоче керівництво наукового спостерігача SISO. Структура (17 розділів + 4 додатки):")}
  ${table(["№","Розділ"], sisoManualTOC)}
  ${p("Історія версій: 2011 (оригінал) → 2019 Draft → 2020 → 2020a (уточнення травм птахів) → 2023 (мічення скатів моря Росса) → 2026 (поточна).")}
  ${comment("Це «книга правил №1» для роботи в морі. Детальні виміри, стадії зрілості й визначення видів із цього посібника винесені в окремі розділи сайту («Визначники»), щоб не дублювати контент.")}
`);

// =====================================================================
// PAGE 02 — CONSERVATION MEASURES
// =====================================================================

const cmCategories = [
["Дотримання (серія 10)", [
  ["10-01 (2014)","Маркування риболовних суден і знарядь лову","Усі промисли"],
  ["10-02 (2022)","Ліцензування та інспекційні зобов'язання держав прапора","Усі промисли"],
  ["10-03 (2025)","Портові інспекції суден, що перевозять морські живі ресурси Антарктики","Усі промисли"],
  ["10-04 (2025)","Автоматизовані супутникові системи моніторингу суден (VMS)","Усі промисли"],
  ["10-05 (2022)","Схема документування вилову (CDS) для Dissostichus spp.","Dissostichus spp."],
  ["10-06 (2016)","Схема сприяння дотриманню правил суднами Договірних Сторін","Усі промисли"],
  ["10-07 (2016)","Схема сприяння дотриманню правил суднами держав, що не є Сторонами","Усі промисли"],
  ["10-08 (2017)","Схема сприяння дотриманню правил громадянами Договірних Сторін","Усі промисли"],
  ["10-09 (2025)","Система повідомлень про перевантаження в районі дії Конвенції","Усі промисли"],
  ["10-10 (2023)","Процедура оцінки дотримання CCAMLR","Усі промисли"]
]],
["Загальні питання промислу (серія 20)", [
  ["21-01 (2019)","Повідомлення про намір розпочати новий промисел","Нові промисли"],
  ["21-02 (2025)","Пошукові (exploratory) промисли","Усі пошукові промисли"],
  ["21-03 (2023)","Повідомлення про намір участі у промислі Euphausia superba (криль)","Промисел криля"],
  ["22-01 (1986)","Регулювання вимірювання розміру вічка сітки","Доповнює CM 22-02"],
  ["22-02 (1984)","Розмір вічка сітки","D. eleginoides та інші нототенієві"],
  ["22-03 (1990)","Розмір вічка для Champsocephalus gunnari","C. gunnari"],
  ["22-04 (2010)","Тимчасова заборона глибоководного зябрового лову","Зяброві промисли"],
  ["22-05 (2008)","Обмеження на донне тралення у відкритому морі району Конвенції","Донні тралові промисли"],
  ["22-06 (2019)","Донний промисел у районі дії Конвенції (заходи щодо ВМЕ)","Донні промисли"],
  ["22-07 (2013)","Тимчасовий захід для донного промислу при виявленні потенційних ВМЕ","Донні промисли"],
  ["22-08 (2009)","Заборона промислу Dissostichus spp. на глибині менше 550 м у пошукових промислах","Пошукові промисли"],
  ["22-09 (2012)","Захист зареєстрованих ВМЕ у підрайонах/районах, відкритих для донного промислу","Різні промисли"],
  ["23-01 (2024)","Система 5-денної звітності про вилов та зусилля","Різні промисли"],
  ["23-02 (2016)","Система 10-денної звітності","Різні промисли"],
  ["23-03 (2016)","Система щомісячної звітності","Різні промисли"],
  ["23-04 (2016)","Щомісячна дрібномасштабна звітність (трал, ярус, пастки)","Усі, крім промислу криля"],
  ["23-06 (2022)","Система звітності для промислу Euphausia superba","Промисел криля"],
  ["23-07 (2016)","Система щоденної звітності для пошукових промислів","Пошукові промисли (крім криля)"],
  ["24-01 (2023)","Застосування заходів зі збереження до наукових досліджень","Усі промисли"],
  ["24-02 (2014)","Обважнення ярусу для збереження морських птахів","Ярусні промисли"],
  ["24-04 (2017)","Тимчасові особливі райони наукових досліджень у зонах відступу шельфового льоду","Підрайони 48.1, 48.5, 88.3"],
  ["24-05 (2025)","Промисел для дослідницьких цілей у сезоні 2025/26 (за CM 24-01)","Усі промисли"],
  ["25-02 (2024)","Мінімізація випадкової смертності морських птахів під час ярусного лову","Ярусні промисли"],
  ["25-03 (2024)","Мінімізація випадкової смертності птахів і ссавців під час тралового лову","Тралові промисли"],
  ["26-01 (2022)","Загальний захист довкілля риболовними суднами","Усі промисли"]
]],
["Промислові заходи: загальні (серія 30)", [
  ["31-01 (1986)","Регулювання промислу навколо Південної Джорджії (підрайон 48.3)","Усі дозволені види"],
  ["31-02 (2007)","Загальний захід закриття всіх промислів","Усі промисли"],
  ["32-01 (2001)","Промислові сезони","Усі промисли"],
  ["32-02 (2017)","Заборона спрямованого промислу окремих видів","Різні види"],
  ["32-09 (2025)","Заборона спрямованого промислу Dissostichus spp., крім передбачених заходів, сезон 2025/26","Dissostichus spp."],
  ["32-18 (2006)","Збереження акул","Акули"]
]],
["Ліміти прилову (серія 33)", [
  ["33-01 (1995)","Ліміт прилову у підрайоні 48.3 (5 видів нототеній та ін.)","Напр., G. gibberifrons 1470 т, C. aceratus 2200 т"],
  ["33-02 (2025)","Ліміт прилову у поділі 58.5.2, сезон 2025/26","C. rhinoceratus 1663 т, Macrourus spp. 409/360 т, скати 120 т"],
  ["33-03 (2025)","Ліміт прилову в нових і пошукових промислах, сезон 2025/26","Скати, Macrourus spp. та ін."]
]],
["Іклач — Dissostichus spp. (серія 41)", [
  ["41-01 (2025)","Загальні заходи для пошукових промислів Dissostichus spp., сезон 2025/26","Усі пошукові промисли"],
  ["41-03 (2025)","Ліміти промислу в підрайоні 48.4, сезон 2025/26","D. eleginoides 33 т, D. mawsoni 32 т"],
  ["41-04 (2025)","Ліміти пошукового промислу D. mawsoni в підрайоні 48.6","713 т"],
  ["41-05 (2025)","Ліміти пошукового промислу D. mawsoni в поділі 58.4.2","281 т"],
  ["41-06 (2025)","Ліміти пошукового промислу D. eleginoides на банці Елан (58.4.3a)","0 т"],
  ["41-07 (2025)","Ліміти пошукового промислу D. mawsoni на банці БАНЗАРЕ (58.4.3b)","0 т"],
  ["41-08 (2024)","Ліміти промислу D. eleginoides у поділі 58.5.2, сезони 2024/25–2025/26","2120 т/сезон"],
  ["41-09 (2025)","Ліміти пошукового промислу D. mawsoni в підрайоні 88.1, сезон 2025/26","3278 т"],
  ["41-10 (2025)","Ліміти пошукового промислу D. mawsoni в підрайоні 88.2, сезон 2025/26","1624 т"],
  ["41-11 (2025)","Ліміти D. mawsoni у поділі 58.4.1, сезон 2025/26","0 т — закрито для спрямованого промислу"]
]],
["Крижана риба (серія 42)", [
  ["42-01 (2025)","Ліміти промислу Champsocephalus gunnari у підрайоні 48.3, сезони 2025/26–2026/27","3430 т / 2230 т"],
  ["42-02 (2025)","Ліміти промислу C. gunnari у поділі 58.5.2, сезони 2025/26–2026/27","1429 т / 1126 т"]
]],
["Криль (серія 51)", [
  ["51-01 (2024)","Пересторожні ліміти вилову Euphausia superba у підрайонах 48.1–48.4","5,61 млн т, тригер 620 000 т"],
  ["51-02 (2024)","Ліміт вилову Euphausia superba у поділі 58.4.1","440 000 т"],
  ["51-03 (2024)","Ліміт вилову Euphausia superba у поділі 58.4.2","2 645 000 т"],
  ["51-04 (2025)","Загальний захід для пошукових промислів Euphausia superba, сезон 2025/26","Усі пошукові промисли"],
  ["51-06 (2019)","Загальний захід наукового спостереження на промислах Euphausia superba","—"]
]],
["Охоронювані території (серія 90)", [
  ["91-01 (2004)","Процедура надання захисту ділянкам CEMP","—"],
  ["91-02 (2024)","Захист цінностей особливо керованих і охоронюваних районів Антарктики","—"],
  ["91-03 (2009)","Захист південного шельфу Південних Оркнейських островів","—"],
  ["91-04 (2011)","Загальні рамки створення морських охоронних районів CCAMLR","—"],
  ["91-05 (2016)","Морський охоронний район моря Росса","—"]
]]
];

const resolutionsList = [
"7/IX — дрифтерний промисел у районі дії Конвенції",
"10/XII — вилов запасів, що зустрічаються як у межах, так і поза межами району дії Конвенції",
"14/XIX — Схема документування вилову: впровадження державами, що приєдналися, та не-Сторонами",
"15/XXII — використання портів, що не впроваджують Схему документування вилову",
"16/XIX — застосування VMS у Схемі документування вилову",
"17/XX — використання VMS для верифікації даних CDS поза районом дії Конвенції",
"18/XXI — вилов D. eleginoides поза юрисдикцією прибережних держав (райони ФАО 51 і 57)",
"19/XXI — прапори недотримання правил",
"20/XXII — стандарти льодового підкріплення суден для високоширотних промислів",
"22/XXV — міжнародні дії для зниження випадкової смертності морських птахів",
"23/XXIII — безпека на борту суден, що ведуть промисел у районі дії Конвенції",
"25/XXV — протидія ННН-промислу суднами прапорів держав, що не є Сторонами",
"27/XXVII — використання окремої тарифної класифікації для антарктичного криля",
"28/XXVII — обмін баластних вод у районі дії Конвенції",
"29/XXVIII — ратифікація Конвенції про рятування Членами CCAMLR",
"30/XXVIII — зміна клімату",
"31/XXVIII — найкраща доступна наука",
"32/XXIX — запобігання, стримування та ліквідація ННН-промислу",
"33/XXX — надання інформації про судна прапора морським рятувально-координаційним центрам",
"34/XXXI — підвищення безпеки риболовних суден у районі дії Конвенції",
"35/XXXIV — судна без національності",
"36/41 — зміна клімату"
];

const page02 = section("schedule-intro", "2.1 Розклад чинних заходів зі збереження 2025/26", `
  ${fileTag("EN - schedule 2025-26.pdf")}
  ${p("Документ (понад 15 000 рядків, 366 сторінок) ухвалений на 44-му засіданні Комісії (20–31 жовтня 2025 р.). Кожен захід має унікальний код: перші дві цифри — категорія, другі дві — номер у категорії, рік у дужках — рік ухвалення версії, напр. <strong>22-06 (2010)</strong>. Нові чи змінені заходи повідомляються на початку листопада, набирають чинності зазвичай 1 грудня, а стають обов'язковими (ст. IX.6 Конвенції) приблизно через 180 днів (травень наступного року).")}
  ${img("images/map/map_p-1.jpg", "Карта конвенційних підрайонів 88.1 та 88.2 (море Росса й прилеглі води)", "wide")}
`) +
cmCategories.map(([cat, rows]) => section("cm-"+cat.replace(/\W+/g,'-'), cat, table(["№ CM","Назва","Застосування / ліміт"], rows))).join("") +
section("resolutions", "2.2 Чинні резолюції Комісії", ul(resolutionsList)) +
section("cm-comment", "Підсумок", comment("Це найважливіший документ пакету з погляду юридичної відповідальності: ліміти вилову за підрайонами (серія 41 — іклач, 42 — крижана риба, 51 — криль) щороку змінюються, тож саме ці цифри (а не заходи попередніх сезонів) визначають легальність вилову в конкретному рейсі 2025/26."));

// =====================================================================
// PAGE 03 — MAIN FORMS
// =====================================================================

const enC2Sheets = [
["Introduction","Опис призначення журналу та переліку аркушів"],
["Vessel and Gear","IMO, назва судна, прапор, позивний, наглядач SISO, тип ярусу, тип головної лінії"],
["Set and Haul Details","Приманка (до 3 типів), координати/час постановки й виборки (UTC), довжина лінії, кількість гачків, пристрій виключення китоподібних"],
["Haul Catch","Код виду, утримано/викинуто/випущено живим, втрачено на поверхні, випадковий вилов — зелена вага та кількість (з мітками/без)"],
["Conversion Factors","Код виду, код переробки, коефіцієнт переведення, тип розрізу, вага продукту/зелена вага"],
["Tagging","До 3 ідентифікаторів міток, тип/колір/напис мітки, координати випуску, довжина/розмах крил, стать, код травми ската"],
["Tag Recapture","Дані про повторний вилов: до 3 міток на рибу, довжина, стадія зрілості, вага гонад, стан місця мітки, збережені зразки"],
["VME Data","Середина сегмента лінії, глибина, загальний об'єм (л), вага (кг), кількість одиниць-індикаторів ВМЕ"],
["CCAMLR codes","Довідкові коди: тип промислу (C/R/S/N), підрайони/поділи, повний перелік кодів видів вилову (553 записи)"]
];

const speciesCodesCurated = [
["TOA","Dissostichus mawsoni","Антарктичний іклач (цільовий вид)"],
["TOP","Dissostichus eleginoides","Патагонський іклач (цільовий вид)"],
["TOT","Dissostichus spp","Іклач, невизначений до виду"],
["GRV","Macrourus spp","Довгохвости (родина Macrouridae), nei"],
["QMC","Macrourus caml","Довгохвіст Macrourus caml"],
["WGR","Macrourus whitsoni","Довгохвіст Вітсона"],
["MCH","Macrourus holotrachys","Великоокий довгохвіст"],
["MCC","Macrourus carinatus","Гребенястий довгохвіст"],
["ANT","Antimora rostrata","Синя антимора"],
["MRL","Muraenolepis spp","Мурени-тріскові, nei"],
["MVC","Muraenolepis marmorata","Мармурова мурена-тріскова"],
["CHW","Chionobathyscus dewitti","Крижана риба Девітта"],
["ICX","Channichthyidae","Крокодилові крижані риби, nei"],
["ANI","Champsocephalus gunnari","Макрелева крижана риба"],
["LIC","Channichthys rhinoceratus","Одноріг (крижана риба)"],
["TRT","Trematomus spp","Трематомус, nei"],
["POG","Pogonophryne spp","Плундерфіш (бородаті вудильники), nei"],
["SRR","Amblyraja georgiana","Антарктичний зірчастий скат"],
["BAM","Bathyraja maccaini","Скат Мак-Кейна"],
["BEA","Bathyraja eatonii","Скат Ітона"],
["BYE","Bathyraja meridionalis","Темночеревий скат"],
["BYG","Bathyraja griseocauda","Сіровохвостий скат"],
["RAJ","Rajidae","Скати, nei"],
["ELN","Electrona antarctica","Антарктична світлякова рибка"],
["ELC","Electrona carlsbergi","Субантарктична світлякова рибка"],
["MZZ","Actinopterygii","Морські риби, nei (загальний код)"]
];

const page03 = section("c2form", "3.1 Форма електронного ярусного журналу en_C2v2026a", `
  ${fileTag("en_C2_2026a.xlsx")}
  ${p("Робоча книга спостерігача складається з 9 аркушів — саме цей файл заповнюється безпосередньо в морі:")}
  ${table(["Аркуш","Ключові поля"], enC2Sheets)}
  ${h3("Витяг з довідника видових кодів CCAMLR (аркуш «CCAMLR codes», 553 записи)")}
  ${p("Вибірка кодів, що безпосередньо стосуються цільових видів та видів, згаданих в інших документах пакету (зокрема, у файлі «риба.doc», див. розділ «Визначники»):")}
  ${table(["Код","Наукова назва","Українська/загальна назва"], speciesCodesCurated)}
  ${comment("Повний перелік із 553 видових кодів зберігається в самому файлі en_C2_2026a.xlsx (аркуш «CCAMLR codes»). Відтворювати його повністю на сайті недоцільно — швидше знайти конкретний код прямим пошуком у самому Excel-файлі.")}
`) +
section("cruise-report", "3.2 Звіт про рейс наукового спостерігача 2026", `
  ${fileTag("CCAMLR Scientific Observer Longline Vessel Cruise Report 2026.docx")}
  ${p("Конфіденційний документ, що подається Секретаріату CCAMLR та Комісару держави прапора судна. Складається з 16 таблиць:")}
  ${ol([
    "Загальні дані спостерігача, судна, типу знаряддя",
    "Підсумок рейсу (описова частина)",
    "Деталі перерви рейсу — якщо було коротке заходження в порт",
    "Промислові операції: стратегія лову, порівняння з нотифікацією CCAMLR",
    "Втрачені знаряддя лову — довжина лінії, поплавці, бобіни",
    "Деталі вилову (усі види) — оцінка зеленої ваги",
    "Деталі переробки — коефіцієнти переведення",
    "Біологічні зразки — типи, місце зберігання",
    "Методологія субвибірки, мічення",
    "Взаємодія з морськими птахами: стример-лінії, пристрій відлякування, поводження з відходами переробки",
    "Заплутування морських птахів та зразки, кільцювання птахів",
    "Взаємодія з морськими ссавцями: заходи пом'якшення, заплутування, втрата риби через депредацію",
    "Відходи та сміття: процедури утилізації, морське сміття",
    "Спостереження суден і знарядь ННН-промислу",
    "Додаткова інформація: операційні проблеми, завдання спостерігача, освітні матеріали на борту"
  ])}
  ${comment("Це офіційний документ compliance-звітності — формулювання щодо потенційних порушень мають бути точними й фактологічними. Перед відправкою слід звірити цей звіт із електронним журналом на предмет узгодженості даних.")}
`) +
section("movement", "3.3 Довідник переміщення суден — Annex 10-04/A", `
  ${fileTag("EN - Movement_10-04 Annex A.xlsx")}
  ${p("Визначає обов'язкові поля при вході/виході судна з підрайону: позивний, номер IMO, назва судна, координати, дата й час (UTC), підрайон входу/виходу, вид діяльності. Містить перелік із <strong>82 суден</strong>-ярусоловів з номерами IMO, позивними та прапорами держав, а також повний перелік статистичних підрайонів і поділів: 41.2, 41.3, 48.1–48.6, 58.4, 58.5, 58.6, 58.7, 88.1–88.3, а також їхні дрібніші поділи (41.2.3, 41.3.1-2, 58.4.1-4, 58.5.1-2 тощо) і статистичні райони ФАО 41, 47, 51, 57, 71, 81, 87.")}
`) +
section("tagcalc", "3.4 Калькулятор статистики перекриття мічення v2026", `
  ${fileTag("CCAMLR Tag Overlap Statistic Calculator_v2026.xlsm")}
  ${p("Розраховує 'статистику перекриття мічення' (θ) — показник відповідності розподілу довжин мічених риб розподілу довжин виловлених риб (вимога CM 41-01, Додаток C). Мінімальний поріг — <strong>60%</strong> для кожного виду Dissostichus (не застосовується, якщо позначено менше 30 риб); рекомендована мета — <strong>80%</strong>.")}
  ${h3("Порядок заповнення")}
  ${ol([
    "Скопіювати дані з аркуша «Set and Haul Details» форми C2 у аркуш калькулятора «Raw Set and Haul Details».",
    "Скопіювати дані з аркуша «Haul Catch» форми C2 у «Raw Haul Catch».",
    "Скопіювати дані з аркуша «Biological Sampling» журналу спостерігача у «Raw Biological Sampling».",
    "Скопіювати дані з аркуша «Tagging» форми C2 у «Raw Tagging» (лише значення, «paste values»).",
    "Обрати підрайон/поділ у випадному списку аркуша «Tag Overlap Statistic» (потрібні увімкнені макроси)."
  ])}
  ${p("<strong>Обмеження:</strong> максимум 250 виборок (hauls), 6000 вимірів довжини, 1000 записів мічення; фільтрація лише на рівні підрайону/поділу.")}
  ${comment("Це не інструмент щоденного заповнення, а контрольний розрахунок (раз на кілька днів), який дозволяє завчасно виявити, чи вистачає різноманіття розмірів мічених риб, поки рейс ще триває.")}
`);

// =====================================================================
// PAGE 04 — FORMS & INSTRUCTIONS
// =====================================================================

const logbookSheets = [
["Vessel and Gear","Дані судна (номер IMO, назва, позивний), характеристики знаряддя лову, деталі стример-ліній (за CM 25-02 Annex A)."],
["Set and Haul Details","Деталі кожної постановки/виборки: наскрізний унікальний номер Set/Haul ID, час у UTC, координати."],
["Observed Haul Catch","Спостереження вилову й прилову під час випадкового облікового періоду (рекомендовано 25% на спостерігача); поля хижацтва (голови/губи з ознаками хижацтва)."],
["Haul IMAF","Прилов морських птахів і ссавців під час виборки; фіксація спостережуваності, виду, долі тварини."],
["Marine Mammal Observation","Спостереження морських ссавців протягом того ж облікового періоду; ознаки депредації, чисельність (мін./макс.)."],
["Haul VME","Дані з індикаторних таксонів ВМЕ по сегментах лінії (1000 гачків або 1200 м); випадкова вибірка ~30% сегментів + усі сегменти з ≥5 одиницями-тригерами."],
["Biological Sampling","Біологічний відбір проб: довжина, вага, стать, стадія зрілості, отоліти; норма — ~7 риб/1000 гачків (35 риб на лінію), з них 10 з отолітами."],
["Conversion Factors","Тест коефіцієнта переведення: не менше 20 риб на район управління, повторювати щотижня."],
["Tagging","Мічення іклача та скатів спостерігачем або навченим членом екіпажу; умовне форматування підсвічує дублікати номерів міток."],
["Tag Recapture","Дані повторного вилову мічених риб: фотографія мітки на шаблоні-лінійці CCAMLR, біологічні виміри."],
["Waste Disposal","Втрата/скидання знарядь лову й відходів (випадково/навмисно); частота (нерегулярно/щотижня/щодня)."],
["IUU Sightings","Спостереження невідомих знарядь, сміття або суден, підозрюваних у ННН-промислі."]
];

const c2VersionHistory = [
["2022","29/09/2022","en/fr/sp/ru_C2v2022a → 2023a → 2024a,b","Оригінальна версія форми"],
["2025","вересень 2024","en/fr/sp/ru_C2v2025","Доповнення до протоколу мічення та відбору проб скатів"],
["2026","2025","en_C2v2026a (наданий файл)","Поточна робоча версія"]
];

const skateInjuryCodes = [
  ["0","Видимих ушкоджень немає"],["J","Розрив хрящів щелепи або значний розрив тканини навколо рота"],
  ["G","Кровотеча зябер на дорсальній або вентральній поверхні"],["L","Пошкодження від вошей навколо перитонеальної порожнини"],
  ["I","Пролапс кишківника понад 3 см, у т.ч. з кровотечею"],["P","Проникна травма перитонеальної порожнини"],
  ["E","Травма ока або дихальця"],["W","Незначні поверхневі травми шкіри"],
  ["B","Синці на дорсальній або вентральній стороні диска чи хвоста"],["S","Рубцева тканина навколо рота/щелепи від попередньої травми"]
];

const logbookIntroEn = `
<p>The following instructions cover the 2026 version of the CCAMLR SISO Observer Longline logbook, an excel based series of datasheets which SISO observers are required to complete. Even if you are familiar with CCAMLR excel logbooks, please take time to browse through these instructions as the format and content of the longline logbook has changed significantly from previous versions.</p>
<p>General comments that apply to the whole logbook are as follows:</p>
<ul>
<li>Data can only be entered into cells with a white background. All other areas of the logbook are locked and cannot be edited. You can fill down data for fields where repetitive information is required to be entered (for example the Haul number for each bycatch record).</li>
<li>There are numerous data validations and format restrictions that have been applied to data fields. For example the Haul ID field which exists in several worksheets can only be entered as a whole number, and date and time fields must be entered in the format specified. If you attempt to enter an incorrect data type an error message will be displayed with an explanation of why the value cannot be entered.</li>
<li>In many fields observers select from a series of predefined descriptions of the event appropriate to the data field. This replaces the single letter or number codes that were used in older versions of the logbooks. This makes the logbook much more straightforward to use.</li>
<li>Comment fields have mostly been removed from the logbook. This is to minimize the unstructured data contained in the logbook. Where comments may be required you can often select an option that refers to the cruise report, in which you can describe the issue in detail and include photos or diagrams if necessary.</li>
<li>For species and processing codes, drop down reference lists have been included at the top of the sheet, these are cells with a light green background.</li>
</ul>
<p>In addition to these instructions there is an extensive list of observer resources on the CCAMLR Observer Information webpage. In particular the common fish species bycatch guide, the toothfish and skate tagging guide, and the Vulnerable Marine Ecosystem Taxa Classification Guide should be downloaded for reference if these have not been issued to you by your technical coordinator.</p>
`;
const logbookIntroUa = `
<p>Ці інструкції охоплюють версію 2026 електронного журналу спостерігача ярусного лову CCAMLR SISO — серію таблиць Excel, які зобов'язані заповнювати спостерігачі SISO. Навіть якщо ви вже знайомі з електронними журналами CCAMLR, знайдіть час переглянути ці інструкції: формат і зміст ярусного журналу суттєво змінилися порівняно з попередніми версіями.</p>
<p>Загальні зауваження, що стосуються всього журналу:</p>
<ul>
<li>Дані можна вводити лише в клітинки з білим фоном. Усі інші області журналу заблоковані для редагування. Можна протягувати (fill down) дані для полів, де потрібно повторити однакову інформацію (наприклад, номер виборки для кожного запису прилову).</li>
<li>До полів даних застосовано численні перевірки та обмеження формату. Наприклад, поле Haul ID, наявне на кількох аркушах, можна ввести лише як ціле число, а поля дати й часу — лише у вказаному форматі. Якщо спробувати ввести неправильний тип даних, з'явиться повідомлення про помилку з поясненням, чому значення не приймається.</li>
<li>У багатьох полях спостерігачі обирають зі списку наперед визначених описів події, що відповідають полю даних. Це замінює однолітерні чи цифрові коди, які використовувалися в старіших версіях журналів, і робить журнал значно простішим у використанні.</li>
<li>Поля коментарів здебільшого прибрано з журналу, щоб мінімізувати неструктуровані дані в ньому. Там, де коментар може знадобитися, часто можна обрати варіант, що відсилає до звіту про рейс, де можна детально описати проблему й додати фото чи схеми за потреби.</li>
<li>Для кодів видів і переробки на початку аркуша розміщено випадаючі довідкові списки — це клітинки зі світло-зеленим фоном.</li>
</ul>
<p>Окрім цих інструкцій, на сторінці CCAMLR Observer Information є розширений перелік ресурсів для спостерігачів. Зокрема, рекомендується завантажити для довідки (якщо їх не надав технічний координатор): визначник поширених видів прилову, посібник з мічення іклача й скатів та Визначник таксонів вразливих морських екосистем (VME).</p>
`;

const logbookWorksheets = [
{
  title: "Vessel and Gear",
  en: `<p><strong>Vessel and Observer Details:</strong> To populate the vessel details please enter the vessel IMO number the vessel name and call sign into the appropriate cells.</p>
  <p><strong>Fishing Gear Details:</strong> Upon notification by your technical coordinator of your upcoming CCAMLR trip, the Secretariat or your technical coordinator can provide a copy of the vessel notification details which include gear type and characteristics (anyone with an authorized CCAMLR login can view vessel details on the CCAMLR website). Please check these when on board the vessel to ensure that they are correct. If there are differences in the gear type and configuration please describe them in your cruise report. Weigh at least 30 line weights at random for Spanish and Trotline gear configurations and report your results.</p>
  <p><strong>Streamer Line Details:</strong> The required configuration for streamer lines in the CCAMLR area is described in Conservation Measure 25-02 Annex A. If the streamer line(s) on the vessel conform to this configuration please fill in the required fields, and only report data in the final section (section 6) if the line is replaced during fishing, or if the streamer line does not conform to CCAMLR specifications. Figure 1 demonstrates the spacing measurements you are required to record if the line is of a non-CCAMLR configuration.</p>`,
  ua: `<p><strong>Дані судна та спостерігача:</strong> щоб заповнити дані судна, введіть номер IMO судна, назву судна та позивний у відповідні клітинки.</p>
  <p><strong>Дані знаряддя лову:</strong> після повідомлення технічного координатора про майбутній рейс CCAMLR, Секретаріат або технічний координатор можуть надати копію даних нотифікації судна, що включають тип і характеристики знаряддя (будь-хто з авторизованим логіном CCAMLR може переглянути дані суден на сайті CCAMLR). Перевірте ці дані на борту судна, щоб переконатися в їх правильності. Якщо є відмінності в типі чи конфігурації знаряддя, опишіть їх у звіті про рейс. Зважте щонайменше 30 випадково обраних вантажів лінії для конфігурацій «іспанська снасть» і «тротлайн» та повідомте результати.</p>
  <p><strong>Дані стример-лінії:</strong> необхідна конфігурація стример-ліній у зоні дії CCAMLR описана в Заході зі збереження 25-02, Додаток A. Якщо стример-лінія(ї) судна відповідає цій конфігурації, заповніть відповідні поля, і повідомляйте дані в останньому розділі (розділ 6) лише якщо лінію замінили під час промислу, або якщо стример-лінія не відповідає специфікаціям CCAMLR. Рисунок 1 демонструє виміри відстаней, які потрібно зафіксувати, якщо лінія має конфігурацію, що не відповідає CCAMLR.</p>`,
  extra: gallery([["images/logbook/lb_002.jpg","Рис. 1. Стример-лінія: висота й крок кріплення стримерів"]])
},
{
  title: "Set and Haul Details",
  en: `<p>This sheet records details for each set and haul that take place during your cruise. The field Set/Haul ID (which is also included in other worksheets as Haul ID) should be a consecutive, unique number that matches the Haul ID used by the vessel for their commercial data forms. Please fill in all other set and haul details, even if you conduct no catch, bycatch or other observations during their operation. Fill in all other fields as appropriate, selecting an option from the drop-down menus for some fields. Please note that in these forms all times are to be recorded in UTC, rather than local ship time.</p>`,
  ua: `<p>Цей аркуш фіксує деталі кожної постановки та виборки, що відбуваються протягом рейсу. Поле Set/Haul ID (яке також присутнє на інших аркушах як Haul ID) має бути послідовним унікальним номером, що збігається з Haul ID, який судно використовує у своїх комерційних формах даних. Заповніть усі інші деталі постановки й виборки, навіть якщо під час операції не було вилову, прилову чи інших спостережень. Заповніть усі інші поля відповідно до ситуації, обираючи варіант із випадаючих списків там, де це потрібно. Зверніть увагу: в цих формах увесь час записується в UTC, а не за місцевим судновим часом.</p>`
},
{
  title: "Observed Haul Catch",
  en: `<p>This sheet is for all catch and bycatch species observations that you conduct on deck during your random tally period. Because of the necessity to collect biological material (bycatch species, dead birds etc.) and observe line drop offs, the observer's work station for line hauling should obviously be situated with this in mind. The recommended observation period of a haul is 25% per observer present on the vessel. It is very important to establish a sampling routine such that observations of line-hauling operations cover varying sections of the longline throughout the cruise. The evidence of predation fields are new additions to the 2018 logbook. Specifically, the number of heads with obvious portion(s) of the body removed by predators, and hooks with just lips present on them for any species, are to be tallied for addition to these fields. This information will be used to provide metrics for quantifying the level of, and types of predation that are occurring.</p>`,
  ua: `<p>Цей аркуш призначений для всіх спостережень за виловом і приловом, які ви проводите на палубі протягом випадкового облікового періоду. Через необхідність збору біологічного матеріалу (види прилову, мертві птахи тощо) та спостереження за випадінням риби з лінії, робоче місце спостерігача під час виборки лінії, очевидно, має бути обране з урахуванням цього. Рекомендований період спостереження виборки — 25% на кожного спостерігача, присутнього на судні. Дуже важливо встановити регулярний режим вибірки так, щоб спостереження за виборкою лінії охоплювали різні секції ярусу протягом усього рейсу. Поля «ознак хижацтва» — нове доповнення журналу з 2018 року. Зокрема, потрібно підраховувати кількість голів з очевидно вилученими хижаком частинами тіла та гачки лише з губами риби (без тіла) для будь-якого виду — ці дані заносяться до відповідних полів. Ця інформація використовується для кількісної оцінки рівня та типів хижацтва, що трапляється.</p>`
},
{
  title: "Haul IMAF",
  en: `<p><strong>Seabird and marine mammal by-catch:</strong> Assessing bird catch rates during the haul can only be done accurately by observations made from the outside working deck, because on many vessels a work station on the ship's bridge or factory can obscure visibility. Data-recording tasks to be carried out during longline hauling include observations of seabirds caught on longlines and collection of seabird samples. Observers must record whether they actually sighted the bird come on board during their random bycatch tally period (by selecting yes in the observed field), or if they were given the animal, or the information, by a crew member. This information is very important as the number of seabirds caught during the random bycatch tally period are used to calculate extrapolated mortality figures.</p>
  <p>For each bird or mammal hauled on board, record if its capture was during line setting or line hauling (birds hooked during hauling are usually alive and do not have waterlogged feathers), species and fate of the animal. Refer to the identification plates for Southern Ocean seabirds given in the book Fish the Sea, Not the Sky (CCAMLR, 1996).</p>
  <p>Seabirds that are taken aboard dead may be retained as frozen samples if required by your organization. Label the sample with the date, time taken aboard, species, vessel name, observer's name and a label number which corresponds to that used on the Haul IMAF data sheet. All birds should be checked for bands upon landing. Look at your assignment issued by your employing organization for information on the handling of collected bird samples and/or bands for when you disembark the vessel.</p>`,
  ua: `<p><strong>Прилов морських птахів і ссавців:</strong> точно оцінити рівень вилову птахів під час виборки можна лише за спостереженнями із зовнішньої робочої палуби, оскільки на багатьох суднах робоче місце на містку чи в цеху обмежує видимість. Завдання з фіксації даних під час виборки ярусу включають спостереження за морськими птахами, спійманими на ярусі, та збір зразків птахів. Спостерігачі повинні фіксувати, чи вони особисто побачили, як птах потрапив на борт протягом випадкового облікового періоду прилову (обравши «так» у полі «Observed»), чи тварину/інформацію їм передав член екіпажу. Ця інформація дуже важлива, оскільки кількість морських птахів, спійманих протягом випадкового облікового періоду, використовується для розрахунку екстрапольованих показників смертності.</p>
  <p>Для кожного птаха чи ссавця, піднятого на борт, фіксуйте, чи стався вилов під час постановки чи виборки лінії (птахи, гачковані під час виборки, зазвичай живі й не мають намоклого пір'я), вид і подальшу долю тварини. Звертайтеся до таблиць визначення морських птахів Південного океану з книги «Fish the Sea, Not the Sky» (CCAMLR, 1996).</p>
  <p>Морських птахів, піднятих на борт мертвими, можна зберігати як заморожені зразки, якщо цього вимагає ваша організація. Підпишіть зразок датою, часом підйому на борт, видом, назвою судна, ім'ям спостерігача та номером етикетки, що відповідає номеру в аркуші даних Haul IMAF. Усіх птахів слід перевіряти на наявність кілець при вивантаженні. Ознайомтеся з інструкціями вашої організації-роботодавця щодо поводження зі зібраними зразками птахів та/або кільцями під час висадки із судна.</p>`
},
{
  title: "Marine Mammal Observation",
  en: `<p>This worksheet is a new addition to the observer logbook, and has been adapted from marine mammal observation programmes undertaken by national observers in the French EEZ fisheries, and around South Georgia. Marine Mammal observations should be recorded during the same random line observation period in which the Observed Haul Catch data is collected. Please fill in all appropriate fields when you conduct, or attempt to conduct a Marine Mammal Observation, not just when the presence of marine mammals is detected. Information on fields in the worksheet is as follows:</p>
  <p><strong>Observation Possible:</strong> Select no if poor weather, fog, or lack of light prevents an observation being conducted.</p>
  <p><strong>Depredation Observed:</strong> Select yes if obvious signs of depredation behaviour are being observed, or if fish are seen being hauled with obvious depredation marks. Behaviour examples might be seals diving around the line or seen taking fish, or cetaceans diving repeatedly near the line.</p>
  <p><strong>Presence or Absence:</strong> Select presence if you observe marine mammals, or if you do not sight them but can hear them (e.g. whale blows, or seals barking).</p>
  <p><strong>Time first observed:</strong> Please enter the time in UTC of the first marine mammal observation.</p>
  <p><strong>Species Code:</strong> Please enter the lowest taxonomic species code to which you can identify mammals, e.g. enter baleen whales if that is all you can identify.</p>
  <p><strong>Minimum and Maximum numbers observed:</strong> This is to provide an estimate of abundance for each observation of marine mammal activity. Therefore if you initially see one mammal during your observation, and then observe several animals, enter the minimum and maximum numbers.</p>`,
  ua: `<p>Цей аркуш — нове доповнення до журналу спостерігача, адаптоване з програм спостереження за морськими ссавцями, які проводили національні спостерігачі в риболовних зонах Франції (виключна економічна зона) та навколо Південної Джорджії. Спостереження за морськими ссавцями слід фіксувати протягом того самого випадкового облікового періоду лінії, під час якого збираються дані Observed Haul Catch. Заповнюйте всі відповідні поля щоразу, коли ви проводите або намагаєтеся провести спостереження за морськими ссавцями, а не лише тоді, коли виявлено їх присутність. Пояснення полів аркуша:</p>
  <p><strong>Observation Possible (спостереження можливе):</strong> оберіть «ні», якщо погана погода, туман або недостатнє освітлення унеможливлюють проведення спостереження.</p>
  <p><strong>Depredation Observed (спостережено хижацтво):</strong> оберіть «так», якщо спостерігаються явні ознаки хижацької поведінки, або якщо піднята риба має очевидні сліди хижацтва. Приклади поведінки: тюлені пірнають біля лінії або їх бачили, як вони забирають рибу, або китоподібні неодноразово пірнають поблизу лінії.</p>
  <p><strong>Presence or Absence (наявність/відсутність):</strong> оберіть «наявність», якщо ви спостерігаєте морських ссавців, або якщо не бачите їх, але чуєте (наприклад, видих кита чи гавкіт тюленів).</p>
  <p><strong>Time first observed (час першого спостереження):</strong> введіть час у UTC першого спостереження морського ссавця.</p>
  <p><strong>Species Code (код виду):</strong> введіть найнижчий таксономічний рівень, до якого можете визначити ссавця, наприклад «вусаті кити», якщо точніше визначити не вдається.</p>
  <p><strong>Minimum and Maximum numbers observed (мінімальна й максимальна чисельність):</strong> це оцінка чисельності для кожного спостереження активності морських ссавців. Тобто якщо спочатку ви побачили одну тварину, а потім кілька — введіть мінімальне й максимальне число.</p>`
},
{
  title: "Haul VME",
  en: `<p>This sheet is for recording data on Vulnerable Marine Ecosystem (VME)-indicator organisms where required under Conservation Measure 22-06. The vessel is required to divide each longline or pot line into line segments: "Line segment" means a 1 000-hook section of line or a 1200m section of line, whichever is the shorter, and for pot lines a 1200m section. It is strongly recommended that a colour-coding or other system is used for marking each line section, so that crew, master and observer are able to tell which line segment is being hauled.</p>
  <p>The vessel will retain all VME-indicator organisms for each line segment in the 10-litre bucket. Some vessels may be able to retain the contents of each bucket for every line segment. Where this is not the case and unless the bucket needs to be retained (i.e. if it has more than 5 VME-indicator units of VME-indicator organisms or if the observer has requested it as part of their random sample) the vessel may place its contents into a larger bin after hauling each line segment, in order that the total number of VME-indicator organisms can be counted.</p>
  <p>The observed bucket unit should be selected from the drop-down menu. A VME-indicator unit means a quantity of VME-indicator organisms of those found in the CCAMLR VME Taxa Classification Guide, measured as either one litre for those VME-indicator organisms that can be placed in a 10 litre container; or one kilogram of those VME-indicator organisms that do not fit into a volume measurement, such as branching species (e.g. Gorgonians). Please note that because of the new design of the VME sheet, if you record multiple species on a line segment, all of the yellow fields on the worksheet are repeated for each recorded taxa. You can easily copy and fill down the data for each species.</p>
  <p>The observer should sample the following buckets: (i) a random sample of approximately 30% of the line segments; and (ii) every line segment that collects 5 or more VME-indicator units of VME-indicator organisms, known as the trigger level. In order to separate the requirements of random sampling from trigger sampling, observers should inform the crew at the start of a line hauling period of the individual random line segments for which a bucket of VME-indicator organisms should be retained. Each randomly sampled bucket should be put to one side by the crew, and clearly labelled by its line segment number. The master should be informed of the random sample requirements, so that the mid-point coordinates of the requested random line segments can be recorded in your logbook. All these buckets should be examined by the observer as part of the random sample and entered as "Random" in the Sample Type field on the form. In addition the observer should require the crew to retain buckets from any other line segment where more than 5 VME-indicator units of VME-indicator organisms were recovered. All line segments from which 5 or more VME-indicator units of VME-indicator organisms were recovered will need to be monitored. All of these buckets should also be set aside by the crew and clearly labelled by its line segment number, so that the mid-point of the line segment can be recorded and will need to be examined by the observer and entered as sample type "Trigger" on the form. Do not confuse random and required sampling. If a random sample happens to be greater than 5 VME-indicator units, still enter on the form as 'random'.</p>`,
  ua: `<p>Цей аркуш призначений для запису даних про організми-індикатори вразливих морських екосистем (ВМЕ) там, де це вимагається Заходом зі збереження 22-06. Судно зобов'язане поділити кожен ярус чи лінію пасток на сегменти лінії: «сегмент лінії» означає секцію лінії на 1000 гачків або секцію 1200 м (яка коротша), а для ліній пасток — секцію 1200 м. Наполегливо рекомендується використовувати кольорове маркування чи іншу систему позначення кожної секції лінії, щоб екіпаж, капітан і спостерігач могли визначити, який сегмент лінії виводиться.</p>
  <p>Судно зберігає всі організми-індикатори ВМЕ з кожного сегмента лінії в 10-літровому відрі. Деякі судна можуть зберігати вміст кожного відра для кожного сегмента лінії. Якщо це неможливо і відро не потрібно зберігати (тобто якщо в ньому менше 5 одиниць-індикаторів ВМЕ або спостерігач не запросив його як частину випадкової вибірки), судно може перекласти вміст у більший контейнер після виборки кожного сегмента лінії, щоб можна було порахувати загальну кількість організмів-індикаторів ВМЕ.</p>
  <p>Спостережувану одиницю відра слід обирати з випадаючого списку. Одиниця-індикатор ВМЕ означає кількість організмів-індикаторів ВМЕ з переліку у Визначнику таксонів ВМЕ CCAMLR, виміряну або як 1 літр для тих організмів, що вміщуються в 10-літровий контейнер, або як 1 кілограм для тих, що не піддаються об'ємному виміру, наприклад, гіллястих видів (наприклад, горгонарій). Зверніть увагу: через новий дизайн аркуша VME, якщо ви фіксуєте кілька видів на одному сегменті лінії, усі жовті поля аркуша повторюються для кожного зафіксованого таксона. Дані для кожного виду можна легко скопіювати й протягнути.</p>
  <p>Спостерігач повинен відібрати проби з таких відер: (i) випадкова вибірка приблизно 30% сегментів лінії; та (ii) кожен сегмент лінії, з якого зібрано 5 або більше одиниць-індикаторів ВМЕ — це називається тригерним рівнем. Щоб розділити вимоги випадкової та тригерної вибірки, спостерігачам слід повідомляти екіпаж на початку періоду виборки лінії про конкретні випадкові сегменти лінії, з яких потрібно зберегти відро з організмами-індикаторами ВМЕ. Кожне відро випадкової вибірки екіпаж повинен відкласти окремо й чітко підписати номером сегмента лінії. Капітана слід повідомити про вимоги випадкової вибірки, щоб координати середини запитаних випадкових сегментів лінії можна було зафіксувати в журналі. Усі ці відра має оглянути спостерігач як частину випадкової вибірки та внести в поле «Sample Type» форми як «Random». Крім того, спостерігач повинен вимагати від екіпажу зберігати відра з будь-якого іншого сегмента лінії, де було зібрано понад 5 одиниць-індикаторів ВМЕ. Усі сегменти лінії, з яких зібрано 5 або більше одиниць-індикаторів ВМЕ, потрібно контролювати. Ці відра екіпаж також повинен відкласти окремо й чітко підписати номером сегмента лінії, щоб можна було зафіксувати середину сегмента; їх має оглянути спостерігач і внести в поле «Sample Type» як «Trigger». Не плутайте випадкову та обов'язкову (тригерну) вибірку. Якщо випадкова проба виявилася більшою за 5 одиниць-індикаторів, все одно вносьте її в форму як «random».</p>`
},
{
  title: "Biological Sampling",
  en: `<p>A representative sample of fish should be taken from each haul to record biological data characteristics (e.g. length, weight, sex, etc.). Sampling requirements for toothfish described here can be found on the observer sampling requirements webpage.</p>
  <p>The guide on the sampling rate for toothfish should be approximately 7 fish per 1000 hooks, or an overall total of 35 fish per line (assuming an average line of 5 000 hooks). Of these 35 fish, observers should sample 10 fish per line recording species, total length, sex, gonad stage, total weight and collecting 10 otoliths; and 25 fish per line recording just the biological measurements (i.e. not collecting otoliths). The sampling rates are based on an average number of hooks per set. When vessels set shorter lines with a 'join line' (e.g. to reduce the number of downlines and buoys on the surface that could be caught in ice), they are now required to report them as a single haul, therefore the sampling requirements should also treat joined short lines as if they are one single continuous piece of fishing gear.</p>
  <p>To collect a representative sample of all other species, select fish that cover the whole size range of each species caught. If possible sample up to 10 individuals per day for each bycatch species, or up to 100 individuals per bycatch species for your cruise. To estimate the number and location on the line of hooks relating to each Dissostichus spp. sub-sample, the number, or range of the baskets, trots or magazines numbers relating to where the bycatch fish are being sampled from must be recorded. Baskets, trots and magazines should be numbered from 1, where 1 is the first basket, trot or magazine set. It is very important to sample all sections of the longline throughout your cruise.</p>
  <p>For all fish measurements ensure that the snout of the fish is butted up to the end of the measuring board, the mouth is closed and the body is straight. If possible record the weight, sex and maturity stage for each individual sampled, and if otoliths are collected ensure they have a unique serial number. Fields are provided for any biological samples that are taken from fish. Please note the fish serial number field in column D is optional, and is provided for the observer's benefit as serial numbers are often used when recording measurements and taking samples.</p>
  <p>For Toothfish (and most other fish with a distinct tail) measure for standard (SL) and total length (TL). Standard length (SL) is measured from the most anterior part of the snout to the end of the vertebral column. An easy way to determine SL is to bend the tail upwards and a crease will form at the point of the last caudal vertebra. Total length (TL) is defined as the distance from the most anterior part of the snout to the furthest tip of the tail. Lightly 'streamline' the tail before measuring: i.e. the tail should not be spread to its extreme, nor completely compressed.</p>
  <p>For Macrourus spp. total length and snout to anus (SA) length should also be measured from the tip of the snout to the anus. For skates and rays the wingspan (WS) total length should also be measured.</p>
  <p>For cruises conducted in Subareas 88.1 and 88.2 SSRUs A &amp; B, to contribute to the Ross Sea Data Collection plan observers are requested to record injuries from biologically sampled skate species, as well as skates that are tagged and released, and recaptured. Up to three injury fields can be completed using the skate injury codes (see table below).</p>`,
  ua: `<p>Репрезентативну вибірку риби слід брати з кожної виборки для фіксації біологічних характеристик (довжина, вага, стать тощо). Вимоги до відбору проб іклача описані на сторінці вимог до вибірки спостерігача на сайті CCAMLR.</p>
  <p>Орієнтовна норма відбору проб іклача — приблизно 7 риб на 1000 гачків, або загалом 35 риб на лінію (за умови середньої лінії на 5000 гачків). З цих 35 риб спостерігачі мають відібрати 10 риб на лінію з повним записом виду, загальної довжини, статі, стадії зрілості гонад, загальної ваги та відбором 10 отолітів; і 25 риб на лінію лише з біологічними промірами (без відбору отолітів). Норми відбору базуються на середній кількості гачків на постановку. Якщо судна ставлять коротші лінії, з'єднані «join line» (наприклад, щоб зменшити кількість вертикальних лінок і буїв на поверхні, які може захопити лід), тепер їх потрібно звітувати як одну виборку, тому вимоги до відбору проб також слід застосовувати до з'єднаних коротких ліній як до єдиного суцільного знаряддя лову.</p>
  <p>Щоб зібрати репрезентативну вибірку всіх інших видів, обирайте рибу, що охоплює весь діапазон розмірів кожного впійманого виду. За можливості відбирайте до 10 екземплярів на день для кожного виду прилову, або до 100 екземплярів на вид прилову за весь рейс. Щоб оцінити кількість і розташування на лінії гачків, що стосуються кожної суб-вибірки Dissostichus spp., потрібно фіксувати номер або діапазон номерів кошиків, тротів чи магазинів, звідки відбирається риба прилову. Кошики, троти й магазини нумеруються з 1, де 1 — перший поставлений кошик, трот чи магазин. Дуже важливо відбирати проби з усіх секцій ярусу протягом усього рейсу.</p>
  <p>Для всіх промірів риби переконайтеся, що писок риби впирається в кінець вимірювальної дошки, рот закритий, а тіло випрямлене. За можливості фіксуйте вагу, стать і стадію зрілості для кожного відібраного екземпляра, а якщо відбираються отоліти — переконайтеся, що вони мають унікальний серійний номер. Передбачені поля для будь-яких біологічних зразків, взятих з риби. Зверніть увагу: поле серійного номера риби в колонці D необов'язкове й надається для зручності спостерігача, оскільки серійні номери часто використовуються під час записування промірів і взяття зразків.</p>
  <p>Для іклача (і більшості інших риб з чітко вираженим хвостом) вимірюйте стандартну (SL) і загальну (TL) довжину. Стандартна довжина (SL) вимірюється від найпереднішої точки писка до кінця хребетного стовпа. Простий спосіб визначити SL — злегка зігнути хвіст догори: складка утвориться в точці останнього хвостового хребця. Загальна довжина (TL) визначається як відстань від найпереднішої точки писка до найдальшого кінчика хвоста. Перед виміром злегка «випрямте» хвіст: він не повинен бути ні максимально розправленим, ні повністю стиснутим.</p>
  <p>Для Macrourus spp. також слід виміряти загальну довжину та довжину від писка до анусу (SA) — від кінчика писка до анального отвору. Для скатів і промениць також слід виміряти загальну довжину за розмахом крил (WS).</p>
  <p>Для рейсів у підрайонах 88.1 та 88.2 SSRU A і B, з метою внеску в план збору даних моря Росса, спостерігачів просять фіксувати травми біологічно відібраних видів скатів, а також скатів, яких мітять і випускають, і повторно виловлених. Можна заповнити до трьох полів травм, використовуючи коди травм скатів (див. таблицю нижче).</p>`,
  extra: gallery([
    ["images/logbook/lb_003.jpg","Рис. 1. Вимір іклача: стандартна (SL) і загальна (TL) довжина"],
    ["images/logbook/lb_004.jpg","Рис. 2. Вимір Macrourus spp.: довжина від писка до анусу (SA) і TL"],
    ["images/logbook/lb_005.jpg","Рис. 3. Вимір скатів: розмах крил (WS) і TL"],
    ["images/logbook/lb_007.jpg","Рис. 4. Коди травм скатів"]
  ]) + h3("Коди травм скатів (Рис. 4)") + table(["Код","Опис"], skateInjuryCodes)
},
{
  title: "Conversion Factors",
  en: `<p>The recommended sampling protocol is to sample at least 20 fish from a haul when (or soon after) entering a management area (any area with a specified catch limit which can be a research block, SSRU or Subarea), and repeating this at least once per week if remaining within this area. To accurately record the measurements for processed fish that you sample adopt the following procedure:</p>
  <ol>
  <li>Record total length and weight of each toothfish to be processed. Length measurements should be taken on the midline of the fish from the tip of the snout to the tail. Fish should be weighed on a motion compensated scale and water must be drained from the stomach prior to weighing (use a sharp knife or tube to achieve this). Weight is recorded in the green weight column.</li>
  <li>Allow the processing crew to cut the fish in the manner adopted by the vessel, then weigh the processed fish and enter into the processed weight column. The worksheet will automatically calculate the conversion factor.</li>
  <li>Complete the rest of the fields on the conversion factor sheet, using the drop-down menus for fields where appropriate. The Grade will be a product quality code used by the factory manager. A description of the grades used during your cruise can be completed in the conversion factor section of your cruise report.</li>
  </ol>`,
  ua: `<p>Рекомендований протокол відбору проб — відбирати щонайменше 20 риб з виборки під час (або невдовзі після) входу в район управління (будь-який район з визначеним лімітом вилову — дослідницький блок, SSRU чи підрайон), і повторювати це щонайменше раз на тиждень, якщо судно залишається в цьому районі. Щоб точно зафіксувати проміри переробленої риби з вибірки, дотримуйтеся такої процедури:</p>
  <ol>
  <li>Зафіксуйте загальну довжину й вагу кожного іклача, призначеного для переробки. Проміри довжини слід брати по середній лінії риби від кінчика писка до хвоста. Рибу слід зважувати на вазі з компенсацією руху судна, а перед зважуванням обов'язково злити воду зі шлунка (гострим ножем або трубкою). Вага записується в колонку «зелена вага» (green weight).</li>
  <li>Дозвольте обробній бригаді розрізати рибу у спосіб, прийнятий на судні, потім зважте перероблену рибу й внесіть значення в колонку «вага продукту» (processed weight). Аркуш автоматично розрахує коефіцієнт переведення.</li>
  <li>Заповніть решту полів аркуша коефіцієнтів переведення, використовуючи випадаючі списки там, де це доречно. «Grade» — код якості продукту, що використовується технологом цеху. Опис ґрейдів, використаних протягом рейсу, можна навести в розділі коефіцієнтів переведення звіту про рейс.</li>
  </ol>`
},
{
  title: "Tagging",
  en: `<p>A SISO observer or appropriately trained crew member on each longline vessel should tag and release toothfish. As the vessel is responsible for ensuring tagging and tag recovery protocols are correctly followed, several crew will most likely be trained in tagging procedures, however the vessel is expected to cooperate with the observer if you feel the procedures are not being undertaken correctly. Any tagging procedures should follow the CCAMLR toothfish and skate tagging guide and the tagging protocol detailed in Appendix 4 of the SISO Manual – Finfish Fisheries. Fish should never be tagged and released if any of the following characteristics are present:</p>
  <ul>
  <li>Hook injuries are present anywhere on body other than in mouth area</li>
  <li>Gills are pink or white</li>
  <li>Gills have visible bleeding, or if excessive bleeding is present anywhere on fish</li>
  <li>There is visible damage to fish body with open wounds</li>
  <li>There is visible damage to eye or penetration of body cavity, including by crustaceans (amphipods/lice)</li>
  <li>Abrasions or recent scale loss equal to or exceeding the area equivalent to the fish tail is present</li>
  <li>No movement of fish is detected</li>
  </ul>
  <p>Complete the tagging worksheet ensuring that the tag ID header fields details are recorded. Note that particular fields are required for skates and rays (see the skate injury codes table). The worksheet contains conditional formatting to highlight if tag numbers are duplicated. Try to ensure accurate tagging release positions are recorded rather than just haul start or end positions. If extra details are required with regard to any tagging information please use the cruise report to detail these, for example if there are frequent tag breakages it is useful to document these in a table.</p>`,
  ua: `<p>Спостерігач SISO або належно навчений член екіпажу на кожному ярусному судні повинен мітити та випускати іклача. Оскільки судно відповідає за правильне дотримання протоколів мічення й повернення міток, кілька членів екіпажу, найімовірніше, будуть навчені процедурам мічення, однак від судна очікується співпраця зі спостерігачем, якщо ви вважаєте, що процедури виконуються неправильно. Будь-які процедури мічення мають відповідати посібнику CCAMLR з мічення іклача й скатів та протоколу мічення, детально описаному в Додатку 4 SISO Manual – Finfish Fisheries. Рибу ніколи не можна мітити й випускати, якщо наявна будь-яка з таких характеристик:</p>
  <ul>
  <li>Гачкові ушкодження є будь-де на тілі, крім ротової області</li>
  <li>Зябра рожеві або білі</li>
  <li>Зябра мають видиму кровотечу, або на рибі присутня надмірна кровотеча будь-де</li>
  <li>Наявне видиме пошкодження тіла риби з відкритими ранами</li>
  <li>Наявне видиме пошкодження ока або проникнення в порожнину тіла, зокрема ракоподібними (бокоплавами/вошами)</li>
  <li>Наявні саднини або нещодавня втрата луски на площі, що дорівнює або перевищує площу хвоста риби</li>
  <li>Рухової активності риби не виявлено</li>
  </ul>
  <p>Заповніть аркуш мічення, забезпечивши запис деталей у полях заголовка ID мітки. Зверніть увагу: для скатів і промениць потрібні особливі поля (див. таблицю кодів травм скатів). Аркуш містить умовне форматування, що підсвічує дублікати номерів міток. Намагайтеся фіксувати точні позиції випуску після мічення, а не лише позиції початку чи кінця виборки. Якщо потрібні додаткові деталі щодо будь-якої інформації про мічення, використовуйте звіт про рейс для детального опису — наприклад, якщо трапляються часті поломки міток, корисно задокументувати це в таблиці.</p>`
},
{
  title: "Tag Recapture",
  en: `<p>All tagged fish and skates must be retained by the vessel regardless of their time at liberty, it is good practice to encourage crew to look for tags, particularly as an annual prize is offered by the Coalition of Legal Toothfish Operators (COLTO) for tag finders! For each fish caught an electronic time-stamped photograph must be taken of the tags in situ using the "CCAMLR tag photo template". Please check that the photograph clearly shows the tag numbers and that the number is readable. Attach these photos in your cruise report, or zip up the photos and send them separately to the Secretariat through your technical coordinator. Fill out the required biological measurements in the worksheet, noting the specific fields required for skate and rays and toothfish (see the skate injury codes table). Fields are provided for any biological samples that are taken from fish. The worksheet contains conditional formatting to highlight if tag numbers are duplicated.</p>`,
  ua: `<p>Усю мічену рибу й скатів судно повинне зберігати незалежно від часу, проведеного на волі; варто заохочувати екіпаж шукати мітки, тим більше що щорічний приз за знайдені мітки пропонує Coalition of Legal Toothfish Operators (COLTO)! Для кожної впійманої риби потрібно зробити електронне фото міток in situ (на місці) зі штампом часу, використовуючи офіційний фотошаблон CCAMLR («CCAMLR tag photo template»). Перевірте, що на фото чітко видно номери міток і що номер читабельний. Додайте ці фото до звіту про рейс, або запакуйте фото в архів і надішліть окремо до Секретаріату через технічного координатора. Заповніть необхідні біологічні проміри в аркуші, звертаючи увагу на специфічні поля для скатів/промениць і іклача (див. таблицю кодів травм скатів). Передбачені поля для будь-яких біологічних зразків, взятих з риби. Аркуш містить умовне форматування, що підсвічує дублікати номерів міток.</p>`
},
{
  title: "Waste Disposal",
  en: `<p>This form is designed to collect summary information relating to the loss, retention and discarding of fishing gear and waste products at sea. Please select the option from the drop-down menu for each field. Definitions for each item are as follows:</p>
  <p><strong>Fishing Gear:</strong> This refers to all fishing gear that is no longer usable due to damage, loss, or hooks and sections of line that are cut off (e.g. when the line is cut to release a shark or marine mammal).</p>
  <p><strong>General Waste:</strong> This refers to all other waste such as plastics, metal, packaging material, oil and sewage.</p>
  <p><strong>Lost:</strong> Refers to gear or waste that was unintentionally swept into the sea; e.g. washed into the sea due to rough weather or the loss of a longline or trawl net etc.</p>
  <p><strong>Discarded:</strong> Refers to the intentional dumping of gear or waste into the sea; e.g. the dumping of galley waste, plastics or damaged fishing gear.</p>
  <p>For items that are either lost or discarded there are three categories to select from regarding the frequency for which this occurs: Occasionally (less than once a week or once a month), Weekly (up to several times a week) and Daily (every day).</p>
  <p>The retained column refers to how the waste is retained for disposal back on shore: non-incinerated or incinerated.</p>
  <p>Please use your cruise report to detail specific concerns or problems in detail.</p>`,
  ua: `<p>Ця форма призначена для збору зведеної інформації щодо втрати, зберігання та скидання знарядь лову й відходів у морі. Оберіть варіант з випадаючого списку для кожного поля. Визначення для кожного пункту:</p>
  <p><strong>Fishing Gear (знаряддя лову):</strong> стосується будь-якого знаряддя лову, що стало непридатним через пошкодження, втрату, або гачків і секцій лінії, які були відрізані (наприклад, коли лінію обрізають, щоб звільнити акулу чи морського ссавця).</p>
  <p><strong>General Waste (загальні відходи):</strong> стосується всіх інших відходів, як-от пластик, метал, пакувальні матеріали, нафтопродукти й каналізаційні стоки.</p>
  <p><strong>Lost (втрачено):</strong> стосується знаряддя чи відходів, ненавмисно змитих у море — наприклад, змитих штормовою погодою, або втрати ярусної чи тралової сітки тощо.</p>
  <p><strong>Discarded (скинуто навмисно):</strong> стосується навмисного скидання знаряддя чи відходів у море — наприклад, скидання камбузних відходів, пластику чи пошкодженого знаряддя лову.</p>
  <p>Для пунктів, які втрачено або скинуто навмисно, є три категорії частоти на вибір: Occasionally (нерегулярно — менше разу на тиждень чи раз на місяць), Weekly (щотижня — до кількох разів на тиждень) і Daily (щодня).</p>
  <p>Колонка «retained» (збережено) стосується того, як відходи зберігаються для утилізації на березі: non-incinerated (без спалювання) чи incinerated (спалено).</p>
  <p>Використовуйте звіт про рейс, щоб детально описати конкретні занепокоєння чи проблеми.</p>`
},
{
  title: "IUU Sightings",
  en: `<p>This worksheet is for reporting sightings by observers of unknown gear, refuse or vessels, or those vessels suspected to be engaging in IUU fishing activities. Please only include sightings and their details that you personally observe. It is a vessel responsibility to report any IUU sightings to the Secretariat as soon as practicable, however information collected by observers also provides important information, particularly supplementary photographs and comments on vessel appearance and activity.</p>
  <p>Fill out the details for each gear or vessel sighting as instructed in the worksheet. If necessary provide a more detailed description in the Cruise Report, as well as attaching photos if any are taken. If a vessel is sighted several times within a day complete a record for each time. Vessel name, call sign and flag are to be obtained from what is seen on the vessel or from radio contact with the vessel (the source of this information must be reported). For recovered gill nets please provide measurements of mesh size.</p>`,
  ua: `<p>Цей аркуш призначений для звітування спостерігачами про спостереження невідомого знаряддя, сміття чи суден, або суден, підозрюваних у здійсненні ННН-промислу (незаконного, незареєстрованого й нерегульованого). Включайте лише ті спостереження та їх деталі, які ви особисто спостерігали. Судно зобов'язане повідомити Секретаріат про будь-які спостереження ННН якомога швидше, однак інформація, зібрана спостерігачами, також є важливою — особливо додаткові фотографії та коментарі щодо вигляду й діяльності судна.</p>
  <p>Заповніть деталі кожного спостереження знаряддя чи судна, як зазначено в аркуші. За потреби надайте докладніший опис у звіті про рейс, а також додайте фото, якщо вони були зроблені. Якщо судно спостерігали кілька разів протягом дня, заповніть окремий запис для кожного разу. Назву судна, позивний і прапор потрібно фіксувати за тим, що видно на судні, або з радіоконтакту із судном (джерело цієї інформації обов'язково слід зазначити). Для виявлених зябрових сіток надайте виміри розміру вічка.</p>`
}
];

const page04 = section("logbook-intro", "4.1 Інструкція з електронного ярусного журналу, версія OL_v2026 — вступ", `
  ${fileTag("2026 Observer Longline Logbook Instructions.pdf")}
  ${p("Журнал складається з 12 робочих аркушів. Короткий огляд призначення кожного (детальний повний текст — у розділі 4.2 нижче):")}
  ${table(["Аркуш","Опис"], logbookSheets)}
  ${bilingual(logbookIntroEn, logbookIntroUa)}
`) +
section("logbook-full", "4.2 Повний текст інструкції за кожним аркушем (оригінал англійською + переклад)", `
  ${comment("Нижче — повний оригінальний текст інструкції з кожного з 12 аркушів журналу спостерігача (не скорочений переказ), з українським перекладом поруч. Джерело: 2026 Observer Longline Logbook Instructions.pdf.")}
  ${logbookWorksheets.map((w, i) => `
    ${h3((i+1) + ". Worksheet — " + w.title)}
    ${bilingual(w.en, w.ua)}
    ${w.extra || ""}
  `).join("")}
`) +
section("c2manual", "4.3 Commercial Data Collection Manual — Longline Fisheries 2025", `
  ${fileTag("EN - C2 Longline Fisheries Commercial data manual 2025_1.pdf")}
  ${p("Посібник для судна/оператора (не для спостерігача) щодо заповнення комерційної форми C2.")}
  ${h3("Історія версій форми C2")}
  ${table(["Версія","Дата випуску","Форми","Опис"], c2VersionHistory)}
  ${h3("Ключові визначення")}
  ${ul([
    "<strong>Прилов (By-catch)</strong> — весь живий матеріал (окрім цільових видів), виловлений під час промислу, включно з викидами; без урахування взаємодій з птахами/ссавцями (IMAF).",
    "<strong>Коефіцієнт переведення</strong> — співвідношення загальної (зеленої) ваги риби до ваги переробленого продукту.",
    "<strong>Сегмент лінії</strong> — секція ярусу на 1000 гачків або 1200 м (яка коротша); для пасток — 1200 м.",
    "<strong>Ризикова зона (Risk Area)</strong> — зона радіусом 1 морська миля від середини сегмента лінії, з якого вилучено 10 і більше одиниць-індикаторів ВМЕ.",
    "<strong>Іспанська снасть (Spanish line)</strong> — донний ярус з додатковою становою лінією.",
    "<strong>Тротлайн (Trotline)</strong> — донний ярус, де кластери наживлених гачків прикріплені до плавучої головної лінії через троти."
  ])}
  ${comment("Документ адресований екіпажу судна, а не спостерігачу, але корисний для перевірки: спостерігач часто звіряє свої дані з комерційним журналом C2.")}
`);

// =====================================================================
// PAGE 05 — GEAR
// =====================================================================

const gearCards = [
  { img: "images/gear/trawl_beam.svg", category: "Трал", ua: "Пелагічний беам-трал", latin: "Midwater beam trawl",
    note: "Жорстка розпірка (beam) утримує вхід сітки відкритим; загальна довжина сітки вказується окремо." },
  { img: "images/gear/trawl_otter.svg", category: "Трал", ua: "Пелагічний отер-трал", latin: "Midwater otter trawl",
    note: "Розпірні дошки (otter boards) розводять вхід сітки в боки за рахунок гідродинамічного опору під час буксирування." },
  { img: "images/gear/longline_autoline.svg", category: "Ярус", ua: "Autoline (донний ярус)", latin: "Bottom longline, single mainline",
    note: "Одинарна обважена головна лінія; гачки на коротких повідцях (снудах), наживлюються механічно під час постановки." },
  { img: "images/gear/longline_spanish.svg", category: "Ярус", ua: "Spanish line (іспанська снасть)", latin: "Double mainline longline",
    note: "До головної лінії приєднана додаткова станова лінія (backbone), з'єднана поперечними відгалуженнями." },
  { img: "images/gear/longline_trotline.svg", category: "Ярус", ua: "Trotline (тротлайн)", latin: "Buoyed mainline, hook clusters",
    note: "Головна лінія плавуча (утримується поверхневими буями); кластери наживлених гачків прикріплені через троти (дропер-лінії)." },
  { img: "images/gear/pot_beehive.svg", category: "Пастка", ua: "Пастка «вулик»", latin: "Beehive configuration",
    note: "Вхід у передній панелі (замість верхньої); приманка-мішок підвішена до даху пастки, а не лежить на дні." },
  { img: "images/gear/pot_rectangular.svg", category: "Пастка", ua: "Прямокутна пастка", latin: "Rectangular configuration",
    note: "Прямокутний каркас, вхід зверху, приманка розміщується на дні пастки." },
  { img: "images/gear/exclusion_mesh_panel.svg", category: "Пристрій виключення", ua: "Сітчаста панель", latin: "Mesh panel exclusion device",
    note: "Діагональна сітчаста вставка спрямовує велику тварину (тюленя, китоподібного) до отвору виходу над основною сіткою." },
  { img: "images/gear/exclusion_grid.svg", category: "Пристрій виключення", ua: "Решітка", latin: "Grid exclusion device",
    note: "Жорсткі паралельні прути пропускають рибу до кутка сітки (codend), але відхиляють велику тварину до отвору виходу." }
];

const page05 = section("gear-note", "Технічна примітка щодо зображень", `
  ${fileTag("Illustrated generic gear diagrams_2023 v1.3.docx")}
  ${comment("Оригінальні схеми знарядь у цьому файлі побудовані як векторні «полотна» Word (сітчасті текстури, накладені на векторні контури). Було випробувано два незалежні способи вилучення: (1) пряме вилучення вбудованих зображень і повна конвертація сторінок у зображення через LibreOffice — відтворюють лише текстуру-сітку без контурів; (2) повторна спроба через експорт у SVG та PNG (фільтр «draw_png_Export») — обидва завершилися помилкою рендерера LibreOffice (SfxBaseModel::impl_store … 0xc10) саме на цих фігурах. Це підтверджена межа можливостей доступних інструментів, а не втрата даних: векторні дані (~1 МБ) фізично присутні у файлі document.xml, просто жоден наявний рендерер не може їх коректно відобразити. Замість оригінальних сканів нижче додано <strong>власні спрощені схематичні ілюстрації</strong> (не копії офіційних креслень) для кожного типу знаряддя — вони передають принцип роботи, але не є технічним кресленням. Якщо потрібні саме оригінальні схеми — рекомендую відкрити файл безпосередньо в Microsoft Word.")}
`) +
section("gear-types", "5.1 Типи знарядь лова", `
  ${p("Натисніть на картку, щоб відкрити збільшену схему та повний опис.")}
  ${speciesGrid(gearCards)}
  ${h3("Трали")}
  ${ul([
    "<strong>Trawl: midwater beam</strong> — пелагічний беам-трал (загальна довжина сітки вказується окремо; ілюструється одна з двох сіток).",
    "<strong>Trawl: midwater otter</strong> — пелагічний отер-трал."
  ])}
  ${h3("Ярусна снасть (Longline)")}
  ${ul([
    "<strong>Autoline</strong> — донний ярус з одинарною обваженою головною лінією, гачки на коротких повідцях (снудах), наживлюються механічно під час постановки.",
    "<strong>Spanish line (іспанська снасть / подвійна лінія)</strong> — донний ярус, де до головної лінії приєднана додаткова станова лінія.",
    "<strong>Trotline (тротлайн)</strong> — донний ярус, де кластери наживлених гачків прикріплені до плавучої головної лінії через троти (відгалуження, дропер-лінії)."
  ])}
  ${p("Окремо документ описує альтернативне маркування ліній для роботи в льодових умовах та розташування радіомаяка/пристрою відстеження позиції (опціонально) і поверхневих поплавців/буїв.")}
  ${h3("Пастки (Pot)")}
  ${ul([
    "<strong>Beehive configuration</strong> («вулик») — можлива альтернативна конфігурація з входом у передній панелі (замість верхньої) та підвішеною до даху приманкою-мішком (замість розміщеної на дні пастки).",
    "<strong>Rectangular configuration</strong> — прямокутна конфігурація пастки."
  ])}
  ${h3("Пристрої виключення морських ссавців (Exclusion Device)")}
  ${ul([
    "<strong>Mesh panel</strong> — сітчаста панель.",
    "<strong>Grid</strong> — решітка.",
    "Для кожного типу знаряддя при нотифікації зазвичай обирається один тип пристрою виключення (тюленевий, китовий або інший); Члени CCAMLR повинні вказувати деталі кожного використаного пристрою виключення морських ссавців."
  ])}
  ${p("<em>Примітка документа:</em> синій текст на офіційних схемах позначає поле, для якого існує відповідна специфікація знаряддя на сайті суден CCAMLR.")}
  ${comment("Звіряння фактичного знаряддя судна з цими типовими схемами та з полями нотифікації на сайті CCAMLR прямо вимагається в розділі «Fishing Operations» звіту про рейс (див. розділ 3.2).")}
`);

// =====================================================================
// PAGE 06 — IDENTIFICATION
// =====================================================================

const toothfishMaturityF = [
["F1 Незріла","Яєчник малий, твердий, ооцити не видно неозброєним оком."],
["F2 Дозріваюча / стан спокою","Яєчник більш видовжений, твердий, видно дрібні ооцити — зернистий вигляд."],
["F3 Розвивається","Яєчник великий, починає розширювати порожнину тіла, наявні ооцити двох розмірів."],
["F4 Ікряна (гравідна)","Яєчник великий, заповнює/розширює порожнину тіла; при розтині випливає велика ікра."],
["F5 Відметана","Яєчник зморщений, в'ялий, містить кілька залишкових ікринок і багато дрібних ооцитів."]
];
const toothfishMaturityM = [
["M1 Незрілий","Сім'яник малий, прозорий, білуватий, тонкі довгі смужки біля хребта."],
["M2 Розвивається / спокій","Сім'яник білий, плаский, звивистий, добре видно неозброєним оком, ~1/4 порожнини тіла."],
["M3 Розвинений","Сім'яник великий, білий і звивистий, молочко не виділяється при натисканні чи розрізі."],
["M4 Стиглий","Сім'яник великий, опалесцентно-білий, при натисканні чи розрізі виділяються краплі молочка."],
["M5 Відметаний","Сім'яник зморщений, в'ялий, брудно-білого кольору."]
];

const rossSeaFamilies = [
["Arhynchobatidae","М'якорилі скати","Дзьоб підтримується редукованим м'яким хрящем, широкий диск, тонкий хвіст, зубці на спині, без шипа на хвості"],
["Muraenolepididae","Мурени-тріскові","Два спинних плавці (перший з 2 променями), другий спинний зрощений з хвостовим і анальним; борідка на підборідді"],
["Macrouridae","Довгохвости, довгохвости-щуки","Видовжений звужений хвіст, борідка на підборідді, перші 2 промені спинного плавця колючі"],
["Moridae","Глибоководні тріскові","Без колючок у плавцях, 2–3 спинних плавці, хвостовий плавець окремий від спинного й анального"],
["Liparidae","Слизняки (морські слимаки)","Краплеподібне тіло, желеподібна шкіра без луски, спинний та анальний плавці зрощені з хвостовим"],
["Zoarcidae","Бельдюгові","Видовжене вугреподібне тіло, спинний та анальний плавці зрощені з хвостовим, дрібна луска або без луски"],
["Nototheniidae","Нототенієві (тріскові льодяні риби)","Два окремих спинних плавці, 1–3 бічні лінії, зяброві перетинки утворюють складку на перешийку"],
["Artedidraconidae","Бородаті плундерфіші","Гачок на верхній частині зябрової кришки, дві бічні лінії, борідка на підборідді, без луски"],
["Bathydraconidae","Антарктичні драконові риби","Видовжене тіло, один довгий спинний плавець без колючок, луска або кісткові пластини або їх відсутність"],
["Channichthyidae","Крокодилові крижані риби","Лопатоподібний писок, великий віялоподібний грудний плавець, 2–3 бічні лінії, тіло без луски"]
];

const pinnipedSpecies = [
["Антарктичний морський котик","Arctocephalus gazella","SEA","Єдиний вухатий тюлень зі списку: довгі вуса (до 35–50 см), помітні зовнішні вушні раковини. Самці 1,6–2 м, 130–200 кг, темно-сіро-коричневе хутро; самиці 1,2–1,4 м, 22–51 кг."],
["Південний морський слон","Mirounga leonina","SES","Найбільший ластоногий; статевий диморфізм — самці значно більші, хоботоподібний ніс у самців."],
["Тюлень-крабоїд","Lobodon carcinophagus","SET","Багатогорбкові («ситоподібні») зуби для фільтрації криля; довжина 2–2,6 м, 200–300 кг; часто має шрами від нападів леопардових тюленів."],
["Тюлень Уеддела","Leptonychotes weddellii","SLW","Малий тупий писок, велике око, «котячий» вираз морди; довжина самиць до 3,3 м, вага 400–600 кг."],
["Тюлень-леопард","Hydrurga leptonyx","SLP","Великий, з великою головою і пащею; плямистий малюнок на світлому тлі, схожий на леопарда; довге стрункe тіло."],
["Тюлень Росса","Ommatophoca rossii","—","Найрідше зустрічається; великі очі, дуже короткий писок, товста шия зі складками."]
];

const whaleSpecies = [
["Південний пляшконіс","Hyperoodon planifrons","7–8 м"],
["Горбач","Megaptera novaeangliae","11,5–15 м"],
["Антарктичний малий смугач","Balaenoptera bonaerensis","7–10 м"],
["Довгоплавцева гринда","Globicephala melas","3,8–6 м"],
["Синій кит","Balaenoptera musculus","24–27 м"],
["Кашалот","Physeter macrocephalus","11–18 м"],
["Плавуни Арну","Berardius arnuxii","7,8–9,7 м"],
["Окулярна морська свиня","Phocoena dioptrica","1,3–2,2 м"],
["Пісочний дельфін (Гурзик)","Lagenorhynchus cruciger","1,6–1,8 м"],
["Сейвал","Balaenoptera borealis","12–16 м"],
["Фінвал","Balaenoptera physalus","18–22 м"],
["Косатка, тип A","Orcinus orca (тип A)","до 9,8 м"],
["Косатка, тип B","Orcinus orca (тип B)","до 7,2 м"],
["Косатка, тип C","Orcinus orca (тип C)","до 6,1 м"]
];

const ribaCodes = [
["TOA","Dissostichus mawsoni","Антарктичний іклач"],
["GRV","Macrourus spp","Довгохвости, nei"],
["CHW / ICX","Chionobathyscus dewitti / Channichthyidae","Крижана риба Девітта / крокодилові крижані риби nei"],
["TRT","Trematomus spp","Трематомус, nei"],
["MRL","Muraenolepis spp","Мурени-тріскові, nei"],
["ELZ","Родина Zoarcidae (визначник Ross Sea Fishes, розд. 6.5)","Бельдюгові — джерело коду встановлено при звірці зображень"],
["POG","Pogonophryne spp","Плундерфіш (бородаті вудильники), nei"],
["ANT","Antimora rostrata","Синя антимора"],
["LIZ","Ймовірно родина Liparidae (за формою тіла)","Слизняк — грушоподібне тіло, драглиста напівпрозора шкіра, батогоподібний хвіст; офіційний код не підтверджено"],
["SRR","Amblyraja georgiana","Антарктичний зірчастий скат"]
];

// Precise mapping (num = pdfimages index, verified via page-by-page text extraction)
// ross_NNN = images/rossfish/ross_(num+1).jpg
const rossSpeciesByNum = {
  18: "Amblyraja georgiana — антарктичний зірчастий скат (SRR), род. Rajidae",
  19: "Bathyraja cf. eatonii — антарктичний алометричний скат (BEA), род. Arhynchobatidae",
  20: "Bathyraja maccaini — скат Мак-Кейна (BAM), род. Arhynchobatidae",
  21: "Bathyraja sp. — антарктичний карликовий скат (BHY), род. Arhynchobatidae",
  22: "Muraenolepis spp. — мурени-тріскові (MRL)",
  23: "Coryphaenoides armatus — космополітний довгохвіст (CKH)",
  24: "Macrourus caml — довгохвіст caml (QMC)",
  25: "Macrourus carinatus — гребенястий довгохвіст (MCC)",
  26: "Macrourus holotrachys — великоокий довгохвіст (MCH)",
  27: "Macrourus whitsoni — довгохвіст Вітсона (WGR)",
  28: "Antimora rostrata — синя антимора (ANT)",
  29: "Lepidion sp. — гігантська морська тріска (LEV)",
  30: "Родина Liparidae — слизняки (ZLS)",
  31: "Родина Zoarcidae — бельдюгові (ELZ)",
  32: "Dissostichus eleginoides — патагонський іклач (TOP)",
  34: "Dissostichus mawsoni — антарктичний іклач (TOA)",
  35: "Lepidonotothen squamifrons — смугастоока нототенія (NOK)",
  36: "Pleuragramma antarctica — антарктична срібляста риба (ANS)",
  37: "Trematomus bernacchii — смарагдовий трематомус (ERN)",
  38: "Trematomus eulepidotus — трематомус тупочешуйчастий (TRL)",
  39: "Trematomus lepidorhinus — трематомус тонкорилий (TRD)",
  40: "Trematomus loennbergii — глибоководний трематомус (TLO)",
  41: "Trematomus pennellii — гострошипий трематомус (PTC)",
  42: "Pogonophryne spp. — бородаті плундерфіші (POG)",
  43: "Родина Bathydraconidae — антарктичні драконові риби (BTL)",
  44: "Chionobathyscus dewitti — крижана риба Девітта (CHW)",
  45: "Chionodraco hamatus — крижана риба (TIC)",
  46: "Cryodraco antarcticus — антарктична крижана риба (FIC)",
  47: "Dacodraco hunteri — криворота крижана риба (DAH)",
  48: "Neopagetopsis ionah — крижана риба (JIC)"
};
const rossFrontMatter = {
  0: "Обкладинка визначника", 1: "Обкладинка — карта регіону", 2: "Обкладинка — ілюстрація",
  4: "Рис. 1. Карта регіону моря Росса",
  5: "Зовнішні ознаки скатів (маркована ілюстрація)",
  6: "Зовнішні ознаки кісткових риб (маркована ілюстрація)",
  7: "Род. Rajidae — ознаки родини", 8: "Род. Rajidae — ознаки родини", 9: "Род. Rajidae — ознаки родини",
  10: "Род. Rajidae — ознаки родини", 11: "Род. Rajidae — ознаки родини",
  12: "Род. Liparidae/Zoarcidae — ознаки родини", 13: "Род. Liparidae/Zoarcidae — ознаки родини",
  14: "Род. Liparidae/Zoarcidae — ознаки родини", 15: "Род. Liparidae/Zoarcidae — ознаки родини",
  16: "Род. Liparidae/Zoarcidae — ознаки родини", 17: "Род. Liparidae/Zoarcidae — ознаки родини"
};
// Page 58 (last page, "Quick key") contains 11 small representative photos, each originally
// paired in the source PDF with a caption "Page N, <Family>" pointing to that family's full
// treatment earlier in the guide. Per pdfimages -list, the real photos are at even num
// (49,50,52,54,56,58,60,62,64,66,68); the odd num in between are transparency masks (smask,
// no visual content) — three of these (num 53,55,61 -> ross_054/056/062.jpg) slipped past the
// automatic blank-image filter during extraction and rendered as blank white tiles; they are
// explicitly excluded below. Family names are assigned by visual match to the guide's own
// family-diagnostic photos (rostrum/fin/barbel shape) since the PDF's 2-column "Quick key"
// layout could not be parsed reliably into image order — hence "ймовірно" (probable), not certain.
const rossQuickKeyFamilies = {
  49: "Rajidae — справжні скати (сторінка 14 визначника)",
  50: "Arhynchobatidae — м'якорилі скати (сторінка 15)",
  52: "Zoarcidae — бельдюгові (сторінка 27)",
  54: "Macrouridae — довгохвости (сторінка 19)",
  56: "Muraenolepididae — мурени-тріскові (сторінка 18)",
  58: "Liparidae — слизняки (сторінка 26)",
  60: "Moridae — глибоководні тріскові (сторінка 24)",
  62: "Nototheniidae — нототенієві (сторінка 28)",
  64: "Artedidraconidae — бородаті плундерфіші (сторінка 37)",
  66: "Bathydraconidae — антарктичні драконові риби (сторінка 38)",
  68: "Channichthyidae — крокодилові крижані риби (сторінка 39)"
};
const rossQuickKeyBlanks = new Set([53, 55, 61]); // confirmed blank smask files that leaked past the extraction filter

const rossGallery = [];
const rossGalleryChart = [];
for (let num = 0; num <= 69; num++) {
  if (rossQuickKeyBlanks.has(num)) continue;
  const n = String(num + 1).padStart(3, "0");
  const p2 = `images/rossfish/ross_${n}.jpg`;
  if (!fs.existsSync(path.join(__dirname, p2))) continue;
  if (rossSpeciesByNum[num]) rossGallery.push([p2, rossSpeciesByNum[num]]);
  else if (rossFrontMatter[num]) rossGallery.push([p2, rossFrontMatter[num]]);
  else if (rossQuickKeyFamilies[num]) rossGalleryChart.push([p2, "Ймовірно: " + rossQuickKeyFamilies[num]]);
  else if (num >= 49) rossGalleryChart.push([p2, "Швидкий ключ — фрагмент (родину визначити не вдалося)"]);
}

const page06 = section("toothfish-id", "6.1 Identification Guide for Toothfish — офіційний постер", `
  ${fileTag("Identification Guide for Toothfish (poster).pdf")}
  ${gallery([["images/toothfish_poster/tp_p-1.jpg","Постер CCAMLR: визначення іклача, сторінка 1"],["images/toothfish_poster/tp_p-2.jpg","Постер CCAMLR: фото продукції та регламенти, сторінка 2"]], "wide")}
  ${p("Систематика: ряд Perciformes, родина Nototheniidae, рід Dissostichus, види eleginoides (<strong>TOP</strong>) та mawsoni (<strong>TOA</strong>).")}
  ${p("<strong>Розмір і біологія:</strong> статева зрілість у 8–10 років, тривалість життя до 45–50 років; у промислових уловах довжина зазвичай 80–140 см, вага 10–30 кг; великі особини — понад 160 см і 60–80 кг. Виловлюється ярусом, тралом і пастками на глибинах 500–1800 м.")}
  ${p("<strong>Схожі види</strong> (можливе неправильне маркування): хек (HKE), акули, африканський баррелфіш (SEY), butterfish/bluenose (BUX) при філетуванні, гренландський палтус (GHL) при філетуванні зі шкірою.")}
`) +
section("toothfish-diff", "6.2 Розрізнення двох видів іклача (за SISO Manual)", `
  ${ul([
    "<strong>Забарвлення спинного плавця:</strong> у патагонського іклача — однорідне, з чіткими білими кінчиками; у антарктичного — чергування темних і світлих смуг.",
    "<strong>Структура зубів:</strong> у патагонського іклача зуби відносно великі, довгі й гострі; у антарктичного — значно менші відносно розміру тіла.",
    "<strong>Додатково:</strong> довжина бічної лінії та форма отолітів (у патагонського іклача — більші й видовженіші)."
  ])}
  ${h3("Стадії зрілості іклача — самки (F1–F5)")}
  ${table(["Стадія","Опис"], toothfishMaturityF)}
  ${h3("Стадії зрілості іклача — самці (M1–M5)")}
  ${table(["Стадія","Опис"], toothfishMaturityM)}
`) +
section("gonad-guide", "6.3 Атлас стадій зрілості гонад Dissostichus eleginoides", `
  ${fileTag("DIssostichis eleginoides gonad guide.docx")}
  ${p("Двомовний (французька/англійська) фотоатлас стадій зрілості гонад патагонського іклача. Стадії описуються через об'єм гонади відносно вісцеральної порожнини (від «дуже малого» до «практично всієї порожнини»).")}
  ${gallery([
    ["images/gonad/gonad_001.jpg","Ілюстрація стадій розвитку гонад — загальна схема"],
    ["images/gonad/gonad_004.jpg","Фотоатлас стадій зрілості (жіночі гонади), T. Auger / J.L. Aubert та ін."],
    ["images/gonad/gonad_005.jpg","Фотоатлас стадій зрілості (чоловічі гонади)"]
  ])}
  ${comment("Ця шкала відповідає стадіям F1–F5/M1–M5 з посібника SISO Manual (Gasco et al. 2011), але подана у форматі фотоатласу. Використовуйте таблицю вище як основне текстове джерело, а ці зображення — як ілюстративний додаток.")}
`) +
section("grenadiers", "6.4 Ключі визначення долгохвостів роду Macrourus (88.1, 88.3)", `
  ${fileTag("Easy Identification Keys for Grenadiers in 88.1 and 88.3_Sagndeok.pdf")}
  ${gallery([["images/grenadiers/gren_p-1.jpg","Ключ визначення: зовнішні ознаки 4 видів Macrourus"],["images/grenadiers/gren_p-2.jpg","Дихотомічний ключ визначення за SDRAL і кількістю рядів зубів"]], "wide")}
  ${table(["Вид","Код","Ключові ознаки"], [
    ["Macrourus holotrachys","MCH","Промені: 8; луска на задній частині нижньої щелепи відсутня"],
    ["Macrourus carinatus","MCC","Промені: 8; луска присутня; SDRAL 19–25; 2–5 рядів зубів"],
    ["Macrourus caml","QMC","Промені: 8; луска присутня; SDRAL 30–40; 2–5 рядів зубів"],
    ["Macrourus whitsoni","WGR","Промені: 9; один ряд зубів на нижній щелепі"]
  ])}
  ${p("<strong>SDRAL</strong> (Scales in a Diagonal Row from Anus to Lateral Line) — кількість лусок у діагональному ряду від ануса до бічної лінії.")}
`) +
section("rossfish", "6.5 Fishes of the Ross Sea Region — польовий визначник (2015)", `
  ${fileTag("Fishes of the Ross Sea Region_A field guide to common species caught in the longline fishery (2015).pdf")}
  ${p("Видання NIWA (Нова Зеландія), New Zealand Aquatic Environment and Biodiversity Report No. 134. Основні родини, представлені у визначнику:")}
  ${p("Загалом визначник охоплює <strong>30 видів риб з 11 родин</strong>, включно з хрящовими рибами (скатами) та кістковими рибами, зокрема дрібними видами, що не завжди трапляються на гачках, але є кормом іклача (антарктичні драконові риби, слизняки, бельдюгові).")}
  ${table(["Родина","Українська назва","Ключові ознаки"], rossSeaFamilies)}
  ${h3("Вступні ілюстрації та ознаки родин")}
  ${gallery(rossGallery.slice(0, 16), "small-grid")}
  ${h3("Фотогалерея видів з точною ідентифікацією (" + (rossGallery.length - 16) + " видів)")}
  ${p("Кожне фото зіставлено з назвою виду за номером сторінки оригіналу документа (перевірено посторінковим зіставленням тексту й вбудованих зображень PDF).")}
  ${gallery(rossGallery.slice(16), "small-grid")}
  ${h3("«Quick key» — фотопокажчик родин за сторінками (сторінка 58 з 58, остання сторінка визначника)")}
  ${p("В оригіналі це не порівняльна таблиця, а фотопокажчик: невелике фото-мініатюра кожної з 11 родин з підписом «Page N, Family» — швидкий спосіб знайти потрібний розділ визначника за зовнішнім виглядом риби.")}
  ${gallery(rossGalleryChart, "small-grid")}
  ${comment("Родину для кожного фрагмента визначено візуально (форма писка, плавців, наявність борідки) за зразком із самого визначника, оскільки текстовий шар PDF для цієї двоколонкової сторінки не зберігає однозначного порядку зображень — тому підписи позначені як «Ймовірно», а не стверджуються напевно. Також під час цієї звірки виявлено й виправлено технічний дефект: 3 «порожні» зображення (прозорі маски з PDF без власного вмісту) помилково потрапляли до галереї як білі плитки — тепер вони виключені. Ця сама звірка раніше допомогла знайти джерело коду <strong>ELZ</strong> з файлу риба.doc — офіційний код родини Zoarcidae саме з цього визначника (розділ 6.6).")}
`) +
section("riba", "6.6 Довідка з фотографіями видів і кодами (риба.doc)", `
  ${fileTag("риба.doc")}
  ${p("Неофіційна добірка фотографій риб (зроблених на борту судна та в лабораторії National Fisheries Research & Development Institute) з підписаними трилітерними кодами.")}
  ${gallery([
    ["images/riba/riba_1.jpg","Стор. 1: TOA, GRV, CHW/ICX"],
    ["images/riba/riba_2.jpg","Стор. 2: TRT, MRL, ELZ"],
    ["images/riba/riba_3.jpg","Стор. 3: POG, ANT, LIZ"],
    ["images/riba/riba_4.jpg","Стор. 4: SRR"]
  ], "wide")}
  ${table(["Код у риба.doc","Наукова назва (за офіційним довідником)","Українська назва"], ribaCodes)}
  ${comment("10 з 11 кодів підтверджено: 9 — офіційним довідником CCAMLR (аркуш «CCAMLR codes» у en_C2_2026a.xlsx, звірено напряму — усі 553 записи перевірено програмно, ні ELZ, ні LIZ серед офіційних кодів немає), а код <strong>ELZ</strong> додатково зіставлено з визначником Ross Sea Fishes (розділ 6.5, зображення сторінки 31) — це родина Zoarcidae (бельдюгові). Код <strong>LIZ</strong> формально залишається непідтвердженим (такого трилітерного коду немає в жодному з наданих офіційних переліків), але фото демонструє чітку візуальну схожість із родиною Liparidae (слизняки) з того самого визначника Ross Sea Fishes — грушоподібне тіло, драглиста напівпрозора шкіра, батогоподібний звужений хвіст (порівняйте з фото у розділі 6.5). Це моя візуальна гіпотеза, не офіційне підтвердження — перед використанням коду LIZ у звітності перевірте видову назву напряму з капітаном/науковим керівником рейсу.")}
`) +
section("pinniped", "6.7 Протокол ідентифікації, статі та промірів ластоногих", `
  ${fileTag("CCAMLR protocols for pinniped identification (1).docx")}
  ${p("Розроблений за участю делегацій США та Нової Зеландії, схвалений Робочою групою з випадкової смертності (WG-FSA-IMAF-2024/76).")}
  ${table(["Вид","Наукова назва","Код CCAMLR","Ключові ознаки"], pinnipedSpecies)}
  ${h3("Визначення статі")}
  ${gallery([
    ["images/pinniped2/sexing_1.jpg","Схема визначення статі ластоногих, крок 1: розташування пупка"],
    ["images/pinniped2/sexing_2.jpg","Схема визначення статі, крок 2: статевий і анальний отвори у самця"],
    ["images/pinniped2/sexing_3.jpg","Схема визначення статі, крок 3: статевий отвір у самиці"],
    ["images/pinniped2/sexing_4.jpg","Схема визначення статі, крок 4: порівняльна ілюстрація"],
    ["images/pinniped2/sexing_5.jpg","Схема визначення статі, крок 5: підсумкова діаграма"]
  ], "small-grid")}
  ${p("Не робити спроб на живих тваринах. Якщо статеві отвори розташовані одразу над задніми ластами — самиця; якщо є два отвори вище (статевий і анальний окремо) — самець. За сумніву — сфотографувати ділянку пупка й геніталій, позначити стать як «невизначену» для подальшої верифікації фахівцями.")}
  ${h3("Фотогалерея видів (за прямим підписом у документі)")}
  ${gallery([
    ["images/pinniped2/fur_seal_1.jpg","Антарктичний морський котик (Arctocephalus gazella, код SEA)"],
    ["images/pinniped2/elephant_seal_1.jpg","Південний морський слон (Mirounga leonina, код SES)"],
    ["images/pinniped2/crabeater_seal_1.jpg","Тюлень-крабоїд (Lobodon carcinophagus, код SET)"],
    ["images/pinniped2/weddell_seal_1.jpg","Тюлень Уеддела (Leptonychotes weddellii, код SLW), фото 1"],
    ["images/pinniped2/weddell_seal_2.jpg","Тюлень Уеддела, фото 2"],
    ["images/pinniped2/weddell_seal_3.jpg","Тюлень Уеддела, фото 3"],
    ["images/pinniped2/weddell_seal_4.jpg","Тюлень Уеддела, фото 4"],
    ["images/pinniped2/weddell_seal_5.jpg","Тюлень Уеддела, фото 5"],
    ["images/pinniped2/leopard_seal_1.jpg","Тюлень-леопард (Hydrurga leptonyx, код SLP), фото 1"],
    ["images/pinniped2/leopard_seal_2.jpg","Тюлень-леопард, фото 2"],
    ["images/pinniped2/leopard_seal_3.jpg","Тюлень-леопард, фото 3"],
    ["images/pinniped2/leopard_seal_4.jpg","Тюлень-леопард, фото 4"],
    ["images/pinniped2/leopard_seal_5.jpg","Тюлень-леопард, фото 5"],
    ["images/pinniped2/ross_seal_1.jpg","Тюлень Росса (Ommatophoca rossii), фото 1"],
    ["images/pinniped2/ross_seal_2.jpg","Тюлень Росса, фото 2"],
    ["images/pinniped2/ross_seal_3.jpg","Тюлень Росса, фото 3"],
    ["images/pinniped2/ross_seal_4.jpg","Тюлень Росса, фото 4"]
  ], "small-grid")}
  ${h3("Виміри й безпека")}
  ${ul([
    "<strong>Стандартна довжина</strong> — по прямій від кінчика писка до кінчика хвоста, тварина на спині, з точністю до см.",
    "<strong>Криволінійна довжина</strong> — найкоротша відстань по поверхні тіла, якщо тварину не можна випрямити.",
    "Спостерігачам заборонено наближатися до живих тюленів на палубі. Тюленів, гачкованих під час ярусного лову, слід звільняти дегачувальними пристроями або обрізанням повідця якомога ближче до тварини."
  ])}
  ${comment("Оновлено: фото тепер зіставлені з видами за прямим порядком появи в структурі DOCX-файлу (заголовок виду → наступне зображення), а не за алфавітним порядком імен файлів у медіа-папці — це дало 100% впевненість для всіх 6 видів і серії «визначення статі», замість попередніх 2 з 15 фото.")}
`) +
section("whales", "6.8 SOUTHERN OCEAN whales and dolphins — постер ASOC", `
  ${fileTag("SOUTHERN OCEAN whales and dolphins (ASOC poster).pdf")}
  ${gallery([["images/whales_poster/wp_p-1.jpg","Постер ASOC: види китоподібних Південного океану, сторінка 1"],["images/whales_poster/wp_p-2.jpg","Постер ASOC: продовження визначника та загрози, сторінка 2"]], "wide")}
  ${table(["Вид","Наукова назва","Довжина"], whaleSpecies)}
  ${h3("Три типи антарктичної косатки (Orcinus orca) — різний раціон")}
  ${table(["Тип","Розмір (самці)","Основний раціон"], [
    ["Тип A","до 9,8 м","Переважно малі смугачі (мінке-кити)"],
    ["Тип B","до 7,2 м","Тюлені"],
    ["Тип C","до 6,1 м","Риба"]
  ])}
  ${p("Типи різняться також морфологічно (форма й розмір «плями» навколо ока, форма спинної «накидки»).")}
  ${p("<strong>Загрози Південного океану</strong> (за постером): китобійний промисел, зміна клімату, заплутування у знаряддях лову, забруднення, деградація середовища існування, зменшення кормової бази, зіткнення із суднами, антропогенне занепокоєння, морське сміття.")}
  ${comment("Видавець — Antarctic and Southern Ocean Coalition (ASOC), природоохоронна організація (не CCAMLR) — просвітницький, а не нормативний матеріал.")}
`) +
section("similar-species", "6.9 Порівняльна таблиця схожих видів", `
  ${p("Види, які найчастіше плутають одне з одним у промисловому улові — фото поруч і ключові відмінності в один погляд.")}
  ${h3("Іклач: Dissostichus mawsoni (TOA) проти D. eleginoides (TOP)")}
  ${gallery([["images/rossfish/ross_035.jpg","D. mawsoni (TOA) — антарктичний іклач"],["images/rossfish/ross_033.jpg","D. eleginoides (TOP) — патагонський іклач"]], "wide")}
  ${table(["Ознака","D. mawsoni (TOA)","D. eleginoides (TOP)"], [
    ["Спинний плавець","Чергування темних і світлих смуг","Однорідне забарвлення з чіткими білими кінчиками"],
    ["Зуби","Значно менші відносно розміру тіла","Відносно великі, довгі й гострі"],
    ["Отоліти","Менші, менш видовжені","Більші й видовженіші"],
    ["Типовий район вилову","88.1, 88.2 (море Росса)","48.3, 58.5.2 та ін."]
  ])}
  ${h3("Довгохвости роду Macrourus (4 види, підрайони 88.1/88.3)")}
  ${gallery([
    ["images/rossfish/ross_028.jpg","M. whitsoni (WGR)"],
    ["images/rossfish/ross_027.jpg","M. holotrachys (MCH)"],
    ["images/rossfish/ross_026.jpg","M. carinatus (MCC)"],
    ["images/rossfish/ross_025.jpg","M. caml (QMC)"]
  ], "small-grid")}
  ${table(["Вид","Код","Промені","Луска на щелепі","SDRAL"], [
    ["M. whitsoni","WGR","9","1 ряд зубів на нижній щелепі","—"],
    ["M. holotrachys","MCH","8","Відсутня","—"],
    ["M. carinatus","MCC","8","Присутня","19–25"],
    ["M. caml","QMC","8","Присутня","30–40"]
  ])}
  ${comment("M. carinatus і M. caml зовні майже ідентичні — розрізняються лише підрахунком SDRAL (детально в переказі документа 14 «Grenadiers key», розділ «Бібліотека», пункт 9).")}
  ${h3("Скати: Amblyraja georgiana (SRR) проти роду Bathyraja")}
  ${gallery([
    ["images/rossfish/ross_019.jpg","Amblyraja georgiana (SRR)"],
    ["images/rossfish/ross_020.jpg","Bathyraja cf. eatonii (BEA)"],
    ["images/rossfish/ross_021.jpg","Bathyraja maccaini (BAM)"]
  ], "small-grid")}
  ${p("Обидва роди належать до м'якорилих скатів (Arhynchobatidae), тому розрізнення на око складне — орієнтуйтесь на форму рила, малюнок на диску й зубці вздовж хребта; за сумніву фотографуйте зразок для подальшої верифікації.")}
  ${h3("«Родинна» плутанина: ELZ (Zoarcidae) проти LIZ (ймовірно Liparidae)")}
  ${gallery([
    ["images/rossfish/ross_032.jpg","Родина Zoarcidae (код ELZ) — бельдюгові"],
    ["images/rossfish/ross_031.jpg","Родина Liparidae (код LIZ за гіпотезою) — слизняки"]
  ], "wide")}
  ${table(["Ознака","Zoarcidae (ELZ)","Liparidae (LIZ)"], [
    ["Форма тіла","Видовжене, вугреподібне","Краплеподібне, «грушоподібне»"],
    ["Шкіра","Дрібна луска або без луски","Драглиста, напівпрозора, без луски"],
    ["Хвіст","Звужений, зрощений з плавцями","Батогоподібний, тонкий"]
  ])}
  ${comment("Це той самий випадок плутанини кодів, що розглянуто в переказі «риба.doc» (Бібліотека, пункт 9, документ 16) — код LIZ офіційно не підтверджено, це візуальна гіпотеза за формою тіла.")}
`);

// =====================================================================
// PAGE 07 — VME
// =====================================================================

const vmeInstructions = [
  "Рівень класифікації здебільшого <strong>грубий</strong>: для більшості таксонів достатньо визначити тип, клас або ряд. Але деякі групи потребують визначення до родини чи навіть виду (наприклад, антарктичний гребінець <em>Adamussium colbecki</em> — окремий вид-індикатор).",
  "Таблиця організована колонками: кожна колонка — одна таксономічна група, кольорово закодована за типом (phylum). Схожі між собою групи розміщено поруч, щоб їх було легше порівняти.",
  "<strong>Трилітерний код FAO = код CCAMLR</strong> для цих таксонів — той самий код можна шукати в аркуші «CCAMLR codes» форми C2 (розділ 3.1).",
  "Рядок «Form, size» — загальний розмір і форма зразка; рядок «Detail» — текстура, колір, особливості поліпів; нижній рядок (жовтий фон) — з чим цю групу часто плутають і на що звертати увагу.",
  "Якщо зразок неможливо ідентифікувати з упевненістю — визначте до найнижчого можливого таксономічного рівня, збережіть на борту та поверніть замороженим як біологічний зразок для формальної ідентифікації фахівцями."
];

const vmeExcludedGroups = [
  "<strong>Равлики / черевоногі молюски (Snails)</strong>",
  "<strong>Морські зірки (Starfish, клас Asteroidea)</strong> — увага: це стосується лише «справжніх» морських зірок; кошикові зірки та змієхвістки (Euryalida, клас Ophiuroidea, код <strong>OEQ</strong>) до індикаторів ВМЕ належать і НЕ виключені",
  "<strong>Краби (Crabs)</strong>"
];

const vmeTaxaTable = [
  ["DWR","Cnidaria (CNI)","Scleralcyonacea (ряд)","Горгонарії (октокорали): бамбукові, червоні/коштовні, щіткоподібні/віялові, «бабл-гам», золоті корали"],
  ["HQZ","Cnidaria (CNI)","Leptothecata / Anthoathecata (ряди)","Гідроїди та Stylasteridae (гідрокорали)"],
  ["CSS","Cnidaria (CNI)","Scleractinia (ряд)","Кам'янисті (стійкі) корали"],
  ["AQZ","Cnidaria (CNI)","Antipatharia (ряд)","Чорні корали"],
  ["ZOT","Cnidaria (CNI)","Zoantharia (ряд)","Зоантарії (колоніальні актинії)"],
  ["HXY","Porifera (PFR)","Hexactinellida (клас)","Скляні губки"],
  ["DMO","Porifera (PFR)","Demospongiae (клас)","Кремнієві губки"],
  ["ATX","Cnidaria (CNI)","Actiniaria (ряд)","Анемони"],
  ["DWQ","Cnidaria (CNI)","Malacalcyonacea (ряд)","Справжні м'які корали"],
  ["NTW","Cnidaria (CNI)","Pennatuloidea (надродина)","Морські пера"],
  ["SSX","Chordata (CZ1)","Ascidiacea (клас)","Асцидії (морські шприци)"],
  ["BZN","Bryozoa","Bryozoa (тип)","Мереживні мохуватки"],
  ["CX1","Хемосинтетичні угруповання","Різні групи","Холодні джерела, гідротермальні виходи, туші китів, затонула деревина"],
  ["BVH","Brachiopoda","Brachiopoda (тип)","Плеченогі (лампові мушлі)"],
  ["PBQ","Hemichordata","Pterobranchia (клас), рід Cephalodiscus","Птеробранхії"],
  ["SZS","Annelida (NHE)","Serpulidae (родина)","Серпулідні трубчасті черви"],
  ["XEF","Xenophyophoroidea","Ряд Astrorhizida (підряд)","Ксенофіофори (найбільші одноклітинні організми)"],
  ["AX1","Arthropoda","Cirripedia: Bathylasmatidae / Scalpellomorpha","Жолудеві та гусячі (стеблові) вусоногі раки"],
  ["DMK","Mollusca (MOL)","Adamussium colbecki (вид)","Антарктичний гребінець"],
  ["CWD","Echinodermata (ECH)","Crinoidea (клас)","Стеблові морські лілії"],
  ["OEQ","Echinodermata (ECH)","Euryalida (ряд)","Кошикові зірки та змієхвістки"],
  ["DWL","Echinodermata (ECH)","Cidaroida (ряд)","Олівцеві морські їжаки"]
];

const page07 = section("vme-guide", "7.1 CCAMLR VME Taxa Classification Guide 2023, версія 2", `
  ${fileTag("CCAMLR_VME_guide_2023V2.pdf")}
  ${p("Офіційний візуальний визначник таксонів-індикаторів вразливих морських екосистем (Vulnerable Marine Ecosystems). Складається з <strong>3 сторінок-таблиць</strong> «Тип → Код → Рівень → Таксон» з описом форми, розміру, текстури та типових помилок ідентифікації, і 4-ї сторінки з інструкцією використання та подяками. Таблиці наведено повністю нижче як зображення, а звірений трилітерний код кожної групи — у таблиці розділу 7.2.")}
  ${gallery([
    ["images/vme/vme_p-1.jpg","Сторінка 1: Cnidaria (горгонарії, гідроїди, кам'янисті й чорні корали, зоантарії)"],
    ["images/vme/vme_p-2.jpg","Сторінка 2: Porifera, додаткові Cnidaria, Chordata, Bryozoa, хемосинтетичні угруповання"],
    ["images/vme/vme_p-3.jpg","Сторінка 3: Brachiopoda, Hemichordata, Annelida, Xenophyophoroidea, Arthropoda, Mollusca, Echinodermata"],
    ["images/vme/vme_p-4.jpg","Сторінка 4: інструкція з використання визначника, подяки, джерела"]
  ], "wide")}
  ${h3("Як користуватися визначником (за офіційною інструкцією)")}
  ${ul(vmeInstructions)}
  ${p("<strong>Явно виключені з індикаторних груп ВМЕ</strong> (зазначено на кожній сторінці визначника позначками «not included»), попри те що це поширений прилов:")}
  ${ul(vmeExcludedGroups)}
`) +
section("vme-codes", "7.2 Повна таблиця кодів таксонів-індикаторів (звірено за зображеннями оригіналу)", `
  ${table(["Код","Тип (Phylum)","Рівень","Загальна назва"], vmeTaxaTable)}
  ${comment("Ця таблиця відсутня в текстовому шарі оригінального PDF (там лише зображення-інфографіка) — коди вручну звірено з високороздільними зображеннями кожної з 3 сторінок-таблиць, щоб уникнути помилок автоматичного розпізнавання складної багатоколонкової верстки.")}
`) +
section("vme-terms", "7.3 Ключові терміни та вимоги", `
  ${ul([
    "<strong>Одиниця-індикатор ВМЕ (VME indicator unit)</strong> — 1 літр організмів у 10-літровому контейнері АБО 1 кг для тих, що не поміщаються в об'єм (наприклад, гіллясті види).",
    "<strong>Сегмент лінії</strong> — 1000-гачкова секція ярусу або 1200-метрова секція (яка коротша); для пасток — 1200 м.",
    "<strong>Тригерний рівень</strong> — 5 і більше одиниць-індикаторів на сегмент лінії вимагають обов'язкового відбору проб («Trigger» sample type).",
    "<strong>Ризикова зона (Risk Area)</strong> — зона радіусом 1 морська миля від середини сегмента лінії, з якого вилучено 10 і більше одиниць-індикаторів ВМЕ.",
    "Спостерігач вибирає випадково ≈30% сегментів лінії для перевірки («Random» sample type), незалежно від тригерної вибірки."
  ])}
  ${p("Регулюючі заходи: <strong>CM 22-06 / 22-07</strong> — донний промисел і потенційні ВМЕ; <strong>CM 22-09</strong> — захист зареєстрованих ВМЕ у відкритих для донного промислу районах.")}
  ${comment("Примітка документа: коди FAO збігаються з кодами CCAMLR для цих таксонів — тобто аркуш «CCAMLR codes» у формі C2 (розділ 3.1) можна використовувати для перевірки кодів ВМЕ-таксонів так само, як і для риб.")}
`);

// =====================================================================
// PAGE 08 — TAGGING
// =====================================================================

const taggingSuitabilityToothfish = [
"Гачкове ушкодження присутнє будь-де, крім ротової області",
"Зябра рожеві або білі",
"Видима кровотеча зябер або надмірна кровотеча будь-де на тілі",
"Видиме пошкодження тіла з відкритими ранами",
"Видиме пошкодження ока або проникнення в порожнину тіла (зокрема ракоподібними — бокоплавами/вошами)",
"Стирання або втрата луски на площі, що дорівнює або перевищує площу хвоста риби",
"Не виявлено рухової активності риби"
];
const taggingSuitabilitySkate = [
"Зламана щелепа або значний розрив тканини навколо рота",
"Білі або кровоточиві зябра на дорсальній чи вентральній поверхні",
"Пошкодження від вошей",
"Видимий пролапс значної частини кишківника або кровотеча",
"Травма ока або дихальця (spiracle)"
];

const eTagFields = [
["Розташування станції мічення","На палубі (відкрито) / на палубі (під накриттям) / у цеху / інше"],
["Обслуговування пристрою для мічення","Частота чищення/обслуговування апарата"],
["Вертикальні відстані","Від поверхні води до зони виборки; від точки випуску до поверхні води; відстань до станції мічення"],
["Накопичувальний резервуар","Наявність (Т/Н), об'єм (л), форма, наявність проточної води"],
["Обладнання для підйому великої риби","Сітка / ноші чи люлька / інше; мінімальна довжина риби для використання підйомного обладнання"],
["Транспортування риби","Спосіб перенесення між зоною виборки і станцією мічення"],
["Запис даних мічення","Прямо в комп'ютер / паперовий бланк / водостійка дошка"],
["Засоби випуску риби","Люлька, жолоб, інше"],
["Відповідальність за мічення","Екіпаж / спостерігач(і) / комбіновано; кількість навченого екіпажу; мова навчання"],
["Оцінка придатності риби","Використання протоколу й критеріїв придатності CCAMLR (Т/Н)"]
];

// Figure captions extracted from the official "Table of Figures" + in-text captions
// of EN - Toothfish and Skate Tagging Manual 2025.docx (Figures 1-17), translated to Ukrainian.
const figureCaptionsUA = {
  1: "Рис. 1. Комплект обладнання для мічення CCAMLR",
  2: "Рис. 2. Шаблон-лінійка CCAMLR для фотографування міток",
  3: "Рис. 3. Калькулятор статистики перекриття міток (Tag Overlap Statistic Calculator)",
  4: "Рис. 4. Облаштування та обслуговування станції мічення",
  5: "Рис. 5. Приклад тагувального пістолета (зліва) і міток (справа)",
  6: "Рис. 6. Утримуйте станцію мічення чистою й охайною",
  7: "Рис. 7. Підйомні пристрої для підтримки риби на борту",
  8: "Рис. 8. Правильні (згори) і неправильні (знизу) техніки поводження з рибою",
  9: "Рис. 9. Підйомні пристрої для великої риби",
  10: "Рис. 10. Рекомендації з поводження зі скатами",
  11: "Рис. 11. Конструкції накопичувальних резервуарів (holding tanks)",
  12: "Рис. 12. Дегачування риби перед міченням та приклади інструментів для дегачування",
  13: "Рис. 13. Нанесення міток на іклача",
  14: "Рис. 14. Правильне розташування мітки на іклачі",
  15: "Рис. 15. Нанесення міток на скатів",
  16: "Рис. 16. Оцінка придатності іклача до мічення",
  17: "Рис. 17. Оцінка придатності скатів до мічення"
};
const taggingFiles2 = fs.readdirSync(path.join(__dirname, "images/tagging2")).sort();
const taggingGallery = taggingFiles2.map(f => {
  const m = f.match(/^fig(\d+)_([a-z])\.jpg$/);
  const num = m ? parseInt(m[1], 10) : 0;
  const sub = m ? m[2] : "";
  const base = figureCaptionsUA[num] || `Рис. ${num}`;
  const suffix = sub && sub !== "a" ? ` (частина ${sub})` : "";
  return [`images/tagging2/${f}`, base + suffix];
});

const page08 = section("tagging-manual", "8.1 Toothfish and Skate Tagging Manual, версія 2025", `
  ${fileTag("EN - Toothfish and Skate Tagging Manual 2025.docx")}
  ${p("Програма мічення CCAMLR впроваджена в <strong>2007 р.</strong>; станом на 2023 р. у районі дії Конвенції позначено <strong>404 559</strong> іклача (повернуто 49 270, тобто 12%) та <strong>71 444</strong> скатів (повернуто 2 444, тобто 3%). Понад 98% повторних виловів вдається пов'язати з початковим міченням.")}
  ${h3("Підготовка до рейсу")}
  ${ul([
    "Мітки CCAMLR (партіями по 1000 шт., замовляються через Секретаріат), рекомендовано 2 апарати для мічення на партію.",
    "Апаратор і голки в справному стані, запасні частини й засоби для чищення.",
    "Сачки для підйому риби та люльки (cradles).",
    "Робоча станція: вимірювальна дошка, придатний накопичувальний резервуар."
  ])}
  ${h3("Стандартні операційні процедури мічення")}
  ${ol([
    "Тримати станцію мічення готовою протягом усього періоду виборки.",
    "Готувати підйомне спорядження заздалегідь (без використання багра-гафа).",
    "Приймати рішення про мічення конкретної риби ще до її підйому на борт.",
    "Виміряти стандартну й загальну довжину.",
    "Встановити мітки, перевірити кріплення легким натягом, записати й перевірити номери.",
    "Обережно випустити рибу назад у воду головою вперед.",
    "Записати номер виборки, долю риби та координати випуску (з містка)."
  ])}
  ${p("<strong>Загальний час поза водою — не більше 3 хвилин.</strong> Використання накопичувального резервуара — мінімізувати.")}
  ${h3("Критерії непридатності до мічення — іклач")}
  ${table(["№","Критерій"], taggingSuitabilityToothfish.map((t,i)=>[String(i+1),t]))}
  ${h3("Критерії непридатності до мічення — скати")}
  ${table(["№","Критерій"], taggingSuitabilitySkate.map((t,i)=>[String(i+1),t]))}
  ${h3("Техніка встановлення мітки")}
  ${ul([
    "<strong>Іклач:</strong> мітку вводять під кутом у другий спинний плавець так, щоб Т-подібний стрижень зафіксувався за променями плавця, вістрям назад; після встановлення — легкий натяг для перевірки кріплення.",
    "<strong>Скати:</strong> одна мітка в м'яз кожного крила з боку очей, вводиться прямовисно між променями плавця."
  ])}
  ${h3("Накопичувальні резервуари (специфікація)")}
  ${ul([
    "Розмір: щонайменше вдвічі більший за середню довжину риби (від 2 м).",
    "Гладкі стінки, бажано округла форма, високий потік чистої морської води.",
    "Об'єм риби не повинен перевищувати 10% об'єму води в резервуарі; іклач і скатів тримати окремо."
  ])}
  ${h3("Повторний вилов (recapture)")}
  ${ul([
    "Будь-яку мічену рибу передають спостерігачу для відбору проб (тип III — довжина, стать, стадія зрілості, вага, отоліти).",
    "Обов'язкове фото мітки in situ на фоні фірмового шаблону-лінійки CCAMLR з читабельним номером.",
    "Фізичні мітки повертати Секретаріату більше не потрібно — досить якісного фото; фізичні мітки знищуються на борту.",
    "Щорічний приз від COLTO (Coalition of Legal Toothfish Operators) за знайдені мітки."
  ])}
  ${comment("Ключова вимога, яку легко порушити ненавмисно: «загальний час поза водою — до 3 хвилин». Це означає, що вся процедура (від підйому до випуску) має бути відпрацьована як злагоджена командна дія.")}
`) +
section("tagging-gallery", "8.2 Ілюстрації з посібника з мічення (" + taggingGallery.length + " зображень)", `
  ${p("Клікніть на зображення, щоб відкрити його у збільшеному вигляді разом з повним підписом.")}
  ${figureGrid(taggingGallery)}
  ${comment("Кожне зображення підписано за офіційним номером «Figure N» з «Table of Figures» посібника та зіставлено з конкретним зображенням через порядок появи в структурі DOCX-файлу — замість попередніх узагальнених підписів на кшталт «Ілюстрація з посібника з мічення».")}
`) +
section("etag-survey", "8.3 Опитування щодо процедур мічення на судні", `
  ${fileTag("e-tagging procedures-2020.docx")}
  ${p("Коротке опитування (2020 р.) для суден щодо фактичних процедур мічення іклача, з проханням надати фото/відео процесу.")}
  ${table(["Блок","Питання"], eTagFields)}
  ${comment("Документ датований 2020 р. — рекомендую перевірити наявність оновленої версії опитування, узгодженої з рештою пакету (2025/2026).")}
`) +
section("hpai", "8.4 Біобезпека: пташиний грип (HPAI H5N1) — офіційні рекомендації CCAMLR", `
  ${comment("<strong>Цього розділу немає в жодному з 21 наданих документів</strong> — інформацію знайдено й додано з офіційного сайту CCAMLR (сторінка «HPAI resources», файл «HPAI Guidelines for vessels», оновлено 04.02.2025). Додано тому, що це чинний протокол біобезпеки, прямо застосовний до роботи спостерігача з морськими птахами й ссавцями (розділи 4 «Haul IMAF», 6.7 «Ластоногі», 8 «Мічення»), а сам семінар навряд чи встигне його окремо покрити.")}
  ${p("<strong>Що таке HPAI:</strong> високопатогенний грип птахів (штам H5N1) — високозаразне вірусне захворювання, що вражає диких і свійських птахів та морських ссавців. Може викликати важкі клінічні прояви й високу смертність. Передається через фекалії та респіраторні виділення; стійкий у холоді й може довго зберігатися на твердих поверхнях. Може передаватися людині — ризик оцінюється як низький-помірний, ситуація змінюється, тому рекомендовано завбачливий (precautionary) підхід: експрес-тестування на борту зазвичай неможливе.")}
  ${p("Штам H5N1 вже зафіксовано в районі дії Конвенції CCAMLR.")}
  ${h3("Протокол поводження з живими/мертвими тваринами")}
  ${ol([
    "<strong>Живі птахи/ссавці:</strong> надягти найкращі доступні на судні засоби індивідуального захисту (ЗІЗ) — одноразові латексні рукавички (бажано дві пари), маску N95, захист очей, комбінезон; зовнішній шар — непроникний одяг (типу дощовика). Тварину негайно випустити за борт.",
    "<strong>Мертві птахи/ссавці:</strong> утилізувати за борт персоналом у ЗІЗ. Якщо національне законодавство прапора судна вимагає зберігати тушку — звернутися по інструкції до відповідного національного органу щодо зберігання/утилізації.",
    "Після будь-якого контакту з твариною (навіть у рукавичках) — ретельно вимити руки водою з милом; зовнішній одяг, використаний при контакті, обробити дезінфектантом.",
    "Ділянки судна, забруднені фекаліями чи респіраторними виділеннями, промити великою кількістю морської води з відра або шланга під низьким тиском (щоб уникнути утворення аерозолю); за наявності — обробити біоцидом (напр. Virkon S).",
    "Пріоритизувати заходи пом'якшення прилову (стример-лінії, пристрої виключення тощо), щоб мінімізувати смертність альбатросів, буревісників і морських ссавців у знарядді лову й уникати контакту з потенційно інфікованими тваринами."
  ])}
  ${h3("На що звертати увагу")}
  ${p("Судна можуть зустріти тварин з нетиповою поведінкою: млявість, порушення координації, посмикування, тремор чи судоми, обвислі крила, діарея, кон'юнктивіт/почервонілі чи вкриті кіркою очі. Такі спостереження (в тому числі на березі, якщо судно проходить повз колонію) слід повідомляти відповідному національному органу — багато антарктичних видів ніколи раніше не стикалися з HPAI і можуть не мати типових ознак. За можливості безпечно зробити фото чи відео.")}
  ${p('<strong>Джерело:</strong> <a href="https://www.ccamlr.org/en/document/science/hpai-guidelines-vessels" target="_blank" rel="noopener">CCAMLR HPAI Guidelines for Vessels (офіційний сайт, PDF, оновлено 04.02.2025)</a> — рекомендую перевірити наявність новішої версії безпосередньо перед рейсом, оскільки ситуація з HPAI активно розвивається.')}
`);

// =====================================================================
// PAGE 12 — SPECIES CARDS (риби, скати, ластоногі, кити)
// =====================================================================

// Fish/skate cards WITH photo — parsed directly from the already-verified
// rossSpeciesByNum mapping (section 6.5) instead of re-typed by hand, so this
// list can never drift out of sync with the identification-guide photos.
const fishSpeciesCards = [];
for (const numStr of Object.keys(rossSpeciesByNum)) {
  const num = Number(numStr);
  const n = String(num + 1).padStart(3, "0");
  const imgPath = `images/rossfish/ross_${n}.jpg`;
  if (!fs.existsSync(path.join(__dirname, imgPath))) continue;
  const raw = rossSpeciesByNum[num];
  const m = raw.match(/^(.*?) — (.*?) \(([A-Za-z]+)\)(?:, род\. (.*))?$/);
  if (!m) continue;
  const [, latin, ua, code, family] = m;
  fishSpeciesCards.push({
    img: imgPath, latin, ua, code,
    note: family ? "род. " + family : null
  });
}
fishSpeciesCards.sort((a, b) => a.ua.localeCompare(b.ua, "uk"));

// Additional fish/skate codes that exist in the official CCAMLR code list
// (section 3.1, speciesCodesCurated) but have no dedicated photo in any
// source document — computed by exclusion so it stays correct automatically
// if the photo set above ever changes.
//
// No photo file is embedded here for any of these — the actual bitmaps found
// online belong to their photographers/sources and copying them into this
// repo would need per-image licence clearance. Instead: (a) for genuine
// species-level codes, a link to a verified external source page (FishBase /
// Wikimedia Commons file page with a stated CC licence) is given so the
// person can view a real, correctly-identified photo; (b) for genus/family/
// class-level "nei" codes, a cross-reference note points to the individual
// member species already photographed in section 12.1 above, since one
// single external photo cannot honestly represent an entire genus or family.
const fishNoPhotoExtra = {
  MVC: { sourceLink: "https://www.fishbase.se/summary/Muraenolepis-marmorata", sourceLabel: "Фото на FishBase" },
  ANI: { sourceLink: "https://commons.wikimedia.org/wiki/File:Mackerel_Icefish_(Champsocephalus_gunnari).jpg", sourceLabel: "Фото на Wikimedia Commons (CC BY-SA 2.0, Ryan Somma)" },
  LIC: { sourceLink: "https://www.inaturalist.org/taxa/541731-Channichthys-rhinoceratus/browse_photos", sourceLabel: "Фото на iNaturalist" },
  BYE: { sourceLink: "https://www.fishbase.se/summary/Bathyraja-meridionalis", sourceLabel: "Фото на FishBase" },
  BYG: { sourceLink: "https://www.inaturalist.org/taxa/95498-Bathyraja-griseocauda/browse_photos", sourceLabel: "Фото на iNaturalist" },
  ELN: { sourceLink: "https://www.inaturalist.org/taxa/617783-Electrona-antarctica/browse_photos", sourceLabel: "Фото на iNaturalist" },
  ELC: { sourceLink: "https://www.fishbase.se/summary/6985", sourceLabel: "Фото на FishBase" },
  TOT: { note: "Рід включає TOA й TOP — фото обох видів у розділі 12.1 вище." },
  GRV: { note: "Рід включає QMC, WGR, MCH, MCC — фото всіх чотирьох видів у розділі 12.1 вище." },
  ICX: { note: "Родина включає CHW, TIC, FIC, DAH, JIC — фото цих видів у розділі 12.1 вище." },
  TRT: { note: "Рід включає ERN, TRL, TRD, TLO, PTC — фото всіх п'яти видів у розділі 12.1 вище." },
  RAJ: { note: "Родина включає SRR (Amblyraja georgiana) — фото у розділі 12.1 вище." }
};
const coveredFishCodes = new Set(fishSpeciesCards.map(c => c.code));
const fishNoPhotoCards = speciesCodesCurated
  .filter(([code]) => !coveredFishCodes.has(code))
  .map(([code, latin, ua]) => Object.assign({ code, latin, ua, icon: "🐟" }, fishNoPhotoExtra[code] || {}));

// Pinniped cards — reuse the verified species table (section 6.7) plus one
// representative photo per species from the confirmed pinniped2 gallery.
const pinnipedPhotoMap = {
  SEA: "images/pinniped2/fur_seal_1.jpg",
  SES: "images/pinniped2/elephant_seal_1.jpg",
  SET: "images/pinniped2/crabeater_seal_1.jpg",
  SLW: "images/pinniped2/weddell_seal_1.jpg",
  SLP: "images/pinniped2/leopard_seal_1.jpg",
  "—": "images/pinniped2/ross_seal_1.jpg"
};
const pinnipedCards = pinnipedSpecies.map(([ua, latin, code, note]) => ({
  img: pinnipedPhotoMap[code], ua, latin,
  code: code === "—" ? null : code, note
}));

// Whale/dolphin cards — no individual species photos exist in the source
// poster (it's two full scanned pages, not cut per species), so these are
// text-only cards using the verified length data from section 6.8.
const whaleCards = whaleSpecies.map(([ua, latin, length]) => ({
  ua, latin, note: "Довжина: " + length, icon: "🐋"
}));

const page12 = section("species-fish", "12.1 Риби та скати моря Росса — фотокартки за видами (" + fishSpeciesCards.length + ")", `
  ${p("Кожна картка зіставлена з конкретним фото визначника «Fishes of the Ross Sea Region» (2015) за номером сторінки оригіналу — джерело те саме, що й у розділі 6.5.")}
  ${speciesGrid(fishSpeciesCards)}
`) +
section("species-fish-nophoto", "12.2 Додаткові родові/групові коди риб без фото (" + fishNoPhotoCards.length + ")", `
  ${p("Ці коди присутні в офіційному довіднику CCAMLR (аркуш «CCAMLR codes» файлу en_C2_2026a.xlsx, розділ 3.1), але окремого фото виду в наданих джерелах немає — переважно це родові/групові коди («nei» — not elsewhere identified) або види, не представлені у визначнику Ross Sea Fishes.")}
  ${speciesGrid(fishNoPhotoCards)}
`) +
section("species-pinniped", "12.3 Ластоногі — фотокартки за видами (" + pinnipedCards.length + ")", `
  ${p("Джерело фото й ознак — «CCAMLR protocols for pinniped identification», розділ 6.7.")}
  ${speciesGrid(pinnipedCards)}
`) +
section("species-whales", "12.4 Кити та дельфіни — картки видів (" + whaleCards.length + ", без фото)", `
  ${p("Постер ASOC (розділ 6.8) містить лише 2 суцільні відскановані сторінки постера, не нарізані по окремих видах, тому фото-карток тут немає — лише перевірені назви й довжина.")}
  ${speciesGrid(whaleCards)}
  ${comment("Морські птахи (альбатроси, буревісники тощо) у наданому пакеті документів згадуються лише текстово (CM 25-02, 24-02, розділ Haul IMAF) — жодного окремого фото чи переліку видів птахів у джерелах немає, тому картки птахів на цій сторінці відсутні, щоб не вигадувати дані.")}
`);

// =====================================================================
// PAGE 13 — БІБЛІОТЕКА ДОКУМЕНТІВ
// =====================================================================

function libRow(name, desc) {
  const href = docMap[name];
  const ext = (name.split(".").pop() || "").toUpperCase();
  const actions = href
    ? `<a href="${href}" target="_blank" rel="noopener">↗ Переглянути</a><br><a href="${href}" download>⬇ Завантажити</a>`
    : "—";
  return [`<strong>${name}</strong><br><span class="muted">${ext}</span>`, desc, actions];
}

function libSection(id, title, rows) {
  return section(id, title, `
    ${table(["Документ", "Опис / де використовується на сайті", "Дії"], rows)}
  `);
}
// libRowUa: row for the Ukrainian "розгорнутий структурований переказ" (own-words
// summary — NOT a verbatim translation) of each original document, prepared for
// Library section 9. `name` is the ORIGINAL document's key in docMapUa, so the
// same lookup name used throughout the rest of the Library page can be reused.
function libRowUa(name, desc) {
  const href = docMapUa[name];
  const actions = href
    ? `<a href="${href}" target="_blank" rel="noopener">↗ Переглянути</a><br><a href="${href}" download>⬇ Завантажити</a>`
    : "—";
  return [`<strong>${name}</strong><br><span class="muted">переказ, DOCX</span>`, desc, actions];
}

const page13 =
libSection("lib-1", "1. Керівні документи (3)", [
  libRow("e-pt1_3.pdf", "Текст Конвенції про збереження морських живих ресурсів Антарктики — використано в розділі 1.1."),
  libRow("e-pt10_4.pdf", "Схема міжнародного наукового спостереження CCAMLR (SISO) — розділ 1.2."),
  libRow("e-SISO Manual Finfish Fisheries 2026.pdf", "Scientific Observer's Manual — Finfish Fisheries 2026, основний посібник спостерігача — розділ 1.3.")
]) +
libSection("lib-2", "2. Заходи зі збереження (1)", [
  libRow("EN - schedule 2025-26.pdf", "Розклад чинних заходів зі збереження сезону 2025/26 (Schedule of Conservation Measures) — розділ 2.1.")
]) +
libSection("lib-3", "3. Форми головні (4)", [
  libRow("en_C2_2026a.xlsx", "Форма електронного ярусного журналу en_C2v2026a — розділ 3.1."),
  libRow("CCAMLR Scientific Observer Longline Vessel Cruise Report 2026.docx", "Звіт про рейс наукового спостерігача 2026 — розділ 3.2."),
  libRow("EN - Movement_10-04 Annex A.xlsx", "Довідник переміщення суден, Annex 10-04/A — розділ 3.3."),
  libRow("CCAMLR Tag Overlap Statistic Calculator_v2026.xlsm", "Калькулятор статистики перекриття мічення v2026 — розділ 3.4.")
]) +
libSection("lib-4", "4. Форми та інструкції (2)", [
  libRow("2026 Observer Longline Logbook Instructions.pdf", "Інструкція з електронного ярусного журналу, версія OL_v2026 — розділ 4.1."),
  libRow("EN - C2 Longline Fisheries Commercial data manual 2025_1.pdf", "Commercial Data Collection Manual — Longline Fisheries 2025 — розділ 4.3.")
]) +
libSection("lib-5", "5. Знаряддя лова (1)", [
  libRow("Illustrated generic gear diagrams_2023 v1.3.docx", "Ілюстровані генеричні схеми ярусного знаряддя лова v1.3 — розділ 5.1.")
]) +
libSection("lib-6", "6. Визначники (7)", [
  libRow("Identification Guide for Toothfish (poster).pdf", "Офіційний постер-визначник іклача (Identification Guide for Toothfish) — розділ 6.1."),
  libRow("DIssostichis eleginoides gonad guide.docx", "Атлас стадій зрілості гонад Dissostichus eleginoides — розділ 6.3."),
  libRow("Easy Identification Keys for Grenadiers in 88.1 and 88.3_Sagndeok.pdf", "Ключі визначення долгохвостів роду Macrourus у підрайонах 88.1 і 88.3 — розділ 6.4."),
  libRow("Fishes of the Ross Sea Region_A field guide to common species caught in the longline fishery (2015).pdf", "Польовий визначник «Fishes of the Ross Sea Region» (2015) — основне джерело фотокарток видів у розділах 6.5 і 12.1–12.2."),
  libRow("риба.doc", "Довідка з фотографіями видів риб і кодами — розділ 6.6."),
  libRow("CCAMLR protocols for pinniped identification (1).docx", "Протокол ідентифікації, статі та промірів ластоногих — розділ 6.7 і картки видів 12.3."),
  libRow("SOUTHERN OCEAN whales and dolphins (ASOC poster).pdf", "Постер ASOC «Southern Ocean whales and dolphins» — розділ 6.8 і картки видів 12.4.")
]) +
libSection("lib-7", "7. VME (1)", [
  libRow("CCAMLR_VME_guide_2023V2.pdf", "CCAMLR VME Taxa Classification Guide 2023, версія 2 — розділ 7.1.")
]) +
libSection("lib-8", "8. Мічення / Tagging (2)", [
  libRow("EN - Toothfish and Skate Tagging Manual 2025.docx", "Toothfish and Skate Tagging Manual, версія 2025 — розділ 8.1."),
  libRow("e-tagging procedures-2020.docx", "Опитування щодо процедур мічення на судні (2020) — розділ 8.3.")
]) +
comment("Це всі 21 первинних документа, надані для підготовки до семінару та іспиту. Файли відкриваються в новій вкладці або завантажуються напряму з сайту — окремо шукати їх не потрібно.") +
section("lib-9", "9. Перекази документів українською (усі 21)", `
  ${comment("Це НЕ дослівні переклади офіційних документів (їх я не можу поширювати як окремі файли — це стосується авторського права), а розгорнуті структуровані перекази — детальний виклад змісту кожного документа своїми словами українською мовою, підготовлений для підготовки до іспиту. Для юридично точних формулювань, повних таблиць і оригінальних зображень завжди звертайтесь до оригіналу (пункти 1–8 вище).")}
  ${table(["Документ (переказ)", "Що охоплює", "Дії"], [
    libRowUa("e-pt1_3.pdf", "Переказ Конвенції CCAMLR: усі 33 статті стисло, з поясненням практичного значення для спостерігача."),
    libRowUa("e-pt10_4.pdf", "Переказ Схеми SISO: розділи A–H, Додаток I (функції спостерігача), Додаток II (план дій у надзвичайних ситуаціях)."),
    libRowUa("e-SISO Manual Finfish Fisheries 2026.pdf", "Переказ Scientific Observer's Manual: структура з 17 розділів, ключові теми (виміри, зрілість, отоліти, коефіцієнти переведення, мічення, ВМЕ)."),
    libRowUa("EN - schedule 2025-26.pdf", "Переказ Schedule of Conservation Measures: усі серії заходів (10–91) з поясненнями, чинні резолюції."),
    libRowUa("en_C2_2026a.xlsx", "Переказ структури форми C2: усі 9 аркушів, витяг видових кодів, практичні зауваги."),
    libRowUa("CCAMLR Scientific Observer Longline Vessel Cruise Report 2026.docx", "Переказ структури Звіту про рейс: усі 16 таблиць з поясненнями, на що звернути увагу."),
    libRowUa("EN - Movement_10-04 Annex A.xlsx", "Переказ призначення й полів довідника переміщення суден, перелік підрайонів/поділів."),
    libRowUa("CCAMLR Tag Overlap Statistic Calculator_v2026.xlsm", "Переказ методики розрахунку статистики перекриття мічення, порядок заповнення, обмеження."),
    libRowUa("2026 Observer Longline Logbook Instructions.pdf", "Детальний переказ інструкції за кожним з 12 аркушів журналу, коди травм скатів."),
    libRowUa("EN - C2 Longline Fisheries Commercial data manual 2025_1.pdf", "Переказ посібника для судна: історія версій форми C2, ключові визначення."),
    libRowUa("Illustrated generic gear diagrams_2023 v1.3.docx", "Переказ типів знарядь лова: трали, ярусна снасть, пастки, пристрої виключення ссавців."),
    libRowUa("Identification Guide for Toothfish (poster).pdf", "Переказ постера визначення іклача: систематика, розрізнення видів, стадії зрілості гонад."),
    libRowUa("DIssostichis eleginoides gonad guide.docx", "Переказ фотоатласу стадій зрілості гонад патагонського іклача."),
    libRowUa("Easy Identification Keys for Grenadiers in 88.1 and 88.3_Sagndeok.pdf", "Переказ ключів визначення 4 видів довгохвостів роду Macrourus."),
    libRowUa("Fishes of the Ross Sea Region_A field guide to common species caught in the longline fishery (2015).pdf", "Переказ визначника: 11 родин, 30 видів, структура фотогалереї та «Quick key»."),
    libRowUa("риба.doc", "Переказ довідки з кодами видів риб, перевірка достовірності кожного коду."),
    libRowUa("CCAMLR protocols for pinniped identification (1).docx", "Переказ протоколу: 6 видів ластоногих, визначення статі, виміри, безпека."),
    libRowUa("SOUTHERN OCEAN whales and dolphins (ASOC poster).pdf", "Переказ постера ASOC: 14 видів китоподібних, типи косаток, загрози Південного океану."),
    libRowUa("CCAMLR_VME_guide_2023V2.pdf", "Переказ визначника ВМЕ: повна таблиця кодів таксонів-індикаторів, ключові терміни й вимоги."),
    libRowUa("EN - Toothfish and Skate Tagging Manual 2025.docx", "Переказ посібника з мічення: підготовка, СОП, критерії непридатності, техніка встановлення мітки."),
    libRowUa("e-tagging procedures-2020.docx", "Переказ опитування 2020 року щодо процедур мічення на судні.")
  ])}
`);

// =====================================================================
// PAGE 14 — GLOSSARY (EN → UA + вимова кирилицею)
// =====================================================================

// Pronunciation is an approximate Cyrillic phonetic guide for a Ukrainian
// speaker, not IPA — good enough to say the term out loud on the radio/deck,
// not a substitute for a real audio dictionary.
const glossaryForms = [
["Set / Haul", "[сет / гол]", "Постановка / виборка", "Одна операція закидання (set) або підняття (haul) ярусу; Haul ID — наскрізний номер конкретної виборки."],
["Streamer line", "[стрі́мер лайн]", "Стример-лінія", "Лінія зі стрічками-відлякувачами над ярусом під час постановки — зменшує прилов морських птахів (CM 25-02)."],
["Holding tank", "[го́улдін тенк]", "Накопичувальний резервуар", "Ємність з проточною водою для тимчасового утримання риби перед міченням чи випуском."],
["Longline", "[ло́нглайн]", "Ярус", "Знаряддя лову: довга головна лінія з численними наживленими гачками на повідцях."],
["Trotline", "[тро́тлайн]", "Тротлайн", "Ярус, де гачки прикріплені кластерами до плавучої головної лінії через троти (відгалуження)."],
["Spanish line", "[спе́ніш лайн]", "Іспанська снасть", "Ярус з додатковою становою лінією (backbone), приєднаною до головної лінії."],
["Mainline", "[ме́йнлайн]", "Головна лінія", "Основна лінія ярусу, до якої кріпляться повідці з гачками."],
["Snood", "[снуд]", "Повідець (снуд)", "Короткий відрізок лески між головною лінією та гачком."],
["Bait", "[бейт]", "Приманка", "Наживка на гачку (кальмар, скумбрія тощо)."],
["Green weight", "[грін вейт]", "Зелена вага", "Вага риби до переробки (цілої, як щойно виловлена)."],
["Processed weight", "[про́усест вейт]", "Вага продукту", "Вага риби після переробки (філе, потрошена тощо)."],
["Conversion factor", "[конве́ршн фе́ктор]", "Коефіцієнт переведення", "Співвідношення зеленої ваги до ваги переробленого продукту."],
["Bycatch", "[ба́йкетч]", "Прилов", "Улов видів, що не є цільовими для промислу."],
["Discard", "[діска́рд]", "Викид", "Улов, викинутий назад у море (живим або мертвим)."],
["Line segment", "[лайн се́гмент]", "Сегмент лінії", "Секція ярусу на 1000 гачків або 1200 м (яка коротша) — облікова одиниця для ВМЕ."],
["Trigger level", "[три́ггер левл]", "Тригерний рівень", "Поріг (5+ одиниць-індикаторів ВМЕ на сегмент), що вимагає обов'язкового відбору проб."],
["Cruise report", "[круз ріпо́рт]", "Звіт про рейс", "Підсумковий описовий документ спостерігача після завершення рейсу."],
["Vessel notification", "[ве́сл ноутіфіке́йшн]", "Нотифікація судна", "Офіційне повідомлення CCAMLR про намір судна вести промисел."],
["Waste disposal", "[вейст діспо́узл]", "Утилізація відходів", "Процедури поводження зі сміттям і втраченим знаряддям лову на борту."],
["Grid / Mesh panel", "[ґрід / меш пе́нел]", "Решітка / сітчаста панель", "Два типи пристроїв виключення морських ссавців із трала."]
];

const glossaryAbbr = [
["CCAMLR", "[сі-кем-ла́р]", "Commission for the Conservation of Antarctic Marine Living Resources", "Комісія зі збереження морських живих ресурсів Антарктики."],
["SISO", "[са́йсоу]", "Scheme of International Scientific Observation", "Схема міжнародного наукового спостереження CCAMLR."],
["VME", "[ві-ем-і]", "Vulnerable Marine Ecosystem", "Вразлива морська екосистема."],
["IMAF", "[а́ймаф]", "Incidental Mortality Associated with Fishing", "Випадкова смертність морських птахів/ссавців, пов'язана з промислом."],
["SDRAL", "[ес-ді-ар-ей-е́л]", "Scales in a Diagonal Row from Anus to Lateral line", "Кількість лусок у діагональному ряду від ануса до бічної лінії (ключова ознака Macrourus spp.)."],
["CDS", "[сі-ді-е́с]", "Catch Documentation Scheme", "Схема документування вилову іклача."],
["VMS", "[ві-ем-е́с]", "Vessel Monitoring System", "Супутникова система моніторингу суден."],
["IUU", "[ай-ю-ю]", "Illegal, Unreported and Unregulated (fishing)", "Незаконний, незареєстрований і нерегульований промисел."],
["WG-FSA", "[дабл'ю-джі еф-ес-е́й]", "Working Group on Fish Stock Assessment", "Робоча група CCAMLR з оцінки рибних запасів."],
["CEMP", "[семп]", "CCAMLR Ecosystem Monitoring Program", "Програма моніторингу екосистеми CCAMLR."],
["EEZ", "[і-і-зе́д]", "Exclusive Economic Zone", "Виключна економічна зона."],
["MRCC", "[ем-ар-сі-сі]", "Maritime Rescue Co-ordination Centre", "Морський рятувально-координаційний центр."],
["COLTO", "[ко́лтоу]", "Coalition of Legal Toothfish Operators", "Коаліція легальних операторів промислу іклача — пропонує приз за знайдені мітки."],
["SSRU", "[ес-ес-ар-ю]", "Small-Scale Research Unit", "Дрібномасштабна дослідницька одиниця (поділ підрайону для управління промислом)."],
["UTC", "[ю-ті-сі]", "Coordinated Universal Time", "Всесвітній координований час — обов'язковий формат часу в усіх формах спостерігача."],
["NIWA", "[ні́ва]", "National Institute of Water and Atmospheric Research", "Новозеландський науковий інститут — видавець визначника Ross Sea Fishes."],
["ASOC", "[е́йсок]", "Antarctic and Southern Ocean Coalition", "Природоохоронна коаліція — видавець постера китоподібних (не CCAMLR)."]
];

const glossaryBio = [
["Gonad", "[ґо́унед]", "Гонада", "Статева залоза (яєчник або сім'яник); за її станом визначають стадію зрілості риби."],
["Otolith", "[о́утоліт]", "Отоліт", "Кальцинована структура внутрішнього вуха риби; за кільцями росту визначають вік."],
["Standard length (SL)", "[сте́ндард ленгс]", "Стандартна довжина", "Від кінчика писка до кінця хребетного стовпа (без хвостового плавця)."],
["Total length (TL)", "[то́утал ленгс]", "Загальна довжина", "Від кінчика писка до найдальшого кінчика хвоста."],
["Wingspan (WS)", "[ві́нгспен]", "Розмах крил", "Ширина диска ската від кінчика до кінчика грудних плавців («крил»)."],
["Snout to anus (SA)", "[снаут ту е́йнас]", "Довжина писок-анус", "Вимір для довгохвостів (Macrourus spp.) — від кінчика писка до анального отвору."],
["Maturity stage", "[мет'ю́риті стейдж]", "Стадія зрілості", "Класифікація ступеня розвитку гонад (наприклад, F1–F5 для самок іклача)."],
["Predation", "[приде́йшн]", "Хижацтво", "Поїдання риби хижаком (наприклад, косаткою) під час виборки ярусу."],
["Depredation", "[депридейшн]", "Депредація", "Крадіжка риби чи наживки хижаком з гачків без повного поїдання (частковий вилов)."],
["Codend", "[код-е́нд]", "Куток сітки", "Кінцева, найвужча частина трала, де накопичується улов."],
["Sub-sample", "[саб-се́мпл]", "Суб-вибірка", "Частина загального вилову, відібрана для детального біологічного аналізу."],
["Species code", "[спі́шіз коуд]", "Видовий код", "Стандартизований трилітерний код виду (наприклад, TOA для Dissostichus mawsoni)."]
];

function glossRow([en, pron, ua, def]) {
  return [`<strong>${en}</strong><br><span class="muted">${pron}</span>`, ua, def];
}

const page14 = section("gloss-forms", "Терміни форм і журналу", `
  ${p("Фонетична вимова — наближена транскрипція кирилицею для зручності, а не точний фонетичний стандарт (IPA). Наголошений склад позначено похилим апострофом.")}
  ${table(["Термін (EN) / вимова", "Українською", "Пояснення"], glossaryForms.map(glossRow))}
`) +
section("gloss-abbr", "Скорочення й абревіатури", `
  ${table(["Абревіатура / вимова", "Розшифровка (EN)", "Пояснення"], glossaryAbbr.map(([abbr, pron, full, def]) => [
    `<strong>${abbr}</strong><br><span class="muted">${pron}</span>`, full, def
  ]))}
`) +
section("gloss-bio", "Біологічні й анатомічні терміни", `
  ${table(["Термін (EN) / вимова", "Українською", "Пояснення"], glossaryBio.map(glossRow))}
  ${comment("Глосарій охоплює терміни, що найчастіше трапляються в журналах, формах та інструкціях цього сайту — це не вичерпний словник англійської рибогосподарської термінології.")}
`);

// =====================================================================
// PAGE 15 — FLASHCARDS
// =====================================================================

const flashTerms = [
  ...glossaryForms.map(([en, pron, ua, def]) => ({ front: en + "<br><span class=\"flash-pron\">" + pron + "</span>", back: "<strong>" + ua + "</strong><br>" + def })),
  ...glossaryAbbr.map(([abbr, pron, full, def]) => ({ front: abbr + "<br><span class=\"flash-pron\">" + pron + "</span>", back: "<strong>" + full + "</strong><br>" + def })),
  ...glossaryBio.map(([en, pron, ua, def]) => ({ front: en + "<br><span class=\"flash-pron\">" + pron + "</span>", back: "<strong>" + ua + "</strong><br>" + def }))
].map((c, i) => ({ ...c, id: "t" + i }));

const flashCodes = [
  ...speciesCodesCurated.map(([code, latin, ua]) => ({ front: code, back: "<em>" + latin + "</em><br>" + ua })),
  ...pinnipedSpecies.filter(r => r[2] && r[2] !== "—").map(([ua, latin, code]) => ({ front: code, back: "<em>" + latin + "</em><br>" + ua }))
].map((c, i) => ({ ...c, id: "c" + i }));

const page15 = section("flash-intro", "Флеш-картки", `
  ${p("Швидкий режим повторення: натисніть на картку, щоб побачити відповідь, і рухайтесь далі кнопками. Оберіть колоду вище — терміни глосарію, видові коди або власноруч позначені «важкі» картки.")}
  <div id=\"flashApp\" class=\"flashcards\">
    <div class=\"flash-tabs\">
      <button class=\"flash-tab active\" data-deck=\"terms\" type=\"button\">Терміни (${flashTerms.length})</button>
      <button class=\"flash-tab\" data-deck=\"codes\" type=\"button\">Коди видів (${flashCodes.length})</button>
      <button class=\"flash-tab\" data-deck=\"hard\" id=\"flashHardTab\" type=\"button\">★ Важкі (0)</button>
    </div>
    <div class=\"flash-progress\" id=\"flashProgress\">1 / ${flashTerms.length}</div>
    <div class=\"flashcard\" id=\"flashCard\" tabindex=\"0\" role=\"button\" aria-label=\"Натисніть, щоб перевернути картку\">
      <div class=\"flashcard-face flashcard-front\" id=\"flashFront\"></div>
      <div class=\"flashcard-face flashcard-back\" id=\"flashBack\" style=\"display:none;\"></div>
    </div>
    <div class=\"flash-controls\">
      <button id=\"flashPrev\" class=\"btn btn-secondary\" type=\"button\">← Назад</button>
      <button id=\"flashFlip\" class=\"btn\" type=\"button\">Перевернути</button>
      <button id=\"flashNext\" class=\"btn btn-secondary\" type=\"button\">Далі →</button>
    </div>
    <div class=\"flash-controls\">
      <button id=\"flashHardToggle\" class=\"btn btn-star\" type=\"button\">☆ Позначити важкою</button>
      <button id=\"flashShuffle\" class=\"btn btn-secondary\" type=\"button\">🔀 Перемішати</button>
      <button id=\"flashRestart\" class=\"btn btn-secondary\" type=\"button\">↺ Спочатку</button>
    </div>
  </div>
  <script type=\"application/json\" id=\"flashData\">${JSON.stringify({ terms: flashTerms, codes: flashCodes })}</script>
  ${comment("Колода «Терміни» складена з розділу «Глосарій термінів», колода «Коди видів» — з видових кодів, використаних у розділах 3.1, 6.6 і 6.7 сайту. Колода «★ Важкі» — картки, позначені зіркою під час повторення; список зберігається лише у вашому браузері.")}
`);

// =====================================================================
// PAGE 16 — PRE-TRIP CHECKLIST
// =====================================================================

let checklistCounter = 0;
function checklistItem(text) {
  checklistCounter++;
  return `<label class="checklist-item"><input type="checkbox" class="checklist-check" data-id="ci-${checklistCounter}"><span>${text}</span></label>`;
}
function checklistGroup(title, items) {
  return `${h3(title)}<div class="checklist-group">${items.map(checklistItem).join("")}</div>`;
}

const checklistDocs = [
  "Паспорт, дійсний щонайменше 6 місяців від дати завершення рейсу",
  "Віза (якщо потрібна для порту посадки/висадки)",
  "Контракт або лист-призначення від організації-роботодавця",
  "Посвідчення наукового спостерігача SISO",
  "Поліс медичного страхування, дійсний на весь період рейсу",
  "Копії кваліфікаційних сертифікатів (морська підготовка, перша допомога тощо)",
  "Контакти технічного координатора та Секретаріату CCAMLR (ccamlr@ccamlr.org, +61 3 6210 1111)"
];
const checklistPrep = [
  "Опрацьовано всі 8 тематичних розділів сайту",
  "Пройдено самоперевірку (тест на 80 питань) з прийнятним результатом",
  "Переглянуто «Шпаргалку» — ключові цифри й критерії",
  "Переглянуто «Глосарій термінів» — англійські терміни й абревіатури",
  "Перевірено, чи є актуальна версія Schedule of Conservation Measures на поточний сезон",
  "Збережено сайт офлайн (PWA) — перевірено роботу без інтернету"
];
const checklistGear = [
  "Теплий багатошаровий одяг для роботи на відкритій палубі",
  "Водонепроникне взуття з нековзною підошвою",
  "Робочі рукавички (кілька пар)",
  "Засоби індивідуального захисту на випадок контакту з птахами/ссавцями (латексні рукавички, маска, захист очей — протокол HPAI)",
  "Особисті ліки та аптечка першої допомоги",
  "Засоби зв'язку (за домовленістю з роботодавцем)"
];
const checklistEquipment = [
  "Ноутбук або планшет із завантаженими формами (en_C2v2026a, шаблони)",
  "Власна вимірювальна дошка (якщо не надається судном)",
  "Фотоапарат або смартфон для фото міток і ВМЕ-індикаторів",
  "Окремий цифровий фотоапарат (не лише смартфон) — для якісних фото прилову, міток і VME-індикаторів",
  "Екшн-камера (напр. GoPro) для фото- і відеофіксації процедур мічення",
  "Зарядні пристрої та павербанк (автономне живлення)",
  "Роздруковані або збережені офлайн ключові документи (журнал, VME-визначник, Tagging Manual)"
];
const checklistFinal = [
  "Зв'язатися з капітаном або агентом судна щодо дати й місця посадки",
  "Підтвердити дату виходу судна в рейс",
  "Перевірити нотифікацію судна на офіційному сайті CCAMLR",
  "Додати дати семінарів та іспиту в календар (.ics на головній сторінці)",
  "Повідомити технічного координатора про готовність до виходу в рейс"
];

const page16 = section("checklist-intro", "Чек-лист підготовки до рейсу", `
  ${p("Позначайте виконані пункти — прогрес зберігається у вашому браузері й нікуди не надсилається.")}
  <div id="checklistApp">
    <div class="checklist-progress-bar"><div class="checklist-progress-fill" id="checklistFill"></div></div>
    <div class="checklist-progress-text" id="checklistProgressText">0%</div>
    <button id="checklistReset" class="btn btn-secondary" type="button">↺ Скинути всі позначки</button>
  </div>
  ${checklistGroup("Документи (перед виїздом)", checklistDocs)}
  ${checklistGroup("Технічна підготовка (цей сайт)", checklistPrep)}
  ${checklistGroup("Особисте спорядження", checklistGear)}
  ${checklistGroup("Обладнання для роботи", checklistEquipment)}
  ${checklistGroup("Останні кроки перед виходом у море", checklistFinal)}
  ${comment("Це орієнтовний перелік, складений на основі вимог і рекомендацій з документів пакету — не офіційний обов'язковий список CCAMLR. Уточнюйте конкретні вимоги у вашого роботодавця й технічного координатора.")}
`);

// =====================================================================
// PAGE 17 — OTHER FISHERIES: KRILL, SQUID, CRAB
// Sources: ccamlr.org/en/fisheries/krill-fisheries, Schedule of Conservation
// Measures 2025/26, CCAMLR measure pages 52-01..52-03, 61-01 (all accessed
// July 2026). Site так само як і в інших розділах фокусується на іклачі —
// цей розділ додає стислий огляд трьох інших промислів зони ККАМЛР.
// =====================================================================

const page17 = section("krill", "17.1 Промисел антарктичного криля (Euphausia superba)", `
  ${p("Криль — наймасовіший за обсягом вилову промисел зони ККАМЛР, суттєво відмінний від ярусного промислу іклача логістикою обліку й документообігом спостерігача.")}
  ${table(["Параметр", "Значення"], [
    ["Райони промислу", "Підрайони 48.1–48.4 (діючий промисел), 48.6 (дослідницький, наразі не веде вилову), дивізіони 58.4.1 і 58.4.2 (діючі)"],
    ["Знаряддя лову", "Пелагічний або беам-трал, глибина 0–250 м; безперервна система відкачування криля з кутка трала на борт під час тралення (continuous fishing system); також помпи для розвантаження трала біля борту"],
    ["Ліміт вилову — Підрайони 48.1–48.4", "Застережний ліміт 5,61 млн т, тригерний рівень 620 000 т (CM 51-01 (2024))"],
    ["Ліміт вилову — Дивізіон 58.4.1", "440 000 т (CM 51-02 (2024))"],
    ["Ліміт вилову — Дивізіон 58.4.2", "2 645 000 т (CM 51-03 (2024))"]
  ])}
  ${comment("Актуальна подія (сезон 2025/26): вилов у Підрайоні 48 у 2025 р. досяг історичного максимуму (~624 918 т) і вперше перевищив тригерний рівень CM 51-01 — промисел криля в Підрайоні 48 було закрито 1 серпня 2026 р. Джерела: ccamlr.org/en/fisheries/krill-fisheries, новини CCAMLR за 2026 р. Перевіряйте статус промислу на початок вашого рейсу — правила щосезону переглядаються.")}
  ${p("<strong>Для спостерігача:</strong> обсяги вилову й темп обробки на промислі криля значно вищі, ніж на ярусному лові іклача — обробка часто безперервна. Форми обліку прилову й біологічного відбору проб для криля відрізняються від форми C2 (яка розрахована на ярусний промисел); ознайомтеся з формою, специфічною для тралового промислу криля, до початку рейсу — уточнюйте в технічного координатора, яка саме форма застосовується на вашому судні.")}
`) +
section("squid", "17.2 Промисел кальмарів (Martialia hyadesi)", `
  ${p("Промисловий вид — <em>Martialia hyadesi</em> (семизірковий летючий кальмар).")}
  ${ul([
    "У 1990-х роках проводився дослідницький (exploratory) промисел біля Південної Джорджії (Підрайон 48.3); захід CM 61-01 діяв з 1996 р., але втратив чинність у 2009 р.",
    "Станом на 2026 рік діючого комерційного промислового флоту на кальмара в зоні ККАМЛР немає.",
    "Кальмар (зокрема гігантські екземпляри) частіше трапляється спостерігачу як <strong>прилов</strong> на ярусному промислі іклача, ніж як цільовий об'єкт промислу."
  ])}
  ${comment("Рекомендація для спостерігача при прилові великого/гігантського кальмара: фіксувати вид (або найнижчий можливий таксономічний рівень), масу і стан особини у формі прилову; при підйомі великого кальмара на борт дотримуватися обережності — можливі травми через різкі рухи щупалець і виверження чорнила.")}
`) +
section("crab", "17.3 Промисел крабів (Paralomis spp.)", `
  ${p("Промислові види — <em>Paralomis spinosissima</em> та <em>Paralomis formosa</em>.")}
  ${table(["Захід", "Район", "Статус"], [
    ["CM 52-01", "Підрайон 48.3", "Історично діяв; наразі активного промислу немає"],
    ["CM 52-02", "Підрайон 48.2", "Дослідницький промисел проведено у 2009/10; захід не поновлено з 2010/11 — Науковий комітет визнав промисел нежиттєздатним"],
    ["CM 52-03", "Підрайон 48.4", "Втратив чинність у 2010 р."]
  ])}
  ${ul([
    "Мінімальний розмір для утримання улову: самці <em>P. spinosissima</em> — ширина карапаксу ≥102 мм; самці <em>P. formosa</em> — ≥90 мм.",
    "Станом на 2026 рік діючого комерційного промислу крабів у зоні дії Конвенції немає."
  ])}
  ${comment("Не плутайте промислового краба (Paralomis spp., ряд Decapoda) з тюленем-крабоїдом (Lobodon carcinophagus, код SET) — це різні тварини; крабоїд харчується крилем, а не є об'єктом промислу крабів. Див. картку виду в розділі «Картки видів».")}
`);

// =====================================================================
// PAGE 18 — INSPECTION SYSTEM
// Source: ccamlr.org/en/compliance/inspections, CM 10-02, CM 10-03 (2024),
// accessed July 2026.
// =====================================================================

const page18 = section("insp-general", "18.1 Загальна структура Інспекційної системи", `
  ${p("Інспекційну систему ККАМЛР засновано 1989 р. на основі ст. XXIV Конвенції для контролю дотримання суднами заходів зі збереження. Вона передбачає:")}
  ${ul([
    "процедуру призначення інспекторів державами-членами (Designated Inspectors) — щосезону;",
    "права й обов'язки інспекторів під час підйому на борт і проведення інспекції;",
    "процедури звітування за результатами інспекції;",
    "підстави для переслідування судна державою прапора на основі доказів, зібраних інспектором;",
    "санкції за виявлені порушення."
  ])}
`) +
section("insp-sea", "18.2 Інспекція в морі (CM 10-02)", `
  ${p("Інспектор, призначений <strong>будь-якою</strong> Договірною стороною, має право підніматися на борт і інспектувати рибальське судно <strong>іншої</strong> Договірної сторони в зоні дії Конвенції — незалежно від того, під прапором якої держави це судно ходить.")}
  ${p("За результатами складається звіт про інспекцію в морі (at-sea inspection report), який передається до Секретаріату ККАМЛР і державі прапора судна.")}
`) +
section("insp-port", "18.3 Портова інспекція (CM 10-03)", `
  ${table(["Вимога", "Деталі"], [
    ["Судна з іклачем на борту", "Обов'язкова інспекція 100% таких суден при заході в порт"],
    ["Судна з іншими антарктичними ресурсами", "Обов'язкова інспекція не менше 50% таких суден"],
    ["Попереднє повідомлення", "Судно подає дані про намір зайти в порт щонайменше за 48 годин"],
    ["Перевірка документації", "Вивантаження/перевантаження іклача звіряється з документацією Catch Documentation Scheme (CDS)"]
  ])}
`) +
section("insp-observer", "18.4 Взаємодія наукового спостерігача з інспекторами", `
  ${p("Спостерігач <strong>не є</strong> інспектором і не має повноважень примусового характеру. Проте його журнали й записи (електронний журнал C2, Cruise Report) є джерелом інформації, яку інспектор може звіряти під час морської чи портової перевірки.")}
  ${comment("Практична порада: ведіть записи акуратно й вчасно (день у день, а не «заднім числом») — саме така документація найкраще витримує звірку під час інспекції та підтверджує сумлінність спостерігача.")}
`) +
section("insp-iuu", "18.5 Звітність про ННН-промисел і забруднення моря", `
  ${p("Якщо спостерігач помічає ознаки незаконного, незареєстрованого й нерегульованого (ННН/IUU) промислу — підозріле судно, покинуте знаряддя лову — або факти забруднення моря, слід зафіксувати координати, час і опис події та подати окремий звіт (загальний або спеціальний) згідно з інструкціями організації, що відряджає спостерігача.")}
`);

// =====================================================================
// PAGE 19 — INTERNSHIP PROGRAM (cross-reference schedule ↔ site sections)
// Based on the uploaded 3-day internship agenda for CCAMLR observer
// candidates. Reproduced as a schedule/orientation table — original
// document contains only session titles, no substantive content, so no
// copyright concern in restating the agenda itself.
// =====================================================================

let lectureCounter = 0;
function lectureRow(topic, where, lecture) {
  lectureCounter++;
  const id = "lec-" + lectureCounter;
  const toggle = lecture
    ? `<button class="lecture-toggle" data-target="${id}" type="button">▼ Лекція</button>`
    : "";
  const lectureRowHtml = lecture
    ? `<tr class="lecture-row" id="${id}"><td colspan="3"><div class="lecture-text">${lecture}</div></td></tr>`
    : "";
  return `<tr><td>${topic}</td><td>${where}</td><td>${toggle}</td></tr>${lectureRowHtml}`;
}
function lectureTable(rows) {
  return `<div class="table-wrap"><table><thead><tr><th>Тема заняття</th><th>Розділ сайту</th><th></th></tr></thead><tbody>${
    rows.map(([topic, where, lecture]) => lectureRow(topic, where, lecture)).join("")
  }</tbody></table></div>`;
}

// Lecture texts synthesize everything covered elsewhere on the site (governing
// docs, measures, forms, gear, ID keys, VME, tagging, other fisheries,
// inspection system) plus, for six topics with no source document in the
// package (marked with a note inside the text), independently researched
// facts from zakon.rada.gov.ua, ccamlr.org and general oceanographic/technical
// references — always with a caveat when detail is organisation-specific.

const day1aLectures = [
  ["Зона ККАМЛР. Географічне розташування. Історія створення.",
   "<a href=\"01-governing.html\">Керівні документи</a>",
   `<p>Конвенцію про збереження морських живих ресурсів Антарктики (Canberra Convention) відкрито для підписання 1 серпня 1980 р., чинності вона набула 7 квітня 1982 р. Її ухвалили у відповідь на стрімке розширення промислу антарктичного криля в 1970-х — стало зрозуміло, що масовий вилов криля, який є кормовою базою риб, птахів і китів, може підірвати всю екосистему Південного океану, а не лише запаси окремого виду. Тому Конвенція першою серед рибогосподарських угод закріпила <strong>екосистемний підхід</strong>: рішення про ліміти вилову приймаються з урахуванням впливу на залежні й пов'язані види, а не лише на сам промисловий вид.</p>
   <p>Зона дії Конвенції — це не просто «Антарктика» в побутовому розумінні, а чітко визначена акваторія: на південь від 60° південної широти, а також простір між цією широтою й Антарктичною конвергенцією (природна океанографічна межа, де холодні антарктичні води занурюються під більш теплі субантарктичні). Така межа проведена свідомо за екологічним, а не політичним принципом — вона охоплює єдину екосистему Південного океану.</p>
   <p>Штаб-квартира Комісії ККАМЛР розташована в Хобарті, штат Тасманія, Австралія. Конвенція діє в рамках ширшої Системи Договору про Антарктику (поряд із Договором про Антарктику 1959 р., Конвенцією про збереження антарктичних тюленів CCAS і Мадридським протоколом про охорону довкілля). Текст Конвенції — 33 статті, складені чотирма офіційними мовами (англійська, французька, російська, іспанська).</p>`],
  ["Договірні сторони — учасники ККАМЛР",
   "<a href=\"01-governing.html\">Керівні документи</a>",
   `<p>У ККАМЛР є кілька категорій участі. <strong>Договірні сторони</strong> (Contracting Parties) — держави, що ратифікували Конвенцію й мають повне право голосу в Комісії; серед них є й ті, що активно ведуть промисел, і ті, що приєдналися суто з природоохоронних міркувань. <strong>Держави, що приєдналися</strong> (Acceding States), визнають Конвенцію, але не завжди беруть участь у засіданнях Комісії з правом голосу. Окрема категорія — <strong>Співпрацюючі недоговірні сторони</strong> (Cooperating Non-Contracting Parties), які добровільно дотримуються заходів дотримання (наприклад, Схеми документування вилову) без повного членства.</p>
   <p>Рішення Комісії ухвалюються за принципом <strong>консенсусу</strong> (ст. XII Конвенції), а не простою більшістю голосів — це означає, що будь-яка Договірна сторона теоретично може заблокувати ухвалення нового заходу зі збереження, що часто ускладнює й уповільнює процес прийняття нових правил, особливо щодо лімітів вилову криля.</p>
   <p>Україна ратифікувала Конвенцію в 1994 році й з того часу є повноправною Договірною стороною. Це не суто формальне членство: у листопаді 2022 р. на 41-й сесії Комісії Україна вперше очолила ККАМЛР — головування підтверджує активну роль української делегації в науковому й управлінському процесі організації, а не лише в промисловій діяльності українських суден.</p>`],
  ["Керівні документи ККАМЛР",
   "<a href=\"01-governing.html\">Керівні документи</a>, <a href=\"13-library.html\">Бібліотека документів</a>",
   `<p>Керівні документи ККАМЛР утворюють чітку ієрархію, яку варто розуміти саме як послідовність «від загального до конкретного». На вершині — сама <strong>Конвенція</strong>: 33 статті, що визначають мету організації, зону дії, склад Комісії та її повноваження (зокрема ст. IX — функції Комісії, ст. XXIV — правова основа для системи наукового спостереження).</p>
   <p>На основі повноважень зі ст. IX Комісія щороку ухвалює <strong>заходи зі збереження</strong> (Conservation Measures, CM) — це вже конкретні обов'язкові правила: ліміти вилову, вимоги до знаряддя лову, заборонені зони тощо. Окремо існують <strong>резолюції</strong> Комісії — рекомендаційні, не обов'язкові документи (наприклад, із закликом до держав-членів посилити боротьбу з ННН-промислом).</p>
   <p>Для спостерігачів ключовим є документ ще одного рівня — <strong>Схема міжнародного наукового спостереження (SISO)</strong>, прийнята на основі ст. XXIV Конвенції: вона визначає розділи A–H (від призначення спостерігачів до порядку звітування), Додаток I (11 конкретних завдань спостерігача) і Додаток II (дії в надзвичайних ситуаціях). І нарешті, найбільш практичний рівень — <strong>SISO Manual</strong> (17 розділів + 4 додатки), який покроково пояснює, як саме виконувати завдання зі Схеми на борту судна. Усі ці документи зібрані в розділі «Бібліотека документів» цього сайту з можливістю перегляду й завантаження оригіналів.</p>`],
  ["Правила ККАМЛР та Українське законодавство",
   "— поза межами наданого пакету документів; підготовлено додатково",
   `<p><strong>Ця тема не входила до наданого пакету з 21 документа — інформацію нижче підготовлено додатково за відкритими джерелами (zakon.rada.gov.ua, офіційні повідомлення МОН/CCAMLR); перед іспитом і рейсом варто звірити деталі з вашим технічним координатором.</strong></p>
   <p>Україна ратифікувала Конвенцію про збереження морських живих ресурсів Антарктики в 1994 році; текст Конвенції зареєстровано в базі міжнародних договорів України (zakon.rada.gov.ua, документ 995_045). Згідно зі ст. 9 Конституції України, чинні міжнародні договори, згода на обов'язковість яких надана Верховною Радою, є частиною національного законодавства України. Це означає, що заходи зі збереження ККАМЛР діють для суден під українським прапором безпосередньо через факт ратифікації Конвенції — окремого перевидання кожного щорічного заходу зі збереження українським законом не потрібно, оскільки повноваження Комісії ухвалювати обов'язкові заходи вже випливають із ратифікованого тексту.</p>
   <p>Водночас практичне впровадження (ліцензування суден, порядок призначення й атестації наукових спостерігачів, взаємодія з профільним інститутом) регулюється відомчими підзаконними актами України, які виходять за межі документів, наданих для підготовки до цього іспиту. Показово, що роль України в ККАМЛР не обмежується суто дотриманням правил: у листопаді 2022 р. українська делегація вперше очолила Комісію ККАМЛР на її 41-й сесії — це відображає активну наукову й дипломатичну участь держави в організації, а не лише формальне членство. Для будь-яких конкретних процедурних питань щодо українського законодавства варто звертатися до технічного координатора, контакти якого зазначені в чек-листі підготовки.</p>`],
  ["Заходи зі збереження ККАМЛР. Класифікація та процедура змін.",
   "<a href=\"02-measures.html\">Заходи зі збереження</a>",
   `<p>Заходи зі збереження (Conservation Measures, CM) — це обов'язкові правила, які Комісія ККАМЛР щороку ухвалює на основі повноважень зі ст. IX Конвенції; на відміну від рекомендаційних резолюцій, заходи зі збереження є юридично зобов'язальними для всіх Договірних сторін. Їх нумерація підпорядкована логічній системі, прив'язаній до тематики: серія 10 — дотримання й інспекція (наприклад, CM 10-02 — інспекція в морі, CM 10-03 — інспекція в порту), серія 21–25 — загальні заходи щодо промислу й пом'якшення прилову, серія 41 — управління промислом іклача, 42 — крижаної риби, 51 — криля, 52 — крабів, 61 — кальмарів, серія 91 — закриті райони й морські охоронні території.</p>
   <p>Кожен захід має власний термін дії — переважна більшість перевидається щороку (з можливими змінами лімітів чи умов), а деякі мають безстроковий характер, доки Комісія прямо їх не скасує чи не замінить. Процедура ухвалення нового чи зміненого заходу передбачає розгляд на засіданні Наукового комітету (який готує наукову рекомендацію на основі оцінки запасів і впливу на екосистему) і подальше затвердження Комісією <strong>консенсусом</strong> — тобто будь-яка Договірна сторона теоретично може заблокувати ухвалення, що на практиці означає повільний, обережний процес змін.</p>
   <p>Для наукового спостерігача практичне значення класифікації заходів у тому, що саме до заходів серії 41/42/51/52 він звертається, щоб перевірити актуальні ліміти вилову й дозволені райони промислу на конкретний сезон, а до заходів серії 21–25 — щоб перевірити відповідність знаряддя лову й процедур пом'якшення прилову вимогам поточного сезону, оскільки деталі цих вимог можуть щороку дещо змінюватися.</p>`],
  ["Термінологія і коди ККАМЛР",
   "<a href=\"14-glossary.html\">Глосарій термінів</a>, <a href=\"15-flashcards.html\">Флеш-картки</a>",
   `<p>ККАМЛР використовує розгалужену систему стандартизованих кодів, яка забезпечує однозначність даних незалежно від мови чи національності спостерігача, що їх заповнює. Кожен вид, що трапляється в уловах чи спостереженнях, має власний тризначний <strong>видовий код</strong> (наприклад, TOP — Dissostichus eleginoides, патагонський іклач; TOA — Dissostichus mawsoni, антарктичний іклач; ANI — Champsocephalus gunnari, крижана риба; KRI — Euphausia superba, антарктичний криль) — саме ці коди, а не повні латинські чи побутові назви, використовуються в журналах C2 та інших офіційних формах.</p>
   <p>Окрім видових кодів, існують стандартизовані коди знарядь лову (наприклад, LL — ярус, у тому числі з підтипами autoline/Spanish line/trotline; TRAWL — трал), коди статистичних районів (номери підрайонів і дивізіонів, розглянуті в темі про дослідницькі квадрати) і коди для позначення долі виловленої особини при взаємодії з птахами й ссавцями (наприклад, released alive/released injured/dead). Абревіатури на кшталт CDS (Схема документування вилову), SISO (Схема міжнародного наукового спостереження), IMAF (випадкова смертність, пов'язана з промислом), VME (вразливі морські екосистеми) також є стандартною термінологією, яку варто впевнено розпізнавати без розшифровки в оригінальних документах.</p>
   <p>Для системного засвоєння цієї термінології цей сайт пропонує окремий розділ «Глосарій термінів» з перекладом і вимовою кожного терміна українською кирилицею, а також інтерактивні «Флеш-картки» (окремі колоди для термінів і для видових кодів, включно з можливістю позначати найважчі картки зіркою для повторного тренування) — обидва інструменти варто активно використовувати саме в останні дні перед іспитом.</p>`]
];

const day1bLectures = [
  ["Підрозділи, ділянки та дослідницькі квадрати регіону",
   "<a href=\"02-measures.html\">Заходи зі збереження</a> + додатково досліджено",
   `<p>Для обліку вилову, зусиль промислу й наукових даних зону дії Конвенції поділено на статистичні <strong>ділянки (Areas)</strong>, які, своєю чергою, діляться на <strong>підрайони (Subareas)</strong> і <strong>дивізіони (Divisions)</strong>. Наприклад, Ділянка 48 включає Підрайони 48.1–48.4 і 48.6; Ділянка 58 — Дивізіони 58.4.1, 58.4.2, 58.4.4, 58.5.1, 58.5.2; Ділянка 88 (море Росса) — Підрайони 88.1, 88.2, 88.3. Межі цих одиниць по можливості проведені так, щоб відповідати реальним екосистемним характеристикам Південного океану, а не бути довільною сіткою координат.</p>
   <p><strong>Ця деталізація не входила в наданий пакет документів — доповнено з офіційного сайту ccamlr.org.</strong> У межах дослідницьких (exploratory) промислів підрайони додатково діляться на <strong>Small-Scale Research Units, SSRU</strong> — дрібномасштабні дослідницькі одиниці, межі яких закріплено в CM 41-01; частина SSRU відкрита для комерційного й дослідницького лову з окремими лімітами на цільові й приловні види, частина — повністю закрита для промислу. Для управління промислом криля існують <strong>Small-Scale Management Units, SSMU</strong> — вони дозволяють розподіляти сумарний ліміт вилову криля дрібнішими порціями по акваторії, щоб уникнути локального виснаження запасу біля колоній хижаків (пінгвінів, тюленів), які живляться крилем неподалік від місця гніздування. Окремо для оцінки запасів іклача виділяють <strong>дослідницькі блоки (Toothfish Fishery Research Blocks)</strong>, які почергово відкривають і закривають для стандартизованих зйомок. Усі ці шари можна переглянути на інтерактивній карті spatial.ccamlr.org.</p>`],
  ["Океанологічні особливості Південного океану",
   "— поза межами наданого пакету документів; підготовлено додатково",
   `<p><strong>Ця тема не входила до наданого пакету документів — підготовлено додатково за загальними океанографічними джерелами.</strong> Ключова фізична риса Південного океану — <strong>Антарктична циркумполярна течія (АЦТ, Antarctic Circumpolar Current)</strong>, найпотужніша течія світового океану. Вона тече із заходу на схід навколо Антарктиди, не зустрічаючи на своєму шляху жодного континенту, і переносить через протоку Дрейка приблизно 135 Свердрупів води — це приблизно у 135 разів більше сумарного стоку всіх річок світу. АЦТ фактично ізолює холодні полярні води від тепліших субтропічних і відіграє центральну роль у глобальному кліматі, сприяючи підйому глибинних вод і формуванню нових водних мас.</p>
   <p>У межах АЦТ виділяють кілька фронтальних зон — природних меж між водними масами з різкою зміною температури й солоності: <strong>Субтропічний фронт</strong>, <strong>Субантарктичний фронт</strong>, <strong>Полярний фронт</strong> (позначений мінімумом приповерхневої температури через зимове охолодження й утворення морського льоду) та <strong>Південний фронт АЦТ</strong>. Ці фронти суттєво впливають на продуктивність екосистеми — саме вздовж них концентруються скупчення криля й риби, що робить їх орієнтиром для промислових суден.</p>
   <p>По вертикалі водна товща структурована водними масами: холодна прісніша <strong>Антарктична поверхнева вода</strong> (пов'язана з морським льодом), <strong>Антарктична проміжна вода</strong>, <strong>Верхня й Нижня циркумполярна глибинна вода</strong> та найщільніша <strong>Антарктична донна вода</strong>, яка формується біля шельфу Антарктиди й розтікається по дну світового океану, живлячи глобальну термохалінну циркуляцію. Для спостерігача це має практичне значення: розподіл риби й криля по глибині й акваторії тісно пов'язаний саме з цією структурою водних мас, а дані приладів на кшталт DST CTD фіксують якраз ці параметри під час виборки.</p>`],
  ["Головні промислові об'єкти зони ККАМЛР",
   "<a href=\"06-identification.html\">Визначники</a> (іклач), <a href=\"17-other-fisheries.html\">Інші промисли</a> (криль, кальмари, краби)",
   `<p>Головний за вартістю промисел зони ККАМЛР — ярусний лов <strong>антарктичного й патагонського іклача</strong> (Dissostichus mawsoni, TOA, та D. eleginoides, TOP). Саме на цей промисел орієнтована більшість документів, наданих для підготовки до іспиту: журнал спостерігача, форми C2, протоколи мічення. Заходи серії CM 41 регулюють ліміти вилову по кожному підрайону окремо.</p>
   <p>За обсягом вилову (у тоннах) найбільшим є трал <strong>антарктичного криля</strong> (Euphausia superba, серія заходів CM 51) — вилов у Підрайоні 48 у 2025 р. досяг історичного максимуму, вперше перевищивши тригерний рівень, що призвело до закриття промислу з 1 серпня 2026 р. Третій традиційний промисел — <strong>крижана риба</strong> (Champsocephalus gunnari, серія CM 42), історично зосереджений переважно в Підрайоні 48.3, зараз значно скромніший за обсягом порівняно з іклачем і крилем.</p>
   <p>Ще два промисли існують радше формально: <strong>краби</strong> роду Paralomis (серія CM 52) — дослідницький промисел проводився в 2000-х, але визнаний нежиттєздатним і не поновлювався з 2010 р.; <strong>кальмар Martialia hyadesi</strong> (колишня CM 61-01) — дослідницький лов 1990-х, захід втратив чинність 2009 р., комерційного флоту зараз немає. Номер серії заходу зазвичай відповідає цільовому об'єкту (41 — іклач, 42 — крижана риба, 51 — криль, 52 — краби, 61 — кальмари), що корисно пам'ятати як мнемонічне правило на іспиті.</p>`],
  ["Знаряддя лову й промисел іклача, криля, кальмарів, крабоідів",
   "<a href=\"05-gear.html\">Знаряддя лова</a>, <a href=\"17-other-fisheries.html\">Інші промисли</a>",
   `<p>Для ярусного промислу іклача застосовують три основні типи снасті: <strong>автолінія</strong> (autoline, з механічним наживленням гачків), <strong>іспанська снасть</strong> (Spanish line, з додатковою становою лінією) та <strong>тротлайн</strong> (trotline, де гачки прикріплені кластерами до плавучої головної лінії через троти). Додатково використовують пастки двох конфігурацій — «вулик» (beehive) і прямокутну. Для мінімізації прилову морських птахів обов'язкові стример-лінії з відлякувачами (CM 25-02) та обважнений ярус (CM 24-02); для тралового промислу — сітчасті панелі або решітки (grid), що виключають морських ссавців із трала (CM 25-03).</p>
   <p>Промисел криля веде принципово інше знаряддя — <strong>пелагічний або беам-трал</strong>, що працює на глибинах 0–250 м. Ключова технологічна особливість — <strong>безперервна система відкачування (continuous fishing system)</strong>, яка переміщує криль із кутка трала прямо на борт судна під час самого тралення, без потреби піднімати й спускати трал для кожного улову; також застосовують помпи для розвантаження трала біля борту.</p>
   <p>Історичний дослідницький промисел кальмара Martialia hyadesi вівся переважно джиґінгом (світлові приваблювачі й спеціальні гачки-джиґи без наживки), а краба Paralomis spp. — пастками, подібними до крабових пасток інших регіонів світу. Обидва ці види знаряддя зараз практично не застосовуються в зоні ККАМЛР через відсутність активного промислу.</p>`],
  ["Правила регулювання промислу в зоні ККАМЛР",
   "<a href=\"02-measures.html\">Заходи зі збереження</a>",
   `<p>Регулювання промислу в зоні ККАМЛР спирається на кілька взаємопов'язаних механізмів. По-перше, це <strong>щорічні застережні ліміти вилову</strong>, які Комісія затверджує у формі заходів зі збереження на основі рекомендацій Наукового комітету — ліміти визначаються окремо для кожного підрайону/дивізіону й переглядаються з урахуванням нових наукових даних (зокрема даних, зібраних самими спостерігачами).</p>
   <p>По-друге, обов'язкові <strong>заходи пом'якшення прилову</strong>: стример-лінії й обважнений ярус для захисту морських птахів, решітки-виключувачі для морських ссавців, обмеження на скидання відходів переробки під час постановки/виборки ярусу (щоб не приваблювати птахів до гачків).</p>
   <p>По-третє, <strong>захист вразливих морських екосистем (ВМЕ)</strong> — обов'язковий облік організмів-індикаторів на кожному сегменті ярусу з тригерним протоколом закриття «ризикових зон» навколо виявлених скупчень.</p>
   <p>По-четверте, система <strong>ліцензування й нотифікації</strong> (CM 10-02): судно повинно бути заздалегідь нотифіковане державою прапора про намір вести промисел у конкретному підрайоні, а держава прапора зобов'язана видати ліцензію лише за умови дотримання вимог ККАМЛР. Для іклача додатково діє <strong>Схема документування вилову (CDS)</strong> — кожна партія товару супроводжується електронним документом, що відстежує вилов від судна до кінцевого ринку, що ускладнює збут нелегальної риби.</p>
   <p>Нарешті, дотримання забезпечується через обов'язкове <strong>наукове спостереження</strong> (100% покриття для більшості ярусних промислів) та <strong>Інспекційну систему</strong> ККАМЛР — перевірки в морі й порту, детально розглянуті окремою темою третього дня стажування.</p>`],
  ["Регулювання промислу для окремих об'єктів",
   "<a href=\"02-measures.html\">Заходи зі збереження</a>, <a href=\"17-other-fisheries.html\">Інші промисли</a>",
   `<p>Хоча загальні принципи регулювання спільні, кожен цільовий об'єкт має власний набір специфічних заходів. Для <strong>іклача</strong> це передусім поквартальні ліміти вилову по кожному підрайону (наприклад, 3278 т для D. mawsoni в Підрайоні 88.1 на сезон 2025/26), обов'язкова програма мічення «спіймав-позначив-випустив» для оцінки запасів методом мічення-повторного вилову (mark-recapture), і повне охоплення науковим спостереженням.</p>
   <p>Для <strong>криля</strong> регулювання побудоване інакше — через <strong>застережний ліміт</strong> і окремий <strong>тригерний рівень</strong> (наразі 620 000 т для Підрайонів 48.1–48.4): поки сумарний вилов не досяг тригерного рівня, застосовується спрощена (тимчасова) схема управління, а після досягнення тригера включається розподіл ліміту по дрібніших SSMU, щоб уникнути локального виснаження. Саме досягнення цього тригерного рівня 2025 року і призвело до закриття Підрайону 48 з 1 серпня 2026 р. — наочний приклад того, як спрацьовує превентивний механізм управління.</p>
   <p>Для <strong>крабів</strong> і <strong>кальмарів</strong> діючих заходів зараз немає — попередні заходи (CM 52-01/52-02/52-03 для крабів, CM 61-01 для кальмара) або втратили чинність, або визнані такими, що не забезпечують життєздатного промислу; будь-яке відновлення промислу вимагатиме ухвалення нового заходу й, найімовірніше, повторної дослідницької (exploratory) фази з обов'язковим науковим протоколом. Для <strong>крижаної риби</strong> діють заходи серії CM 42 з окремими, суттєво меншими за іклач лімітами, зосередженими переважно в Підрайоні 48.3.</p>`]
];

const day2Lectures = [
  ["Національні та міжнародні спостерігачі",
   "<a href=\"01-governing.html\">Керівні документи</a> (Схема SISO)",
   `<p>Схема міжнародного наукового спостереження (SISO) розрізняє два типи спостерігачів. <strong>Національний спостерігач</strong> призначається державою прапора судна для спостереження за власним судном — це, по суті, внутрішній моніторинг, організований самою державою-власником флоту. <strong>Міжнародний спостерігач</strong> призначається однією Договірною стороною (Designating Member) для роботи на судні <strong>іншої</strong> Договірної сторони (Receiving Member) — саме цей формат забезпечує незалежну, зовнішню верифікацію дотримання правил, оскільки спостерігач не залежить організаційно від власника судна.</p>
   <p>Для більшості промислів у зоні ККАМЛР (передусім ярусного лову іклача) обов'язковим є саме 100-відсоткове покриття міжнародними спостерігачами — тобто на кожному рейсі кожного судна повинен бути присутній хоча б один спостерігач, призначений іншою державою, а не власним прапором судна. Це принципово відрізняє систему ККАМЛР від багатьох інших регіональних рибогосподарських організацій, де спостереження вибіркове (наприклад, 10–20% рейсів).</p>
   <p>Обидва типи спостерігачів діють за одними й тими самими розділами Схеми SISO (A–H) і виконують той самий перелік із 11 завдань, закріплений у Додатку I — відмінність лише в тому, хто призначає спостерігача й перед ким він формально звітує. У кожному разі спостерігач зобов'язаний діяти неупереджено й подавати об'єктивні дані незалежно від того, чиє це судно за прапором.</p>`],
  ["Права та обов'язки спостерігачів",
   "<a href=\"01-governing.html\">Керівні документи</a>",
   `<p>Розділ D Схеми SISO детально визначає права й обов'язки наукового спостерігача. Серед <strong>прав</strong> — доступ до всіх ділянок і документації судна, необхідних для виконання завдань спостереження (журнали улову, документи на знаряддя лову, дані про позицію судна), а також гарантії безпеки й належних умов проживання й харчування на борту, порівнянних з умовами командного складу.</p>
   <p>Серед <strong>обов'язків</strong> — головний принцип неупередженості: спостерігач фіксує факти об'єктивно, незалежно від інтересів судновласника чи власної держави прапора. Йому прямо заборонено приймати хабарі, подарунки чи будь-що цінне від екіпажу чи власника судна, окрім стандартного забезпечення харчуванням, проживанням і заробітною платою від організації, що його відрядила, — це запобігає конфлікту інтересів і тиску на об'єктивність звітності.</p>
   <p>Конкретний перелік завдань — 11 пунктів Додатку I Схеми SISO — охоплює облік улову й прилову, біологічний відбір проб, спостереження за морськими птахами й ссавцями, підрахунок ВМЕ-індикаторів, участь у мічені, а також складання підсумкового звіту про рейс. Усі звіти й журнали спостерігач зобов'язаний подати протягом одного місяця після завершення рейсу — це жорсткий, а не орієнтовний термін, порушення якого може вплинути на подальшу акредитацію спостерігача в програмі.</p>`],
  ["Облік цільових видів і прилову (іклач, криль, кальмари, крабоіди)",
   "<a href=\"04-forms-instructions.html\">Форми та інструкції</a>, <a href=\"17-other-fisheries.html\">Інші промисли</a>",
   `<p>Методика обліку відрізняється залежно від промислу. На ярусному лові іклача спостерігач веде <strong>випадковий обліковий період</strong> (random tally period) — рекомендовано не менш як 25% виборки, охоплюючи різні секції ярусу протягом усього рейсу, а не завжди ту саму ділянку. У межах цього періоду фіксуються всі виловлені особини цільового виду (з видовим кодом, кількістю, зеленою вагою) і окремо — увесь прилов не цільових видів, включно з ознаками хижацтва (наприклад, голови без тіла — слід нападу косатки).</p>
   <p>На промислі криля ритм обліку зовсім інший через безперервну систему відкачування: замість дискретних підйомів трала спостерігач працює з практично неперервним потоком улову, тому застосовуються окремі форми обліку, відмінні від журналу C2, спеціально розраховані на траловий, а не ярусний промисел.</p>
   <p>На (наразі неактивних) промислах краба й кальмара історично застосовувалися свої спеціалізовані форми обліку улову — прив'язані до специфіки пасткового чи джиґового лову. Якщо ці промисли колись відновляться, спостерігачу варто заздалегідь уточнити в технічного координатора, яка саме форма діє для конкретного знаряддя лову на конкретному судні, оскільки уніфікованого журналу для всіх типів промислу в зоні ККАМЛР не існує — форма C2 розрахована саме на ярусний лов.</p>`],
  ["Аналіз іклача: стадії зрілості гонад, гістологічні дані",
   "<a href=\"06-identification.html\">Визначники</a>",
   `<p>Оцінка стадії статевої зрілості іклача — одне з ключових біологічних завдань спостерігача, оскільки саме ці дані дозволяють науковцям оцінювати структуру популяції й строки нересту. Використовується шкала Gasco et al. (2011): для самиць — стадії F1–F5 (від незрілого яєчника F1 до гравідної стадії F4, коли при розтині випливає велика ікра, і виснаженої F5 після нересту), для самців — паралельна шкала M1–M5.</p>
   <p>Макроскопічна оцінка проводиться безпосередньо на палубі під час розтину риби: спостерігач візуально визначає розмір, текстуру й колір гонади й відносить її до однієї зі стадій за описом у визначнику. Але візуальна оцінка має відому похибку між різними спостерігачами (inter-observer variability) — саме тому частина зразків додатково відбирається для <strong>гістологічного аналізу</strong>: невеликий фрагмент тканини гонади консервується (зазвичай у формаліні або спеціальному фіксувальному розчині) і надсилається до берегової лабораторії, де під мікроскопом підтверджують чи коригують макроскопічно визначену стадію.</p>
   <p>Гістологічні дані використовуються науковцями саме для калібрування протоколу макроскопічної оцінки в масштабі всього флоту — тобто це не альтернатива польовій оцінці, а спосіб перевірити її точність. Детальний лабораторний протокол гістологічного аналізу виходить за межі документів, наданих для підготовки спостерігача, — на борту від вас вимагається насамперед правильно відібрати, промаркувати й законсервувати зразок тканини відповідно до інструкції, наданої вашою організацією.</p>`],
  ["Збір і зберігання отолітів для визначення віку",
   "<a href=\"04-forms-instructions.html\">Форми та інструкції</a>, <a href=\"14-glossary.html\">Глосарій</a>",
   `<p><strong>Отоліт</strong> — це кальцинована структура внутрішнього вуха риби, яка щороку наростає новим шаром, подібно до річних кілець дерева; підрахунок цих кілець під мікроскопом у лабораторії дозволяє точно визначити вік особини. Це один із найважливіших видів біологічних даних для оцінки віково-статевої структури популяції іклача, оскільки на відміну від довжини тіла вік напряму не завжди корелює з розміром риби.</p>
   <p>Норма відбору проб — приблизно 7 риб на кожні 1000 гачків, що при стандартній лінії у 5000 гачків дає близько 35 риб на лінію; з них у 10 особин додатково відбирають отоліти (решта отримують лише стандартні біологічні виміри без вилучення отолітів). Процедура відбору: спочатку в риби вимірюють стандартну довжину (SL — від кінчика писка до кінця хребетного стовпа), потім розкривають череп і акуратно вилучають пару отолітів, очищають від тканини й висушують.</p>
   <p>Кожен отоліт зберігається сухим в окремому промаркованому конверті чи пробірці з обов'язковим прив'язуванням до ідентифікатора виборки (Set/Haul ID) і номера риби в біологічному листі — це критично важливо, оскільки переплутані чи невідмічені отоліти втрачають наукову цінність: без точної прив'язки до конкретної риби, дати й місця вилову неможливо коректно інтерпретувати вік у контексті популяційного аналізу.</p>`],
  ["Величина улову й переводні коефіцієнти",
   "<a href=\"04-forms-instructions.html\">Форми та інструкції</a>, <a href=\"14-glossary.html\">Глосарій</a>",
   `<p>Улов риби на борту зазвичай переробляється — потрошиться, обробляється на філе тощо — тож фактична вага продукту (<strong>processed weight</strong>), яку зважують після переробки, менша за вагу щойно виловленої цілої риби (<strong>green weight</strong>, «зелена вага»). Оскільки квоти й ліміти вилову ККАМЛР встановлюються саме в еквіваленті зеленої ваги, потрібен спосіб перерахунку одного значення в інше — для цього використовують <strong>переводний коефіцієнт (conversion factor)</strong>: співвідношення зеленої ваги до ваги переробленого продукту.</p>
   <p>Спостерігач самостійно перевіряє (а не просто приймає на віру заявлений судном) переводний коефіцієнт: тест проводиться на вибірці мінімум 20 риб — кожну зважують до й після стандартної обробки на цьому конкретному судні, — і повторюється щонайменше раз на тиждень окремо для кожного району управління (промислової зони), в якому працює судно. Разова перевірка на весь рейс не відповідає вимозі, оскільки коефіцієнт може дещо змінюватися залежно від розміру риби, способу обробки чи навіть кваліфікації обробників.</p>
   <p>Отримані дані потрапляють у форму C2 (аркуш Conversion Factors) і використовуються для перерахунку задекларованої переробленої продукції назад у зелену вагу при звітуванні про фактичний вилов, що зараховується в квоту підрайону — тобто це не суто технічна деталь, а прямий механізм контролю за точністю виконання лімітів вилову.</p>`],
  ["Методика й норми мічення іклача",
   "<a href=\"08-tagging.html\">Мічення (Tagging)</a>",
   `<p>Стандартизована програма мічення ККАМЛР діє з 2007 року й станом на 2023 рік налічує приблизно 404 559 позначених і випущених особин іклача (з приблизно 12% повторного вилову) та близько 71 444 позначених скатів (близько 3% повторного вилову). Це дані методу «мічення–повторний вилов» (mark-recapture), який є основним науковим інструментом оцінки чисельності популяції іклача — без прямого підводного обліку риби в товщі води.</p>
   <p>Ключові процедурні норми: риба може перебувати поза водою під час мічення не довше <strong>3 хвилин</strong>; у накопичувальному резервуарі риба не повинна займати більш як <strong>10%</strong> об'єму води. Мітку клачу встановлюють у другий спинний плавець, скату — у м'яз кожного крила з боку очей. Практикується подвійне мічення послідовними номерами (primary/secondary tag) — якщо одна мітка згодом випаде, риба все одно ідентифікується за другою.</p>
   <p>Якість програми мічення на конкретному судні оцінюється за <strong>статистикою перекриття</strong> (tag overlap statistics): мінімум 60% вимагається за CM 41-01 Додаток C, цільовий показник — 80%. При повторному вилові позначеної риби сучасна вимога — не відправляти фізичну мітку поштою до Секретаріату, а зробити якісне електронне фото мітки на офіційному шаблоні-лінійці CCAMLR зі штампом часу. Коаліція легальних операторів промислу клача (COLTO) щорічно пропонує грошовий приз за знайдені мітки — це стимулює екіпажі активно повідомляти про повторні вилови.</p>`],
  ["Підрахунок VME-індикаторних організмів",
   "<a href=\"07-vme.html\">VME</a>",
   `<p>Вразливі морські екосистеми (ВМЕ) — це скупчення довгоживучих, повільно зростаючих і структурно складних донних організмів (корали, губки, мохуватки тощо), які легко пошкоджуються знаряддям лову й дуже повільно відновлюються. ККАМЛР визначила 22 коди таксонів-індикаторів ВМЕ у кількох великих групах: Cnidaria (горгонарії, чорні й кам'янисті корали, гідроїди, зоантарії), Porifera (губки), Chordata (асцидії), Bryozoa (мохуватки), Echinodermata (крiноїдеї, кошикові зірки) та інші.</p>
   <p>Облік ведеться посегментно: сегмент лінії дорівнює 1000 гачкам або 1200 метрам (залежно від того, що коротше). Спостерігач випадково обирає близько 30% сегментів для обов'язкового підрахунку — незалежно від того, скільки організмів у них фактично виявиться. Якщо на сегменті виявлено <strong>5 або більше</strong> одиниць-індикаторів, це вважається досягненням тригерного рівня, що вимагає додаткового обов'язкового відбору проб на цьому сегменті — але важливо: якщо тригер спрацював саме на випадково обраному сегменті, тип вибірки в журналі все одно позначається як «Random», а не змінюється заднім числом на «Trigger».</p>
   <p>Одиниця-індикатор виміряється як 1 літр організмів у стандартному 10-літровому контейнері, або 1 кілограм для гіллястих форм (наприклад, горгонарій), які фізично не поміщаються компактно в контейнер. Якщо на якомусь сегменті сумарно виявлено 10 або більше одиниць-індикаторів, навколо нього автоматично встановлюється «ризикова зона» радіусом 1 морська миля, у межах якої діють обмеження на подальший донний промисел.</p>`],
  ["Спостереження за птахами й ссавцями; прилов гігантських кальмарів",
   "<a href=\"04-forms-instructions.html\">Форми та інструкції</a> (IMAF), <a href=\"17-other-fisheries.html\">Інші промисли</a> (кальмари)",
   `<p>Спостереження за взаємодією з морськими птахами й ссавцями (IMAF — Incidental Mortality Associated with Fishing) — одне з чутливих завдань спостерігача, оскільки саме випадкова смертність на ярусі історично була головною причиною запровадження заходів пом'якшення (CM 25-02, CM 24-02). У формі Haul IMAF фіксується вид (за можливості — до виду, або принаймні родовий/родинний рівень), обставини вилову (під час постановки чи виборки — птахи, гачковані під час hauling, зазвичай живі й без намоклого пір'я), а також доля особини: відпущена живою, відпущена травмованою, або загинула. Важливо записувати навіть випадки, коли птаха відпустили живим і без видимих травм, — саме ці дані дозволяють оцінити реальну ефективність заходів пом'якшення, а не лише фіксувати негативні випадки.</p>
   <p>Аналогічна форма для морських ссавців заповнюється за той самий обліковий період, що й облік улову, причому <strong>навіть якщо ссавців не виявлено</strong> — це фіксує сам факт спроби спостереження (Observation possible: Yes/No, залежно від погодних умов і освітлення), а не лише позитивні результати. Окремо позначається депредація — коли тюлені чи косатки забирають рибу або наживку прямо з ярусу, часто залишаючи характерні сліди на піднятій рибі.</p>
   <p>Прилов гігантського кальмара, хоч і не пов'язаний із заходами захисту птахів/ссавців, потребує окремої уваги з міркувань безпеки праці: при підйомі великого кальмара на борт можливі різкі рухи щупалець і виверження чорнила, тому рекомендовано зберігати обережність. Для наукового обліку фіксується вид (або найнижчий можливий таксономічний рівень), маса й стан особини — оскільки промислового флоту на кальмара зараз немає, будь-яке спостереження гігантського кальмара є цінним побічним науковим спостереженням, а не рутинним обліком цільового виду.</p>`],
  ["Звітність про ННН-лов і забруднення моря",
   "<a href=\"11-templates.html\">Заповнення журналів</a> (форма IUU sighting), <a href=\"18-inspection.html\">Інспекційна система</a>",
   `<p>Якщо спостерігач помічає ознаки незаконного, незареєстрованого й нерегульованого (ННН, або англ. IUU) промислу — наприклад, невідоме судно без видимих розпізнавальних знаків, покинуте знаряддя лову без буїв, — головне правило безпеки: <strong>фіксація, а не контакт</strong>. Спостерігач ніколи не намагається встановити прямий контакт із підозрілим судном самостійно — це відповідальність капітана й компетентних органів.</p>
   <p>У форму спостереження ННН фіксуються: дата й час (обов'язково UTC), позиція, назва судна/позивний/прапор, якщо їх вдалося розгледіти (з обов'язковою позначкою джерела — візуально чи по радіозв'язку), опис знаряддя лову чи самого судна (що конкретніше, то краще для подальшої ідентифікації — колір корпусу, тип надбудови тощо), а для виявлених покинутих зябрових сіток — обов'язковий вимір розміру вічка. Ці дані стають частиною звіту про рейс, а капітан судна зобов'язаний якнайшвидше повідомити про спостереження до Секретаріату ККАМЛР через свою державу прапора — це прямо пов'язано з Інспекційною системою й механізмами дотримання, розглянутими третього дня стажування.</p>
   <p>Окремо, хоч і за іншою формою (Waste Disposal), фіксується інформація про втрачене чи скинуте знаряддя лову з власного судна: тип предмета (знаряддя лову чи загальні відходи), обставини (втрачено ненавмисно чи скинуто свідомо) і частота таких випадків. Чесне заповнення цієї форми — нормативна вимога, а не привід для дисциплінарних висновків проти судна; деталі й пояснення конкретних інцидентів варто описувати в текстовій частині звіту про рейс, а не намагатися вмістити повний контекст у обмежену клітинку журналу.</p>`],
  ["Наукові лови, збір планктону, прилад DST CTD",
   "— поза межами наданого пакету документів; підготовлено додатково",
   `<p><strong>Ця тема не входила до наданого пакету документів — інформацію нижче підготовлено додатково за технічними джерелами виробників океанографічного обладнання; конкретний протокол на вашому судні визначає керівник наукової програми рейсу.</strong></p>
   <p><strong>DST CTD</strong> (Data Storage Tag — Conductivity, Temperature, Depth) — це архівна міні-мітка, яку зовнішньо кріплять до тварини (наприклад, риби чи морського ссавця) або розгортають разом із науковим знаряддям лову. Прилад безперервно записує провідність води (з якої розраховується солоність), температуру й тиск (глибину) протягом усього періоду розгортання — це дозволяє відновити детальний профіль умов середовища, у якому переміщувалася тварина або працювало знаряддя. Типові моделі калібруються на глибини до 2400–2500 метрів.</p>
   <p>Дані з приладу зчитуються вже після його фізичного повернення: мітку підключають до спеціального комунікаційного блока (Communication Box), під'єднаного через USB до комп'ютера з фірмовим програмним забезпеченням (наприклад, SeaStar), яке експортує весь записаний масив вимірів. Такі прилади застосовують у наукових рейсах для дослідження міграційних маршрутів риб і морських ссавців, а також для прямого зіставлення розподілу видів із океанографічними умовами (температурою, солоністю на різних глибинах) — тобто це не рутинний інструмент спостерігача, а частина ширшої наукової програми судна, до якої спостерігач може залучатися як асистент зі збору й документування даних.</p>
   <p>Аналогічно, збір зоопланктону під час наукових ловів (окремими сітками з дрібним вічком) зазвичай супроводжує спеціалізовані дослідницькі рейси, а не стандартний комерційний ярусний чи траловий промисел — конкретний протокол відбору проб планктону визначається програмою конкретного наукового рейсу й виходить за межі стандартних обов'язків спостерігача SISO.</p>`],
  ["Особисті пристрої спостерігача (ноутбук, фотоапарат, GoPro)",
   "<a href=\"16-checklist.html\">Чек-лист підготовки</a>",
   `<p>Хоча стандартний перелік обладнання судна зазвичай включає базові засоби, спостерігачу варто мати власний повний комплект техніки, незалежний від забезпечення судна. По-перше, це <strong>ноутбук або планшет</strong> із заздалегідь завантаженими шаблонами всіх потрібних форм (наприклад, en_C2v2026a) і офлайн-копіями ключових документів — журналу, VME-визначника, посібника з мічення, — оскільки інтернет-з'єднання в морі часто нестабільне або відсутнє.</p>
   <p>По-друге, окремий <strong>цифровий фотоапарат</strong>, а не лише камера смартфона: якісні фото потрібні для документування міток при повторному вилові (обов'язкове фото на офіційному шаблоні-лінійці CCAMLR), ВМЕ-індикаторних організмів і будь-яких нетипових випадків прилову. Смартфон часто програє за якістю оптики й роботою в складних умовах освітлення (яскраве сонце на снігу, темрява трюму).</p>
   <p>По-третє, <strong>екшн-камера</strong> (наприклад, GoPro) корисна саме для фото- й відеофіксації самої процедури мічення чи біологічного відбору проб — це і навчальний матеріал, і додаткове документальне підтвердження дотримання протоколу (наприклад, що риба перебувала поза водою менше 3 хвилин). До цього ж комплекту варто додати зарядні пристрої й павербанк для автономного живлення техніки, оскільки доступ до розеток на борту може бути обмеженим. Цей перелік — орієнтовний, узгоджений із чек-листом підготовки на цьому сайті, а не офіційна обов'язкова вимога ККАМЛР.</p>`],
  ["Наукові спостереження на промислі криля",
   "<a href=\"17-other-fisheries.html\">Інші промисли</a>",
   `<p>Робота спостерігача на промислі криля суттєво відрізняється від звичного ярусного лову іклача передусім через масштаб і темп: криль — наймасовіший за обсягом вилову промисел зони ККАМЛР, а безперервна система відкачування означає, що улов надходить на борт практично неперервно, а не окремими дискретними підйомами ярусу чи трала. Це вимагає іншого ритму облікових спостережень і застосування окремих, спеціально розроблених для тралового промислу форм обліку прилову й біологічного відбору проб, відмінних від журналу C2.</p>
   <p>Промисел ведеться в Підрайонах 48.1–48.4 (діючий) і 58.4.1/58.4.2 (діючі), тоді як Підрайон 48.6 формально дослідницький, але фактично не веде вилову. Особливо показовою для розуміння реального управління промислом є подія сезону 2025/26: вилов у Підрайоні 48 у 2025 р. досяг історичного максимуму (близько 624 918 тонн) і вперше перевищив тригерний рівень 620 000 т, встановлений CM 51-01, що призвело до закриття промислу в цьому підрайоні з 1 серпня 2026 р. Для спостерігача, який потрапить на криле-промислове судно, це означає необхідність заздалегідь перевіряти актуальний статус промислу в конкретному підрайоні перед виходом у рейс — ситуація може змінюватися впродовж сезону значно динамічніше, ніж на стабільнішому промислі іклача.</p>
   <p>Перед першим рейсом на криле-промисловому судні варто заздалегідь уточнити в технічного координатора, яка саме форма обліку застосовується конкретно на цьому судні, оскільки уніфікованого журналу для тралового промислу криля, аналогічного C2 для ярусного лову, у наданому пакеті документів немає.</p>`],
  ["Звітність судна до Секретаріату ККАМЛР",
   "<a href=\"04-forms-instructions.html\">Форми та інструкції</a> (Cruise Report)",
   `<p>Основний підсумковий документ спостерігача — <strong>Звіт про рейс (Cruise Report)</strong>, що складається з 16 таблиць і має конфіденційний статус: він подається одночасно Секретаріату ККАМЛР і Комісару держави прапора судна (представнику держави, чий вибір позначає офіційний статус судна), а не публікується у відкритому доступі. У ньому спостерігач узагальнює хід усього рейсу — не лише сухі цифри, а й текстовий опис нетипових ситуацій, спостережень ННН-промислу, проблем із дотриманням заходів зі збереження, які важко відобразити в стандартизованих клітинках журналу C2.</p>
   <p>Окрім Звіту про рейс, судно (через капітана чи оператора) окремо звітує через <strong>журнал C2</strong> щомісяця — важливо пам'ятати, що це <strong>нова форма щомісяця</strong>, а не єдиний файл на весь рейс, і редагувати можна лише клітинки з білим фоном. Ще один канал звітності — база даних <strong>Movement Annex A</strong>, довідник, що на разі включає 82 судна, авторизовані для промислу в зоні ККАМЛР, — рух суден між підрайонами фіксується саме через цю систему.</p>
   <p>Усі звіти й журнали за вимогами Схеми SISO мають бути подані протягом <strong>одного місяця</strong> після завершення рейсу — це формальний дедлайн, а не орієнтовний термін. Значення точності й своєчасності цієї звітності важко переоцінити: саме на основі сукупних даних усіх спостерігачів флоту Науковий комітет щороку переглядає ліміти вилову й ухвалює нові заходи зі збереження.</p>`],
  ["Звітність до інституту (терміни, форма)",
   "— поза межами наданого пакету документів; загальна практика",
   `<p><strong>Ця тема не входила до наданого пакету документів — конкретні терміни й форма звітності до вашого інституту визначаються вашою організацією, а не ККАМЛР; нижче — загальна логіка, типова для програм наукового спостереження, яку варто уточнити з технічним координатором.</strong></p>
   <p>Окрім офіційної звітності до Секретаріату ККАМЛР і держави прапора (Звіт про рейс, журнал C2), спостерігач зазвичай веде окрему, паралельну звітність <strong>перед організацією, яка його відрядила</strong> — науково-дослідним інститутом чи профільним відомством. Типова практика в подібних програмах наукового спостереження включає періодичні проміжні повідомлення під час самого рейсу (наприклад, коротке зведення через супутниковий зв'язок про хід виборок і стан здоров'я спостерігача), а також повноцінну фінальну звітність і передачу зібраних біологічних матеріалів (отолітів, зразків тканин для гістології, даних мічення) інституту вже після завершення рейсу й повернення на берег.</p>
   <p>Строки такої внутрішньої звітності встановлює саме відряджаюча організація, і вони можуть не збігатися з місячним дедлайном ККАМЛР для офіційних форм — деякі інститути вимагають попереднього усного чи письмового звіту одразу після сходу на берег, ще до завершення повної обробки офіційних форм. Оскільки ці деталі є суто внутрішньою процедурою вашої організації, а не частиною нормативної бази ККАМЛР, перед виходом у рейс варто безпосередньо уточнити в технічного координатора (контакти якого наведено в чек-листі підготовки цього сайту) точний перелік очікуваних звітів, їхню форму і граничні терміни подання.</p>`],
  ["Взаємодія з екіпажем, комсоставом, капітаном, іншим спостерігачем",
   "— поза межами наданого пакету документів; загальні професійні поради",
   `<p><strong>Ця тема не входила до наданого пакету документів — нижче узагальнено загальноприйняті професійні принципи роботи наукових спостерігачів, що випливають зі структури обов'язків, закріплених у Схемі SISO.</strong></p>
   <p>Спостерігач — це незалежний збирач даних, а не представник контролюючого органу з примусовими повноваженнями (цю роль виконують інспектори, розглянуті окремою темою третього дня). Тому на практиці ефективність роботи спостерігача значною мірою залежить від його здатності підтримувати професійні, спокійні й неконфліктні стосунки з капітаном і екіпажем — саме через добровільне сприяння екіпажу спостерігач отримує практичний доступ до улову, знарядь лову й документації судна, необхідний для виконання завдань.</p>
   <p>Водночас ця доброзичливість не повинна підважувати неупередженість, прямо закріплену в обов'язках спостерігача за Схемою SISO: приймати подарунки, послуги чи будь-що цінне понад стандартне забезпечення від судна заборонено саме для того, щоб уникнути конфлікту інтересів. Практичний баланс — чітко й заздалегідь узгоджувати графік своїх спостережень і відбору проб із режимом роботи судна (наприклад, час постановки й виборки ярусу), щоб мінімізувати перешкоди для промислових операцій, залишаючись при цьому послідовним і принциповим у фіксації фактів.</p>
   <p>Коли на борту одночасно перебувають національний і міжнародний спостерігачі (або два міжнародні спостерігачі різних держав), важливо координувати покриття вибірки — узгоджувати, хто які виборки чи секції ярусу охоплює, щоб уникнути як дублювання роботи, так і прогалин у даних, а також звіряти між собою результати біологічного відбору проб для узгодженості. Будь-які розбіжності чи конфліктні ситуації з екіпажем варто фіксувати через офіційний канал — примітку в Звіті про рейс, — а не вирішувати неформальною конфронтацією на борту.</p>`]
];

const day3Lectures = [
  ["Інспекційна перевірка суден у морі",
   "<a href=\"18-inspection.html\">Інспекційна система</a>",
   `<p>Морська інспекція (CM 10-02) — один із двох стовпів Інспекційної системи ККАМЛР, заснованої 1989 р. на основі ст. XXIV Конвенції. Її принципова особливість: інспектор, призначений <strong>будь-якою</strong> Договірною стороною (Designated Inspector, щосезонне призначення), має право підніматися на борт й інспектувати рибальське судно <strong>іншої</strong> Договірної сторони в зоні дії Конвенції — незалежно від того, під прапором якої держави ходить це судно. Це принципово відрізняється від звичайної практики міжнародного морського права, де контроль над судном зазвичай належить винятково державі його прапора.</p>
   <p>За результатами інспекції в морі складається <strong>звіт про інспекцію</strong> (at-sea inspection report), який передається одночасно до Секретаріату ККАМЛР і державі прапора судна — саме держава прапора, отримавши цей звіт, вирішує, чи є підстави для подальшого переслідування судна за виявлені порушення (санкції накладає держава прапора, а не сам інспектор чи ККАМЛР як організація).</p>
   <p>Для спостерігача практичне значення морської інспекції в тому, що саме журнали й записи, які він веде день у день (журнал C2, дані мічення, звіт про рейс), можуть слугувати додатковим джерелом інформації для інспектора під час перевірки — тому акуратність і своєчасність власної документації напряму впливає на те, наскільки гладко пройде можлива інспекція на судні, де працює спостерігач.</p>`],
  ["Інспекційна перевірка суден у порту",
   "<a href=\"18-inspection.html\">Інспекційна система</a>",
   `<p>Портова інспекція регулюється окремим заходом — CM 10-03. На відміну від морської інспекції, де перевірки вибіркові й залежать від наявності інспектора поблизу, портова інспекція має чіткі кількісні вимоги: <strong>усі 100%</strong> суден, що заходять у порт з іклачем на борту, підлягають обов'язковій інспекції, а для суден з іншими антарктичними ресурсами — не менш як <strong>50%</strong>.</p>
   <p>Судно зобов'язане завчасно, щонайменше за <strong>48 годин</strong> до заходу в порт, надати приймаючій державі дані, потрібні для оцінки, чи мало воно право вести промисел у зоні ККАМЛР і чи відповідала його діяльність заходам зі збереження. Якщо судно планує вивантажити чи перевантажити <strong>іклача</strong>, приймаюча Договірна сторона зобов'язана перевірити, що вантаж супроводжується документацією <strong>Схеми документування вилову (CDS)</strong>, і звірити фізичний вантаж із даними, зазначеними в цій документації — це головний механізм, що не дає нелегально виловленій рибі потрапити на легальний ринок через офіційний порт.</p>
   <p>Для спостерігача, що завершує рейс саме таким судном, важливо розуміти: дані, зафіксовані ним протягом рейсу (обсяги вилову, райони промислу), напряму впливають на те, наскільки гладко пройде портова звірка — розбіжність між заявленим і реально задокументованим уловом є однією з найпоширеніших причин затримки судна в порту для додаткової перевірки.</p>`],
  ["Взаємодія наукового спостерігача з інспекторами",
   "<a href=\"18-inspection.html\">Інспекційна система</a>",
   `<p>Важливо чітко розуміти різницю ролей: науковий спостерігач <strong>не є</strong> інспектором і не має жодних повноважень примусового характеру — він не може затримати судно, накласти санкцію чи офіційно звинуватити екіпаж у порушенні. Його функція — незалежний, неупереджений збір наукових і статистичних даних згідно зі Схемою SISO, тоді як інспектор діє за зовсім іншим документом (CM 10-02/10-03) і саме він уповноважений перевіряти дотримання правил і формально фіксувати порушення.</p>
   <p>Проте на практиці ці дві ролі тісно перетинаються: журнали й записи, які веде спостерігач (журнал C2, дані мічення, Звіт про рейс), є цінним джерелом інформації, яку інспектор може звіряти під час морської чи портової перевірки, — наприклад, зіставляючи заявлений уловом обсяг риби з даними обліку, які вів спостерігач протягом рейсу. Якщо дані спостерігача суттєво розходяться з офіційно заявленими суднові показниками, це може стати підставою для детальнішої інспекції.</p>
   <p>Практична порада, яка прямо випливає з цієї подвійної ролі: ведіть записи акуратно й вчасно — день у день, а не «заднім числом» наприкінці рейсу. Саме така документація найкраще витримує звірку під час інспекції та опосередковано підтверджує сумлінність і надійність самого спостерігача як джерела даних, що позитивно впливає на довіру до нього в майбутніх рейсах.</p>`],
  ["Іспит для кандидатів",
   "<a href=\"10-test.html\">Самоперевірка (тест)</a>",
   `<p>Завершальний етап трьохденного стажування — іспит для кандидатів на виконання функцій наукового спостерігача. Хоча конкретний формат офіційного іспиту визначає організація, що його проводить, цей сайт пропонує практичний інструмент для фінальної підготовки: розділ «Самоперевірка» містить банк із 80 питань, згрупованих за тими самими 8 тематичними розділами, що й сам семінар (керівні документи, заходи зі збереження, форми, знаряддя лова, визначники, ВМЕ, мічення).</p>
   <p>Для підготовки в умовах, наближених до реальних, на сторінці тесту доступний спеціальний <strong>режим екзамену</strong>: можна обрати випадкову підмножину питань (20, 40, 60 або всі 80) і встановити таймер зворотного відліку (20–90 хвилин), після чого після завершення (за часом або достроково) сайт автоматично покаже не лише загальний відсоток правильних відповідей, а й <strong>детальний підсумок за кожним із 8 розділів окремо</strong> — це дозволяє точково визначити, яка саме тема потребує додаткового повторення перед реальним іспитом, а не просто загальну оцінку.</p>
   <p>Рекомендована стратегія фінальних днів перед іспитом: спочатку пройти повний тест у звичайному режимі й переглянути помилки через кнопку «Повторити лише помилки», потім повторити слабкі теми через «Глосарій термінів» і «Флеш-картки» (зокрема позначаючи важкі картки зіркою для повторного перегляду), і насамкінець — один-два прогони в режимі екзамену з таймером для тренування роботи під часовим тиском, що максимально наближено імітує умови справжнього іспиту.</p>`]
];

const page19 = section("intern-intro", "Про програму стажування", `
  ${p("Ця сторінка відтворює розклад тем 3-денного очного стажування для кандидатів на посаду наукового спостерігача ККАМЛР і показує, який розділ цього сайту покриває кожну тему. До кожної теми додано розгорнуту лекцію-відповідь (кнопка «▼ Лекція») — синтез усієї інформації з наданих документів і, там, де джерел не було, додатково дослідженого матеріалу.")}
  ${comment("Розклад складено на основі внутрішньої програми стажування (не офіційний документ CCAMLR). Шість тем не мали джерела в наданому пакеті документів (законодавство України, дослідницькі квадрати, океанологія Південного океану, DST CTD, звітність до інституту, взаємодія з екіпажем) — лекції для них підготовлено додатково за відкритими джерелами й позначено окремим застереженням на початку тексту.")}
`) +
section("intern-day1", "День перший", `
  ${h3("Загальні питання")}
  ${lectureTable(day1aLectures)}
  ${h3("Географічні, океанологічні та біологічні особливості регіону. Знаряддя лову")}
  ${lectureTable(day1bLectures)}
`) +
section("intern-day2", "День другий — Науковий спостерігач: права, обов'язки, завдання", `
  ${lectureTable(day2Lectures)}
`) +
section("intern-day3", "День третій — Інспекційна система. Іспит", `
  ${lectureTable(day3Lectures)}
`);

// =====================================================================
// PAGE 09 — CHEATSHEET
// =====================================================================

const page09 = `
<div class="cheatsheet">
<button id="cheatsheetPrint" class="btn" type="button" style="margin-bottom:16px;">🖨 Зберегти як PDF / Друкувати</button>
${section("cs1", "1. Керівні документи", ul([
  "<strong>Конвенція</strong> — 33 статті; дія — на південь від 60° пд.ш. та між цією широтою й Антарктичною конвергенцією; штаб-квартира — Хобарт; 4 офіційні мови; ст. IX — функції Комісії, ст. XXIV — основа SISO.",
  "<strong>Схема SISO</strong> — розділи A–H; Додаток I — 11 завдань спостерігача; Додаток II — надзвичайні ситуації; звіти подавати протягом 1 місяця після рейсу.",
  "<strong>SISO Manual 2026</strong> — 17 розділів + 4 додатки; облік 25% часу виборки на спостерігача."
]))}
${section("cs2", "2. Заходи зі збереження (Schedule 2025/26)", ul([
  "<strong>Нумерація:</strong> XX-YY (рік): XX — категорія (10 дотримання, 20 загальні, 30-60 промислові, 90 охоронювані території), YY — номер.",
  "<strong>Набуття чинності:</strong> нотифікація на початку листопада → діє з 1 грудня → обов'язкова ~через 180 днів (травень наступного року, ст. IX.6).",
  "<strong>Ключові ліміти іклача 2025/26:</strong> 88.1 — D. mawsoni 3278 т; 88.2 — 1624 т; 48.4 — D. eleginoides 33 т / D. mawsoni 32 т; 58.5.2 — D. eleginoides 2120 т/сезон; 58.4.1 — 0 т (закрито).",
  "<strong>Птахи/ссавці:</strong> CM 25-02 — мінімізація смертності птахів на ярусі; CM 24-02 — обважнений ярус; CM 25-03 — трал.",
  "<strong>ВМЕ:</strong> CM 22-06 / 22-07 — донний промисел і потенційні ВМЕ; CM 22-09 — захист зареєстрованих ВМЕ."
]))}
${section("cs34", "3–4. Форми головні / Форми та інструкції", ul([
  "<strong>en_C2v2026a</strong> — 9 аркушів: Introduction, Vessel and Gear, Set and Haul Details, Haul Catch, Conversion Factors, Tagging, Tag Recapture, VME Data, CCAMLR codes.",
  "<strong>Cruise Report</strong> — 16 таблиць; конфіденційний; подається Секретаріату й Комісару прапора судна.",
  "<strong>Movement Annex A</strong> — 82 судна в довіднику.",
  "<strong>Tag Overlap Calculator</strong> — поріг 60% (мінімум) / 80% (мета); ліміт — 250 виборок, 6000 вимірів, 1000 записів мічення.",
  "<strong>Норма відбору проб іклача:</strong> ≈7 риб/1000 гачків = 35 риб/лінію (5000 гачків); з них 10 — з отолітами.",
  "<strong>Час:</strong> усі записи — в UTC, не в судновому місцевому часі.",
  "<strong>VME на борту:</strong> сегмент = 1000 гачків або 1200 м (коротше); випадкова вибірка ≈30% сегментів; тригер — 5 одиниць-індикаторів.",
  "<strong>Коди травм скатів:</strong> 0 — немає; J — щелепа; G — зябра; L — воші; I — пролапс кишківника; P — проникна травма; E — око; W — поверхнева травма; B — синці; S — рубець.",
  "<strong>Форма C2:</strong> нова форма щомісяця; редагувати лише білі клітинки."
]))}
${section("cs5", "5. Знаряддя лова", ul([
  "<strong>Ярус:</strong> автолінія (autoline, механічне наживлення), іспанська снасть (Spanish line, з становою лінією), тротлайн (trotline, гачки на тротах).",
  "<strong>Пастки (pot):</strong> конфігурація «вулик» (beehive) і прямокутна.",
  "<strong>Виключення ссавців:</strong> сітчаста панель або решітка (grid) на тралі."
]))}
${section("cs6", "6. Визначники", ul([
  "<strong>Іклач:</strong> TOA = Dissostichus mawsoni (антарктичний), TOP = D. eleginoides (патагонський); розрізнення — забарвлення спинного плавця і зуби.",
  "<strong>Macrourus (4 види):</strong> M. caml (QMC) і M. carinatus (MCC) — 8 променів; M. whitsoni (WGR) — 9 променів, 1 ряд зубів; M. holotrachys (MCH) — 8 променів, без луски на щелепі.",
  "<strong>Стадії зрілості іклача:</strong> самиці F1–F5, самці M1–M5.",
  "<strong>Пінніпеди (6 видів):</strong> морський котик (SEA), морський слон (SES), крабоїд (SET), Уеддела (SLW), леопард (SLP), Росса.",
  "<strong>риба.doc — коди:</strong> TOA, GRV, CHW, ICX, TRT, MRL, POG, ANT, SRR та ELZ (=Zoarcidae, за визначником Ross Sea Fishes) підтверджені; LIZ формально відсутній в офіційних переліках, але візуально схожий на Liparidae (слизняки)."
]))}
${section("cs7", "7. VME", ul([
  "<strong>Групи-індикатори:</strong> Cnidaria (горгонарії, чорні/кам'янисті корали, гідроїди, зоантарії), Porifera (губки), Chordata (асцидії), Bryozoa (мохуватки), Brachiopoda, Hemichordata, Annelida, Xenophyophoroidea, Arthropoda (вусоногі раки), Mollusca (антарктичний гребінець), Echinodermata (крinoїдеї, кошикові зірки/змієхвістки, олівцеві їжаки) — повна таблиця з 22 кодами у розділі 7.2.",
  "<strong>Явно НЕ включені:</strong> равлики, справжні морські зірки (Asteroidea), краби — попри те, що часто трапляються в прилові. Кошикові зірки/змієхвістки (Euryalida) — включені.",
  "<strong>Одиниця-індикатор:</strong> 1 літр (у 10-л контейнері) або 1 кг для гіллястих форм.",
  "<strong>Ризикова зона:</strong> радіус 1 морська миля від сегмента з ≥10 одиницями ВМЕ.",
  "<strong>Код FAO = код CCAMLR</strong> для всіх таксонів-індикаторів ВМЕ."
]))}
${section("cs8", "8. Tagging (мічення)", ul([
  "<strong>Програма з 2007 р.:</strong> ≈404 559 іклача позначено (12% повторний вилов), ≈71 444 скатів (3%).",
  "<strong>Час поза водою:</strong> максимум 3 хвилини.",
  "<strong>Резервуар:</strong> об'єм риби ≤10% води; іклач і скати — окремо.",
  "<strong>Місце мітки:</strong> іклач — другий спинний плавець; скат — м'яз кожного крила з боку очей.",
  "<strong>Статистика перекриття:</strong> мінімум 60%, мета 80%.",
  "<strong>Повторний вилов:</strong> фото мітки обов'язкове, приз COLTO за знайдені мітки."
]))}
</div>`;

// =====================================================================
// PAGE 10 — TEST (interactive quiz data → JSON embedded)
// =====================================================================

function q(num, text, opts, correct) { return {num, text, opts, correct}; }
const questions = {
"1. Керівні документи": [
q(1,"У яких водах застосовується Конвенція CCAMLR?",["На південь від 40° пд.ш.","На південь від 60° пд.ш. та між цією широтою і Антарктичною конвергенцією","Лише в морі Росса","На південь від Південного полярного кола"],1),
q(2,"Яка стаття Конвенції визначає функції Комісії?",["VII","IX","XXIV","XIV"],1),
q(3,"Де розташована штаб-квартира Комісії CCAMLR?",["Веллінгтон","Кейптаун","Хобарт, Тасманія","Пунта-Аренас"],2),
q(4,"Скільки офіційних мов має Комісія?",["2","3","4","5"],2),
q(5,"Яка стаття Конвенції є правовою основою Схеми міжнародного наукового спостереження (SISO)?",["IX","XXIV","XX","XII"],1),
q(6,"Хто призначає наукового спостерігача на судно?",["Держава, що приймає (Receiving Member)","Держава, що призначає (Designating Member)","Секретаріат CCAMLR","Капітан судна"],1),
q(7,"У який термін спостерігач має подати журнали й звіти після завершення рейсу?",["2 тижні","1 місяць","3 місяці","Термін не встановлено"],1),
q(8,"Скільки завдань наукових спостерігачів перераховано в Додатку I Схеми SISO?",["7","9","11","15"],2),
q(9,"Яка рекомендована частка облікового періоду виборки для спостереження за уловом (на одного спостерігача)?",["10%","25%","50%","100%"],1),
q(10,"Що заборонено спостерігачу за розділом D Схеми SISO?",["Отримувати їжу від судна","Приймати хабарі, подарунки чи будь-що цінне, окрім харчування/проживання/зарплати від судна","Спілкуватися з капітаном","Проводити біологічний відбір проб"],1)
],
"2. Заходи зі збереження": [
q(11,"Що означають перші дві цифри в номері заходу, напр. 41-09?",["Рік ухвалення","Категорію заходу","Номер підрайону","Номер судна"],1),
q(12,"До якої категорії належать заходи серії 10?",["Охоронювані території","Дотримання (Compliance)","Промислові регламенти","Загальні питання промислу"],1),
q(13,"Який захід визначає Схему документування вилову (CDS) для Dissostichus spp.?",["10-03","10-05","22-06","41-01"],1),
q(14,"Яким заходом встановлено загальні заходи для пошукових промислів Dissostichus spp. у сезоні 2025/26?",["CM 41-01","CM 32-09","CM 21-02","CM 24-01"],0),
q(15,"Який ліміт вилову Dissostichus mawsoni у підрайоні 88.1 на сезон 2025/26?",["1624 т","3278 т","713 т","281 т"],1),
q(16,"Який ліміт вилову Dissostichus mawsoni у підрайоні 88.2 на сезон 2025/26?",["3278 т","1624 т","2120 т","32 т"],1),
q(17,"Коли заходи зі збереження, ухвалені в жовтні, стають обов'язковими згідно ст. IX.6 Конвенції?",["Одразу після ухвалення","1 грудня того ж року","Приблизно через 180 днів (травень наступного року)","Через рік після ухвалення"],2),
q(18,"Який захід регулює мінімізацію випадкової смертності морських птахів під час ярусного лову?",["CM 25-02","CM 25-03","CM 24-02","CM 26-01"],0),
q(19,"Яка категорія заходів містить питання охоронюваних територій?",["Серія 10","Серія 20","Серія 30-60","Серія 90"],3),
q(20,"Який ліміт вилову D. eleginoides у підрайоні 48.4 на сезон 2025/26?",["33 т","32 т","713 т","2120 т"],0)
],
"3. Форми головні": [
q(21,"Скільки аркушів (worksheets) містить електронний журнал форми en_C2v2026a?",["6","7","9","12"],2),
q(22,"У якому аркуші форми C2 фіксуються дані про постановку й виборку ярусу?",["Vessel and Gear","Set and Haul Details","Haul Catch","Tagging"],1),
q(23,"Скільки таблиць міститься у Звіті про рейс (Cruise Report)?",["8","12","16","20"],2),
q(24,"Кому, окрім Секретаріату CCAMLR, подається заповнений звіт про рейс?",["Капітану судна","Комісару держави прапора судна","ФАО","Науковому комітету"],1),
q(25,"Скільки суден міститься в переліку аркуша «vessels» файлу Movement Annex A?",["45","62","82","100"],2),
q(26,"Який мінімальний поріг статистики перекриття мічення для відповідності CM 41-01?",["40%","50%","60%","80%"],2),
q(27,"Яка рекомендована (цільова) статистика перекриття мічення?",["60%","70%","80%","90%"],2),
q(28,"Яка максимальна кількість виборок (hauls), яку може обробити калькулятор перекриття мічення?",["100","150","250","500"],2),
q(29,"У якому аркуші форми C2 записуються дані про вразливі морські екосистеми?",["Haul Catch","VME Data","Conversion Factors","Tag Recapture"],1),
q(30,"Який документ визначає обов'язкові поля при вході/виході судна з підрайону (Annex 10-04/A)?",["Cruise Report","Movement Annex A","Tagging Manual","VME guide"],1)
],
"4. Форми та інструкції": [
q(31,"Скільки робочих аркушів описано в інструкції до ярусного журналу спостерігача 2026?",["9","12","15","18"],1),
q(32,"Яка рекомендована норма відбору проб іклача?",["3 риби на 1000 гачків","7 риб на 1000 гачків","15 риб на 1000 гачків","1 риба на 100 гачків"],1),
q(33,"Скільки з 35 відібраних риб на лінію мають отримати зібрані отоліти?",["5","10","15","25"],1),
q(34,"Що означає код травми ската «P» у логбуці?",["Пошкодження від вошей","Проникна травма перитонеальної порожнини","Травма ока","Синці"],1),
q(35,"Яка мінімальна частка сегментів лінії, яку спостерігач обирає випадково для перевірки ВМЕ?",["10%","20%","30%","50%"],2),
q(36,"Який тригерний рівень одиниць-індикаторів ВМЕ на сегмент вимагає обов'язкового відбору проб?",["1","3","5","10"],2),
q(37,"У яких одиницях слід записувати час у журналах спостерігача?",["Місцевий час судна","UTC","Час порту приписки","Довільно"],1),
q(38,"Яке ключове правило заповнення форми C2 зазначено в комерційному посібнику?",["Одна форма на весь сезон","Нова форма C2 для кожного місяця подання даних","Форма заповнюється раз на тиждень","Форму можна редагувати без обмежень"],1),
q(39,"Скільки категорій частоти втрати/скидання знарядь передбачено в аркуші Waste Disposal?",["2","3","4","5"],1),
q(40,"Яка структура номера заходу зі збереження пояснюється в комерційному посібнику C2?",["Лише рік ухвалення","2 цифри категорії + 2 цифри номера + рік ухвалення в дужках","Довільний код","Літерний код країни"],1)
],
"5. Знаряддя лова": [
q(41,"Скільки основних типів ярусної снасті описано у схемах знарядь?",["2","3","4","5"],1),
q(42,"Як називається донний ярус з додатковою становою лінією?",["Trotline","Autoline","Spanish line","Longline simple"],2),
q(43,"Що таке «trotline»?",["Ярус з механічним наживленням гачків","Ярус, де гачки прикріплені кластерами на тротах до плавучої головної лінії","Пелагічний трал","Пастка"],1),
q(44,"Скільки конфігурацій пасток (pot) описано у схемах знарядь?",["1","2","3","4"],1),
q(45,"Який пристрій встановлюється для виключення морських ссавців з тралового знаряддя?",["Стример-лінія","Сітчаста панель або решітка (grid)","Гачок-дегачувач","VMS-маяк"],1),
q(46,"Що позначає синій текст на схемах знарядь?",["Заборонені елементи","Поле специфікації знаряддя на сайті суден CCAMLR","Небезпечні зони","Розміри за замовчуванням"],1),
q(47,"Який тип трала ілюструється як «midwater beam»?",["Донний трал","Пелагічний беам-трал","Придонний отер-трал","Пастка"],1),
q(48,"Який захід зі збереження регулює обважнений ярус для збереження морських птахів?",["CM 22-05","CM 24-02","CM 26-01","CM 32-01"],1)
],
"6. Визначники": [
q(49,"Який FAO-код антарктичного іклача (Dissostichus mawsoni)?",["TOP","TOA","TOT","ANT"],1),
q(50,"Який FAO-код патагонського іклача (Dissostichus eleginoides)?",["TOA","TOP","GRV","ICX"],1),
q(51,"За якими двома первинними ознаками розрізняють два види іклача?",["Розмір ока й колір шкіри","Забарвлення спинного плавця й структура зубів","Довжина тіла й вага","Форма хвоста й кількість плавців"],1),
q(52,"Скільки видів роду Macrourus розрізняє ключ для підрайонів 88.1 і 88.3?",["2","3","4","5"],2),
q(53,"Яка різниця між M. whitsoni та M. caml за кількістю рядів зубів на нижній щелепі?",["M. whitsoni має 2–5 рядів, M. caml — один","M. whitsoni має один ряд, M. caml — 2–5 рядів","Обидва мають однакову кількість","Не розрізняються за зубами"],1),
q(54,"Що означає абревіатура SDRAL у ключі визначення довгохвостів?",["Species Data Reference Area List","Scales in a Diagonal Row from Anus to Lateral Line","Standard Deep Range Assessment List","Size Distribution Ratio at Length"],1),
q(55,"Скільки стадій зрілості гонад передбачає шкала Gasco et al. (2011) для самиць іклача?",["3","4","5","6"],2),
q(56,"Яка стадія зрілості самиці іклача характеризується тим, що при розтині випливає велика ікра?",["F2","F3","F4 (гравідна)","F5"],2),
q(57,"Скільки видів ластоногих описано в протоколі ідентифікації пінніпедів CCAMLR?",["4","5","6","8"],2),
q(58,"Який CCAMLR-код має тюлень-леопард?",["SES","SET","SLW","SLP"],3),
q(59,"Яка ознака вказує на самця пінніпеда при визначенні статі?",["Отвір одразу над задніми ластами","Два отвори — статевий і анальний вище задніх ласт","Відсутність будь-яких отворів","Наявність мантії"],1),
q(60,"Хто видав постер-визначник китів і дельфінів Південного океану?",["Секретаріат CCAMLR","ASOC (Antarctic and Southern Ocean Coalition)","NIWA","NOAA"],1)
],
"7. VME": [
q(61,"До якого типу належить більшість коралів-індикаторів ВМЕ (горгонарії, чорні корали, зоантарії)?",["Porifera","Cnidaria","Bryozoa","Chordata"],1),
q(62,"Який код відповідає склянним губкам (Hexactinellida)?",["DMO","HXY","BZN","SSX"],1),
q(63,"Що таке «одиниця-індикатор ВМЕ» (VME indicator unit)?",["1 кг будь-якого улову","1 літр організмів у 10-літровому контейнері АБО 1 кг для тих, що не поміщаються в об'єм","1 особина будь-якого виду","1 гачок з організмом"],1),
q(64,"Яка довжина «сегмента лінії» для моніторингу ВМЕ?",["500 гачків або 500 м","1000 гачків або 1200 м (яке коротше)","2000 гачків","Довільна, на розсуд капітана"],1),
q(65,"Скільки одиниць-індикаторів ВМЕ на сегмент визначає «тригерний рівень» обов'язкового відбору?",["1","3","5","10"],2),
q(66,"До якого типу належать асцидії (морські шприці)?",["Porifera","Cnidaria","Chordata","Bryozoa"],2),
q(67,"Що таке «ризикова зона» (Risk Area) за визначенням C2-посібника?",["Зона з 5 одиницями ВМЕ","Зона радіусом 1 морська миля від сегмента з ≥10 одиницями ВМЕ","Будь-яка зона донного тралення","Зона поблизу порту"],1),
q(68,"Який захід зі збереження регулює донний промисел з урахуванням потенційних ВМЕ?",["CM 22-06 / 22-07","CM 41-01","CM 10-05","CM 91-04"],0)
],
"8. Tagging (мічення)": [
q(69,"У якому році розпочалася стандартизована програма мічення CCAMLR?",["1998","2007","2013","2019"],1),
q(70,"Скільки іклача позначено й випущено станом на 2023 рік у районі дії Конвенції (приблизно)?",["~100 000","~250 000","~404 559","~1 000 000"],2),
q(71,"Який відсоток повторного вилову мічених скатів станом на 2023 рік?",["3%","12%","25%","50%"],0),
q(72,"Який максимальний час риба може перебувати поза водою під час мічення?",["1 хвилина","3 хвилини","5 хвилин","10 хвилин"],1),
q(73,"У який плавець встановлюється мітка іклача?",["Хвостовий плавець","Другий спинний плавець","Грудний плавець","Анальний плавець"],1),
q(74,"Куди встановлюються мітки скатам?",["У хвіст","У м'яз кожного крила з боку очей","У зябра","У черевний плавець"],1),
q(75,"Який мінімальний поріг статистики перекриття мічення за CM 41-01, Додаток C?",["40%","50%","60%","75%"],2),
q(76,"Яку максимальну частку об'єму накопичувального резервуара може займати риба?",["5%","10%","25%","50%"],1),
q(77,"Хто зазвичай відповідає за фізичне мічення на борту судна?",["Лише спостерігач","Спостерігач або навчений член екіпажу","Лише капітан","Береговий персонал"],1),
q(78,"Що робити з фізично поверненою міткою після фотографування (сучасна вимога)?",["Надіслати поштою до Секретаріату","Знищити на борту","Зберігати весь сезон","Передати іншому судну"],1),
q(79,"Яка організація пропонує щорічний приз за знайдені мітки?",["FAO","COLTO (Coalition of Legal Toothfish Operators)","ASOC","NIWA"],1),
q(80,"Яка з ознак НЕ є критерієм непридатності іклача до мічення?",["Гачкове ушкодження поза ротовою областю","Зябра рожеві або білі","Стандартна довжина риби менше 50 см","Відсутність рухової активності"],2)
]
};

const allQuestions = Object.values(questions).flat();
const page10 = `
${section("quiz-intro", "Самоперевірка — 80 питань", `
${p("Оберіть відповідь для кожного питання і натисніть «Перевірити результат» унизу сторінки. Питання згруповано за тими самими 8 розділами семінару.")}
<div id="quizLastResult" class="quiz-last-result" style="display:none;"></div>
<div class="exam-panel" id="examPanel">
  <h3 style="margin-top:0;">Режим екзамену</h3>
  <p class="muted" style="margin-top:0;">Випадкова підмножина питань і таймер — імітація умов реального іспиту. Після завершення показується підсумок за розділами.</p>
  <div class="exam-setup" id="examSetup">
    <label>Кількість питань:
      <select id="examCount">
        <option value="20">20</option>
        <option value="40" selected>40</option>
        <option value="60">60</option>
        <option value="80">80 (усі)</option>
      </select>
    </label>
    <label>Час на екзамен:
      <select id="examMinutes">
        <option value="20">20 хв</option>
        <option value="40" selected>40 хв</option>
        <option value="60">60 хв</option>
        <option value="90">90 хв</option>
      </select>
    </label>
    <button id="examStart" class="btn" type="button">▶ Розпочати екзамен</button>
  </div>
  <div class="exam-active" id="examActive" style="display:none;">
    <span>⏱ Залишилось:</span> <span id="examTimer" class="exam-timer">40:00</span>
    <button id="examStop" class="btn btn-secondary" type="button">Завершити достроково</button>
  </div>
</div>
<div id="quizCategoryBreakdown" class="quiz-category-breakdown" style="display:none;"></div>
<div class="quiz-controls">
  <button id="quizSubmit" class="btn">Перевірити результат</button>
  <button id="quizReset" class="btn btn-secondary">Скинути</button>
  <button id="quizReviewMistakes" class="btn btn-secondary" style="display:none;">Повторити лише помилки</button>
  <button id="quizShowAll" class="btn btn-secondary" style="display:none;">Показати всі питання</button>
  <span id="quizScore" class="quiz-score"></span>
</div>
`)}
<form id="quizForm">
${Object.entries(questions).map(([cat, qs]) => `
  <section class="card">
    <h2>${cat}</h2>
    ${qs.map(item => `
      <div class="quiz-q" data-qnum="${item.num}" data-correct="${item.correct}">
        <p class="quiz-question"><strong>${item.num}.</strong> ${item.text}</p>
        <div class="quiz-opts">
          ${item.opts.map((o,i) => `
            <label class="quiz-opt">
              <input type="radio" name="q${item.num}" value="${i}">
              <span>${String.fromCharCode(65+i)}) ${o}</span>
            </label>`).join("")}
        </div>
        <div class="quiz-feedback"></div>
      </div>
    `).join("")}
  </section>
`).join("")}
</form>
<div class="quiz-controls">
  <button id="quizSubmit2" class="btn">Перевірити результат</button>
  <span id="quizScore2" class="quiz-score"></span>
</div>
`;

// =====================================================================
// PAGE 11 — ЗАПОВНЕННЯ ЖУРНАЛІВ (ШАБЛОНИ + ПІДКАЗКИ)
// =====================================================================

function sheetTemplate(id, title, fileNote, fields, tips) {
  return section(id, title, `
    ${fileNote ? fileTag(fileNote) : ""}
    ${fields ? table(["Поле", "Приклад заповнення", "Підказка / типова помилка"], fields) : ""}
    ${tips ? comment(tips) : ""}
  `);
}

const goldenRules = [
  "<strong>Журнал заповнюється англійською мовою</strong> — усі назви полів, випадаючі списки (drop-down) і коди в самому файлі англійською. У таблицях нижче колонка «Поле» та «Приклад заповнення» навмисно залишені англійською/латиницею — саме так це виглядає і вводиться в реальному файлі; українською дано лише пояснення в колонці «Підказка».",
  "Дані можна вводити лише в клітинки з <strong>білим фоном</strong> — решта заблокована для редагування. Клітинки з довідковими списками видових/технологічних кодів мають світло-зелений фон.",
  "Усі дата/час — виключно в <strong>UTC</strong> (не місцевий час судна). Це найпоширеніша помилка новачків.",
  "Багато полів — це не вільний текст, а <strong>випадаючий список (drop-down)</strong> з наперед визначеними варіантами замість старих літерних/цифрових кодів. Обирайте значення зі списку, не вписуйте свій варіант.",
  "<strong>Set/Haul ID (Haul ID)</strong> — наскрізний послідовний унікальний номер, однаковий на всіх аркушах, що стосуються цієї виборки, і повинен збігатися з Haul ID, який використовує судно у своїх комерційних формах. Розбіжність ID між аркушами — найчастіша причина того, що дані «не зв'язуються» між аркушами.",
  "Десятковий роздільник — крапка (<code>12.5</code>), не кома.",
  "Коментарі здебільшого прибрані з журналу навмисно (щоб мінімізувати неструктуровані дані) — деталі й пояснення вносьте у <strong>звіт про рейс (Cruise Report)</strong>, а не намагайтеся дописати текст у клітинку журналу.",
  "Заповнювати впродовж виборки/дня, а не «заднім числом» наприкінці рейсу — це головна причина помилок і забутих деталей.",
  "Перед відправкою — звірити електронний журнал зі звітом про рейс (розділ 3.2) на предмет узгодженості цифр."
];

const templVesselGear = [
  ["Vessel IMO Number","9123456","Постійний номер судна, не плутати з позивним"],
  ["Vessel Name","F/V EXAMPLE STAR","Точна назва з реєстрації, латиницею як у нотифікації"],
  ["Call Sign","ABCD","Міжнародний радіопозивний"],
  ["Gear Type","Autoline","Autoline / Spanish line / Trotline / Pot — обрати зі списку, звірити з нотифікацією CCAMLR"],
  ["Streamer line height (m)","6.2","Вимірюється від точки виходу лінії (towing point) до поверхні води — рис. 1 інструкції до журналу"],
  ["Streamer spacing (m)","5","Відповідно до CM 25-02 Annex A"],
  ["Line weight test (Spanish/Trotline only)","30 weights checked","Обов'язково зважити щонайменше 30 випадкових вантажів лінії для іспанської снасті/тротлайну, результат — у звіт"]
];

const templSetHaul = [
  ["Set/Haul ID","2026014032","Наскрізний унікальний номер — той самий, що використовує судно у своїх комерційних формах"],
  ["Set start date/time (UTC)","14/07/2026 03:15","UTC, не судновий час — стосується ВСІХ дат/часу в журналі"],
  ["Haul end date/time (UTC)","14/07/2026 09:40","Має бути пізніше за час постановки"],
  ["Set start position","65 12.4 S 179 58.1 W","Формат згідно з шаблоном клітинки; перевірити півкулю"],
  ["Number of hooks / Line length","3800 / 4.5 km","Узгодити з декларованим типом знаряддя"],
  ["Depth (m)","1120","Середня глибина сегмента"],
  ["Subarea/Division","88.1","Відповідно до статистичних підрайонів CCAMLR"]
];

const templObsCatch = [
  ["Random tally period (%)","25","Рекомендовано мінімум 25% на одного спостерігача — не занижувати без обґрунтування"],
  ["Species code","TOA","Обирається з випадаючого списку у верхній частині аркуша (світло-зелені клітинки)"],
  ["Number of individuals","47","За обліковий період виборки"],
  ["Green weight (kg)","310","До переробки"],
  ["Evidence of predation — heads","3","Нове поле з 2018 р.: голови з явно вилученою хижаком частиною тіла"],
  ["Evidence of predation — lips only","1","Гачки лише з губами риби (без тіла) рахуються окремим полем"]
];

const templHaulImaf = [
  ["Set/Haul ID","2026014032","Має збігатися з аркушем Set and Haul Details"],
  ["Observed (Yes/No)","Yes","Так, якщо спостерігач особисто бачив підйом тварини на борт під час облікового періоду"],
  ["Species","Diomedea exulans","Латинська назва або найнижчий можливий таксономічний рівень"],
  ["Caught during (Setting/Hauling)","Hauling","Птахи, гачковані під час hauling, зазвичай живі й без намоклого пір'я"],
  ["Fate","Dead","Alive released / Alive injured / Dead"]
];

const templMarineMammal = [
  ["Set/Haul ID","2026014032","Той самий обліковий період, що й для Observed Haul Catch"],
  ["Observation possible (Yes/No)","Yes","No — якщо погана погода, туман або недостатнє освітлення унеможливлюють спостереження"],
  ["Presence/Absence","Presence","Presence також якщо тварин чутно, але не видно (дихання китів, гавкіт тюленів)"],
  ["Time first observed (UTC)","05:42","—"],
  ["Species code","Baleen whales nei","Найнижчий можливий таксономічний рівень, за визначником розділу 6.8"],
  ["Depredation observed (Yes/No)","Yes","Тюлені пірнають біля лінії/забирають рибу, або риба піднята з явними слідами хижацтва"],
  ["Min / Max number observed","2 / 4","Оцінка діапазону чисельності, а не точний підрахунок"]
];

const templHaulVme = [
  ["Set/Haul ID","2026014032","Той самий сегмент лінії (1000 гачків або 1200 м)"],
  ["Sample Type","Trigger","Random (~30% сегментів) або Trigger (≥5 одиниць-індикаторів) — якщо випадковий сегмент виявився ≥5 одиниць, все одно позначайте «Random», не змінюйте на «Trigger»"],
  ["Line segment mid-point position","65 10 S 179 40 W","Координати середини сегмента лінії, повідомлені капітаном"],
  ["VME taxon","Gorgonian octocorals","Обрати з випадаючого списку відповідно до VME-визначника, розділ 7"],
  ["Bucket unit (litres or kg)","1.5","1 л у 10-літровому контейнері АБО 1 кг для гіллястих форм (напр. горгонарії)"]
];

const templBioSampling = [
  ["Set/Haul ID","2026014032","—"],
  ["Species code","TOA","—"],
  ["Standard length, SL (cm)","98","Від писка до кінця хребта — «злам» видно, якщо злегка зігнути хвіст"],
  ["Total length, TL (cm)","106","Від писка до найдальшої точки хвоста"],
  ["Sex","F","M / F"],
  ["Gonad stage","F3","За шкалою F1–F5 (самиці) / M1–M5 (самці), розділ 6.2"],
  ["Otoliths collected (Yes/No)","Yes","Мета — 10 риб з отолітами на кожні 35 біопроб на лінію; решта 25 — лише проміри"],
  ["Fish serial number (optional)","014-BIO-07","Необов'язкове поле — власна зручність спостерігача при повторних вимірах"]
];

const templConversion = [
  ["Test date","16/07/2026","Мінімум 20 риб при вході в район управління, повторювати щонайменше раз на тиждень"],
  ["Species code","TOA","—"],
  ["Green weight (kg)","187","Вода з шлунка зливається перед зважуванням (ножем або трубкою)"],
  ["Processed weight (kg)","121","Після обробки у спосіб, прийнятий на судні"],
  ["Conversion factor","1.55 (авторозрахунок)","Аркуш рахує автоматично = green weight / processed weight"],
  ["Grade","Grade A","Код якості продукту від технолога цеху — опис у звіті про рейс"]
];

const templTagging = [
  ["Set/Haul ID","2026014032","—"],
  ["Tag ID (primary)","CCAMLR123456","Послідовний номер з партії; умовне форматування підсвічує дублікати"],
  ["Tag ID (secondary)","CCAMLR123457","Подвійне мічення послідовними номерами — рекомендована практика"],
  ["Species code","TOA","Іклач або скат — окремі критерії придатності"],
  ["Release position","65 09 S 179 35 W","Реальна позиція випуску риби, а не позиція початку/кінця виборки"],
  ["Length at tagging (cm)","91","Вимірюється до мічення"]
];

const templRecapture = [
  ["Tag ID","CCAMLR098765","Списати точно з фізичної мітки"],
  ["Tag photo (CCAMLR template)","IMG_0231.jpg attached","Обов'язково — електронне фото зі штампом часу на офіційному шаблоні-лінійці CCAMLR"],
  ["Recapture length (cm)","104","—"],
  ["Sex / Gonad stage","F / F4","Повний біологічний відбір проб"],
  ["Injury code (skates/rays only)","0","До 3 кодів травми: 0=немає, J/G/L/I/P/E/W/B/S — розділ 4.1"]
];

const templWaste = [
  ["Item type","Fishing Gear","Fishing Gear (непридатне знаряддя/обрізки лінії) або General Waste (пластик, метал, упаковка, олива, каналізація)"],
  ["Lost or Discarded","Lost","Lost — ненавмисно змито в море; Discarded — навмисне скидання"],
  ["Frequency","Occasionally","Occasionally (<1 раз/тиждень) / Weekly (кілька разів на тиждень) / Daily (щодня)"],
  ["Retained (for General Waste)","Non-incinerated","Non-incinerated або Incinerated — як відходи зберігаються для утилізації на березі"]
];

const templIuu = [
  ["Date/time of sighting (UTC)","17/07/2026 14:20","—"],
  ["Position","64 55 S 177 12 W","—"],
  ["Vessel name / Call sign / Flag","Unknown / not visible / not visible","Обов'язково зазначити джерело: візуально чи по радіозв'язку"],
  ["Gear/vessel description","Longline gear without buoys, no visible markings","Що конкретніше — то краще: колір корпусу, надбудова тощо; деталі — у Cruise Report"],
  ["Recovered gillnet mesh size (if applicable)","n/a","Для виявлених покинутих зябрових сіток — обов'язково виміряти розмір вічка"]
];

const page11 =
section("templ-intro", "11.0 Загальні правила заповнення (перед усіма аркушами)", `
  ${p("Нижче — приклади заповнення для всіх 12 робочих аркушів електронного журналу спостерігача (окремий файл-журнал спостерігача, версія OL_v2026 — не плутати з комерційною формою en_C2_2026a.xlsx, яку заповнює судно). <strong>Усі приклади в колонці «Приклад заповнення» — вигадані навчальні дані</strong> (умовне судно, умовний рейс 2026 року) англійською мовою — саме так їх треба вводити в реальному файлі. Пояснення дано українською лише в колонці «Підказка».")}
  ${ul(goldenRules)}
  ${comment("Цей розділ складено на основі вимог, розсіяних по кількох документах (2026 Observer Longline Logbook Instructions, C2 Commercial data manual, VME guide) і зведено в один практичний чекліст — у жодному з оригінальних файлів такого зведеного переліку немає. Назви полів звірені напряму з текстом інструкції до журналу спостерігача (не перекладені й не вигадані), оскільки сам журнал ведеться англійською.")}
`) +
sheetTemplate("templ-vessel", "11.1 Vessel and Gear", "2026 Observer Longline Logbook Instructions.pdf", templVesselGear,
  "Заповнюється один раз на рейс (на початку), але перевіряється й коригується, якщо тип знаряддя або конфігурація стример-лінії змінюється протягом рейсу.") +
sheetTemplate("templ-sethaul", "11.2 Set and Haul Details", "2026 Observer Longline Logbook Instructions.pdf", templSetHaul,
  "Це «хребет» журналу — Set/Haul ID звідси переноситься практично на всі інші аркуші. Типова помилка — розбіжність в один символ, через яку аркуші перестають зв'язуватися між собою.") +
sheetTemplate("templ-obscatch", "11.3 Observed Haul Catch", "2026 Observer Longline Logbook Instructions.pdf", templObsCatch,
  "Обліковий період — випадково обраний відрізок виборки (рекомендовано не менше 25%), а не «весь улов на око». Важливо, щоб спостереження покривали різні секції ярусу протягом усього рейсу, а не завжди одну й ту саму частину.") +
sheetTemplate("templ-imaf", "11.4 Haul IMAF (взаємодія з птахами й ссавцями)", "2026 Observer Longline Logbook Instructions.pdf", templHaulImaf,
  "Записувати навіть випадки, коли тварина була відпущена живою і без видимих травм — це так само цінні дані для оцінки ефективності заходів пом'якшення. Поле «Observed» критично важливе — на його основі рахують екстрапольовану смертність.") +
sheetTemplate("templ-marinemammal", "11.5 Marine Mammal Observation", "2026 Observer Longline Logbook Instructions.pdf", templMarineMammal,
  "Заповнюється за той самий обліковий період, що й Observed Haul Catch, і навіть тоді, коли ссавців НЕ виявлено (щоб зафіксувати сам факт спроби спостереження, а не лише позитивні результати).") +
sheetTemplate("templ-vme", "11.6 Haul VME", "2026 Observer Longline Logbook Instructions.pdf", templHaulVme,
  "Не плутати випадкову вибірку (Random, ~30% сегментів) з тригерною (Trigger, ≥5 одиниць-індикаторів) — це дві незалежні одна від одної вимоги, і тип вибірки в полі Sample Type не змінюється заднім числом.") +
sheetTemplate("templ-bio", "11.7 Biological Sampling", "2026 Observer Longline Logbook Instructions.pdf", templBioSampling,
  "Норма ≈7 риб/1000 гачків (35 риб на лінію з 5000 гачків, 10 з отолітами) — мінімум, який легко пропустити при побіжному читанні інструкції. Для інших (небайкетчевих) видів — до 10 екз./день або до 100 екз. за рейс на вид прилову.") +
sheetTemplate("templ-conversion", "11.8 Conversion Factors", "2026 Observer Longline Logbook Instructions.pdf", templConversion,
  "Мінімум 20 риб на тест, повторювати щонайменше раз на тиждень для кожного району управління окремо — тест, зроблений один раз на весь рейс, не відповідає вимозі.") +
sheetTemplate("templ-tagging", "11.9 Tagging", "2026 Observer Longline Logbook Instructions.pdf", templTagging,
  "Умовне форматування в файлі автоматично підсвічує дублікати номерів міток — якщо клітинка підсвітилась, негайно перевірте номер, а не ігноруйте попередження.") +
sheetTemplate("templ-recapture", "11.10 Tag Recapture", "2026 Observer Longline Logbook Instructions.pdf", templRecapture,
  "Фізичну мітку більше не потрібно відправляти Секретаріату поштою — досить якісного, читабельного електронного фото зі штампом часу на офіційному шаблоні-лінійці CCAMLR.") +
sheetTemplate("templ-waste", "11.11 Waste Disposal", "2026 Observer Longline Logbook Instructions.pdf", templWaste,
  "Чесне зазначення випадкових втрат знаряддя — нормативна вимога, а не привід для дисциплінарних висновків. Деталі й конкретні проблеми описуйте у звіті про рейс, а не намагайтеся вмістити в поле журналу.") +
sheetTemplate("templ-iuu", "11.12 IUU Sightings", "2026 Observer Longline Logbook Instructions.pdf", templIuu,
  "Головне правило безпеки: фіксація, а не контакт. Судно зобов'язане повідомити Секретаріат про ННН-спостереження якнайшвидше; дані спостерігача (особливо фото) — важливе доповнення до цього звіту.");

// =====================================================================
// WRITE FILES
// =====================================================================

fs.writeFileSync("index.html", layout("Головна", "index.html", indexBody));
fs.writeFileSync("01-governing.html", layout("Керівні документи", "01-governing.html", page01));
fs.writeFileSync("02-measures.html", layout("Заходи зі збереження", "02-measures.html", page02));
fs.writeFileSync("03-forms-main.html", layout("Форми головні", "03-forms-main.html", page03));
fs.writeFileSync("04-forms-instructions.html", layout("Форми та інструкції", "04-forms-instructions.html", page04));
fs.writeFileSync("05-gear.html", layout("Знаряддя лова", "05-gear.html", page05));
fs.writeFileSync("06-identification.html", layout("Визначники", "06-identification.html", page06));
fs.writeFileSync("07-vme.html", layout("VME", "07-vme.html", page07));
fs.writeFileSync("08-tagging.html", layout("Мічення (Tagging)", "08-tagging.html", page08));
fs.writeFileSync("09-cheatsheet.html", layout("Шпаргалка", "09-cheatsheet.html", page09));
fs.writeFileSync("10-test.html", layout("Самоперевірка (тест)", "10-test.html", page10));
fs.writeFileSync("11-templates.html", layout("Заповнення журналів", "11-templates.html", page11));
fs.writeFileSync("12-species-cards.html", layout("Картки видів", "12-species-cards.html", page12));
fs.writeFileSync("13-library.html", layout("Бібліотека документів", "13-library.html", page13, { description: "Каталог усіх 21 первинних документів CCAMLR/SISO, використаних на сайті, з можливістю перегляду та завантаження." }));
fs.writeFileSync("14-glossary.html", layout("Глосарій термінів", "14-glossary.html", page14, { description: "Глосарій англійських термінів CCAMLR SISO з українським перекладом і фонетичною вимовою кирилицею: терміни форм, абревіатури, біологічні терміни." }));
fs.writeFileSync("15-flashcards.html", layout("Флеш-картки", "15-flashcards.html", page15, { description: "Інтерактивні флеш-картки для повторення термінів і видових кодів CCAMLR SISO перед іспитом." }));
fs.writeFileSync("16-checklist.html", layout("Чек-лист підготовки", "16-checklist.html", page16, { description: "Інтерактивний чек-лист підготовки до рейсу спостерігача CCAMLR SISO: документи, спорядження, технічна підготовка." }));
fs.writeFileSync("17-other-fisheries.html", layout("Інші промисли (криль/кальмари/краби)", "17-other-fisheries.html", page17, { description: "Промисел антарктичного криля, кальмарів (Martialia hyadesi) і крабів (Paralomis spp.) у зоні CCAMLR — знаряддя лову, ліміти вилову, особливості для наукового спостерігача." }));
fs.writeFileSync("18-inspection.html", layout("Інспекційна система", "18-inspection.html", page18, { description: "Інспекційна система CCAMLR: інспекція суден у морі (CM 10-02) і в порту (CM 10-03), взаємодія наукового спостерігача з інспекторами, звітність про ННН-промисел." }));
fs.writeFileSync("19-internship.html", layout("Програма стажування", "19-internship.html", page19, { description: "Розклад 3-денного стажування для кандидатів на наукового спостерігача CCAMLR із посиланнями на відповідні розділи сайту." }));

// =====================================================================
// SEARCH INDEX
// =====================================================================

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&laquo;|&raquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const searchPages = [
  ["index.html", "Головна", indexBody],
  ["01-governing.html", "1. Керівні документи", page01],
  ["02-measures.html", "2. Заходи зі збереження", page02],
  ["03-forms-main.html", "3. Форми головні", page03],
  ["04-forms-instructions.html", "4. Форми та інструкції", page04],
  ["05-gear.html", "5. Знаряддя лова", page05],
  ["06-identification.html", "6. Визначники", page06],
  ["07-vme.html", "7. VME", page07],
  ["08-tagging.html", "8. Мічення (Tagging)", page08],
  ["11-templates.html", "Заповнення журналів", page11],
  ["12-species-cards.html", "Картки видів", page12],
  ["13-library.html", "Бібліотека документів", page13],
  ["14-glossary.html", "Глосарій термінів", page14],
  ["15-flashcards.html", "Флеш-картки", page15],
  ["16-checklist.html", "Чек-лист підготовки", page16],
  ["17-other-fisheries.html", "Інші промисли (криль/кальмари/краби)", page17],
  ["18-inspection.html", "Інспекційна система", page18],
  ["19-internship.html", "Програма стажування", page19],
  ["09-cheatsheet.html", "Шпаргалка", page09],
  ["10-test.html", "Самоперевірка (тест)", page10]
];

// Build a per-section index (id + heading + plain text) so search results can deep-link
// to the specific <section id="..."> anchor, not just the page.
const SECTION_RE = /<section id="([^"]+)" class="card">\s*<h2>([\s\S]*?)<\/h2>([\s\S]*?)<\/section>/g;
const searchIndex = [];
searchPages.forEach(([url, pageTitle, html]) => {
  let m;
  let found = false;
  SECTION_RE.lastIndex = 0;
  while ((m = SECTION_RE.exec(html)) !== null) {
    found = true;
    const [, secId, heading, body] = m;
    const text = stripHtml(heading + " " + body);
    if (text.length > 5) {
      searchIndex.push({
        url: url + "#" + secId,
        page: pageTitle,
        heading: stripHtml(heading),
        text: text.slice(0, 4000)
      });
    }
  }
  if (!found) {
    const text = stripHtml(html);
    if (text.length > 5) {
      searchIndex.push({ url, page: pageTitle, heading: pageTitle, text: text.slice(0, 4000) });
    }
  }
});

fs.mkdirSync(path.join(__dirname, "js"), { recursive: true });
fs.writeFileSync(
  path.join(__dirname, "js/search-index.js"),
  "const SEARCH_INDEX = " + JSON.stringify(searchIndex) + ";\n"
);

console.log("All pages written. Total questions:", allQuestions.length, "| Search index entries:", searchIndex.length);
