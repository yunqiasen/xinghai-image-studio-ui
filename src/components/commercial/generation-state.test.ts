import { describe, expect, it } from "vitest";

import type { ImageTask } from "@/lib/image-tasks/types";

import { createInitialGenerationStates, updateGenerationState } from "./generation-state";

const task = (mode: string, status: ImageTask["status"] = "succeeded") => ({
  id: `${mode}-task`, mode, status, createdAt: "2026-07-16T00:00:00.000Z",
  startedAt: "2026-07-16T00:00:00.000Z", finishedAt: "2026-07-16T00:01:00.000Z",
  count: 1,
  images: mode === "text" ? [{ url: "text.png" }] : [],
  error: "",
}) as ImageTask;

describe("generation state by studio mode", () => {
  it("keeps each mode isolated", () => {
    const next = updateGenerationState(createInitialGenerationStates(), task("text"));
    expect(next.text.task?.id).toBe("text-task");
    expect(next.image.task).toBeUndefined();
    expect(next.text.resultUrls).toEqual(["text.png"]);
    expect(next.image.resultUrls).toEqual([]);
  });

  it("updates only the task mode", () => {
    const states = updateGenerationState(createInitialGenerationStates(), task("image", "running"));
    expect(states.image.task?.status).toBe("running");
    expect(states.text.task).toBeUndefined();
  });

  it("restores legacy edit tasks in the image-to-image preview", () => {
    const legacyEdit = { ...task("edit"), images: [{ url: "edited.png" }] };
    const states = updateGenerationState(createInitialGenerationStates(), legacyEdit);

    expect(states.image.task?.id).toBe("edit-task");
    expect(states.image.resultUrls).toEqual(["edited.png"]);
    expect(states.edit.task).toBeUndefined();
  });

  it("keeps the rendered result URL stable when SSE only rotates its signature", () => {
    const initial = {
      ...task("text"),
      images: [{ url: "/p/img/text-task/0?exp=100&sig=old", sourceStatus: "available" as const }],
    };
    const rotated = {
      ...initial,
      images: [{ url: "/p/img/text-task/0?exp=200&sig=new", sourceStatus: "available" as const }],
    };

    const withResult = updateGenerationState(createInitialGenerationStates(), initial);
    const afterHeartbeat = updateGenerationState(withResult, rotated);

    expect(afterHeartbeat.text.resultUrls).toEqual(["/p/img/text-task/0?exp=100&sig=old"]);
  });

  it("ignores stale SSE events for an older task in the same category", () => {
    const newer = { ...task("text", "running"), id: "newer", createdAt: "2026-07-16T02:00:00.000Z" };
    const older = { ...task("text", "succeeded"), id: "older", createdAt: "2026-07-16T01:00:00.000Z" };

    const withNewer = updateGenerationState(createInitialGenerationStates(), newer);
    const afterStaleEvent = updateGenerationState(withNewer, older);

    expect(afterStaleEvent.text.task?.id).toBe("newer");
    expect(afterStaleEvent.text.task?.status).toBe("running");
  });
});
