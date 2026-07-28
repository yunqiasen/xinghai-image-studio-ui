import type { GalleryItem } from "@/lib/storage/local-session";
import type { StudioRouteState } from "@/app/studio/route-prompt";

export type GalleryStudioAction = "variation" | "local-edit";

function imageTaskContext(url: string): { sourceTaskId?: string; sourceImageIndex?: number } {
  try {
    const path = new URL(url, "http://xinghai.local").pathname;
    const match = path.match(/^\/p\/img\/([^/]+)\/(\d+)$/);
    if (!match) return {};
    return {
      sourceTaskId: decodeURIComponent(match[1]),
      sourceImageIndex: Number(match[2]),
    };
  } catch {
    return {};
  }
}

export function partitionGalleryItems(items: GalleryItem[], unavailableIds: ReadonlySet<string>) {
  const visible: GalleryItem[] = [];
  const unavailable: GalleryItem[] = [];
  for (const item of items) {
    (item.sourceStatus === "unavailable" || unavailableIds.has(item.id) ? unavailable : visible).push(item);
  }
  return { visible, unavailable };
}

export function buildGalleryStudioRouteState(
  item: GalleryItem,
  action: GalleryStudioAction,
  position = 1,
): StudioRouteState {
  const sourceImage = {
    url: item.url,
    name: `作品 ${Math.max(1, position)}`,
    ...imageTaskContext(item.url),
  };
  if (action === "local-edit") {
    return {
      mode: "image",
      prompt: "",
      sourceImage,
      openMaskEditor: true,
    };
  }
  return {
    mode: "image",
    prompt: item.prompt,
    sourceImage,
  };
}
