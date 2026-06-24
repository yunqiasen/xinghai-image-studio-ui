import type { StudioAspectRatio } from "@/lib/image2api/size-presets";

export const STUDIO_TEMPLATE_SIDEBAR_ENABLED = false;
export const STUDIO_HEADER_ENABLED = false;
export const STYLE_TAGS_ENABLED = false;
export const MODE_DESCRIPTION_VISIBLE = false;
export const PRIMARY_ASPECT_RATIOS: StudioAspectRatio[] = ["1:1", "16:9", "3:2", "2:3", "3:4", "4:3", "9:16"];
export const STUDIO_WORKSPACE_GRID_CLASS_NAME = "grid gap-6 xl:grid-cols-[minmax(660px,0.9fr)_minmax(620px,1.1fr)]";
export const EDITOR_PANEL_GRID_CLASS_NAME = "grid gap-4 rounded-[34px] border border-[#1d3346]/10 bg-white/86 p-4 shadow-sm lg:grid-cols-[220px_minmax(0,1fr)]";
export const PREVIEW_PANEL_CLASS_NAME = "min-h-[calc(100vh-140px)] rounded-[34px] border border-[#1d3346]/10 bg-white/88 p-5 shadow-sm xl:sticky xl:top-24";
export const MODE_OPTION_CLASS_NAME = "flex min-h-16 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition";
export const ASPECT_RATIO_SELECTOR_CLASS_NAME = "grid grid-cols-4 gap-2 sm:grid-cols-7";
export const COUNT_SELECTOR_CLASS_NAME = "grid grid-cols-4 gap-2";
export const GENERATED_IMAGE_CLASS_NAME = "max-h-[calc(100vh-270px)] w-full rounded-[28px] object-contain transition duration-500 group-hover:scale-[1.01]";
