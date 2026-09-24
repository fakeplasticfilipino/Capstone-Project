// =============================================================
// MACARIO — sw.js (Block 62)
//
// The service worker. It keeps every file the game has loaded on the
// phone, so the second visit downloads nothing it already has, a
// classroom on a bad connection opens the game from what is stored,
// and a picture that loaded once can never come back as a dashed box.
//
// Two rules, and they are the whole design:
//
//   A file asked for with a version (?v=N, which is every script,
//   stylesheet, picture and sound, through assetUrl and index.html's
//   own tags) never changes under that URL. It is served from the
//   cache when it is there, and fetched and stored when it is not.
//   A new version is a new URL, so a push can never be hidden behind
//   a stored copy, and the older copy of the same file is deleted
//   when the new one is stored, so the cache does not grow with every
//   push.
//
//   Anything else from this site, the pages themselves above all, is
//   asked of the network first and served from the cache only when
//   the network fails. index.html has no version of its own, and a
//   phone that kept an old copy kept asking for old files
//   (TRACKER.md, Known problems): network first is what fixes that.
//
// Nothing from another origin is touched: Supabase (logins, saves,
// tests) always goes straight to the network, as it did before.
//
// Registered by js/game.js on https only, so the harness on localhost
// never meets it unless a check asks for it.
//
// If this file ever has to be switched off on the live site, replace
// its body with the three lines at the bottom of this comment and push:
// every phone that has it will remove it on its next visit.
//
//   self.addEventListener("install", () => self.skipWaiting());
//   self.addEventListener("activate", () => self.registration.unregister()
//     .then(() => self.clients.matchAll()).then((cs) => cs.forEach((c) => c.navigate(c.url))));
// =============================================================

const CACHE = "macario-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isVersioned(url) {
  return url.searchParams.has("v");
}

// The same file under an older ?v= is dead weight once the new one is
// stored. Compared by path, so street-01.jpg?v=24 replaces ?v=23.
async function dropOlderVersions(cache, url) {
  const keys = await cache.keys();
  await Promise.all(keys.map((req) => {
    const old = new URL(req.url);
    if (old.pathname === url.pathname && old.search !== url.search) return cache.delete(req);
    return null;
  }));
}

async function cacheFirst(request, url) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  // Only a whole, successful answer is kept. A 404 (art the artist still
  // owes) or a partial answer (an audio range request) is passed on and
  // forgotten, so it is asked for again next time.
  if (response.ok && response.status === 200) {
    const copy = response.clone();
    cache.put(request, copy).then(() => dropOlderVersions(cache, url)).catch(() => {});
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch (err) {
    const hit = await cache.match(request, { ignoreSearch: request.mode === "navigate" });
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Audio is streamed with range requests, which the cache cannot answer
  // piecewise. The browser's own media cache handles those.
  if (request.headers.has("range")) return;

  event.respondWith(isVersioned(url) ? cacheFirst(request, url) : networkFirst(request));
});
