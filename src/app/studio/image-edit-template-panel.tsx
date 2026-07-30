import { Check, ImageIcon } from "lucide-react";

import { useLanguage } from "@/components/language-provider";

import type { ImageEditAction } from "./image-edit-assets";
import { imageEditTemplatesForAction, type ImageEditMediaTemplate } from "./image-edit-templates";

type ImageEditTemplatePanelProps = {
  action: ImageEditAction;
  selectedUrl?: string;
  onSelect: (template: ImageEditMediaTemplate) => void;
};

export function ImageEditTemplatePanel({ action, selectedUrl, onSelect }: ImageEditTemplatePanelProps) {
  const { locale, t } = useLanguage();
  const templates = imageEditTemplatesForAction(action);
  if (!templates.length) return null;
  const title = action === "replace-background" ? t("studio.editTemplates.background") : action === "change-clothes" ? t("studio.editTemplates.garment") : t("studio.editTemplates.face");

  return (
    <section className="studio-info-card rounded-2xl border border-[#e3daf8] bg-[linear-gradient(145deg,rgba(244,240,255,.96),rgba(255,255,255,.9))] p-3 shadow-[0_10px_26px_rgba(46,58,76,.055)]" data-image-edit-template-panel={action}>
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-100 text-violet-700"><ImageIcon size={14} /></span>
        <div className="select-text"><p className="text-[10px] font-bold text-[#5636a7]">{title}</p><p className="mt-0.5 text-[9px] text-slate-500">{t("studio.editTemplates.help")}</p></div>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 lg:grid-cols-1">
        {templates.map((template) => {
          const active = selectedUrl === template.url;
          return (
            <button key={template.id} aria-pressed={active} className={`group relative overflow-hidden rounded-xl border bg-white text-left transition hover:-translate-y-px hover:shadow-md ${active ? "border-violet-500 ring-2 ring-violet-200" : "border-violet-100"}`} data-edit-template-role={template.role} onClick={() => onSelect(template)} type="button">
              <img alt={locale === "zh-CN" ? template.nameZh : template.nameEn} className="aspect-[16/10] w-full select-none object-cover transition duration-200 group-hover:scale-[1.035]" draggable={false} src={template.url} />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/84 to-transparent px-2 pb-1.5 pt-7 text-[9px] font-semibold text-white">{locale === "zh-CN" ? template.nameZh : template.nameEn}</span>
              {active ? <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-violet-600 text-white"><Check size={13} /></span> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
