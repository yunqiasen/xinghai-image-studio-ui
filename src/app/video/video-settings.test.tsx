import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";

import { createInitialVideoSettings } from "./video-settings-state";
import { VideoSettings, type VideoStudioMode } from "./video-settings";

function renderSettings(mode: VideoStudioMode) {
  const values = createInitialVideoSettings();
  return renderToStaticMarkup(
    <LanguageProvider initialLocale="zh-CN">
      <VideoSettings
        mode={mode}
        value={values[mode]}
        assets={[]}
        onChange={() => undefined}
        onFiles={() => undefined}
        onRemoveAsset={() => undefined}
      />
    </LanguageProvider>,
  );
}

describe("VideoSettings", () => {
  it("renders video-native parameters instead of image output controls", () => {
    const html = renderSettings("video-text");

    expect(html).toContain("视频模型");
    expect(html).toContain("视频比例");
    expect(html).toContain("视频时长");
    expect(html).toContain("视频清晰度");
    expect(html).toContain("运动强度");
    expect(html).not.toContain("生成张数");
    expect(html).not.toContain("图片分辨率");
  });

  it("only asks image-to-video for a starting frame", () => {
    expect(renderSettings("video-image")).toContain("上传起始图片");
    expect(renderSettings("video-text")).not.toContain("上传起始图片");
  });

  it("keeps text-to-video and image-to-video values isolated", () => {
    const values = createInitialVideoSettings();
    values["video-text"].duration = 10;

    expect(values["video-text"].duration).toBe(10);
    expect(values["video-image"].duration).toBe(5);
    expect(values["video-text"]).not.toBe(values["video-image"]);
  });
});
