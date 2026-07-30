import { describe, expect, it } from "vitest";

import { estimateImageCredits } from "./pricing";
import type { ImageModel } from "./types";

const model: ImageModel = {
  id: "agnes",
  slug: "agnes",
  name: "Agnes",
  type: "image",
  runtimeReady: true,
  capabilities: {
    operations: ["generate", "face_swap", "batch_consistency"],
    source_roles: ["image", "face", "mask"],
    resolutions: ["1K", "2K", "4K"],
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

describe("image operation pricing", () => {
  it("uses operation price plus resolution and quality surcharges per output", () => {
    expect(estimateImageCredits(model, "face_swap", "2K", "high", 1)).toBe(5);
    expect(estimateImageCredits(model, "generate", "1K", "standard", 4)).toBe(4);
  });
});
