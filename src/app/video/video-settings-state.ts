import type { VideoSettingsValue, VideoStudioMode } from "./video-settings";

export function createInitialVideoSettings(): Record<VideoStudioMode, VideoSettingsValue> {
  return {
    "video-text": { model: "gpt-video-placeholder", aspectRatio: "16:9", duration: 5, resolution: "1080p", motion: "balanced" },
    "video-image": { model: "gpt-video-placeholder", aspectRatio: "16:9", duration: 5, resolution: "1080p", motion: "balanced" },
  };
}

export const videoModeModels: Record<VideoStudioMode, Array<{ value: string; label: string }>> = {
  "video-text": [{ value: "gpt-video-placeholder", label: "GPT Video（即将上线）" }],
  "video-image": [{ value: "gpt-video-placeholder", label: "GPT Video（即将上线）" }],
};
