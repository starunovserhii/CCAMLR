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

  // Quiz logic (only present on 10-test.html)
  var form = document.getElementById("quizForm");
  if (!form) return;

  function gradeQuiz() {
    var qs = document.querySelectorAll(".quiz-q");
    var total = qs.length;
    var correctCount = 0;
    var unanswered = 0;
    qs.forEach(function (qEl) {
      var qnum = qEl.getAttribute("data-qnum");
      var correct = qEl.getAttribute("data-correct");
      var selected = form.querySelector('input[name="q' + qnum + '"]:checked');
      var feedback = qEl.querySelector(".quiz-feedback");
      qEl.classList.remove("correct", "incorrect");
      if (!selected) {
        unanswered++;
        feedback.textContent = "Питання без відповіді.";
        feedback.className = "quiz-feedback";
        return;
      }
      if (selected.value === correct) {
        correctCount++;
        qEl.classList.add("correct");
        feedback.textContent = "✓ Правильно";
        feedback.className = "quiz-feedback ok";
      } else {
        qEl.classList.add("incorrect");
        var correctLabel = String.fromCharCode(65 + parseInt(correct, 10));
        feedback.textContent = "✗ Неправильно. Правильна відповідь: " + correctLabel;
        feedback.className = "quiz-feedback bad";
      }
    });
    var pct = Math.round((correctCount / total) * 100);
    var msg = "Результат: " + correctCount + " / " + total + " (" + pct + "%)" +
      (unanswered ? " — не відповіли на " + unanswered + " питань" : "");
    document.getElementById("quizScore").textContent = msg;
    document.getElementById("quizScore2").textContent = msg;
  }

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
    form.reset();
    document.querySelectorAll(".quiz-q").forEach(function (qEl) {
      qEl.classList.remove("correct", "incorrect");
      qEl.querySelector(".quiz-feedback").textContent = "";
    });
    document.getElementById("quizScore").textContent = "";
    document.getElementById("quizScore2").textContent = "";
  });
});
