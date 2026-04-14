"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { createPortal } from "react-dom";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const iconMap = {
    success: "check_circle",
    error: "error",
    info: "info",
    warning: "warning",
  };

  const colorMap = {
    success: "from-emerald-600 to-teal-600 shadow-emerald-500/30",
    error: "from-rose-600 to-red-600 shadow-rose-500/30",
    info: "from-indigo-600 to-blue-600 shadow-indigo-500/30",
    warning: "from-amber-500 to-orange-500 shadow-amber-500/30",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      {mounted && createPortal(
        <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
          {toasts.map((toast, i) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r ${colorMap[toast.type]} text-white shadow-2xl min-w-[340px] max-w-[480px] animate-fade-in-up backdrop-blur-2xl border border-white/20`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span
                className="material-symbols-outlined text-2xl flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {iconMap[toast.type]}
              </span>
              <p className="text-sm font-semibold flex-1 leading-relaxed">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
