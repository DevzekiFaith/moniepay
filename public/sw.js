// ─────────────────────────────────────────────────────────────────
// MoniePay — Service Worker
// Offline resilience for Nigerian micro-businesses
// ─────────────────────────────────────────────────────────────────

const CACHE_NAME = "moniepay-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/moniepay-logo-square.png",
  "/moniepay-icon-192.png",
  "/moniepay-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Service worker asset pre-cache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle http and https requests
  if (!request.url.startsWith("http://") && !request.url.startsWith("https://")) {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch (err) {
    return;
  }

  // Skip caching API routes, POST requests, and external database connections
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase.co")
  ) {
    return;
  }

  // Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic" &&
          (request.url.startsWith("http://") || request.url.startsWith("https://"))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone).catch((err) => {
              console.warn("Service worker cache.put warning:", err);
            });
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503, statusText: "Offline" });
        });
      })
  );
});
