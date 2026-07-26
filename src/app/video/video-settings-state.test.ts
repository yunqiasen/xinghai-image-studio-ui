import { describe, expect, it } from "vitest";

import type { VideoModel } from "@/lib/video-tasks/types";

import { createInitialVideoSettings, reconcileVideoSettings, videoCreditCost } from "./video-settings-state";

const model: VideoModel = {
  id: "Agnes-Video-V2.0", slug: "Agnes-Video-V2.0", name: "Agnes Video", type: "video", runtimeReady: true,
  capabilities: {
    input_modes: ["text", "image"], output_modes: ["video"], async: true,
    resolutions: ["480p", "720p"], aspect_ratios: ["4:3", "3:4"],
    durations: [{ seconds: 10, num_frames: 241, frame_rate: 24 }, { seconds: 18, num_frames: 441, frame_rate: 24 }],
  },
  pricing: { unit: "credits", duration_costs: { "10": 12, "18": 20 } },
};

describe("video settings state", () => {
  it("reconciles defaults to the capabilities returned by the selected model", () => {
    const settings = createInitialVideoSettings()["video-text"];
    expect(reconcileVideoSettings(settings, model)).toMatchObject({
      model: "Agnes-Video-V2.0", aspectRatio: "4:3", duration: 10, resolution: "480p",
    });
  });

  it("reads the administrator-configured duration price", () => {
    expect(videoCreditCost(model, 10)).toBe(12);
    expect(videoCreditCost(model, 5)).toBeUndefined();
  });
});
