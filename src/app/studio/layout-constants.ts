import type { StudioAspectRatio } from "@/lib/image2api/size-presets";

export const STUDIO_TEMPLATE_SIDEBAR_ENABLED = false;
export const STUDIO_HEADER_ENABLED = false;
export const STYLE_TAGS_ENABLED = false;
export const MODE_DESCRIPTION_VISIBLE = true;
export const PRIMARY_ASPECT_RATIOS: StudioAspectRatio[] = ["1:1", "16:9", "3:2", "2:3", "3:4", "4:3", "9:16"];
export const STUDIO_WORKSPACE_GRID_CLASS_NAME = "relative z-10 mx-auto grid max-w-[1500px] gap-5 xl:grid-cols-[minmax(620px,0.88fr)_minmax(620px,1.12fr)]";
export const EDITOR_PANEL_GRID_CLASS_NAME = "rounded-[32px] border border-white/10 bg-[#12101d]/94 p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,.45)] backdrop-blur-xl sm:p-5";
export const PREVIEW_PANEL_CLASS_NAME = "min-h-[calc(100vh-120px)] rounded-[32px] border border-white/10 bg-[#0f0d19]/95 p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,.5)] backdrop-blur-xl sm:p-5 xl:sticky xl:top-24";
export const MODE_OPTION_CLASS_NAME = "flex min-h-[72px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f043d3]/70";
export const ASPECT_RATIO_SELECTOR_CLASS_NAME = "grid grid-cols-4 gap-2 sm:grid-cols-7 xl:grid-cols-4 2xl:grid-cols-7";
export const COUNT_SELECTOR_CLASS_NAME = "grid grid-cols-4 gap-2";
export const GENERATED_IMAGE_CLASS_NAME = "h-auto max-h-[calc(100vh-250px)] w-auto max-w-full rounded-[24px] object-contain shadow-2xl shadow-black/40 transition duration-500 group-hover:scale-[1.01]";
