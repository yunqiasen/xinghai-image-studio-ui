import { CircleGauge, Film, Maximize2, Play, Sparkles, Volume2, WandSparkles } from "lucide-react";

import { useLanguage } from "@/components/language-provider";

import { PREVIEW_PANEL_CLASS_NAME } from "./layout-constants";
import type { VideoAspectRatio, VideoDuration, VideoMotion, VideoResolution } from "./video-settings";

type VideoPreviewProps = {
  aspectRatio: VideoAspectRatio;
  duration: VideoDuration;
  motion: VideoMotion;
  prompt: string;
  resolution: VideoResolution;
  sourceUrl?: string;
  onGenerate: () => void;
  onOptimizePrompt: () => void;
  onPromptChange: (value: string) => void;
  promptDisabled?: boolean;
};

function formatDuration(duration: VideoDuration) {
  return `00:${String(duration).padStart(2, "0")}`;
}

export function VideoPreview({
  aspectRatio,
  duration,
  motion,
  prompt,
  resolution,
  sourceUrl = "",
  onGenerate,
  onOptimizePrompt,
  onPromptChange,
  promptDisabled = false,
}: VideoPreviewProps) {
  const { t } = useLanguage();
  const motionLabel = motion === "gentle"
    ? t("studio.videoMotion.gentle")
    : motion === "dynamic"
      ? t("studio.videoMotion.dynamic")
      : t("studio.videoMotion.balanced");

  return (
    <section className={PREVIEW_PANEL_CLASS_NAME} data-preview-kind="video" data-preview-state="empty">
      <header className="flex min-h-[74px] items-center justify-between gap-4 border-b border-[#e3e8ef] px-5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.24em] text-[#0f8fa5]">VIDEO PREVIEW</p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.04em] text-[#152238]">{t("videoPreview.title")}</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">{t("videoPreview.description")}</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="studio-preview-chip rounded-[10px] border border-[#dce3ec] bg-[#f8fafc] px-3 py-2">{t("videoPreview.statusIdle")}</span>
          <span className="studio-preview-chip rounded-[10px] border border-[#dce3ec] bg-[#f8fafc] px-3 py-2">{aspectRatio} · {resolution.toUpperCase()} · {t("studio.seconds", { count: duration })}</span>
        </div>
      </header>

      <div className="studio-preview-body relative grid min-h-0 overflow-hidden gap-2.5 bg-[linear-gradient(145deg,#eaf1f5,#f0eef5)] p-2.5 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="studio-video-canvas relative grid h-full min-h-0 place-items-center overflow-hidden rounded-[18px] border border-[#cbd9e2] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.13),transparent_30%),radial-gradient(circle_at_82%_82%,rgba(168,85,247,.13),transparent_33%),linear-gradient(145deg,#111827,#080b13)] p-4 shadow-inner shadow-slate-950/24">
          <div aria-label={t("videoPreview.player")} className="relative w-full max-w-[720px] overflow-hidden rounded-[18px] border border-white/14 bg-[#06080d] shadow-[0_28px_70px_rgba(2,6,23,.38)]" style={{ aspectRatio: aspectRatio.replace(":", " / ") }}>
            {sourceUrl ? <img alt={t("videoPreview.posterAlt")} className="absolute inset-0 h-full w-full select-none object-cover opacity-80" data-video-poster="true" draggable={false} src={sourceUrl} /> : null}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,.06),rgba(3,7,18,.18)_52%,rgba(3,7,18,.78))]" />
            <div className="absolute inset-0 grid place-items-center px-6 pb-11 text-center text-white">
              <div>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/24 bg-white/12 text-white shadow-[0_12px_36px_rgba(0,0,0,.3)] backdrop-blur-md"><Play className="ml-1" fill="currentColor" size={25} /></span>
                <p className="mt-4 text-base font-semibold">{t("videoPreview.waiting")}</p>
                <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-5 text-white/58">{t("videoPreview.waitingHelp")}</p>
              </div>
            </div>
            <div aria-label={t("videoPreview.timeline")} className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/48 px-3 py-2.5 text-white backdrop-blur-md">
              <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/18"><div className="h-full w-0 rounded-full bg-cyan-300" /></div>
              <div className="flex items-center justify-between gap-3 text-[10px] text-white/72">
                <div className="flex items-center gap-2.5"><Play fill="currentColor" size={12} /><Volume2 size={13} /><span className="font-mono tabular-nums">00:00 / {formatDuration(duration)}</span></div>
                <div className="flex items-center gap-2"><span>{resolution.toUpperCase()}</span><Maximize2 size={13} /></div>
              </div>
            </div>
          </div>
          <span className="pointer-events-none absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/26 px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] text-white/64 backdrop-blur"><Film size={12} />{t("videoPreview.player")}</span>
        </div>

        <aside aria-label={t("preview.info")} className="grid min-h-0 content-start gap-2.5 overflow-y-auto sm:grid-cols-2 lg:grid-cols-1">
          <section className="studio-info-card rounded-2xl border border-[#cfe7eb] bg-[linear-gradient(145deg,rgba(235,251,252,.96),rgba(255,255,255,.9))] p-3 shadow-[0_10px_26px_rgba(46,58,76,.055)]">
            <p className="text-[9px] font-bold tracking-[0.16em] text-[#12839a]">{t("videoPreview.output")}</p>
            <dl className="mt-2.5 grid gap-2 text-[9px] text-slate-500">
              <div className="flex justify-between gap-2"><dt>{t("studio.videoRatio")}</dt><dd className="font-semibold text-[#27364b]">{aspectRatio}</dd></div>
              <div className="flex justify-between gap-2"><dt>{t("studio.videoResolution")}</dt><dd className="font-semibold text-[#27364b]">{resolution.toUpperCase()}</dd></div>
              <div className="flex justify-between gap-2"><dt>{t("videoPreview.duration")}</dt><dd className="font-semibold text-[#27364b]">{t("studio.seconds", { count: duration })}</dd></div>
              <div className="flex justify-between gap-2"><dt>{t("videoPreview.motion")}</dt><dd className="font-semibold text-[#27364b]">{motionLabel}</dd></div>
            </dl>
          </section>

          <section className="studio-info-card rounded-2xl border border-[#ded8f5] bg-[linear-gradient(145deg,rgba(246,243,255,.96),rgba(255,255,255,.9))] p-3 shadow-[0_10px_26px_rgba(46,58,76,.055)]">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#ebe5ff] text-[#7651c7]"><CircleGauge size={16} /></span>
            <p className="mt-2 text-[9px] font-bold tracking-[0.16em] text-slate-400">{t("videoPreview.task")}</p>
            <p className="mt-1.5 text-xs font-semibold text-[#1e2d43]">{t("videoPreview.taskTitle")}</p>
            <p className="mt-1 text-[9px] leading-4 text-slate-500">{t("videoPreview.taskHelp")}</p>
          </section>
        </aside>
      </div>

      <footer className="grid min-h-[78px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-[#e3e8ef] bg-white px-3 text-[10px] text-slate-500">
        <div className="min-w-0"><textarea aria-label={t("studio.videoPromptLabel")} className="h-14 w-full resize-none rounded-xl border border-cyan-200 bg-cyan-50/35 px-3 py-2 text-sm leading-5 text-[#27364b] outline-none placeholder:text-slate-400 focus:border-cyan-500" placeholder={t("studio.videoPromptLabel")} value={prompt} onChange={(event) => onPromptChange(event.target.value)} /></div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button aria-label={t("studio.optimizePrompt")} className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-cyan-200 bg-cyan-50 px-2.5 text-[11px] font-bold text-cyan-800 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-45" disabled={promptDisabled || !prompt.trim()} onClick={onOptimizePrompt} type="button"><WandSparkles size={14} />{t("studio.optimizePrompt")}</button>
          <button aria-label={t("studio.generateVideo")} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(115deg,#0891b2,#7c3aed)] px-4 text-xs font-bold text-white shadow-[0_10px_24px_rgba(8,145,178,.22)] disabled:cursor-not-allowed disabled:opacity-60" disabled={promptDisabled} onClick={onGenerate} type="button"><Sparkles size={15} />{t("studio.generateVideo")}</button>
        </div>
      </footer>
    </section>
  );
}
