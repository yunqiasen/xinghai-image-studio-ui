import { describe, expect, it } from "vitest";

import type { GalleryItem } from "@/lib/storage/local-session";

import * as galleryActions from "./gallery-actions";

const { buildGalleryStudioRouteState } = galleryActions;

const item: GalleryItem = {
  id: "gallery-1",
  url: "/p/img/task-1/0?exp=1&sig=test",
  prompt: "一只蓝色陶瓷杯，商业产品摄影",
  mode: "text",
  createdAt: "2026-07-25T10:00:00Z",
  sourceStatus: "available",
};

describe("gallery studio actions", () => {
  it("opens a work in image-to-image with the original prompt", () => {
    expect(buildGalleryStudioRouteState(item, "variation")).toEqual({
      mode: "image",
      prompt: item.prompt,
      sourceImage: { url: item.url, name: "作品 1", sourceTaskId: "task-1", sourceImageIndex: 0 },
    });
  });

  it("opens local editing with the work as source and mask intent", () => {
    expect(buildGalleryStudioRouteState(item, "local-edit")).toEqual({
      mode: "image",
      prompt: "",
      sourceImage: { url: item.url, name: "作品 1", sourceTaskId: "task-1", sourceImageIndex: 0 },
      openMaskEditor: true,
    });
  });
});


describe("gallery availability", () => {
  it("moves unavailable works out of the primary image grid", () => {
    const partitionGalleryItems = (galleryActions as typeof galleryActions & {
      partitionGalleryItems?: (items: GalleryItem[], unavailableIds: ReadonlySet<string>) => { visible: GalleryItem[]; unavailable: GalleryItem[] };
    }).partitionGalleryItems;

    expect(partitionGalleryItems).toBeTypeOf("function");
    if (!partitionGalleryItems) return;

    const second = { ...item, id: "gallery-2", sourceStatus: "unavailable" as const };
    const third = { ...item, id: "gallery-3", sourceStatus: "unknown" as const };
    expect(partitionGalleryItems([item, second, third], new Set())).toEqual({
      visible: [item, third],
      unavailable: [second],
    });
    expect(partitionGalleryItems([item, third], new Set([third.id]))).toEqual({
      visible: [item],
      unavailable: [third],
    });
  });
});
