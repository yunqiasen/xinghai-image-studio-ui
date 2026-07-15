"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Toaster } from "sonner";

import { nextThemeMode, normalizeThemeMode, THEME_STORAGE_KEY, type ThemeMode } from "./theme-modes";

type ThemeContextValue = {
  themeMode: ThemeMode;
  isDark: boolean;
  isDarkLike: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "colorful";
  try {
    return normalizeThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "colorful";
  }
}

function applyThemeMode(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.classList.toggle("theme-light", mode === "light");
  root.classList.toggle("theme-dark", mode === "dark");
  root.classList.toggle("theme-colorful", mode === "colorful");
  root.classList.remove("theme-graphite");
  root.dataset.theme = mode;
  root.style.colorScheme = mode === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => readStoredThemeMode());

  useLayoutEffect(() => applyThemeMode(themeMode), [themeMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // 本地存储不可用时，当前页面内仍可正常切换。
    }
  }, [themeMode]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) setThemeModeState(normalizeThemeMode(event.newValue));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    themeMode,
    isDark: themeMode === "dark",
    isDarkLike: themeMode === "dark" || themeMode === "colorful",
    setThemeMode: (mode) => setThemeModeState((current) => current === mode ? current : mode),
    toggleTheme: () => setThemeModeState(nextThemeMode),
  }), [themeMode]);

  return (
    <ThemeContext.Provider value={value}>
      <Toaster position="top-center" richColors theme={themeMode === "dark" ? "dark" : "light"} />
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
