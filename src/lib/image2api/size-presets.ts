import type { ResolutionTier } from "@/lib/billing/pricing";

export type StudioAspectRatio =
  | "1:1"
  | "4:3"
  | "3:4"
  | "3:2"
  | "2:3"
  | "16:9"
  | "9:16"
  | "21:9"
  | "2:1"
  | "1:2"
  | "4:5"
  | "5:4";

export const studioAspectRatioOptions: Array<{ label: string; value: StudioAspectRatio }> = [
  { label: "1:1 方图", value: "1:1" },
  { label: "4:3 横版", value: "4:3" },
  { label: "3:4 竖版", value: "3:4" },
  { label: "3:2 横版", value: "3:2" },
  { label: "2:3 竖版", value: "2:3" },
  { label: "16:9 宽屏", value: "16:9" },
  { label: "9:16 手机", value: "9:16" },
  { label: "21:9 超宽", value: "21:9" },
  { label: "2:1 宽幅", value: "2:1" },
  { label: "1:2 长竖", value: "1:2" },
  { label: "4:5 海报", value: "4:5" },
  { label: "5:4 横海报", value: "5:4" },
];

export const studioSizePresets: Record<StudioAspectRatio, Record<ResolutionTier, string>> = {
  "1:1": { "1k": "1248x1248", "2k": "2048x2048", "4k": "2880x2880" },
  "4:3": { "1k": "1440x1072", "2k": "2048x1536", "4k": "3264x2448" },
  "3:4": { "1k": "1072x1440", "2k": "1536x2048", "4k": "2448x3264" },
  "3:2": { "1k": "1536x1024", "2k": "2160x1440", "4k": "3456x2304" },
  "2:3": { "1k": "1024x1536", "2k": "1440x2160", "4k": "2304x3456" },
  "16:9": { "1k": "1664x928", "2k": "2560x1440", "4k": "3840x2160" },
  "9:16": { "1k": "928x1664", "2k": "1440x2560", "4k": "2160x3840" },
  "21:9": { "1k": "1904x816", "2k": "3360x1440", "4k": "3808x1632" },
  "2:1": { "1k": "1792x896", "2k": "2560x1280", "4k": "3840x1920" },
  "1:2": { "1k": "896x1792", "2k": "1280x2560", "4k": "1920x3840" },
  "4:5": { "1k": "1120x1400", "2k": "1632x2040", "4k": "2880x3600" },
  "5:4": { "1k": "1400x1120", "2k": "2040x1632", "4k": "3600x2880" },
};

export function sizeFromStudioPreset(aspectRatio: StudioAspectRatio, resolution: ResolutionTier) {
  return studioSizePresets[aspectRatio][resolution];
}
