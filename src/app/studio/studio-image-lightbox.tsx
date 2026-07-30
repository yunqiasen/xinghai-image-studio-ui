import { ScanLine, X } from "lucide-react";
import { useEffect } from "react";

import { useLanguage } from "@/components/language-provider";

type StudioImageLightboxProps = {
  url: string;
  alt?: string;
  kind?: "image" | "asset";
  onClose: () => void;
  onEdit?: (url: string) => void;
};

export function StudioImageLightbox({ url, alt, kind = "image", onClose, onEdit }: StudioImageLightboxProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      aria-label={t("preview.openOriginal")}
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/78 p-5 backdrop-blur-xl"
      data-preview-lightbox={kind}
      onClick={onClose}
      role="dialog"
    >
      <button aria-label={t("common.close")} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white transition hover:bg-white/20" onClick={onClose} type="button"><X size={20} /></button>
      {onEdit ? (
        <button
          className="absolute bottom-6 left-1/2 z-10 inline-flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-full border border-white/25 bg-[linear-gradient(115deg,#7c3aed,#d946ef)] px-6 text-sm font-bold text-white shadow-[0_18px_48px_rgba(88,28,135,.5)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_56px_rgba(88,28,135,.6)]"
          data-preview-action="local-edit"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
            onEdit(url);
          }}
          type="button"
        >
          <ScanLine size={17} />
          {t("studio.localEdit")}
        </button>
      ) : null}
      <img alt={alt || t("preview.resultAlt", { index: 1 })} className="max-h-[92dvh] max-w-[94vw] select-none rounded-2xl object-contain shadow-2xl" draggable={false} onClick={(event) => event.stopPropagation()} src={url} />
    </div>
  );
}
