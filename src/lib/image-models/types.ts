export type ImageOperation =
  | "generate"
  | "img2img"
  | "inpaint"
  | "cutout"
  | "background_replace"
  | "clothes_replace"
  | "face_swap"
  | "text_overlay"
  | "upscale"
  | "variation"
  | "restore_photo"
  | "face_enhance"
  | "batch_consistency";

export type ImageSourceRole = "image" | "mask" | "background" | "face" | "garment";
export type ImageResolution = "1K" | "2K" | "4K";
export type ImageQuality = "standard" | "low" | "medium" | "high";
export type TextOverlayPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "custom";

export type ImageOperationOptions = {
  referenceStrength?: number;
  preserveComposition?: boolean;
  scale?: 2 | 4;
  variation?: number;
  consistency?: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  position?: TextOverlayPosition;
  x?: number;
  y?: number;
  tolerance?: number;
  feather?: number;
  radius?: number;
  autoCutout?: boolean;
};

export type ImageCapabilities = {
  operations: ImageOperation[];
  source_roles: ImageSourceRole[];
  resolutions: ImageResolution[];
  qualities: ImageQuality[];
  max_source_images: number;
  max_outputs: number;
  mask_mode: "native_parent_or_post_composite" | "post_composite" | "none";
};

export type ImagePricing = {
  unit: "credits";
  default_cost: number;
  operation_costs?: Partial<Record<ImageOperation, number>>;
  resolution_surcharges?: Partial<Record<ImageResolution, number>>;
  quality_surcharges?: Partial<Record<ImageQuality, number>>;
};

export type ImageModel = {
  id: string;
  slug: string;
  name: string;
  type: "image";
  description?: string;
  runtimeReady: boolean;
  capabilities: ImageCapabilities;
  pricing: ImagePricing;
};
