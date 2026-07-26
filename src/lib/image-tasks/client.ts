import type { CreateImageTaskInput, ImageTask, ImageTaskListPayload, ImageTaskPayload, TaskSnapshot } from "./types";

async function taskRequest<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({})) as T & { ok?: boolean; message?: string; error?: string | { message?: string } };
  const nestedError = payload.error && typeof payload.error === "object" ? payload.error.message : undefined;
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.message || nestedError || (typeof payload?.error === "string" ? payload.error : "") || `请求失败 HTTP ${response.status}`);
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

export function getImageTask(id: string) {
  return taskRequest<ImageTaskPayload>(`/api/image/tasks/${encodeURIComponent(id)}`, { method: "GET" });
}

export function cancelImageTask(id: string) {
  return taskRequest<ImageTaskPayload>(`/api/image/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export type ImageTaskStreamEvent =
  | { type: "init"; items: ImageTask[]; snapshot: TaskSnapshot }
  | { type: "task.upsert"; task: ImageTask; snapshot: TaskSnapshot };

export function decodeImageTaskStreamEvent(eventName: string, data: string): ImageTaskStreamEvent | undefined {
  try {
    const payload = JSON.parse(data) as { items?: ImageTask[]; task?: ImageTask; snapshot?: TaskSnapshot; type?: string };
    if (eventName === "init" && Array.isArray(payload.items)) {
      return { type: "init", items: payload.items, snapshot: payload.snapshot || {} };
    }
    if (payload.type === "task.upsert" && payload.task) {
      return { type: "task.upsert", task: payload.task, snapshot: payload.snapshot || {} };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function subscribeImageTaskStream(onEvent: (event: ImageTaskStreamEvent) => void, onError?: () => void) {
  if (typeof EventSource === "undefined") return () => undefined;
  const source = new EventSource("/api/image/tasks/stream", { withCredentials: true });
  const handle = (eventName: string) => (event: Event) => {
    const message = event as MessageEvent<string>;
    const decoded = decodeImageTaskStreamEvent(eventName, message.data);
    if (decoded) onEvent(decoded);
  };
  source.addEventListener("init", handle("init"));
  source.onmessage = handle("message");
  source.onerror = () => onError?.();
  return () => source.close();
}
