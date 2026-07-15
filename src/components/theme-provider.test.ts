import { describe, expect, it } from "vitest";

import { nextThemeMode, normalizeThemeMode, themeOptions } from "./theme-modes";

describe("commercial theme modes", () => {
  it("offers light, dark, and colorful themes in the visible order", () => {
    expect(themeOptions.map((option) => [option.value, option.label])).toEqual([
      ["light", "浅色"],
      ["dark", "暗色"],
      ["colorful", "彩色"],
    ]);
  });

  it("migrates the legacy graphite value and keeps colorful as the default", () => {
    expect(normalizeThemeMode("graphite")).toBe("colorful");
    expect(normalizeThemeMode("dark")).toBe("dark");
    expect(normalizeThemeMode(null)).toBe("colorful");
  });

  it("cycles through all three commercial themes", () => {
    expect(nextThemeMode("light")).toBe("dark");
    expect(nextThemeMode("dark")).toBe("colorful");
    expect(nextThemeMode("colorful")).toBe("light");
  });
});
