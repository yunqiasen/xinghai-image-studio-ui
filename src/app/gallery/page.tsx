import { LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useGeneration } from "@/components/commercial/generation-context";
import { useLanguage } from "@/components/language-provider";
import { clearGallery, fetchGallery, type GalleryItem } from "@/lib/storage/local-session";
import { useSessionUser } from "@/lib/storage/session-hooks";

import { shouldPollGallery, shouldResetGalleryForUser } from "./gallery-refresh";

export function GalleryPage() {
  const { locale, t } = useLanguage();
  const { user, loading: sessionLoading } = useSessionUser();
  const { galleryRevision, task } = useGeneration();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(0);
  const previousUserRef = useRef<string | null>(null);
  const revisionRef = useRef(galleryRevision);

  const loadItems = useCallback(async (showLoading = false) => {
    if (!user) return;
    const request = ++requestRef.current;
    if (showLoading) setLoading(true);
    try {
      const next = await fetchGallery();
      if (request === requestRef.current) setItems(next);
    } catch (error) {
      if (request === requestRef.current) toast.error(error instanceof Error ? error.message : t("gallery.loadFailed"));
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, [t, user]);

  useEffect(() => {
    const nextUserId = user?.id || null;
    if (shouldResetGalleryForUser(previousUserRef.current, nextUserId)) {
      requestRef.current += 1;
      setItems([]);
      setLoading(Boolean(nextUserId));
      previousUserRef.current = nextUserId;
    }
    if (nextUserId) void loadItems(true);
    else if (!sessionLoading) setLoading(false);
  }, [loadItems, sessionLoading, user?.id]);

  useEffect(() => {
    if (galleryRevision === revisionRef.current) return;
    revisionRef.current = galleryRevision;
    if (user) void loadItems();
  }, [galleryRevision, loadItems, user]);

  useEffect(() => {
    if (!shouldPollGallery(user?.id, task?.status)) return;
    const timer = window.setInterval(() => void loadItems(), 2000);
    return () => window.clearInterval(timer);
  }, [loadItems, task?.status, user?.id]);

  async function clear() {
    try {
      requestRef.current += 1;
      setItems(await clearGallery());
      toast.success(t("gallery.cleared"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("gallery.clearFailed"));
    }
  }

  return (
    <div className="space-y-5">
      <header className="rounded-[32px] border border-[#1d3346]/10 bg-white/74 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-[#2d6f82]">{t("gallery.kicker")}</p>
            <h1 className="mt-2 text-5xl font-semibold tracking-[-0.055em] text-[#142536]">{t("gallery.title")}</h1>
            <p className="mt-2 text-[#294258]/62">{t("gallery.description")}</p>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-full border border-[#1d3346]/10 bg-white/80 px-5 py-2 text-[#20384d] disabled:opacity-55" disabled={loading} onClick={() => void loadItems(true)} type="button">
                <RefreshCw className={loading ? "animate-spin" : ""} size={16} /> {t("gallery.refresh")}
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-[#1d3346]/10 bg-white/80 px-5 py-2 text-[#20384d]" onClick={clear} type="button">
                <Trash2 size={16} /> {t("gallery.clear")}
              </button>
            </div>
          ) : null}
        </div>
        {user && shouldPollGallery(user.id, task?.status) ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
            <LoaderCircle className="animate-spin" size={13} /> {t("gallery.generating")}
          </p>
        ) : null}
      </header>
      {sessionLoading || loading ? (
        <div className="grid min-h-80 place-items-center rounded-[32px] border border-dashed border-[#1d3346]/14 bg-white/58 text-[#294258]/55">
          <div className="text-center"><LoaderCircle className="mx-auto animate-spin" size={26} /><p className="mt-3">{t("gallery.syncing")}</p></div>
        </div>
      ) : !user ? (
        <div className="grid min-h-80 place-items-center rounded-[32px] border border-dashed border-[#1d3346]/14 bg-white/58 text-center text-[#294258]/55">
          <div>
            <p>{t("gallery.loginHelp")}</p>
            <Link to="/login" className="mt-4 inline-flex rounded-full bg-[#142536] px-5 py-2.5 text-white">{t("studio.goLogin")}</Link>
          </div>
        </div>
      ) : items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-[30px] border border-[#1d3346]/10 bg-white/74 shadow-sm">
              <a href={item.url} target="_blank" rel="noreferrer"><img src={item.url} className="aspect-square w-full object-cover" alt={item.prompt} /></a>
              <figcaption className="space-y-2 p-4 text-sm text-[#294258]/64">
                <p className="line-clamp-3">{item.prompt}</p>
                <p className="text-xs text-[#294258]/42">{new Date(item.createdAt).toLocaleString(locale)} · {item.mode}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="grid min-h-80 place-items-center rounded-[32px] border border-dashed border-[#1d3346]/14 bg-white/58 text-[#294258]/50">{t("gallery.empty")}</div>
      )}
    </div>
  );
}
