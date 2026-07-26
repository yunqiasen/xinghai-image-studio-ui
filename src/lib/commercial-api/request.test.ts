import { afterEach, describe, expect, it, vi } from "vitest";

import { CommercialApiError, commercialBlob, commercialJson } from "./request";

afterEach(() => vi.unstubAllGlobals());

describe("commercial API request", () => {
  it("extracts the documented nested video error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      error: { code: "model_unavailable", message: "视频模型暂不可用" },
    }), { status: 503, headers: { "Content-Type": "application/json" } })));

    const error = await commercialJson("/api/video/tasks").catch((reason) => reason);
    expect(error).toBeInstanceOf(CommercialApiError);
    expect(error).toMatchObject({ code: "model_unavailable", status: 503, message: "视频模型暂不可用" });
  });

  it("sends cookie credentials and leaves multipart content type to the browser", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(new Blob(["png"], { type: "image/png" }), {
      status: 200,
      headers: { "Content-Type": "image/png" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const body = new FormData();
    body.append("image", new File(["pixels"], "source.png", { type: "image/png" }));

    await expect(commercialBlob("/api/image/cutout", { method: "POST", body })).resolves.toBeInstanceOf(Blob);
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.credentials).toBe("include");
    expect(options.body).toBe(body);
    expect(new Headers(options.headers).has("Content-Type")).toBe(false);
  });
});
