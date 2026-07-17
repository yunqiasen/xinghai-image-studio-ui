import type { PromptProfile } from "@/lib/prompt-optimizer/client";
import type { StudioMode } from "@/lib/billing/pricing";

export function promptProfileForStudioMode(mode: StudioMode): PromptProfile {
  if (mode === "video-text") return "text_to_video";
  if (mode === "video-image") return "image_to_video";
  if (mode === "text") return "text_to_image";
  return "image_to_image";
}
