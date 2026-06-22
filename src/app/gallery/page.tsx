import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { clearGallery, fetchGallery, type GalleryItem } from "@/lib/storage/local-session";
import { useSessionUser } from "@/lib/storage/session-hooks";

export function GalleryPage() {
  const { user } = useSessionUser();
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    fetchGallery().then(setItems).catch((error) => toast.error(error instanceof Error ? error.message : "作品加载失败"));
  }, [user]);

  async function clear() {
    try {
      setItems(await clearGallery());
      toast.success("作品已清空");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "清空失败");
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-[#2d6f82]">作品管理</p>
          <h1 className="mt-2 text-5xl font-semibold tracking-[-0.055em] text-[#142536]">我的作品</h1>
          <p className="mt-2 text-[#294258]/62">最近生成的图片会自动保存在这里，点击可查看原图。</p>
        </div>
        {user ? (
          <button className="inline-flex items-center gap-2 rounded-full border border-[#1d3346]/10 bg-white/80 px-5 py-2 text-[#20384d]" onClick={clear} type="button">
            <Trash2 size={16} /> 清空
          </button>
        ) : null}
      </header>
      {!user ? (
        <div className="grid min-h-80 place-items-center rounded-[32px] border border-dashed border-[#1d3346]/14 bg-white/58 text-center text-[#294258]/55">
          <div>
            <p>登录后可以查看和管理作品。</p>
            <Link to="/login" className="mt-4 inline-flex rounded-full bg-[#142536] px-5 py-2.5 text-white">去登录</Link>
          </div>
        </div>
      ) : items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-[30px] border border-[#1d3346]/10 bg-white/74 shadow-sm">
              <a href={item.url} target="_blank" rel="noreferrer"><img src={item.url} className="aspect-square w-full object-cover" alt={item.prompt} /></a>
              <figcaption className="space-y-2 p-4 text-sm text-[#294258]/64">
                <p className="line-clamp-3">{item.prompt}</p>
                <p className="text-xs text-[#294258]/42">{new Date(item.createdAt).toLocaleString()} · {item.mode}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="grid min-h-80 place-items-center rounded-[32px] border border-dashed border-[#1d3346]/14 bg-white/58 text-[#294258]/50">暂无作品，先去创作页生成图片。</div>
      )}
    </div>
  );
}
