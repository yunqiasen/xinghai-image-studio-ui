import type { StudioAspectRatio } from "@/lib/image2api/size-presets";

export const STUDIO_TEMPLATE_SIDEBAR_ENABLED = false;
export const STUDIO_HEADER_ENABLED = false;
export const STYLE_TAGS_ENABLED = false;
export const MODE_DESCRIPTION_VISIBLE = true;
export const STUDIO_MODEL_LABEL = "GPT Image 2.0";
export const PROMPT_TEMPLATE_COLLAPSED_COUNT = 4;
export const PRIMARY_ASPECT_RATIOS: StudioAspectRatio[] = ["1:1", "16:9", "3:2", "2:3", "3:4", "4:3", "9:16"];

export const STUDIO_PAGE_CLASS_NAME = "studio-page relative min-h-[calc(100dvh-72px)] overflow-x-hidden bg-[#eef2f7] px-3 py-3 text-[#111827] sm:px-4 lg:flex lg:h-[calc(100dvh-72px)] lg:min-h-0 lg:items-center lg:overflow-hidden lg:px-6";
export const STUDIO_WORKSPACE_GRID_CLASS_NAME = "relative z-10 mx-auto grid w-full max-w-[1240px] gap-3 lg:h-[min(820px,calc(100dvh-96px))] lg:grid-cols-[440px_minmax(0,1fr)]";
export const EDITOR_PANEL_GRID_CLASS_NAME = "min-w-0 lg:h-full lg:min-h-0";
export const CONTROLS_PANEL_CLASS_NAME = "studio-controls overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(145deg,#1a1829,#211d34_55%,#191727)] text-white shadow-[0_20px_60px_rgba(36,43,64,.14)] lg:grid lg:h-full lg:min-h-0 lg:grid-rows-[74px_minmax(0,1fr)_66px]";
export const PREVIEW_PANEL_CLASS_NAME = "studio-preview grid min-h-[620px] min-w-0 grid-rows-[74px_minmax(0,1fr)_42px] overflow-hidden rounded-[26px] border border-[#dfe5ee] bg-[#fbfcfe] text-[#111827] shadow-[0_20px_60px_rgba(36,43,64,.1)] lg:h-full lg:min-h-0";

export const STUDIO_EDITOR_BODY_CLASS_NAME = "min-h-0 lg:grid lg:grid-cols-[176px_minmax(0,1fr)]";
export const STUDIO_MODE_RAIL_CLASS_NAME = "studio-mode-rail border-b border-white/10 bg-black/10 p-3 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r";
export const STUDIO_PARAMETER_SCROLL_CLASS_NAME = "studio-parameters min-w-0 space-y-3 p-4 lg:min-h-0 lg:overflow-y-auto";
export const STUDIO_ACTION_BAR_CLASS_NAME = "studio-action-bar flex min-h-[66px] items-center justify-between gap-3 border-t border-white/10 bg-[#12101d]/88 px-4 backdrop-blur-xl";

export const MODE_OPTION_CLASS_NAME = "flex min-h-[54px] w-full items-center gap-2 rounded-[15px] border px-2 py-1.5 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d946ef]/70";
export const MODEL_SELECTOR_CLASS_NAME = "flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-3.5 py-2 text-left shadow-inner shadow-white/[0.03] transition duration-200 hover:border-[#d946ef]/45 hover:bg-white/[0.075]";
export const ASPECT_RATIO_SELECTOR_CLASS_NAME = "grid grid-cols-7 gap-1";
export const GENERATED_IMAGE_CLASS_NAME = "h-full w-full object-contain";
