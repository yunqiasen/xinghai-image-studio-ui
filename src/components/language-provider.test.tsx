import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  LANGUAGE_STORAGE_KEY,
  applyLanguageMode,
  createTranslator,
  normalizeLanguageMode,
  persistLanguageMode,
  readStoredLanguageMode,
} from "./language-modes";
import { LanguageProvider, useLanguage } from "./language-provider";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    value: (key: string) => values.get(key),
  };
}

function LocaleProbe() {
  const { locale, t } = useLanguage();
  return <span>{locale}:{t("studio.resultCount", { count: 3 })}</span>;
}

describe("commercial language mode", () => {
  it("normalizes supported locales and keeps Chinese as the default", () => {
    expect(normalizeLanguageMode("zh-CN")).toBe("zh-CN");
    expect(normalizeLanguageMode("en-US")).toBe("en-US");
    expect(normalizeLanguageMode("en")).toBe("en-US");
    expect(normalizeLanguageMode(null)).toBe("zh-CN");
  });

  it("reads, persists, and applies the selected language", () => {
    const storage = memoryStorage({ [LANGUAGE_STORAGE_KEY]: "en-US" });
    const root = { lang: "", dataset: {} as Record<string, string> };

    expect(readStoredLanguageMode(storage)).toBe("en-US");
    persistLanguageMode("zh-CN", storage);
    expect(storage.value(LANGUAGE_STORAGE_KEY)).toBe("zh-CN");
    applyLanguageMode("en-US", root);
    expect(root.lang).toBe("en-US");
    expect(root.dataset.language).toBe("en-US");
  });

  it("renders translated copy and interpolates dynamic values", () => {
    expect(createTranslator("zh-CN")("common.language")).toBe("语言");
    expect(createTranslator("en-US")("common.language")).toBe("Language");
    expect(createTranslator("en-US")("studio.resultCount", { count: 4 })).toBe("4 results");

    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="en-US"><LocaleProbe /></LanguageProvider>,
    );
    expect(html).toContain("en-US:3 results");
  });
});
