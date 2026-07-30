import type { StudioMode } from "@/lib/billing/pricing";
import type { ImageSourceRole } from "@/lib/image-models/types";

import type { StudioAsset, StudioSettingsValue } from "./mode-settings";

export type ImageEditAction = StudioSettingsValue["imageEditAction"];

export function pasteTargetMode(mode: StudioMode): StudioMode {
  return mode === "text" ? "image" : mode;
}

export function auxiliaryRoleForEditAction(action: ImageEditAction): Extract<ImageSourceRole, "background" | "garment" | "face"> | undefined {
  if (action === "replace-background") return "background";
  if (action === "change-clothes") return "garment";
  if (action === "swap-face") return "face";
  return undefined;
}

export function normalizeImageEditAssets(assets: StudioAsset[], action: ImageEditAction): StudioAsset[] {
  const auxiliaryRole = auxiliaryRoleForEditAction(action);
  const main = assets.find((item) => item.role === "image");
  const auxiliary = auxiliaryRole ? assets.find((item) => item.role === auxiliaryRole) : undefined;
  const masks = assets.filter((item) => item.role === "mask").slice(-1);
  return [main, auxiliary, ...masks].filter((item): item is StudioAsset => Boolean(item));
}

export function mergeImageEditPastedAssets(previous: StudioAsset[], pasted: StudioAsset[], action: ImageEditAction): StudioAsset[] {
  const auxiliaryRole = auxiliaryRoleForEditAction(action);
  const incoming = pasted.filter((item) => item.role === "image").slice(0, auxiliaryRole ? 2 : 1);
  if (!incoming.length) return normalizeImageEditAssets(previous, action);

  const normalized = normalizeImageEditAssets(previous, action);
  const masks = normalized.filter((item) => item.role === "mask");
  const currentMain = normalized.find((item) => item.role === "image");
  const currentAuxiliary = auxiliaryRole ? normalized.find((item) => item.role === auxiliaryRole) : undefined;

  if (auxiliaryRole && incoming.length >= 2) {
    return [
      { ...incoming[0], role: "image" },
      { ...incoming[1], role: auxiliaryRole },
      ...masks,
    ];
  }

  const next = incoming[0];
  if (!currentMain) return [{ ...next, role: "image" }, currentAuxiliary, ...masks].filter((item): item is StudioAsset => Boolean(item));
  if (auxiliaryRole) return [currentMain, { ...next, role: auxiliaryRole }, ...masks];
  return [{ ...next, role: "image" }, ...masks];
}
