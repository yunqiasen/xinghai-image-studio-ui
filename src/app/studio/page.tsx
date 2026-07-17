import {
  Brush,
  FileImage,
  Images,
  Maximize2,
  Repeat2,
  ScanLine,
  Film,
  Clapperboard,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ImageEditModal } from "@/components/image-edit-modal";
import { useGeneration } from "@/components/commercial/generation-context";
import { useLanguage } from "@/components/language-provider";
import { createLocalId } from "@/lib/client-id";
import { estimateCredits, type StudioMode } from "@/lib/billing/pricing";
import { sizeFromStudioPreset } from "@/lib/image2api/size-presets";
import { useSessionUser } from "@/lib/storage/session-hooks";

import { imageModes, studioModeDefinitions, studioModeModels, studioVisibleModes, videoModes, type StudioPromptTemplate } from "./mode-config";
import { buildModePrompt } from "./mode-request";
import { mergePastedImageAssets } from "./prompt-paste";
import {
  CONTROLS_PANEL_CLASS_NAME,
  EDITOR_PANEL_GRID_CLASS_NAME,
  MODE_OPTION_CLASS_NAME,
  STUDIO_ACTION_BAR_CLASS_NAME,
  STUDIO_EDITOR_BODY_CLASS_NAME,
  STUDIO_MODE_RAIL_CLASS_NAME,
  STUDIO_PAGE_CLASS_NAME,
  STUDIO_PARAMETER_SCROLL_CLASS_NAME,
  STUDIO_WORKSPACE_GRID_CLASS_NAME,
} from "./layout-constants";
import { ModeSettings, type StudioAsset, type StudioSettingsValue } from "./mode-settings";
import { MAX_STUDIO_PROMPT_LENGTH, readStudioRoutePrompt } from "./route-prompt";
import { StudioPreview } from "./studio-preview";
import { VideoPreview } from "./video-preview";
import { createInitialVideoSettings, isVideoStudioMode } from "./video-settings-state";
import { VideoSettings, type VideoSettingsValue } from "./video-settings";


const modeIcons: Record<StudioMode, typeof FileImage> = {
  text: FileImage,
  image: Images,
  edit: Brush,
  "remove-bg": ScanLine,
  upscale: Maximize2,
  background: ScanLine,
  batch: Repeat2,
  "video-text": Film,
  "video-image": Clapperboard,
};

function emptyModeAssets(): Record<StudioMode, StudioAsset[]> {
  return { text: [], image: [], edit: [], "remove-bg": [], upscale: [], background: [], batch: [], "video-text": [], "video-image": [] };
}

function emptyModePrompts(defaultPrompt: string): Record<StudioMode, string> {
  return {
    text: defaultPrompt,
    image: "",
    edit: "",
    "remove-bg": "",
    upscale: "",
    background: "",
    batch: "",
    "video-text": "",
    "video-image": "",
  };
}

function displaySource(asset: StudioAsset) {
  return asset.dataUrl || asset.url;
}

export function StudioPage() {
  const location = useLocation();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const importedPrompt = readStudioRoutePrompt(location.state);
  const [mode, setMode] = useState<StudioMode>("text");
  const [settings, setSettings] = useState<Omit<StudioSettingsValue, "prompt">>({
    model: "gpt-image-2",
    aspectRatio: "1:1",
    count: 1,
    resolution: "1k",
    imageEditAction: "remove-background",
    superAction: "2x",
    referenceStrength: 70,
    preserveComposition: true,
    consistency: 80,
    variation: 30,
    overlayText: "",
  });
  const [modePrompts, setModePrompts] = useState<Record<StudioMode, string>>(() => emptyModePrompts(t("studio.defaultPrompt")));
  const [modeAssets, setModeAssets] = useState<Record<StudioMode, StudioAsset[]>>(emptyModeAssets);
  const [modeModels, setModeModels] = useState<Record<StudioMode, string>>(() => Object.fromEntries(studioVisibleModes.map((item) => [item, studioModeModels[item][0].value])) as Record<StudioMode, string>);
  const [videoSettings, setVideoSettings] = useState(createInitialVideoSettings);
  const [editorImageSrc, setEditorImageSrc] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const { user } = useSessionUser();
  const { states: generationStates, startGeneration } = useGeneration();

  const currentGeneration = generationStates[mode];
  const assets = modeAssets[mode];
  const currentPrompt = modePrompts[mode];
  const videoMode = isVideoStudioMode(mode) ? mode : null;
  const currentVideoSettings = videoMode ? videoSettings[videoMode] : null;
  const currentModelValue = currentVideoSettings?.model || modeModels[mode];
  const currentSettings: StudioSettingsValue = { ...settings, model: modeModels[mode], prompt: currentPrompt };
  const cost = videoMode ? 0 : estimateCredits(mode, settings.resolution, settings.count);
  const currentModelLabel = studioModeModels[mode].find((item) => item.value === currentModelValue)?.label || studioModeModels[mode][0].label;
  const currentDefinition = studioModeDefinitions[mode];
  const sourceAssets = assets.filter((item) => item.role === "image");

  useEffect(() => {
    if (!importedPrompt) return;
    setModePrompts((previous) => ({ ...previous, text: importedPrompt }));
    setMode("text");
    navigate(location.pathname, { replace: true, state: null });
  }, [importedPrompt, location.pathname, navigate]);

  function changeSetting<K extends keyof StudioSettingsValue>(key: K, value: StudioSettingsValue[K]) {
    if (key === "prompt") {
      setModePrompts((previous) => ({ ...previous, [mode]: String(value) }));
      return;
    }
    if (key === "model") {
      setModeModels((previous) => ({ ...previous, [mode]: String(value) }));
      return;
    }
    setSettings((previous) => ({ ...previous, [key]: value }));
  }

  function changeVideoSetting<K extends keyof VideoSettingsValue>(key: K, value: VideoSettingsValue[K]) {
    if (!videoMode) return;
    setVideoSettings((previous) => ({ ...previous, [videoMode]: { ...previous[videoMode], [key]: value } }));
  }

  function changeMode(nextMode: StudioMode) {
    if (!studioVisibleModes.includes(nextMode)) return;
    setMode(nextMode);
  }

  async function appendImageFiles(files: File[], role: StudioAsset["role"], mergeReferences = false) {
    if (!files.length) return;
    const next: StudioAsset[] = [];
    for (const file of files.slice(0, role === "mask" ? 1 : 4)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error(t("studio.error.readImage")));
        reader.readAsDataURL(file);
      });
      next.push({ id: createLocalId(), name: file.name || t("studio.sourceImage"), dataUrl, url: "", role });
    }
    if (!next.length) return;
    setModeAssets((previous) => ({ ...previous, [mode]: role === "mask"
      ? [...previous[mode].filter((item) => item.role !== "mask"), next[0]]
      : mergeReferences
        ? mergePastedImageAssets(previous[mode], next)
        : [...previous[mode].filter((item) => item.role !== "image" || mode === "image" || mode === "batch"), ...next].slice(0, 4) }));
  }

  async function appendFiles(files: FileList | null, role: StudioAsset["role"]) {
    await appendImageFiles(files ? Array.from(files) : [], role);
  }

  async function handlePromptImagePaste(files: File[]) {
    setModePrompts((previous) => ({ ...previous, image: currentPrompt }));
    setMode("image");
    await appendImageFiles(files, "image", true);
  }

  function removeAsset(id: string) {
    setModeAssets((previous) => ({ ...previous, [mode]: previous[mode].filter((item) => item.id !== id) }));
  }

  function openMaskEditor(source = sourceAssets[0]) {
    if (!source) {
      toast.error(t("studio.error.upload"));
      return;
    }
    setMode("edit");
    setEditorImageSrc(displaySource(source));
    setEditorOpen(true);
  }

  function handleTemplateSelect(template: StudioPromptTemplate) {
    setModePrompts((previous) => ({ ...previous, [mode]: template.prompt }));
  }

  function optimizeCurrentPrompt() {
    const prompt = currentPrompt.trim();
    if (!prompt) return;
    const suffix = videoMode
      ? "，镜头运动自然，主体动作连贯，节奏清晰，光影稳定，画面流畅，电影感"
      : "，主体清晰，构图平衡，光影自然，细节丰富，画面干净，高质量商业视觉";
    const marker = videoMode ? "镜头运动自然" : "构图平衡";
    if (!prompt.includes(marker)) setModePrompts((previous) => ({ ...previous, [mode]: `${prompt}${suffix}`.slice(0, MAX_STUDIO_PROMPT_LENGTH) }));
  }

  function handleResultEdit(url: string) {
    const source: StudioAsset = { id: `result-${Date.now()}`, name: "生成结果", dataUrl: "", url, role: "image" };
    setModeAssets((previous) => ({ ...previous, edit: [source] }));
    setMode("edit");
    setEditorImageSrc(url);
    setEditorOpen(true);
  }

  async function submitGeneration(targetMode: StudioMode, rawPrompt: string, sourceItems: StudioAsset[]) {
    const prompt = buildModePrompt(targetMode, rawPrompt, settings);
    if (!user) {
      toast.error(t("studio.error.login"));
      return;
    }
    if (!prompt.trim()) {
      toast.error(t("studio.error.prompt"));
      return;
    }
    await startGeneration({
      mode: targetMode,
      prompt,
      model: modeModels[targetMode],
      count: settings.count,
      size: sizeFromStudioPreset(settings.aspectRatio, settings.resolution),
      quality: "",
      sourceImages: sourceItems.map((item) => ({ id: item.id, role: item.role, name: item.name, dataUrl: item.dataUrl, url: item.url })),
    });
  }

  async function submit() {
    if (isVideoStudioMode(mode)) {
      toast.info(t("studio.videoComingSoon"));
      return;
    }
    if (mode !== "text" && !sourceAssets.length) {
      toast.error(t("studio.error.upload"));
      return;
    }
    if (mode === "edit" && !assets.some((item) => item.role === "mask")) {
      openMaskEditor();
      return;
    }
    try {
      await submitGeneration(mode, currentPrompt, assets);
      toast.success(t("studio.submitted"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("studio.error.create"));
    }
  }

  async function submitFromMaskEditor(payload: { prompt: string; mask: { previewDataUrl: string } }) {
    const source = sourceAssets[0];
    if (!source) return;
    const mask: StudioAsset = { id: createLocalId(), name: "mask.png", dataUrl: payload.mask.previewDataUrl, url: "", role: "mask" };
    const nextAssets = [source, mask];
    setModeAssets((previous) => ({ ...previous, edit: nextAssets }));
    setModePrompts((previous) => ({ ...previous, edit: payload.prompt }));
    setEditorOpen(false);
    try {
      await submitGeneration("edit", payload.prompt, nextAssets);
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
              <div className="select-text"><p className="text-[10px] font-bold tracking-[0.22em] text-[#efa3fa]">XINGHAI STUDIO</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-white">{t("studio.title")}</h1></div>
              <div className="rounded-[12px] border border-white/12 bg-white/7 px-3.5 py-2 text-xs font-semibold text-white select-text">{videoMode ? t("studio.videoPreviewBadge") : t("studio.estimatedCredits", { count: cost })}</div>
            </header>

            <div className={STUDIO_EDITOR_BODY_CLASS_NAME}>
              <aside className={STUDIO_MODE_RAIL_CLASS_NAME}>
                <div className="flex items-baseline justify-between gap-2 select-text"><p className="text-sm font-semibold text-white/90">{t("studio.imageCreationType")}</p><span className="text-[10px] text-white/40">{t("studio.chooseFeature")}</span></div>
                <div className="mt-3 grid grid-cols-2 gap-1.5 lg:grid-cols-1">
                  {imageModes.map((studioMode) => {
                    const Icon = modeIcons[studioMode];
                    const active = mode === studioMode;
                    return <button key={studioMode} aria-pressed={active} className={`${MODE_OPTION_CLASS_NAME} ${active ? "border-[#c54bea] bg-[linear-gradient(135deg,rgba(112,32,133,.66),rgba(77,30,91,.58))] text-white shadow-[0_0_0_1px_rgba(197,75,234,.2),0_10px_26px_rgba(144,45,171,.14)]" : "border-white/9 bg-white/[0.045] text-white/72 hover:border-white/18 hover:bg-white/[0.075]"}`} onClick={() => changeMode(studioMode)} title={t(studioModeDefinitions[studioMode].descriptionKey)} type="button"><span className={`grid h-8.5 w-8.5 shrink-0 place-items-center rounded-[11px] ${active ? "bg-[#ca49ee]/20 text-[#efc6fb]" : "bg-white/7 text-white/55"}`}><Icon size={16} /></span><span className="min-w-0"><b className="block text-[13px] leading-4.5">{t(studioModeDefinitions[studioMode].labelKey)}</b><span className="mt-0.5 block truncate text-[9.5px] text-white/42">{t(studioModeDefinitions[studioMode].descriptionKey)}</span></span></button>;
                  })}
                </div>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <div className="flex items-baseline justify-between gap-2 select-text"><p className="text-sm font-semibold text-white/90">{t("studio.videoCreationType")}</p><span className="text-[10px] text-white/40">{t("studio.chooseFeature")}</span></div>
                  <div className="mt-3 grid grid-cols-2 gap-1.5 lg:grid-cols-1">
                    {videoModes.map((studioMode) => {
                      const Icon = modeIcons[studioMode];
                      const active = mode === studioMode;
                      return <button key={studioMode} aria-pressed={active} className={`${MODE_OPTION_CLASS_NAME} ${active ? "border-[#c54bea] bg-[linear-gradient(135deg,rgba(112,32,133,.66),rgba(77,30,91,.58))] text-white shadow-[0_0_0_1px_rgba(197,75,234,.2),0_10px_26px_rgba(144,45,171,.14)]" : "border-white/9 bg-white/[0.045] text-white/72 hover:border-white/18 hover:bg-white/[0.075]"}`} onClick={() => changeMode(studioMode)} title={t(studioModeDefinitions[studioMode].descriptionKey)} type="button"><span className={`grid h-8.5 w-8.5 shrink-0 place-items-center rounded-[11px] ${active ? "bg-[#ca49ee]/20 text-[#efc6fb]" : "bg-white/7 text-white/55"}`}><Icon size={16} /></span><span className="min-w-0"><b className="block text-[13px] leading-4.5">{t(studioModeDefinitions[studioMode].labelKey)}</b><span className="mt-0.5 block truncate text-[9.5px] text-white/42">{t(studioModeDefinitions[studioMode].descriptionKey)}</span></span></button>;
                    })}
                  </div>
                </div>
              </aside>

              <div className={STUDIO_PARAMETER_SCROLL_CLASS_NAME}>
                {!user ? <div className="rounded-2xl border border-[#60a5fa]/20 bg-[#60a5fa]/10 px-3 py-2.5 text-xs text-[#dbeafe] select-text">{t(videoMode ? "studio.videoLoginNotice" : "studio.loginNotice")}<Link to="/login" className="ml-2 font-semibold text-white underline underline-offset-4">{t("studio.goLogin")}</Link></div> : null}
                {videoMode && currentVideoSettings
                  ? <VideoSettings mode={videoMode} value={currentVideoSettings} assets={assets} onChange={changeVideoSetting} onFiles={appendFiles} onRemoveAsset={removeAsset} />
                  : <ModeSettings mode={mode} value={currentSettings} assets={assets} onChange={changeSetting} onFiles={appendFiles} onRemoveAsset={removeAsset} onOpenMaskEditor={() => openMaskEditor()} />}
              </div>
            </div>

            <footer className={STUDIO_ACTION_BAR_CLASS_NAME}>
              <div className="min-w-0 select-text"><p className="truncate text-xs font-semibold text-white">{videoMode && currentVideoSettings ? `${t(currentDefinition.labelKey)} · ${t("studio.seconds", { count: currentVideoSettings.duration })} · ${currentVideoSettings.resolution.toUpperCase()}` : `${t(currentDefinition.labelKey)} · ${t(settings.count === 1 ? "common.image" : "common.images", { count: settings.count })} · ${settings.resolution.toUpperCase()}`}</p><p className="mt-1 text-[9px] text-white/38">{videoMode ? t("studio.videoCostPending") : t("studio.cost", { count: cost })}</p></div>
              <div className="select-text text-right"><p className="text-[9px] text-white/38">{t("preview.engine")}</p><p className="text-xs font-semibold text-white/80">{currentModelLabel}</p></div>
            </footer>
          </div>
        </section>

        {videoMode && currentVideoSettings
          ? <VideoPreview aspectRatio={currentVideoSettings.aspectRatio} duration={currentVideoSettings.duration} motion={currentVideoSettings.motion} prompt={currentPrompt} resolution={currentVideoSettings.resolution} sourceUrl={sourceAssets[0] ? displaySource(sourceAssets[0]) : ""} onGenerate={submit} onOptimizePrompt={optimizeCurrentPrompt} onPromptChange={(value) => changeSetting("prompt", value)} />
          : <StudioPreview mode={mode} aspectRatio={settings.aspectRatio} resolution={settings.resolution} count={currentGeneration.task?.count || settings.count} busy={currentGeneration.starting || Boolean(currentGeneration.task && ["queued", "running", "cancel_requested"].includes(currentGeneration.task.status))} results={currentGeneration.resultUrls} error={currentGeneration.error} startedAt={currentGeneration.startedAt} templates={currentDefinition.templates} onTemplateSelect={handleTemplateSelect} onEditResult={handleResultEdit} prompt={currentPrompt} onPromptChange={(value) => changeSetting("prompt", value)} onOptimizePrompt={optimizeCurrentPrompt} onGenerate={submit} onPasteImages={handlePromptImagePaste} promptDisabled={currentGeneration.starting || Boolean(currentGeneration.task && ["queued", "running", "cancel_requested"].includes(currentGeneration.task.status))} />}
      </div>

      <ImageEditModal open={editorOpen} imageName="生成结果" imageSrc={editorImageSrc} onClose={() => setEditorOpen(false)} onSubmit={submitFromMaskEditor} />
    </div>
  );
}
