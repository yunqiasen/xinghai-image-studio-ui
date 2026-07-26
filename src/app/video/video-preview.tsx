import { AlertCircle, CircleGauge, Film, LoaderCircle, Play, Sparkles, WandSparkles } from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import { isActiveVideoTask, videoTaskError } from "@/lib/video-tasks/state";
import type { VideoTask } from "@/lib/video-tasks/types";

import { PREVIEW_PANEL_CLASS_NAME } from "../studio/layout-constants";
import type { VideoAspectRatio, VideoDuration, VideoMotion, VideoResolution } from "./video-settings";

type VideoPreviewProps = {
  aspectRatio: VideoAspectRatio;
  duration: VideoDuration;
  motion: VideoMotion;
  prompt: string;
  resolution: VideoResolution;
  sourceUrl?: string;
  task?: VideoTask;
  creating?: boolean;
  error?: string;
  optimizing?: boolean;
  onGenerate: () => void;
  onOptimizePrompt: () => void;
  onPromptChange: (value: string) => void;
  promptDisabled?: boolean;
};

function formatDuration(duration: number) {
  const seconds = Math.max(0, Math.round(duration));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function VideoPreview({
  aspectRatio,
  duration,
  motion,
  prompt,
  resolution,
  sourceUrl = "",
  task,
  creating = false,
  error,
  optimizing = false,
  onGenerate,
  onOptimizePrompt,
  onPromptChange,
  promptDisabled = false,
}: VideoPreviewProps) {
  const { t } = useLanguage();
  const taskError = error || videoTaskError(task);
  const active = creating || isActiveVideoTask(task);
  const succeeded = task?.status === "succeeded" && Boolean(task.url);
  const previewState = taskError ? "error" : succeeded ? "results" : active ? "loading" : "empty";
  const outputRatio = task?.aspectRatio || aspectRatio;
  const outputResolution = task?.resolution || resolution;
  const outputDuration = task?.seconds || task?.requestedSeconds || duration;
  const outputMotion = task?.motion || motion;
  const progress = creating ? 0 : Math.max(0, Math.min(100, task?.progress || 0));
  const motionLabel = outputMotion === "gentle"
    ? t("studio.videoMotion.gentle")
    : outputMotion === "dynamic"
      ? t("studio.videoMotion.dynamic")
      : t("studio.videoMotion.balanced");
  const statusLabel = creating
    ? t("videoPreview.statusSubmitting")
    : task?.status === "queued"
      ? t("videoPreview.statusQueued")
      : task?.status === "submitting"
        ? t("videoPreview.statusSubmitting")
        : task?.status === "in_progress"
          ? t("videoPreview.statusGenerating")
          : task?.status === "succeeded"
            ? t("videoPreview.statusSucceeded")
            : task?.status === "failed"
              ? t("videoPreview.statusFailed")
              : t("videoPreview.statusIdle");

  return (
    <section className={PREVIEW_PANEL_CLASS_NAME} data-preview-kind="video" data-preview-state={previewState}>
      <header className="flex min-h-[74px] items-center justify-between gap-4 border-b border-[#e3e8ef] px-5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.24em] text-[#0f8fa5]">VIDEO PREVIEW</p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.04em] text-[#152238]">{t("videoPreview.title")}</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">{t("videoPreview.description")}</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="studio-preview-chip rounded-[10px] border border-[#dce3ec] bg-[#f8fafc] px-3 py-2">{statusLabel}</span>
          <span className="studio-preview-chip rounded-[10px] border border-[#dce3ec] bg-[#f8fafc] px-3 py-2">{outputRatio} · {outputResolution.toUpperCase()} · {t("studio.seconds", { count: outputDuration })}</span>
        </div>
      </header>

      <div className="studio-preview-body relative grid min-h-0 overflow-hidden gap-2.5 bg-[linear-gradient(145deg,#eaf1f5,#f0eef5)] p-2.5 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="studio-video-canvas relative grid h-full min-h-0 place-items-center overflow-hidden rounded-[18px] border border-[#cbd9e2] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.13),transparent_30%),radial-gradient(circle_at_82%_82%,rgba(168,85,247,.13),transparent_33%),linear-gradient(145deg,#111827,#080b13)] p-4 shadow-inner shadow-slate-950/24">
          <div aria-label={t("videoPreview.player")} className="relative w-full max-w-[720px] overflow-hidden rounded-[18px] border border-white/14 bg-[#06080d] shadow-[0_28px_70px_rgba(2,6,23,.38)]" style={{ aspectRatio: outputRatio.replace(":", " / ") }}>
            {succeeded ? (
              <video className="absolute inset-0 h-full w-full bg-black object-contain" controls playsInline preload="metadata" src={task?.url} />
            ) : (
              <>
                {sourceUrl ? <img alt={t("videoPreview.posterAlt")} className="absolute inset-0 h-full w-full select-none object-cover opacity-80" data-video-poster="true" draggable={false} src={sourceUrl} /> : null}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,.06),rgba(3,7,18,.18)_52%,rgba(3,7,18,.78))]" />
                <div className="absolute inset-0 grid place-items-center px-6 pb-11 text-center text-white">
                  {taskError ? (
                    <div className="max-w-sm"><AlertCircle className="mx-auto text-rose-300" size={42} /><p className="mt-4 text-base font-semibold">{t("videoPreview.statusFailed")}</p><p className="mt-2 text-[11px] leading-5 text-white/70">{taskError}</p></div>
                  ) : active ? (
                    <div><LoaderCircle className="mx-auto animate-spin text-cyan-200" size={44} /><p className="mt-4 text-base font-semibold">{statusLabel}</p><p className="mt-2 text-sm font-bold text-cyan-200">{progress}%</p></div>
                  ) : (
                    <div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/24 bg-white/12 text-white shadow-[0_12px_36px_rgba(0,0,0,.3)] backdrop-blur-md"><Play className="ml-1" fill="currentColor" size={25} /></span><p className="mt-4 text-base font-semibold">{t("videoPreview.waiting")}</p><p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-5 text-white/58">{t("videoPreview.waitingHelp")}</p></div>
                  )}
                </div>
                <div aria-label={t("videoPreview.timeline")} className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/48 px-3 py-2.5 text-white backdrop-blur-md">
                  <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/18"><div className="h-full rounded-full bg-cyan-300 transition-[width]" style={{ width: `${progress}%` }} /></div>
                  <div className="flex items-center justify-between gap-3 text-[10px] text-white/72"><span className="font-mono tabular-nums">{progress}%</span><span>{formatDuration(outputDuration)}</span></div>
                </div>
              </>
            )}
          </div>
          <span className="pointer-events-none absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/26 px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] text-white/64 backdrop-blur"><Film size={12} />{t("videoPreview.player")}</span>
        </div>

        <aside aria-label={t("preview.info")} className="grid min-h-0 content-start gap-2.5 overflow-y-auto sm:grid-cols-2 lg:grid-cols-1">
          <section className="studio-info-card rounded-2xl border border-[#cfe7eb] bg-[linear-gradient(145deg,rgba(235,251,252,.96),rgba(255,255,255,.9))] p-3 shadow-[0_10px_26px_rgba(46,58,76,.055)]">
            <p className="text-[9px] font-bold tracking-[0.16em] text-[#12839a]">{t("videoPreview.output")}</p>
            <dl className="mt-2.5 grid gap-2 text-[9px] text-slate-500">
              <div className="flex justify-between gap-2"><dt>{t("studio.videoRatio")}</dt><dd className="font-semibold text-[#27364b]">{outputRatio}</dd></div>
              <div className="flex justify-between gap-2"><dt>{t("studio.videoResolution")}</dt><dd className="font-semibold text-[#27364b]">{outputResolution.toUpperCase()}</dd></div>
              <div className="flex justify-between gap-2"><dt>{t("videoPreview.duration")}</dt><dd className="font-semibold text-[#27364b]">{outputDuration}</dd></div>
              <div className="flex justify-between gap-2"><dt>{t("videoPreview.motion")}</dt><dd className="font-semibold text-[#27364b]">{motionLabel}</dd></div>
              {task?.size ? <div className="flex justify-between gap-2"><dt>{t("videoPreview.actualSize")}</dt><dd className="font-semibold text-[#27364b]">{task.size}</dd></div> : null}
            </dl>
          </section>

          <section className="studio-info-card rounded-2xl border border-[#ded8f5] bg-[linear-gradient(145deg,rgba(246,243,255,.96),rgba(255,255,255,.9))] p-3 shadow-[0_10px_26px_rgba(46,58,76,.055)]">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#ebe5ff] text-[#7651c7]"><CircleGauge size={16} /></span>
            <p className="mt-2 text-[9px] font-bold tracking-[0.16em] text-slate-400">{t("videoPreview.task")}</p>
            <p className="mt-1.5 text-xs font-semibold text-[#1e2d43]">{statusLabel}</p>
            <p className="mt-1 text-[9px] leading-4 text-slate-500">{task ? t("videoPreview.taskId", { id: task.id }) : t("videoPreview.taskHelp")}</p>
            {task ? <p className="mt-2 text-[9px] font-semibold text-[#7651c7]">{t("videoPreview.cost", { count: task.creditCost })}</p> : null}
          </section>
        </aside>
      </div>

      <footer className="grid min-h-[78px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-[#e3e8ef] bg-white px-3 text-[10px] text-slate-500">
        <div className="min-w-0"><textarea aria-label={t("studio.videoPromptLabel")} className="h-14 w-full resize-none rounded-xl border border-cyan-200 bg-cyan-50/35 px-3 py-2 text-sm leading-5 text-[#27364b] outline-none placeholder:text-slate-400 focus:border-cyan-500" disabled={promptDisabled} placeholder={t("studio.videoPromptLabel")} value={prompt} onChange={(event) => onPromptChange(event.target.value)} /></div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button aria-label={t("studio.optimizePrompt")} className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-cyan-200 bg-cyan-50 px-2.5 text-[11px] font-bold text-cyan-800 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-45" disabled={promptDisabled || optimizing || !prompt.trim()} onClick={onOptimizePrompt} type="button"><WandSparkles size={14} />{optimizing ? t("studio.optimizing") : t("studio.optimizePrompt")}</button>
          <button aria-label={t("studio.generateVideo")} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(115deg,#0891b2,#7c3aed)] px-4 text-xs font-bold text-white shadow-[0_10px_24px_rgba(8,145,178,.22)] disabled:cursor-not-allowed disabled:opacity-60" disabled={promptDisabled} onClick={onGenerate} type="button"><Sparkles size={15} />{t("studio.generateVideo")}</button>
        </div>
      </footer>
    </section>
  );
}
