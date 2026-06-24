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

type RatioIconSize = { width: number; height: number };

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

const modeShortDescriptions: Record<StudioMode, string> = {
  text: "输入提示词生成图片",
  image: "上传参考图后重绘",
  edit: "上传遮罩做局部修改",
  "remove-bg": "快速抠出主体",
  upscale: "提升清晰度和细节",
  background: "保留主体替换场景",
  batch: "角色和分镜批量生成",
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

function ratioIconSize(value: StudioAspectRatio): RatioIconSize {
  const [wRaw, hRaw] = value.split(":").map(Number);
  const w = Number.isFinite(wRaw) && wRaw > 0 ? wRaw : 1;
  const h = Number.isFinite(hRaw) && hRaw > 0 ? hRaw : 1;
  const max = 24;
  if (w >= h) return { width: max, height: Math.max(9, Math.round(max * (h / w))) };
  return { width: Math.max(9, Math.round(max * (w / h))), height: max };
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
  const primaryAspectRatioOptions = useMemo(() => {
    const optionByValue = new Map(studioAspectRatioOptions.map((item) => [item.value, item]));
    return PRIMARY_ASPECT_RATIOS.map((value) => optionByValue.get(value)).filter(Boolean) as typeof studioAspectRatioOptions;
  }, []);

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
    <div className="relative left-1/2 -my-6 h-[calc(100vh-73px)] w-screen -translate-x-1/2 overflow-y-auto overflow-x-hidden bg-[#080812] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(240,67,211,.28),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(72,214,255,.18),transparent_28%),linear-gradient(135deg,#080812_0%,#101026_48%,#070710_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-8 h-56 w-[720px] -translate-x-1/2 rounded-full bg-[#f043d3]/10 blur-3xl" />

      <div className={STUDIO_WORKSPACE_GRID_CLASS_NAME}>
        <section className={EDITOR_PANEL_GRID_CLASS_NAME}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-[#f86bdd]">XINGHAI STUDIO</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">图像创作</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20">
                {cost} 积分
              </div>
              <button
                disabled={busy}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f043d3,#7c4dff)] px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_46px_rgba(240,67,211,.28)] transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
                onClick={submit}
                type="button"
              >
                {busy ? <Layers3 size={17} /> : <Sparkles size={17} />}
                {busy ? "生成中" : "开始生成"}
              </button>
            </div>
          </div>

          {!user ? (
            <div className="mb-4 rounded-2xl border border-[#48d6ff]/20 bg-[#48d6ff]/8 px-4 py-3 text-sm text-[#cdeef6]">
              登录后可生成图片、保存作品和管理积分。
              <Link to="/login" className="ml-2 font-semibold text-white underline decoration-[#48d6ff]/50 underline-offset-4">去登录</Link>
            </div>
          ) : null}

          <div className="grid gap-4 2xl:grid-cols-[230px_minmax(0,1fr)]">
            <aside className="rounded-[26px] border border-white/10 bg-black/18 p-3">
              <p className="px-1 text-sm font-semibold text-white/88">创作类型</p>
              <div className="mt-3 grid gap-2">
                {Object.entries(modePricing).map(([key, item]) => {
                  const studioMode = key as StudioMode;
                  const Icon = modeIcons[studioMode] || FileImage;
                  const active = mode === key;
                  return (
                    <button
                      key={key}
                      aria-pressed={active}
                      className={`${MODE_OPTION_CLASS_NAME} ${active ? "border-[#f043d3]/75 bg-[#3a174b] text-white shadow-[0_0_0_1px_rgba(240,67,211,.45),0_18px_50px_rgba(240,67,211,.22)]" : "border-white/8 bg-white/5 text-white/72 hover:border-white/16 hover:bg-white/9"}`}
                      onClick={() => setMode(studioMode)}
                      title={item.description}
                      type="button"
                    >
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? "bg-[#f043d3]/18 text-[#ff7bea]" : "bg-white/7 text-white/52"}`}>
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <b className="block text-base leading-5">{shortModeLabel(item.label)}</b>
                        <span className="mt-1 block truncate text-xs text-white/48">{modeShortDescriptions[studioMode]}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="min-w-0 space-y-4">
              {needsUpload ? (
                <div className="rounded-[24px] border border-dashed border-[#48d6ff]/24 bg-[#48d6ff]/6 p-4 text-sm text-white/64">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">上传素材</p>
                      <p className="mt-1 text-xs text-white/48">{activeMode.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-[#100f1c] shadow-lg shadow-black/20">
                        <UploadCloud size={17} /> 上传图片
                        <input className="hidden" type="file" accept="image/*" multiple onChange={(event) => void appendFiles(event.target.files, "image")} />
                      </label>
                      {mode === "edit" ? (
                        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#f043d3] px-4 py-2 font-semibold text-white shadow-lg shadow-[#f043d3]/22">
                          <ImagePlus size={17} /> 上传遮罩
                          <input className="hidden" type="file" accept="image/*" onChange={(event) => void appendFiles(event.target.files, "mask")} />
                        </label>
                      ) : null}
                    </div>
                  </div>
                  {assets.length ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {assets.map((item) => (
                        <figure key={item.id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/18">
                          <img src={item.dataUrl} alt={item.name} className="aspect-video w-full object-cover" />
                          <figcaption className="truncate px-3 py-2 text-xs text-white/58">{item.role === "mask" ? "遮罩" : "源图"} · {item.name}</figcaption>
                          <button
                            aria-label="移除素材"
                            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white backdrop-blur"
                            onClick={() => setAssets((prev) => prev.filter((asset) => asset.id !== item.id))}
                            type="button"
                          >
                            <X size={14} />
                          </button>
                        </figure>
                      ))}
                    </div>
                  ) : <p className="mt-3 text-xs text-white/45">这个功能需要上传图片后才能提交。</p>}
                </div>
              ) : null}

              <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">比例</p>
                    <p className="mt-1 text-xs text-white/42">选择最终图片画幅</p>
                  </div>
                  <span className="text-xs text-white/42">{sizeFromStudioPreset(aspectRatio, resolution)}</span>
                </div>
                <div className={ASPECT_RATIO_SELECTOR_CLASS_NAME}>
                  {primaryAspectRatioOptions.map((item) => {
                    const active = aspectRatio === item.value;
                    return (
                      <button
                        key={item.value}
                        aria-label={`图片比例 ${item.value}`}
                        aria-pressed={active}
                        className={`grid min-h-16 place-items-center rounded-2xl border px-2 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f043d3]/70 ${active ? "border-[#f043d3] bg-[#f043d3]/22 text-[#ff7bea] shadow-[0_0_24px_rgba(240,67,211,.25)]" : "border-white/10 bg-black/20 text-white/70 hover:border-white/20 hover:bg-white/8"}`}
                        onClick={() => setAspectRatio(item.value)}
                        title={item.label}
                        type="button"
                      >
                        <span className={`grid place-items-center rounded-[5px] border-2 ${active ? "border-[#ff7bea]" : "border-white/62"}`} style={ratioIconSize(item.value)} />
                        <span>{item.value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.7fr_1fr] 2xl:grid-cols-1">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">输出数量</p>
                      <p className="mt-1 text-xs text-white/42">一次生成几张</p>
                    </div>
                  </div>
                  <div className={COUNT_SELECTOR_CLASS_NAME}>
                    {[1, 2, 3, 4].map((item) => (
                      <button
                        key={item}
                        aria-pressed={count === item}
                        className={`min-h-13 rounded-2xl border px-4 py-3 text-lg font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f043d3]/70 ${count === item ? "border-[#f043d3] bg-[#f043d3] text-white shadow-[0_18px_34px_rgba(240,67,211,.28)]" : "border-white/10 bg-black/20 text-white/72 hover:bg-white/8"}`}
                        onClick={() => setCount(item)}
                        type="button"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">清晰度</p>
                      <p className="mt-1 text-xs text-white/42">越高清积分越高</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["1k", "2k", "4k"] as ResolutionTier[]).map((item) => (
                      <button
                        key={item}
                        aria-pressed={resolution === item}
                        className={`min-h-11 rounded-2xl border px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f043d3]/70 ${resolution === item ? "border-white bg-white text-[#100f1c] shadow-lg shadow-white/10" : "border-white/10 bg-black/20 text-white/68 hover:bg-white/8"}`}
                        onClick={() => setResolution(item)}
                        type="button"
                      >
                        {item.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">提示词</p>
                    <p className="mt-1 text-xs text-white/42">描述主体、场景、光线、风格</p>
                  </div>
                  <span className="text-xs text-white/42">{prompt.length} 字</span>
                </div>
                <textarea
                  aria-label="图片生成提示词"
                  className="min-h-48 w-full resize-none rounded-[22px] border border-white/10 bg-black/26 p-4 text-base leading-7 text-white outline-none transition placeholder:text-white/28 focus:border-[#f043d3]/55 focus:bg-black/34"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className={PREVIEW_PANEL_CLASS_NAME}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-[#48d6ff]">PREVIEW</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">生成预览</h2>
              <p className="mt-1 text-sm text-white/46">图片完整显示，不裁切。点击结果打开原图。</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm text-white/70">
              {result.length ? `${result.length} 张结果` : `${aspectRatio} · ${resolution.toUpperCase()}`}
            </div>
          </div>

          <div className="mt-5 rounded-[30px] border border-white/10 bg-[#080812] p-3 shadow-inner shadow-black/60">
            <div className={previewGridClass}>
              {result.map((url, index) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-[650px] items-center justify-center overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(72,214,255,.12),transparent_35%),#0d0c16] p-4"
                >
                  <img src={url} className={GENERATED_IMAGE_CLASS_NAME} alt={`生成结果 ${index + 1}`} />
                </a>
              ))}
              {!result.length ? (
                <div className="grid min-h-[690px] place-items-center rounded-[26px] border border-dashed border-white/14 bg-[linear-gradient(45deg,rgba(255,255,255,.035)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.035)_50%,rgba(255,255,255,.035)_75%,transparent_75%,transparent)] bg-[length:28px_28px] text-center">
                  <div className="max-w-xs rounded-[24px] border border-white/10 bg-black/28 px-8 py-7 backdrop-blur">
                    <WandSparkles className="mx-auto mb-3 text-[#f86bdd]" size={28} />
                    <p className="text-lg font-semibold text-white">等待生成</p>
                    <p className="mt-2 text-sm leading-6 text-white/48">左侧填写提示词和参数，生成后会在这里直接预览。</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
