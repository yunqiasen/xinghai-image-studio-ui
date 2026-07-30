import { Grip, Move } from "lucide-react";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { useLanguage } from "@/components/language-provider";
import type { TextOverlayPosition } from "@/lib/image-models/types";

import { displayPositionToImageCoordinates, textOverlayAnchor } from "./text-overlay-position";

type TextOverlayEditorProps = {
  sourceUrl: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  position: TextOverlayPosition;
  x: number;
  y: number;
  onPositionChange: (next: { position: TextOverlayPosition; x: number; y: number }) => void;
};

type DragState = { pointerId: number; offsetX: number; offsetY: number };

export function TextOverlayEditor({ sourceUrl, text, fontFamily, fontSize, textColor, position, x, y, onPositionChange }: TextOverlayEditorProps) {
  const { t } = useLanguage();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });
  const customStyle = position === "custom"
    ? { left: `${Math.max(0, Math.min(100, (x / naturalSize.width) * 100))}%`, top: `${Math.max(0, Math.min(100, (y / naturalSize.height) * 100))}%`, transform: "translate(0, 0)" }
    : textOverlayAnchor(position);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const bounds = overlay.getBoundingClientRect();
    dragRef.current = { pointerId: event.pointerId, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const frame = frameRef.current;
    const overlay = overlayRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !frame || !overlay) return;
    const frameBounds = frame.getBoundingClientRect();
    const overlayBounds = overlay.getBoundingClientRect();
    const coordinates = displayPositionToImageCoordinates({
      left: event.clientX - frameBounds.left - drag.offsetX,
      top: event.clientY - frameBounds.top - drag.offsetY,
      displayWidth: frameBounds.width,
      displayHeight: frameBounds.height,
      naturalWidth: naturalSize.width,
      naturalHeight: naturalSize.height,
      overlayWidth: overlayBounds.width,
      overlayHeight: overlayBounds.height,
    });
    onPositionChange({ position: "custom", ...coordinates });
  }

  function stopDragging(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  const previewFontSize = Math.max(14, Math.min(72, fontSize * 0.42));

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-4" data-text-overlay-editor="true">
      <div ref={frameRef} className="relative inline-block max-h-full max-w-full overflow-hidden rounded-[18px] border border-white bg-slate-950 shadow-[0_24px_60px_rgba(30,41,59,.22)]">
        <img
          alt={t("studio.text.sourceAlt")}
          className="block max-h-[calc(100dvh-250px)] max-w-full select-none object-contain lg:max-h-[620px]"
          draggable={false}
          onLoad={(event) => setNaturalSize({ width: event.currentTarget.naturalWidth || 1, height: event.currentTarget.naturalHeight || 1 })}
          src={sourceUrl}
        />
        <div
          ref={overlayRef}
          className="absolute z-10 max-w-[86%] touch-none cursor-move rounded-lg border-2 border-dashed border-white bg-slate-950/16 px-2.5 py-1.5 text-center shadow-[0_0_0_1px_rgba(124,58,237,.8),0_8px_24px_rgba(15,23,42,.25)] backdrop-blur-[1px]"
          data-text-overlay-box="true"
          onPointerCancel={stopDragging}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          style={{
            ...customStyle,
            color: textColor,
            fontFamily: fontFamily.includes("serif") ? "Noto Serif SC, serif" : "Noto Sans SC, sans-serif",
            fontSize: `${previewFontSize}px`,
            lineHeight: 1.2,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          <span className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,.72)]">{text || t("studio.text.previewPlaceholder")}</span>
          <span className="pointer-events-none absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-violet-600 text-white shadow"><Grip size={11} /></span>
        </div>
      </div>
      <span className="pointer-events-none absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-950/70 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur"><Move size={12} />{t("studio.text.dragHelp")}</span>
    </div>
  );
}
