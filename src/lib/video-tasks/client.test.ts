import { afterEach, describe, expect, it, vi } from "vitest";

import { createVideoTask, getVideoTask, listVideoModels, listVideoTasks } from "./client";

const task = {
  id: "vid_123",
  model: "Agnes-Video-V2.0",
  mode: "text_to_video",
  prompt: "猫在雨夜奔跑",
  optimizedPrompt: "猫在雨夜奔跑",
  aspectRatio: "16:9",
  resolution: "1080p",
  requestedSeconds: 5,
  seconds: 5,
  numFrames: 121,
  frameRate: 24,
  motion: "balanced",
  creditCost: 5,
  status: "queued",
  progress: 0,
  createdAt: "2026-07-17T16:00:00+08:00",
  updatedAt: "2026-07-17T16:00:00+08:00",
};

afterEach(() => vi.unstubAllGlobals());

describe("video task client", () => {
  it("loads runtime-ready models from the documented catalog", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, items: [{
      id: "Agnes-Video-V2.0",
      slug: "Agnes-Video-V2.0",
      name: "Agnes-Video-V2.0",
      type: "video",
      runtimeReady: true,
      capabilities: {
        input_modes: ["text", "image"], output_modes: ["video"], async: true,
        resolutions: ["480p", "720p", "1080p"], aspect_ratios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
        durations: [{ seconds: 5, num_frames: 121, frame_rate: 24 }],
      },
      pricing: { unit: "credits", duration_costs: { "5": 5 } },
    }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listVideoModels()).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/models?type=video", expect.objectContaining({ credentials: "include" }));
  });

  it("creates, lists, and reads the current user's video tasks", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, task }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, items: [task] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, task }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await createVideoTask({
      model: "Agnes-Video-V2.0", prompt: task.prompt, optimizedPrompt: task.optimizedPrompt,
      aspectRatio: "16:9", resolution: "1080p", duration: 5, motion: "balanced",
    });
    await listVideoTasks();
    await getVideoTask("vid_123");

    expect(fetchMock.mock.calls.map(([path, options]) => [path, (options as RequestInit).method])).toEqual([
      ["/api/video/tasks", "POST"],
      ["/api/video/tasks", "GET"],
      ["/api/video/tasks/vid_123", "GET"],
    ]);
  });
});
