import { Clapperboard, Film } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/components/language-modes";
import { createLocalId } from "@/lib/client-id";
import { optimizePrompt } from "@/lib/prompt-optimizer/client";
import { createVideoTask, getVideoTask, listVideoModels, listVideoTasks } from "@/lib/video-tasks/client";
import { isActiveVideoTask, latestVideoTaskForMode, modelsForVideoMode, videoTaskError } from "@/lib/video-tasks/state";
import type { VideoModel, VideoStudioMode, VideoTask } from "@/lib/video-tasks/types";
import { loadCurrentUser } from "@/lib/storage/local-session";
import { useSessionUser } from "@/lib/storage/session-hooks";

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
} from "../studio/layout-constants";
import { MAX_STUDIO_PROMPT_LENGTH } from "../studio/route-prompt";
import { VideoPreview } from "./video-preview";
import { createInitialVideoSettings, reconcileVideoSettings, videoCreditCost } from "./video-settings-state";
import { VideoSettings, type VideoAsset, type VideoSettingsValue } from "./video-settings";

const videoModes: Array<{ mode: VideoStudioMode; labelKey: TranslationKey; descriptionKey: TranslationKey; icon: typeof Film }> = [
  { mode: "video-text", labelKey: "studio.mode.videoText.short", descriptionKey: "studio.mode.videoText.description", icon: Film },
  { mode: "video-image", labelKey: "studio.mode.videoImage.short", descriptionKey: "studio.mode.videoImage.description", icon: Clapperboard },
];

function createInitialPrompts(): Record<VideoStudioMode, string> {
  return { "video-text": "", "video-image": "" };
}

function createInitialAssets(): Record<VideoStudioMode, VideoAsset[]> {
  return { "video-text": [], "video-image": [] };
}

function sourceForPrompt(asset: VideoAsset | undefined) {
  if (!asset) return undefined;
  if (asset.dataUrl) return asset.dataUrl;
  if (!asset.url) return undefined;
  if (/^https?:\/\//i.test(asset.url)) return asset.url;
  if (typeof window !== "undefined") return new URL(asset.url, window.location.origin).toString();
  return asset.url;
}

function replaceTask(tasks: VideoTask[], next: VideoTask) {
  const index = tasks.findIndex((item) => item.id === next.id);
  if (index < 0) return [next, ...tasks];
  return tasks.map((item, itemIndex) => itemIndex === index ? next : item);
}

export function VideoPage() {
  const { t } = useLanguage();
  const { user } = useSessionUser();
  const userId = user?.id;
  const [mode, setMode] = useState<VideoStudioMode>("video-text");
  const [settings, setSettings] = useState(createInitialVideoSettings);
  const [prompts, setPrompts] = useState(createInitialPrompts);
  const [assets, setAssets] = useState(createInitialAssets);
  const [models, setModels] = useState<VideoModel[]>([]);
  const [tasks, setTasks] = useState<VideoTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [creatingMode, setCreatingMode] = useState<VideoStudioMode | null>(null);
  const [optimizingMode, setOptimizingMode] = useState<VideoStudioMode | null>(null);
  const taskStatusRef = useRef(new Map<string, VideoTask["status"]>());

  const currentSettings = settings[mode];
  const currentPrompt = prompts[mode];
  const currentAssets = assets[mode];
  const currentCandidates = useMemo(() => modelsForVideoMode(models, mode), [models, mode]);
  const currentModel = currentCandidates.find((item) => item.slug === currentSettings.model) || currentCandidates[0];
  const currentTask = useMemo(() => latestVideoTaskForMode(tasks, mode), [mode, tasks]);
  const sourceUrl = currentAssets[0]?.dataUrl || currentAssets[0]?.url || "";
  const currentMode = videoModes.find((item) => item.mode === mode) || videoModes[0];
  const currentModelLabel = currentModel?.name || t("studio.videoModelsLogin");
  const cost = videoCreditCost(currentModel, currentSettings.duration);
  const active = Boolean(currentTask && isActiveVideoTask(currentTask));
  const busy = creatingMode === mode || active;

  const mergeTasks = useCallback((nextTasks: VideoTask[]) => {
    for (const task of nextTasks) {
      const previous = taskStatusRef.current.get(task.id);
      taskStatusRef.current.set(task.id, task.status);
      if (previous && previous !== task.status && !isActiveVideoTask(task)) void loadCurrentUser().catch(() => undefined);
    }
    setTasks((previous) => nextTasks.reduce(replaceTask, previous));
  }, []);

  useEffect(() => {
    taskStatusRef.current.clear();
    setModels([]);
    setTasks([]);
    setApiError("");
    if (!userId) return;
    let mounted = true;
    setLoading(true);
    Promise.all([listVideoModels(), listVideoTasks()])
      .then(([nextModels, nextTasks]) => {
        if (!mounted) return;
        setModels(nextModels);
        mergeTasks(nextTasks);
      })
      .catch((error) => {
        if (mounted) setApiError(error instanceof Error ? error.message : "视频配置加载失败");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [mergeTasks, userId]);

  useEffect(() => {
    if (!models.length) return;
    setSettings((previous) => {
      const next = { ...previous };
      for (const item of videoModes) {
        const candidates = modelsForVideoMode(models, item.mode);
        const selected = candidates.find((model) => model.slug === next[item.mode].model) || candidates[0];
        if (selected) next[item.mode] = reconcileVideoSettings(next[item.mode], selected);
      }
      return next;
    });
  }, [models]);

  useEffect(() => {
    if (!userId || !tasks.some(isActiveVideoTask)) return;
    const timer = window.setInterval(() => {
      const activeTasks = tasks.filter(isActiveVideoTask);
      void Promise.all(activeTasks.map((task) => getVideoTask(task.id)))
        .then((nextTasks) => mergeTasks(nextTasks))
        .catch((error) => setApiError(error instanceof Error ? error.message : "视频任务同步失败"));
    }, 2000);
    return () => window.clearInterval(timer);
  }, [mergeTasks, tasks, userId]);

  function changeSetting<K extends keyof VideoSettingsValue>(key: K, value: VideoSettingsValue[K]) {
    if (key === "model") {
      const selected = currentCandidates.find((item) => item.slug === String(value));
      if (selected) setSettings((previous) => ({ ...previous, [mode]: reconcileVideoSettings({ ...previous[mode], model: selected.slug }, selected) }));
      return;
    }
    setSettings((previous) => ({ ...previous, [mode]: { ...previous[mode], [key]: value } }));
  }

  function changePrompt(value: string) {
    setPrompts((previous) => ({ ...previous, [mode]: value.slice(0, MAX_STUDIO_PROMPT_LENGTH) }));
  }

  async function appendFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error(t("studio.error.readImage")));
      reader.readAsDataURL(file);
    });
    const asset: VideoAsset = { id: createLocalId(), name: file.name || t("studio.videoStartFrame"), dataUrl, url: "", role: "image" };
    setAssets((previous) => ({ ...previous, [mode]: [asset] }));
  }

  function removeAsset(id: string) {
    setAssets((previous) => ({ ...previous, [mode]: previous[mode].filter((item) => item.id !== id) }));
  }

  async function handleOptimizePrompt() {
    const prompt = currentPrompt.trim();
    if (!prompt || optimizingMode || busy) return;
    if (!user) {
      toast.error(t("studio.error.login"));
      return;
    }
    setOptimizingMode(mode);
    try {
      const result = await optimizePrompt({
        profile: mode === "video-image" ? "image_to_video" : "text_to_video",
        prompt,
        duration: currentSettings.duration,
        resolution: currentSettings.resolution,
        motion: currentSettings.motion,
        sourceImage: sourceForPrompt(currentAssets[0]),
      });
      setPrompts((previous) => ({ ...previous, [mode]: result.optimizedPrompt.slice(0, MAX_STUDIO_PROMPT_LENGTH) }));
      toast.success(result.fallback ? t("studio.optimizeFallback") : t("studio.optimizeDone"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("studio.error.create"));
    } finally {
      setOptimizingMode(null);
    }
  }

  async function submit() {
    if (!user) {
      toast.error(t("studio.error.login"));
      return;
    }
    if (!currentModel) {
      toast.error(t("studio.videoModelRequired"));
      return;
    }
    if (!currentPrompt.trim()) {
      toast.error(t("studio.videoPromptRequired"));
      return;
    }
    if (mode === "video-image" && !sourceUrl) {
      toast.error(t("studio.videoSourceRequired"));
      return;
    }
    setCreatingMode(mode);
    setApiError("");
    try {
      const task = await createVideoTask({
        model: currentModel.slug,
        prompt: currentPrompt.trim(),
        optimizedPrompt: currentPrompt.trim(),
        sourceImage: mode === "video-image" ? sourceForPrompt(currentAssets[0]) : undefined,
        aspectRatio: currentSettings.aspectRatio,
        resolution: currentSettings.resolution,
        duration: currentSettings.duration,
        motion: currentSettings.motion,
      });
      mergeTasks([task]);
      void loadCurrentUser().catch(() => undefined);
      toast.success(t("studio.videoSubmitted"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("studio.error.create"));
    } finally {
      setCreatingMode(null);
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
              <div className="select-text"><p className="text-[10px] font-bold tracking-[0.22em] text-[#67e8f9]">XINGHAI VIDEO</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-white">{t("nav.videoCreate")}</h1></div>
              <div className="rounded-[12px] border border-white/12 bg-white/7 px-3.5 py-2 text-xs font-semibold text-white select-text">{t("studio.videoReadyBadge")}</div>
            </header>

            <div className={STUDIO_EDITOR_BODY_CLASS_NAME}>
              <aside className={STUDIO_MODE_RAIL_CLASS_NAME}>
                <div className="flex items-baseline justify-between gap-2 select-text"><p className="text-sm font-semibold text-white/90">{t("studio.videoCreationType")}</p><span className="text-[10px] text-white/40">{t("studio.chooseFeature")}</span></div>
                <div className="mt-3 grid grid-cols-2 gap-1.5 lg:grid-cols-1">
                  {videoModes.map((item) => {
                    const activeMode = mode === item.mode;
                    const Icon = item.icon;
                    return <button key={item.mode} aria-pressed={activeMode} className={`${MODE_OPTION_CLASS_NAME} ${activeMode ? "border-[#22d3ee] bg-[linear-gradient(135deg,rgba(8,145,178,.5),rgba(76,29,149,.48))] text-white shadow-[0_0_0_1px_rgba(34,211,238,.18),0_10px_26px_rgba(8,145,178,.12)]" : "border-white/9 bg-white/[0.045] text-white/72 hover:border-white/18 hover:bg-white/[0.075]"}`} onClick={() => setMode(item.mode)} title={t(item.descriptionKey)} type="button"><span className={`grid h-8.5 w-8.5 shrink-0 place-items-center rounded-[11px] ${activeMode ? "bg-cyan-400/16 text-cyan-100" : "bg-white/7 text-white/55"}`}><Icon size={16} /></span><span className="min-w-0"><b className="block text-[13px] leading-4.5">{t(item.labelKey)}</b><span className="mt-0.5 block truncate text-[9.5px] text-white/42">{t(item.descriptionKey)}</span></span></button>;
                  })}
                </div>
              </aside>

              <div className={STUDIO_PARAMETER_SCROLL_CLASS_NAME}>
                {!user ? <div className="rounded-2xl border border-[#22d3ee]/20 bg-[#0891b2]/10 px-3 py-2.5 text-xs text-[#cffafe] select-text">{t("studio.videoLoginNotice")}<Link to="/login" className="ml-2 font-semibold text-white underline underline-offset-4">{t("studio.goLogin")}</Link></div> : null}
                {apiError ? <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-3 py-2.5 text-xs text-rose-100 select-text">{apiError}</div> : null}
                {loading ? <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/60 select-text">{t("studio.videoModelsLoading")}</div> : null}
                <VideoSettings mode={mode} value={currentSettings} assets={currentAssets} models={currentCandidates} onChange={changeSetting} onFiles={(files) => void appendFiles(files)} onRemoveAsset={removeAsset} />
              </div>
            </div>

            <footer className={STUDIO_ACTION_BAR_CLASS_NAME}>
              <div className="min-w-0 select-text"><p className="truncate text-xs font-semibold text-white">{t(currentMode.labelKey)} · {t("studio.seconds", { count: currentSettings.duration })} · {currentSettings.resolution.toUpperCase()}</p><p className="mt-1 text-[9px] text-white/38">{cost === undefined ? t("studio.videoCostPending") : t("studio.videoCost", { count: cost })}</p></div>
              <div className="select-text text-right"><p className="text-[9px] text-white/38">{t("preview.engine")}</p><p className="text-xs font-semibold text-white/80">{currentModelLabel}</p></div>
            </footer>
          </div>
        </section>

        <VideoPreview aspectRatio={currentSettings.aspectRatio} duration={currentSettings.duration} motion={currentSettings.motion} prompt={currentPrompt} resolution={currentSettings.resolution} sourceUrl={sourceUrl} task={currentTask} creating={creatingMode === mode} error={currentTask ? videoTaskError(currentTask) : undefined} optimizing={optimizingMode === mode} onGenerate={() => void submit()} onOptimizePrompt={() => void handleOptimizePrompt()} onPromptChange={changePrompt} promptDisabled={busy || loading || !user} />
      </div>
    </div>
  );
}
