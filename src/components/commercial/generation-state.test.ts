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
});
