import {
  Brush,
  Eraser,
  FileImage,
  ImagePlus,
  Images,
  Layers3,
  Maximize2,
  PaintBucket,
  Repeat2,
  Sparkles,
  UploadCloud,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { estimateCredits, modePricing, type ResolutionTier, type StudioMode } from "@/lib/billing/pricing";
import { submitImageGeneration } from "@/lib/image2api/client";
import {
  ASPECT_RATIO_SELECTOR_CLASS_NAME,
  COUNT_SELECTOR_CLASS_NAME,
  EDITOR_PANEL_GRID_CLASS_NAME,
  GENERATED_IMAGE_CLASS_NAME,
  MODE_OPTION_CLASS_NAME,
  PREVIEW_PANEL_CLASS_NAME,
  PRIMARY_ASPECT_RATIOS,
  STUDIO_WORKSPACE_GRID_CLASS_NAME,
} from "./layout-constants";
import {
  sizeFromStudioPreset,
  studioAspectRatioOptions,
  type StudioAspectRatio,
} from "@/lib/image2api/size-presets";
import { useSessionUser } from "@/lib/storage/session-hooks";

type UploadedAsset = { id: string; name: string; dataUrl: string; role: "image" | "mask" };

const DEFAULT_PROMPT = "流星雨划过澄澈夜空，远处山脊与湖面倒影，真实摄影，广角构图";

const uploadModes: StudioMode[] = ["image", "edit", "remove-bg", "upscale", "background"];
const modeIcons: Record<StudioMode, LucideIcon> = {
  text: FileImage,
  image: Images,
  edit: Brush,
  "remove-bg": Eraser,
  upscale: Maximize2,
  background: PaintBucket,
  batch: Repeat2,
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}


function shortModeLabel(label: string) {
  return label.replace("图片", "").replace("批量一致性", "批量");
}

function ratioIconSize(value: StudioAspectRatio) {
  const [wRaw, hRaw] = value.split(":").map(Number);
  const w = Number.isFinite(wRaw) && wRaw > 0 ? wRaw : 1;
  const h = Number.isFinite(hRaw) && hRaw > 0 ? hRaw : 1;
  const max = 26;
  if (w >= h) return { width: max, height: Math.max(11, Math.round(max * (h / w))) };
  return { width: Math.max(11, Math.round(max * (w / h))), height: max };
}

export function StudioPage() {
  const [mode, setMode] = useState<StudioMode>("text");
  const [resolution, setResolution] = useState<ResolutionTier>("1k");
  const [aspectRatio, setAspectRatio] = useState<StudioAspectRatio>("1:1");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [count, setCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [result, setResult] = useState<string[]>([]);
  const { user } = useSessionUser();
  const cost = estimateCredits(mode, resolution, count);
  const activeMode = modePricing[mode];
  const needsUpload = useMemo(() => uploadModes.includes(mode), [mode]);
  const referenceImages = assets.filter((item) => item.role === "image");
  const maskImage = assets.find((item) => item.role === "mask");
  const previewGridClass = result.length > 1 ? "grid gap-4 2xl:grid-cols-2" : "grid gap-4";
  const primaryAspectRatioOptions = studioAspectRatioOptions.filter((item) => PRIMARY_ASPECT_RATIOS.includes(item.value));

  async function appendFiles(files: FileList | null, role: "image" | "mask") {
    if (!files?.length) return;
    const next: UploadedAsset[] = [];
    for (const file of Array.from(files).slice(0, role === "mask" ? 1 : 4)) {
      if (!file.type.startsWith("image/")) continue;
      next.push({ id: crypto.randomUUID(), name: file.name, dataUrl: await fileToDataUrl(file), role });
    }
    if (!next.length) return;
    setAssets((prev) => role === "mask" ? [...prev.filter((item) => item.role !== "mask"), next[0]] : [...prev, ...next].slice(0, 5));
  }

  async function submit() {
    if (!user) {
      toast.error("请先登录后再创作");
      return;
    }
    if (needsUpload && !referenceImages.length) {
      toast.error("这个功能需要先上传图片");
      return;
    }
    if (mode === "edit" && !maskImage) {
      toast.error("局部编辑需要上传遮罩图");
      return;
    }
    setBusy(true);
    try {
      const response = await submitImageGeneration({
        mode,
        prompt,
        n: count,
        size: sizeFromStudioPreset(aspectRatio, resolution),
        reference_images: referenceImages.map((item) => item.dataUrl),
        mask: maskImage?.dataUrl,
      });
      setResult(response.imageUrls);
      toast.success("生成完成，已保存到作品");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "生成失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={STUDIO_WORKSPACE_GRID_CLASS_NAME}>
      <section className={EDITOR_PANEL_GRID_CLASS_NAME}>
        <aside className="self-start rounded-[28px] border border-white/10 bg-[#151827] p-3 text-white shadow-2xl shadow-[#151827]/12">
          <p className="px-2 text-xs font-semibold tracking-[0.18em] text-[#7adfee]">创作类型</p>
          <h2 className="mt-1 px-2 text-2xl font-semibold tracking-[-0.05em]">模式</h2>
          <div className="mt-4 grid gap-2">
            {Object.entries(modePricing).map(([key, item]) => {
              const Icon = modeIcons[key as StudioMode] || FileImage;
              const active = mode === key;
              return (
                <button
                  key={key}
                  className={`${MODE_OPTION_CLASS_NAME} ${active ? "border-[#78e6ff]/70 bg-white/12 text-white shadow-[0_0_0_1px_rgba(120,230,255,.3),0_16px_42px_rgba(120,230,255,.16)]" : "border-white/8 bg-white/5 text-white/78 hover:bg-white/9"}`}
                  onClick={() => setMode(key as StudioMode)}
                  title={item.description}
                  type="button"
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-[#78e6ff]/18 text-[#86edff]" : "bg-white/6 text-white/58"}`}>
                    <Icon size={18} />
                  </span>
                  <b className="text-lg leading-6">{shortModeLabel(item.label)}</b>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="rounded-[28px] border border-[#1d3346]/10 bg-[#fbfdfe] p-5">
            {!user ? (
              <div className="mb-4 rounded-[22px] border border-[#2d6f82]/16 bg-[#eef8f6] p-3 text-sm text-[#294258]/70">
                登录后即可使用创作、保存作品和管理积分。
                <Link to="/login" className="ml-2 font-semibold text-[#2d6f82]">去登录</Link>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold tracking-[0.14em] text-[#2d6f82]">创作参数</p>
              <span className="rounded-full bg-[#edf4f7] px-4 py-2 text-sm font-semibold text-[#20384d]">{cost} 积分</span>
            </div>

            {needsUpload ? (
              <div className="mt-4 rounded-[24px] border border-dashed border-[#1d3346]/18 bg-[#f4f8fa] p-4 text-[#294258]/70">
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#142536] px-5 py-3 text-white shadow-lg">
                    <UploadCloud size={18} /> 上传图片
                    <input className="hidden" type="file" accept="image/*" multiple onChange={(event) => void appendFiles(event.target.files, "image")} />
                  </label>
                  {mode === "edit" ? (
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#2d6f82] px-5 py-3 text-white shadow-lg">
                      <ImagePlus size={18} /> 上传遮罩
                      <input className="hidden" type="file" accept="image/*" onChange={(event) => void appendFiles(event.target.files, "mask")} />
                    </label>
                  ) : null}
                </div>
                {assets.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {assets.map((item) => (
                      <figure key={item.id} className="relative overflow-hidden rounded-2xl border border-[#1d3346]/10 bg-white">
                        <img src={item.dataUrl} alt={item.name} className="aspect-video w-full object-cover" />
                        <figcaption className="truncate px-3 py-2 text-xs">{item.role === "mask" ? "遮罩" : "源图"} · {item.name}</figcaption>
                        <button className="absolute right-2 top-2 rounded-full bg-white/90 p-1" onClick={() => setAssets((prev) => prev.filter((asset) => asset.id !== item.id))} type="button"><X size={14} /></button>
                      </figure>
                    ))}
                  </div>
                ) : <p className="mt-4 text-sm">这个功能需要上传图片后才能提交。</p>}
              </div>
            ) : null}

            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#294258]/74">比例</p>
                  <span className="text-xs text-[#294258]/42">选择图片画幅</span>
                </div>
                <div className={ASPECT_RATIO_SELECTOR_CLASS_NAME}>
                  {primaryAspectRatioOptions.map((item) => {
                    const active = aspectRatio === item.value;
                    return (
                      <button
                        key={item.value}
                        aria-label={`图片比例 ${item.value}`}
                        className={`grid h-18 place-items-center rounded-2xl border text-sm font-semibold transition ${active ? "border-[#142536] bg-[#142536] text-white shadow-lg" : "border-[#1d3346]/10 bg-[#edf4f7] text-[#20384d] hover:bg-[#dfecef]"}`}
                        onClick={() => setAspectRatio(item.value)}
                        type="button"
                      >
                        <span className={`grid place-items-center rounded-md border-2 ${active ? "border-white" : "border-[#20384d]/65"}`} style={ratioIconSize(item.value)} />
                        <span>{item.value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#294258]/74">输出数量</p>
                  <span className="text-xs text-[#294258]/42">一次生成几张</span>
                </div>
                <div className={COUNT_SELECTOR_CLASS_NAME}>
                  {[1, 2, 3, 4].map((item) => (
                    <button
                      key={item}
                      className={`rounded-2xl border px-4 py-3 text-lg font-semibold transition ${count === item ? "border-[#142536] bg-[#142536] text-white shadow-lg" : "border-[#1d3346]/10 bg-[#edf4f7] text-[#20384d] hover:bg-[#dfecef]"}`}
                      onClick={() => setCount(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#294258]/74">清晰度</p>
                  <span className="text-xs text-[#294258]/42">{sizeFromStudioPreset(aspectRatio, resolution)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {(["1k", "2k", "4k"] as ResolutionTier[]).map((item) => (
                    <button key={item} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${resolution === item ? "bg-[#142536] text-white shadow-lg" : "bg-[#edf4f7] text-[#20384d]"}`} onClick={() => setResolution(item)} type="button">
                      {item.toUpperCase()} · {sizeFromStudioPreset(aspectRatio, item)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#1d3346]/10 bg-[#fbfdfe] p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold tracking-[0.14em] text-[#2d6f82]">提示词</p>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#142536]">描述你要生成的画面</h2>
              </div>
              <span className="text-xs text-[#294258]/45">{prompt.length} 字</span>
            </div>
            <textarea
              className="min-h-56 w-full resize-none rounded-[26px] border border-[#1d3346]/10 bg-white p-5 text-base leading-8 text-[#17202a] outline-none transition placeholder:text-[#294258]/35 focus:border-[#2d6f82]/35 focus:bg-white"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={PREVIEW_PANEL_CLASS_NAME}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.14em] text-[#2d6f82]">图片生成</p>
            <h2 className="text-4xl font-semibold tracking-[-0.055em] text-[#142536]">生成与预览</h2>
            <p className="mt-2 text-sm text-[#294258]/58">结果会完整显示在这里，点击图片可打开原图。</p>
          </div>
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[#142536] px-7 py-3 text-white shadow-xl shadow-[#142536]/18 disabled:opacity-50" onClick={submit} type="button">
            {busy ? <Layers3 size={18} /> : <Sparkles size={18} />}
            {busy ? "生成中" : "开始生成"}
          </button>
        </div>

        <div className="mt-5 rounded-[32px] border border-[#1d3346]/10 bg-[#f8fbfc] p-4 shadow-inner shadow-white/60">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold tracking-[0.14em] text-[#2d6f82]">生成结果</p>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#142536]">预览与下载</h3>
            </div>
            {result.length ? <span className="rounded-full bg-white px-3 py-1 text-sm text-[#294258]/58">{result.length} 张</span> : null}
          </div>
          <div className={previewGridClass}>
            {result.map((url, index) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="group flex min-h-[540px] items-center justify-center overflow-hidden rounded-[28px] border border-[#1d3346]/10 bg-white p-3 shadow-sm">
                <img src={url} className={GENERATED_IMAGE_CLASS_NAME} alt={`生成结果 ${index + 1}`} />
              </a>
            ))}
            {!result.length ? (
              <div className="grid min-h-[620px] place-items-center rounded-[28px] border border-dashed border-[#1d3346]/14 bg-white/70 text-center text-[#294258]/48">
                <div>
                  <WandSparkles className="mx-auto mb-3" />
                  图片会在这里完整预览
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
