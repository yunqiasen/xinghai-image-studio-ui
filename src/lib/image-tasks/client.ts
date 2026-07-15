import type { CreateImageTaskInput, ImageTaskListPayload, ImageTaskPayload } from "./types";

async function taskRequest<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.message || payload?.error || `请求失败 HTTP ${response.status}`);
  }
  return payload as T;
}

export function createImageTask(input: CreateImageTaskInput) {
  return taskRequest<ImageTaskPayload>("/api/image/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listImageTasks() {
  return taskRequest<ImageTaskListPayload>("/api/image/tasks", { method: "GET" });
}

export function cancelImageTask(id: string) {
  return taskRequest<ImageTaskPayload>(`/api/image/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
}
