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
  function closeTooltip() { if (openTooltip) { openTooltip.classList.remove("show"); openTooltip = null; } }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".olv-info-btn");
    if (btn) {
      e.preventDefault();
      var tip = btn.nextElementSibling;
      var wasOpen = tip === openTooltip;
      closeTooltip();
      if (!wasOpen) { tip.classList.add("show"); openTooltip = tip; }
      return;
    }
    if (openTooltip && !e.target.closest(".olv-tooltip")) closeTooltip();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeTooltip(); });

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

  // ---- single/mixed group rendering (label grid) ------------------------
  function renderGroupField(f, sectionId) {
    var name = sectionId + "::" + f.k;
    return (
      '<div class="olv-field">' +
      '<label class="olv-label" for="' + esc(name) + '">' + esc(f.en) + (f.req ? '<span class="olv-req">*</span>' : "") + infoButtonHtml(f) + "</label>" +
      renderControl(f, name, name) +
      '<div class="olv-error" data-error-for="' + esc(name) + '"></div>' +
      "</div>"
    );
  }

  function renderGroups(groups, sectionId) {
    return groups.map(function (g) {
      return (
        '<div class="olv-group">' +
        '<h3 class="olv-group-title">' + esc(g.en) + '<span class="olv-group-title-ua"> — ' + esc(g.ua || "") + "</span></h3>" +
        '<div class="olv-grid">' + g.fields.map(function (f) { return renderGroupField(f, sectionId); }).join("") + "</div>" +
        "</div>"
      );
    }).join("");
  }

  // ---- repeatable table rendering ---------------------------------------
  function tableHeaderRow(fields) {
    return "<tr>" + fields.map(function (f) {
      return "<th>" + esc(f.en) + (f.req ? '<span class="olv-req">*</span>' : "") + infoButtonHtml(f) + "</th>";
    }).join("") + '<th class="olv-col-del"></th></tr>';
  }

  function buildRow(fields, tablePrefix, rowIndex) {
    var tr = document.createElement("tr");
    tr.dataset.row = String(rowIndex);
    tr.innerHTML = fields.map(function (f) {
      var name = tablePrefix + "::" + rowIndex + "::" + f.k;
      return '<td data-label="' + esc(f.en) + '">' + renderControl(f, name) + '<div class="olv-error" data-error-for="' + esc(name) + '"></div></td>';
    }).join("") + '<td class="olv-col-del"><button type="button" class="olv-del-row" title="Видалити рядок" aria-label="Видалити рядок">✕</button></td>';
    return tr;
  }

  function wireTable(tableEl, fields, tablePrefix) {
    var tbody = tableEl.querySelector("tbody");
    var counter = { n: 0 };
    tableEl._addRow = function (values) {
      var tr = buildRow(fields, tablePrefix, counter.n++);
      tbody.appendChild(tr);
      if (values) setRowValues(tr, values);
      return tr;
    };
    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest(".olv-del-row");
      if (!btn) return;
      var tr = btn.closest("tr");
      if (tbody.children.length <= 1) { tr.querySelectorAll("input,select,textarea").forEach(function (el) { el.value = ""; }); return; }
      tr.remove();
      saveDraftSoon();
    });
  }

  function setRowValues(tr, values) {
    Object.keys(values).forEach(function (k) {
      var el = tr.querySelector('[data-key="' + k + '"]');
      if (el) el.value = values[k];
    });
  }

  // ---- section renderers --------------------------------------------------
  function sectionHeaderHtml(sec) {
    return "<h2>" + esc(sec.num) + ". " + esc(sec.en) + '<span class="olv-section-ua"> — ' + esc(sec.ua) + "</span></h2>" +
      (sec.note ? '<p class="olv-note">' + esc(sec.note) + "</p>" : "");
  }

  function renderSectionSingle(sec) {
    var el = document.createElement("section");
    el.className = "card olv-section";
    el.id = "olv-" + sec.id;
    el.innerHTML = sectionHeaderHtml(sec) + renderGroups(sec.groups, sec.id);
    return el;
  }

  function makeTableBlock(titleEn, titleUa, fields, tablePrefix, tkeyAttr) {
    var wrap = document.createElement("div");
    wrap.innerHTML =
      (titleEn ? '<h3 class="olv-group-title">' + esc(titleEn) + '<span class="olv-group-title-ua"> — ' + esc(titleUa) + "</span></h3>" : "") +
      '<div class="olv-table-wrap"><table class="olv-table"' + (tkeyAttr ? ' data-tkey="' + esc(tkeyAttr) + '"' : "") + "><thead>" + tableHeaderRow(fields) + "</thead><tbody></tbody></table></div>" +
      '<button type="button" class="btn olv-add-row">+ Додати рядок (' + esc(titleEn || "") + ")</button>";
    var table = wrap.querySelector("table");
    wireTable(table, fields, tablePrefix);
    wrap.querySelector(".olv-add-row").addEventListener("click", function () { table._addRow(); saveDraftSoon(); });
    table._addRow();
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
    el.appendChild(makeTableBlock(sec.table.titleEn, sec.table.titleUa, sec.table.fields, sec.id + "::t"));
    return el;
  }

  function renderSectionMultitable(sec) {
    var el = document.createElement("section");
    el.className = "card olv-section";
    el.id = "olv-" + sec.id;
    el.innerHTML = sectionHeaderHtml(sec);
    sec.tables.forEach(function (t) {
      el.appendChild(makeTableBlock(t.titleEn, t.titleUa, t.fields, sec.id + "::" + t.key, t.key));
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

  function showProblems(problems) {
    if (!problems.length) { errorsBox.style.display = "none"; errorsBox.innerHTML = ""; return; }
    errorsBox.style.display = "block";
    errorsBox.innerHTML = "<strong>Перед експортом виправте " + problems.length + " " + (problems.length === 1 ? "помилку" : "помилки(ок)") + ":</strong><ul>" +
      problems.slice(0, 40).map(function (p) { return '<li><a href="#" data-focus="' + esc(p.name) + '">' + esc(p.msg) + "</a></li>"; }).join("") + "</ul>";
    errorsBox.querySelectorAll("a[data-focus]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var el = byName(a.getAttribute("data-focus"));
        if (el) { if (el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); }
      });
    });
    if (errorsBox.scrollIntoView) errorsBox.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---- collect / restore data ----------------------------------------------
  function collectRaw() {
    var out = {};
    root.querySelectorAll(".olv-input").forEach(function (el) { if (el.value !== "") out[el.name] = el.value; });
    return out;
  }

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), data: collectRaw() }));
      if (statusEl) statusEl.textContent = "Чернетку збережено — " + new Date().toLocaleTimeString("uk-UA");
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
  }

  function clearDraft() {
    if (!confirm("Очистити всю форму та видалити збережену чернетку? Цю дію не можна скасувати.")) return;
    localStorage.removeItem(DRAFT_KEY);
    root.innerHTML = "";
    renderAll(window.OLV_SCHEMA);
    if (statusEl) statusEl.textContent = "Форму очищено.";
    errorsBox.style.display = "none";
    errorsBox.innerHTML = "";
  }

  // ---- export to xlsx -------------------------------------------------------
  function sectionSingleAoa(groups, sectionId) {
    var rows = [];
    groups.forEach(function (g) {
      rows.push([g.en]);
      g.fields.forEach(function (f) {
        var el = byName(sectionId + "::" + f.k);
        rows.push([f.en, el ? el.value : ""]);
      });
      rows.push([]);
    });
    return rows;
  }

  function tableAoa(fields, tablePrefix) {
    var rows = [fields.map(function (f) { return f.en; })];
    root.querySelectorAll("tbody tr").forEach(function (tr) {
      var sample = tr.querySelector("[name]");
      if (!sample || sample.name.indexOf(tablePrefix + "::") !== 0) return;
      var rowVals = fields.map(function (f) {
        var el = tr.querySelector('[data-key="' + f.k + '"]');
        return el ? el.value : "";
      });
      if (rowVals.some(function (v) { return v !== ""; })) rows.push(rowVals);
    });
    return rows;
  }

  function buildWorkbook(schema) {
    var wb = XLSX.utils.book_new();
    schema.sections.forEach(function (sec) {
      var aoa;
      if (sec.kind === "single") {
        aoa = sectionSingleAoa(sec.groups, sec.id);
      } else if (sec.kind === "table") {
        aoa = tableAoa(sec.fields, sec.id);
      } else if (sec.kind === "mixed") {
        aoa = sectionSingleAoa(sec.groups, sec.id).concat([[sec.table.titleEn]], tableAoa(sec.table.fields, sec.id + "::t"));
      } else {
        aoa = [];
        sec.tables.forEach(function (t) {
          aoa = aoa.concat([[t.titleEn]], tableAoa(t.fields, sec.id + "::" + t.key), [[]]);
        });
      }
      var ws = XLSX.utils.aoa_to_sheet(aoa);
      var sheetName = (sec.num + ". " + sec.en).slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    return wb;
  }

  function doExport() {
    var problems = validateAll();
    showProblems(problems);
    if (problems.length) return;
    if (typeof XLSX === "undefined") {
      alert("Бібліотеку експорту ще не завантажено (потрібне інтернет-з’єднання під час першого відкриття сторінки). Перевірте з’єднання і спробуйте ще раз.");
      return;
    }
    var wb = buildWorkbook(window.OLV_SCHEMA);
    var vnameEl = byName("vessel::vname");
    var vname = vnameEl && vnameEl.value ? vnameEl.value.trim().replace(/[^a-zA-Z0-9]+/g, "_") : "vessel";
    var today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, "OLv2026a_" + vname + "_" + today + ".xlsx");
    if (statusEl) statusEl.textContent = "Файл експортовано — " + new Date().toLocaleTimeString("uk-UA");
  }

  // ---- init -------------------------------------------------------------
  function init() {
    root = document.getElementById("olvFormRoot");
    if (!root) return;
    statusEl = document.getElementById("olvStatus");
    errorsBox = document.getElementById("olvErrors");
    renderAll(window.OLV_SCHEMA);
    restoreDraft();
    root.addEventListener("input", saveDraftSoon);
    root.addEventListener("change", saveDraftSoon);
    var exportBtn = document.getElementById("olvExportBtn");
    if (exportBtn) exportBtn.addEventListener("click", doExport);
    var clearBtn = document.getElementById("olvClearBtn");
    if (clearBtn) clearBtn.addEventListener("click", clearDraft);
    var saveBtn = document.getElementById("olvSaveBtn");
    if (saveBtn) saveBtn.addEventListener("click", saveDraft);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
