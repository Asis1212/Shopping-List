// Service Worker — מאפשר התקנה כאפליקציה ועבודה אופליין בסיסית.
// אסטרטגיה: קבצים סטטיים מה-cache תחילה, API תמיד מהרשת.

const CACHE = "shopping-list-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // קריאות API — תמיד רשת, בלי cache (כדי שהסנכרון יישאר טרי)
  if (url.pathname.startsWith("/api/")) return;

  // סטטי — cache תחילה, ואז רשת כגיבוי + עדכון ה-cache
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fromNetwork = fetch(event.request)
        .then((res) => {
          if (res.ok && event.request.method === "GET") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fromNetwork;
    })
  );
});
