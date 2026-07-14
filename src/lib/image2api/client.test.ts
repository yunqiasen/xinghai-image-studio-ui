import { afterEach, describe, expect, it, vi } from "vitest";

import { submitImageGeneration } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("submitImageGeneration", () => {
  it("posts the commercial studio payload to the documented sync image API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      taskId: "img_123",
      imageUrls: ["/p/img/img_123/0", "/p/img/img_123/1"],
      creditsCost: 2,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await submitImageGeneration({
      mode: "text",
      prompt: "星空",
      n: 2,
      size: "1248x1248",
      reference_images: [],
    });

    expect(response.imageUrls).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledWith("/api/image/generate", expect.objectContaining({
      method: "POST",
      credentials: "include",
    }));
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({ mode: "text", prompt: "星空", n: 2 });
  });

  it("surfaces the backend Chinese message on generation failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      code: "image_timeout",
      message: "图片生成超过等待时间，积分已退回",
    }), { status: 504, headers: { "Content-Type": "application/json" } })));

    await expect(submitImageGeneration({ mode: "text", prompt: "星空" }))
      .rejects.toThrow("图片生成超过等待时间，积分已退回");
  });
});
