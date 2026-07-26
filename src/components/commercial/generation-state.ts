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

function stableImageLocation(url: string | undefined) {
  return url?.split("?", 1)[0] || "";
}

function isRepeatedCompletedTask(current: ImageTask | undefined, next: ImageTask) {
  if (!current || current.id !== next.id || current.status !== "succeeded" || next.status !== "succeeded") return false;
  if (current.images.length !== next.images.length) return false;
  return current.images.every((image, index) => {
    const candidate = next.images[index];
    return candidate
      && stableImageLocation(image.url) === stableImageLocation(candidate.url)
      && image.file_id === candidate.file_id
      && image.error === candidate.error
      && image.sourceStatus === candidate.sourceStatus;
  });
}

export function updateGenerationState(states: StudioGenerationStates, task: ImageTask): StudioGenerationStates {
  if (!isStudioMode(task.mode)) return states;
  const current = states[task.mode];
  if (isRepeatedCompletedTask(current.task, task)) return states;
  if (current.task && current.task.id !== task.id) {
    const currentCreatedAt = Date.parse(current.task.createdAt);
    const nextCreatedAt = Date.parse(task.createdAt);
    if (Number.isFinite(currentCreatedAt) && Number.isFinite(nextCreatedAt) && nextCreatedAt < currentCreatedAt) {
      return states;
    }
  }
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

export function cancelableImageTask(task: ImageTask | null | undefined): boolean {
  return isActiveImageTask(task);
}

export function isAnyGenerationActive(states: StudioGenerationStates): boolean {
  return studioModes.some((mode) => states[mode].starting || isActiveImageTask(states[mode].task));
}
