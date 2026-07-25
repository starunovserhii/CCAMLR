// ============================================================================
// OLv2026a — інтерактивна форма журналу спостерігача.
// Рушій рендеру + валідація + автозбереження чернетки + експорт у .xlsx.
// Схема винесена в js/olv2026-schema.js (OLV_SCHEMA) — щоб додати нове поле
// чи розділ, достатньо відредагувати схему; цей файл коду не потребує змін.
//
// Іменування полів у DOM (атрибут name), роздільник "::" (не "_", бо ключі
// полів самі містять "_"):
//   одиночне поле:           <sectionId>::<fieldKey>
//   рядок таблиці:            <tablePrefix>::<rowIndex>::<fieldKey>
//   tablePrefix для kind=table:     <sectionId>
//   tablePrefix для kind=mixed:     <sectionId>::t
//   tablePrefix для kind=multitable:<sectionId>::<tableKey>
// ============================================================================

(function () {
  "use strict";

  var DRAFT_KEY = "ccamlr_olv2026_draft_v1";
  var root, statusEl, errorsBox;
  var openTooltip = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function cssEscape(s) { return s.replace(/([.#\[\]:])/g, "\\$1"); }
  function byName(name) { return root.querySelector('[name="' + cssEscape(name) + '"]'); }

  // ---- info tooltip ---------------------------------------------------
  function infoButtonHtml(f) {
    var lines = [];
    lines.push("<strong>" + esc(f.ua) + "</strong>");
    if (f.hint) lines.push("<span>" + esc(f.hint) + "</span>");
    if (f.req) lines.push("<em>Поле обов’язкове для заповнення.</em>");
    return (
      '<span class="olv-info-wrap">' +
      '<button type="button" class="olv-info-btn" aria-label="Підказка: ' + esc(f.ua) + '">i</button>' +
      '<span class="olv-tooltip" role="tooltip">' + lines.join("") + "</span>" +
      "</span>"
    );
  }
  var tooltipPinned = false;

  function positionTooltip(btn, tip) {
    var margin = 8;
    var r = btn.getBoundingClientRect();
    var tw = tip.offsetWidth;
    var th = tip.offsetHeight;
    var left = r.left;
    if (left + tw > window.innerWidth - margin) left = window.innerWidth - tw - margin;
    if (left < margin) left = margin;
    var top = r.bottom + 6;
    if (top + th > window.innerHeight - margin) {
      var above = r.top - th - 6;
      top = above > margin ? above : margin;
    }
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  function openTooltipFor(btn) {
    var tip = btn.nextElementSibling;
    if (!tip || !tip.classList.contains("olv-tooltip")) return;
    if (openTooltip && openTooltip !== tip) closeTooltip();
    tip.classList.add("show");
    positionTooltip(btn, tip);
    openTooltip = tip;
  }
  function closeTooltip() {
    if (openTooltip) openTooltip.classList.remove("show");
    openTooltip = null;
    tooltipPinned = false;
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".olv-info-btn");
    if (btn) {
      e.preventDefault();
      var tip = btn.nextElementSibling;
      if (openTooltip === tip && tooltipPinned) { closeTooltip(); return; }
      openTooltipFor(btn);
      tooltipPinned = true;
      return;
    }
    if (openTooltip && !e.target.closest(".olv-tooltip")) closeTooltip();
  });
  document.addEventListener("mouseover", function (e) {
    var btn = e.target.closest && e.target.closest(".olv-info-btn");
    if (btn) openTooltipFor(btn);
  });
  document.addEventListener("mouseout", function (e) {
    if (tooltipPinned) return;
    var wrap = e.target.closest && e.target.closest(".olv-info-wrap");
    if (!wrap) return;
    if (e.relatedTarget && wrap.contains(e.relatedTarget)) return;
    closeTooltip();
  });
  document.addEventListener("focusin", function (e) {
    var btn = e.target.closest && e.target.closest(".olv-info-btn");
    if (btn) openTooltipFor(btn);
  });
  document.addEventListener("focusout", function (e) {
    var btn = e.target.closest && e.target.closest(".olv-info-btn");
    if (btn && !tooltipPinned) closeTooltip();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeTooltip(); closePrintSummary(); } });
  window.addEventListener("scroll", function () { closeTooltip(); }, true);
  window.addEventListener("resize", function () { closeTooltip(); });

  // ---- soft "code not in reference list" warning (datalist fields) ------
  function extractCode(entry) {
    var i = entry.indexOf(" — ");
    return (i === -1 ? entry : entry.slice(0, i)).trim().toUpperCase();
  }
  function checkCodeWarn(el) {
    var warnSlot = root.querySelector('[data-warn-for="' + cssEscape(el.name) + '"]');
    if (!warnSlot) return;
    var listId = el.getAttribute("list");
    var val = el.value.trim();
    if (!val || !listId) { warnSlot.textContent = ""; el.classList.remove("olv-code-warn"); return; }
    var dl = document.getElementById(listId);
    if (!dl) { warnSlot.textContent = ""; return; }
    var options = Array.prototype.slice.call(dl.querySelectorAll("option"));
    if (!options.length) { warnSlot.textContent = ""; return; }
    var valUpper = val.toUpperCase();
    var matched = options.some(function (o) {
      var full = o.getAttribute("value") || "";
      return full.toUpperCase() === valUpper || extractCode(full) === valUpper;
    });
    if (matched) { warnSlot.textContent = ""; el.classList.remove("olv-code-warn"); }
    else {
      warnSlot.textContent = "⚠ Такого коду немає в довіднику підказок (список неповний) — це не обов'язково помилка, але перевірте написання.";
      el.classList.add("olv-code-warn");
    }
  }

  // ---- field input rendering -------------------------------------------
  function inputAttrs(f) {
    var a = ' data-key="' + f.k + '" data-type="' + f.type + '"';
    if (f.req) a += " required";
    if (f.min !== undefined) a += ' min="' + f.min + '"';
    if (f.max !== undefined) a += ' max="' + f.max + '"';
    if (f.step !== undefined) a += ' step="' + f.step + '"';
    if (f.ph) a += ' placeholder="' + esc(f.ph) + '"';
    return a;
  }

  function renderControl(f, name, idAttr) {
    var listId = "";
    var listHtml = "";
    if (f.list) {
      listId = "dl_" + name.replace(/[^a-zA-Z0-9]/g, "_");
      listHtml = '<datalist id="' + listId + '">' + f.list.map(function (v) { return '<option value="' + esc(v) + '">'; }).join("") + "</datalist>";
    }
    var idPart = idAttr ? ' id="' + esc(idAttr) + '"' : "";
    var common = idPart + ' class="olv-input" name="' + esc(name) + '"' + inputAttrs(f);
    switch (f.type) {
      case "select":
        return "<select" + common + '><option value="">—</option>' + f.opts.map(function (o) {
          return '<option value="' + esc(o[0]) + '">' + esc(o[0]) + "</option>";
        }).join("") + "</select>";
      case "textarea":
        return "<textarea" + common + ' rows="2"></textarea>';
      case "int":
        return '<input type="number"' + common + ' step="' + (f.step || 1) + '">' + listHtml;
      case "num":
        return '<input type="number"' + common + ' step="' + (f.step || "any") + '">' + listHtml;
      case "date":
        return '<input type="date"' + common + ">";
      case "datetime":
        return '<input type="datetime-local"' + common + ">";
      case "time":
        return '<input type="time"' + common + ">";
      case "email":
        return '<input type="email"' + common + ">" + listHtml;
      default:
        return '<input type="text"' + common + (f.list ? ' list="' + listId + '"' : "") + ">" + listHtml;
    }
  }

  // ---- GPS / поточний час: автозаповнення координат і дати/часу ----------
  // Ключ = "<sectionId або sectionId::tableKey>::<fieldKey>". Прив'язка суто
  // декларативна — щоб додати ще одне поле під автозаповнення, достатньо
  // додати рядок сюди, коду більше ніде міняти не треба.
  var QUICK_FILL = {
    "sethaul::set_lat_deg": { kind: "coord-deg", axis: "lat", pairMin: "set_lat_min" },
    "sethaul::set_lon_deg": { kind: "coord-deg", axis: "lon", pairMin: "set_lon_min" },
    "sethaul::set_start": { kind: "now-datetime" },
    "sethaul::set_finish": { kind: "now-datetime" },
    "sethaul::haul_start": { kind: "now-datetime" },
    "sethaul::haul_finish": { kind: "now-datetime" },
    "vme::lat_deg": { kind: "coord-full", axis: "lat" },
    "vme::lon_deg": { kind: "coord-full", axis: "lon" },
    "tagging::release_lat": { kind: "coord-full", axis: "lat" },
    "tagging::release_lon": { kind: "coord-full", axis: "lon" },
    "iuu::gear::lat_deg": { kind: "coord-full", axis: "lat" },
    "iuu::gear::lon_deg": { kind: "coord-full", axis: "lon" },
    "iuu::gear::sight_dt": { kind: "now-datetime" },
    "iuu::vessel::sight_dt": { kind: "now-datetime" },
    "mmo::time_obs": { kind: "now-time" },
  };

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function decimalToDegMin(dec) {
    var deg = Math.trunc(dec);
    var min = Math.abs(dec - deg) * 60;
    return { deg: deg, min: Math.round(min * 100) / 100 };
  }

  function quickFillButtonsHtml(prefix, f, name) {
    var cfg = QUICK_FILL[prefix + "::" + f.k];
    if (!cfg) return "";
    if (cfg.kind === "coord-deg") {
      var minName = name.slice(0, name.length - f.k.length) + cfg.pairMin;
      return '<button type="button" class="olv-quick-gps" data-axis="' + esc(cfg.axis) + '" data-deg="' + esc(name) + '" data-min="' + esc(minName) + '" title="Підставити з GPS (широта/довгота, градуси+хвилини)">📍</button>';
    }
    if (cfg.kind === "coord-full") {
      return '<button type="button" class="olv-quick-gps" data-axis="' + esc(cfg.axis) + '" data-deg="' + esc(name) + '" title="Підставити з GPS (десяткові градуси)">📍</button>';
    }
    if (cfg.kind === "now-datetime") {
      return '<button type="button" class="olv-quick-now" data-target="' + esc(name) + '" data-kind="datetime" title="Підставити поточну дату й час (UTC)">🕒</button>';
    }
    if (cfg.kind === "now-time") {
      return '<button type="button" class="olv-quick-now" data-target="' + esc(name) + '" data-kind="time" title="Підставити поточний час (UTC)">🕒</button>';
    }
    return "";
  }

  // ---- single/mixed group rendering (label grid) ------------------------
  function renderGroupField(f, sectionId) {
    var name = sectionId + "::" + f.k;
    return (
      '<div class="olv-field">' +
      '<label class="olv-label" for="' + esc(name) + '">' + esc(f.en) + ' <span class="olv-field-ua">/ ' + esc(f.ua || "") + "</span>" + (f.req ? '<span class="olv-req">*</span>' : "") + infoButtonHtml(f) + quickFillButtonsHtml(sectionId, f, name) + "</label>" +
      renderControl(f, name, name) +
      '<div class="olv-error" data-error-for="' + esc(name) + '"></div>' +
      (f.list ? '<div class="olv-warn" data-warn-for="' + esc(name) + '"></div>' : "") +
      "</div>"
    );
  }

  function renderGroups(groups, sectionId) {
    return groups.map(function (g) {
      return (
        '<div class="olv-group">' +
        '<h3 class="olv-group-title">' + esc(g.en) + '<span class="olv-group-title-ua"> / ' + esc(g.ua || "") + "</span></h3>" +
        '<div class="olv-grid">' + g.fields.map(function (f) { return renderGroupField(f, sectionId); }).join("") + "</div>" +
        "</div>"
      );
    }).join("");
  }

  // ---- repeatable table rendering ---------------------------------------
  function tableHeaderRow(fields, fixedRows) {
    var leadTh = fixedRows ? '<th class="olv-fixed-label-th">Категорія / Category</th>' : "";
    return "<tr>" + leadTh + fields.map(function (f) {
      return "<th>" + esc(f.en) + ' <span class="olv-field-ua">/ ' + esc(f.ua || "") + "</span>" + (f.req ? '<span class="olv-req">*</span>' : "") + infoButtonHtml(f) + "</th>";
    }).join("") + '<th class="olv-col-del"></th></tr>';
  }

  function buildFixedRow(fields, tablePrefix, rowIndex, rowDef) {
    var tr = document.createElement("tr");
    tr.dataset.row = String(rowIndex);
    var leadTd = '<td class="olv-fixed-label" data-label="Категорія / Category">' + esc(rowDef.en) + '<span class="olv-field-ua"> / ' + esc(rowDef.ua || "") + "</span></td>";
    var cells = fields.map(function (f) {
      var name = tablePrefix + "::" + rowIndex + "::" + f.k;
      return '<td data-label="' + esc(rowDef.en + " — " + f.en) + '">' + renderControl(f, name) +
        '<div class="olv-error" data-error-for="' + esc(name) + '"></div>' +
        (f.list ? '<div class="olv-warn" data-warn-for="' + esc(name) + '"></div>' : "") +
        "</td>";
    }).join("");
    tr.innerHTML = leadTd + cells + '<td class="olv-col-del" data-label="Дії / Actions"></td>';
    return tr;
  }

  // Чи є в цій таблиці поля з координатами під групову GPS-кнопку рядка.
  function rowHasQuickGps(fields, tablePrefix) {
    return fields.some(function (f) {
      var cfg = QUICK_FILL[tablePrefix + "::" + f.k];
      return cfg && (cfg.kind === "coord-deg" || cfg.kind === "coord-full");
    });
  }

  // Чи має ця таблиця (крім самої Set and Haul Details) наскрізне поле
  // Haul Number — для кнопки "той самий Haul, що й вище".
  function rowHasHaulCopy(fields, tablePrefix) {
    return tablePrefix !== "sethaul" && fields.some(function (f) { return f.k === "haul_no"; });
  }

  function rowActionButtonsHtml(fields, tablePrefix) {
    var html = "";
    if (rowHasHaulCopy(fields, tablePrefix)) {
      html += '<button type="button" class="olv-same-haul" title="Скопіювати № Haul з рядка вище" aria-label="Скопіювати № Haul з рядка вище">= Haul↑</button>';
    }
    if (rowHasQuickGps(fields, tablePrefix)) {
      html += '<button type="button" class="olv-row-gps" title="Підставити GPS в усі координатні поля цього рядка" aria-label="Підставити GPS в усі координатні поля цього рядка">📍рядок</button>';
    }
    html +=
      '<button type="button" class="olv-row-up" title="Перемістити рядок вгору" aria-label="Перемістити рядок вгору">↑</button>' +
      '<button type="button" class="olv-row-down" title="Перемістити рядок вниз" aria-label="Перемістити рядок вниз">↓</button>' +
      '<button type="button" class="olv-dup-row" title="Дублювати рядок" aria-label="Дублювати рядок">⧉</button>' +
      '<button type="button" class="olv-del-row" title="Видалити рядок" aria-label="Видалити рядок">✕</button>';
    return html;
  }

  function buildRow(fields, tablePrefix, rowIndex) {
    var tr = document.createElement("tr");
    tr.dataset.row = String(rowIndex);
    tr.innerHTML = fields.map(function (f) {
      var name = tablePrefix + "::" + rowIndex + "::" + f.k;
      return '<td data-label="' + esc(f.en + " / " + (f.ua || "")) + '"><div class="olv-cell-fill">' + renderControl(f, name) + quickFillButtonsHtml(tablePrefix, f, name) + "</div>" +
        '<div class="olv-error" data-error-for="' + esc(name) + '"></div>' +
        (f.list ? '<div class="olv-warn" data-warn-for="' + esc(name) + '"></div>' : "") +
        "</td>";
    }).join("") +
      '<td class="olv-col-del" data-label="Дії / Actions">' + rowActionButtonsHtml(fields, tablePrefix) + "</td>";
    return tr;
  }

  // Наступне значення для наскрізного номера (haul_no/fish_no/segment_no):
  // максимум серед уже введених значень цього поля в таблиці + 1.
  function nextSeqValue(tbody, fieldKey) {
    var max = 0;
    tbody.querySelectorAll('[data-key="' + fieldKey + '"]').forEach(function (el) {
      var v = parseInt(el.value, 10);
      if (!isNaN(v) && v > max) max = v;
    });
    return max + 1;
  }

  function wireTable(tableEl, fields, tablePrefix) {
    var tbody = tableEl.querySelector("tbody");
    var counter = { n: 0 };
    tableEl._addRow = function (values, opts) {
      opts = opts || {};
      var tr = buildRow(fields, tablePrefix, counter.n++);
      tbody.appendChild(tr);
      if (values) {
        setRowValues(tr, values);
      } else if (!opts.noAutoSeq) {
        fields.forEach(function (f) {
          if (!f.seq) return;
          var el = tr.querySelector('[data-key="' + f.k + '"]');
          if (el && !el.value) el.value = nextSeqValue(tbody, f.k);
        });
      }
      return tr;
    };
    tbody.addEventListener("click", function (e) {
      var dupBtn = e.target.closest(".olv-dup-row");
      if (dupBtn) {
        var srcTr = dupBtn.closest("tr");
        var newTr = tableEl._addRow(null, { noAutoSeq: true });
        fields.forEach(function (f) {
          if (f.seq) return;
          var srcEl = srcTr.querySelector('[data-key="' + f.k + '"]');
          var dstEl = newTr.querySelector('[data-key="' + f.k + '"]');
          if (srcEl && dstEl) dstEl.value = srcEl.value;
        });
        fields.forEach(function (f) {
          if (!f.seq) return;
          var dstEl = newTr.querySelector('[data-key="' + f.k + '"]');
          if (dstEl && !dstEl.value) dstEl.value = nextSeqValue(tbody, f.k);
        });
        saveDraftSoon();
        updateProgress();
        return;
      }
      var sameHaulBtn = e.target.closest(".olv-same-haul");
      if (sameHaulBtn) {
        var curTr = sameHaulBtn.closest("tr");
        var prevTr = curTr.previousElementSibling;
        if (!prevTr) { if (statusEl) statusEl.textContent = "Немає рядка вище — нема звідки скопіювати № Haul."; return; }
        var prevHaulEl = prevTr.querySelector('[data-key="haul_no"]');
        var curHaulEl = curTr.querySelector('[data-key="haul_no"]');
        if (prevHaulEl && curHaulEl) { curHaulEl.value = prevHaulEl.value; saveDraftSoon(); updateProgress(); }
        return;
      }
      var rowGpsBtn = e.target.closest(".olv-row-gps");
      if (rowGpsBtn) {
        var gpsTr = rowGpsBtn.closest("tr");
        gpsTr.querySelectorAll(".olv-quick-gps").forEach(function (b) { fillGpsInto(b); });
        saveDraftSoon();
        updateProgress();
        return;
      }
      var upBtn = e.target.closest(".olv-row-up");
      if (upBtn) {
        var upTr = upBtn.closest("tr");
        var upPrev = upTr.previousElementSibling;
        if (upPrev) { tbody.insertBefore(upTr, upPrev); saveDraftSoon(); }
        return;
      }
      var downBtn = e.target.closest(".olv-row-down");
      if (downBtn) {
        var downTr = downBtn.closest("tr");
        var downNext = downTr.nextElementSibling;
        if (downNext) { tbody.insertBefore(downNext, downTr); saveDraftSoon(); }
        return;
      }
      var btn = e.target.closest(".olv-del-row");
      if (!btn) return;
      var tr = btn.closest("tr");
      if (tbody.children.length <= 1) { tr.querySelectorAll("input,select,textarea").forEach(function (el) { el.value = ""; }); return; }
      tr.remove();
      saveDraftSoon();
      updateProgress();
    });

    // Вставка з буфера обміну (напр. з Excel/Google Таблиць): якщо вставлені
    // дані містять кілька рядків/стовпців (є таб/перенос рядка), розподіляємо
    // їх по полях таблиці, починаючи з поля, куди відбувається вставка,
    // додаючи нові рядки за потреби — замість вставки одного суцільного тексту.
    tbody.addEventListener("paste", function (e) {
      var target = e.target;
      if (!target || !target.classList || !target.classList.contains("olv-input")) return;
      var cd = e.clipboardData || window.clipboardData;
      if (!cd) return;
      var text = cd.getData("text");
      if (!text || (text.indexOf("\n") === -1 && text.indexOf("\t") === -1)) return;
      e.preventDefault();
      var rowsText = text.replace(/\r/g, "").split("\n");
      while (rowsText.length && rowsText[rowsText.length - 1] === "") rowsText.pop();
      var startKeyIdx = fields.findIndex(function (f) { return f.k === target.dataset.key; });
      if (startKeyIdx === -1) startKeyIdx = 0;
      var startTr = target.closest("tr");
      var trs = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
      var startRowIdx = trs.indexOf(startTr);
      rowsText.forEach(function (rowText, ri) {
        var cols = rowText.split("\t");
        var rowIdx = startRowIdx + ri;
        var tr = trs[rowIdx];
        if (!tr) { tr = tableEl._addRow(null, { noAutoSeq: true }); trs.push(tr); }
        cols.forEach(function (val, ci) {
          var f = fields[startKeyIdx + ci];
          if (!f) return;
          var el = tr.querySelector('[data-key="' + f.k + '"]');
          if (el) el.value = val.trim();
        });
      });
      saveDraftSoon();
      updateProgress();
    });
  }

  // Видалити всі рядки таблиці, де жодне поле не заповнене (лишає мінімум 1).
  function deleteEmptyRows(tableEl) {
    var tbody = tableEl.querySelector("tbody");
    var trs = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
    var removed = 0;
    trs.forEach(function (tr) {
      if (tbody.children.length <= 1) return;
      var anyVal = Array.prototype.slice.call(tr.querySelectorAll(".olv-input")).some(function (el) { return el.value.trim() !== ""; });
      if (!anyVal) { tr.remove(); removed++; }
    });
    return removed;
  }

  function setRowValues(tr, values) {
    Object.keys(values).forEach(function (k) {
      var el = tr.querySelector('[data-key="' + k + '"]');
      if (el) el.value = values[k];
    });
  }

  // ---- section renderers --------------------------------------------------
  function calloutHtml(t) {
    var kindClass = t.kind === "warn" ? "olv-callout-warn" : "olv-callout-tip";
    return '<div class="olv-callout ' + kindClass + '"><strong>' + esc(t.label) + "</strong><span>" + esc(t.text) + "</span></div>";
  }

  function sectionHeaderHtml(sec) {
    return "<h2>" + esc(sec.num) + ". " + esc(sec.en) + '<span class="olv-section-ua"> / ' + esc(sec.ua) + "</span></h2>" +
      (sec.guide ? '<p class="olv-guide">' + esc(sec.guide) + "</p>" : "") +
      (sec.note ? '<p class="olv-note">' + esc(sec.note) + "</p>" : "") +
      (sec.tips && sec.tips.length ? sec.tips.map(calloutHtml).join("") : "");
  }

  function renderSectionSingle(sec) {
    var el = document.createElement("section");
    el.className = "card olv-section";
    el.id = "olv-" + sec.id;
    el.innerHTML = sectionHeaderHtml(sec) + renderGroups(sec.groups, sec.id);
    return el;
  }

  function makeTableBlock(titleEn, titleUa, fields, tablePrefix, tkeyAttr, fixedRows) {
    var wrap = document.createElement("div");
    wrap.innerHTML =
      (titleEn ? '<h3 class="olv-group-title">' + esc(titleEn) + '<span class="olv-group-title-ua"> / ' + esc(titleUa) + "</span></h3>" : "") +
      '<div class="olv-table-wrap"><table class="olv-table"' + (tkeyAttr ? ' data-tkey="' + esc(tkeyAttr) + '"' : "") + "><thead>" + tableHeaderRow(fields, fixedRows) + "</thead><tbody></tbody></table></div>" +
      (fixedRows ? "" :
        '<div class="olv-table-btns">' +
        '<button type="button" class="btn olv-add-row">+ Додати рядок (' + esc(titleEn || "") + ")</button>" +
        '<button type="button" class="btn btn-secondary olv-clear-empty">🧹 Видалити порожні рядки</button>' +
        "</div>");
    var table = wrap.querySelector("table");
    var tbody = table.querySelector("tbody");
    if (fixedRows) {
      fixedRows.forEach(function (rowDef, idx) { tbody.appendChild(buildFixedRow(fields, tablePrefix, idx, rowDef)); });
    } else {
      wireTable(table, fields, tablePrefix);
      wrap.querySelector(".olv-add-row").addEventListener("click", function () { table._addRow(); saveDraftSoon(); });
      wrap.querySelector(".olv-clear-empty").addEventListener("click", function () {
        var removed = deleteEmptyRows(table);
        if (statusEl) statusEl.textContent = removed ? "Видалено порожніх рядків: " + removed + "." : "Порожніх рядків не знайдено.";
        saveDraftSoon();
        updateProgress();
      });
      table._addRow();
    }
    return wrap;
  }

  function renderSectionTable(sec) {
    var el = document.createElement("section");
    el.className = "card olv-section";
    el.id = "olv-" + sec.id;
    el.innerHTML = sectionHeaderHtml(sec);
    el.appendChild(makeTableBlock(null, null, sec.fields, sec.id));
    return el;
  }

  function renderSectionMixed(sec) {
    var el = document.createElement("section");
    el.className = "card olv-section";
    el.id = "olv-" + sec.id;
    el.innerHTML = sectionHeaderHtml(sec) + renderGroups(sec.groups, sec.id);
    sec.tables.forEach(function (t) {
      el.appendChild(makeTableBlock(t.titleEn, t.titleUa, t.fields, sec.id + "::" + t.key, t.key, t.fixedRows));
    });
    return el;
  }

  function renderSectionMultitable(sec) {
    var el = document.createElement("section");
    el.className = "card olv-section";
    el.id = "olv-" + sec.id;
    el.innerHTML = sectionHeaderHtml(sec);
    sec.tables.forEach(function (t) {
      el.appendChild(makeTableBlock(t.titleEn, t.titleUa, t.fields, sec.id + "::" + t.key, t.key, t.fixedRows));
    });
    return el;
  }

  function renderAll(schema) {
    schema.sections.forEach(function (sec) {
      var node;
      if (sec.kind === "single") node = renderSectionSingle(sec);
      else if (sec.kind === "table") node = renderSectionTable(sec);
      else if (sec.kind === "mixed") node = renderSectionMixed(sec);
      else node = renderSectionMultitable(sec);
      root.appendChild(node);
    });
  }

  // ---- fill-progress panel (per-sheet ✓/⚠ indicator) ---------------------
  var progressEl = null;

  function sectionStatus(sec) {
    var prefix = sec.id + "::";
    var flatAny = false, flatMissing = false;
    var rows = {};
    root.querySelectorAll(".olv-input").forEach(function (el) {
      if (el.name.indexOf(prefix) !== 0) return;
      var m = el.name.match(/^(.+)::(\d+)::([^:]+)$/);
      var val = el.value.trim();
      if (m) {
        var rowKey = m[1] + "::" + m[2];
        if (!rows[rowKey]) rows[rowKey] = { any: false, missing: false };
        if (val !== "") rows[rowKey].any = true;
        if (el.hasAttribute("required") && val === "") rows[rowKey].missing = true;
      } else {
        if (val !== "") flatAny = true;
        if (el.hasAttribute("required") && val === "") flatMissing = true;
      }
    });
    var rowKeys = Object.keys(rows);
    var rowAny = rowKeys.some(function (k) { return rows[k].any; });
    var rowTouchedMissing = rowKeys.some(function (k) { return rows[k].any && rows[k].missing; });
    if (!flatAny && !rowAny) return "empty";
    if (flatMissing || rowTouchedMissing) return "warn";
    return "done";
  }

  function buildProgressPanel(schema) {
    if (!progressEl) return;
    progressEl.innerHTML = schema.sections.map(function (sec) {
      return '<button type="button" class="olv-progress-item" data-target="olv-' + esc(sec.id) + '" title="' +
        esc(sec.num + ". " + sec.en + " / " + sec.ua) + '"><span class="olv-progress-num">' + esc(sec.num) + "</span></button>";
    }).join("");
    progressEl.querySelectorAll(".olv-progress-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.getAttribute("data-target"));
        if (target && target.scrollIntoView) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    updateProgress();
  }

  function updateProgress() {
    if (!progressEl) return;
    window.OLV_SCHEMA.sections.forEach(function (sec) {
      var btn = progressEl.querySelector('[data-target="olv-' + sec.id + '"]');
      if (!btn) return;
      var status = sectionStatus(sec);
      btn.classList.remove("olv-progress-empty", "olv-progress-warn", "olv-progress-done");
      btn.classList.add("olv-progress-" + status);
    });
  }

  // ---- validation ---------------------------------------------------------
  function fieldLabel(el) {
    var td = el.closest("td[data-label]");
    if (td) return td.getAttribute("data-label");
    var field = el.closest(".olv-field");
    if (field) { var lab = field.querySelector(".olv-label"); if (lab) return lab.childNodes[0].textContent.trim(); }
    return el.name;
  }

  function setError(name, msg) {
    var slot = root.querySelector('[data-error-for="' + cssEscape(name) + '"]');
    var input = byName(name);
    if (slot) slot.textContent = msg || "";
    if (input) input.classList.toggle("olv-invalid", !!msg);
  }

  function validateAll() {
    var problems = [];
    root.querySelectorAll(".olv-input").forEach(function (el) {
      var name = el.name;
      var req = el.hasAttribute("required");
      var val = el.value.trim();
      var label = fieldLabel(el);
      var msg = "";
      if (req && !val) {
        msg = "Обов’язкове поле — заповніть «" + label + "».";
      } else if (val && el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        msg = "Некоректний формат email у полі «" + label + "» — приклад: name@example.com.";
      } else if (val && el.type === "number") {
        var num = Number(val);
        if (isNaN(num)) msg = "Поле «" + label + "» має містити число.";
        else if (el.min !== "" && num < Number(el.min)) msg = "Значення «" + label + "» не може бути меншим за " + el.min + ".";
        else if (el.max !== "" && num > Number(el.max)) msg = "Значення «" + label + "» не може бути більшим за " + el.max + ".";
      }
      setError(name, msg);
      if (msg) problems.push({ name: name, label: label, msg: msg });
    });
    return problems;
  }

  // ---- cross-sheet (referential/chronological) validation ------------------
  function crossValidate() {
    var problems = [];
    var haulSet = {};
    var seenHaul = {};
    var seenSetStart = {};
    root.querySelectorAll("table.olv-table tbody tr").forEach(function (tr) {
      var sample = tr.querySelector("[name]");
      if (!sample || sample.name.indexOf("sethaul::") !== 0) return;
      var haulEl = tr.querySelector('[data-key="haul_no"]');
      var haulVal = haulEl ? haulEl.value.trim() : "";
      if (haulVal) {
        if (seenHaul[haulVal]) {
          problems.push({ name: haulEl.name, label: "Set/ Haul Number", msg: "Дубльований № Haul «" + haulVal + "» у листі «Set and Haul Details» — номери мають бути унікальними." });
        }
        seenHaul[haulVal] = true;
        haulSet[haulVal] = true;
      }
      var setStartEl = tr.querySelector('[data-key="set_start"]');
      var setStartVal = setStartEl ? setStartEl.value.trim() : "";
      if (setStartVal) {
        if (seenSetStart[setStartVal]) {
          problems.push({
            name: setStartEl.name, label: "Set Start",
            msg: "⚠ Можливий дублікат рядка: Set Start «" + setStartVal + "» уже використано в іншому рядку Haul «" + seenSetStart[setStartVal] + "» — перевірте, чи це справді два різні Haul, чи випадково скопійований рядок."
          });
        } else {
          seenSetStart[setStartVal] = haulVal || "?";
        }
      }
      var order = [
        { k: "set_start", label: "Set Start" },
        { k: "set_finish", label: "Set Finish" },
        { k: "haul_start", label: "Haul Start" },
        { k: "haul_finish", label: "Haul Finish" },
      ];
      var prevVal = null, prevLabel = null;
      order.forEach(function (step) {
        var el = tr.querySelector('[data-key="' + step.k + '"]');
        var val = el ? el.value : "";
        if (val && prevVal && val < prevVal) {
          problems.push({ name: el.name, label: step.label, msg: "Час «" + step.label + "» (Haul " + (haulVal || "?") + ") не може бути раніше за «" + prevLabel + "» — перевірте дату/час." });
        }
        if (val) { prevVal = val; prevLabel = step.label; }
      });
    });
    window.OLV_SCHEMA.sections.forEach(function (sec) {
      if (sec.id === "sethaul") return;
      var checkGroups = [];
      if (sec.kind === "table") checkGroups = [{ fields: sec.fields, prefix: sec.id }];
      else if (sec.kind === "mixed" || sec.kind === "multitable") checkGroups = sec.tables.map(function (t) { return { fields: t.fields, prefix: sec.id + "::" + t.key }; });
      checkGroups.forEach(function (cg) {
        if (!cg.fields.some(function (f) { return f.k === "haul_no"; })) return;
        root.querySelectorAll("tbody tr").forEach(function (tr) {
          var sample = tr.querySelector("[name]");
          if (!sample || sample.name.indexOf(cg.prefix + "::") !== 0) return;
          var el = tr.querySelector('[data-key="haul_no"]');
          var val = el ? el.value.trim() : "";
          if (val && !haulSet[val]) {
            problems.push({ name: el.name, label: "Haul Number", msg: "№ Haul «" + val + "» (лист «" + sec.en + "») не знайдено серед номерів у листі «Set and Haul Details» — перевірте номер." });
          }
        });
      });
    });
    return problems;
  }

  var currentProblems = [];
  var problemCursor = -1;

  function showProblems(problems) {
    currentProblems = problems;
    problemCursor = -1;
    if (!problems.length) { errorsBox.style.display = "none"; errorsBox.innerHTML = ""; return; }
    errorsBox.style.display = "block";
    errorsBox.innerHTML =
      '<div class="olv-errors-head"><strong>Перед експортом виправте ' + problems.length + " " + (problems.length === 1 ? "помилку" : "помилки(ок)") + ':</strong>' +
      '<button type="button" id="olvNextErrBtn" class="btn btn-secondary olv-next-err">Наступна помилка →</button></div>' +
      "<ul>" + problems.slice(0, 40).map(function (p) { return '<li><a href="#" data-focus="' + esc(p.name) + '">' + esc(p.msg) + "</a></li>"; }).join("") + "</ul>";
    errorsBox.querySelectorAll("a[data-focus]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var el = byName(a.getAttribute("data-focus"));
        if (el) { if (el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); }
      });
    });
    var nextBtn = errorsBox.querySelector("#olvNextErrBtn");
    if (nextBtn) nextBtn.addEventListener("click", goToNextProblem);
    if (errorsBox.scrollIntoView) errorsBox.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goToNextProblem() {
    if (!currentProblems.length) return;
    problemCursor = (problemCursor + 1) % currentProblems.length;
    var p = currentProblems[problemCursor];
    var el = byName(p.name);
    if (el) { if (el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); }
    if (statusEl) statusEl.textContent = "Помилка " + (problemCursor + 1) + " з " + currentProblems.length + ": " + p.label;
  }

  // ---- collect / restore data ----------------------------------------------
  function collectRaw() {
    var out = {};
    root.querySelectorAll(".olv-input").forEach(function (el) { if (el.value !== "") out[el.name] = el.value; });
    return out;
  }

  function updateLastSaved(ts) {
    var el = document.getElementById("olvLastSaved");
    if (!el) return;
    el.textContent = "💾 Востаннє збережено: " + new Date(ts).toLocaleTimeString("uk-UA");
  }

  function saveDraft() {
    try {
      var ts = Date.now();
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: ts, data: collectRaw() }));
      if (statusEl) statusEl.textContent = "Чернетку збережено — " + new Date(ts).toLocaleTimeString("uk-UA");
      updateLastSaved(ts);
    } catch (e) {}
  }
  var saveTimer = null;
  function saveDraftSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 600); }

  function ensureRowsForRestore(data) {
    var maxByPrefix = {};
    Object.keys(data).forEach(function (name) {
      var m = name.match(/^(.+)::(\d+)::([^:]+)$/);
      if (m) { var pfx = m[1]; var idx = parseInt(m[2], 10); maxByPrefix[pfx] = Math.max(maxByPrefix[pfx] || 0, idx + 1); }
    });
    root.querySelectorAll("table.olv-table").forEach(function (table) {
      var sample = table.querySelector("tbody tr [name]");
      if (!sample) return;
      var m = sample.name.match(/^(.+)::(\d+)::([^:]+)$/);
      if (!m) return;
      var prefix = m[1];
      var need = maxByPrefix[prefix] || 1;
      while (table.querySelectorAll("tbody tr").length < need) table._addRow();
    });
  }

  function restoreDraft() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch (e) { raw = null; }
    if (!raw || !raw.data) return;
    ensureRowsForRestore(raw.data);
    Object.keys(raw.data).forEach(function (name) {
      var el = byName(name);
      if (el) el.value = raw.data[name];
    });
    if (statusEl) statusEl.textContent = "Чернетку відновлено (збережено " + new Date(raw.savedAt).toLocaleString("uk-UA") + ")";
    if (raw.savedAt) updateLastSaved(raw.savedAt);
  }

  function clearDraft() {
    if (!confirm("Очистити всю форму та видалити збережену чернетку? Цю дію не можна скасувати.")) return;
    localStorage.removeItem(DRAFT_KEY);
    root.innerHTML = "";
    renderAll(window.OLV_SCHEMA);
    updateProgress();
    if (statusEl) statusEl.textContent = "Форму очищено.";
    errorsBox.style.display = "none";
    errorsBox.innerHTML = "";
  }

  // ---- export: fill the REAL OLv2026a template (surgical XML edit) ---------
  // Замість генерації нового файлу "з нуля" (що втрачало б стилі/merge/формули),
  // експорт бере справжній файл-шаблон assets/OLv2026a_template.xlsx, розпаковує
  // його (fflate), і точково підставляє значення лише у клітинки, призначені для
  // введення даних (усі інші клітинки, стилі, об'єднання, формули, довідкові
  // листи "Introduction"/"CCAMLR Codes"/"Vessels" залишаються незмінними побайтово).
  var EXPORT_MAP = {
    vessel: {
      kind: "single", sheet: "Vessel and Gear",
      cells: {
        imo: "C4", vname: "C5", callsign: "C6",
        obs1_name: "C8", obs1_nat: "C9", obs1_email: "C10", obs1_start: "C12", obs1_end: "C13", obs1_board: "C14", obs1_disembark: "C15",
        obs2_name: "C18", obs2_nat: "C19", obs2_start: "C22", obs2_end: "C23",
        gear_match: "F4", set_position: "F5", offal_position: "F6",
        streamer_used: "F12", streamer_height: "F14",
      },
    },
    sethaul: {
      kind: "table", sheet: "Set and Haul Details", dataStart: 7,
      cols: { haul_no: "B", set_start: "C", set_finish: "D", set_lat_deg: "E", set_lat_min: "F", set_lon_deg: "G", set_lon_min: "H",
        hooks_set: "M", mag_set: "N", deck_light: "P", haul_start: "T", haul_finish: "U", bird_device: "AD", offal_haul: "AE", comment: "AG" },
    },
    obscatch: {
      kind: "table", sheet: "Observed Haul Catch", dataStart: 7,
      cols: { haul_no: "B", obs_id: "C", species: "D", ret_tag: "E", ret_notag: "F", disc_dead: "G", rel_alive: "H", lost_surface: "I", heads_hooks: "J", lips_hooks: "K" },
    },
    imaf: {
      kind: "table", sheet: "Haul IMAF", dataStart: 7,
      cols: { haul_no: "B", species: "C", observed: "D", when: "E", fate: "F", cause: "G", sample: "H" },
    },
    mmo: {
      kind: "table", sheet: "Marine Mammal Observation", dataStart: 7,
      cols: { haul_no: "B", obs_id: "C", obs_possible: "D", depred: "E", presence: "F", time_obs: "G", species: "H", min_n: "I", max_n: "J" },
    },
    vme: {
      kind: "table", sheet: "Haul VME", dataStart: 7,
      cols: { haul_no: "B", segment_no: "C", bucket_unit: "D", sample_type: "E", lat_deg: "F", lon_deg: "H", vme_species: "J", volume: "K", weight: "L" },
    },
    bio: {
      kind: "table", sheet: "Biological Sampling", dataStart: 7,
      cols: { haul_no: "B", fish_no: "D", obs_id: "E", species: "F", total_len: "G", std_len: "O", weight: "P", sex: "Q", maturity: "R", gonad_w: "S", otolith: "T", otolith_no: "U" },
    },
    tagging: {
      kind: "table", sheet: "Tagging", dataStart: 12,
      cols: { haul_no: "B", species: "C", release_lat: "E", release_lon: "G", tag1_id: "J", tag2_id: "L", person: "O", total_len: "P", successful: "W", comment: "X" },
    },
    conv: {
      kind: "table", sheet: "Conversion Factors", dataStart: 7,
      cols: { haul_no: "B", species: "D", proc_code: "E", green_w: "G", proc_w: "H", cut_type: "J", comment: "M" },
    },
    recapture: {
      kind: "table", sheet: "Tag Recapture", dataStart: 13,
      cols: { haul_no: "B", finder: "C", species: "D", tag1_number: "H", tag1_wording: "I", tag2_number: "L", length: "R", weight: "Y", sex: "Z", maturity: "AA", gonad_w: "AB", samples: "AD", comment: "AI" },
    },
    waste: {
      kind: "mixed", sheet: "Waste Disposal",
      cells: { incinerator: "D3", holding: "D4", gear_marked: "D6", plastic_bands: "D8" },
      tables: {
        gear: { rowStart: 11, cols: { lost: "D", discarded: "E", retained: "F" } },
        general: { rowStart: 19, cols: { lost: "D", discarded: "E", retained: "F" } },
      },
    },
    iuu: {
      kind: "multitable", sheet: "IUU Sightings",
      tables: {
        gear: { dataStart: 7, cols: { gear_type: "B", sight_dt: "C", lat_deg: "D", lon_deg: "F", photo: "H", mesh: "I" } },
        vessel: { dataStart: 7, cols: { vessel_type: "K", vessel_name: "L", call_sign: "M", flag: "N", sight_dt: "O", comm: "U", activity: "V", heading: "W" } },
      },
    },
  };

  var SHEET_XML_PATH = {
    "Vessel and Gear": "xl/worksheets/sheet2.xml",
    "Set and Haul Details": "xl/worksheets/sheet3.xml",
    "Observed Haul Catch": "xl/worksheets/sheet4.xml",
    "Haul IMAF": "xl/worksheets/sheet5.xml",
    "Marine Mammal Observation": "xl/worksheets/sheet6.xml",
    "Haul VME": "xl/worksheets/sheet7.xml",
    "Biological Sampling": "xl/worksheets/sheet8.xml",
    "Conversion Factors": "xl/worksheets/sheet9.xml",
    "Tagging": "xl/worksheets/sheet10.xml",
    "Tag Recapture": "xl/worksheets/sheet11.xml",
    "Waste Disposal": "xl/worksheets/sheet12.xml",
    "IUU Sightings": "xl/worksheets/sheet13.xml",
  };

  function buildFieldTypeIndex(schema) {
    var idx = {};
    schema.sections.forEach(function (sec) {
      if (sec.kind === "single") {
        sec.groups.forEach(function (g) { g.fields.forEach(function (f) { idx[sec.id + "::" + f.k] = f.type; }); });
      } else if (sec.kind === "table") {
        sec.fields.forEach(function (f) { idx[sec.id + "::" + f.k] = f.type; });
      } else if (sec.kind === "mixed") {
        sec.groups.forEach(function (g) { g.fields.forEach(function (f) { idx[sec.id + "::" + f.k] = f.type; }); });
        sec.tables.forEach(function (t) { t.fields.forEach(function (f) { idx[sec.id + "::" + t.key + "::" + f.k] = f.type; }); });
      } else {
        sec.tables.forEach(function (t) { t.fields.forEach(function (f) { idx[sec.id + "::" + t.key + "::" + f.k] = f.type; }); });
      }
    });
    return idx;
  }

  function excelSerialUTC(y, mo, d, h, mi) {
    var ms = Date.UTC(y, mo - 1, d, h || 0, mi || 0);
    var epoch = Date.UTC(1899, 11, 30);
    return (ms - epoch) / 86400000;
  }

  function cellValueFor(type, raw) {
    if (raw === "" || raw == null) return null;
    if (type === "int" || type === "num") {
      var n = Number(raw);
      return isNaN(n) ? null : { numeric: true, value: n };
    }
    if (type === "date") {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
      return m ? { numeric: true, value: excelSerialUTC(+m[1], +m[2], +m[3], 0, 0) } : null;
    }
    if (type === "datetime") {
      var m2 = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(raw);
      return m2 ? { numeric: true, value: excelSerialUTC(+m2[1], +m2[2], +m2[3], +m2[4], +m2[5]) } : null;
    }
    if (type === "time") {
      var m3 = /^(\d{2}):(\d{2})$/.exec(raw);
      return m3 ? { numeric: true, value: ((+m3[1]) * 60 + (+m3[2])) / 1440 } : null;
    }
    return { numeric: false, value: String(raw) };
  }

  function xmlEscapeText(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function setCellInXml(xml, ref, cellVal) {
    if (!cellVal) return xml;
    var reSelf = new RegExp('<c r="' + ref + '"([^>]*)/>');
    var reFull = new RegExp('<c r="' + ref + '"([^>]*)>[\\s\\S]*?</c>');
    var m = reSelf.exec(xml);
    if (!m) m = reFull.exec(xml);
    if (!m) return xml; // цільова клітинка не знайдена у шаблоні — пропускаємо, нічого не ламаємо
    var attrs = m[1].replace(/\s+t="[^"]*"/, "");
    var newCell = cellVal.numeric
      ? '<c r="' + ref + '"' + attrs + "><v>" + cellVal.value + "</v></c>"
      : '<c r="' + ref + '"' + attrs + ' t="inlineStr"><is><t xml:space="preserve">' + xmlEscapeText(cellVal.value) + "</t></is></c>";
    return xml.slice(0, m.index) + newCell + xml.slice(m.index + m[0].length);
  }

  function collectTemplateWrites() {
    var writes = {};
    function push(sheet, ref, cellVal) {
      if (!cellVal) return;
      if (!writes[sheet]) writes[sheet] = [];
      writes[sheet].push({ ref: ref, cellVal: cellVal });
    }
    var schema = window.OLV_SCHEMA;
    var typeIdx = buildFieldTypeIndex(schema);
    schema.sections.forEach(function (sec) {
      var map = EXPORT_MAP[sec.id];
      if (!map) return;
      if (map.kind === "single") {
        Object.keys(map.cells).forEach(function (k) {
          var el = byName(sec.id + "::" + k);
          if (!el || el.value === "") return;
          push(map.sheet, map.cells[k], cellValueFor(typeIdx[sec.id + "::" + k], el.value));
        });
      } else if (map.kind === "table") {
        var written = 0;
        root.querySelectorAll("tbody tr").forEach(function (tr) {
          var sample = tr.querySelector("[name]");
          if (!sample || sample.name.indexOf(sec.id + "::") !== 0) return;
          var rowVals = {}, any = false;
          Object.keys(map.cols).forEach(function (k) {
            var el = tr.querySelector('[data-key="' + k + '"]');
            var v = el ? el.value : "";
            if (v !== "") any = true;
            rowVals[k] = v;
          });
          if (!any) return;
          var rowNum = map.dataStart + written;
          written++;
          Object.keys(map.cols).forEach(function (k) {
            if (rowVals[k] === "") return;
            push(map.sheet, map.cols[k] + rowNum, cellValueFor(typeIdx[sec.id + "::" + k], rowVals[k]));
          });
        });
      } else if (map.kind === "mixed") {
        if (map.cells) {
          Object.keys(map.cells).forEach(function (k) {
            var el = byName(sec.id + "::" + k);
            if (!el || el.value === "") return;
            push(map.sheet, map.cells[k], cellValueFor(typeIdx[sec.id + "::" + k], el.value));
          });
        }
        Object.keys(map.tables || {}).forEach(function (tkey) {
          var tmap = map.tables[tkey];
          var prefix = sec.id + "::" + tkey;
          root.querySelectorAll("tbody tr").forEach(function (tr) {
            var sample = tr.querySelector("[name]");
            if (!sample || sample.name.indexOf(prefix + "::") !== 0) return;
            var rowIdx = parseInt(tr.dataset.row, 10);
            var rowNum = tmap.rowStart + rowIdx;
            Object.keys(tmap.cols).forEach(function (k) {
              var el = tr.querySelector('[data-key="' + k + '"]');
              var v = el ? el.value : "";
              if (v === "") return;
              push(map.sheet, tmap.cols[k] + rowNum, cellValueFor(typeIdx[sec.id + "::" + tkey + "::" + k], v));
            });
          });
        });
      } else if (map.kind === "multitable") {
        Object.keys(map.tables).forEach(function (tkey) {
          var tmap = map.tables[tkey];
          var prefix = sec.id + "::" + tkey;
          var written = 0;
          root.querySelectorAll("tbody tr").forEach(function (tr) {
            var sample = tr.querySelector("[name]");
            if (!sample || sample.name.indexOf(prefix + "::") !== 0) return;
            var rowVals = {}, any = false;
            Object.keys(tmap.cols).forEach(function (k) {
              var el = tr.querySelector('[data-key="' + k + '"]');
              var v = el ? el.value : "";
              if (v !== "") any = true;
              rowVals[k] = v;
            });
            if (!any) return;
            var rowNum = tmap.dataStart + written;
            written++;
            Object.keys(tmap.cols).forEach(function (k) {
              if (rowVals[k] === "") return;
              push(map.sheet, tmap.cols[k] + rowNum, cellValueFor(typeIdx[sec.id + "::" + tkey + "::" + k], rowVals[k]));
            });
          });
        });
      }
    });
    return writes;
  }

  var _templateBytesCache = null;
  function fetchTemplateBytes() {
    if (_templateBytesCache) return Promise.resolve(_templateBytesCache);
    return fetch("assets/OLv2026a_template.xlsx").then(function (resp) {
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return resp.arrayBuffer();
    }).then(function (buf) {
      _templateBytesCache = new Uint8Array(buf);
      return _templateBytesCache;
    });
  }

  function buildTemplateExportBlob() {
    return fetchTemplateBytes().then(function (templateBytes) {
      var files = fflate.unzipSync(templateBytes);
      var writes = collectTemplateWrites();
      var decoder = new TextDecoder("utf-8");
      var encoder = new TextEncoder();
      Object.keys(writes).forEach(function (sheetName) {
        var path = SHEET_XML_PATH[sheetName];
        if (!path || !files[path]) return;
        var xml = decoder.decode(files[path]);
        writes[sheetName].forEach(function (w) { xml = setCellInXml(xml, w.ref, w.cellVal); });
        files[path] = encoder.encode(xml);
      });
      var zipped = fflate.zipSync(files, { level: 6 });
      return new Blob([zipped], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    });
  }

  function doExport() {
    var problems = validateAll().concat(crossValidate());
    problems.forEach(function (p) { setError(p.name, p.msg); });
    showProblems(problems);
    if (problems.length) return;
    if (typeof fflate === "undefined") {
      alert("Бібліотеку експорту ще не завантажено (потрібне інтернет-з’єднання під час першого відкриття сторінки). Перевірте з’єднання і спробуйте ще раз.");
      return;
    }
    if (statusEl) statusEl.textContent = "Формування файлу на основі шаблону…";
    buildTemplateExportBlob().then(function (blob) {
      var vnameEl = byName("vessel::vname");
      var vname = vnameEl && vnameEl.value ? vnameEl.value.trim().replace(/[^a-zA-Z0-9]+/g, "_") : "vessel";
      var today = new Date().toISOString().slice(0, 10);
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "OLv2026a_" + vname + "_" + today + ".xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      if (statusEl) statusEl.textContent = "Файл експортовано (на основі оригінального шаблону) — " + new Date().toLocaleTimeString("uk-UA");
    }).catch(function (e) {
      alert("Не вдалося сформувати файл на основі шаблону (" + e.message + "). Перевірте інтернет-з’єднання (потрібне для першого завантаження файлу-шаблону) і спробуйте ще раз.");
      if (statusEl) statusEl.textContent = "Помилка експорту.";
    });
  }

  // ---- draft export/import as a file (backup independent of localStorage) --
  function draftFileBaseName() {
    var vnameEl = byName("vessel::vname");
    var vname = vnameEl && vnameEl.value ? vnameEl.value.trim().replace(/[^a-zA-Z0-9]+/g, "_") : "chernetka";
    return "OLv2026a_" + vname + "_" + new Date().toISOString().slice(0, 10);
  }

  function downloadDraftFile() {
    var payload = { app: "ccamlr-olv2026", version: window.OLV_SCHEMA.version, savedAt: Date.now(), data: collectRaw() };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = draftFileBaseName() + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    if (statusEl) statusEl.textContent = "Чернетку збережено у файл — " + new Date().toLocaleTimeString("uk-UA");
  }

  function importDraftFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var raw;
      try { raw = JSON.parse(reader.result); } catch (e) { alert("Не вдалося прочитати файл — це не коректний JSON-файл чернетки."); return; }
      if (!raw || typeof raw.data !== "object") { alert("Файл не містить очікуваної структури чернетки цієї форми."); return; }
      if (!confirm("Завантажити чернетку з файлу? Поточні дані у формі буде замінено.")) return;
      root.innerHTML = "";
      renderAll(window.OLV_SCHEMA);
      ensureRowsForRestore(raw.data);
      Object.keys(raw.data).forEach(function (name) {
        var el = byName(name);
        if (el) el.value = raw.data[name];
      });
      saveDraft();
      updateProgress();
      if (statusEl) statusEl.textContent = "Чернетку завантажено з файлу" + (raw.savedAt ? " (збережено " + new Date(raw.savedAt).toLocaleString("uk-UA") + ")" : "") + ".";
      errorsBox.style.display = "none";
      errorsBox.innerHTML = "";
    };
    reader.readAsText(file, "utf-8");
  }

  // ---- fill with example data (training/demo) -------------------------------
  function sampleValueFor(f) {
    if (f.type === "datetime") {
      var dtMap = { set_start: "2025-12-01T04:30", set_finish: "2025-12-01T06:15", haul_start: "2025-12-01T10:00", haul_finish: "2025-12-01T13:45", sight_dt: "2025-12-01T09:00" };
      return dtMap[f.k] || "2025-12-01T04:30";
    }
    switch (f.type) {
      case "select": return f.opts && f.opts.length ? f.opts[0][0] : "";
      case "date": return "2025-12-01";
      case "time": return "04:30";
      case "email": return "observer@example.com";
      case "int": return f.k === "haul_no" ? "1" : String(Math.max(f.min !== undefined ? f.min : 1, 1));
      case "num": return f.ph || String(f.min !== undefined ? f.min : 1);
      default: return f.ph || "EXAMPLE";
    }
  }

  function fillTableRows(prefix, fields) {
    root.querySelectorAll("tbody tr").forEach(function (tr) {
      var sample = tr.querySelector("[name]");
      if (!sample || sample.name.indexOf(prefix + "::") !== 0) return;
      fields.forEach(function (f) {
        var el = tr.querySelector('[data-key="' + f.k + '"]');
        if (el) el.value = sampleValueFor(f);
      });
    });
  }

  function fillExample() {
    if (!confirm("Заповнити форму прикладовими даними для демонстрації структури? Наявні введені дані буде перезаписано.")) return;
    var schema = window.OLV_SCHEMA;
    schema.sections.forEach(function (sec) {
      if (sec.kind === "single") {
        sec.groups.forEach(function (g) { g.fields.forEach(function (f) { var el = byName(sec.id + "::" + f.k); if (el) el.value = sampleValueFor(f); }); });
      } else if (sec.kind === "table") {
        fillTableRows(sec.id, sec.fields);
      } else if (sec.kind === "mixed") {
        sec.groups.forEach(function (g) { g.fields.forEach(function (f) { var el = byName(sec.id + "::" + f.k); if (el) el.value = sampleValueFor(f); }); });
        sec.tables.forEach(function (t) { fillTableRows(sec.id + "::" + t.key, t.fields); });
      } else {
        sec.tables.forEach(function (t) { fillTableRows(sec.id + "::" + t.key, t.fields); });
      }
    });
    saveDraft();
    updateProgress();
    if (statusEl) statusEl.textContent = "Форму заповнено прикладовими даними (лише для демонстрації).";
  }

  // ---- printable summary overlay --------------------------------------------
  function buildPrintSummaryHtml() {
    var schema = window.OLV_SCHEMA;
    var html = '<div class="olv-print-head"><h2>OLv2026a — зведена сторінка (перевірка перед друком/експортом)</h2><p>' + esc(new Date().toLocaleString("uk-UA")) + "</p></div>";
    schema.sections.forEach(function (sec) {
      var any = false;
      var block = "<h3>" + esc(sec.num + ". " + sec.en + " / " + sec.ua) + "</h3>";
      var flatRows = "";
      if (sec.kind === "single" || sec.kind === "mixed") {
        sec.groups.forEach(function (g) {
          g.fields.forEach(function (f) {
            var el = byName(sec.id + "::" + f.k);
            var v = el ? el.value.trim() : "";
            if (v) { any = true; flatRows += "<tr><th>" + esc(f.en) + "</th><td>" + esc(v) + "</td></tr>"; }
          });
        });
      }
      if (flatRows) block += '<table class="olv-print-table">' + flatRows + "</table>";
      var tableGroups = [];
      if (sec.kind === "table") tableGroups = [{ fields: sec.fields, prefix: sec.id, title: null, fixedRows: null }];
      else if (sec.kind === "mixed") tableGroups = sec.tables.map(function (t) { return { fields: t.fields, prefix: sec.id + "::" + t.key, title: t.titleEn, fixedRows: t.fixedRows || null }; });
      else if (sec.kind === "multitable") tableGroups = sec.tables.map(function (t) { return { fields: t.fields, prefix: sec.id + "::" + t.key, title: t.titleEn, fixedRows: t.fixedRows || null }; });
      tableGroups.forEach(function (tg) {
        var trs = [];
        root.querySelectorAll("tbody tr").forEach(function (tr) {
          var sample = tr.querySelector("[name]");
          if (!sample || sample.name.indexOf(tg.prefix + "::") !== 0) return;
          var cells = tg.fields.map(function (f) { var el = tr.querySelector('[data-key="' + f.k + '"]'); return el ? el.value.trim() : ""; });
          if (!cells.some(function (c) { return c !== ""; })) return;
          if (tg.fixedRows) {
            var rowIdx = parseInt(tr.dataset.row, 10);
            var label = tg.fixedRows[rowIdx] ? tg.fixedRows[rowIdx].en : "";
            cells = [label].concat(cells);
          }
          trs.push(cells);
        });
        if (trs.length) {
          any = true;
          var headCells = tg.fields.map(function (f) { return "<th>" + esc(f.en) + "</th>"; });
          if (tg.fixedRows) headCells = ['<th>Category</th>'].concat(headCells);
          block += (tg.title ? '<p class="olv-print-subtitle">' + esc(tg.title) + "</p>" : "") +
            '<table class="olv-print-table olv-print-rows"><thead><tr>' + headCells.join("") + "</tr></thead><tbody>" +
            trs.map(function (row) { return "<tr>" + row.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") +
            "</tbody></table>";
        }
      });
      if (!any) block += '<p class="olv-print-empty">— немає даних —</p>';
      html += '<div class="olv-print-section">' + block + "</div>";
    });
    return html;
  }

  function openPrintSummary() {
    var box = document.getElementById("olvPrintSummary");
    if (!box) return;
    box.innerHTML =
      '<div class="olv-print-toolbar"><button type="button" id="olvPrintNowBtn" class="btn">🖨 Друкувати</button>' +
      '<button type="button" id="olvPrintCloseBtn" class="btn btn-secondary">✕ Закрити</button></div>' +
      buildPrintSummaryHtml();
    box.hidden = false;
    box.classList.add("show");
    document.body.classList.add("olv-print-mode");
    box.querySelector("#olvPrintNowBtn").addEventListener("click", function () { window.print(); });
    box.querySelector("#olvPrintCloseBtn").addEventListener("click", closePrintSummary);
    if (box.scrollIntoView) box.scrollIntoView({ behavior: "auto", block: "start" });
  }

  function closePrintSummary() {
    var box = document.getElementById("olvPrintSummary");
    if (!box || box.hidden) return;
    box.hidden = true;
    box.classList.remove("show");
    document.body.classList.remove("olv-print-mode");
  }

  // ---- GPS-панель: визначення позиції + годинник UTC ---------------------
  var lastFix = null;

  function buildGpsPanelEl() {
    var div = document.createElement("div");
    div.className = "olv-gps-panel";
    div.innerHTML =
      '<div class="olv-gps-row">' +
      '<button type="button" id="olvGpsBtn" class="btn">📍 Визначити позицію (GPS)</button>' +
      '<span id="olvGpsStatus" class="olv-gps-status">Позицію ще не визначено</span>' +
      '<span class="olv-gps-clock">🕒 <span id="olvUtcClock">--:--:--</span> UTC</span>' +
      "</div>" +
      '<div class="olv-gps-manual-row">' +
      '<span class="olv-gps-manual-label">Або ввести вручну (десяткові градуси):</span>' +
      '<input type="number" id="olvGpsManualLat" step="any" min="-90" max="90" placeholder="широта, напр. -75.4363">' +
      '<input type="number" id="olvGpsManualLon" step="any" min="-180" max="180" placeholder="довгота, напр. -175.2201">' +
      '<button type="button" id="olvGpsManualBtn" class="btn btn-secondary">Застосувати</button>' +
      "</div>" +
      '<p class="olv-gps-hint">Кнопки <strong>📍</strong> біля координатних полів і <strong>🕒</strong> біля полів дати/часу підставлять туди щойно визначену позицію (у форматі шаблону — градуси + хвилини) і поточний час UTC. <strong>Автоматичне визначення позиції потребує інтернет-з’єднання</strong> — на більшості ноутбуків і планшетів немає окремого супутникового GPS-приймача, тож браузер визначає місце через мережевий сервіс геолокації (за Wi-Fi/мобільною мережею); без Wi-Fi/мережі або на судні без сигналу кнопка часто поверне помилку «позиція недоступна» — це обмеження браузера/ОС, а не сайту. У такому разі скористайтесь полем ручного вводу вище (координати з судового GPS-приймача чи іншого пристрою). Точна супутникова позиція без інтернету можлива лише на пристроях зі справжнім GPS/ГНСС-чипом (переважно телефони) після захоплення сигналу супутників. Годинник UTC — системний час пристрою.</p>';
    return div;
  }

  function updateGpsStatus(text, isError) {
    var s = document.getElementById("olvGpsStatus");
    if (!s) return;
    s.textContent = text;
    s.classList.toggle("olv-gps-status-err", !!isError);
  }

  function applyFix(pos, accNote) {
    lastFix = { lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy, ts: Date.now() };
    var dmLat = decimalToDegMin(lastFix.lat), dmLon = decimalToDegMin(lastFix.lon);
    updateGpsStatus(
      lastFix.lat.toFixed(5) + "°, " + lastFix.lon.toFixed(5) + "° (" +
      dmLat.deg + "° " + dmLat.min.toFixed(2) + "′ / " + dmLon.deg + "° " + dmLon.min.toFixed(2) + "′), " +
      "точність ±" + Math.round(lastFix.acc) + " м, о " + new Date(lastFix.ts).toLocaleTimeString("uk-UA") + (accNote || "")
    );
  }

  function geoErrorMessage(err) {
    if (!err) return "Не вдалося визначити позицію.";
    if (err.code === 1) return "Доступ до GPS заборонено — дозвольте геолокацію для цього сайту в налаштуваннях браузера (та в системних налаштуваннях служб локації).";
    if (err.code === 2) return "Позиція недоступна: браузер/ОС не змогли визначити місце (немає Wi-Fi поблизу для мережевої геолокації, немає GPS-чипа або немає сигналу супутників). Спробуйте: увімкнути Wi-Fi-адаптер (навіть без підключення до мережі), дозволити службу локації в ОС, або скористатись полем «Ввести вручну» нижче.";
    if (err.code === 3) return "Час очікування GPS вичерпано, спробуйте ще раз або скористайтесь полем «Ввести вручну» нижче.";
    return "Не вдалося визначити позицію.";
  }

  function requestGpsFix() {
    if (!navigator.geolocation) {
      updateGpsStatus("GPS не підтримується цим браузером/пристроєм. Скористайтесь полем «Ввести вручну» нижче.", true);
      return;
    }
    updateGpsStatus("Визначення позиції…");
    navigator.geolocation.getCurrentPosition(
      function (pos) { applyFix(pos); },
      function (firstErr) {
        // Перша спроба (висока точність, зазвичай GPS-чип) не вдалась — пробуємо
        // ще раз у режимі нижчої точності (мережева/IP-геолокація) перед тим, як
        // остаточно повідомити про помилку.
        navigator.geolocation.getCurrentPosition(
          function (pos) { applyFix(pos, " (орієнтовно, мережева геолокація)"); },
          function () { updateGpsStatus(geoErrorMessage(firstErr), true); },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }

  function applyManualFix() {
    var latEl = document.getElementById("olvGpsManualLat");
    var lonEl = document.getElementById("olvGpsManualLon");
    var lat = parseFloat(latEl && latEl.value);
    var lon = parseFloat(lonEl && lonEl.value);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      updateGpsStatus("Введіть коректні десяткові градуси: широта від -90 до 90, довгота від -180 до 180 (від'ємне = південь/захід).", true);
      return;
    }
    applyFix({ coords: { latitude: lat, longitude: lon, accuracy: 0 } }, " (введено вручну)");
  }

  function tickUtcClock() {
    var el = document.getElementById("olvUtcClock");
    if (!el) return;
    var now = new Date();
    el.textContent = pad2(now.getUTCHours()) + ":" + pad2(now.getUTCMinutes()) + ":" + pad2(now.getUTCSeconds());
  }

  function fillGpsInto(btn) {
    if (!lastFix) {
      updateGpsStatus("Спочатку натисніть «📍 Визначити позицію (GPS)» вгорі форми.", true);
      return;
    }
    var axis = btn.dataset.axis;
    var decimal = axis === "lat" ? lastFix.lat : lastFix.lon;
    var degEl = byName(btn.dataset.deg);
    if (btn.dataset.min) {
      var dm = decimalToDegMin(decimal);
      if (degEl) degEl.value = dm.deg;
      var minEl = byName(btn.dataset.min);
      if (minEl) minEl.value = dm.min.toFixed(2);
    } else if (degEl) {
      degEl.value = Math.round(decimal * 10000) / 10000;
    }
  }

  function fillNowInto(btn) {
    var el = byName(btn.dataset.target);
    if (!el) return;
    var now = new Date();
    if (btn.dataset.kind === "time") {
      el.value = pad2(now.getUTCHours()) + ":" + pad2(now.getUTCMinutes());
    } else {
      el.value = now.getUTCFullYear() + "-" + pad2(now.getUTCMonth() + 1) + "-" + pad2(now.getUTCDate()) + "T" + pad2(now.getUTCHours()) + ":" + pad2(now.getUTCMinutes());
    }
  }

  // ---- init -------------------------------------------------------------
  function init() {
    root = document.getElementById("olvFormRoot");
    if (!root) return;
    statusEl = document.getElementById("olvStatus");
    errorsBox = document.getElementById("olvErrors");
    progressEl = document.getElementById("olvProgress");
    root.appendChild(buildGpsPanelEl());
    renderAll(window.OLV_SCHEMA);
    buildProgressPanel(window.OLV_SCHEMA);
    restoreDraft();
    updateProgress();
    var gpsBtn = document.getElementById("olvGpsBtn");
    if (gpsBtn) gpsBtn.addEventListener("click", requestGpsFix);
    var gpsManualBtn = document.getElementById("olvGpsManualBtn");
    if (gpsManualBtn) gpsManualBtn.addEventListener("click", applyManualFix);
    tickUtcClock();
    setInterval(tickUtcClock, 1000);
    root.addEventListener("click", function (e) {
      var gpsFillBtn = e.target.closest(".olv-quick-gps");
      if (gpsFillBtn) { fillGpsInto(gpsFillBtn); saveDraftSoon(); updateProgress(); return; }
      var nowFillBtn = e.target.closest(".olv-quick-now");
      if (nowFillBtn) { fillNowInto(nowFillBtn); saveDraftSoon(); updateProgress(); }
    });
    root.addEventListener("input", function () { saveDraftSoon(); updateProgress(); });
    root.addEventListener("change", function () { saveDraftSoon(); updateProgress(); });
    root.addEventListener("blur", function (e) {
      if (e.target && e.target.classList && e.target.classList.contains("olv-input")) checkCodeWarn(e.target);
    }, true);
    var exportBtn = document.getElementById("olvExportBtn");
    if (exportBtn) exportBtn.addEventListener("click", doExport);
    var clearBtn = document.getElementById("olvClearBtn");
    if (clearBtn) clearBtn.addEventListener("click", clearDraft);
    var saveBtn = document.getElementById("olvSaveBtn");
    if (saveBtn) saveBtn.addEventListener("click", saveDraft);
    var exportDraftBtn = document.getElementById("olvExportDraftBtn");
    if (exportDraftBtn) exportDraftBtn.addEventListener("click", downloadDraftFile);
    var importFileInput = document.getElementById("olvImportFile");
    var importDraftBtn = document.getElementById("olvImportDraftBtn");
    if (importDraftBtn && importFileInput) {
      importDraftBtn.addEventListener("click", function () { importFileInput.click(); });
      importFileInput.addEventListener("change", function () {
        if (importFileInput.files && importFileInput.files[0]) importDraftFile(importFileInput.files[0]);
        importFileInput.value = "";
      });
    }
    var fillBtn = document.getElementById("olvFillBtn");
    if (fillBtn) fillBtn.addEventListener("click", fillExample);
    var printBtn = document.getElementById("olvPrintBtn");
    if (printBtn) printBtn.addEventListener("click", openPrintSummary);
  }

  // Тестовий/діагностичний доступ до внутрішнього движка експорту (не впливає
  // на звичайних користувачів — використовується лише в автоматизованих тестах).
  window.__olvExportDebug = {
    EXPORT_MAP: EXPORT_MAP,
    SHEET_XML_PATH: SHEET_XML_PATH,
    collectTemplateWrites: collectTemplateWrites,
    cellValueFor: cellValueFor,
    excelSerialUTC: excelSerialUTC,
    setCellInXml: setCellInXml,
    buildTemplateExportBlob: buildTemplateExportBlob,
    crossValidate: crossValidate,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
