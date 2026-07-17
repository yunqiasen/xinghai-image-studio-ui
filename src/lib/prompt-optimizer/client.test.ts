import { afterEach, describe, expect, it, vi } from "vitest";
import { optimizePrompt } from "./client";

afterEach(() => vi.unstubAllGlobals());

describe("prompt optimizer client", () => {
  it("sends an explicit workflow profile and image context", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, optimizedPrompt: "优化结果", fallback: false })));
    vi.stubGlobal("fetch", fetchMock);
    await optimizePrompt({ profile: "image_to_video", prompt: "让人物转身", sourceImage: "data:image/png;base64,AA==", duration: 5, resolution: "1080p", motion: "balanced" });
    expect(fetchMock).toHaveBeenCalledWith("/api/prompt/optimize", expect.objectContaining({ method: "POST", credentials: "include" }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ profile: "image_to_video", sourceImage: "data:image/png;base64,AA==", duration: 5 });
  });
});
