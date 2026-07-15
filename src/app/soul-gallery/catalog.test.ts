import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  filterSoulGallery,
  soulGalleryCatalog,
  soulGalleryCategories,
} from "./catalog";

const expectedTitles = [
  "霓虹雨夜",
  "星港远航",
  "未来车展海报",
  "冷月银发",
  "云端主城",
  "未来穹顶展厅",
  "玻璃拟态控制台",
  "深海巨鲸",
  "Ultra Luxury Perfume Portrait",
  "Oriental Dreamy Beauty Illustration",
  "Dreamy Oriental Emerald Beauty",
  "Exotic Dancer Charm",
  "Korean Idol Campus Portrait",
  "Cinematic Street Avant-Garde Portrait",
  "Lazy Red Dress Afternoon",
  "Future Minimal Sportswear",
  "Young American Woman Fashion Cover",
  "Fashion Model On Lens",
  "Cinematic Male Travel Poster",
];

describe("soul gallery catalog", () => {
  it("ships all 19 requested local templates with usable prompts and images", () => {
    expect(soulGalleryCatalog).toHaveLength(19);
    expect(soulGalleryCatalog.map((item) => item.title)).toEqual(expectedTitles);
    expect(new Set(soulGalleryCatalog.map((item) => item.id)).size).toBe(19);

    for (const item of soulGalleryCatalog) {
      expect(item.prompt.trim().length).toBeGreaterThan(20);
      expect(item.image.startsWith("/soul-gallery-assets/")).toBe(true);
      expect(item.width).toBeGreaterThan(0);
      expect(item.height).toBeGreaterThan(0);
      expect(fs.existsSync(path.join(process.cwd(), "public", item.image))).toBe(true);
    }
  });

  it("builds stable source counts and filter categories", () => {
    expect(soulGalleryCatalog.filter((item) => item.source === "imagic6")).toHaveLength(8);
    expect(soulGalleryCatalog.filter((item) => item.source === "imya")).toHaveLength(11);
    expect(soulGalleryCategories[0]).toBe("全部");
    expect(soulGalleryCategories).toContain("未来幻想");
    expect(soulGalleryCategories).toContain("时尚人像");
  });

  it("searches titles, prompt text and source while respecting category", () => {
    expect(filterSoulGallery(soulGalleryCatalog, "巨鲸", "全部").map((item) => item.title)).toEqual(["深海巨鲸"]);
    expect(filterSoulGallery(soulGalleryCatalog, "Dior perfume", "全部").map((item) => item.title)).toEqual(["Ultra Luxury Perfume Portrait"]);
    expect(filterSoulGallery(soulGalleryCatalog, "imya", "全部")).toHaveLength(11);
    expect(filterSoulGallery(soulGalleryCatalog, "", "未来幻想")).toHaveLength(4);
  });
});
