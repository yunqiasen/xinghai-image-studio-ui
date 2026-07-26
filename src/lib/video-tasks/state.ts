import type { VideoModel, VideoStudioMode, VideoTask } from "./types";

const activeStatuses = new Set<VideoTask["status"]>(["queued", "submitting", "in_progress"]);

export function isActiveVideoTask(task: VideoTask | null | undefined) {
  return Boolean(task && activeStatuses.has(task.status));
}

export function modelsForVideoMode(models: VideoModel[], mode: VideoStudioMode) {
  const input = mode === "video-image" ? "image" : "text";
  return models.filter((model) => model.runtimeReady && model.capabilities.input_modes.includes(input));
}

export function latestVideoTaskForMode(tasks: VideoTask[], mode: VideoStudioMode) {
  const backendMode = mode === "video-image" ? "image_to_video" : "text_to_video";
  return tasks
    .filter((task) => task.mode === backendMode)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0];
}

export function videoTaskError(task: VideoTask | null | undefined) {
  if (task?.status !== "failed") return undefined;
  return task.error || "视频生成失败，请稍后重试";
}
