import { afterEach, describe, expect, it, vi } from "vitest";

import { cutoutImage, localMaskEdit, replaceImageBackground } from "./client";

afterEach(() => vi.unstubAllGlobals());

function pngFile(name: string) {
  return new File([name], name, { type: "image/png" });
}

describe("local image operation client", () => {
  it("connects cutout, background replacement, and local mask repair multipart APIs", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(new Blob(["result"], { type: "image/png" }), {
      status: 200,
      headers: { "Content-Type": "image/png" },
    })));
    vi.stubGlobal("fetch", fetchMock);

    await cutoutImage(pngFile("source.png"), { tolerance: 34, feather: 22 });
    await replaceImageBackground(pngFile("subject.png"), pngFile("background.png"), { autoCutout: true });
    await localMaskEdit(pngFile("source.png"), pngFile("mask.png"), { radius: 5 });

    expect(fetchMock.mock.calls.map(([path]) => path)).toEqual([
      "/api/image/cutout",
      "/api/image/background-replace",
      "/api/image/local-mask-edit",
    ]);
    const cutoutForm = (fetchMock.mock.calls[0][1] as RequestInit).body as FormData;
    const backgroundForm = (fetchMock.mock.calls[1][1] as RequestInit).body as FormData;
    const maskForm = (fetchMock.mock.calls[2][1] as RequestInit).body as FormData;
    expect(cutoutForm.get("image")).toBeInstanceOf(File);
    expect(cutoutForm.get("tolerance")).toBe("34");
    expect(backgroundForm.get("foreground")).toBeInstanceOf(File);
    expect(backgroundForm.get("background")).toBeInstanceOf(File);
    expect(backgroundForm.get("auto_cutout")).toBe("true");
    expect(maskForm.get("mask")).toBeInstanceOf(File);
    expect(maskForm.get("radius")).toBe("5");
  });
});
