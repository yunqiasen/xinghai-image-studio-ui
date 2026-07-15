import type { ImageTask, ImageTaskStatus } from "./types";

export const COMMERCIAL_STUDIO_CONVERSATION_ID = "commercial-studio";
const activeStatuses = new Set<ImageTaskStatus>(["queued", "running", "cancel_requested"]);
const terminalStatuses = new Set<ImageTaskStatus>(["succeeded", "failed", "cancelled"]);

export function isActiveImageTask(task: ImageTask | null | undefined) {
  return Boolean(task && activeStatuses.has(task.status));
}

export function didReachTerminalStatus(previous: ImageTaskStatus | undefined, current: ImageTaskStatus) {
  return Boolean(previous && previous !== current && terminalStatuses.has(current));
}

export function selectStudioTask(tasks: ImageTask[]) {
  const studioTasks = tasks
    .filter((task) => task.conversationId === COMMERCIAL_STUDIO_CONVERSATION_ID)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  return studioTasks.find(isActiveImageTask) || studioTasks[0];
}

export function taskImageUrls(task: ImageTask | null | undefined) {
  if (task?.status !== "succeeded") return [];
  return task.images.flatMap((image) => image.url ? [image.url] : []);
}

export function taskErrorMessage(task: ImageTask | null | undefined) {
  if (!task) return undefined;
  if (task.status === "failed") return task.error || "图片生成失败，请稍后重试";
  if (task.status === "cancelled") return "任务已取消，积分已退回";
  return undefined;
}
