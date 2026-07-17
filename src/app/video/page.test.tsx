import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";

import { VideoPage } from "./page";

function renderVideoPage() {
  return renderToStaticMarkup(
    <LanguageProvider initialLocale="zh-CN">
      <ThemeProvider>
        <MemoryRouter><VideoPage /></MemoryRouter>
      </ThemeProvider>
    </LanguageProvider>,
  );
}

describe("VideoPage", () => {
  it("renders an independent video creation workspace", () => {
    const html = renderVideoPage();

    expect(html).toContain("视频创作");
    expect(html).toContain("视频创作类型");
    expect(html).toContain("文生视频");
    expect(html).toContain("图生视频");
    expect(html).toContain("视频模型");
    expect(html).toContain("视频比例");
    expect(html).toContain("视频时长");
    expect(html).toContain("视频清晰度");
    expect(html).toContain("运动强度");
    expect(html).toContain("视频预览");
    expect(html).toContain("生成视频");
  });

  it("does not render image creation categories or image output controls", () => {
    const html = renderVideoPage();

    expect(html).not.toContain("图像创作类型");
    expect(html).not.toContain("生成张数");
    expect(html).not.toContain("打开原图");
    expect(html).not.toContain("局部编辑");
  });
});
