import { describe, expect, it } from "vitest";

import { availableImageOperations, imageModelsForOperation, selectImageModel } from "./selection";
import type { ImageModel } from "./types";

const models: ImageModel[] = [
  {
    id: "gpt-image-2",
    slug: "gpt-image-2",
    name: "GPT Image 2.0",
    type: "image",
    runtimeReady: true,
    capabilities: {
      operations: ["generate", "img2img", "inpaint"],
      source_roles: ["image", "mask"],
      resolutions: ["1K", "2K"],
      qualities: ["standard", "high"],
      max_source_images: 4,
      max_outputs: 4,
      mask_mode: "native_parent_or_post_composite",
    },
    pricing: { unit: "credits", default_cost: 1 },
  },
  {
    id: "agnes",
    slug: "agnes",
    name: "Agnes",
    type: "image",
    runtimeReady: true,
    capabilities: {
      operations: ["generate", "face_swap", "variation"],
      source_roles: ["image", "face", "mask"],
      resolutions: ["1K", "2K", "4K"],
      qualities: ["standard", "medium", "high"],
      max_source_images: 4,
      max_outputs: 4,
      mask_mode: "post_composite",
    },
    pricing: { unit: "credits", default_cost: 1 },
  },
];

describe("image model selection", () => {
  it("filters models by operation and keeps a valid current selection", () => {
    expect(imageModelsForOperation(models, "face_swap").map((model) => model.id)).toEqual(["agnes"]);
    expect(selectImageModel(models, "face_swap", "gpt-image-2")?.id).toBe("agnes");
    expect(selectImageModel(models, "generate", "gpt-image-2")?.id).toBe("gpt-image-2");
  });

  it("builds the union used to disable globally unavailable actions", () => {
    expect(availableImageOperations(models)).toEqual(expect.arrayContaining(["generate", "face_swap", "variation"]));
    expect(availableImageOperations(models)).not.toContain("upscale");
    expect(availableImageOperations(models)).not.toContain("restore_photo");
  });
});
