import type { GalleryItem } from "@/lib/storage/local-session";
import type { StudioRouteState } from "@/app/studio/route-prompt";

export type GalleryStudioAction = "variation" | "local-edit";

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
  };
  if (action === "local-edit") {
    return {
      mode: "edit",
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
