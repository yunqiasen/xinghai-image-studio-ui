import type { StudioMode } from "@/lib/billing/pricing";

import type { StudioSettingsValue } from "./mode-settings";

export type ModeRequestSettings = Pick<StudioSettingsValue, "imageEditAction" | "superAction" | "referenceStrength" | "preserveComposition" | "consistency" | "variation" | "overlayText">;

export function buildModePrompt(_mode: StudioMode, prompt: string, _settings: ModeRequestSettings) {
  return prompt.trim();
}

export function buildGenerationPrompt(mode: StudioMode, prompt: string, settings: ModeRequestSettings, _hasMask: boolean) {
  return buildModePrompt(mode, prompt, settings);
}
