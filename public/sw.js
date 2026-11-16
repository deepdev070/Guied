// India Paperwork Guide - Progressive Web App Service Worker
// Cache Version: v1.0.0
const CACHE_VERSION = "ipg-v1.0.0";
const STATIC_CACHE = `ipg-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ipg-dynamic-${CACHE_VERSION}`;

// Core App Shell assets precached on install
const APP_SHELL_ASSETS = [
  "/",
  "/offline",
  "/my-checklists",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

// Routes and patterns that MUST NEVER BE CACHED
const EXCLUDED_PATTERNS = [
  /^\/admin(\/.*)?$/,
  /^\/api\/admin(\/.*)?$/,
  /^\/api\/(auth|report-mistake|analytics|feedback)(\/.*)?$/,
];

// Helper: check if request should bypass service worker cache
function shouldBypassCache(request, url) {
  // Only handle GET requests; all mutations (POST, PUT, DELETE, PATCH) go directly to network
  if (request.method !== "GET") {
    return true;
  }

  // Never cache admin pages, admin APIs, or write routes
  const pathname = url.pathname;
  for (const pattern of EXCLUDED_PATTERNS) {
    if (pattern.test(pathname)) {
      return true;
    }
  }

  // Don't intercept browser-extension or chrome-extension schemes
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return true;
  }

  return false;
}

// 1. Install Event: Precache App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Use individual caching with catch to avoid failing whole install if one asset is missing during build
      await Promise.all(
        APP_SHELL_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn("[SW] Precache failed for asset:", asset, err);
          })
        )
      );
    })
  );
  // Do not automatically force skipWaiting so that update toast can alert users
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) => name.startsWith("ipg-") && name !== STATIC_CACHE && name !== DYNAMIC_CACHE
            )
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Message Event: Listen for SKIP_WAITING from update toast
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 4. Fetch Event: Stale-While-Revalidate with /offline navigation fallback
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // If this request should bypass cache, fetch directly from network
  if (shouldBypassCache(request, url)) {
    return;
  }

  // HTML Navigation Requests (Guide pages, checklist pages, categories, states)
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        // Try Stale-While-Revalidate for navigations:
        // Check dynamic or static cache first
        const cachedResponse = await caches.match(request);

        const fetchPromise = fetch(request)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cacheCopy = networkResponse.clone();
              const cache = await caches.open(DYNAMIC_CACHE);
              await cache.put(request, cacheCopy);
            }
            return networkResponse;
          })
          .catch(async () => {
            // Network failed. If we already had a cached version, it was returned.
            // If neither network nor cache succeeded, serve the friendly /offline page
            const offlineResponse = await caches.match("/offline");
            if (offlineResponse) {
              return offlineResponse;
            }
            return new Response("You are offline and this page has not been cached yet.", {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({ "Content-Type": "text/plain; charset=utf-8" }),
            });
          });

        // Return cached response immediately if available, while network updates in background
        return cachedResponse || fetchPromise;
      })()
    );
    return;
  }

  // Next.js static assets, images, icons, and fonts: Stale-While-Revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/fonts/") ||
    /\.(png|jpg|jpeg|svg|webp|woff2?|css|js)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default GET requests: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
