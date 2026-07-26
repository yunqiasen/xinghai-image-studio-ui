import { Download, History, ImageOff, Maximize2, RefreshCw, ScanLine, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/components/language-modes";
import type { GalleryItem } from "@/lib/storage/local-session";

type GalleryCardProps = {
  item: GalleryItem;
  index: number;
  onOpen: (item: GalleryItem) => void;
  onVariation: (item: GalleryItem, index: number) => void;
  onLocalEdit: (item: GalleryItem, index: number) => void;
  onDownload: (item: GalleryItem) => void;
  onAvailabilityChange?: (item: GalleryItem, available: boolean) => void;
};

type GalleryLightboxProps = Omit<GalleryCardProps, "onAvailabilityChange"> & {
  open: boolean;
  onClose: () => void;
};

type GalleryUnavailableHistoryProps = {
  items: GalleryItem[];
};

const galleryModeLabels: Record<string, TranslationKey> = {
  generate: "studio.mode.text.short",
  text: "studio.mode.text.short",
  image: "studio.mode.image.short",
  edit: "studio.mode.edit.short",
  "remove-bg": "studio.mode.remove-bg.short",
  upscale: "studio.mode.upscale.short",
  batch: "studio.mode.batch.short",
};

function retryURL(url: string, revision: number) {
  if (!revision) return url;
  return `${url}${url.includes("?") ? "&" : "?"}gallery_retry=${revision}`;
}

function formatCreatedAt(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(date);
}

function useModeLabel(mode: string) {
  const { t } = useLanguage();
  const key = galleryModeLabels[mode];
  return key ? t(key) : mode;
}

export function GalleryCard({ item, index, onOpen, onVariation, onLocalEdit, onDownload, onAvailabilityChange }: GalleryCardProps) {
  const { locale, t } = useLanguage();
  const modeLabel = useModeLabel(item.mode);
  const [imageFailed, setImageFailed] = useState(false);
  const [revision, setRevision] = useState(0);

  function retry() {
    setImageFailed(false);
    setRevision((value) => value + 1);
  }

  return (
    <article className="gallery-work-card overflow-hidden rounded-[22px] border" data-gallery-card={item.id}>
      <div className="gallery-work-media relative aspect-square overflow-hidden">
        {imageFailed ? (
          <div className="gallery-image-fallback absolute inset-0 grid place-items-center p-5 text-center" data-gallery-image-state="failed">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl"><ImageOff size={22} /></span>
              <p className="mt-3 text-sm font-semibold">{t("gallery.unavailable")}</p>
              <p className="mt-1.5 text-[11px] leading-5">{t("gallery.unavailableHelp")}</p>
              <button className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold" onClick={retry} type="button">
                <RefreshCw size={12} />{t("gallery.retry")}
              </button>
            </div>
          </div>
        ) : (
          <button aria-label={t("gallery.open")} className="absolute inset-0 grid h-full w-full place-items-center p-2" onClick={() => onOpen(item)} type="button">
            <img
              alt={t("gallery.itemAlt", { count: index + 1 })}
              className="gallery-work-image h-full w-full object-contain"
              decoding="async"
              loading="lazy"
              onError={() => {
                setImageFailed(true);
                onAvailabilityChange?.(item, false);
              }}
              onLoad={() => onAvailabilityChange?.(item, true)}
              src={retryURL(item.url, revision)}
            />
          </button>
        )}
        <div className="gallery-work-badges pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span className="rounded-full px-2.5 py-1 text-[10px] font-bold">{modeLabel}</span>
          {!imageFailed ? <span className="gallery-open-chip grid h-8 w-8 place-items-center rounded-full"><Maximize2 size={13} /></span> : null}
        </div>
      </div>
      <div className="gallery-work-copy p-3.5">
        <p className="line-clamp-2 min-h-10 text-[12px] font-medium leading-5">{item.prompt || t("gallery.noPrompt")}</p>
        <p className="mt-2 text-[10px] font-medium">{formatCreatedAt(item.createdAt, locale)}</p>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <button className="gallery-card-action gallery-card-action-primary inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl px-2 text-[10px] font-bold" data-gallery-action="variation" onClick={() => onVariation(item, index)} type="button">
            <Sparkles size={13} />{t("gallery.variation")}
          </button>
          <button className="gallery-card-action inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl px-2 text-[10px] font-bold" data-gallery-action="local-edit" onClick={() => onLocalEdit(item, index)} type="button">
            <ScanLine size={13} />{t("gallery.localEdit")}
          </button>
          <button className="gallery-card-action col-span-2 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl px-2 text-[10px] font-bold disabled:cursor-not-allowed disabled:opacity-40" disabled={imageFailed} onClick={() => onDownload(item)} type="button">
            <Download size={13} />{t("gallery.download")}
          </button>
        </div>
      </div>
    </article>
  );
}


export function GalleryUnavailableHistory({ items }: GalleryUnavailableHistoryProps) {
  const { t } = useLanguage();
  if (!items.length) return null;

  return (
    <aside
      className="gallery-unavailable-history flex items-center gap-3 rounded-2xl border px-4 py-3.5 sm:px-5"
      data-gallery-unavailable-count={items.length}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"><History size={17} /></span>
      <span className="min-w-0">
        <b className="block text-sm">{t("gallery.unavailableHistory", { count: items.length })}</b>
        <small className="mt-0.5 block text-[11px]">{t("gallery.unavailableHistoryHelp")}</small>
      </span>
    </aside>
  );
}

export function GalleryLightbox({ open, item, index, onClose, onVariation, onLocalEdit, onDownload }: GalleryLightboxProps) {
  const { locale, t } = useLanguage();
  const modeLabel = useModeLabel(item.mode);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div
      aria-label={t("gallery.open")}
      aria-modal="true"
      className="gallery-lightbox fixed inset-0 z-[80] grid place-items-center p-3 sm:p-6"
      onClick={(event) => { if (event.currentTarget === event.target) onClose(); }}
      role="dialog"
    >
      <div className="gallery-lightbox-panel relative grid h-[min(90dvh,880px)] w-[min(96vw,1180px)] overflow-hidden rounded-[26px] border lg:grid-cols-[minmax(0,1fr)_340px]">
        <button aria-label={t("gallery.closePreview")} className="gallery-lightbox-close absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full" onClick={onClose} type="button"><X size={18} /></button>
        <div className="gallery-lightbox-media grid min-h-0 place-items-center overflow-hidden p-3 sm:p-5">
          <img alt={t("gallery.itemAlt", { count: index + 1 })} className="h-full max-h-full w-full object-contain" src={item.url} />
        </div>
        <aside className="gallery-lightbox-copy min-h-0 overflow-y-auto p-5 pt-16 sm:p-6 sm:pt-16">
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="rounded-full border px-2.5 py-1">{modeLabel}</span>
            <span>{formatCreatedAt(item.createdAt, locale)}</span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">{t("gallery.previewTitle")}</h2>
          <p className="mt-2 text-xs font-bold tracking-[0.14em]">{t("gallery.prompt")}</p>
          <p className="gallery-lightbox-prompt mt-3 whitespace-pre-wrap rounded-2xl border p-4 text-sm leading-6">{item.prompt || t("gallery.noPrompt")}</p>
          <div className="mt-5 grid gap-2">
            <button className="gallery-lightbox-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold" onClick={() => onVariation(item, index)} type="button"><Sparkles size={15} />{t("gallery.variation")}</button>
            <button className="gallery-lightbox-secondary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold" onClick={() => onLocalEdit(item, index)} type="button"><ScanLine size={15} />{t("gallery.localEdit")}</button>
            <button className="gallery-lightbox-secondary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold" onClick={() => onDownload(item)} type="button"><Download size={15} />{t("gallery.download")}</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
