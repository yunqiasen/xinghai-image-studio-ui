import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";

import { SoulGalleryPage } from "./page";

describe("SoulGalleryPage", () => {
  it("renders the requested curated gallery landing state", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="zh-CN"><MemoryRouter>
        <SoulGalleryPage />
      </MemoryRouter></LanguageProvider>,
    );

    expect(html).toContain("灵魂画廊");
    expect(html).toContain("19 组精选灵感");
    expect(html).toContain('aria-label="搜索灵魂画廊"');
    expect(html).toContain("来自 imagic6 与 imya 的精选视觉模板");
    expect((html.match(/data-soul-card=/g) || []).length).toBe(19);
  });

  it("switches gallery chrome and title priority to English", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="en-US"><MemoryRouter>
        <SoulGalleryPage />
      </MemoryRouter></LanguageProvider>,
    );

    expect(html).toContain("19 curated ideas");
    expect(html).toContain('aria-label="Search Soul Gallery"');
    expect(html).toContain("A curated visual library from imagic6 and imya");
    expect(html).toContain("Neon Rain Night");
    expect(html).not.toContain("19 组精选灵感");
  });

});
