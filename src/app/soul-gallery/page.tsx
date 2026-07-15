import { ArrowUpRight, Check, Copy, Search, Sparkles, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

const sourceLabels = {
  imagic6: "IMAGIC6",
  imya: "IMYA",
} as const;

export function SoulGalleryPage() {
  const navigate = useNavigate();
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
      toast.success("提示词已复制");
    } catch {
      toast.error("复制失败，请在详情中手动选择提示词");
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
              灵魂画廊
            </h1>
            <p className="soul-gallery-lead mt-5 max-w-2xl text-sm leading-7 sm:text-base">
              来自 imagic6 与 imya 的精选视觉模板。看成图、读提示词，再把灵感一键带进创作台。
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="soul-gallery-stat rounded-full border px-4 py-2.5">19 组精选灵感</span>
              <span className="soul-gallery-stat rounded-full border px-4 py-2.5">8 组未来场景</span>
              <span className="soul-gallery-stat rounded-full border px-4 py-2.5">11 组时尚模板</span>
            </div>
          </div>

          <div className="soul-gallery-search-panel rounded-[26px] border p-3 shadow-2xl">
            <label className="soul-gallery-search flex min-h-14 items-center gap-3 rounded-[18px] border px-4">
              <Search size={18} />
              <input
                aria-label="搜索灵魂画廊"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-55"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索标题、风格或提示词"
                type="search"
                value={query}
              />
              <span className="hidden text-[10px] font-bold tracking-widest opacity-45 sm:inline">SEARCH</span>
            </label>
            <div className="mt-3 flex items-center justify-between gap-3 px-1 text-[11px]">
              <span className="opacity-60">当前显示 {items.length} 项</span>
              <span className="inline-flex items-center gap-1 font-semibold"><Sparkles size={12} /> 本地素材，打开更快</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="soul-gallery-section-kicker text-[10px] font-bold tracking-[0.22em]">CURATED VISUALS</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">找到下一张值得生成的图</h2>
          </div>
          <p className="soul-gallery-muted text-xs">点击图片查看完整提示词</p>
        </div>

        <div aria-label="灵魂画廊分类" className="soul-gallery-filters mt-5 flex gap-2 overflow-x-auto pb-2">
          {soulGalleryCategories.map((item) => (
            <button
              aria-pressed={category === item}
              className="soul-gallery-filter min-h-11 shrink-0 rounded-full border px-4 text-xs font-semibold transition"
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        {items.length ? (
          <div className="soul-gallery-grid mt-5" data-result-count={items.length}>
            {items.map((item, index) => (
              <button
                aria-label={`查看 ${item.title} 提示词`}
                className="soul-gallery-card group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-[24px] border text-left shadow-lg transition"
                data-soul-card={item.id}
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                type="button"
              >
                <img
                  alt={`${item.title}：${item.description}`}
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
                  <span className="mt-3 block text-lg font-semibold tracking-[-0.025em] text-white">{item.title}</span>
                  <span className="mt-1 block text-[11px] text-white/62">{item.englishTitle} · {item.category}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="soul-gallery-empty mt-5 grid min-h-72 place-items-center rounded-[28px] border border-dashed text-center">
            <div><Search className="mx-auto opacity-45" size={24} /><p className="mt-3 font-semibold">没有匹配的灵感</p><button className="mt-4 min-h-11 rounded-full border px-5 text-sm" onClick={() => { setQuery(""); setCategory("全部"); }} type="button">清除筛选</button></div>
          </div>
        )}
      </section>

      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        {selectedItem ? (
          <DialogContent className="soul-gallery-dialog overflow-hidden p-0" showCloseButton>
            <div className="soul-gallery-dialog-media min-h-0 overflow-hidden">
              <img alt={selectedItem.title} className="h-full min-h-[300px] w-full object-cover" src={selectedItem.image} />
            </div>
            <div className="soul-gallery-dialog-copy min-h-0 overflow-y-auto p-5 sm:p-7">
              <DialogHeader>
                <p className="soul-gallery-eyebrow text-[10px] font-bold tracking-[0.2em]">{sourceLabels[selectedItem.source]} · {selectedItem.category}</p>
                <DialogTitle className="text-3xl tracking-[-0.045em]">{selectedItem.title}</DialogTitle>
                <DialogDescription className="soul-gallery-muted leading-6">{selectedItem.description}</DialogDescription>
              </DialogHeader>
              <div className="soul-gallery-prompt mt-6 rounded-[20px] border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold tracking-[0.12em]">完整提示词</p>
                  <span className="text-[10px] opacity-45">{selectedItem.prompt.length} 字符</span>
                </div>
                <p className="mt-3 max-h-[260px] overflow-y-auto whitespace-pre-wrap text-xs leading-6 opacity-75 sm:text-[13px]">{selectedItem.prompt}</p>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <button className="soul-gallery-secondary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border px-4 text-sm font-semibold" onClick={() => void copyPrompt(selectedItem)} type="button">
                  {copiedId === selectedItem.id ? <Check size={16} /> : <Copy size={16} />}{copiedId === selectedItem.id ? "已复制" : "复制提示词"}
                </button>
                <button className="soul-gallery-primary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] px-4 text-sm font-semibold" onClick={() => bringPromptToStudio(selectedItem)} type="button">
                  <WandSparkles size={16} /> 带入创作
                </button>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
