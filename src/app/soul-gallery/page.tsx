import { ArrowUpRight, Check, Copy, Search, Sparkles, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useLanguage } from "@/components/language-provider";
import type { LanguageMode } from "@/components/language-modes";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  filterSoulGallery,
  soulGalleryCatalog,
  soulGalleryCategories,
  type SoulGalleryItem,
} from "./catalog";

const categoryLabels: Record<string, { "zh-CN": string; "en-US": string }> = {
  "全部": { "zh-CN": "全部", "en-US": "All" },
  "未来幻想": { "zh-CN": "未来幻想", "en-US": "Future Fantasy" },
  "商业视觉": { "zh-CN": "商业视觉", "en-US": "Commercial" },
  "东方美学": { "zh-CN": "东方美学", "en-US": "Oriental" },
  "空间设计": { "zh-CN": "空间设计", "en-US": "Spatial Design" },
  "时尚人像": { "zh-CN": "时尚人像", "en-US": "Fashion Portraits" },
};

function localizedTitle(item: SoulGalleryItem, locale: LanguageMode) {
  const titleIsChinese = /[\u3400-\u9fff]/u.test(item.title);
  if (locale === "en-US") return titleIsChinese ? item.englishTitle : item.title;
  return titleIsChinese ? item.title : item.englishTitle;
}

function secondaryTitle(item: SoulGalleryItem, locale: LanguageMode) {
  return locale === "en-US" ? localizedTitle(item, "zh-CN") : localizedTitle(item, "en-US");
}

const sourceLabels = {
  imagic6: "IMAGIC6",
  imya: "IMYA",
} as const;

export function SoulGalleryPage() {
  const navigate = useNavigate();
  const { locale, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [selectedItem, setSelectedItem] = useState<SoulGalleryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const items = useMemo(
    () => filterSoulGallery(soulGalleryCatalog, query, category),
    [category, query],
  );

  async function copyPrompt(item: SoulGalleryItem) {
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId((current) => current === item.id ? null : current), 1600);
      toast.success(t("soul.copySuccess"));
    } catch {
      toast.error(t("soul.copyFailed"));
    }
  }

  function bringPromptToStudio(item: SoulGalleryItem) {
    navigate("/studio", { state: { prompt: item.prompt } });
  }

  return (
    <div className="soul-gallery-page mx-auto w-full max-w-[1320px] pb-10">
      <section className="soul-gallery-hero relative overflow-hidden rounded-[36px] border px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="soul-gallery-orbit soul-gallery-orbit-one" />
        <div className="soul-gallery-orbit soul-gallery-orbit-two" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div className="max-w-[720px]">
            <p className="soul-gallery-eyebrow inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.25em]">
              <WandSparkles size={14} /> SOUL GALLERY
            </p>
            <h1 className="mt-4 text-[clamp(2.8rem,6vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
              {t("soul.title")}
            </h1>
            <p className="soul-gallery-lead mt-5 max-w-2xl text-sm leading-7 sm:text-base">
              {t("soul.description")}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="soul-gallery-stat rounded-full border px-4 py-2.5">{t("soul.stat.all")}</span>
              <span className="soul-gallery-stat rounded-full border px-4 py-2.5">{t("soul.stat.future")}</span>
              <span className="soul-gallery-stat rounded-full border px-4 py-2.5">{t("soul.stat.fashion")}</span>
            </div>
          </div>

          <div className="soul-gallery-search-panel rounded-[26px] border p-3 shadow-2xl">
            <label className="soul-gallery-search flex min-h-14 items-center gap-3 rounded-[18px] border px-4">
              <Search size={18} />
              <input
                aria-label={t("soul.searchLabel")}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-55"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("soul.searchPlaceholder")}
                type="search"
                value={query}
              />
              <span className="hidden text-[10px] font-bold tracking-widest opacity-45 sm:inline">SEARCH</span>
            </label>
            <div className="mt-3 flex items-center justify-between gap-3 px-1 text-[11px]">
              <span className="opacity-60">{t("soul.showing", { count: items.length })}</span>
              <span className="inline-flex items-center gap-1 font-semibold"><Sparkles size={12} /> {t("soul.local")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="soul-gallery-section-kicker text-[10px] font-bold tracking-[0.22em]">CURATED VISUALS</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{t("soul.sectionTitle")}</h2>
          </div>
          <p className="soul-gallery-muted text-xs">{t("soul.sectionHelp")}</p>
        </div>

        <div aria-label={t("soul.categories")} className="soul-gallery-filters mt-5 flex gap-2 overflow-x-auto pb-2">
          {soulGalleryCategories.map((item) => (
            <button
              aria-pressed={category === item}
              className="soul-gallery-filter min-h-11 shrink-0 rounded-full border px-4 text-xs font-semibold transition"
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {categoryLabels[item]?.[locale] ?? item}
            </button>
          ))}
        </div>

        {items.length ? (
          <div className="soul-gallery-grid mt-5" data-result-count={items.length}>
            {items.map((item, index) => (
              <button
                aria-label={t("soul.viewPrompt", { title: localizedTitle(item, locale) })}
                className="soul-gallery-card group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-[24px] border text-left shadow-lg transition"
                data-soul-card={item.id}
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                type="button"
              >
                <img
                  alt={`${localizedTitle(item, locale)}: ${item.description}`}
                  className="h-auto w-full transition duration-500 group-hover:scale-[1.025]"
                  decoding="async"
                  height={item.height}
                  loading={index < 3 ? "eager" : "lazy"}
                  src={item.image}
                  width={item.width}
                />
                <span className="soul-gallery-card-shade absolute inset-0" />
                <span className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
                  <span className="flex items-center justify-between gap-3">
                    <span className="soul-gallery-source rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-[0.16em]">
                      {sourceLabels[item.source]}
                    </span>
                    <span className="soul-gallery-open grid h-9 w-9 place-items-center rounded-full border opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                      <ArrowUpRight size={15} />
                    </span>
                  </span>
                  <span className="mt-3 block text-lg font-semibold tracking-[-0.025em] text-white">{localizedTitle(item, locale)}</span>
                  <span className="mt-1 block text-[11px] text-white/62">{secondaryTitle(item, locale)} · {categoryLabels[item.category]?.[locale] ?? item.category}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="soul-gallery-empty mt-5 grid min-h-72 place-items-center rounded-[28px] border border-dashed text-center">
            <div><Search className="mx-auto opacity-45" size={24} /><p className="mt-3 font-semibold">{t("soul.empty")}</p><button className="mt-4 min-h-11 rounded-full border px-5 text-sm" onClick={() => { setQuery(""); setCategory("全部"); }} type="button">{t("soul.clearFilter")}</button></div>
          </div>
        )}
      </section>

      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        {selectedItem ? (
          <DialogContent className="soul-gallery-dialog overflow-hidden p-0" showCloseButton>
            <div className="soul-gallery-dialog-media min-h-0 overflow-hidden">
              <img alt={localizedTitle(selectedItem, locale)} className="h-full min-h-[300px] w-full object-cover" src={selectedItem.image} />
            </div>
            <div className="soul-gallery-dialog-copy min-h-0 overflow-y-auto p-5 sm:p-7">
              <DialogHeader>
                <p className="soul-gallery-eyebrow text-[10px] font-bold tracking-[0.2em]">{sourceLabels[selectedItem.source]} · {categoryLabels[selectedItem.category]?.[locale] ?? selectedItem.category}</p>
                <DialogTitle className="text-3xl tracking-[-0.045em]">{localizedTitle(selectedItem, locale)}</DialogTitle>
                <DialogDescription className="soul-gallery-muted leading-6">{selectedItem.description}</DialogDescription>
              </DialogHeader>
              <div className="soul-gallery-prompt mt-6 rounded-[20px] border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold tracking-[0.12em]">{t("soul.fullPrompt")}</p>
                  <span className="text-[10px] opacity-45">{t("soul.characters", { count: selectedItem.prompt.length })}</span>
                </div>
                <p className="mt-3 max-h-[260px] overflow-y-auto whitespace-pre-wrap text-xs leading-6 opacity-75 sm:text-[13px]">{selectedItem.prompt}</p>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <button className="soul-gallery-secondary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border px-4 text-sm font-semibold" onClick={() => void copyPrompt(selectedItem)} type="button">
                  {copiedId === selectedItem.id ? <Check size={16} /> : <Copy size={16} />}{copiedId === selectedItem.id ? t("soul.copied") : t("soul.copy")}
                </button>
                <button className="soul-gallery-primary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] px-4 text-sm font-semibold" onClick={() => bringPromptToStudio(selectedItem)} type="button">
                  <WandSparkles size={16} /> {t("soul.bring")}
                </button>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
