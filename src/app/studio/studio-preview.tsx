import {
  AlertCircle,
  ExternalLink,
  LoaderCircle,
  Maximize2,
  Minus,
  Plus,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";

import type { ResolutionTier } from "@/lib/billing/pricing";
import type { StudioAspectRatio } from "@/lib/image2api/size-presets";

import { PREVIEW_PANEL_CLASS_NAME } from "./layout-constants";
import { aspectRatioCss, formatGenerationElapsed, resultGridClass } from "./preview-layout";

type StudioPreviewProps = {
  aspectRatio: StudioAspectRatio;
  resolution: ResolutionTier;
  count: number;
  busy: boolean;
  results: string[];
  error?: string;
  startedAt?: number;
};

type DragOrigin = { pointerX: number; pointerY: number; offsetX: number; offsetY: number };

export function StudioPreview({
  aspectRatio,
  resolution,
  count,
  busy,
  results,
  error,
  startedAt,
}: StudioPreviewProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
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

  return (
    <section className={PREVIEW_PANEL_CLASS_NAME} data-preview-state={state}>
      <header className="flex min-h-[74px] items-center justify-between gap-4 border-b border-[#e3e8ef] px-5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.24em] text-[#7c3aed]">PREVIEW</p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.04em] text-[#152238]">生成预览</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">完整显示、不裁切；生成后可缩放并打开原图</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="rounded-[10px] border border-[#dce3ec] bg-[#f8fafc] px-3 py-2">
            {busy ? "生成中" : results.length ? `${results.length} 张结果` : error ? "生成失败" : "空闲"}
          </span>
          <span className="rounded-[10px] border border-[#dce3ec] bg-[#f8fafc] px-3 py-2">
            {aspectRatio} · {resolution.toUpperCase()}
          </span>
        </div>
      </header>

      <div className="relative min-h-0 bg-[#eef2f6] p-3.5">
        <div
          className="relative grid h-full min-h-[430px] place-items-center overflow-hidden rounded-[18px] border border-[#dbe2eb] bg-[linear-gradient(45deg,#f0f3f7_25%,transparent_25%),linear-gradient(-45deg,#f0f3f7_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f3f7_75%),linear-gradient(-45deg,transparent_75%,#f0f3f7_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] shadow-inner shadow-slate-300/25"
          onWheel={handleWheel}
        >
          {results.length === 1 && !busy ? (
            <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-[11px] border border-[#dce3ec] bg-white/94 p-1 text-xs text-slate-500 shadow-lg shadow-slate-900/8 backdrop-blur">
              <button aria-label="缩小预览" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100" onClick={() => applyZoom(zoom - 0.1)} type="button"><Minus size={14} /></button>
              <span className="w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
              <button aria-label="放大预览" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100" onClick={() => applyZoom(zoom + 0.1)} type="button"><Plus size={14} /></button>
              <button aria-label="适应画布" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100" onClick={() => applyZoom(1)} title="适应画布" type="button"><Maximize2 size={14} /></button>
              <a aria-label="打开原图" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100" href={results[0]} rel="noreferrer" target="_blank"><ExternalLink size={14} /></a>
            </div>
          ) : null}

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
                      <p className="mt-3 text-sm font-semibold text-[#17243a]">正在生成图片</p>
                      <p className="mt-1.5 text-[11px] text-slate-500">第 {index + 1} 张 · 已等待 {formatGenerationElapsed(elapsedMs)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="mx-6 max-w-sm rounded-[22px] border border-rose-200 bg-white/94 px-8 py-7 text-center shadow-[0_18px_46px_rgba(51,65,85,.12)]">
              <AlertCircle className="mx-auto text-rose-500" size={34} />
              <p className="mt-3 text-lg font-semibold text-[#17243a]">生成失败</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
              <p className="mt-3 text-xs text-slate-400">参数已保留，可直接重新生成。</p>
            </div>
          ) : results.length ? (
            <div className="h-full w-full overflow-auto p-5">
              <div className={`${resultGridClass(results.length)} mx-auto min-h-full max-w-[600px] content-center`}>
                {results.map((url, index) => results.length === 1 ? (
                  <div
                    key={url}
                    className={`relative mx-auto grid max-h-full w-full max-w-[560px] touch-none place-items-center overflow-hidden rounded-[18px] border border-[#dbe2eb] bg-white shadow-[0_22px_50px_rgba(38,49,65,.15)] ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
                    data-result-card={index + 1}
                    onPointerCancel={stopDragging}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={stopDragging}
                    style={{ aspectRatio: ratio }}
                  >
                    <img
                      alt={`生成结果 ${index + 1}`}
                      className="h-full w-full select-none object-contain transition-transform duration-150"
                      draggable={false}
                      src={url}
                      style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
                    />
                  </div>
                ) : (
                  <a
                    key={url}
                    className="group relative grid place-items-center overflow-hidden rounded-[16px] border border-[#dbe2eb] bg-white shadow-[0_16px_40px_rgba(38,49,65,.12)]"
                    data-result-card={index + 1}
                    href={url}
                    rel="noreferrer"
                    style={{ aspectRatio: ratio }}
                    target="_blank"
                  >
                    <img alt={`生成结果 ${index + 1}`} className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]" src={url} />
                    <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-slate-950/55 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><ExternalLink size={14} /></span>
                    <span className="absolute bottom-2 left-2 rounded-lg bg-slate-950/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">{index + 1}/{results.length}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-6 max-w-xs rounded-[22px] border border-[#e0e6ee] bg-white/92 px-8 py-7 text-center shadow-[0_18px_46px_rgba(51,65,85,.1)]">
              <span className="mx-auto grid h-13 w-13 place-items-center rounded-2xl bg-[#f3edff] text-[#8b5cf6]"><WandSparkles size={25} /></span>
              <p className="mt-3 text-lg font-semibold text-[#17243a]">等待生成</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">左侧填写提示词和参数，点击生成后会立即显示任务状态。</p>
            </div>
          )}
        </div>
      </div>

      <footer className="flex min-h-[42px] items-center justify-between gap-3 border-t border-[#e3e8ef] bg-white px-4 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-2">
          <i className={`h-2 w-2 rounded-full ${busy ? "animate-pulse bg-[#a855f7] shadow-[0_0_0_4px_#f1ebff]" : error ? "bg-rose-500 shadow-[0_0_0_4px_#ffe4e6]" : results.length ? "bg-emerald-500 shadow-[0_0_0_4px_#dcfce7]" : "bg-[#a78bfa] shadow-[0_0_0_4px_#f1ebff]"}`} />
          {busy ? "生成任务处理中" : error ? "任务失败" : results.length ? `生成完成 · ${results.length} 张` : "准备就绪"}
        </span>
        <span>{results.length === 1 ? "Ctrl/⌘ + 滚轮缩放 · 放大后拖拽查看" : "点击结果打开原图"}</span>
      </footer>
    </section>
  );
}
