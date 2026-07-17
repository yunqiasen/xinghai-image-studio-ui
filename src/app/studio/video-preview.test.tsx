import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";

import { VideoPreview } from "./video-preview";

function renderPreview(sourceUrl = "") {
  return renderToStaticMarkup(
    <LanguageProvider initialLocale="zh-CN">
      <ThemeProvider>
        <VideoPreview
          aspectRatio="16:9"
          duration={5}
          motion="balanced"
          prompt=""
          resolution="1080p"
          sourceUrl={sourceUrl}
          onGenerate={() => undefined}
          onOptimizePrompt={() => undefined}
          onPromptChange={() => undefined}
        />
      </ThemeProvider>
    </LanguageProvider>,
  );
}

describe("VideoPreview", () => {
  it("renders a video player, timeline and video output information", () => {
    const html = renderPreview();

    expect(html).toContain('data-preview-kind="video"');
    expect(html).toContain("视频预览");
    expect(html).toContain("视频播放器");
    expect(html).toContain("00:00 / 00:05");
    expect(html).toContain("视频输出参数");
    expect(html).toContain("运动强度");
    expect(html).toContain("生成视频");
  });

  it("does not expose image preview actions or image result metadata", () => {
    const html = renderPreview();

    expect(html).not.toContain("缩小预览");
    expect(html).not.toContain("打开原图");
    expect(html).not.toContain("局部编辑");
    expect(html).not.toContain("提示词模板");
    expect(html).not.toContain(">数量<");
  });

  it("uses an uploaded starting frame as the player poster", () => {
    const html = renderPreview("data:image/png;base64,poster");

    expect(html).toContain('data-video-poster="true"');
    expect(html).toContain('src="data:image/png;base64,poster"');
  });
});
