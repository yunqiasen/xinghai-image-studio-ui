import {
  Brush,
  FileImage,
  Images,
  Maximize2,
  Repeat2,
  ScanLine,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ImageEditModal, type MaskPayload } from "@/components/image-edit-modal";
import { useGeneration } from "@/components/commercial/generation-context";
import { useLanguage } from "@/components/language-provider";
import { createLocalId } from "@/lib/client-id";
import type { StudioMode } from "@/lib/billing/pricing";
import { sizeFromStudioPreset } from "@/lib/image2api/size-presets";
import { listImageModels } from "@/lib/image-models/client";
import { estimateImageCredits } from "@/lib/image-models/pricing";
import { availableImageOperations, imageModelsForOperation, selectImageModel } from "@/lib/image-models/selection";
import type { ImageModel, ImageOperation } from "@/lib/image-models/types";
import { optimizePrompt } from "@/lib/prompt-optimizer/client";
import { useSessionUser } from "@/lib/storage/session-hooks";

import { studioModeDefinitions, studioModeModels, studioVisibleModes, type StudioPromptTemplate } from "./mode-config";
import { buildGenerationPrompt } from "./mode-request";
import { buildStudioTaskOptions, normalizeStudioCount, resolveStudioOperation, validateStudioSubmission, type StudioValidationError } from "./operation-request";
import { mergePastedImageAssets } from "./prompt-paste";
import { mergeImageEditPastedAssets, normalizeImageEditAssets, pasteTargetMode } from "./image-edit-assets";
import type { ImageEditMediaTemplate } from "./image-edit-templates";
import { createResultSourceAsset, parentEditContext } from "./result-edit-context";
import { blobToDataUrl, prepareImageTaskAssets } from "./local-image-runtime";
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
import { MAX_STUDIO_PROMPT_LENGTH, readStudioRouteState } from "./route-prompt";
import { createInitialStudioSettings, type StudioModeSettings } from "./studio-settings-state";
import { StudioPreview } from "./studio-preview";


const modeIcons: Record<StudioMode, typeof FileImage> = {
  text: FileImage,
  image: Images,
  edit: Brush,
  "remove-bg": ScanLine,
  upscale: Maximize2,
  background: ScanLine,
  batch: Repeat2,
};

function emptyModeAssets(): Record<StudioMode, StudioAsset[]> {
  return { text: [], image: [], edit: [], "remove-bg": [], upscale: [], background: [], batch: [] };
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
  };
}

function displaySource(asset: StudioAsset) {
  return asset.dataUrl || asset.url;
}

export function StudioPage() {
  const location = useLocation();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const importedRoute = useMemo(() => readStudioRouteState(location.state), [location.state]);
  const [mode, setMode] = useState<StudioMode>("text");
  const [modeSettings, setModeSettings] = useState(createInitialStudioSettings);
  const [modePrompts, setModePrompts] = useState<Record<StudioMode, string>>(() => emptyModePrompts(t("studio.defaultPrompt")));
  const [modeAssets, setModeAssets] = useState<Record<StudioMode, StudioAsset[]>>(emptyModeAssets);
  const [editorImageSrc, setEditorImageSrc] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<StudioMode>("image");
  const [imageModels, setImageModels] = useState<ImageModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [optimizingMode, setOptimizingMode] = useState<StudioMode | null>(null);
  const { user } = useSessionUser();
  const userId = user?.id;
  const { states: generationStates, startGeneration, cancelGeneration } = useGeneration();

  const currentGeneration = generationStates[mode];
  const assets = modeAssets[mode];
  const currentPrompt = modePrompts[mode];
  const settings = modeSettings[mode];
  const currentSettings: StudioSettingsValue = { ...settings, prompt: currentPrompt };
  const currentOperation = resolveStudioOperation(mode, currentSettings, assets.some((item) => item.role === "mask"));
  const supportedOperations = useMemo(() => availableImageOperations(imageModels), [imageModels]);
  const operationModels = useMemo(() => imageModelsForOperation(imageModels, currentOperation), [currentOperation, imageModels]);
  const currentModel = selectImageModel(imageModels, currentOperation, settings.model);
  const maxOutputs = currentModel?.capabilities.max_outputs || 4;
  const normalizedCount = normalizeStudioCount(currentOperation, settings.count, maxOutputs);
  const countOptions = [1, 2, 4].filter((count) => normalizeStudioCount(currentOperation, count, maxOutputs) === count);
  const displayedCost = currentGeneration.task?.creditsCost ?? estimateImageCredits(currentModel, currentOperation, settings.resolution.toUpperCase() as "1K" | "2K" | "4K", settings.quality, normalizedCount);
  const currentModelLabel = currentModel?.name || operationModels[0]?.name || studioModeModels[mode][0].label;
  const currentDefinition = studioModeDefinitions[mode];
  const sourceAssets = assets.filter((item) => item.role === "image");
  const imageTaskActive = Boolean(currentGeneration.task && ["queued", "running", "cancel_requested"].includes(currentGeneration.task.status));

  useEffect(() => {
    if (!userId) {
      setImageModels([]);
      return;
    }
    let active = true;
    setModelsLoading(true);
    listImageModels()
      .then((items) => { if (active) setImageModels(items); })
      .catch((error) => { if (active) toast.error(error instanceof Error ? error.message : t("studio.imageModelUnavailable")); })
      .finally(() => { if (active) setModelsLoading(false); });
    return () => { active = false; };
  }, [t, userId]);

  useEffect(() => {
    if (!currentModel || settings.model === currentModel.slug) return;
    setModeSettings((previous) => ({ ...previous, [mode]: { ...previous[mode], model: currentModel.slug } }));
  }, [currentModel, mode, settings.model]);

  useEffect(() => {
    if (!importedRoute) return;
    const targetMode = importedRoute.mode;
    setMode(targetMode);
    setModePrompts((previous) => ({ ...previous, [targetMode]: importedRoute.prompt }));
    if (importedRoute.sourceImage) {
      const source: StudioAsset = {
        id: createLocalId(),
        name: importedRoute.sourceImage.name,
        dataUrl: importedRoute.sourceImage.dataUrl || "",
        url: importedRoute.sourceImage.url || "",
        role: "image",
        sourceTaskId: importedRoute.sourceImage.sourceTaskId,
        sourceImageIndex: importedRoute.sourceImage.sourceImageIndex,
      };
      setModeAssets((previous) => ({ ...previous, [targetMode]: [source] }));
      if (importedRoute.openMaskEditor) {
        setEditorMode(targetMode);
        setEditorImageSrc(displaySource(source));
        setEditorOpen(true);
      }
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [importedRoute, location.pathname, navigate]);

  function changeSetting<K extends keyof StudioSettingsValue>(key: K, value: StudioSettingsValue[K]) {
    if (key === "prompt") {
      setModePrompts((previous) => ({ ...previous, [mode]: String(value) }));
      return;
    }
    setModeSettings((previous) => ({
      ...previous,
      [mode]: { ...previous[mode], [key]: value } as StudioModeSettings,
    }));
    if (mode === "remove-bg" && key === "imageEditAction") {
      setModeAssets((previous) => ({
        ...previous,
        [mode]: normalizeImageEditAssets(previous[mode], value as StudioSettingsValue["imageEditAction"]),
      }));
    }
  }

  function changeMode(nextMode: StudioMode) {
    if (!studioVisibleModes.includes(nextMode)) return;
    setMode(nextMode);
  }

  async function readImageFiles(files: File[], role: StudioAsset["role"], limit: number) {
    const next: StudioAsset[] = [];
    for (const file of files.slice(0, limit)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error(t("studio.error.readImage")));
        reader.readAsDataURL(file);
      });
      next.push({ id: createLocalId(), name: file.name || t("studio.sourceImage"), dataUrl, url: "", role });
    }
    return next;
  }

  async function appendImageFiles(files: File[], role: StudioAsset["role"], mergeReferences = false, targetMode: StudioMode = mode) {
    if (!files.length) return;
    const maxFiles = role === "image" && (targetMode === "image" || targetMode === "batch") ? 4 : 1;
    const next = await readImageFiles(files, role, maxFiles);
    if (!next.length) return;
    setModeAssets((previous) => {
      if (targetMode === "remove-bg") {
        const action = modeSettings[targetMode].imageEditAction;
        const normalized = normalizeImageEditAssets(previous[targetMode], action);
        if (role === "image") {
          return { ...previous, [targetMode]: normalizeImageEditAssets([
            ...normalized.filter((item) => item.role !== "image"),
            { ...next[0], role: "image" },
          ], action) };
        }
        return { ...previous, [targetMode]: normalizeImageEditAssets([
          ...normalized.filter((item) => item.role !== role),
          next[0],
        ], action) };
      }
      return { ...previous, [targetMode]: role !== "image"
        ? [...previous[targetMode].filter((item) => item.role !== role), next[0]]
        : mergeReferences
          ? mergePastedImageAssets(previous[targetMode], next)
          : [...previous[targetMode].filter((item) => item.role !== "image" || targetMode === "image" || targetMode === "batch"), ...next].slice(0, 4) };
    });
  }

  async function appendFiles(files: FileList | null, role: StudioAsset["role"]) {
    await appendImageFiles(files ? Array.from(files) : [], role);
  }

  async function handlePromptImagePaste(files: File[]) {
    const targetMode = pasteTargetMode(mode);
    if (targetMode === "image" && mode === "text") {
      setModePrompts((previous) => ({ ...previous, image: currentPrompt }));
    }
    setMode(targetMode);
    if (targetMode === "remove-bg") {
      const pasted = await readImageFiles(files, "image", 2);
      setModeAssets((previous) => ({
        ...previous,
        [targetMode]: mergeImageEditPastedAssets(previous[targetMode], pasted, modeSettings[targetMode].imageEditAction),
      }));
      return;
    }
    await appendImageFiles(files, "image", true, targetMode);
  }

  function removeAsset(id: string) {
    setModeAssets((previous) => ({ ...previous, [mode]: previous[mode].filter((item) => item.id !== id) }));
  }

  function openMaskEditor(source = sourceAssets[0]) {
    if (!source) {
      toast.error(t("studio.error.upload"));
      return;
    }
    setEditorMode(mode);
    setEditorImageSrc(displaySource(source));
    setEditorOpen(true);
  }

  function handleTemplateSelect(template: StudioPromptTemplate) {
    setModePrompts((previous) => ({ ...previous, [mode]: template.prompt }));
  }

  function handleImageEditTemplateSelect(template: ImageEditMediaTemplate) {
    const asset: StudioAsset = {
      id: `template-${template.id}`,
      name: `${template.id}.webp`,
      dataUrl: "",
      url: template.url,
      role: template.role,
    };
    setModeAssets((previous) => ({
      ...previous,
      "remove-bg": normalizeImageEditAssets([
        ...previous["remove-bg"].filter((item) => item.role !== template.role),
        asset,
      ], modeSettings["remove-bg"].imageEditAction),
    }));
  }

  function promptSourceForOptimization(asset: StudioAsset | undefined) {
    if (!asset) return undefined;
    if (asset.dataUrl) return asset.dataUrl;
    if (!asset.url) return undefined;
    if (/^https?:\/\//i.test(asset.url)) return asset.url;
    if (typeof window !== "undefined") return new URL(asset.url, window.location.origin).toString();
    return asset.url;
  }

  async function optimizeCurrentPrompt() {
    const prompt = currentPrompt.trim();
    if (!prompt || optimizingMode) return;
    if (!user) {
      toast.error(t("studio.error.login"));
      return;
    }
    setOptimizingMode(mode);
    try {
      const preparedSources = await prepareImageTaskAssets(sourceAssets.slice(0, 1));
      const result = await optimizePrompt({
        profile: mode === "text" ? "text_to_image" : "image_to_image",
        prompt,
        mode,
        sourceImage: preparedSources[0]?.dataUrl || promptSourceForOptimization(sourceAssets[0]),
      });
      setModePrompts((previous) => ({ ...previous, [mode]: result.optimizedPrompt.slice(0, MAX_STUDIO_PROMPT_LENGTH) }));
      toast.success(result.fallback ? t("studio.optimizeFallback") : t("studio.optimizeDone"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("studio.error.create"));
    } finally {
      setOptimizingMode(null);
    }
  }

  function handleResultEdit(url: string, imageIndex: number) {
    const source = createResultSourceAsset(url, currentGeneration.task?.id, imageIndex);
    setModeAssets((previous) => ({ ...previous, image: [source] }));
    setMode("image");
    setEditorMode("image");
    setEditorImageSrc(url);
    setEditorOpen(true);
  }

  function validationMessage(error: StudioValidationError) {
    const keys: Record<StudioValidationError, Parameters<typeof t>[0]> = {
      source: "studio.error.upload", prompt: "studio.error.prompt", mask: "studio.error.mask",
      garment: "studio.error.garment", face: "studio.error.face", background: "studio.backgroundRequired", text: "studio.error.text",
    };
    return t(keys[error]);
  }

  async function submitGeneration(targetMode: StudioMode, rawPrompt: string, sourceItems: StudioAsset[]) {
    const targetSettings = modeSettings[targetMode];
    const hasMask = sourceItems.some((item) => item.role === "mask");
    const operation = resolveStudioOperation(targetMode, { ...targetSettings, prompt: rawPrompt }, hasMask);
    const selectedModel = selectImageModel(imageModels, operation, targetSettings.model);
    if (!selectedModel) throw new Error(t("studio.imageModelUnavailable"));
    const validationError = validateStudioSubmission(operation, sourceItems, { ...targetSettings, prompt: rawPrompt }, rawPrompt);
    if (validationError) throw new Error(validationMessage(validationError));
    const prompt = buildGenerationPrompt(targetMode, rawPrompt, targetSettings, hasMask);
    const preparedSources = await prepareImageTaskAssets(sourceItems);
    const count = normalizeStudioCount(operation, targetSettings.count, selectedModel.capabilities.max_outputs);
    await startGeneration({
      mode: targetMode,
      operation,
      options: buildStudioTaskOptions(operation, { ...targetSettings, prompt: rawPrompt }),
      prompt,
      model: selectedModel.slug,
      count,
      size: sizeFromStudioPreset(targetSettings.aspectRatio, targetSettings.resolution),
      quality: targetSettings.quality,
      sourceImages: preparedSources.map((item) => ({ id: item.id, role: item.role, name: item.name, dataUrl: item.dataUrl, url: item.url })),
      style: targetSettings.style.trim(),
      background: operation === "background_replace" ? (targetSettings.backgroundDescription.trim() || rawPrompt.trim()) : "",
      resolution: targetSettings.resolution.toUpperCase() as "1K" | "2K" | "4K",
      ...parentEditContext(sourceItems),
    });
  }

  async function submit() {
    try {
      await submitGeneration(mode, currentPrompt, assets);
      toast.success(t("studio.submitted"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("studio.error.create"));
    }
  }

  async function submitFromMaskEditor(payload: { prompt: string; mask: MaskPayload }) {
    const source = sourceAssets[0];
    if (!source) return;
    const maskDataUrl = await blobToDataUrl(payload.mask.selectionFile);
    const mask: StudioAsset = { id: createLocalId(), name: "mask.png", dataUrl: maskDataUrl, url: "", role: "mask" };
    const nextAssets = [...modeAssets[editorMode].filter((item) => item.role !== "mask"), mask];
    setModeAssets((previous) => ({ ...previous, [editorMode]: nextAssets }));
    setModePrompts((previous) => ({ ...previous, [editorMode]: payload.prompt }));
    setMode(editorMode);
    setEditorOpen(false);
    try {
      await submitGeneration(editorMode, payload.prompt, nextAssets);
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
              <div className="rounded-[12px] border border-white/12 bg-white/7 px-3.5 py-2 text-xs font-semibold text-white select-text">{t(currentGeneration.task?.creditsCost !== undefined ? "studio.actualCredits" : "studio.estimatedCredits", { count: displayedCost })}</div>
            </header>

            <div className={STUDIO_EDITOR_BODY_CLASS_NAME}>
              <aside className={STUDIO_MODE_RAIL_CLASS_NAME}>
                <div className="flex items-baseline justify-between gap-2 select-text"><p className="text-sm font-semibold text-white/90">{t("studio.imageCreationType")}</p><span className="text-[10px] text-white/40">{t("studio.chooseFeature")}</span></div>
                <div className="mt-3 grid grid-cols-2 gap-1.5 lg:grid-cols-1">
                  {studioVisibleModes.map((studioMode) => {
                    const Icon = modeIcons[studioMode];
                    const active = mode === studioMode;
                    return <button key={studioMode} aria-pressed={active} className={`${MODE_OPTION_CLASS_NAME} ${active ? "border-[#c54bea] bg-[linear-gradient(135deg,rgba(112,32,133,.66),rgba(77,30,91,.58))] text-white shadow-[0_0_0_1px_rgba(197,75,234,.2),0_10px_26px_rgba(144,45,171,.14)]" : "border-white/9 bg-white/[0.045] text-white/72 hover:border-white/18 hover:bg-white/[0.075]"}`} onClick={() => changeMode(studioMode)} title={t(studioModeDefinitions[studioMode].descriptionKey)} type="button"><span className={`grid h-8.5 w-8.5 shrink-0 place-items-center rounded-[11px] ${active ? "bg-[#ca49ee]/20 text-[#efc6fb]" : "bg-white/7 text-white/55"}`}><Icon size={16} /></span><span className="min-w-0"><b className="block text-[13px] leading-4.5">{t(studioModeDefinitions[studioMode].labelKey)}</b><span className="mt-0.5 block truncate text-[9.5px] text-white/42">{t(studioModeDefinitions[studioMode].descriptionKey)}</span></span></button>;
                  })}
                </div>
              </aside>

              <div className={STUDIO_PARAMETER_SCROLL_CLASS_NAME}>
                {!user ? <div className="rounded-2xl border border-[#60a5fa]/20 bg-[#60a5fa]/10 px-3 py-2.5 text-xs text-[#dbeafe] select-text">{t("studio.loginNotice")}<Link to="/login" className="ml-2 font-semibold text-white underline underline-offset-4">{t("studio.goLogin")}</Link></div> : null}
                <ModeSettings mode={mode} value={currentSettings} assets={assets} models={operationModels.map((model) => ({ value: model.slug, label: model.name }))} availableOperations={imageModels.length ? supportedOperations : undefined} availableResolutions={currentModel?.capabilities.resolutions} availableQualities={currentModel?.capabilities.qualities} countOptions={countOptions.length ? countOptions : [1]} modelLoading={modelsLoading} onChange={changeSetting} onFiles={appendFiles} onRemoveAsset={removeAsset} onOpenMaskEditor={() => openMaskEditor()} />
              </div>
            </div>

            <footer className={STUDIO_ACTION_BAR_CLASS_NAME}>
              <div className="min-w-0 select-text"><p className="truncate text-xs font-semibold text-white">{`${t(currentDefinition.labelKey)} · ${t(settings.count === 1 ? "common.image" : "common.images", { count: settings.count })} · ${settings.resolution.toUpperCase()}`}</p><p className="mt-1 text-[9px] text-white/38">{t("studio.cost", { count: displayedCost })}</p></div>
              <div className="select-text text-right"><p className="text-[9px] text-white/38">{t("preview.engine")}</p><p className="text-xs font-semibold text-white/80">{currentModelLabel}</p></div>
            </footer>
          </div>
        </section>

        <StudioPreview mode={mode} aspectRatio={settings.aspectRatio} resolution={settings.resolution} count={currentGeneration.task?.count || settings.count} busy={currentGeneration.starting || imageTaskActive} results={currentGeneration.resultUrls} resultDetails={currentGeneration.task?.images} creditsCost={currentGeneration.task?.creditsCost} operation={currentGeneration.task?.operation} error={currentGeneration.error} startedAt={currentGeneration.startedAt} templates={currentDefinition.templates} onTemplateSelect={handleTemplateSelect} imageEditAction={settings.imageEditAction} selectedEditTemplateUrl={assets.find((item) => ["background", "garment", "face"].includes(item.role))?.url} onImageEditTemplateSelect={handleImageEditTemplateSelect} onEditResult={handleResultEdit} prompt={currentPrompt} onPromptChange={(value) => changeSetting("prompt", value)} onOptimizePrompt={() => void optimizeCurrentPrompt()} optimizing={optimizingMode === mode} onGenerate={submit} onPasteImages={handlePromptImagePaste} promptDisabled={currentGeneration.starting || imageTaskActive || optimizingMode === mode || (imageModels.length > 0 && !supportedOperations.includes(currentOperation))} onCancel={imageTaskActive ? () => void cancelGeneration(mode) : undefined} cancelDisabled={currentGeneration.task?.status === "cancel_requested"} generateLabel={t("studio.generate")} />
      </div>

      <ImageEditModal open={editorOpen} imageName="生成结果" imageSrc={editorImageSrc} isSubmitting={generationStates[editorMode].starting} onClose={() => setEditorOpen(false)} onSubmit={submitFromMaskEditor} />
    </div>
  );
}
