import { afterEach, describe, expect, it, vi } from "vitest";

import { listImageModels } from "./client";

afterEach(() => vi.unstubAllGlobals());

describe("image model catalog client", () => {
  it("loads runtime-ready image capabilities and dynamic pricing", async () => {
    const model = {
      id: "Agnes-Image-2.1-Flash",
      slug: "Agnes-Image-2.1-Flash",
      name: "Agnes Image 2.1 Flash",
      type: "image",
      runtimeReady: true,
      capabilities: {
        operations: ["generate", "img2img", "face_swap"],
        source_roles: ["image", "face", "mask"],
        resolutions: ["1K", "2K"],
        qualities: ["standard", "high"],
        max_source_images: 4,
        max_outputs: 4,
        mask_mode: "post_composite",
      },
      pricing: {
        unit: "credits",
        default_cost: 1,
        operation_costs: { face_swap: 3 },
        resolution_surcharges: { "2K": 1 },
        quality_surcharges: { high: 1 },
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, items: [model] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listImageModels()).resolves.toEqual([model]);
    expect(fetchMock).toHaveBeenCalledWith("/api/models?type=image", expect.objectContaining({ method: "GET", credentials: "include" }));
  });
});
