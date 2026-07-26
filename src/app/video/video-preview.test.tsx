import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";
import type { VideoTask } from "@/lib/video-tasks/types";

import { VideoPreview } from "./video-preview";

function task(overrides: Partial<VideoTask> = {}): VideoTask {
  return {
    id: "vid_123", model: "Agnes-Video-V2.0", mode: "text_to_video", prompt: "猫奔跑", optimizedPrompt: "猫奔跑",
    aspectRatio: "16:9", resolution: "1080p", requestedSeconds: 5, seconds: 5, numFrames: 121, frameRate: 24,
    motion: "balanced", creditCost: 5, status: "queued", progress: 0,
    createdAt: "2026-07-17T16:00:00+08:00", updatedAt: "2026-07-17T16:00:00+08:00", ...overrides,
  };
}

function renderPreview(options: { sourceUrl?: string; task?: VideoTask; creating?: boolean; error?: string } = {}) {
  return renderToStaticMarkup(
    <LanguageProvider initialLocale="zh-CN">
      <ThemeProvider>
        <VideoPreview
          aspectRatio="16:9"
          duration={5}
          motion="balanced"
          prompt=""
          resolution="1080p"
          sourceUrl={options.sourceUrl}
          task={options.task}
          creating={options.creating}
          error={options.error}
          onGenerate={() => undefined}
          onOptimizePrompt={() => undefined}
          onPromptChange={() => undefined}
        />
      </ThemeProvider>
    </LanguageProvider>,
  );
}

describe("VideoPreview", () => {
  it("renders a ready video workspace without the old interface-pending copy", () => {
    const html = renderPreview();
    expect(html).toContain('data-preview-state="empty"');
    expect(html).toContain("视频播放器");
    expect(html).toContain("生成视频");
    expect(html).not.toContain("接口即将接入");
    expect(html).not.toContain("视频接口接入后");
  });

  it("shows live task progress while the backend task is active", () => {
    const html = renderPreview({ task: task({ status: "in_progress", progress: 48 }) });
    expect(html).toContain('data-preview-state="loading"');
    expect(html).toContain("48%");
    expect(html).toContain("生成中");
  });

  it("plays the real backend video URL and actual output metadata", () => {
    const html = renderPreview({ task: task({ status: "succeeded", progress: 100, url: "https://cdn.example/result.mp4", seconds: 9.8, size: "1920x1080" }) });
    expect(html).toContain('data-preview-state="results"');
    expect(html).toContain("<video");
    expect(html).toContain('src="https://cdn.example/result.mp4"');
    expect(html).toContain("1920x1080");
    expect(html).toContain("9.8");
  });

  it("keeps backend video failures visible", () => {
    const html = renderPreview({ task: task({ status: "failed", error: "视频生成超时，积分已退回" }) });
    expect(html).toContain('data-preview-state="error"');
    expect(html).toContain("视频生成超时，积分已退回");
  });

  it("uses an uploaded starting frame as the waiting poster", () => {
    const html = renderPreview({ sourceUrl: "data:image/png;base64,poster" });
    expect(html).toContain('data-video-poster="true"');
  });
});
