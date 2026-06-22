export type NormalizedImageResponse = {
  ok: boolean;
  taskId?: string;
  imageUrls: string[];
  status: "queued" | "running" | "completed" | "failed";
  error?: string;
  raw?: unknown;
};

type RawImageItem = {
  url?: unknown;
  b64_json?: unknown;
};

type RawImageResponse = {
  data?: RawImageItem[];
  imageUrls?: unknown[];
  image_urls?: unknown[];
  url?: unknown;
  imageUrl?: unknown;
  task_id?: unknown;
  taskId?: unknown;
  error?: unknown;
};

function errorMessage(error: unknown) {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error && "message" in error) return String((error as { message: unknown }).message);
  return String(error);
}

export function normalizeImageResponse(raw: RawImageResponse): NormalizedImageResponse {
  const imageUrls: string[] = [];
  if (Array.isArray(raw?.data)) {
    for (const item of raw.data) {
      if (item?.url) imageUrls.push(String(item.url));
      if (item?.b64_json) imageUrls.push(`data:image/png;base64,${item.b64_json}`);
    }
  }
  if (Array.isArray(raw?.imageUrls)) imageUrls.push(...raw.imageUrls.map(String));
  if (Array.isArray(raw?.image_urls)) imageUrls.push(...raw.image_urls.map(String));
  if (raw?.url) imageUrls.push(String(raw.url));
  if (raw?.imageUrl) imageUrls.push(String(raw.imageUrl));

  const uniqueUrls = Array.from(new Set(imageUrls.filter(Boolean)));
  const taskId = raw?.task_id || raw?.taskId;
  const status = uniqueUrls.length > 0 ? "completed" : taskId ? "queued" : "failed";

  return {
    ok: uniqueUrls.length > 0 || Boolean(taskId),
    taskId: taskId ? String(taskId) : undefined,
    imageUrls: uniqueUrls,
    status,
    error: errorMessage(raw?.error),
    raw,
  };
}
