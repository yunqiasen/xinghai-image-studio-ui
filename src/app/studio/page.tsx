import {
  Brush,
  ChevronDown,
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
  CONTROLS_PANEL_CLASS_NAME,
  EDITOR_PANEL_GRID_CLASS_NAME,
  GENERATED_IMAGE_CLASS_NAME,
  MODEL_SELECTOR_CLASS_NAME,
  PREVIEW_PANEL_CLASS_NAME,
  PRIMARY_ASPECT_RATIOS,
  PROMPT_TEMPLATE_COLLAPSED_COUNT,
  STUDIO_MODEL_LABEL,
  STUDIO_PAGE_CLASS_NAME,
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
type PromptTemplate = { name: string; prompt: string };

const DEFAULT_PROMPT = "流星雨划过澄澈夜空，远处山脊与湖面倒影，真实摄影，广角构图";
const MODEL_VALUE = "gpt-image-2";
const MAX_PROMPT_LENGTH = 1000;

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
  text: "提示词生成",
  image: "参考图重绘",
  edit: "遮罩编辑",
  "remove-bg": "抠出主体",
  upscale: "提升细节",
  background: "替换场景",
  batch: "批量一致",
};

const promptTemplates: PromptTemplate[] = [
  { name: "真实摄影", prompt: "清晨自然光下的真实摄影，主体清晰，背景柔和虚化，色彩干净高级，35mm 镜头，细节丰富" },
  { name: "商业主图", prompt: "高端电商商业主图，产品居中，干净背景，柔和布光，质感突出，留白合理，适合广告投放" },
  { name: "动漫角色", prompt: "精致动漫角色设定图，清晰五官，服饰细节丰富，柔和光影，干净背景，角色一致性强" },
  { name: "漫画分镜", prompt: "电影感漫画分镜画面，强叙事构图，动态镜头，人物表情明确，光影层次丰富，画面干净" },
  { name: "3D 渲染", prompt: "高质量 3D 渲染风格，细腻材质，真实灯光，全局光照，干净构图，产品级视觉效果" },
  { name: "换背景", prompt: "保留主体形态和细节，替换为高级室内摄影棚背景，柔和阴影，真实融合，不改变主体比例" },
  { name: "统一角色", prompt: "同一角色多场景一致性生成，保持发型、服装、五官、年龄和气质一致，画风统一，适合漫画分镜" },
  { name: "高级灰调色", prompt: "高级灰电影调色，低饱和度，柔和对比，细腻颗粒感，安静高级的视觉氛围，构图稳定" },
];

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
  const [selectedModel, setSelectedModel] = useState(MODEL_VALUE);
  const [resolution, setResolution] = useState<ResolutionTier>("1k");
  const [aspectRatio, setAspectRatio] = useState<StudioAspectRatio>("1:1");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [count, setCount] = useState(1);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
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
  const visiblePromptTemplates = showAllTemplates ? promptTemplates : promptTemplates.slice(0, PROMPT_TEMPLATE_COLLAPSED_COUNT);

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
    <div className={STUDIO_PAGE_CLASS_NAME}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,.13),transparent_30%),radial-gradient(circle_at_92%_4%,rgba(236,72,153,.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,.96),rgba(246,248,252,.94))]" />

      <div className={STUDIO_WORKSPACE_GRID_CLASS_NAME}>
        <section className={EDITOR_PANEL_GRID_CLASS_NAME}>
          <div className={CONTROLS_PANEL_CLASS_NAME}>
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-[#f0abfc]">XINGHAI STUDIO</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">图片生成</h1>
              </div>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 max-sm:w-10 max-sm:px-0">
                  {(() => {
                    const ActiveIcon = modeIcons[mode] || FileImage;
                    return <ActiveIcon size={15} />;
                  })()}
                  <span className="hidden whitespace-nowrap sm:inline">{shortModeLabel(modePricing[mode].label)}</span>
                  <ChevronDown className="hidden text-white/50 sm:block" size={14} />
                  <select
                    aria-label="创作类型"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    value={mode}
                    onChange={(event) => setMode(event.target.value as StudioMode)}
                  >
                    {Object.entries(modePricing).map(([key, item]) => (
                      <option key={key} value={key}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <div className="rounded-full border border-white/10 bg-white/9 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20">
                  {cost} 积分
                </div>
              </div>
            </div>

            {!user ? (
              <div className="mb-5 rounded-2xl border border-[#60a5fa]/20 bg-[#60a5fa]/10 px-4 py-3 text-sm text-[#dbeafe]">
                登录后可生成图片、保存作品和管理积分。
                <Link to="/login" className="ml-2 font-semibold text-white underline decoration-[#93c5fd]/50 underline-offset-4">去登录</Link>
              </div>
            ) : null}

            <div className="space-y-5">

              <section className="space-y-2">
                <p className="text-sm font-semibold text-white">模型</p>
                <p className="text-xs text-white/42">选择要使用的型号</p>
                <label className={`${MODEL_SELECTOR_CLASS_NAME} relative cursor-pointer`}>
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d946ef]/16 text-[#f0abfc]">
                      <Sparkles size={18} />
                    </span>
                    <span className="truncate text-base font-semibold text-white">{STUDIO_MODEL_LABEL}</span>
                  </span>
                  <ChevronDown className="shrink-0 text-white/52" size={18} />
                  <select
                    aria-label="图片模型"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    value={selectedModel}
                    onChange={(event) => setSelectedModel(event.target.value)}
                  >
                    <option value={MODEL_VALUE}>{STUDIO_MODEL_LABEL}</option>
                  </select>
                </label>
              </section>

              {needsUpload ? (
                <section className="rounded-[22px] border border-dashed border-[#a78bfa]/30 bg-[#a78bfa]/8 p-4 text-sm text-white/64">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">上传素材</p>
                      <p className="mt-1 text-xs text-white/48">{activeMode.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-[#171626] shadow-lg shadow-black/20">
                        <UploadCloud size={17} /> 上传图片
                        <input className="hidden" type="file" accept="image/*" multiple onChange={(event) => void appendFiles(event.target.files, "image")} />
                      </label>
                      {mode === "edit" ? (
                        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#d946ef] px-4 py-2 font-semibold text-white shadow-lg shadow-[#d946ef]/22">
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
                </section>
              ) : null}


              <section className="space-y-2">
                <div>
                  <p className="text-sm font-semibold text-white">比例</p>
                  <p className="mt-1 text-xs text-white/42">选择要使用的宽高比</p>
                </div>
                <div className={ASPECT_RATIO_SELECTOR_CLASS_NAME}>
                  {primaryAspectRatioOptions.map((item) => {
                    const active = aspectRatio === item.value;
                    return (
                      <button
                        key={item.value}
                        aria-label={`图片比例 ${item.value}`}
                        aria-pressed={active}
                        className={`grid min-h-14 place-items-center rounded-2xl border px-2 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d946ef]/70 ${active ? "border-[#d946ef] bg-[#d946ef]/18 text-[#f0abfc] shadow-[0_0_24px_rgba(217,70,239,.22)]" : "border-white/10 bg-black/18 text-white/70 hover:border-white/20 hover:bg-white/8"}`}
                        onClick={() => setAspectRatio(item.value)}
                        title={item.label}
                        type="button"
                      >
                        <span className={`grid place-items-center rounded-[5px] border-2 ${active ? "border-[#f0abfc]" : "border-white/64"}`} style={ratioIconSize(item.value)} />
                        <span>{item.value}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">生成张数</p>
                  <p className="mt-1 text-xs text-white/42">选择输出数量</p>
                </div>
                <label className="relative block w-36 shrink-0">
                  <select
                    aria-label="生成张数"
                    className="min-h-12 w-full appearance-none rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-base font-semibold text-white outline-none transition focus:border-[#d946ef]/70 focus:ring-2 focus:ring-[#d946ef]/35"
                    value={count}
                    onChange={(event) => setCount(Number(event.target.value))}
                  >
                    {[1, 2, 3, 4].map((item) => <option key={item} value={item}>{item} 张</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/52" size={18} />
                </label>
              </section>

              <section className="space-y-2">
                <p className="text-sm font-semibold text-white">分辨率</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["1k", "2k", "4k"] as ResolutionTier[]).map((item) => (
                    <button
                      key={item}
                      aria-pressed={resolution === item}
                      className={`min-h-11 rounded-2xl border px-3 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d946ef]/70 ${resolution === item ? "border-[#d946ef] bg-[#d946ef]/16 text-[#f5d0fe] shadow-[0_0_22px_rgba(217,70,239,.16)]" : "border-white/10 bg-black/18 text-white/62 hover:bg-white/8"}`}
                      onClick={() => setResolution(item)}
                      type="button"
                    >
                      {item.toUpperCase()} · {sizeFromStudioPreset(aspectRatio, item)}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-2 rounded-[22px] border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">提示词模板</p>
                    <p className="mt-1 text-xs text-white/42">点击名字填入提示词框</p>
                  </div>
                  <button
                    className="min-h-9 rounded-full border border-white/10 px-3 text-xs font-semibold text-white/68 transition hover:bg-white/8"
                    onClick={() => setShowAllTemplates((value) => !value)}
                    type="button"
                  >
                    {showAllTemplates ? "收起" : "更多"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {visiblePromptTemplates.map((template) => (
                    <button
                      key={template.name}
                      className="min-h-10 rounded-full border border-white/10 bg-black/18 px-3 text-sm font-semibold text-white/72 transition hover:border-[#d946ef]/45 hover:bg-[#d946ef]/14 hover:text-white"
                      onClick={() => setPrompt(template.prompt)}
                      type="button"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">提示词</p>
                    <p className="mt-1 text-xs text-white/42">输入提示词即可生成图片。</p>
                  </div>
                  <span className="text-xs text-white/42">{prompt.length}/{MAX_PROMPT_LENGTH}</span>
                </div>
                <textarea
                  aria-label="图片生成提示词"
                  className="min-h-44 w-full resize-none rounded-[22px] border border-white/10 bg-black/22 p-4 text-base leading-7 text-white outline-none transition placeholder:text-white/28 focus:border-[#d946ef]/55 focus:bg-black/30"
                  maxLength={MAX_PROMPT_LENGTH}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                />
                <button
                  disabled={busy}
                  className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#6d28d9,#d946ef)] px-6 py-3 text-base font-semibold text-white shadow-[0_18px_46px_rgba(109,40,217,.28)] transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
                  onClick={submit}
                  type="button"
                >
                  {busy ? <Layers3 size={19} /> : <Sparkles size={19} />}
                  {busy ? "生成中" : "生成"}
                </button>
              </section>
            </div>
          </div>
        </section>

        <section className={PREVIEW_PANEL_CLASS_NAME}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5eaf1] pb-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-[#7c3aed]">PREVIEW</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#111827]">生成预览</h2>
              <p className="mt-1 text-sm text-slate-500">图片完整显示，不裁切。点击结果打开原图。</p>
            </div>
            <div className="rounded-full border border-[#e5eaf1] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-slate-600">
              {result.length ? `${result.length} 张结果` : `${aspectRatio} · ${resolution.toUpperCase()}`}
            </div>
          </div>

          <div className="mt-5 rounded-[30px] border border-[#e5eaf1] bg-[#f8fafc] p-3 shadow-inner shadow-slate-200/80">
            <div className={previewGridClass}>
              {result.map((url, index) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-[650px] items-center justify-center overflow-hidden rounded-[26px] border border-[#e5eaf1] bg-white p-4"
                >
                  <img src={url} className={GENERATED_IMAGE_CLASS_NAME} alt={`生成结果 ${index + 1}`} />
                </a>
              ))}
              {!result.length ? (
                <div className="grid min-h-[690px] place-items-center rounded-[26px] border border-dashed border-[#d8e1ec] bg-[linear-gradient(45deg,rgba(148,163,184,.08)_25%,transparent_25%,transparent_50%,rgba(148,163,184,.08)_50%,rgba(148,163,184,.08)_75%,transparent_75%,transparent)] bg-[length:28px_28px] text-center">
                  <div className="max-w-xs rounded-[24px] border border-[#e5eaf1] bg-white/86 px-8 py-7 shadow-xl shadow-slate-200/80 backdrop-blur">
                    <WandSparkles className="mx-auto mb-3 text-[#a855f7]" size={28} />
                    <p className="text-lg font-semibold text-[#111827]">等待生成</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">左侧填写提示词和参数，生成后会在这里直接预览。</p>
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
