"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";

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
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast, i) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r ${colorMap[toast.type]} text-white shadow-2xl min-w-[320px] max-w-[440px] animate-slide-in backdrop-blur-xl`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span
              className="material-symbols-outlined text-xl flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {iconMap[toast.type]}
            </span>
            <p className="text-sm font-medium flex-1 leading-relaxed">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-white/60 hover:text-white transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
