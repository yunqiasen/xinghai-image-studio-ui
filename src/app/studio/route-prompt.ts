import type { StudioMode } from "@/lib/billing/pricing";

export const MAX_STUDIO_PROMPT_LENGTH = 4000;

const studioRouteModes = new Set<StudioMode>(["text", "image", "edit", "remove-bg", "upscale", "background", "batch"]);

export type StudioRouteSourceImage = {
  url?: string;
  dataUrl?: string;
  name: string;
};

export type StudioRouteState = {
  mode: StudioMode;
  prompt: string;
  sourceImage?: StudioRouteSourceImage;
  openMaskEditor?: true;
};

function normalizePrompt(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_STUDIO_PROMPT_LENGTH);
}

export function readStudioRoutePrompt(state: unknown): string | null {
  if (!state || typeof state !== "object" || !("prompt" in state)) return null;
  const prompt = normalizePrompt((state as { prompt?: unknown }).prompt);
  return prompt || null;
}

export function readStudioRouteState(state: unknown): StudioRouteState | null {
  if (!state || typeof state !== "object") return null;
  const raw = state as Record<string, unknown>;
  const prompt = normalizePrompt(raw.prompt);
  const sourceRaw = raw.sourceImage && typeof raw.sourceImage === "object"
    ? raw.sourceImage as Record<string, unknown>
    : null;
  const url = typeof sourceRaw?.url === "string" ? sourceRaw.url.trim() : "";
  const dataUrl = typeof sourceRaw?.dataUrl === "string" ? sourceRaw.dataUrl.trim() : "";
  const sourceImage = url || dataUrl
    ? {
        ...(url ? { url } : {}),
        ...(dataUrl ? { dataUrl } : {}),
        name: typeof sourceRaw?.name === "string" && sourceRaw.name.trim()
          ? sourceRaw.name.trim().slice(0, 120)
          : "作品",
      }
    : undefined;

  const requestedMode = typeof raw.mode === "string" && studioRouteModes.has(raw.mode as StudioMode)
    ? raw.mode as StudioMode
    : undefined;
  const mode = requestedMode === "edit"
    ? "image"
    : requestedMode || (sourceImage ? "image" : "text");
  if (!prompt && !sourceImage) return null;

  return {
    mode,
    prompt,
    ...(sourceImage ? { sourceImage } : {}),
    ...(sourceImage && mode === "image" && raw.openMaskEditor === true ? { openMaskEditor: true as const } : {}),
  };
}
