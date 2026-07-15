import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "./language-provider";
import { LanguageSelector } from "./language-selector";
import { ThemeProvider } from "./theme-provider";
import { ThemeSelector } from "./theme-selector";

function renderControls(locale: "zh-CN" | "en-US") {
  return renderToStaticMarkup(
    <LanguageProvider initialLocale={locale}>
      <ThemeProvider>
        <LanguageSelector />
        <ThemeSelector />
      </ThemeProvider>
    </LanguageProvider>,
  );
}

describe("commercial preference selectors", () => {
  it("renders language and appearance as dropdown triggers", () => {
    const html = renderControls("zh-CN");
    expect(html).toContain('data-language-selector="true"');
    expect(html).toContain('data-theme-selector="true"');
    expect((html.match(/role="combobox"/g) || []).length).toBe(2);
    expect(html).toContain("中文");
    expect(html).toContain("彩色");
    expect(html).not.toContain('role="radiogroup"');
    expect(html).not.toContain('role="radio"');
  });

  it("uses English trigger labels in English mode", () => {
    const html = renderControls("en-US");
    expect(html).toContain("English");
    expect(html).toContain("Colorful");
    expect(html).toContain('aria-label="Appearance"');
  });
});
