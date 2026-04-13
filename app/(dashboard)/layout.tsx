"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import { ToastProvider } from "@/components/Toast";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { ThemeProvider } from "@/components/ThemeContext";
import { useEffect } from "react";

function OfflineBanner() {
  const { isOnline, pendingSyncCount, attemptSync } = useOfflineStatus();

  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 ${
      !isOnline 
        ? 'translate-y-0' 
        : pendingSyncCount > 0 ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className={`px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-bold backdrop-blur-xl ${
        !isOnline 
          ? 'bg-rose-900/90 text-rose-200 border-b border-rose-500/30' 
          : 'bg-amber-900/90 text-amber-200 border-b border-amber-500/30'
      }`}>
        <span className="material-symbols-outlined text-[18px]">
          {!isOnline ? 'wifi_off' : 'sync'}
        </span>
        {!isOnline ? (
          <span>You&apos;re offline — cached content is available. Changes will sync when you reconnect.</span>
        ) : (
          <span>Syncing {pendingSyncCount} queued update{pendingSyncCount !== 1 ? 's' : ''}...</span>
        )}
        {isOnline && pendingSyncCount > 0 && (
          <button 
            onClick={attemptSync}
            className="ml-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs uppercase tracking-widest transition-all"
          >
            Sync Now
          </button>
        )}
      </div>
    </div>
  );
}

function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register SW after page load to avoid blocking
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[App] Service Worker registered, scope:", reg.scope);

          // Listen for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "activated") {
                  console.log("[App] New Service Worker activated");
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("[App] Service Worker registration failed:", err);
        });
    });
  }, []);

  return null;
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  return (
    <main
      className={`min-h-screen pb-24 lg:pb-8 flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? "lg:ml-64" : "lg:ml-[72px]"
      }`}
    >
      {children}
    </main>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <ToastProvider>
          <ServiceWorkerRegistrar />
          <OfflineBanner />
          <Sidebar />
          <DashboardShell>
            <Header />
            {children}
          </DashboardShell>
          <MobileNav />
        </ToastProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
