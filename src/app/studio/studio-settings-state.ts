import type { StudioMode } from "@/lib/billing/pricing";

import { studioModeDefinitions, studioModeModels } from "./mode-config";
import type { StudioSettingsValue } from "./mode-settings";

export type StudioModeSettings = Omit<StudioSettingsValue, "prompt">;

const defaultSettings: Omit<StudioModeSettings, "model"> = {
  aspectRatio: "1:1",
  count: 1,
  resolution: "1k",
  imageEditAction: "remove-background",
  superAction: "2x",
  referenceStrength: 70,
  preserveComposition: true,
  consistency: 80,
  variation: 30,
  overlayText: "",
};

export function createInitialStudioSettings(): Record<StudioMode, StudioModeSettings> {
  const modes = Object.keys(studioModeDefinitions) as StudioMode[];
  return Object.fromEntries(modes.map((mode) => [
    mode,
    { ...defaultSettings, model: studioModeModels[mode][0].value },
  ])) as Record<StudioMode, StudioModeSettings>;
}
