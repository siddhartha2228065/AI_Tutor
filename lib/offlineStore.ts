// ─────────────────────────────────────────────────────────
// Offline Store — IndexedDB utility for queue & lesson cache
// ─────────────────────────────────────────────────────────

const DB_NAME = "cuemath-offline";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
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

// ─── Telemetry Queue ────────────────────────────────────

export async function queueMetric(data: Record<string, unknown>): Promise<void> {
  const db = await openDB();
  const tx = db.transaction("syncQueue", "readwrite");
  tx.objectStore("syncQueue").add({
    data,
    timestamp: Date.now(),
  });
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  // Request background sync if available
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    const reg = await navigator.serviceWorker.ready;
    try {
      await (reg as any).sync.register("sync-telemetry");
    } catch (e) {
      console.warn("Background sync registration failed:", e);
    }
  }
}

export async function getPendingSyncCount(): Promise<number> {
  try {
    const db = await openDB();
    const tx = db.transaction("syncQueue", "readonly");
    const store = tx.objectStore("syncQueue");
    return new Promise((resolve, reject) => {
      const count = store.count();
      count.onsuccess = () => resolve(count.result);
      count.onerror = () => reject(count.error);
    });
  } catch {
    return 0;
  }
}

export async function flushQueue(): Promise<number> {
  const db = await openDB();
  const tx = db.transaction("syncQueue", "readonly");
  const store = tx.objectStore("syncQueue");
  const items: any[] = await new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (items.length === 0) return 0;

  let synced = 0;
  for (const item of items) {
    try {
      const res = await fetch("/api/telemetry-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.data),
      });
      if (res.ok) {
        const deleteTx = db.transaction("syncQueue", "readwrite");
        deleteTx.objectStore("syncQueue").delete(item.id);
        synced++;
      }
    } catch {
      // Skip failed items — they'll be retried
    }
  }

  return synced;
}

// ─── Lesson Cache ───────────────────────────────────────

export interface CachedLesson {
  id: string;
  title: string;
  content: string;
  grade: string;
  cachedAt: number;
}

export async function cacheLessonContent(lesson: Omit<CachedLesson, "cachedAt">): Promise<void> {
  const db = await openDB();
  const tx = db.transaction("lessonCache", "readwrite");
  tx.objectStore("lessonCache").put({ ...lesson, cachedAt: Date.now() });
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedLesson(id: string): Promise<CachedLesson | null> {
  const db = await openDB();
  const tx = db.transaction("lessonCache", "readonly");
  const store = tx.objectStore("lessonCache");
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCachedLessons(): Promise<CachedLesson[]> {
  const db = await openDB();
  const tx = db.transaction("lessonCache", "readonly");
  const store = tx.objectStore("lessonCache");
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
