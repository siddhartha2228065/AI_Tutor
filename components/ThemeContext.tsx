"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeMode = "nexus" | "brand";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "nexus",
  setTheme: () => {},
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("nexus");

  useEffect(() => {
    const saved = localStorage.getItem("cuemath_theme") as ThemeMode | null;
    if (saved === "brand" || saved === "nexus") {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem("cuemath_theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const toggle = () => {
    setTheme(theme === "nexus" ? "brand" : "nexus");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
