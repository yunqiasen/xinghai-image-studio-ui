import { createContext, useContext } from "react";

import type { StudioMode } from "@/lib/billing/pricing";
import type { ImageTask, ImageTaskSource } from "@/lib/image-tasks/types";

import type { StudioGenerationState, StudioGenerationStates } from "./generation-state";

type StartGenerationInput = {
  mode: string;
  prompt: string;
  model: string;
  count: number;
  size: string;
  quality?: string;
  sourceImages: ImageTaskSource[];
};

export type GenerationContextValue = {
  states: StudioGenerationStates;
  getGenerationState: (mode: StudioMode) => StudioGenerationState;
  /** Legacy text-mode projection used by gallery and other non-studio pages. */
  task?: ImageTask;
  busy: boolean;
  startedAt?: number;
  resultUrls: string[];
  error?: string;
  galleryRevision: number;
  startGeneration: (input: StartGenerationInput) => Promise<ImageTask>;
  refreshTasks: () => Promise<ImageTask | undefined>;
};

export const GenerationContext = createContext<GenerationContextValue | null>(null);

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (!context) throw new Error("useGeneration must be used within GenerationProvider");
  return context;
}
