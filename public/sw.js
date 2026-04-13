// ─────────────────────────────────────────────────────────
// Service Worker — Cuemath AI Tutor  (v1)
// Cache-first with network fallback for static assets,
// network-first for API routes, and background sync for
// queued telemetry.
// ─────────────────────────────────────────────────────────

const CACHE_VERSION = "cuemath-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Assets to precache on install
const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/tutor",
  "/roadmap",
  "/studio",
  "/analytics",
];

// ─── INSTALL ────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Pre-caching app shell");
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activate immediately without waiting for tabs to close
  self.skipWaiting();
});

// ─── ACTIVATE ───────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith("cuemath-") && name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ─── FETCH ──────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST to APIs, etc.)
  if (request.method !== "GET") return;

  // Skip API routes — they need live data
  if (url.pathname.startsWith("/api/")) return;

  // Skip Chrome extension / dev-tools requests
  if (!url.protocol.startsWith("http")) return;

  // For navigation requests (HTML pages): Network-First
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the fresh response
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Offline fallback — serve from cache
          return caches.match(request).then((cached) => {
            return cached || caches.match("/dashboard");
          });
        })
    );
    return;
  }

  // For static assets (JS, CSS, images, fonts): Cache-First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Only cache successful responses from our origin
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// ─── BACKGROUND SYNC ────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-telemetry") {
    event.waitUntil(flushTelemetryQueue());
  }
});

async function flushTelemetryQueue() {
  try {
    const db = await openDB();
    const tx = db.transaction("syncQueue", "readonly");
    const store = tx.objectStore("syncQueue");
    const allItems = await getAllFromStore(store);

    if (allItems.length === 0) return;

    console.log(`[SW] Syncing ${allItems.length} queued telemetry items`);

    // Attempt to sync each item
    for (const item of allItems) {
      try {
        await fetch("/api/telemetry-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.data),
        });
        // Remove from queue on success
        const deleteTx = db.transaction("syncQueue", "readwrite");
        deleteTx.objectStore("syncQueue").delete(item.id);
      } catch (e) {
        console.warn("[SW] Failed to sync item, will retry:", item.id);
      }
    }

    // Notify all clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: "SYNC_COMPLETE", count: allItems.length });
    });
  } catch (e) {
    console.error("[SW] Sync failed:", e);
  }
}

// ─── IndexedDB Helpers ──────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("cuemath-offline", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("lessonCache")) {
        db.createObjectStore("lessonCache", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─── MESSAGE HANDLER ────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
