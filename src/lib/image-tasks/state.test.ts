import { describe, expect, it } from "vitest";

import { didReachTerminalStatus, isActiveImageTask, selectStudioTask, taskErrorMessage, taskImageUrls } from "./state";
import type { ImageTask } from "./types";

function task(overrides: Partial<ImageTask>): ImageTask {
  return {
    id: "img_default",
    conversationId: "commercial-studio",
    turnId: "turn_default",
    mode: "text",
    status: "queued",
    createdAt: "2026-07-15T08:00:00+08:00",
    count: 1,
    images: [{}],
    ...overrides,
  };
}

describe("commercial generation state", () => {
  it("restores the newest active studio task before an older result", () => {
    const selected = selectStudioTask([
      task({ id: "img_old", status: "succeeded", createdAt: "2026-07-15T08:00:00+08:00", images: [{ url: "/old.png" }] }),
      task({ id: "img_running", status: "running", createdAt: "2026-07-15T08:01:00+08:00" }),
      task({ id: "img_other", conversationId: "another-client", createdAt: "2026-07-15T08:02:00+08:00" }),
    ]);
    expect(selected?.id).toBe("img_running");
    expect(isActiveImageTask(selected)).toBe(true);
  });

  it("restores every successful image URL after route remount", () => {
    const selected = selectStudioTask([
      task({ status: "succeeded", images: [{ url: "/one.png" }, { file_id: "file-2" }, { url: "/three.png" }] }),
    ]);
    expect(taskImageUrls(selected)).toEqual(["/one.png", "/three.png"]);
  });

  it("refreshes user credits after success, failure, or cancellation reaches a terminal state", () => {
    expect(didReachTerminalStatus("running", "succeeded")).toBe(true);
    expect(didReachTerminalStatus("running", "failed")).toBe(true);
    expect(didReachTerminalStatus("queued", "cancelled")).toBe(true);
    expect(didReachTerminalStatus("running", "cancel_requested")).toBe(false);
    expect(didReachTerminalStatus("failed", "failed")).toBe(false);
  });

  it("keeps a terminal task error visible", () => {
    expect(taskErrorMessage(task({ status: "failed", error: "图片生成超时，积分已退回" }))).toBe("图片生成超时，积分已退回");
    expect(taskErrorMessage(task({ status: "cancelled" }))).toBe("任务已取消，积分已退回");
  });
});
