import { Clapperboard, Film } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/components/language-modes";
import { createLocalId } from "@/lib/client-id";
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
import { createInitialVideoSettings, videoModeModels } from "./video-settings-state";
import { VideoSettings, type VideoAsset, type VideoSettingsValue, type VideoStudioMode } from "./video-settings";

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

export function VideoPage() {
  const { t } = useLanguage();
  const { user } = useSessionUser();
  const [mode, setMode] = useState<VideoStudioMode>("video-text");
  const [settings, setSettings] = useState(createInitialVideoSettings);
  const [prompts, setPrompts] = useState(createInitialPrompts);
  const [assets, setAssets] = useState(createInitialAssets);

  const currentSettings = settings[mode];
  const currentPrompt = prompts[mode];
  const currentAssets = assets[mode];
  const sourceUrl = currentAssets[0]?.dataUrl || currentAssets[0]?.url || "";
  const currentMode = videoModes.find((item) => item.mode === mode) || videoModes[0];
  const currentModelLabel = videoModeModels[mode].find((item) => item.value === currentSettings.model)?.label || videoModeModels[mode][0].label;

  function changeSetting<K extends keyof VideoSettingsValue>(key: K, value: VideoSettingsValue[K]) {
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

  function optimizePrompt() {
    const prompt = currentPrompt.trim();
    if (!prompt || prompt.includes("镜头运动自然")) return;
    changePrompt(`${prompt}，镜头运动自然，主体动作连贯，节奏清晰，光影稳定，画面流畅，电影感`);
  }

  function submit() {
    toast.info(t("studio.videoComingSoon"));
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
              <div className="rounded-[12px] border border-white/12 bg-white/7 px-3.5 py-2 text-xs font-semibold text-white select-text">{t("studio.videoPreviewBadge")}</div>
            </header>

            <div className={STUDIO_EDITOR_BODY_CLASS_NAME}>
              <aside className={STUDIO_MODE_RAIL_CLASS_NAME}>
                <div className="flex items-baseline justify-between gap-2 select-text"><p className="text-sm font-semibold text-white/90">{t("studio.videoCreationType")}</p><span className="text-[10px] text-white/40">{t("studio.chooseFeature")}</span></div>
                <div className="mt-3 grid grid-cols-2 gap-1.5 lg:grid-cols-1">
                  {videoModes.map((item) => {
                    const active = mode === item.mode;
                    const Icon = item.icon;
                    return <button key={item.mode} aria-pressed={active} className={`${MODE_OPTION_CLASS_NAME} ${active ? "border-[#22d3ee] bg-[linear-gradient(135deg,rgba(8,145,178,.5),rgba(76,29,149,.48))] text-white shadow-[0_0_0_1px_rgba(34,211,238,.18),0_10px_26px_rgba(8,145,178,.12)]" : "border-white/9 bg-white/[0.045] text-white/72 hover:border-white/18 hover:bg-white/[0.075]"}`} onClick={() => setMode(item.mode)} title={t(item.descriptionKey)} type="button"><span className={`grid h-8.5 w-8.5 shrink-0 place-items-center rounded-[11px] ${active ? "bg-cyan-400/16 text-cyan-100" : "bg-white/7 text-white/55"}`}><Icon size={16} /></span><span className="min-w-0"><b className="block text-[13px] leading-4.5">{t(item.labelKey)}</b><span className="mt-0.5 block truncate text-[9.5px] text-white/42">{t(item.descriptionKey)}</span></span></button>;
                  })}
                </div>
              </aside>

              <div className={STUDIO_PARAMETER_SCROLL_CLASS_NAME}>
                {!user ? <div className="rounded-2xl border border-[#22d3ee]/20 bg-[#0891b2]/10 px-3 py-2.5 text-xs text-[#cffafe] select-text">{t("studio.videoLoginNotice")}<Link to="/login" className="ml-2 font-semibold text-white underline underline-offset-4">{t("studio.goLogin")}</Link></div> : null}
                <VideoSettings mode={mode} value={currentSettings} assets={currentAssets} onChange={changeSetting} onFiles={(files) => void appendFiles(files)} onRemoveAsset={removeAsset} />
              </div>
            </div>

            <footer className={STUDIO_ACTION_BAR_CLASS_NAME}>
              <div className="min-w-0 select-text"><p className="truncate text-xs font-semibold text-white">{t(currentMode.labelKey)} · {t("studio.seconds", { count: currentSettings.duration })} · {currentSettings.resolution.toUpperCase()}</p><p className="mt-1 text-[9px] text-white/38">{t("studio.videoCostPending")}</p></div>
              <div className="select-text text-right"><p className="text-[9px] text-white/38">{t("preview.engine")}</p><p className="text-xs font-semibold text-white/80">{currentModelLabel}</p></div>
            </footer>
          </div>
        </section>

        <VideoPreview aspectRatio={currentSettings.aspectRatio} duration={currentSettings.duration} motion={currentSettings.motion} prompt={currentPrompt} resolution={currentSettings.resolution} sourceUrl={sourceUrl} onGenerate={submit} onOptimizePrompt={optimizePrompt} onPromptChange={changePrompt} />
      </div>
    </div>
  );
}
