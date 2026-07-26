import { describe, expect, it } from "vitest";

import { createInitialStudioSettings } from "./studio-settings-state";

describe("studio settings state", () => {
  it("creates an independent settings snapshot for every image category", () => {
    const first = createInitialStudioSettings();
    const second = createInitialStudioSettings();

    first.text.aspectRatio = "16:9";
    first.image.count = 4;
    first.image.model = "gpt-image-2";

    expect(second.text.aspectRatio).toBe("1:1");
    expect(second.image.count).toBe(1);
    expect(first.text).not.toBe(second.text);
    expect(first.image).not.toBe(second.image);
    expect(first["remove-bg"]).not.toBe(second["remove-bg"]);
  });
});
