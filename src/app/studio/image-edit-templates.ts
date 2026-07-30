import type { ImageSourceRole } from "@/lib/image-models/types";

import type { ImageEditAction } from "./image-edit-assets";

export type ImageEditMediaTemplate = {
  id: string;
  role: Extract<ImageSourceRole, "background" | "garment" | "face">;
  nameZh: string;
  nameEn: string;
  url: string;
};

const backgroundTemplates: ImageEditMediaTemplate[] = [
  { id: "bg-dome", role: "background", nameZh: "未来展厅", nameEn: "Future showroom", url: "/soul-gallery-assets/imagic6/future-dome-showroom.webp" },
  { id: "bg-neon", role: "background", nameZh: "霓虹雨夜", nameEn: "Neon rain", url: "/soul-gallery-assets/imagic6/neon-rain-night.webp" },
  { id: "bg-cloud", role: "background", nameZh: "云端都市", nameEn: "Cloud metropolis", url: "/soul-gallery-assets/imagic6/cloud-metropolis.webp" },
  { id: "bg-starport", role: "background", nameZh: "星港远航", nameEn: "Starport", url: "/soul-gallery-assets/imagic6/starport-voyage.webp" },
];

const garmentTemplates: ImageEditMediaTemplate[] = [
  { id: "garment-sports", role: "garment", nameZh: "未来运动装", nameEn: "Future sportswear", url: "/soul-gallery-assets/imya/future-minimal-sportswear.webp" },
  { id: "garment-red", role: "garment", nameZh: "慵懒红裙", nameEn: "Relaxed red dress", url: "/soul-gallery-assets/imya/lazy-red-dress-afternoon.webp" },
  { id: "garment-street", role: "garment", nameZh: "先锋街头", nameEn: "Avant-garde streetwear", url: "/soul-gallery-assets/imya/cinematic-street-avant-garde-portrait.webp" },
  { id: "garment-cover", role: "garment", nameZh: "时尚封面", nameEn: "Fashion cover", url: "/soul-gallery-assets/imya/young-american-woman-fashion-cover.webp" },
];

const faceTemplates: ImageEditMediaTemplate[] = [
  { id: "face-campus", role: "face", nameZh: "校园偶像", nameEn: "Campus portrait", url: "/soul-gallery-assets/imya/korean-idol-campus-portrait.webp" },
  { id: "face-fashion", role: "face", nameZh: "镜头模特", nameEn: "Fashion portrait", url: "/soul-gallery-assets/imya/fashion-model-on-lens.webp" },
  { id: "face-oriental", role: "face", nameZh: "东方美人", nameEn: "Oriental portrait", url: "/soul-gallery-assets/imya/dreamy-oriental-emerald-beauty.webp" },
  { id: "face-travel", role: "face", nameZh: "电影男像", nameEn: "Cinematic male", url: "/soul-gallery-assets/imya/cinematic-male-travel-poster.webp" },
];

export function imageEditTemplatesForAction(action: ImageEditAction): ImageEditMediaTemplate[] {
  if (action === "replace-background") return backgroundTemplates;
  if (action === "change-clothes") return garmentTemplates;
  if (action === "swap-face") return faceTemplates;
  return [];
}
