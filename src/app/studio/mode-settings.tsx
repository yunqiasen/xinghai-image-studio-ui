import { Brush, ChevronDown, Sparkles, UploadCloud, X } from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import type { ResolutionTier, StudioMode } from "@/lib/billing/pricing";
import type { StudioAspectRatio } from "@/lib/image2api/size-presets";

import { imageEditActions, studioModeDefinitions, studioModeModels, superResolutionActions } from "./mode-config";
import { MODEL_SELECTOR_CLASS_NAME, PRIMARY_ASPECT_RATIOS } from "./layout-constants";
import { MAX_STUDIO_PROMPT_LENGTH } from "./route-prompt";

export type StudioAsset = {
  id: string;
  name: string;
  dataUrl: string;
  url: string;
  role: "image" | "mask";
};

export type StudioSettingsValue = {
  model: string;
  aspectRatio: StudioAspectRatio;
  count: number;
  resolution: ResolutionTier;
  prompt: string;
  imageEditAction: (typeof imageEditActions)[number]["value"];
  superAction: (typeof superResolutionActions)[number]["value"];
  referenceStrength: number;
  preserveComposition: boolean;
  consistency: number;
  variation: number;
  overlayText: string;
};

type ModeSettingsProps = {
  mode: StudioMode;
  value: StudioSettingsValue;
  assets: StudioAsset[];
  onChange: <K extends keyof StudioSettingsValue>(key: K, value: StudioSettingsValue[K]) => void;
  onFiles: (files: FileList | null, role: StudioAsset["role"]) => void;
  onRemoveAsset: (id: string) => void;
  onOpenMaskEditor: () => void;
};

function ratioIconSize(value: StudioAspectRatio): { width: number; height: number } {
  const [wRaw, hRaw] = value.split(":").map(Number);
  const w = Number.isFinite(wRaw) && wRaw > 0 ? wRaw : 1;
  const h = Number.isFinite(hRaw) && hRaw > 0 ? hRaw : 1;
  const max = 23;
  if (w >= h) return { width: max, height: Math.max(9, Math.round(max * (h / w))) };
  return { width: Math.max(9, Math.round(max * (w / h))), height: max };
}


function ControlTitle({ title, help, aside }: { title: string; help?: string; aside?: string }) {
  return (
    <div className="mb-1.5 flex items-end justify-between gap-3 select-text">
      <div><p className="text-sm font-semibold text-white">{title}</p>{help ? <p className="mt-1 text-[10px] text-white/38">{help}</p> : null}</div>
      {aside ? <span className="text-[9px] text-white/32">{aside}</span> : null}
    </div>
  );
}

function OptionGrid<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map((item) => (
        <button
          key={item.value}
          aria-pressed={value === item.value}
          className={`min-h-11 rounded-[13px] border px-2 text-[10px] font-bold transition ${value === item.value ? "border-[#d25af0] bg-[#c54bea]/16 text-[#f5d6fb]" : "border-white/10 bg-black/18 text-white/58 hover:bg-white/7 hover:text-white"}`}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function RangeControl({ label, value, minLabel, maxLabel, onChange }: { label: string; value: number; minLabel: string; maxLabel: string; onChange: (value: number) => void }) {
  return (
    <label className="block rounded-[14px] border border-white/10 bg-white/[0.035] p-3">
      <span className="flex items-center justify-between gap-3 text-[11px] font-semibold text-white select-text"><span>{label}</span><b className="tabular-nums text-[#efa3fa]">{value}%</b></span>
      <input aria-label={label} className="mt-2 h-1.5 w-full cursor-pointer accent-[#d946ef]" max="100" min="0" type="range" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <span className="mt-1 flex justify-between text-[9px] text-white/32 select-text"><span>{minLabel}</span><span>{maxLabel}</span></span>
    </label>
  );
}

export function ModeSettings({ mode, value, assets, onChange, onFiles, onRemoveAsset, onOpenMaskEditor }: ModeSettingsProps) {
  const { t } = useLanguage();
  const controls = studioModeDefinitions[mode].controls;
  const sourceAssets = assets.filter((item) => item.role === "image");
  const has = (control: (typeof controls)[number]) => controls.includes(control);
  const models = studioModeModels[mode];

  return (
    <div className="space-y-3">
      <div>
        <ControlTitle title={t("studio.model")} help={t("studio.chooseModel")} aside={t("studio.currentModel")} />
        <label className={`${MODEL_SELECTOR_CLASS_NAME} relative cursor-pointer`}>
          <span className="flex min-w-0 items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#d946ef]/16 text-[#f0abfc]"><Sparkles size={16} /></span><span className="truncate text-sm font-semibold text-white">{models.find((item) => item.value === value.model)?.label || models[0].label}</span></span>
          <ChevronDown className="shrink-0 text-white/48" size={16} />
          <select aria-label={t("studio.model")} className="absolute inset-0 cursor-pointer opacity-0" value={value.model} onChange={(event) => onChange("model", event.target.value)}>{models.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        </label>
      </div>
      {has("source") ? (
        <section className="rounded-[16px] border border-dashed border-[#a78bfa]/30 bg-[#a78bfa]/8 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="select-text"><p className="text-sm font-semibold text-white">{mode === "image" ? t("studio.uploadReference") : t("studio.uploadSource")}</p><p className="mt-1 text-[10px] text-white/42">{t(studioModeDefinitions[mode].descriptionKey)}</p></div>
            <div className="flex gap-1.5">
              <label className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#171626] select-none"><UploadCloud size={14} /> {t("studio.uploadImage")}<input className="hidden" type="file" accept="image/*" multiple={mode === "image" || mode === "batch"} onChange={(event) => onFiles(event.target.files, "image")} /></label>
              {mode === "edit" && sourceAssets.length ? <button className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#d946ef] px-3 py-2 text-xs font-semibold text-white" onClick={onOpenMaskEditor} type="button"><Brush size={14} />{t("studio.openMaskEditor")}</button> : null}
            </div>
          </div>
          {assets.length ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {assets.map((item) => (
                <figure key={item.id} className="relative overflow-hidden rounded-xl border border-white/10 bg-black/18">
                  <img src={item.dataUrl || item.url} alt={item.name} className="aspect-video w-full select-none object-cover" draggable={false} />
                  <figcaption className="truncate px-2 py-1.5 text-[9px] text-white/50 select-text">{item.role === "mask" ? t("studio.mask") : t("studio.sourceImage")} · {item.name}</figcaption>
                  <button aria-label={t("studio.removeAsset")} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white" onClick={() => onRemoveAsset(item.id)} type="button"><X size={12} /></button>
                </figure>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {has("image-edit-action") ? (
        <section>
          <ControlTitle title={t("studio.imageEdit.type")} help={t("studio.imageEdit.help")} />
          <OptionGrid value={value.imageEditAction} options={imageEditActions.map((item) => ({ value: item.value, label: t(item.labelKey) }))} onChange={(next) => onChange("imageEditAction", next)} />
          {value.imageEditAction === "add-text" ? <input aria-label={t("studio.imageEdit.text")} className="mt-2 h-11 w-full rounded-[13px] border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d946ef]/70" placeholder={t("studio.imageEdit.textPlaceholder")} value={value.overlayText} onChange={(event) => onChange("overlayText", event.target.value)} /> : null}
        </section>
      ) : null}

      {has("super-resolution-action") ? (
        <section>
          <ControlTitle title={t("studio.super.type")} help={t("studio.super.help")} />
          <OptionGrid value={value.superAction} options={superResolutionActions.map((item) => ({ value: item.value, label: t(item.labelKey) }))} onChange={(next) => onChange("superAction", next)} />
        </section>
      ) : null}

      {has("reference-strength") ? <RangeControl label={t("studio.referenceStrength")} value={value.referenceStrength} minLabel={t("studio.creative")} maxLabel={t("studio.faithful")} onChange={(next) => onChange("referenceStrength", next)} /> : null}

      {has("composition") ? (
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-white/[0.035] px-3 text-xs text-white/72">
          <span className="select-text"><b className="block text-white">{t("studio.preserveComposition")}</b><span className="mt-0.5 block text-[9px] text-white/36">{t("studio.preserveCompositionHelp")}</span></span>
          <input checked={value.preserveComposition} className="h-4 w-4 accent-[#d946ef]" type="checkbox" onChange={(event) => onChange("preserveComposition", event.target.checked)} />
        </label>
      ) : null}

      {has("consistency") ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <RangeControl label={t("studio.characterConsistency")} value={value.consistency} minLabel={t("studio.loose")} maxLabel={t("studio.locked")} onChange={(next) => onChange("consistency", next)} />
          <RangeControl label={t("studio.compositionVariation")} value={value.variation} minLabel={t("studio.stable")} maxLabel={t("studio.varied")} onChange={(next) => onChange("variation", next)} />
        </div>
      ) : null}

      {has("aspect") ? (
        <div>
          <ControlTitle title={t("studio.ratio")} help={t("studio.chooseRatio")} aside={t("studio.canvasSync")} />
          <div className="grid grid-cols-4 gap-1.5">
            {PRIMARY_ASPECT_RATIOS.map((item) => <button key={item} aria-label={t("studio.imageRatio", { ratio: item })} aria-pressed={value.aspectRatio === item} className={`group flex min-h-[57px] flex-col items-center justify-center gap-1 rounded-[12px] border transition ${value.aspectRatio === item ? "border-[#c54bea] bg-[#c54bea]/12 text-[#e879f9]" : "border-transparent text-white/58 hover:bg-white/5 hover:text-white"}`} onClick={() => onChange("aspectRatio", item)} title={item} type="button"><span className="grid h-7 w-7 place-items-center"><span className="block rounded-[4px] border-2 border-current" style={ratioIconSize(item)} /></span><span className="text-[9px] font-bold leading-none">{item}</span></button>)}
          </div>
        </div>
      ) : null}

      {has("count") ? (
        <div>
          <ControlTitle title={t("studio.count")} aside={t("studio.countRange")} />
          <label className="relative block"><select aria-label={t("studio.count")} className="h-11 w-full appearance-none rounded-[14px] border border-white/10 bg-black/20 px-4 pr-10 text-sm font-bold text-white outline-none focus:border-[#d946ef]/70" value={value.count} onChange={(event) => onChange("count", Number(event.target.value))}>{[1, 2, 3, 4].map((item) => <option key={item} value={item}>{t(item === 1 ? "common.image" : "common.images", { count: item })}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/48" size={16} /></label>
        </div>
      ) : null}

      {has("resolution") ? (
        <div>
          <ControlTitle title={t("studio.resolution")} aside={t("studio.outputClarity")} />
          <div className="grid grid-cols-3 gap-1.5">{(["1k", "2k", "4k"] as ResolutionTier[]).map((item) => <button key={item} aria-pressed={value.resolution === item} className={`min-h-11 rounded-[13px] border px-1.5 text-[9.5px] font-bold transition ${value.resolution === item ? "border-[#c54bea] bg-[#c54bea]/14 text-[#f0c5fa]" : "border-white/10 bg-black/18 text-white/55 hover:bg-white/7 hover:text-white/78"}`} onClick={() => onChange("resolution", item)} type="button">{item.toUpperCase()} · {item === "1k" ? t("studio.standard") : item === "2k" ? t("studio.hd") : t("studio.ultra")}</button>)}</div>
        </div>
      ) : null}


    </div>
  );
}
