"use client";

import { useState, useEffect, useCallback } from "react";
import { getPendingSyncCount, flushQueue } from "@/lib/offlineStore";

export interface OfflineStatus {
  isOnline: boolean;
  isServiceWorkerReady: boolean;
  pendingSyncCount: number;
  attemptSync: () => Promise<void>;
}

export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Track online/offline status
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-flush queue when back online
      flushQueue().then((synced) => {
        if (synced > 0) {
          console.log(`[Offline] Synced ${synced} queued items`);
        }
        refreshPendingCount();
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check Service Worker readiness
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then(() => {
      setIsServiceWorkerReady(true);
    });

    // Listen for sync-complete messages from SW
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_COMPLETE") {
        refreshPendingCount();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);

  // Refresh pending sync count periodically
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount();
      setPendingSyncCount(count);
    } catch {
      setPendingSyncCount(0);
    }
  }, []);

  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  const attemptSync = useCallback(async () => {
    const synced = await flushQueue();
    console.log(`[Offline] Manual sync: ${synced} items`);
    await refreshPendingCount();
  }, [refreshPendingCount]);

  return {
    isOnline,
    isServiceWorkerReady,
    pendingSyncCount,
    attemptSync,
  };
}
