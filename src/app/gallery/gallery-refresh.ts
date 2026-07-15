import type { ImageTaskStatus } from "@/lib/image-tasks/types";

export function shouldPollGallery(userId: string | null | undefined, status: ImageTaskStatus | undefined) {
  return Boolean(userId && (status === "queued" || status === "running" || status === "cancel_requested"));
}

export function shouldResetGalleryForUser(previousUserId: string | null, nextUserId: string | null) {
  return previousUserId !== nextUserId;
}
