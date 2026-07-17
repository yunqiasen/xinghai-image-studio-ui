import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";

import { AudioPage } from "./page";

describe("AudioPage", () => {
  it("provides a real destination for the audio creation navigation", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="zh-CN"><AudioPage /></LanguageProvider>,
    );

    expect(html).toContain("音频创作");
    expect(html).toContain("文本转语音");
    expect(html).toContain("文生音乐");
    expect(html).toContain("正在接入");
  });
});
