import { describe, expect, it } from "vitest";

import { aspectRatioCss, formatGenerationElapsed, resultGridClass } from "./preview-layout";

describe("studio preview layout", () => {
  it("converts studio ratios to CSS aspect ratios", () => {
    expect(aspectRatioCss("1:1")).toBe("1 / 1");
    expect(aspectRatioCss("16:9")).toBe("16 / 9");
    expect(aspectRatioCss("9:16")).toBe("9 / 16");
  });

  it("uses a single canvas for one result and a two-column grid for multiple results", () => {
    expect(resultGridClass(1)).toContain("grid-cols-1");
    expect(resultGridClass(2)).toContain("sm:grid-cols-2");
    expect(resultGridClass(3)).toContain("sm:grid-cols-2");
    expect(resultGridClass(4)).toContain("sm:grid-cols-2");
  });

  it("formats generation wait time as minutes and seconds", () => {
    expect(formatGenerationElapsed(0)).toBe("00:00");
    expect(formatGenerationElapsed(65_000)).toBe("01:05");
  });
});
