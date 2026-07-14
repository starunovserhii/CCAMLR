// Service worker for offline access to the CCAMLR SISO prep site.
//
// Strategy:
// - App shell (all HTML pages + CSS/JS/manifest) is pre-cached on install so
//   the whole site works offline right after the first visit, even if the
//   person never opens every page individually.
// - Images and downloadable source documents (docs/*) are cached at runtime
//   as they're actually viewed/opened (they're too large — ~75MB combined —
//   to force-download on first visit, especially on a ship's slow connection).
// - HTML pages use "network first, fall back to cache" so content updates
//   are picked up automatically whenever online, while still working offline.
// - Everything else uses "cache first, fall back to network" for speed.
//
// Bump CACHE_VERSION whenever build_site.js output changes, so old caches
// are cleared and the new content is fetched.
const CACHE_VERSION = "ccamlr-siso-v3";

const APP_SHELL = [
  "index.html",
  "01-governing.html",
  "02-measures.html",
  "03-forms-main.html",
  "04-forms-instructions.html",
  "05-gear.html",
  "06-identification.html",
  "07-vme.html",
  "08-tagging.html",
  "11-templates.html",
  "12-species-cards.html",
  "13-library.html",
  "14-glossary.html",
  "15-flashcards.html",
  "16-checklist.html",
  "09-cheatsheet.html",
  "10-test.html",
  "css/style.css",
  "js/script.js",
  "js/search-index.js",
  "manifest.json"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(APP_SHELL);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_VERSION; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var isHtml = req.mode === "navigate" || (req.headers.get("accept") || "").indexOf("text/html") !== -1;

  if (isHtml) {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (cached) {
          return cached || caches.match("index.html");
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return cached;
      });
    })
  );
});
