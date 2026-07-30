import { ImagePlus, RefreshCw, UploadCloud, X } from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import type { ImageSourceRole } from "@/lib/image-models/types";

import { auxiliaryRoleForEditAction, type ImageEditAction } from "./image-edit-assets";
import type { StudioAsset } from "./mode-settings";

type ImageAssetSlotsProps = {
  action: ImageEditAction;
  assets: StudioAsset[];
  onFiles: (files: FileList | null, role: StudioAsset["role"]) => void;
  onRemoveAsset: (id: string) => void;
  onPreviewAsset: (asset: StudioAsset) => void;
};

type SlotDefinition = {
  role: Extract<ImageSourceRole, "image" | "background" | "garment" | "face">;
  title: string;
  emptyLabel: string;
  replaceLabel: string;
  help: string;
  accent: "main" | "reference";
};

export function ImageAssetSlots({ action, assets, onFiles, onRemoveAsset, onPreviewAsset }: ImageAssetSlotsProps) {
  const { t } = useLanguage();
  const auxiliaryRole = auxiliaryRoleForEditAction(action);
  const slots: SlotDefinition[] = [
    {
      role: "image",
      title: t("studio.mainImage"),
      emptyLabel: t("studio.uploadMain"),
      replaceLabel: t("studio.replaceMain"),
      help: t("studio.mainImageHelp"),
      accent: "main",
    },
  ];
  if (auxiliaryRole) {
    slots.push({
      role: auxiliaryRole,
      title: t("studio.referenceImage"),
      emptyLabel: t("studio.uploadReferenceSlot"),
      replaceLabel: t("studio.replaceReference"),
      help: auxiliaryRole === "background" ? t("studio.backgroundImageHelp") : auxiliaryRole === "garment" ? t("studio.garmentImageHelp") : t("studio.faceImageHelp"),
      accent: "reference",
    });
  }

  return (
    <div className={`grid gap-2 ${slots.length === 2 ? "grid-cols-2" : "grid-cols-1"}`} data-image-edit-slots={slots.length === 2 ? "two" : "one"}>
      {slots.map((slot) => {
        const asset = assets.find((item) => item.role === slot.role);
        const accentClass = slot.accent === "main" ? "border-white/14 hover:border-white/28" : "border-cyan-300/30 hover:border-cyan-200/55";
        return (
          <section key={slot.role} className={`group/slot relative min-w-0 overflow-hidden rounded-[15px] border bg-black/28 transition ${accentClass}`} data-asset-slot={slot.role}>
            {asset ? (
              <>
                <button className="relative block aspect-[4/3] w-full overflow-hidden bg-black/45" data-asset-preview={slot.role} onClick={() => onPreviewAsset(asset)} type="button">
                  <img alt={asset.name} className="h-full w-full select-none object-cover transition duration-200 group-hover/slot:scale-[1.025]" draggable={false} src={asset.dataUrl || asset.url} />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/82 to-transparent px-2 pb-2 pt-7 text-left text-[9px] font-semibold text-white/80">{slot.title}</span>
                </button>
                <label className="flex min-h-9 cursor-pointer items-center justify-center gap-1 border-t border-white/8 px-2 text-[9px] font-semibold text-white/66 transition hover:bg-white/7 hover:text-white">
                  <RefreshCw size={12} />{slot.replaceLabel}
                  <input accept="image/*" className="hidden" type="file" onChange={(event) => onFiles(event.target.files, slot.role)} />
                </label>
                <button aria-label={t("studio.removeAsset")} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/72 text-white transition hover:bg-rose-500" onClick={(event) => { event.stopPropagation(); onRemoveAsset(asset.id); }} type="button"><X size={12} /></button>
              </>
            ) : (
              <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 px-2 text-center transition hover:bg-white/[0.045]">
                <span className={`grid h-10 w-10 place-items-center rounded-2xl ${slot.accent === "main" ? "bg-white/9 text-white" : "bg-cyan-300/10 text-cyan-200"}`}><ImagePlus size={19} /></span>
                <span className="text-[11px] font-bold text-white">{slot.emptyLabel}</span>
                <span className="line-clamp-2 text-[8.5px] leading-3.5 text-white/36">{slot.help}</span>
                <span className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-white/52"><UploadCloud size={11} />PNG / JPG / WebP</span>
                <input accept="image/*" className="hidden" data-upload-role={slot.role} type="file" onChange={(event) => onFiles(event.target.files, slot.role)} />
              </label>
            )}
          </section>
        );
      })}
    </div>
  );
}
