import { describe, expect, it } from "vitest";

import { getCommercialNavigation } from "./navigation";

describe("commercial navigation", () => {
  it("places soul gallery between works and credits in both languages", () => {
    expect(getCommercialNavigation("zh-CN").map((item) => item.label)).toEqual([
      "首页",
      "图像创作",
      "视频创作",
      "音频创作",
      "作品",
      "灵魂画廊",
      "积分",
      "我的",
    ]);
    expect(getCommercialNavigation("en-US").map((item) => item.label)).toEqual([
      "Home",
      "Image Creation",
      "Video Creation",
      "Audio Creation",
      "Works",
      "Soul Gallery",
      "Credits",
      "Account",
    ]);
    const navigation = getCommercialNavigation("zh-CN");
    expect(navigation.find((item) => item.label === "图像创作")?.to).toBe("/studio");
    expect(navigation.find((item) => item.label === "视频创作")?.to).toBe("/video");
    expect(navigation.find((item) => item.label === "音频创作")?.to).toBe("/audio");
  });
});
