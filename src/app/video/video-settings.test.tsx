import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";
import type { VideoModel } from "@/lib/video-tasks/types";

import { createInitialVideoSettings, reconcileVideoSettings } from "./video-settings-state";
import { VideoSettings, type VideoStudioMode } from "./video-settings";

const model: VideoModel = {
  id: "Agnes-Video-V2.0", slug: "Agnes-Video-V2.0", name: "Agnes Video 2.0", type: "video", runtimeReady: true,
  capabilities: {
    input_modes: ["text", "image"], output_modes: ["video"], async: true,
    resolutions: ["480p", "720p", "1080p"], aspect_ratios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    durations: [{ seconds: 5, num_frames: 121, frame_rate: 24 }, { seconds: 10, num_frames: 241, frame_rate: 24 }, { seconds: 18, num_frames: 441, frame_rate: 24 }],
  },
  pricing: { unit: "credits", duration_costs: { "5": 5, "10": 10, "18": 18 } },
};

function renderSettings(mode: VideoStudioMode) {
  const values = createInitialVideoSettings();
  values[mode] = reconcileVideoSettings(values[mode], model);
  return renderToStaticMarkup(
    <LanguageProvider initialLocale="zh-CN">
      <VideoSettings
        mode={mode}
        value={values[mode]}
        assets={[]}
        models={[model]}
        onChange={() => undefined}
        onFiles={() => undefined}
        onRemoveAsset={() => undefined}
      />
    </LanguageProvider>,
  );
}

describe("VideoSettings", () => {
  it("renders every capability returned by the selected video model", () => {
    const html = renderSettings("video-text");

    expect(html).toContain("Agnes Video 2.0");
    expect(html).toContain("480P");
    expect(html).toContain("18 秒");
    expect(html).toContain("4:3");
    expect(html).toContain("3:4");
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
