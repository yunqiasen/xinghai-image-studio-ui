import { setCurrentUser, type LocalUser } from "@/lib/storage/local-session";

import { normalizeImageResponse, type NormalizedImageResponse } from "./normalize";

export type ImageRequestPayload = {
  mode: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  reference_images?: string[];
  mask?: string;
};

export type ImageGenerationResponse = NormalizedImageResponse & {
  user?: LocalUser;
  creditsCost?: number;
};

export async function submitImageGeneration(payload: ImageRequestPayload): Promise<ImageGenerationResponse> {
  const response = await fetch("/api/image/generate", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const raw = await response.json().catch(() => ({}));
  const normalized = normalizeImageResponse(raw);
  if (raw?.user) setCurrentUser(raw.user as LocalUser);
  if (!response.ok || !normalized.ok) {
    throw new Error(normalized.error || raw?.error || `生成失败 HTTP ${response.status}`);
  }
  return { ...normalized, user: raw?.user as LocalUser | undefined, creditsCost: raw?.creditsCost };
}
