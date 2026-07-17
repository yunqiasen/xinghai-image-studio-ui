import type { StudioMode } from "@/lib/billing/pricing";
import { isActiveImageTask, taskErrorMessage, taskImageUrls } from "@/lib/image-tasks/state";
import type { ImageTask } from "@/lib/image-tasks/types";

export type StudioGenerationState = {
  task?: ImageTask;
  starting: boolean;
  startedAt?: number;
  resultUrls: string[];
  error?: string;
};

export type StudioGenerationStates = Record<StudioMode, StudioGenerationState>;

export const studioModes: StudioMode[] = ["text", "image", "edit", "remove-bg", "upscale", "background", "batch"];

export function createInitialGenerationState(): StudioGenerationState {
  return { starting: false, resultUrls: [] };
}

export function createInitialGenerationStates(): StudioGenerationStates {
  return Object.fromEntries(studioModes.map((mode) => [mode, createInitialGenerationState()])) as StudioGenerationStates;
}

function isStudioMode(mode: string): mode is StudioMode {
  return studioModes.includes(mode as StudioMode);
}

export function updateGenerationState(states: StudioGenerationStates, task: ImageTask): StudioGenerationStates {
  if (!isStudioMode(task.mode)) return states;
  const current = states[task.mode];
  return {
    ...states,
    [task.mode]: {
      ...current,
      task,
      starting: false,
      startedAt: Date.parse(task.startedAt || task.createdAt) || current.startedAt,
      resultUrls: taskImageUrls(task),
      error: taskErrorMessage(task),
    },
  };
}

export function isAnyGenerationActive(states: StudioGenerationStates): boolean {
  return studioModes.some((mode) => states[mode].starting || isActiveImageTask(states[mode].task));
}
