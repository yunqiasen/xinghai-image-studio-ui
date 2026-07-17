import { ChevronDown, Clapperboard, UploadCloud, X } from "lucide-react";
import type { ReactNode } from "react";

import { useLanguage } from "@/components/language-provider";

import { MODEL_SELECTOR_CLASS_NAME } from "../studio/layout-constants";
import { videoModeModels } from "./video-settings-state";

export type VideoStudioMode = "video-text" | "video-image";
export type VideoAspectRatio = "16:9" | "9:16" | "1:1";
export type VideoDuration = 5 | 10;
export type VideoResolution = "720p" | "1080p";
export type VideoMotion = "gentle" | "balanced" | "dynamic";

export type VideoSettingsValue = {
  model: string;
  aspectRatio: VideoAspectRatio;
  duration: VideoDuration;
  resolution: VideoResolution;
  motion: VideoMotion;
};

export type VideoAsset = {
  id: string;
  name: string;
  dataUrl: string;
  url: string;
  role: "image";
};

type VideoSettingsProps = {
  mode: VideoStudioMode;
  value: VideoSettingsValue;
  assets: VideoAsset[];
  onChange: <K extends keyof VideoSettingsValue>(key: K, value: VideoSettingsValue[K]) => void;
  onFiles: (files: FileList | null, role: VideoAsset["role"]) => void;
  onRemoveAsset: (id: string) => void;
};

const VIDEO_RATIOS: VideoAspectRatio[] = ["16:9", "9:16", "1:1"];
const VIDEO_DURATIONS: VideoDuration[] = [5, 10];
const VIDEO_RESOLUTIONS: VideoResolution[] = ["720p", "1080p"];

function ControlTitle({ title, help, aside }: { title: string; help?: string; aside?: string }) {
  return (
    <div className="mb-1.5 flex items-end justify-between gap-3 select-text">
      <div><p className="text-sm font-semibold text-white">{title}</p>{help ? <p className="mt-1 text-[10px] text-white/38">{help}</p> : null}</div>
      {aside ? <span className="text-[9px] text-white/32">{aside}</span> : null}
    </div>
  );
}

function ratioIconSize(value: VideoAspectRatio): { width: number; height: number } {
  const [width, height] = value.split(":").map(Number);
  const max = 25;
  if (width >= height) return { width: max, height: Math.max(10, Math.round(max * height / width)) };
  return { width: Math.max(10, Math.round(max * width / height)), height: max };
}

function ChoiceButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      aria-pressed={active}
      className={`min-h-11 rounded-[13px] border px-2 text-[10px] font-bold transition ${active ? "border-[#d25af0] bg-[#c54bea]/16 text-[#f5d6fb]" : "border-white/10 bg-black/18 text-white/58 hover:bg-white/7 hover:text-white"}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function VideoSettings({ mode, value, assets, onChange, onFiles, onRemoveAsset }: VideoSettingsProps) {
  const { t } = useLanguage();
  const models = videoModeModels[mode];
  const source = assets.find((item) => item.role === "image");
  const motionOptions: Array<{ value: VideoMotion; label: string }> = [
    { value: "gentle", label: t("studio.videoMotion.gentle") },
    { value: "balanced", label: t("studio.videoMotion.balanced") },
    { value: "dynamic", label: t("studio.videoMotion.dynamic") },
  ];

  return (
    <div className="space-y-3" data-settings-kind="video">
      <div>
        <ControlTitle title={t("studio.videoModel")} help={t("studio.chooseVideoModel")} aside={t("studio.currentVideoModel")} />
        <label className={`${MODEL_SELECTOR_CLASS_NAME} relative cursor-pointer`}>
          <span className="flex min-w-0 items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#d946ef]/16 text-[#f0abfc]"><Clapperboard size={16} /></span><span className="truncate text-sm font-semibold text-white">{models.find((item) => item.value === value.model)?.label || models[0].label}</span></span>
          <ChevronDown className="shrink-0 text-white/48" size={16} />
          <select aria-label={t("studio.videoModel")} className="absolute inset-0 cursor-pointer opacity-0" value={value.model} onChange={(event) => onChange("model", event.target.value)}>{models.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        </label>
      </div>

      {mode === "video-image" ? (
        <section className="rounded-[16px] border border-dashed border-[#67e8f9]/28 bg-[#22d3ee]/7 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="select-text"><p className="text-sm font-semibold text-white">{t("studio.videoStartFrame")}</p><p className="mt-1 text-[10px] text-white/42">{t("studio.videoStartFrameHelp")}</p></div>
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#171626] select-none"><UploadCloud size={14} />{t("studio.uploadStartFrame")}<input accept="image/*" className="hidden" type="file" onChange={(event) => onFiles(event.target.files, "image")} /></label>
          </div>
          {source ? (
            <figure className="relative mt-2 overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <img alt={source.name} className="aspect-video w-full select-none object-cover" draggable={false} src={source.dataUrl || source.url} />
              <figcaption className="truncate px-2 py-1.5 text-[9px] text-white/50 select-text">{t("studio.videoStartFrame")} · {source.name}</figcaption>
              <button aria-label={t("studio.removeAsset")} className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-black/72 text-white" onClick={() => onRemoveAsset(source.id)} type="button"><X size={13} /></button>
            </figure>
          ) : null}
        </section>
      ) : null}

      <div>
        <ControlTitle title={t("studio.videoRatio")} help={t("studio.chooseVideoRatio")} />
        <div className="grid grid-cols-3 gap-1.5">
          {VIDEO_RATIOS.map((ratio) => (
            <button key={ratio} aria-label={`${t("studio.videoRatio")} ${ratio}`} aria-pressed={value.aspectRatio === ratio} className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[13px] border transition ${value.aspectRatio === ratio ? "border-[#c54bea] bg-[#c54bea]/14 text-[#f0c5fa]" : "border-white/10 bg-black/18 text-white/55 hover:bg-white/7 hover:text-white"}`} onClick={() => onChange("aspectRatio", ratio)} type="button">
              <span className="grid h-7 w-8 place-items-center"><span className="block rounded-[3px] border-2 border-current" style={ratioIconSize(ratio)} /></span>
              <span className="text-[9px] font-bold">{ratio}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <ControlTitle title={t("studio.videoDuration")} help={t("studio.videoDurationHelp")} />
        <div className="grid grid-cols-2 gap-1.5">{VIDEO_DURATIONS.map((duration) => <ChoiceButton key={duration} active={value.duration === duration} onClick={() => onChange("duration", duration)}>{t("studio.seconds", { count: duration })}</ChoiceButton>)}</div>
      </div>

      <div>
        <ControlTitle title={t("studio.videoResolution")} help={t("studio.videoResolutionHelp")} />
        <div className="grid grid-cols-2 gap-1.5">{VIDEO_RESOLUTIONS.map((resolution) => <ChoiceButton key={resolution} active={value.resolution === resolution} onClick={() => onChange("resolution", resolution)}>{resolution.toUpperCase()}</ChoiceButton>)}</div>
      </div>

      <div>
        <ControlTitle title={t("studio.videoMotion")} help={t("studio.videoMotionHelp")} />
        <div className="grid grid-cols-3 gap-1.5">{motionOptions.map((item) => <ChoiceButton key={item.value} active={value.motion === item.value} onClick={() => onChange("motion", item.value)}>{item.label}</ChoiceButton>)}</div>
      </div>
    </div>
  );
}
