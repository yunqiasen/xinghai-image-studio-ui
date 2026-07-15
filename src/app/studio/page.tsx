import {
  Brush,
  ChevronDown,
  Eraser,
  FileImage,
  ImagePlus,
  Images,
  LoaderCircle,
  Maximize2,
  PaintBucket,
  Repeat2,
  Sparkles,
  UploadCloud,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useGeneration } from "@/components/commercial/generation-context";
import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/components/language-modes";
import { ThemeSelector } from "@/components/theme-selector";
import { estimateCredits, modePricing, type ResolutionTier, type StudioMode } from "@/lib/billing/pricing";
import {
  sizeFromStudioPreset,
  studioAspectRatioOptions,
  type StudioAspectRatio,
} from "@/lib/image2api/size-presets";
import { useSessionUser } from "@/lib/storage/session-hooks";

import {
  ASPECT_RATIO_SELECTOR_CLASS_NAME,
  CONTROLS_PANEL_CLASS_NAME,
  EDITOR_PANEL_GRID_CLASS_NAME,
  MODE_OPTION_CLASS_NAME,
  MODEL_SELECTOR_CLASS_NAME,
  PRIMARY_ASPECT_RATIOS,
  PROMPT_TEMPLATE_COLLAPSED_COUNT,
  STUDIO_ACTION_BAR_CLASS_NAME,
  STUDIO_EDITOR_BODY_CLASS_NAME,
  STUDIO_MODEL_LABEL,
  STUDIO_MODE_RAIL_CLASS_NAME,
  STUDIO_PAGE_CLASS_NAME,
  STUDIO_PARAMETER_SCROLL_CLASS_NAME,
  STUDIO_WORKSPACE_GRID_CLASS_NAME,
} from "./layout-constants";
import { MAX_STUDIO_PROMPT_LENGTH, readStudioRoutePrompt } from "./route-prompt";
import { StudioPreview } from "./studio-preview";

type UploadedAsset = { id: string; name: string; dataUrl: string; role: "image" | "mask" };
type RatioIconSize = { width: number; height: number };
type PromptTemplate = { nameKey: TranslationKey; prompt: string };
const MODEL_VALUE = "gpt-image-2";

const uploadModes: StudioMode[] = ["image", "edit", "remove-bg", "upscale", "background"];
const modeIcons: Record<StudioMode, LucideIcon> = {
  text: FileImage,
  image: Images,
  edit: Brush,
  "remove-bg": Eraser,
  upscale: Maximize2,
  background: PaintBucket,
  batch: Repeat2,
};

const modeTranslationKeys: Record<StudioMode, { short: TranslationKey; description: TranslationKey }> = {
  text: { short: "studio.mode.text.short", description: "studio.mode.text.description" },
  image: { short: "studio.mode.image.short", description: "studio.mode.image.description" },
  edit: { short: "studio.mode.edit.short", description: "studio.mode.edit.description" },
  "remove-bg": { short: "studio.mode.remove-bg.short", description: "studio.mode.remove-bg.description" },
  upscale: { short: "studio.mode.upscale.short", description: "studio.mode.upscale.description" },
  background: { short: "studio.mode.background.short", description: "studio.mode.background.description" },
  batch: { short: "studio.mode.batch.short", description: "studio.mode.batch.description" },
};

const promptTemplates: PromptTemplate[] = [
  { nameKey: "studio.template.photo", prompt: "清晨自然光下的真实摄影，主体清晰，背景柔和虚化，色彩干净高级，35mm 镜头，细节丰富" },
  { nameKey: "studio.template.product", prompt: "高端电商商业主图，产品居中，干净背景，柔和布光，质感突出，留白合理，适合广告投放" },
  { nameKey: "studio.template.anime", prompt: "精致动漫角色设定图，清晰五官，服饰细节丰富，柔和光影，干净背景，角色一致性强" },
  { nameKey: "studio.template.storyboard", prompt: "电影感漫画分镜画面，强叙事构图，动态镜头，人物表情明确，光影层次丰富，画面干净" },
  { nameKey: "studio.template.render3d", prompt: "高质量 3D 渲染风格，细腻材质，真实灯光，全局光照，干净构图，产品级视觉效果" },
  { nameKey: "studio.template.background", prompt: "保留主体形态和细节，替换为高级室内摄影棚背景，柔和阴影，真实融合，不改变主体比例" },
  { nameKey: "studio.template.character", prompt: "同一角色多场景一致性生成，保持发型、服装、五官、年龄和气质一致，画风统一，适合漫画分镜" },
  { nameKey: "studio.template.gray", prompt: "高级灰电影调色，低饱和度，柔和对比，细腻颗粒感，安静高级的视觉氛围，构图稳定" },
];

function fileToDataUrl(file: File, readErrorMessage: string) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(readErrorMessage));
    reader.readAsDataURL(file);
  });
}

function ratioIconSize(value: StudioAspectRatio): RatioIconSize {
  const [wRaw, hRaw] = value.split(":").map(Number);
  const w = Number.isFinite(wRaw) && wRaw > 0 ? wRaw : 1;
  const h = Number.isFinite(hRaw) && hRaw > 0 ? hRaw : 1;
  const max = 23;
  if (w >= h) return { width: max, height: Math.max(9, Math.round(max * (h / w))) };
  return { width: Math.max(9, Math.round(max * (w / h))), height: max };
}

export function StudioPage() {
  const location = useLocation();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const importedPrompt = readStudioRoutePrompt(location.state);
  const [mode, setMode] = useState<StudioMode>("text");
  const [selectedModel, setSelectedModel] = useState(MODEL_VALUE);
  const [resolution, setResolution] = useState<ResolutionTier>("1k");
  const [aspectRatio, setAspectRatio] = useState<StudioAspectRatio>("1:1");
  const [prompt, setPrompt] = useState(importedPrompt ?? t("studio.defaultPrompt"));
  const [count, setCount] = useState(1);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const { user } = useSessionUser();
  const { busy, error: generationError, resultUrls, startGeneration, startedAt: generationStartedAt, task } = useGeneration();

  const cost = estimateCredits(mode, resolution, count);
  const needsUpload = useMemo(() => uploadModes.includes(mode), [mode]);
  const referenceImages = assets.filter((item) => item.role === "image");
  const maskImage = assets.find((item) => item.role === "mask");
  const primaryAspectRatioOptions = useMemo(() => {
    const optionByValue = new Map(studioAspectRatioOptions.map((item) => [item.value, item]));
    return PRIMARY_ASPECT_RATIOS.map((value) => optionByValue.get(value)).filter(Boolean) as typeof studioAspectRatioOptions;
  }, []);
  const visiblePromptTemplates = showAllTemplates ? promptTemplates : promptTemplates.slice(0, PROMPT_TEMPLATE_COLLAPSED_COUNT);

  useEffect(() => {
    if (!importedPrompt) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [importedPrompt, location.pathname, navigate]);

  async function appendFiles(files: FileList | null, role: "image" | "mask") {
    if (!files?.length) return;
    const next: UploadedAsset[] = [];
    for (const file of Array.from(files).slice(0, role === "mask" ? 1 : 4)) {
      if (!file.type.startsWith("image/")) continue;
      next.push({ id: crypto.randomUUID(), name: file.name, dataUrl: await fileToDataUrl(file, t("studio.error.readImage")), role });
    }
    if (!next.length) return;
    setAssets((previous) => role === "mask"
      ? [...previous.filter((item) => item.role !== "mask"), next[0]]
      : [...previous, ...next].slice(0, 5));
  }

  async function submit() {
    if (!user) {
      toast.error(t("studio.error.login"));
      return;
    }
    if (!prompt.trim()) {
      toast.error(t("studio.error.prompt"));
      return;
    }
    if (needsUpload && !referenceImages.length) {
      toast.error(t("studio.error.upload"));
      return;
    }
    if (mode === "edit" && !maskImage) {
      toast.error(t("studio.error.mask"));
      return;
    }

    try {
      await startGeneration({
        mode,
        prompt: prompt.trim(),
        model: selectedModel,
        count,
        size: sizeFromStudioPreset(aspectRatio, resolution),
        quality: "",
        sourceImages: assets.map((item) => ({
          id: item.id,
          role: item.role,
          name: item.name,
          dataUrl: item.dataUrl,
          url: "",
        })),
      });
      toast.success(t("studio.submitted"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("studio.error.create"));
    }
  }

  return (
    <div className={STUDIO_PAGE_CLASS_NAME}>
      <div className="studio-ambient-mesh pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_34%_46%_at_-4%_28%,rgba(32,211,218,.22),transparent_68%),radial-gradient(ellipse_31%_45%_at_104%_18%,rgba(255,119,129,.2),transparent_67%),radial-gradient(ellipse_30%_42%_at_91%_104%,rgba(145,92,246,.18),transparent_68%),radial-gradient(ellipse_28%_40%_at_8%_102%,rgba(254,190,86,.13),transparent_68%),linear-gradient(138deg,#edf4f7_0%,#f7f4fa_50%,#edf3f7_100%)]" />
      <div className="pointer-events-none absolute -left-48 top-[34%] h-[370px] w-[370px] rounded-full border border-cyan-400/15" />
      <div className="pointer-events-none absolute -bottom-44 -right-56 h-[430px] w-[430px] rounded-full border border-violet-400/15" />

      <div className={STUDIO_WORKSPACE_GRID_CLASS_NAME}>
        <section className={EDITOR_PANEL_GRID_CLASS_NAME}>
          <div className={CONTROLS_PANEL_CLASS_NAME}>
            <header className="flex min-h-[74px] items-center justify-between gap-3 border-b border-white/10 px-5">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#efa3fa]">XINGHAI STUDIO</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-white">{t("studio.title")}</h1>
              </div>
              <div className="rounded-[12px] border border-white/12 bg-white/7 px-3.5 py-2 text-xs font-semibold text-white">
                {t("studio.estimatedCredits", { count: cost })}
              </div>
            </header>

            <div className={STUDIO_EDITOR_BODY_CLASS_NAME}>
              <aside className={STUDIO_MODE_RAIL_CLASS_NAME}>
                <p className="text-sm font-semibold text-white/90">{t("studio.creationType")}</p>
                <p className="mt-1 text-[11px] text-white/40">{t("studio.chooseFeature")}</p>
                <div className="mt-3 grid grid-cols-2 gap-1.5 lg:grid-cols-1">
                  {(Object.keys(modePricing) as StudioMode[]).map((studioMode) => {
                    const Icon = modeIcons[studioMode] || FileImage;
                    const active = mode === studioMode;
                    return (
                      <button
                        key={studioMode}
                        aria-pressed={active}
                        className={`${MODE_OPTION_CLASS_NAME} ${active ? "border-[#c54bea] bg-[linear-gradient(135deg,rgba(112,32,133,.66),rgba(77,30,91,.58))] text-white shadow-[0_0_0_1px_rgba(197,75,234,.2),0_10px_26px_rgba(144,45,171,.14)]" : "border-white/9 bg-white/[0.045] text-white/72 hover:border-white/18 hover:bg-white/[0.075]"}`}
                        onClick={() => setMode(studioMode)}
                        title={t(modeTranslationKeys[studioMode].description)}
                        type="button"
                      >
                        <span className={`grid h-8.5 w-8.5 shrink-0 place-items-center rounded-[11px] ${active ? "bg-[#ca49ee]/20 text-[#efc6fb]" : "bg-white/7 text-white/55"}`}><Icon size={16} /></span>
                        <span className="min-w-0">
                          <b className="block text-[13px] leading-4.5">{t(modeTranslationKeys[studioMode].short)}</b>
                          <span className="mt-0.5 block truncate text-[9.5px] text-white/42">{t(modeTranslationKeys[studioMode].description)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <section className="studio-spectrum relative mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <div className="flex items-center justify-between gap-2"><p className="text-[11px] font-semibold text-white">{t("studio.spectrum")}</p><span className="text-[9px] text-white/35">{t("studio.interfaceColor")}</span></div>
                  <ThemeSelector className="mt-2.5" compact />
                  <p className="mt-2 text-[9px] leading-4 text-white/38">{t("studio.spectrumHelp")}</p>
                </section>
              </aside>

              <div className={STUDIO_PARAMETER_SCROLL_CLASS_NAME}>
                {!user ? (
                  <div className="rounded-2xl border border-[#60a5fa]/20 bg-[#60a5fa]/10 px-3 py-2.5 text-xs text-[#dbeafe]">
                    {t("studio.loginNotice")}
                    <Link to="/login" className="ml-2 font-semibold text-white underline underline-offset-4">{t("studio.goLogin")}</Link>
                  </div>
                ) : null}

                {needsUpload ? (
                  <div className="rounded-[16px] border border-dashed border-[#a78bfa]/30 bg-[#a78bfa]/8 p-3 text-xs text-white/62">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div><p className="font-semibold text-white">{t("studio.uploadAssets")}</p><p className="mt-1 text-[10px] text-white/42">{t(modeTranslationKeys[mode].description)}</p></div>
                      <div className="flex gap-1.5">
                        <label className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-white px-3 py-2 font-semibold text-[#171626]"><UploadCloud size={14} /> {t("studio.uploadImage")}<input className="hidden" type="file" accept="image/*" multiple onChange={(event) => void appendFiles(event.target.files, "image")} /></label>
                        {mode === "edit" ? <label className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-[#d946ef] px-3 py-2 font-semibold text-white"><ImagePlus size={14} /> {t("studio.mask")}<input className="hidden" type="file" accept="image/*" onChange={(event) => void appendFiles(event.target.files, "mask")} /></label> : null}
                      </div>
                    </div>
                    {assets.length ? <div className="mt-2 grid grid-cols-2 gap-2">{assets.map((item) => <figure key={item.id} className="relative overflow-hidden rounded-xl border border-white/10 bg-black/18"><img src={item.dataUrl} alt={item.name} className="aspect-video w-full object-cover" /><figcaption className="truncate px-2 py-1.5 text-[9px] text-white/50">{item.role === "mask" ? t("studio.mask") : t("studio.sourceImage")} · {item.name}</figcaption><button aria-label={t("studio.removeAsset")} className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white" onClick={() => setAssets((previous) => previous.filter((asset) => asset.id !== item.id))} type="button"><X size={12} /></button></figure>)}</div> : null}
                  </div>
                ) : null}

                <div>
                  <div className="mb-2 flex items-end justify-between"><div><p className="text-sm font-semibold text-white">{t("studio.model")}</p><p className="mt-1 text-[10px] text-white/38">{t("studio.chooseModel")}</p></div><span className="text-[9px] text-white/32">{t("studio.currentModel")}</span></div>
                  <label className={`${MODEL_SELECTOR_CLASS_NAME} relative cursor-pointer`}>
                    <span className="flex min-w-0 items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#d946ef]/16 text-[#f0abfc]"><Sparkles size={16} /></span><span className="truncate text-sm font-semibold text-white">{STUDIO_MODEL_LABEL}</span></span>
                    <ChevronDown className="shrink-0 text-white/48" size={16} />
                    <select aria-label={t("studio.model")} className="absolute inset-0 cursor-pointer opacity-0" value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}><option value={MODEL_VALUE}>{STUDIO_MODEL_LABEL}</option></select>
                  </label>
                </div>

                <div>
                  <div className="mb-1.5 flex items-end justify-between"><div><p className="text-sm font-semibold text-white">{t("studio.ratio")}</p><p className="mt-1 text-[10px] text-white/38">{t("studio.chooseRatio")}</p></div><span className="text-[9px] text-white/32">{t("studio.canvasSync")}</span></div>
                  <div className={ASPECT_RATIO_SELECTOR_CLASS_NAME}>
                    {primaryAspectRatioOptions.map((item) => {
                      const active = aspectRatio === item.value;
                      return <button key={item.value} aria-label={t("studio.imageRatio", { ratio: item.value })} aria-pressed={active} className={`group flex min-h-[57px] flex-col items-center justify-center gap-1 rounded-[12px] border transition ${active ? "border-[#c54bea] bg-[#c54bea]/12 text-[#e879f9]" : "border-transparent text-white/58 hover:bg-white/5 hover:text-white"}`} onClick={() => setAspectRatio(item.value)} title={item.value} type="button"><span className="grid h-7 w-7 place-items-center"><span className="block rounded-[4px] border-2 border-current" style={ratioIconSize(item.value)} /></span><span className="text-[9px] font-bold leading-none">{item.value}</span></button>;
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-end justify-between"><p className="text-sm font-semibold text-white">{t("studio.count")}</p><span className="text-[9px] text-white/32">{t("studio.countRange")}</span></div>
                  <label className="relative block"><select aria-label={t("studio.count")} className="h-11 w-full appearance-none rounded-[14px] border border-white/10 bg-black/20 px-4 pr-10 text-sm font-bold text-white outline-none focus:border-[#d946ef]/70" value={count} onChange={(event) => setCount(Number(event.target.value))}>{[1, 2, 3, 4].map((item) => <option key={item} value={item}>{t(item === 1 ? "common.image" : "common.images", { count: item })}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/48" size={16} /></label>
                </div>

                <div>
                  <div className="mb-1.5 flex items-end justify-between"><p className="text-sm font-semibold text-white">{t("studio.resolution")}</p><span className="text-[9px] text-white/32">{t("studio.outputClarity")}</span></div>
                  <div className="grid grid-cols-3 gap-1.5">{(["1k", "2k", "4k"] as ResolutionTier[]).map((item) => <button key={item} aria-pressed={resolution === item} className={`min-h-11 rounded-[13px] border px-1.5 text-[9.5px] font-bold transition ${resolution === item ? "border-[#c54bea] bg-[#c54bea]/14 text-[#f0c5fa]" : "border-white/10 bg-black/18 text-white/55 hover:bg-white/7 hover:text-white/78"}`} onClick={() => setResolution(item)} type="button">{item.toUpperCase()} · {item === "1k" ? t("studio.standard") : item === "2k" ? t("studio.hd") : t("studio.ultra")}</button>)}</div>
                </div>

                <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-center justify-between gap-2"><div><p className="text-sm font-semibold text-white">{t("studio.templates")}</p><p className="mt-1 text-[10px] text-white/38">{t("studio.templateHelp")}</p></div><button className="text-[10px] font-semibold text-white/52 hover:text-white" onClick={() => setShowAllTemplates((value) => !value)} type="button">{showAllTemplates ? t("studio.collapse") : t("studio.more")}</button></div>
                  <div className="mt-2 flex flex-wrap gap-1.5">{visiblePromptTemplates.map((template) => <button key={template.nameKey} className="min-h-8 rounded-[10px] border border-white/10 bg-black/16 px-2.5 text-[10px] font-semibold text-white/66 hover:border-[#d946ef]/45 hover:bg-[#d946ef]/12 hover:text-white" onClick={() => setPrompt(template.prompt)} type="button">{t(template.nameKey)}</button>)}</div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-end justify-between"><div><p className="text-sm font-semibold text-white">{t("studio.prompt")}</p><p className="mt-1 text-[10px] text-white/38">{t("studio.promptHelp")}</p></div><span className="text-[9px] text-white/34">{prompt.length}/{MAX_STUDIO_PROMPT_LENGTH}</span></div>
                  <textarea aria-label={t("studio.promptLabel")} className="min-h-[92px] w-full resize-none rounded-[15px] border border-[#c54bea]/45 bg-black/24 p-3 text-[13px] leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#d946ef]/70" maxLength={MAX_STUDIO_PROMPT_LENGTH} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
                </div>
              </div>
            </div>

            <footer className={STUDIO_ACTION_BAR_CLASS_NAME}>
              <div className="min-w-0"><p className="truncate text-xs font-semibold text-white">{t(modeTranslationKeys[mode].short)} · {t(count === 1 ? "common.image" : "common.images", { count })} · {resolution.toUpperCase()}</p><p className="mt-1 text-[9px] text-white/38">{t("studio.cost", { count: cost })}</p></div>
              <button disabled={busy} className="studio-generate-button inline-flex h-11 min-w-[220px] items-center justify-center gap-2 rounded-[13px] bg-[linear-gradient(115deg,#7c3aed,#c946ea)] px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,58,237,.24)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-75" onClick={submit} type="button">
                {busy ? <LoaderCircle className="animate-spin" size={17} /> : <Sparkles size={17} />}{busy ? t("studio.generating") : t("studio.generate")}
              </button>
            </footer>
          </div>
        </section>

        <StudioPreview aspectRatio={aspectRatio} busy={busy} count={task?.count || count} error={generationError} resolution={resolution} results={resultUrls} startedAt={generationStartedAt} />
      </div>
    </div>
  );
}
