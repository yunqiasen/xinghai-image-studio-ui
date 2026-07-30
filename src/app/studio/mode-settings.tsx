import { Brush, ChevronDown, Sparkles, UploadCloud, X } from "lucide-react";
import { useState } from "react";

import { useLanguage } from "@/components/language-provider";
import type { ResolutionTier, StudioMode } from "@/lib/billing/pricing";
import type { ImageOperation, ImageQuality, ImageResolution, ImageSourceRole, TextOverlayPosition } from "@/lib/image-models/types";
import type { StudioAspectRatio } from "@/lib/image2api/size-presets";

import { imageEditActions, studioModeDefinitions, studioModeModels, superResolutionActions, type StudioModelOption } from "./mode-config";
import { ImageAssetSlots } from "./image-asset-slots";
import { StudioImageLightbox } from "./studio-image-lightbox";
import { MODEL_SELECTOR_CLASS_NAME, PRIMARY_ASPECT_RATIOS } from "./layout-constants";
import { MAX_STUDIO_PROMPT_LENGTH } from "./route-prompt";

export type StudioAsset = {
  id: string;
  name: string;
  dataUrl: string;
  url: string;
  role: ImageSourceRole;
  sourceTaskId?: string;
  sourceImageIndex?: number;
};

export type StudioSettingsValue = {
  model: string;
  aspectRatio: StudioAspectRatio;
  count: number;
  resolution: ResolutionTier;
  quality: ImageQuality;
  prompt: string;
  imageEditAction: (typeof imageEditActions)[number]["value"];
  superAction: (typeof superResolutionActions)[number]["value"];
  referenceStrength: number;
  preserveComposition: boolean;
  consistency: number;
  variation: number;
  overlayText: string;
  fontSize: number;
  textColor: string;
  textPosition: TextOverlayPosition;
  textX: number;
  textY: number;
  cutoutTolerance: number;
  cutoutFeather: number;
  autoCutout: boolean;
  style: string;
  backgroundDescription: string;
};

type ModeSettingsProps = {
  mode: StudioMode;
  value: StudioSettingsValue;
  assets: StudioAsset[];
  models?: StudioModelOption[];
  availableOperations?: ImageOperation[];
  availableResolutions?: ImageResolution[];
  availableQualities?: ImageQuality[];
  countOptions?: number[];
  modelLoading?: boolean;
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

function OptionGrid<T extends string>({ value, options, onChange }: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string; disabled?: boolean; badge?: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map((item) => (
        <button
          key={item.value}
          aria-pressed={value === item.value}
          className={`relative min-h-11 rounded-[13px] border px-2 text-[10px] font-bold transition ${item.disabled ? "cursor-not-allowed border-white/7 bg-black/12 text-white/25" : value === item.value ? "border-[#d25af0] bg-[#c54bea]/16 text-[#f5d6fb]" : "border-white/10 bg-black/18 text-white/58 hover:bg-white/7 hover:text-white"}`}
          data-operation-available={String(!item.disabled)}
          disabled={item.disabled}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.label}
          {item.badge ? <span className="ml-1 text-[8px] font-medium text-amber-300/75">{item.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

function RangeControl({ label, value, minLabel, maxLabel, min = 0, max = 100, suffix = "%", onChange }: {
  label: string;
  value: number;
  minLabel: string;
  maxLabel: string;
  min?: number;
  max?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-[14px] border border-white/10 bg-white/[0.035] p-3">
      <span className="flex items-center justify-between gap-3 text-[11px] font-semibold text-white select-text"><span>{label}</span><b className="tabular-nums text-[#efa3fa]">{value}{suffix}</b></span>
      <input aria-label={label} className="mt-2 h-1.5 w-full cursor-pointer accent-[#d946ef]" max={max} min={min} type="range" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <span className="mt-1 flex justify-between text-[9px] text-white/32 select-text"><span>{minLabel}</span><span>{maxLabel}</span></span>
    </label>
  );
}

function ToggleControl({ title, help, checked, onChange }: { title: string; help: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-white/[0.035] px-3 text-xs text-white/72">
      <span className="select-text"><b className="block text-white">{title}</b><span className="mt-0.5 block text-[9px] text-white/36">{help}</span></span>
      <input checked={checked} className="h-4 w-4 accent-[#d946ef]" type="checkbox" onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function roleLabel(role: ImageSourceRole, t: ReturnType<typeof useLanguage>["t"]) {
  if (role === "mask") return t("studio.mask");
  if (role === "background") return t("studio.backgroundImage");
  if (role === "garment") return t("studio.garmentImage");
  if (role === "face") return t("studio.faceImage");
  return t("studio.sourceImage");
}

export function ModeSettings({
  mode,
  value,
  assets,
  models: providedModels,
  availableOperations,
  availableResolutions = ["1K", "2K", "4K"],
  availableQualities = ["standard"],
  countOptions = [1, 2, 4],
  modelLoading = false,
  onChange,
  onFiles,
  onRemoveAsset,
  onOpenMaskEditor,
}: ModeSettingsProps) {
  const { t } = useLanguage();
  const controls = studioModeDefinitions[mode].controls;
  const sourceAssets = assets.filter((item) => item.role === "image");
  const has = (control: (typeof controls)[number]) => controls.includes(control);
  const models = providedModels?.length ? providedModels : studioModeModels[mode];
  const operationAvailable = (operation: ImageOperation) => !availableOperations || availableOperations.includes(operation);
  const currentEditOperation = imageEditActions.find((item) => item.value === value.imageEditAction)?.operation;
  const currentSuperOperation = superResolutionActions.find((item) => item.value === value.superAction)?.operation;
  const maskSupported = mode === "image"
    || (mode === "remove-bg" && ["remove-background", "change-clothes", "swap-face"].includes(value.imageEditAction))
    || (mode === "upscale" && value.superAction === "face-enhance");

  const [previewAsset, setPreviewAsset] = useState<StudioAsset | null>(null);

  return (
    <div className="space-y-3">
      <div>
        <ControlTitle title={t("studio.model")} help={modelLoading ? t("studio.imageModelsLoading") : t("studio.chooseModel")} aside={t("studio.currentModel")} />
        <label className={`${MODEL_SELECTOR_CLASS_NAME} relative cursor-pointer`}>
          <span className="flex min-w-0 items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#d946ef]/16 text-[#f0abfc]"><Sparkles size={16} /></span><span className="truncate text-sm font-semibold text-white">{models.find((item) => item.value === value.model)?.label || models[0]?.label || t("studio.imageModelUnavailable")}</span></span>
          <ChevronDown className="shrink-0 text-white/48" size={16} />
          <select aria-label={t("studio.model")} className="absolute inset-0 cursor-pointer opacity-0" disabled={!models.length || modelLoading} value={models.some((item) => item.value === value.model) ? value.model : models[0]?.value || ""} onChange={(event) => onChange("model", event.target.value)}>{models.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        </label>
      </div>

      {has("source") ? (
        <section className="rounded-[16px] border border-dashed border-[#a78bfa]/30 bg-[#a78bfa]/8 p-3">
          <div className="select-text mb-2"><p className="text-sm font-semibold text-white">{mode === "image" ? t("studio.uploadReference") : mode === "remove-bg" ? t("studio.uploadAssets") : t("studio.uploadSource")}</p><p className="mt-1 text-[10px] text-white/42">{t(studioModeDefinitions[mode].descriptionKey)}</p></div>
          {mode === "remove-bg" ? (
            <ImageAssetSlots action={value.imageEditAction} assets={assets} onFiles={onFiles} onRemoveAsset={onRemoveAsset} onPreviewAsset={setPreviewAsset} />
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#171626] select-none" data-upload-role="image"><UploadCloud size={14} /> {t("studio.uploadImage")}<input className="hidden" type="file" accept="image/*" multiple={mode === "image" || mode === "batch"} onChange={(event) => onFiles(event.target.files, "image")} /></label>
                {maskSupported && sourceAssets.length ? <button className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[linear-gradient(115deg,#7c3aed,#d946ef)] px-3.5 py-2 text-xs font-bold text-white shadow-[0_10px_24px_rgba(168,85,247,.28)] transition hover:-translate-y-px hover:shadow-[0_14px_30px_rgba(168,85,247,.36)]" data-studio-action="local-edit" onClick={onOpenMaskEditor} type="button"><Brush size={14} />{t("studio.localEdit")}</button> : null}
              </div>
              {assets.length ? (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {assets.map((item) => (
                    <figure key={item.id} className="relative overflow-hidden rounded-xl border border-white/10 bg-black/18">
                      <button className="block w-full cursor-zoom-in" data-asset-preview={item.role} onClick={() => setPreviewAsset(item)} type="button"><img src={item.dataUrl || item.url} alt={item.name} className="aspect-video w-full select-none object-cover" draggable={false} /></button>
                      <figcaption className="truncate px-2 py-1.5 text-[9px] text-white/50 select-text">{roleLabel(item.role, t)} · {item.name}</figcaption>
                      <button aria-label={t("studio.removeAsset")} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white" onClick={(event) => { event.stopPropagation(); onRemoveAsset(item.id); }} type="button"><X size={12} /></button>
                    </figure>
                  ))}
                </div>
              ) : null}
            </>
          )}
          {mode === "remove-bg" && maskSupported && sourceAssets.length ? <button className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[linear-gradient(115deg,#7c3aed,#d946ef)] px-3.5 py-2 text-xs font-bold text-white shadow-[0_10px_24px_rgba(168,85,247,.28)]" data-studio-action="local-edit" onClick={onOpenMaskEditor} type="button"><Brush size={14} />{t("studio.localEdit")}</button> : null}
        </section>
      ) : null}

      {has("image-edit-action") ? (
        <section>
          <ControlTitle title={t("studio.imageEdit.type")} help={t("studio.imageEdit.help")} />
          <OptionGrid value={value.imageEditAction} options={imageEditActions.map((item) => ({ value: item.value, label: t(item.labelKey), disabled: !operationAvailable(item.operation), badge: operationAvailable(item.operation) ? undefined : t("studio.operationUnavailable") }))} onChange={(next) => onChange("imageEditAction", next)} />
          {currentEditOperation && !operationAvailable(currentEditOperation) ? <p className="mt-2 text-[10px] text-amber-300/75">{t("studio.operationUnavailableHelp")}</p> : null}
        </section>
      ) : null}

      {has("super-resolution-action") ? (
        <section>
          <ControlTitle title={t("studio.super.type")} help={t("studio.super.help")} />
          <OptionGrid value={value.superAction} options={superResolutionActions.map((item) => ({ value: item.value, label: t(item.labelKey), disabled: !operationAvailable(item.operation), badge: operationAvailable(item.operation) ? undefined : t("studio.operationUnavailable") }))} onChange={(next) => onChange("superAction", next)} />
          {currentSuperOperation && !operationAvailable(currentSuperOperation) ? <p className="mt-2 text-[10px] text-amber-300/75">{t("studio.operationUnavailableHelp")}</p> : null}
        </section>
      ) : null}

      {mode === "remove-bg" && value.imageEditAction === "add-text" ? (
        <section className="grid gap-2">
          <input aria-label={t("studio.imageEdit.text")} className="h-11 w-full rounded-[13px] border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d946ef]/70" maxLength={2000} placeholder={t("studio.imageEdit.textPlaceholder")} value={value.overlayText} onChange={(event) => onChange("overlayText", event.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10px] text-white/52"><span className="mb-1 block">{t("studio.text.fontSize")}</span><input aria-label={t("studio.text.fontSize")} className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-white" max={512} min={8} type="number" value={value.fontSize} onChange={(event) => onChange("fontSize", Number(event.target.value))} /></label>
            <label className="text-[10px] text-white/52"><span className="mb-1 block">{t("studio.text.color")}</span><span className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-2"><input aria-label={t("studio.text.color")} className="h-7 w-9 cursor-pointer border-0 bg-transparent" type="color" value={value.textColor.slice(0, 7)} onChange={(event) => onChange("textColor", event.target.value.toUpperCase())} /><span className="text-[10px] text-white/72">{value.textColor}</span></span></label>
          </div>
          <label className="text-[10px] text-white/52"><span className="mb-1 block">{t("studio.text.position")}</span><select aria-label={t("studio.text.position")} className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-white" value={value.textPosition} onChange={(event) => onChange("textPosition", event.target.value as TextOverlayPosition)}>{(["top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right", "custom"] as TextOverlayPosition[]).map((position) => <option key={position} value={position}>{t(`studio.text.position.${position}`)}</option>)}</select></label>
          {value.textPosition === "custom" ? <div className="grid grid-cols-2 gap-2"><input aria-label="X" className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-white" min={-4096} max={4096} type="number" value={value.textX} onChange={(event) => onChange("textX", Number(event.target.value))} /><input aria-label="Y" className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-white" min={-4096} max={4096} type="number" value={value.textY} onChange={(event) => onChange("textY", Number(event.target.value))} /></div> : null}
        </section>
      ) : null}

      {mode === "remove-bg" && value.imageEditAction === "remove-background" ? <div className="grid gap-2 sm:grid-cols-2"><RangeControl label={t("studio.cutoutTolerance")} value={value.cutoutTolerance} minLabel={t("studio.precise")} maxLabel={t("studio.loose")} min={0} max={255} suffix="" onChange={(next) => onChange("cutoutTolerance", next)} /><RangeControl label={t("studio.cutoutFeather")} value={value.cutoutFeather} minLabel={t("studio.sharp")} maxLabel={t("studio.soft")} min={0} max={255} suffix="" onChange={(next) => onChange("cutoutFeather", next)} /></div> : null}

      {mode === "remove-bg" && value.imageEditAction === "replace-background" ? <div className="grid gap-2"><input aria-label={t("studio.backgroundDescription")} className="h-11 w-full rounded-[13px] border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d946ef]/70" maxLength={128} placeholder={t("studio.backgroundDescriptionPlaceholder")} value={value.backgroundDescription} onChange={(event) => onChange("backgroundDescription", event.target.value)} /><ToggleControl title={t("studio.autoCutout")} help={t("studio.autoCutoutHelp")} checked={value.autoCutout} onChange={(next) => onChange("autoCutout", next)} /></div> : null}

      {(has("reference-strength") || (mode === "remove-bg" && ["change-clothes", "swap-face"].includes(value.imageEditAction))) ? <RangeControl label={t("studio.referenceStrength")} value={value.referenceStrength} minLabel={t("studio.creative")} maxLabel={t("studio.faithful")} onChange={(next) => onChange("referenceStrength", next)} /> : null}

      {(has("composition") || (mode === "remove-bg" && ["change-clothes", "swap-face"].includes(value.imageEditAction))) ? <ToggleControl title={t("studio.preserveComposition")} help={t("studio.preserveCompositionHelp")} checked={value.preserveComposition} onChange={(next) => onChange("preserveComposition", next)} /> : null}

      {mode === "upscale" && value.superAction === "variation" ? <RangeControl label={t("studio.variationStrength")} value={value.variation} minLabel={t("studio.stable")} maxLabel={t("studio.varied")} onChange={(next) => onChange("variation", next)} /> : null}

      {has("consistency") ? <div className="grid gap-2 sm:grid-cols-2"><RangeControl label={t("studio.characterConsistency")} value={value.consistency} minLabel={t("studio.loose")} maxLabel={t("studio.locked")} onChange={(next) => onChange("consistency", next)} /><RangeControl label={t("studio.compositionVariation")} value={value.variation} minLabel={t("studio.stable")} maxLabel={t("studio.varied")} onChange={(next) => onChange("variation", next)} /></div> : null}

      {has("aspect") ? <div><ControlTitle title={t("studio.ratio")} help={t("studio.chooseRatio")} aside={t("studio.canvasSync")} /><div className="grid grid-cols-4 gap-1.5">{PRIMARY_ASPECT_RATIOS.map((item) => <button key={item} aria-label={t("studio.imageRatio", { ratio: item })} aria-pressed={value.aspectRatio === item} className={`group flex min-h-[57px] flex-col items-center justify-center gap-1 rounded-[12px] border transition ${value.aspectRatio === item ? "border-[#c54bea] bg-[#c54bea]/12 text-[#e879f9]" : "border-transparent text-white/58 hover:bg-white/5 hover:text-white"}`} onClick={() => onChange("aspectRatio", item)} title={item} type="button"><span className="grid h-7 w-7 place-items-center"><span className="block rounded-[4px] border-2 border-current" style={ratioIconSize(item)} /></span><span className="text-[9px] font-bold leading-none">{item}</span></button>)}</div></div> : null}

      {has("count") ? <div><ControlTitle title={t("studio.count")} aside={t("studio.countRange")} /><label className="relative block"><select aria-label={t("studio.count")} className="h-11 w-full appearance-none rounded-[14px] border border-white/10 bg-black/20 px-4 pr-10 text-sm font-bold text-white outline-none focus:border-[#d946ef]/70" value={countOptions.includes(value.count) ? value.count : countOptions[0]} onChange={(event) => onChange("count", Number(event.target.value))}>{countOptions.map((item) => <option key={item} value={item}>{t(item === 1 ? "common.image" : "common.images", { count: item })}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/48" size={16} /></label></div> : null}

      {has("resolution") ? <div><ControlTitle title={t("studio.resolution")} aside={t("studio.outputClarity")} /><div className="grid grid-cols-3 gap-1.5">{availableResolutions.map((resolution) => { const item = resolution.toLowerCase() as ResolutionTier; return <button key={item} aria-pressed={value.resolution === item} className={`min-h-11 rounded-[13px] border px-1.5 text-[9.5px] font-bold transition ${value.resolution === item ? "border-[#c54bea] bg-[#c54bea]/14 text-[#f0c5fa]" : "border-white/10 bg-black/18 text-white/55 hover:bg-white/7 hover:text-white/78"}`} onClick={() => onChange("resolution", item)} type="button">{resolution} · {item === "1k" ? t("studio.standard") : item === "2k" ? t("studio.hd") : t("studio.ultra")}</button>; })}</div></div> : null}

      {availableQualities.length ? <div><ControlTitle title={t("studio.quality")} aside={t("studio.qualityHelp")} /><OptionGrid value={value.quality} options={availableQualities.map((quality) => ({ value: quality, label: t(`studio.quality.${quality}`) }))} onChange={(next) => onChange("quality", next)} /></div> : null}

      {["text", "image", "upscale", "batch"].includes(mode) ? <label className="block text-[10px] text-white/52"><span className="mb-1 block">{t("studio.style")}</span><input aria-label={t("studio.style")} className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#d946ef]/70" maxLength={128} placeholder={t("studio.stylePlaceholder")} value={value.style} onChange={(event) => onChange("style", event.target.value.slice(0, MAX_STUDIO_PROMPT_LENGTH))} /></label> : null}
      {previewAsset ? <StudioImageLightbox alt={previewAsset.name} kind="asset" onClose={() => setPreviewAsset(null)} url={previewAsset.dataUrl || previewAsset.url} /> : null}
    </div>
  );
}
