export type ImageTaskStatus =
  | "queued"
  | "running"
  | "cancel_requested"
  | "succeeded"
  | "failed"
  | "cancelled";

export type ImageTaskSource = {
  id: string;
  role: "image" | "mask";
  name: string;
  dataUrl: string;
  url: string;
};

export type ImageTaskResult = {
  url?: string;
  file_id?: string;
  error?: string;
};

export type ImageTask = {
  id: string;
  conversationId?: string;
  turnId?: string;
  mode: string;
  status: ImageTaskStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  count: number;
  queuePosition?: number;
  waitingReason?: string;
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
  prompt: string;
  model: string;
  count: number;
  size: string;
  quality: string;
  sourceImages: ImageTaskSource[];
};

export type ImageTaskPayload = {
  task: ImageTask;
  snapshot: TaskSnapshot;
};

export type ImageTaskListPayload = {
  items: ImageTask[];
  snapshot: TaskSnapshot;
};
