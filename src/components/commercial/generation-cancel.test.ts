import { describe, expect, it } from "vitest";

import type { ImageTask } from "@/lib/image-tasks/types";

import { cancelableImageTask } from "./generation-state";

const task: ImageTask = {
  id: "img_1", mode: "text", status: "running", createdAt: "2026-07-20T00:00:00Z", count: 1, images: [],
};

describe("generation cancellation", () => {
  it("only exposes a cancel action for active tasks", () => {
    expect(cancelableImageTask(task)).toBe(true);
    expect(cancelableImageTask({ ...task, status: "succeeded" })).toBe(false);
  });
});
