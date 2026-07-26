import { describe, expect, it, vi } from "vitest";

import { assetToFile, blobToDataUrl, prepareImageTaskAssets } from "./local-image-runtime";

describe("local image runtime", () => {
  it("converts a data URL or signed asset URL into a multipart File", async () => {
    await expect(assetToFile({ id: "a", name: "source.png", dataUrl: "data:image/png;base64,AA==", url: "", role: "image" })).resolves.toMatchObject({ name: "source.png", type: "image/png" });

    const fetchMock = vi.fn().mockResolvedValue(new Response(new Blob(["pixels"], { type: "image/webp" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(assetToFile({ id: "b", name: "remote.webp", dataUrl: "", url: "/p/img/task/0", role: "image" })).resolves.toMatchObject({ name: "remote.webp", type: "image/webp" });
    expect(fetchMock).toHaveBeenCalledWith("/p/img/task/0", { credentials: "include" });
  });

  it("turns operation output into a reusable data URL", async () => {
    await expect(blobToDataUrl(new Blob(["pixels"], { type: "image/png" }))).resolves.toMatchObject({});
    await expect(blobToDataUrl(new Blob(["pixels"], { type: "image/png" }))).resolves.toMatch(/^data:image\/png;base64,/);
  });

  it("materializes a relative gallery asset before sending it to the image task API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(new Blob(["pixels"], { type: "image/png" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(prepareImageTaskAssets([
      { id: "gallery", name: "作品.png", dataUrl: "", url: "/p/img/task/0?sig=test", role: "image" },
    ])).resolves.toEqual([
      expect.objectContaining({
        id: "gallery",
        url: "/p/img/task/0?sig=test",
        dataUrl: "data:image/png;base64,cGl4ZWxz",
      }),
    ]);
    expect(fetchMock).toHaveBeenCalledWith("/p/img/task/0?sig=test", { credentials: "include" });
  });
});
