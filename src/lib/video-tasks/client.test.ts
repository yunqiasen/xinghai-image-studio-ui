import { afterEach, describe, expect, it, vi } from "vitest";
import { createVideoTask, getVideoTask, listVideoTasks } from "./client";

afterEach(() => vi.unstubAllGlobals());

describe("video client", () => {
  it("creates and reads tasks", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, task: { id: "v" } })));
    vi.stubGlobal("fetch", fetchMock);
    await createVideoTask({ model: "Agnes-Video-V2.0", prompt: "x", aspectRatio: "16:9", resolution: "1080p", duration: 5, motion: "balanced" });
    await getVideoTask("v");
    await listVideoTasks();
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/video/tasks", expect.objectContaining({ method: "POST", credentials: "include" }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/video/tasks/v", expect.anything());
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/video/tasks", expect.objectContaining({ credentials: "include" }));
  });
});
