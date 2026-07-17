import type { StudioMode } from "@/lib/billing/pricing";

import type { VideoSettingsValue, VideoStudioMode } from "./video-settings";

export function isVideoStudioMode(mode: StudioMode): mode is VideoStudioMode {
  return mode === "video-text" || mode === "video-image";
}

export function createInitialVideoSettings(): Record<VideoStudioMode, VideoSettingsValue> {
  return {
    "video-text": { model: "Agnes-Video-V2.0", aspectRatio: "16:9", duration: 5, resolution: "1080p", motion: "balanced" },
    "video-image": { model: "Agnes-Video-V2.0", aspectRatio: "16:9", duration: 5, resolution: "1080p", motion: "balanced" },
  };
}
