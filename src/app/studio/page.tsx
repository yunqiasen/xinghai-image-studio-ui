import { ImagePlus, Layers3, Sparkles, UploadCloud, WandSparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { estimateCredits, modePricing, type ResolutionTier, type StudioMode } from "@/lib/billing/pricing";
import { submitImageGeneration } from "@/lib/image2api/client";
import {
  sizeFromStudioPreset,
  studioAspectRatioOptions,
  type StudioAspectRatio,
} from "@/lib/image2api/size-presets";
import { useSessionUser } from "@/lib/storage/session-hooks";

type UploadedAsset = { id: string; name: string; dataUrl: string; role: "image" | "mask" };

const promptTemplates = [
  "流星雨划过澄澈夜空，远处山脊与湖面倒影，真实摄影，广角构图",
  "高端护肤品商业主图，浅灰蓝背景，柔和棚拍光，精致水波纹",
  "未来城市夜景，雨后路面反光，电影感灯光，细节丰富",
  "漫画分镜，统一角色，温暖室内场景，清晰线稿，柔和色彩",
  "动漫角色设定，全身立绘，干净背景，服装细节精致",
  "保留主体，把背景替换为海边落日，真实摄影风格，自然光",
];

const styleTags = ["真实摄影", "商业主图", "动漫角色", "漫画分镜", "3D 渲染", "换背景", "统一角色", "高级灰调色"];
const uploadModes: StudioMode[] = ["image", "edit", "remove-bg", "upscale", "background"];

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

function helperText(mode: StudioMode) {
  if (mode === "image") return "上传参考图后，根据提示词重绘风格、构图或细节。";
  if (mode === "edit") return "上传原图和遮罩图，提示词描述需要修改的局部。";
  if (mode === "remove-bg") return "上传图片后抠出主体，生成透明或干净背景版本。";
  if (mode === "upscale") return "上传图片后提升清晰度和细节表现。";
  if (mode === "background") return "上传主体图，提示词描述新背景。";
  if (mode === "batch") return "适合角色设定、漫画分镜和商品素材批量生成。";
  return "输入提示词即可生成图片。";
}

export function StudioPage() {
  const [mode, setMode] = useState<StudioMode>("text");
  const [resolution, setResolution] = useState<ResolutionTier>("1k");
  const [aspectRatio, setAspectRatio] = useState<StudioAspectRatio>("1:1");
  const [prompt, setPrompt] = useState(promptTemplates[0]);
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
    <div className="grid gap-5 lg:grid-cols-[330px_1fr_320px]">
      <aside className="space-y-4 rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-[#2d6f82]">创作类型</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#142536]">选择功能</h2>
        </div>
        <div className="grid gap-2">
          {Object.entries(modePricing).map(([key, item]) => (
            <button
              key={key}
              className={`rounded-2xl border p-3 text-left transition ${mode === key ? "border-[#142536] bg-[#142536] text-white shadow-xl" : "border-[#1d3346]/10 bg-white/80 text-[#20384d] hover:bg-[#edf4f7]"}`}
              onClick={() => setMode(key as StudioMode)}
              type="button"
            >
              <b>{item.label}</b>
              <p className="mt-1 text-sm opacity-70">{item.description}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-[34px] border border-[#1d3346]/10 bg-white/82 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[#294258]/52">当前：{activeMode.label}</p>
            <h1 className="text-5xl font-semibold tracking-[-0.055em] text-[#142536]">图片工作台</h1>
            <p className="mt-2 text-sm text-[#294258]/58">{helperText(mode)}</p>
          </div>
          <span className="rounded-full bg-[#edf4f7] px-4 py-2 text-sm font-semibold text-[#20384d]">{cost} 积分</span>
        </div>

        {!user ? (
          <div className="mt-5 rounded-[24px] border border-[#2d6f82]/16 bg-[#eef8f6] p-4 text-sm text-[#294258]/70">
            登录后即可使用创作、保存作品和管理积分。
            <Link to="/login" className="ml-2 font-semibold text-[#2d6f82]">去登录</Link>
          </div>
        ) : null}

        <textarea
          className="mt-5 min-h-44 w-full resize-none rounded-[28px] border border-[#1d3346]/10 bg-[#f8fbfc] p-5 text-lg leading-8 text-[#17202a] outline-none transition placeholder:text-[#294258]/35 focus:border-[#2d6f82]/35 focus:bg-white"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="flex flex-wrap gap-2">
            {styleTags.map((item) => (
              <button key={item} className="rounded-full bg-[#edf4f7] px-4 py-2 text-sm text-[#20384d] hover:bg-[#dfecef]" onClick={() => setPrompt(`${prompt}，${item}`)} type="button">
                {item}
              </button>
            ))}
          </div>
          <label className="rounded-2xl border border-[#1d3346]/10 bg-white/80 p-3 text-sm text-[#294258]/62">
            生成张数
            <select className="mt-2 w-full bg-transparent text-lg font-semibold text-[#142536] outline-none" value={count} onChange={(event) => setCount(Number(event.target.value))}>
              {[1, 2, 3, 4].map((item) => <option key={item} value={item}>{item} 张</option>)}
            </select>
          </label>
        </div>

        {needsUpload ? (
          <div className="mt-5 rounded-[28px] border border-dashed border-[#1d3346]/18 bg-[#f4f8fa] p-5 text-[#294258]/70">
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
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
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

        <div className="mt-5 grid gap-3 rounded-[28px] border border-[#1d3346]/10 bg-white/70 p-4 md:grid-cols-[220px_1fr]">
          <label className="text-sm text-[#294258]/62">
            图片比例
            <select
              className="mt-2 w-full rounded-2xl bg-[#edf4f7] px-4 py-3 text-base font-semibold text-[#142536] outline-none"
              value={aspectRatio}
              onChange={(event) => setAspectRatio(event.target.value as StudioAspectRatio)}
            >
              {studioAspectRatioOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <div className="text-sm text-[#294258]/62">
            分辨率
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {(["1k", "2k", "4k"] as ResolutionTier[]).map((item) => (
                <button key={item} className={`rounded-full px-4 py-2 ${resolution === item ? "bg-[#142536] text-white" : "bg-[#edf4f7] text-[#20384d]"}`} onClick={() => setResolution(item)} type="button">
                  {item.toUpperCase()} · {sizeFromStudioPreset(aspectRatio, item)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button disabled={busy} className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#142536] px-7 py-3 text-white shadow-xl shadow-[#142536]/18 disabled:opacity-50" onClick={submit} type="button">
            {busy ? <Layers3 size={18} /> : <Sparkles size={18} />}
            {busy ? "生成中" : "开始生成"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {result.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-[30px] bg-[#edf4f7] shadow-sm">
              <img src={url} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.02]" alt="生成结果" />
            </a>
          ))}
          {!result.length ? (
            <div className="grid aspect-square place-items-center rounded-[30px] border border-[#1d3346]/10 bg-[#f4f8fa] text-center text-[#294258]/45">
              <div>
                <WandSparkles className="mx-auto mb-3" />
                生成结果会显示在这里
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="space-y-4 rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-5 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#142536]">灵感模板</h2>
        {promptTemplates.map((item) => (
          <button key={item} className="w-full rounded-2xl border border-[#1d3346]/10 bg-white/78 p-3 text-left text-sm leading-6 text-[#294258]/72 hover:bg-[#edf4f7]" onClick={() => setPrompt(item)} type="button">
            {item}
          </button>
        ))}
      </aside>
    </div>
  );
}
