import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { createImageTask, listImageTasks } from "@/lib/image-tasks/client";
import {
  COMMERCIAL_STUDIO_CONVERSATION_ID,
  didReachTerminalStatus,
  isActiveImageTask,
  selectStudioTask,
  taskErrorMessage,
  taskImageUrls,
} from "@/lib/image-tasks/state";
import type { ImageTask } from "@/lib/image-tasks/types";
import { loadCurrentUser } from "@/lib/storage/local-session";

import { GenerationContext, type GenerationContextValue } from "./generation-context";

function clientID(prefix: string) {
  const suffix = crypto.randomUUID().replaceAll("-", "");
  return `${prefix}_${suffix}`;
}

export function GenerationProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [task, setTask] = useState<ImageTask>();
  const [starting, setStarting] = useState(false);
  const [startedAt, setStartedAt] = useState<number>();
  const [requestError, setRequestError] = useState<string>();
  const [galleryRevision, setGalleryRevision] = useState(0);
  const userScopeRef = useRef(0);
  const statusesRef = useRef(new Map<string, ImageTask["status"]>());

  const applyTaskList = useCallback((items: ImageTask[], scope: number) => {
    if (scope !== userScopeRef.current) return undefined;
    let completed = false;
    let reachedTerminal = false;
    for (const item of items) {
      const previous = statusesRef.current.get(item.id);
      if (previous && previous !== "succeeded" && item.status === "succeeded") completed = true;
      if (didReachTerminalStatus(previous, item.status)) reachedTerminal = true;
      statusesRef.current.set(item.id, item.status);
    }
    if (completed) setGalleryRevision((value) => value + 1);
    if (reachedTerminal) void loadCurrentUser().catch(() => undefined);
    const selected = selectStudioTask(items);
    setTask(selected);
    if (selected) {
      setStartedAt(Date.parse(selected.startedAt || selected.createdAt));
      setRequestError(undefined);
    }
    return selected;
  }, []);

  const refreshTasks = useCallback(async () => {
    if (!userId) return undefined;
    const scope = userScopeRef.current;
    const payload = await listImageTasks();
    return applyTaskList(payload.items, scope);
  }, [applyTaskList, userId]);

  useEffect(() => {
    userScopeRef.current += 1;
    statusesRef.current.clear();
    setTask(undefined);
    setStartedAt(undefined);
    setRequestError(undefined);
    setStarting(false);
    if (!userId) return;
    const scope = userScopeRef.current;
    listImageTasks()
      .then((payload) => applyTaskList(payload.items, scope))
      .catch((error) => {
        if (scope === userScopeRef.current) {
          setRequestError(error instanceof Error ? error.message : "任务记录加载失败");
        }
      });
  }, [applyTaskList, userId]);

  useEffect(() => {
    if (!userId || !isActiveImageTask(task)) return;
    const timer = window.setInterval(() => {
      void refreshTasks().catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [refreshTasks, task, userId]);

  const startGeneration = useCallback<GenerationContextValue["startGeneration"]>(async (input) => {
    if (!userId) throw new Error("请先登录后再创作");
    const requestedAt = Date.now();
    setStarting(true);
    setStartedAt(requestedAt);
    setTask(undefined);
    setRequestError(undefined);
    try {
      const payload = await createImageTask({
        taskId: clientID("web"),
        conversationId: COMMERCIAL_STUDIO_CONVERSATION_ID,
        turnId: clientID("turn"),
        mode: input.mode,
        prompt: input.prompt,
        model: input.model,
        count: input.count,
        size: input.size,
        quality: input.quality || "",
        sourceImages: input.sourceImages,
      });
      statusesRef.current.set(payload.task.id, payload.task.status);
      setTask(payload.task);
      setStartedAt(Date.parse(payload.task.startedAt || payload.task.createdAt) || requestedAt);
      void loadCurrentUser().catch(() => undefined);
      return payload.task;
    } catch (error) {
      const message = error instanceof Error ? error.message : "创建图片任务失败";
      setRequestError(message);
      throw error;
    } finally {
      setStarting(false);
    }
  }, [userId]);

  const value = useMemo<GenerationContextValue>(() => ({
    task,
    busy: starting || isActiveImageTask(task),
    startedAt,
    resultUrls: taskImageUrls(task),
    error: requestError || taskErrorMessage(task),
    galleryRevision,
    startGeneration,
    refreshTasks,
  }), [galleryRevision, refreshTasks, requestError, startGeneration, startedAt, starting, task]);

  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>;
}
