// Підвищуй версію при кожній зміні файлів зі списку SHELL.
const VERSION = "pdr-v7";
const SHELL = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./js/translations.js",
  "./js/progress.js",
  "./js/app.js",
  "./data/topics.json",
  "./data/questions.json",
  "./data/lessons.json",
  "./data/signs.json",
  "./manifest.webmanifest",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/signs/A1a.svg",
  "./assets/signs/A1b.svg",
  "./assets/signs/A45.svg",
  "./assets/signs/A51.svg",
  "./assets/signs/B1.svg",
  "./assets/signs/B11.svg",
  "./assets/signs/B15.svg",
  "./assets/signs/B17.svg",
  "./assets/signs/B5.svg",
  "./assets/signs/B9.svg",
  "./assets/signs/C1.svg",
  "./assets/signs/C3.svg",
  "./assets/signs/C31a.svg",
  "./assets/signs/C31b.svg",
  "./assets/signs/C33.svg",
  "./assets/signs/C35.svg",
  "./assets/signs/C43-120.svg",
  "./assets/signs/C43-30.svg",
  "./assets/signs/C43-70.svg",
  "./assets/signs/C43-90.svg",
  "./assets/signs/C43.svg",
  "./assets/signs/C45.svg",
  "./assets/signs/D1.svg",
  "./assets/signs/D5.svg",
  "./assets/signs/D7.svg",
  "./assets/signs/E1.svg",
  "./assets/signs/E3.svg",
  "./assets/signs/E9a.svg",
  "./assets/signs/F1.svg",
  "./assets/signs/F19.svg",
  "./assets/signs/F3.svg",
  "./assets/signs/F4a.svg",
  "./assets/signs/F4b.svg",
  "./assets/signs/F5.svg",
  "./assets/signs/F7.svg",
  "./assets/scenes/crosswalk-parking.svg",
  "./assets/scenes/cyclist-right-turn.svg",
  "./assets/scenes/dirt-road.svg",
  "./assets/scenes/level-crossing.svg",
  "./assets/scenes/motorway-missed-exit.svg",
  "./assets/scenes/motorway-shoulder.svg",
  "./assets/scenes/overtake-cyclist.svg",
  "./assets/scenes/pedestrian-waiting.svg",
  "./assets/scenes/priority-right.svg",
  "./assets/scenes/rescue-lane.svg",
  "./assets/scenes/roundabout-yield.svg",
  "./assets/scenes/tram-left.svg",
  "./assets/scenes/tram-stop.svg",
  "./assets/scenes/turn-left-oncoming.svg",
  "./assets/scenes/zipper.svg"
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
