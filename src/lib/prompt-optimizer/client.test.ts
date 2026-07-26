import { afterEach, describe, expect, it, vi } from "vitest";

import { optimizePrompt } from "./client";

afterEach(() => vi.unstubAllGlobals());

describe("prompt optimizer client", () => {
  it("uses the generic documented workflow endpoint with image context", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      originalPrompt: "猫奔跑",
      optimizedPrompt: "电影感雨夜中的猫快速奔跑",
      profile: "image_to_video",
      profileVersion: 3,
      fallback: false,
      visionFallback: false,
      status: "optimized",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(optimizePrompt({
      profile: "image_to_video",
      prompt: "猫奔跑",
      duration: 10,
      resolution: "1080p",
      motion: "balanced",
      sourceImage: "data:image/png;base64,AA==",
    })).resolves.toMatchObject({ optimizedPrompt: "电影感雨夜中的猫快速奔跑" });

    expect(fetchMock).toHaveBeenCalledWith("/api/prompt/optimize", expect.objectContaining({
      method: "POST",
      credentials: "include",
    }));
    expect(JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))).toMatchObject({
      profile: "image_to_video",
      sourceImage: "data:image/png;base64,AA==",
      duration: 10,
    });
  });
});
