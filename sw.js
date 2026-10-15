// Підвищуй версію при кожній зміні файлів зі списку SHELL.
const VERSION = "pdr-v2";
const SHELL = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./js/translations.js",
  "./js/progress.js",
  "./js/app.js",
  "./data/topics.json",
  "./data/questions.json",
  "./manifest.webmanifest",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first для HTML і JSON (щоб нові питання й правки доходили одразу),
// cache-first для статики (CSS, JS, іконки). Офлайн — завжди з кешу.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  const isFresh = req.mode === "navigate" || req.url.endsWith(".json") || req.url.endsWith(".webmanifest");
  event.respondWith(isFresh ? networkFirst(req) : cacheFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req, { ignoreSearch: true })) || cache.match("./index.html");
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req, { ignoreSearch: true });
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) (await caches.open(VERSION)).put(req, res.clone());
  return res;
}
