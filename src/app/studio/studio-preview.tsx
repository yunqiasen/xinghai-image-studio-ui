import {
  AlertCircle,
  ExternalLink,
  LoaderCircle,
  Maximize2,
  Minus,
  Plus,
  ScanLine,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";

import { useLanguage } from "@/components/language-provider";
import type { ResolutionTier } from "@/lib/billing/pricing";
import type { StudioAspectRatio } from "@/lib/image2api/size-presets";

import { PREVIEW_PANEL_CLASS_NAME } from "./layout-constants";
import type { StudioPromptTemplate } from "./mode-config";
import type { StudioMode } from "@/lib/billing/pricing";
import { aspectRatioCss, formatGenerationElapsed, resultGridClass } from "./preview-layout";

type StudioPreviewProps = {
  mode: StudioMode;
  aspectRatio: StudioAspectRatio;
  resolution: ResolutionTier;
  count: number;
  busy: boolean;
  results: string[];
  error?: string;
  startedAt?: number;
  templates?: StudioPromptTemplate[];
  onTemplateSelect: (template: StudioPromptTemplate) => void;
  onEditResult: (url: string) => void;
  prompt?: string;
  onPromptChange?: (value: string) => void;
  onOptimizePrompt?: () => void;
  onGenerate?: () => void;
  promptDisabled?: boolean;
};

type DragOrigin = { pointerX: number; pointerY: number; offsetX: number; offsetY: number };

export function StudioPreview({
  mode,
  aspectRatio,
  resolution,
  count,
  busy,
  results,
  error,
  startedAt,
  templates = [],
  onTemplateSelect,
  onEditResult,
  prompt = "",
  onPromptChange = () => undefined,
  onOptimizePrompt = () => undefined,
  onGenerate = () => undefined,
  promptDisabled = false,
}: StudioPreviewProps) {
  const { t } = useLanguage();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [previewUrl, setPreviewUrl] = useState("");
  const dragOrigin = useRef<DragOrigin | null>(null);
  const ratio = useMemo(() => aspectRatioCss(aspectRatio), [aspectRatio]);
  const state = busy ? "loading" : error ? "error" : results.length ? "results" : "empty";

  useEffect(() => {
    if (!busy) {
      setElapsedMs(0);
      return;
    }
    const started = startedAt || Date.now();
    const updateElapsed = () => setElapsedMs(Date.now() - started);
    updateElapsed();
    const timer = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(timer);
  }, [busy, startedAt]);

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [aspectRatio, results]);

  useEffect(() => {
    if (!previewUrl) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setPreviewUrl(""); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [previewUrl]);

  function applyZoom(next: number) {
    const clamped = Math.min(1.8, Math.max(0.6, next));
    setZoom(clamped);
    if (clamped <= 1) setOffset({ x: 0, y: 0 });
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (results.length !== 1 || (!event.ctrlKey && !event.metaKey)) return;
    event.preventDefault();
    applyZoom(zoom + (event.deltaY < 0 ? 0.1 : -0.1));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (results.length !== 1 || zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragOrigin.current) return;
    setOffset({
      x: dragOrigin.current.offsetX + event.clientX - dragOrigin.current.pointerX,
      y: dragOrigin.current.offsetY + event.clientY - dragOrigin.current.pointerY,
    });
  }

  function stopDragging() {
    dragOrigin.current = null;
  }

  const syncTitle = busy ? t("preview.sync.generatingTitle") : error ? t("preview.sync.errorTitle") : results.length ? t("preview.sync.savedTitle") : t("preview.sync.waitTitle");
  const syncNote = busy
    ? t("preview.sync.generatingNote")
    : error
      ? t("preview.sync.errorNote")
      : results.length
        ? t("preview.sync.savedNote", { count: results.length })
        : t("preview.sync.waitNote");

  return (
    <section className={PREVIEW_PANEL_CLASS_NAME} data-preview-state={state}>
      <header className="relative flex min-h-[74px] items-center justify-between gap-4 border-b border-[#e3e8ef] px-5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.24em] text-[#7c3aed]">PREVIEW</p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.04em] text-[#152238]">{t("preview.title")}</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">{t("preview.description")}</p>
        </div>
        {results.length === 1 && !busy ? (
          <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-[11px] border border-[#dce3ec] bg-white/94 p-1 text-xs text-slate-500 shadow-lg shadow-slate-900/8 backdrop-blur">
              <button aria-label={t("preview.zoomOut")} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100" onClick={() => applyZoom(zoom - 0.1)} type="button"><Minus size={14} /></button>
              <span className="w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
              <button aria-label={t("preview.zoomIn")} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100" onClick={() => applyZoom(zoom + 0.1)} type="button"><Plus size={14} /></button>
              <button aria-label={t("preview.fit")} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100" onClick={() => applyZoom(1)} title={t("preview.fit")} type="button"><Maximize2 size={14} /></button>
              <button aria-label={t("studio.localEdit")} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[#7651c7] hover:bg-violet-50" onClick={() => onEditResult(results[0])} title={t("studio.localEdit")} type="button"><ScanLine size={14} /><span className="hidden xl:inline">{t("studio.localEdit")}</span></button>
              <button aria-label={t("preview.openOriginal")} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100" onClick={() => setPreviewUrl(results[0])} title={t("preview.openOriginal")} type="button"><ExternalLink size={14} /></button>
            </div>
        ) : null}


        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="studio-preview-chip rounded-[10px] border border-[#dce3ec] bg-[#f8fafc] px-3 py-2">
            {busy ? t("preview.status.generating") : results.length ? t(results.length === 1 ? "studio.result" : "studio.resultCount", { count: results.length }) : error ? t("preview.status.failed") : t("preview.status.idle")}
          </span>
          <span className="studio-preview-chip rounded-[10px] border border-[#dce3ec] bg-[#f8fafc] px-3 py-2">
            {aspectRatio} · {resolution.toUpperCase()}
          </span>
        </div>
      </header>

      <div className="studio-preview-body relative grid min-h-0 overflow-hidden gap-2.5 bg-[linear-gradient(145deg,#eef3f7,#f2f0f6)] p-2.5 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div
          className="studio-preview-canvas relative grid h-full min-h-0 place-items-center overflow-hidden rounded-[18px] border border-[#dbe2eb] bg-[radial-gradient(circle_at_14%_10%,rgba(46,211,211,.07),transparent_28%),radial-gradient(circle_at_88%_92%,rgba(142,85,240,.07),transparent_30%),linear-gradient(45deg,#f0f3f7_25%,transparent_25%),linear-gradient(-45deg,#f0f3f7_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f3f7_75%),linear-gradient(-45deg,transparent_75%,#f0f3f7_75%)] bg-[length:auto,auto,24px_24px,24px_24px,24px_24px,24px_24px] bg-[position:0_0,0_0,0_0,0_12px,12px_-12px,-12px_0] shadow-inner shadow-slate-300/25"
          onWheel={handleWheel}
        >
          {busy ? (
            <div className="relative flex h-full w-full items-center justify-center p-6">
              <div className={`${resultGridClass(count)} h-fit w-full max-w-[560px]`}>
                {Array.from({ length: count }, (_, index) => (
                  <div
                    key={index}
                    className="relative grid min-h-32 place-items-center overflow-hidden rounded-[18px] border border-white/90 bg-white/82 shadow-[0_16px_42px_rgba(51,65,85,.11)] backdrop-blur"
                    data-loading-tile={index + 1}
                    style={{ aspectRatio: ratio }}
                  >
                    <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,transparent_22%,rgba(139,92,246,.08)_44%,transparent_66%)] bg-[length:220%_100%]" />
                    <div className="relative text-center">
                      <LoaderCircle className="mx-auto animate-spin text-[#a855f7]" size={32} />
                      <p className="mt-3 text-sm font-semibold text-[#17243a]">{t("preview.generatingImage")}</p>
                      <p className="mt-1.5 text-[11px] text-slate-500">{t("preview.waited", { index: index + 1, time: formatGenerationElapsed(elapsedMs) })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="mx-6 max-w-sm rounded-[22px] border border-rose-200 bg-white/94 px-8 py-7 text-center shadow-[0_18px_46px_rgba(51,65,85,.12)]">
              <AlertCircle className="mx-auto text-rose-500" size={34} />
              <p className="mt-3 text-lg font-semibold text-[#17243a]">{t("preview.status.failed")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
              <p className="mt-3 text-xs text-slate-400">{t("preview.retryNote")}</p>
            </div>
          ) : results.length ? (
            <div className="h-full w-full overflow-hidden p-1.5">
              <div className={`${resultGridClass(results.length)} mx-auto h-full max-w-none content-center`}>
                {results.map((url, index) => results.length === 1 ? (
                  <div
                    key={url}
                    className={`relative mx-auto grid h-full max-h-full w-full max-w-none touch-none place-items-center overflow-hidden rounded-[18px] border border-[#dbe2eb] bg-white shadow-[0_22px_50px_rgba(38,49,65,.15)] ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
                    data-result-card={index + 1}
                    onClick={() => { if (zoom <= 1) setPreviewUrl(url); }}
                    onPointerCancel={stopDragging}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={stopDragging}
                  >
                    <img
                      alt={t("preview.resultAlt", { index: index + 1 })}
                      className="max-h-full max-w-full select-none object-contain transition-transform duration-150"
                      draggable={false}
                      src={url}
                      style={zoom <= 1 ? { width: `${zoom * 100}%`, height: `${zoom * 100}%` } : { width: "100%", height: "100%", transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
                    />
                  </div>
                ) : (
                  <div
                    key={url}
                    className="group relative grid place-items-center overflow-hidden rounded-[16px] border border-[#dbe2eb] bg-white shadow-[0_16px_40px_rgba(38,49,65,.12)]"
                    data-result-card={index + 1}
                    style={{ aspectRatio: ratio }}
                  >
                    <img alt={t("preview.resultAlt", { index: index + 1 })} className="h-full w-full cursor-zoom-in select-none object-contain transition duration-300 group-hover:scale-[1.02]" draggable={false} onClick={() => setPreviewUrl(url)} src={url} />
                    <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <button aria-label={t("studio.localEdit")} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-950/65 px-2.5 text-[10px] font-semibold text-white backdrop-blur hover:bg-violet-700" onClick={() => onEditResult(url)} type="button"><ScanLine size={13} />{t("studio.localEdit")}</button>
                      <button aria-label={t("preview.openOriginal")} className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950/65 text-white backdrop-blur hover:bg-slate-950/80" onClick={() => setPreviewUrl(url)} type="button"><ExternalLink size={14} /></button>
                    </div>
                    <span className="absolute bottom-2 left-2 rounded-lg bg-slate-950/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">{index + 1}/{results.length}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-6 max-w-xs rounded-[22px] border border-[#e0e6ee] bg-white/92 px-8 py-7 text-center shadow-[0_18px_46px_rgba(51,65,85,.1)]">
              <span className="mx-auto grid h-13 w-13 place-items-center rounded-2xl bg-[#f3edff] text-[#8b5cf6]"><WandSparkles size={25} /></span>
              <p className="mt-3 text-lg font-semibold text-[#17243a]">{t("preview.waiting")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{t("preview.waitingHelp")}</p>
            </div>
          )}
        </div>

        <aside className="grid min-h-0 content-start gap-2.5 overflow-y-auto sm:grid-cols-2 lg:grid-cols-1" aria-label={t("preview.info")}>
          <section className="studio-info-card rounded-2xl border border-[#e3daf8] bg-[linear-gradient(145deg,rgba(244,240,255,.96),rgba(255,255,255,.9))] p-3 shadow-[0_10px_26px_rgba(46,58,76,.055)]" data-template-mode={mode}>
            <p className="text-[9px] font-bold tracking-[0.16em] text-[#7651c7]">{t("studio.templates")}</p>
            <p className="mt-1 text-[9px] leading-4 text-slate-500">{t("studio.templateHelp")}</p>
            <div className="mt-2.5 grid gap-1.5">
              {templates.map((template) => (
                <button key={template.id} className="group/template rounded-xl border border-violet-100 bg-white/78 px-2.5 py-2 text-left text-[10px] font-semibold text-[#27364b] transition hover:-translate-y-px hover:border-violet-300 hover:bg-white hover:text-[#7651c7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" onClick={() => onTemplateSelect(template)} title={template.prompt} type="button">
                  <span className="line-clamp-2 leading-4">{t(template.nameKey)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="studio-info-card rounded-2xl border border-[#d7e0ea] bg-white/82 p-3 shadow-[0_10px_26px_rgba(46,58,76,.055)] backdrop-blur">
            <p className="text-[9px] font-bold tracking-[0.16em] text-slate-400">{t("preview.output")}</p>
            <dl className="mt-2.5 grid gap-2 text-[9px] text-slate-500">
              <div className="flex justify-between gap-2"><dt>{t("studio.ratio")}</dt><dd className="font-semibold text-[#27364b]">{aspectRatio}</dd></div>
              <div className="flex justify-between gap-2"><dt>{t("studio.resolution")}</dt><dd className="font-semibold text-[#27364b]">{resolution.toUpperCase()}</dd></div>
              <div className="flex justify-between gap-2"><dt>{t("preview.quantity")}</dt><dd className="font-semibold text-[#27364b]">{t(count === 1 ? "common.image" : "common.images", { count })}</dd></div>
            </dl>
          </section>

          <section className="studio-info-card rounded-2xl border border-[#e3daf8] bg-[linear-gradient(145deg,rgba(244,240,255,.94),rgba(255,255,255,.88))] p-3 shadow-[0_10px_26px_rgba(46,58,76,.055)]">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#ebe3ff] text-xs text-[#7651c7]">▣</span>
            <p className="mt-2 text-[9px] font-bold tracking-[0.16em] text-slate-400">{t("preview.sync")}</p>
            <p className={`mt-1.5 text-xs font-semibold ${error ? "text-rose-600" : results.length ? "text-emerald-700" : busy ? "text-violet-700" : "text-[#1e2d43]"}`}>{syncTitle}</p>
            <p className="mt-1 text-[9px] leading-4 text-slate-500">{syncNote}</p>
          </section>


        </aside>
      </div>

      <footer className="grid min-h-[78px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-[#e3e8ef] bg-white px-3 text-[10px] text-slate-500">
        <div className="min-w-0"><textarea aria-label={t("studio.promptLabel")} className="h-14 w-full resize-none rounded-xl border border-violet-200 bg-violet-50/35 px-3 py-2 text-sm leading-5 text-[#27364b] outline-none placeholder:text-slate-400 focus:border-violet-400" placeholder={t("studio.promptLabel")} value={prompt} onChange={(event) => onPromptChange(event.target.value)} /></div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button aria-label={t("studio.optimizePrompt")} className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-2.5 text-[11px] font-bold text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-45" disabled={promptDisabled || !prompt.trim()} onClick={onOptimizePrompt} type="button"><WandSparkles size={14} />{t("studio.optimizePrompt")}</button>
          <button aria-label={t("studio.generate")} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(115deg,#7c3aed,#c946ea)] px-4 text-xs font-bold text-white shadow-[0_10px_24px_rgba(124,58,237,.22)] disabled:cursor-not-allowed disabled:opacity-60" disabled={promptDisabled} onClick={onGenerate} type="button"><Sparkles size={15} />{t("studio.generate")}</button>
        </div>
      </footer>
      {previewUrl ? (
        <div aria-label={t("preview.openOriginal")} aria-modal="true" className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-5 backdrop-blur-xl" onClick={() => setPreviewUrl("")} role="dialog">
          <button aria-label={t("common.close")} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-2xl text-white hover:bg-white/20" onClick={() => setPreviewUrl("")} type="button">×</button>
          <img alt={t("preview.resultAlt", { index: 1 })} className="max-h-[92dvh] max-w-[94vw] rounded-2xl object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} src={previewUrl} />
        </div>
      ) : null}
    </section>
  );
}
