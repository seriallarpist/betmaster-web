// Bet Master service worker
//
// This intentionally does very little. Its main job is just existing:
// iOS Safari can silently clear localStorage (your saved API key, theme,
// favorites) for "standalone" home-screen web apps that don't have an
// active service worker. Registering one, even a near-empty one, exempts
// the app from that behavior.
//
// It only caches the icon files, never index.html or any live data
// (ESPN/Polymarket/Odds API), so app updates and live odds are always
// fetched fresh, nothing here can cause a "why isn't it updating" problem.

const CACHE_NAME = "betmaster-shell-v1";
const SHELL_FILES = ["icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isShellIcon = /\/(icon-192|icon-512|apple-touch-icon)\.png$/.test(url.pathname);

  if (event.request.method === "GET" && isShellIcon) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // Everything else (index.html, ESPN/Polymarket/Odds API calls) is left
  // completely alone and goes straight to the network as normal.
});
