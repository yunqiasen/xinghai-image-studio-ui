import { afterEach, describe, expect, it, vi } from "vitest";

import { createImageTask, listImageTasks } from "./client";

const queuedTask = {
  id: "img_123",
  conversationId: "commercial-studio",
  turnId: "turn_123",
  mode: "text",
  status: "queued" as const,
  createdAt: "2026-07-15T08:00:00+08:00",
  count: 2,
  images: [{}, {}],
};

afterEach(() => vi.unstubAllGlobals());

describe("commercial asynchronous image task client", () => {
  it("creates a documented cookie-session task with source images", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ task: queuedTask, snapshot: {} }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createImageTask({
      taskId: "web_123",
      conversationId: "commercial-studio",
      turnId: "turn_123",
      mode: "edit",
      prompt: "保留人物，替换背景",
      model: "gpt-image-2",
      count: 2,
      size: "1248x1248",
      quality: "",
      sourceImages: [{ id: "ref-1", role: "image", name: "ref.png", dataUrl: "data:image/png;base64,AA==", url: "" }],
    })).resolves.toMatchObject({ task: { id: "img_123" } });

    expect(fetchMock).toHaveBeenCalledWith("/api/image/tasks", expect.objectContaining({ method: "POST", credentials: "include" }));
    const body = JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body));
    expect(body).toMatchObject({ conversationId: "commercial-studio", mode: "edit", count: 2 });
    expect(body.sourceImages[0]).toMatchObject({ role: "image", name: "ref.png" });
  });

  it("restores the current user's recent tasks from the list endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [queuedTask], snapshot: { queued: 1 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listImageTasks()).resolves.toMatchObject({ items: [{ id: "img_123" }] });
    expect(fetchMock).toHaveBeenCalledWith("/api/image/tasks", expect.objectContaining({ method: "GET", credentials: "include" }));
  });

  it("surfaces the backend Chinese task error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, message: "图片任务排队已满" }), { status: 503 })));
    await expect(listImageTasks()).rejects.toThrow("图片任务排队已满");
  });
});
