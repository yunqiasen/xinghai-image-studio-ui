import { describe, expect, it } from "vitest";

import {
  GENERATED_IMAGE_CLASS_NAME,
  STUDIO_WORKSPACE_GRID_CLASS_NAME,
} from "./page";

describe("studio result layout", () => {
  it("shows generated images without forced square cropping", () => {
    expect(GENERATED_IMAGE_CLASS_NAME).toContain("object-contain");
    expect(GENERATED_IMAGE_CLASS_NAME).not.toContain("object-cover");
    expect(GENERATED_IMAGE_CLASS_NAME).not.toContain("aspect-square");
  });

  it("keeps the editor center column wide enough for image preview", () => {
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("minmax(0,1fr)");
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("280px");
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("300px");
  });
});
