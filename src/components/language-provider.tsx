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

import {
  LANGUAGE_STORAGE_KEY,
  applyLanguageMode,
  createTranslator,
  normalizeLanguageMode,
  persistLanguageMode,
  readStoredLanguageMode,
  type LanguageMode,
  type Translate,
} from "./language-modes";

type LanguageContextValue = {
  locale: LanguageMode;
  setLocale: (locale: LanguageMode) => void;
  t: Translate;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: LanguageMode }) {
  const [locale, setLocaleState] = useState<LanguageMode>(() => initialLocale ?? readStoredLanguageMode());

  useLayoutEffect(() => applyLanguageMode(locale), [locale]);
  useEffect(() => persistLanguageMode(locale), [locale]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY) setLocaleState(normalizeLanguageMode(event.newValue));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale: (nextLocale) => setLocaleState((current) => current === nextLocale ? current : nextLocale),
    t: createTranslator(locale),
  }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
