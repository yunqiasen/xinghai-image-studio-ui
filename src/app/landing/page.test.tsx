import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";

import { LandingPage } from "./page";

describe("LandingPage", () => {
  it("renders English commercial copy when English is selected", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="en-US"><MemoryRouter><LandingPage /></MemoryRouter></LanguageProvider>,
    );
    expect(html).toContain("One workspace for AI image creation.");
    expect(html).toContain("Start creating");
    expect(html).toContain("Text to image");
    expect(html).not.toContain("一站式 AI 图片创作平台");
  });
});
