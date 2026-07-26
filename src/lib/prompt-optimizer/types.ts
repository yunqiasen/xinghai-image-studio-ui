export type PromptProfile = "text_to_image" | "image_to_image" | "text_to_video" | "image_to_video";

export type PromptOptimizeInput = {
  profile: PromptProfile;
  prompt: string;
  style?: string;
  mode?: string;
  duration?: 5 | 10 | 18;
  resolution?: "480p" | "720p" | "1080p";
  motion?: "gentle" | "balanced" | "dynamic";
  sourceImage?: string;
};

export type PromptOptimizeResult = {
  ok: true;
  originalPrompt: string;
  optimizedPrompt: string;
  profile: PromptProfile;
  profileVersion: number;
  fallback: boolean;
  visionFallback?: boolean;
  status: "optimized" | "unconfigured" | "provider_error";
  protocol?: string;
  model?: string;
  durationMs?: number;
};
