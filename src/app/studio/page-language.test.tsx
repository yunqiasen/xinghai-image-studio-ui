import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { GenerationProvider } from "@/components/commercial/generation-provider";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";

import { StudioPage } from "./page";

describe("StudioPage language", () => {
  it("renders the complete creation controls in English", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="en-US"><ThemeProvider><MemoryRouter initialEntries={["/studio"]}>
        <GenerationProvider><StudioPage /></GenerationProvider>
      </MemoryRouter></ThemeProvider></LanguageProvider>,
    );
    expect(html).toContain("Creation Workbench");
    expect(html).toContain("Image creation type");
    expect(html).toContain("Video creation type");
    expect(html).toContain("Text to video");
    expect(html).toContain("Image to video");
    expect(html).not.toContain("Inspiration spectrum");
    expect(html).toContain("Aspect ratio");
    expect(html).toContain("Prompt templates");
    expect(html).toContain("Generate");
    expect(html).not.toContain("创作类型");
  });
});
