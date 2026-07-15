// Mobile nav toggle
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.getElementById("navToggle");
  var sidebar = document.getElementById("sidebar");
  if (toggle && sidebar) {
    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
    document.querySelectorAll(".navlink").forEach(function (a) {
      a.addEventListener("click", function () { sidebar.classList.remove("open"); });
    });
  }

  // Homepage countdown to the nearest upcoming seminar/exam date
  var countdownEl = document.getElementById("examCountdown");
  if (countdownEl) {
    try {
      var dates = JSON.parse(countdownEl.getAttribute("data-dates"));
      var now = new Date();
      var upcoming = null;
      for (var i = 0; i < dates.length; i++) {
        var target = new Date(dates[i][0] + "T00:00:00");
        if (target >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
          upcoming = { date: target, label: dates[i][1] };
          break;
        }
      }
      if (upcoming) {
        var msPerDay = 24 * 60 * 60 * 1000;
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var daysLeft = Math.round((upcoming.date - today) / msPerDay);
        var dateStr = upcoming.date.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
        var text;
        if (daysLeft === 0) text = "Сьогодні день " + upcoming.label + "!";
        else if (daysLeft === 1) text = "Залишився 1 день до " + upcoming.label + " (" + dateStr + ")";
        else text = "Залишилось " + daysLeft + " дн. до " + upcoming.label + " (" + dateStr + ")";
        countdownEl.textContent = "⏳ " + text;
        countdownEl.style.display = "block";
      } else {
        countdownEl.style.display = "none";
      }
    } catch (e) { countdownEl.style.display = "none"; }
  }

  // Fixed countdown to the exam deadline (15.08.2026), always shown regardless
  // of which seminar/exam date is nearest — separate from examCountdown above.
  var examFixedEl = document.getElementById("examCountdownFixed");
  if (examFixedEl) {
    try {
      var targetStr = examFixedEl.getAttribute("data-target");
      var label = examFixedEl.getAttribute("data-label") || "події";
      var targetDate = new Date(targetStr + "T00:00:00");
      var nowF = new Date();
      var todayF = new Date(nowF.getFullYear(), nowF.getMonth(), nowF.getDate());
      var msPerDayF = 24 * 60 * 60 * 1000;
      var daysLeftF = Math.round((targetDate - todayF) / msPerDayF);
      var dateStrF = targetDate.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
      var textF;
      if (daysLeftF > 1) textF = "До " + label + " (" + dateStrF + ") залишилось " + daysLeftF + " дн.";
      else if (daysLeftF === 1) textF = "До " + label + " (" + dateStrF + ") залишився 1 день!";
      else if (daysLeftF === 0) textF = "Сьогодні день " + label + " (" + dateStrF + ")!";
      else textF = label + " (" + dateStrF + ") вже минув.";
      examFixedEl.textContent = "🎯 " + textF;
      examFixedEl.style.display = "block";
    } catch (e) { examFixedEl.style.display = "none"; }
  }

  // Dark theme toggle (persisted in localStorage; initial state already
  // applied pre-paint by the inline script in <head> to avoid a flash).
  var themeBtn = document.getElementById("themeToggle");
  function refreshThemeLabel() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (themeBtn) themeBtn.textContent = isDark ? "☀️ Світла тема" : "🌙 Темна тема";
  }
  if (themeBtn) {
    refreshThemeLabel();
    themeBtn.addEventListener("click", function () {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        try { localStorage.setItem("theme", "light"); } catch (e) {}
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        try { localStorage.setItem("theme", "dark"); } catch (e) {}
      }
      refreshThemeLabel();
    });
  }

  // Back-to-top floating button
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 500) backToTop.classList.add("visible");
      else backToTop.classList.remove("visible");
    });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Species card modal (lightbox with enlarged photo + full description)
  var speciesOverlay = document.getElementById("speciesModalOverlay");
  if (speciesOverlay) {
    var modalImgWrap = document.getElementById("speciesModalImgWrap");
    var modalCode = document.getElementById("speciesModalCode");
    var modalUa = document.getElementById("speciesModalUa");
    var modalLatin = document.getElementById("speciesModalLatin");
    var modalNote = document.getElementById("speciesModalNote");
    var modalClose = document.getElementById("speciesModalClose");
    var lastFocused = null;

    function openSpeciesModal(card) {
      var img = card.getAttribute("data-img");
      var icon = card.getAttribute("data-icon") || "🐟";
      var code = card.getAttribute("data-code");
      var ua = card.getAttribute("data-ua");
      var latin = card.getAttribute("data-latin");
      var note = card.getAttribute("data-note");

      if (img) {
        modalImgWrap.innerHTML = '<div class="species-modal-img"><img src="' + img + '" alt="' + ua.replace(/"/g, "") + '"></div>';
      } else {
        modalImgWrap.innerHTML = '<div class="species-modal-img species-modal-noimg">' + icon + '</div>';
      }
      if (code) {
        modalCode.textContent = code;
        modalCode.style.display = "inline-block";
      } else {
        modalCode.style.display = "none";
      }
      modalUa.textContent = ua || "";
      modalLatin.textContent = latin || "";
      modalNote.textContent = note || "";

      lastFocused = document.activeElement;
      speciesOverlay.classList.add("open");
      modalClose.focus();
    }

    function closeSpeciesModal() {
      speciesOverlay.classList.remove("open");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    document.querySelectorAll(".species-card").forEach(function (card) {
      card.addEventListener("click", function () { openSpeciesModal(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openSpeciesModal(card);
        }
      });
    });
    modalClose.addEventListener("click", closeSpeciesModal);
    speciesOverlay.addEventListener("click", function (e) {
      if (e.target === speciesOverlay) closeSpeciesModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && speciesOverlay.classList.contains("open")) closeSpeciesModal();
    });
  }

  // Site search (uses SEARCH_INDEX from js/search-index.js)
  var searchInput = document.getElementById("siteSearch");
  var searchResults = document.getElementById("searchResults");
  if (searchInput && searchResults && typeof SEARCH_INDEX !== "undefined") {
    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
    function snippet(text, query) {
      var idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) return escapeHtml(text.slice(0, 90)) + "…";
      var start = Math.max(0, idx - 40);
      var end = Math.min(text.length, idx + query.length + 60);
      var pre = (start > 0 ? "…" : "") + escapeHtml(text.slice(start, idx));
      var hit = escapeHtml(text.slice(idx, idx + query.length));
      var post = escapeHtml(text.slice(idx + query.length, end)) + (end < text.length ? "…" : "");
      return pre + "<mark>" + hit + "</mark>" + post;
    }
    function runSearch() {
      var q = searchInput.value.trim();
      if (q.length < 2) {
        searchResults.innerHTML = "";
        searchResults.classList.remove("open");
        return;
      }
      var ql = q.toLowerCase();
      var scored = [];
      for (var i = 0; i < SEARCH_INDEX.length; i++) {
        var entry = SEARCH_INDEX[i];
        var hLower = entry.heading.toLowerCase();
        var tLower = entry.text.toLowerCase();
        var score = 0;
        if (hLower.indexOf(ql) !== -1) score += 10;
        var pos = tLower.indexOf(ql);
        if (pos !== -1) score += 1;
        if (score > 0) scored.push({ entry: entry, score: score, pos: pos });
      }
      scored.sort(function (a, b) { return b.score - a.score; });
      scored = scored.slice(0, 12);
      if (scored.length === 0) {
        searchResults.innerHTML = '<div class="search-empty">Нічого не знайдено за запитом «' + escapeHtml(q) + '»</div>';
        searchResults.classList.add("open");
        return;
      }
      searchResults.innerHTML = scored.map(function (s) {
        var snip = s.pos !== -1 ? snippet(s.entry.text, q) : escapeHtml(s.entry.heading);
        return '<a class="search-result" href="' + s.entry.url + '">' +
          '<div class="search-result-page">' + escapeHtml(s.entry.page) + '</div>' +
          '<div class="search-result-heading">' + escapeHtml(s.entry.heading) + '</div>' +
          '<div class="search-result-snippet">' + snip + '</div>' +
          '</a>';
      }).join("");
      searchResults.classList.add("open");
    }
    searchInput.addEventListener("input", runSearch);
    searchInput.addEventListener("focus", function () {
      if (searchInput.value.trim().length >= 2) searchResults.classList.add("open");
    });
    document.addEventListener("click", function (e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove("open");
      }
    });
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        searchResults.classList.remove("open");
        searchInput.blur();
      }
    });
  }

  // Flashcards (only present on 15-flashcards.html)
  var flashDataEl = document.getElementById("flashData");
  if (flashDataEl) {
    var flashData = null;
    try { flashData = JSON.parse(flashDataEl.textContent); } catch (e) { flashData = null; }
    if (flashData) {
      var flashCardEl = document.getElementById("flashCard");
      var flashFrontEl = document.getElementById("flashFront");
      var flashBackEl = document.getElementById("flashBack");
      var flashProgressEl = document.getElementById("flashProgress");
      var flashTabs = document.querySelectorAll(".flash-tab");
      var flashHardTabEl = document.getElementById("flashHardTab");
      var flashHardToggleBtn = document.getElementById("flashHardToggle");
      var currentDeckKey = "terms";
      var currentDeck = flashData.terms.slice();
      var flashIdx = 0;
      var flashFlipped = false;

      var allFlashCards = flashData.terms.concat(flashData.codes);
      var FLASH_HARD_KEY = "ccamlr_flash_hard_v1";
      function loadHardSet() {
        try { return JSON.parse(localStorage.getItem(FLASH_HARD_KEY) || "{}"); } catch (e) { return {}; }
      }
      function saveHardSet(set) {
        try { localStorage.setItem(FLASH_HARD_KEY, JSON.stringify(set)); } catch (e) {}
      }
      var hardSet = loadHardSet();
      function hardCount() {
        var n = 0;
        for (var k in hardSet) { if (hardSet[k]) n++; }
        return n;
      }
      function updateHardTabLabel() {
        if (flashHardTabEl) flashHardTabEl.textContent = "★ Важкі (" + hardCount() + ")";
      }
      function deckForKey(key) {
        if (key === "hard") return allFlashCards.filter(function (c) { return hardSet[c.id]; }).slice();
        return flashData[key].slice();
      }

      function shuffleArray(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
        return arr;
      }

      function updateStarButton() {
        if (!flashHardToggleBtn) return;
        var card = currentDeck[flashIdx];
        if (!card) { flashHardToggleBtn.style.display = "none"; return; }
        flashHardToggleBtn.style.display = "";
        var isHard = !!hardSet[card.id];
        flashHardToggleBtn.classList.toggle("active", isHard);
        flashHardToggleBtn.textContent = isHard ? "★ Позначено важкою" : "☆ Позначити важкою";
      }

      function renderFlashcard() {
        if (currentDeck.length === 0) {
          flashFrontEl.innerHTML = currentDeckKey === "hard" ? "Немає позначених карток.<br><span class=\"flash-pron\">Натисніть ☆ на будь-якій картці, щоб додати її сюди.</span>" : "";
          flashBackEl.innerHTML = "";
          flashFrontEl.style.display = "block";
          flashBackEl.style.display = "none";
          flashProgressEl.textContent = "0 / 0";
          if (flashHardToggleBtn) flashHardToggleBtn.style.display = "none";
          return;
        }
        var card = currentDeck[flashIdx];
        flashFrontEl.innerHTML = card.front;
        flashBackEl.innerHTML = card.back;
        flashFrontEl.style.display = flashFlipped ? "none" : "block";
        flashBackEl.style.display = flashFlipped ? "block" : "none";
        flashProgressEl.textContent = (flashIdx + 1) + " / " + currentDeck.length;
        updateStarButton();
      }

      function goTo(delta) {
        if (currentDeck.length === 0) return;
        flashIdx = (flashIdx + delta + currentDeck.length) % currentDeck.length;
        flashFlipped = false;
        renderFlashcard();
      }

      flashCardEl.addEventListener("click", function () {
        flashFlipped = !flashFlipped;
        renderFlashcard();
      });
      flashCardEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          flashFlipped = !flashFlipped;
          renderFlashcard();
        }
      });
      var flashFlipBtn = document.getElementById("flashFlip");
      if (flashFlipBtn) flashFlipBtn.addEventListener("click", function () { flashFlipped = !flashFlipped; renderFlashcard(); });
      var flashNextBtn = document.getElementById("flashNext");
      if (flashNextBtn) flashNextBtn.addEventListener("click", function () { goTo(1); });
      var flashPrevBtn = document.getElementById("flashPrev");
      if (flashPrevBtn) flashPrevBtn.addEventListener("click", function () { goTo(-1); });
      var flashShuffleBtn = document.getElementById("flashShuffle");
      if (flashShuffleBtn) flashShuffleBtn.addEventListener("click", function () {
        shuffleArray(currentDeck);
        flashIdx = 0; flashFlipped = false;
        renderFlashcard();
      });
      var flashRestartBtn = document.getElementById("flashRestart");
      if (flashRestartBtn) flashRestartBtn.addEventListener("click", function () {
        currentDeck = deckForKey(currentDeckKey);
        flashIdx = 0; flashFlipped = false;
        renderFlashcard();
      });
      if (flashHardToggleBtn) flashHardToggleBtn.addEventListener("click", function () {
        var card = currentDeck[flashIdx];
        if (!card) return;
        if (hardSet[card.id]) { delete hardSet[card.id]; } else { hardSet[card.id] = true; }
        saveHardSet(hardSet);
        updateHardTabLabel();
        if (currentDeckKey === "hard" && !hardSet[card.id]) {
          // card just unmarked while viewing the hard deck — remove it from the active deck
          currentDeck.splice(flashIdx, 1);
          if (flashIdx >= currentDeck.length) flashIdx = 0;
          flashFlipped = false;
        }
        renderFlashcard();
      });
      flashTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          flashTabs.forEach(function (t) { t.classList.remove("active"); });
          tab.classList.add("active");
          currentDeckKey = tab.getAttribute("data-deck");
          currentDeck = deckForKey(currentDeckKey);
          flashIdx = 0; flashFlipped = false;
          renderFlashcard();
        });
      });
      updateHardTabLabel();
      renderFlashcard();
    }
  }

  // Pre-trip checklist (only present on 16-checklist.html), persisted in localStorage
  var checklistApp = document.getElementById("checklistApp");
  if (checklistApp) {
    var CHECKLIST_KEY = "ccamlr_checklist_v1";
    var checkboxes = document.querySelectorAll(".checklist-check");
    var fillEl = document.getElementById("checklistFill");
    var textEl = document.getElementById("checklistProgressText");

    function loadChecklist() {
      try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "{}"); } catch (e) { return {}; }
    }
    function saveChecklist(state) {
      try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state)); } catch (e) {}
    }
    function updateProgress() {
      var total = checkboxes.length;
      var done = 0;
      checkboxes.forEach(function (cb) { if (cb.checked) done++; });
      var pct = total ? Math.round((done / total) * 100) : 0;
      fillEl.style.width = pct + "%";
      textEl.textContent = done + " / " + total + " виконано (" + pct + "%)";
    }

    var state = loadChecklist();
    checkboxes.forEach(function (cb) {
      var id = cb.getAttribute("data-id");
      if (state[id]) {
        cb.checked = true;
        cb.closest(".checklist-item").classList.add("checked");
      }
      cb.addEventListener("change", function () {
        var s = loadChecklist();
        s[id] = cb.checked;
        saveChecklist(s);
        cb.closest(".checklist-item").classList.toggle("checked", cb.checked);
        updateProgress();
      });
    });
    updateProgress();

    var resetBtn = document.getElementById("checklistReset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        saveChecklist({});
        checkboxes.forEach(function (cb) {
          cb.checked = false;
          cb.closest(".checklist-item").classList.remove("checked");
        });
        updateProgress();
      });
    }
  }

  // Print / save-as-PDF button (only present on 09-cheatsheet.html)
  var cheatsheetPrintBtn = document.getElementById("cheatsheetPrint");
  if (cheatsheetPrintBtn) {
    cheatsheetPrintBtn.addEventListener("click", function () { window.print(); });
  }

  // Lecture accordion toggles (only present on 19-internship.html)
  document.querySelectorAll(".lecture-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-target");
      var row = document.getElementById(targetId);
      if (!row) return;
      var isOpen = row.classList.toggle("open");
      btn.textContent = isOpen ? "▲ Сховати" : "▼ Лекція";
    });
  });

  // Quiz logic (only present on 10-test.html)
  var form = document.getElementById("quizForm");
  if (!form) return;

  var QUIZ_KEY = "ccamlr_quiz_last_result";

  function loadQuizHistory() {
    try { return JSON.parse(localStorage.getItem(QUIZ_KEY) || "null"); } catch (e) { return null; }
  }
  function saveQuizHistory(data) {
    try { localStorage.setItem(QUIZ_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function isVisible(el) { return el.style.display !== "none"; }

  function gradeQuiz() {
    if (examTimerHandle) stopExamTimer(false);
    var qs = Array.prototype.filter.call(document.querySelectorAll(".quiz-q"), isVisible);
    var total = qs.length;
    var correctCount = 0;
    var unanswered = 0;
    var wrongNums = [];
    var catStats = [];
    document.querySelectorAll("#quizForm > section.card").forEach(function (sec) {
      var secQs = Array.prototype.filter.call(sec.querySelectorAll(".quiz-q"), isVisible);
      if (secQs.length === 0) return;
      var catName = sec.querySelector("h2") ? sec.querySelector("h2").textContent : "";
      var catCorrect = 0;
      secQs.forEach(function (qEl) {
        var qnum = qEl.getAttribute("data-qnum");
        var correct = qEl.getAttribute("data-correct");
        var selected = form.querySelector('input[name="q' + qnum + '"]:checked');
        var feedback = qEl.querySelector(".quiz-feedback");
        qEl.classList.remove("correct", "incorrect");
        if (!selected) {
          unanswered++;
          wrongNums.push(qnum);
          feedback.textContent = "Питання без відповіді.";
          feedback.className = "quiz-feedback";
          return;
        }
        if (selected.value === correct) {
          correctCount++; catCorrect++;
          qEl.classList.add("correct");
          feedback.textContent = "✓ Правильно";
          feedback.className = "quiz-feedback ok";
        } else {
          qEl.classList.add("incorrect");
          wrongNums.push(qnum);
          var correctLabel = String.fromCharCode(65 + parseInt(correct, 10));
          feedback.textContent = "✗ Неправильно. Правильна відповідь: " + correctLabel;
          feedback.className = "quiz-feedback bad";
        }
      });
      catStats.push({ name: catName, correct: catCorrect, total: secQs.length });
    });
    var pct = total ? Math.round((correctCount / total) * 100) : 0;
    var msg = "Результат: " + correctCount + " / " + total + " (" + pct + "%)" +
      (unanswered ? " — не відповіли на " + unanswered + " питань" : "");
    document.getElementById("quizScore").textContent = msg;
    document.getElementById("quizScore2").textContent = msg;
    renderCategoryBreakdown(catStats);

    saveQuizHistory({ correct: correctCount, total: total, wrong: wrongNums, date: new Date().toISOString() });
    updateLastResultBanner();
    updateReviewButtons(wrongNums);
  }

  function renderCategoryBreakdown(catStats) {
    var box = document.getElementById("quizCategoryBreakdown");
    if (!box) return;
    if (!catStats || !catStats.length) { box.style.display = "none"; box.innerHTML = ""; return; }
    var rows = catStats.map(function (c) {
      var p = c.total ? Math.round((c.correct / c.total) * 100) : 0;
      var color = p >= 80 ? "var(--ok)" : (p >= 50 ? "var(--accent2)" : "var(--bad)");
      return "<tr><td>" + c.name + "</td><td>" + c.correct + " / " + c.total + "</td><td style=\"color:" + color + ";font-weight:600;\">" + p + "%</td></tr>";
    }).join("");
    box.innerHTML = "<h3>Підсумок за розділами</h3><div class=\"table-wrap\"><table><thead><tr><th>Розділ</th><th>Правильно</th><th>%</th></tr></thead><tbody>" + rows + "</tbody></table></div>";
    box.style.display = "block";
  }

  function updateLastResultBanner() {
    var banner = document.getElementById("quizLastResult");
    var hist = loadQuizHistory();
    if (!banner || !hist) return;
    var d = new Date(hist.date);
    var dateStr = d.toLocaleDateString("uk-UA") + " " + d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
    var pct = Math.round((hist.correct / hist.total) * 100);
    banner.textContent = "Останній результат: " + hist.correct + " / " + hist.total + " (" + pct + "%), пройдено " + dateStr;
    banner.style.display = "block";
  }

  function updateReviewButtons(wrongNums) {
    var reviewBtn = document.getElementById("quizReviewMistakes");
    var showAllBtn = document.getElementById("quizShowAll");
    if (!reviewBtn) return;
    if (wrongNums && wrongNums.length > 0) {
      reviewBtn.style.display = "inline-block";
      reviewBtn.textContent = "Повторити лише помилки (" + wrongNums.length + ")";
    } else {
      reviewBtn.style.display = "none";
    }
    showAllBtn.style.display = "none";
  }

  function filterToQuestions(nums) {
    var numSet = nums ? new Set(nums) : null;
    document.querySelectorAll(".quiz-q").forEach(function (qEl) {
      var qnum = qEl.getAttribute("data-qnum");
      var show = !numSet || numSet.has(qnum);
      qEl.style.display = show ? "" : "none";
    });
    // hide whole section cards if every question inside is hidden
    document.querySelectorAll("#quizForm > section.card").forEach(function (sec) {
      var visible = Array.prototype.some.call(sec.querySelectorAll(".quiz-q"), function (q) { return q.style.display !== "none"; });
      sec.style.display = visible ? "" : "none";
    });
  }

  // Exam mode: random subset of questions + countdown timer
  var examTimerHandle = null;
  var examSecondsLeft = 0;
  var allQuizNums = Array.prototype.map.call(document.querySelectorAll(".quiz-q"), function (qEl) { return qEl.getAttribute("data-qnum"); });

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function tickExamTimer() {
    examSecondsLeft--;
    var timerEl = document.getElementById("examTimer");
    if (timerEl) {
      timerEl.textContent = formatTime(Math.max(0, examSecondsLeft));
      timerEl.classList.toggle("low", examSecondsLeft <= 120);
    }
    if (examSecondsLeft <= 0) {
      stopExamTimer(true);
      gradeQuiz();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function stopExamTimer(timeUp) {
    if (examTimerHandle) { clearInterval(examTimerHandle); examTimerHandle = null; }
    var setupEl = document.getElementById("examSetup");
    var activeEl = document.getElementById("examActive");
    if (setupEl) setupEl.style.display = "flex";
    if (activeEl) activeEl.style.display = "none";
  }

  function startExam() {
    var count = parseInt(document.getElementById("examCount").value, 10);
    var minutes = parseInt(document.getElementById("examMinutes").value, 10);
    var pool = allQuizNums.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var chosen = pool.slice(0, Math.min(count, pool.length));
    form.reset();
    document.querySelectorAll(".quiz-q").forEach(function (qEl) {
      qEl.classList.remove("correct", "incorrect");
      qEl.querySelector(".quiz-feedback").textContent = "";
    });
    document.getElementById("quizScore").textContent = "";
    document.getElementById("quizScore2").textContent = "";
    var breakdownBox = document.getElementById("quizCategoryBreakdown");
    if (breakdownBox) { breakdownBox.style.display = "none"; breakdownBox.innerHTML = ""; }
    filterToQuestions(chosen);
    document.getElementById("quizReviewMistakes").style.display = "none";
    document.getElementById("quizShowAll").style.display = "none";

    examSecondsLeft = minutes * 60;
    document.getElementById("examSetup").style.display = "none";
    document.getElementById("examActive").style.display = "flex";
    var timerEl = document.getElementById("examTimer");
    if (timerEl) { timerEl.textContent = formatTime(examSecondsLeft); timerEl.classList.remove("low"); }
    examTimerHandle = setInterval(tickExamTimer, 1000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  var examStartBtn = document.getElementById("examStart");
  if (examStartBtn) examStartBtn.addEventListener("click", function (e) { e.preventDefault(); startExam(); });
  var examStopBtn = document.getElementById("examStop");
  if (examStopBtn) examStopBtn.addEventListener("click", function (e) {
    e.preventDefault();
    stopExamTimer(false);
    gradeQuiz();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("quizSubmit").addEventListener("click", function (e) {
    e.preventDefault();
    gradeQuiz();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("quizSubmit2").addEventListener("click", function (e) {
    e.preventDefault();
    gradeQuiz();
  });
  document.getElementById("quizReset").addEventListener("click", function (e) {
    e.preventDefault();
    stopExamTimer(false);
    form.reset();
    document.querySelectorAll(".quiz-q").forEach(function (qEl) {
      qEl.classList.remove("correct", "incorrect");
      qEl.querySelector(".quiz-feedback").textContent = "";
    });
    document.getElementById("quizScore").textContent = "";
    document.getElementById("quizScore2").textContent = "";
    var breakdownBox2 = document.getElementById("quizCategoryBreakdown");
    if (breakdownBox2) { breakdownBox2.style.display = "none"; breakdownBox2.innerHTML = ""; }
    filterToQuestions(null);
    document.getElementById("quizShowAll").style.display = "none";
    var hist = loadQuizHistory();
    updateReviewButtons(hist ? hist.wrong : null);
  });
  document.getElementById("quizReviewMistakes").addEventListener("click", function (e) {
    e.preventDefault();
    var hist = loadQuizHistory();
    if (!hist || !hist.wrong || !hist.wrong.length) return;
    filterToQuestions(hist.wrong);
    document.getElementById("quizReviewMistakes").style.display = "none";
    document.getElementById("quizShowAll").style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("quizShowAll").addEventListener("click", function (e) {
    e.preventDefault();
    filterToQuestions(null);
    document.getElementById("quizShowAll").style.display = "none";
    var hist = loadQuizHistory();
    updateReviewButtons(hist ? hist.wrong : null);
  });

  // Restore last-result banner and review-mistakes availability on page load
  (function initQuizFromHistory() {
    var hist = loadQuizHistory();
    if (hist) {
      updateLastResultBanner();
      updateReviewButtons(hist.wrong);
    }
  })();
});
