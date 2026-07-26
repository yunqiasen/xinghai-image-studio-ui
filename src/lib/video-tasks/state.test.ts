import { describe, expect, it } from "vitest";

import type { VideoModel, VideoTask } from "./types";
import { isActiveVideoTask, latestVideoTaskForMode, modelsForVideoMode, videoTaskError } from "./state";

function task(overrides: Partial<VideoTask>): VideoTask {
  return {
    id: "vid_1", model: "Agnes-Video-V2.0", mode: "text_to_video", prompt: "prompt", optimizedPrompt: "prompt",
    aspectRatio: "16:9", resolution: "1080p", requestedSeconds: 5, seconds: 5, numFrames: 121, frameRate: 24,
    motion: "balanced", creditCost: 5, status: "queued", progress: 0,
    createdAt: "2026-07-17T16:00:00+08:00", updatedAt: "2026-07-17T16:00:00+08:00", ...overrides,
  };
}

const models: VideoModel[] = [{
  id: "both", slug: "both", name: "Both", type: "video", runtimeReady: true,
  capabilities: { input_modes: ["text", "image"], output_modes: ["video"], async: true, resolutions: ["1080p"], aspect_ratios: ["16:9"], durations: [{ seconds: 5, num_frames: 121, frame_rate: 24 }] },
  pricing: { unit: "credits", duration_costs: { "5": 5 } },
}, {
  id: "text", slug: "text", name: "Text", type: "video", runtimeReady: true,
  capabilities: { input_modes: ["text"], output_modes: ["video"], async: true, resolutions: ["720p"], aspect_ratios: ["9:16"], durations: [{ seconds: 10, num_frames: 241, frame_rate: 24 }] },
  pricing: { unit: "credits", duration_costs: { "10": 10 } },
}];

describe("video task state", () => {
  it("filters models by text or image input capability", () => {
    expect(modelsForVideoMode(models, "video-text").map((item) => item.id)).toEqual(["both", "text"]);
    expect(modelsForVideoMode(models, "video-image").map((item) => item.id)).toEqual(["both"]);
  });

  it("restores the latest task independently for each video mode", () => {
    const latest = task({ id: "latest", mode: "image_to_video", createdAt: "2026-07-17T18:00:00+08:00" });
    expect(latestVideoTaskForMode([task({ id: "old", mode: "image_to_video" }), latest], "video-image")?.id).toBe("latest");
    expect(latestVideoTaskForMode([task({ id: "text" }), latest], "video-text")?.id).toBe("text");
  });

  it("recognizes active states and keeps backend failure text", () => {
    expect(isActiveVideoTask(task({ status: "in_progress" }))).toBe(true);
    expect(isActiveVideoTask(task({ status: "succeeded" }))).toBe(false);
    expect(videoTaskError(task({ status: "failed", error: "上游生成失败" }))).toBe("上游生成失败");
  });
});
