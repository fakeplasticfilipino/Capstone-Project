// =============================================================
// MACARIO — sw.js (Block 62, Block 105)
//
// The service worker. It keeps every file the game has loaded on the
// phone, so the second visit downloads nothing it already has, a
// classroom on a bad connection opens the game from what is stored,
// and a picture that loaded once can never come back as a dashed box.
//
// Since Block 105 the page also hands it the whole game once (js/game.js,
// keepGameOffline: every script, the stylesheet, the fonts, and every
// picture and sound in the asset manifest), by asking for each file it
// does not have yet. Those requests come through here like any other and
// are kept by the same two rules, so one complete visit on a good
// connection leaves the entire game on the phone, ready for a room with
// no internet. Nothing new is needed here for that.
//
// Three rules, and they are the whole design:
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
//   asked of the network first. index.html has no version of its own,
//   and a phone that kept an old copy kept asking for old files
//   (TRACKER.md, Known problems): network first is what fixes that.
//   Since Block 105 the network gets NETWORK_WAIT_MS to answer and the
//   stored copy is served after that, the network's answer still
//   stored for next time when it comes. A connection that is up but
//   crawling used to hold the page for as long as the browser cared to
//   wait, which is longer than a room of students will.
//
//   A request for part of a file (Range, which is how the browser plays
//   music and sounds) is answered from the stored whole file when there
//   is one, cut to the part asked for (Block 105). Before, every one
//   went to the network, so the music was never kept.
//
// Nothing from another origin is touched: Supabase (logins, saves,
// tests) always goes straight to the network, as it did before. Since
// Block 105 the Supabase library itself is a file of this site
// (js/vendor/supabase.js), so it is kept like the rest.
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

// Named in js/game.js too (OFFLINE_CACHE), which reads it to count what
// is kept. Changing it empties every phone.
const CACHE = "macario-v1";

const NETWORK_WAIT_MS = 3000;

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
  // owes) or a partial answer is passed on and forgotten, so it is asked
  // for again next time.
  if (response.ok && response.status === 200) {
    const copy = response.clone();
    // Awaited, so that a page counting what is kept (keepGameOffline)
    // finds the file there the moment its request has finished.
    await cache.put(request, copy).then(() => dropOlderVersions(cache, url)).catch(() => {});
  }
  return response;
}

// The page under any of its names: a navigation to the folder finds a
// copy stored as index.html, and the other way round.
async function storedPage(cache, request) {
  const opts = { ignoreSearch: request.mode === "navigate" };
  const hit = await cache.match(request, opts);
  if (hit || request.mode !== "navigate") return hit;
  const scope = self.registration.scope;
  return (await cache.match(scope, opts)) || cache.match(new URL("index.html", scope).href, opts);
}

async function networkFirst(event) {
  const request = event.request;
  const cache = await caches.open(CACHE);
  const fromNetwork = fetch(request).then(async (response) => {
    if (response.ok && response.status === 200) await cache.put(request, response.clone()).catch(() => {});
    return response;
  });
  // The network's answer is still wanted when the stored copy wins the
  // race, to be kept for next time; this keeps the worker alive for it.
  event.waitUntil(fromNetwork.catch(() => {}));
  const late = new Promise((resolve) => setTimeout(resolve, NETWORK_WAIT_MS))
    .then(async () => (await storedPage(cache, request)) || fromNetwork);
  try {
    return await Promise.race([fromNetwork, late]);
  } catch (err) {
    const hit = await storedPage(cache, request);
    if (hit) return hit;
    throw err;
  }
}

// Block 105. Part of a stored file, for the browser's audio player. A
// file not yet kept goes to the network as before.
async function partFromCache(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request.url);
  if (!hit) return fetch(request);
  const whole = await hit.arrayBuffer();
  const size = whole.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec((request.headers.get("range") || "").trim());
  const type = hit.headers.get("Content-Type") || "application/octet-stream";
  if (!m || (m[1] === "" && m[2] === "")) {
    return new Response(whole, { status: 200, headers: { "Content-Type": type, "Content-Length": String(size) } });
  }
  let start;
  let end;
  if (m[1] === "") { // the last n bytes
    start = Math.max(0, size - Number(m[2]));
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  return new Response(whole.slice(start, end + 1), {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": type,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.headers.has("range")) {
    if (isVersioned(url)) event.respondWith(partFromCache(request));
    return;
  }
  event.respondWith(isVersioned(url) ? cacheFirst(request, url) : networkFirst(event));
});
