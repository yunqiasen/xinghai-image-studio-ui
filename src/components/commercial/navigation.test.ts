import { describe, expect, it } from "vitest";

import { getCommercialNavigation } from "./navigation";

describe("commercial navigation", () => {
  it("places soul gallery between works and credits in both languages", () => {
    expect(getCommercialNavigation("zh-CN").map((item) => item.label)).toEqual([
      "首页",
      "创作",
      "作品",
      "灵魂画廊",
      "积分",
      "我的",
    ]);
    expect(getCommercialNavigation("en-US").map((item) => item.label)).toEqual([
      "Home",
      "Create",
      "Works",
      "Soul Gallery",
      "Credits",
      "Account",
    ]);
    expect(getCommercialNavigation("en-US").find((item) => item.label === "Soul Gallery")?.to).toBe("/soul-gallery");
  });
});
