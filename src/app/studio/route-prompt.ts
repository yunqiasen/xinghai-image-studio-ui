export const MAX_STUDIO_PROMPT_LENGTH = 4000;

export function readStudioRoutePrompt(state: unknown): string | null {
  if (!state || typeof state !== "object" || !("prompt" in state)) return null;
  const prompt = (state as { prompt?: unknown }).prompt;
  if (typeof prompt !== "string") return null;
  const normalized = prompt.trim();
  if (!normalized) return null;
  return normalized.slice(0, MAX_STUDIO_PROMPT_LENGTH);
}
