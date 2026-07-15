import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { SoulGalleryPage } from "./page";

describe("SoulGalleryPage", () => {
  it("renders the requested curated gallery landing state", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <SoulGalleryPage />
      </MemoryRouter>,
    );

    expect(html).toContain("灵魂画廊");
    expect(html).toContain("19 组精选灵感");
    expect(html).toContain('aria-label="搜索灵魂画廊"');
    expect(html).toContain("来自 imagic6 与 imya 的精选视觉模板");
    expect((html.match(/data-soul-card=/g) || []).length).toBe(19);
  });
});
