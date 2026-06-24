import type { StudioAspectRatio } from "@/lib/image2api/size-presets";

export const STUDIO_TEMPLATE_SIDEBAR_ENABLED = false;
export const STUDIO_HEADER_ENABLED = false;
export const STYLE_TAGS_ENABLED = false;
export const MODE_DESCRIPTION_VISIBLE = true;
export const STUDIO_MODEL_LABEL = "GPT Image 2.0";
export const PROMPT_TEMPLATE_COLLAPSED_COUNT = 4;
export const PRIMARY_ASPECT_RATIOS: StudioAspectRatio[] = ["1:1", "16:9", "3:2", "2:3", "3:4", "4:3", "9:16"];
export const STUDIO_PAGE_CLASS_NAME = "relative -my-2 min-h-[calc(100vh-104px)] overflow-hidden rounded-[34px] border border-[#dfe7ef] bg-[#f6f8fc] p-3 text-[#111827] shadow-[0_24px_80px_rgba(15,23,42,.08)] sm:p-4 lg:h-[calc(100vh-104px)] lg:overflow-y-auto";
export const STUDIO_WORKSPACE_GRID_CLASS_NAME = "relative z-10 mx-auto grid max-w-[1500px] gap-5 xl:grid-cols-[minmax(700px,0.95fr)_minmax(560px,1.05fr)]";
export const EDITOR_PANEL_GRID_CLASS_NAME = "rounded-[30px] border border-[#e6edf5] bg-white/96 p-3 shadow-[0_22px_60px_rgba(15,23,42,.08)] backdrop-blur sm:p-4";
export const CONTROLS_PANEL_CLASS_NAME = "rounded-[28px] border border-white/12 bg-[linear-gradient(145deg,#171626,#211b34_52%,#151525)] p-4 text-white shadow-[0_22px_70px_rgba(63,37,112,.28)] sm:p-5";
export const PREVIEW_PANEL_CLASS_NAME = "min-h-[calc(100vh-138px)] rounded-[30px] border border-[#e6edf5] bg-white/96 p-4 text-[#111827] shadow-[0_22px_60px_rgba(15,23,42,.08)] backdrop-blur sm:p-5 xl:sticky xl:top-24";
export const MODE_OPTION_CLASS_NAME = "flex min-h-[72px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d946ef]/70";
export const MODEL_SELECTOR_CLASS_NAME = "flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-left shadow-inner shadow-white/[0.03] transition duration-200 hover:border-[#d946ef]/45 hover:bg-white/[0.075]";
export const ASPECT_RATIO_SELECTOR_CLASS_NAME = "grid grid-cols-4 gap-x-4 gap-y-3 sm:grid-cols-7";
export const GENERATED_IMAGE_CLASS_NAME = "h-auto max-h-[calc(100vh-270px)] w-auto max-w-full rounded-[24px] object-contain shadow-2xl shadow-slate-950/12 transition duration-500 group-hover:scale-[1.01]";
