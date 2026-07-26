import { Images, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useGeneration } from "@/components/commercial/generation-context";
import { useLanguage } from "@/components/language-provider";
import { clearGallery, fetchGallery, type GalleryItem } from "@/lib/storage/local-session";
import { useSessionUser } from "@/lib/storage/session-hooks";

import { buildGalleryStudioRouteState, partitionGalleryItems } from "./gallery-actions";
import { GalleryCard, GalleryLightbox, GalleryUnavailableHistory } from "./gallery-card";
import { shouldPollGallery, shouldResetGalleryForUser } from "./gallery-refresh";

function downloadExtension(contentType: string) {
  if (contentType.includes("jpeg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return "png";
}

export function GalleryPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSessionUser();
  const { galleryRevision, busy } = useGeneration();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ item: GalleryItem; index: number } | null>(null);
  const [unavailableIds, setUnavailableIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(0);
  const previousUserRef = useRef<string | null>(null);
  const revisionRef = useRef(galleryRevision);

  const loadItems = useCallback(async (showLoading = false) => {
    if (!user) return;
    const request = ++requestRef.current;
    if (showLoading) {
      setLoading(true);
      setUnavailableIds(new Set());
    }
    try {
      const next = await fetchGallery();
      if (request === requestRef.current) {
        setItems(next);
        const nextIDs = new Set(next.map((item) => item.id));
        setUnavailableIds((current) => {
          const filtered = new Set([...current].filter((id) => nextIDs.has(id)));
          return filtered.size === current.size ? current : filtered;
        });
      }
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
      setSelectedItem(null);
      setUnavailableIds(new Set());
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
    if (!shouldPollGallery(user?.id, busy ? "running" : undefined)) return;
    const timer = window.setInterval(() => void loadItems(), 2000);
    return () => window.clearInterval(timer);
  }, [busy, loadItems, user?.id]);

  async function clear() {
    try {
      requestRef.current += 1;
      setSelectedItem(null);
      setUnavailableIds(new Set());
      setItems(await clearGallery());
      toast.success(t("gallery.cleared"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("gallery.clearFailed"));
    }
  }

  function openStudio(item: GalleryItem, index: number, action: "variation" | "local-edit") {
    navigate("/studio", { state: buildGalleryStudioRouteState(item, action, index + 1) });
  }

  async function download(item: GalleryItem) {
    try {
      const response = await fetch(item.url, { credentials: "include" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error(t("gallery.unavailable"));
      const objectURL = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectURL;
      anchor.download = `xinghai-${item.id}.${downloadExtension(blob.type)}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
    } catch {
      toast.error(t("gallery.downloadFailed"));
    }
  }

  function markAvailability(item: GalleryItem, available: boolean) {
    setUnavailableIds((current) => {
      const isUnavailable = current.has(item.id);
      if ((available && !isUnavailable) || (!available && isUnavailable)) return current;
      const next = new Set(current);
      if (available) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  const galleryIsPolling = Boolean(user?.id && busy);
  const { visible: visibleItems, unavailable: unavailableItems } = partitionGalleryItems(items, unavailableIds);

  return (
    <div className="gallery-page mx-auto w-full max-w-[1360px] space-y-4 pb-8">
      <header className="gallery-work-hero relative overflow-hidden rounded-[26px] border px-5 py-5 sm:px-6">
        <div className="gallery-hero-line pointer-events-none absolute -right-8 top-1/2 h-px w-64 -rotate-12" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em]"><Images size={14} /><span>{t("gallery.kicker")}</span></div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{t("gallery.title")}</h1>
            <p className="gallery-work-lead mt-2 max-w-xl text-sm leading-6">{t("gallery.description")}</p>
          </div>
          {user ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="gallery-count-card mr-1 rounded-2xl border px-4 py-2.5 text-right">
                <b className="block text-lg leading-none tabular-nums">{visibleItems.length}</b>
                <span className="mt-1 block text-[9px] font-bold tracking-[0.12em]">{t("gallery.latestOnly")}</span>
              </div>
              <button className="gallery-hero-action inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-bold disabled:opacity-55" disabled={loading} onClick={() => void loadItems(true)} type="button">
                <RefreshCw className={loading ? "animate-spin" : ""} size={14} /> {t("gallery.refresh")}
              </button>
              <button className="gallery-hero-action inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-bold" onClick={clear} type="button">
                <Trash2 size={14} /> {t("gallery.clear")}
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {user ? (
        <div className="gallery-work-toolbar flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs">
          <span className="font-semibold">{t("gallery.worksCount", { count: visibleItems.length })}</span>
          {galleryIsPolling ? (
            <span className="inline-flex items-center gap-2 font-semibold"><LoaderCircle className="animate-spin" size={13} /> {t("gallery.generating")}</span>
          ) : <span>{t("gallery.limitHelp")}</span>}
        </div>
      ) : null}

      {sessionLoading || loading ? (
        <div className="gallery-state-panel grid min-h-72 place-items-center rounded-[26px] border border-dashed">
          <div className="text-center"><LoaderCircle className="mx-auto animate-spin" size={25} /><p className="mt-3 text-sm">{t("gallery.syncing")}</p></div>
        </div>
      ) : !user ? (
        <div className="gallery-state-panel grid min-h-72 place-items-center rounded-[26px] border border-dashed text-center">
          <div>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"><Images size={25} /></span>
            <p className="mt-4 text-sm">{t("gallery.loginHelp")}</p>
            <Link to="/login" className="gallery-empty-action mt-4 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold">{t("studio.goLogin")}</Link>
          </div>
        </div>
      ) : items.length ? (
        <>
          {visibleItems.length ? (
            <div className="gallery-work-grid">
              {visibleItems.map((item, index) => (
                <GalleryCard
                  key={item.id}
                  index={index}
                  item={item}
                  onAvailabilityChange={markAvailability}
                  onDownload={(target) => void download(target)}
                  onLocalEdit={(target, position) => openStudio(target, position, "local-edit")}
                  onOpen={(target) => setSelectedItem({ item: target, index })}
                  onVariation={(target, position) => openStudio(target, position, "variation")}
                />
              ))}
            </div>
          ) : (
            <div className="gallery-state-panel grid min-h-40 place-items-center rounded-[22px] border border-dashed text-center text-sm">
              {t("gallery.noAvailable")}
            </div>
          )}
          <GalleryUnavailableHistory items={unavailableItems} />
        </>
      ) : (
        <div className="gallery-state-panel grid min-h-72 place-items-center rounded-[26px] border border-dashed text-center">
          <div>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"><Images size={25} /></span>
            <p className="mt-4 text-sm">{t("gallery.empty")}</p>
            <Link to="/studio" className="gallery-empty-action mt-4 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold">{t("landing.start")}</Link>
          </div>
        </div>
      )}

      {selectedItem ? (
        <GalleryLightbox
          index={selectedItem.index}
          item={selectedItem.item}
          onClose={() => setSelectedItem(null)}
          onDownload={(target) => void download(target)}
          onLocalEdit={(target, position) => openStudio(target, position, "local-edit")}
          onOpen={() => undefined}
          onVariation={(target, position) => openStudio(target, position, "variation")}
          open
        />
      ) : null}
    </div>
  );
}
