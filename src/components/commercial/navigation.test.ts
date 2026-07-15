import { describe, expect, it } from "vitest";

import { commercialNavigation } from "./navigation";

describe("commercial navigation", () => {
  it("places soul gallery between works and credits", () => {
    expect(commercialNavigation.map((item) => item.label)).toEqual([
      "首页",
      "创作",
      "作品",
      "灵魂画廊",
      "积分",
      "我的",
    ]);
    expect(commercialNavigation.find((item) => item.label === "灵魂画廊")?.to).toBe("/soul-gallery");
  });
});
