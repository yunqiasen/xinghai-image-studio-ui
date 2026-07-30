import type { ImageOperation, ImageOperationOptions, ImageSourceRole } from "@/lib/image-models/types";

export type ImageTaskStatus =
  | "queued"
  | "running"
  | "cancel_requested"
  | "succeeded"
  | "failed"
  | "cancelled";

export type ImageTaskSource = {
  id: string;
  role: ImageSourceRole;
  name: string;
  dataUrl: string;
  url: string;
};

export type ImageTaskResult = {
  url?: string;
  file_id?: string;
  error?: string;
  sourceStatus?: "available" | "unavailable" | "unknown";
  width?: number;
  height?: number;
  format?: "png" | "jpeg" | "gif" | "webp";
  hasAlpha?: boolean;
};

export type ImageTaskBlocker = {
  code?: string;
  detail?: string;
};

export type ImageTask = {
  id: string;
  conversationId?: string;
  turnId?: string;
  mode: string;
  operation?: ImageOperation;
  model?: string;
  options?: ImageOperationOptions;
  creditsCost?: number;
  prompt?: string;
  style?: string;
  background?: string;
  resolution?: "1K" | "2K" | "4K";
  parentTaskId?: string;
  parentImageIndex?: number;
  status: ImageTaskStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  count: number;
  queuePosition?: number;
  waitingReason?: string;
  blockers?: ImageTaskBlocker[];
  images: ImageTaskResult[];
  error?: string;
  cancelRequested?: boolean;
};

export type TaskSnapshot = {
  running?: number;
  maxRunning?: number;
  queued?: number;
  total?: number;
  activeSources?: Record<string, number>;
  finalStatuses?: Record<string, number>;
  retentionSeconds?: number;
};

export type CreateImageTaskInput = {
  taskId: string;
  conversationId: string;
  turnId: string;
  mode: string;
  operation: ImageOperation;
  options?: ImageOperationOptions;
  prompt: string;
  model: string;
  count: number;
  size: string;
  quality: string;
  sourceImages: ImageTaskSource[];
  style?: string;
  background?: string;
  resolution?: "1K" | "2K" | "4K";
  parentTaskId?: string;
  parentImageIndex?: number;
};

export type ImageTaskPayload = {
  task: ImageTask;
  snapshot: TaskSnapshot;
};

export type ImageTaskListPayload = {
  items: ImageTask[];
  snapshot: TaskSnapshot;
};
