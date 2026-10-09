// ─────────────────────────────────────────────────────────────────
// MoniePay — Service Worker
// Offline resilience for Nigerian micro-businesses
// ─────────────────────────────────────────────────────────────────

const CACHE_NAME = "moniepay-cache-v2";
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

  // Never cache Next.js internal chunks, HMR, API routes, or Supabase
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("hot-update") ||
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

// ─────────────────────────────────────────────────────────────────
// Background Push & Live Entry Alert Handler (Hands-Off Vibration & Beep)
// ─────────────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {
    title: "MoniePay: New Transaction Alert",
    body: "A new entry has been recorded in your shop.",
    url: "/directory",
    vibrate: [200, 100, 200, 100, 350],
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/moniepay-icon-192.png",
    badge: "/moniepay-icon-192.png",
    vibrate: [200, 100, 200, 100, 350],
    tag: "moniepay-cash-entry",
    renotify: true,
    data: {
      url: data.url || "/directory",
    },
    actions: [
      { action: "open_directory", title: "Open Directory" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || "/directory";

  if (event.action === "dismiss") return;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
