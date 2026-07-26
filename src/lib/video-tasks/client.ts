import { commercialJson } from "@/lib/commercial-api/request";

import type { CreateVideoTaskInput, VideoModel, VideoTask } from "./types";

export async function listVideoModels() {
  const payload = await commercialJson<{ ok: true; items: VideoModel[] }>("/api/models?type=video", { method: "GET" });
  return payload.items;
}

export async function createVideoTask(input: CreateVideoTaskInput) {
  const payload = await commercialJson<{ ok: true; task: VideoTask }>("/api/video/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.task;
}

export async function listVideoTasks() {
  const payload = await commercialJson<{ ok: true; items: VideoTask[] }>("/api/video/tasks", { method: "GET" });
  return payload.items;
}

export async function getVideoTask(id: string) {
  const payload = await commercialJson<{ ok: true; task: VideoTask }>(`/api/video/tasks/${encodeURIComponent(id)}`, { method: "GET" });
  return payload.task;
}
