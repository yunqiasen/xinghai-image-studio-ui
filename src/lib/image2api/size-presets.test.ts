import { describe, expect, it } from "vitest";

import {
  sizeFromStudioPreset,
  studioAspectRatioOptions,
} from "./size-presets";

describe("studio image size presets", () => {
  it("supports square, horizontal and vertical aspect ratios", () => {
    const ratios = studioAspectRatioOptions.map((item) => item.value);

    expect(ratios).toEqual([
      "1:1",
      "4:3",
      "3:4",
      "3:2",
      "2:3",
      "16:9",
      "9:16",
      "21:9",
      "2:1",
      "1:2",
      "4:5",
      "5:4",
    ]);
    expect(sizeFromStudioPreset("2:3", "1k")).toBe("1024x1536");
    expect(sizeFromStudioPreset("1:2", "4k")).toBe("1920x3840");
  });
});
