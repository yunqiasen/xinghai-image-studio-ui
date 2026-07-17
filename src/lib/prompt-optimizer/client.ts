export type PromptProfile = "text_to_image" | "image_to_image" | "text_to_video" | "image_to_video";

export type OptimizePromptInput = {
  profile: PromptProfile;
  prompt: string;
  sourceImage?: string;
  style?: string;
  mode?: string;
  duration?: number;
  resolution?: string;
  motion?: string;
};

export type OptimizePromptResult = {
  optimizedPrompt: string;
  fallback: boolean;
  profile?: PromptProfile;
  profileVersion?: number;
  visionFallback?: boolean;
};

export async function optimizePrompt(input: OptimizePromptInput): Promise<OptimizePromptResult> {
  const response = await fetch("/api/prompt/optimize", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    throw new Error(payload?.message || payload?.error?.message || payload?.error || `请求失败 HTTP ${response.status}`);
  }
  return payload;
}
