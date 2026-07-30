import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { createClientId } from "@/lib/client-id";
import { cancelImageTask, createImageTask, listImageTasks, subscribeImageTaskStream } from "@/lib/image-tasks/client";
import {
  COMMERCIAL_STUDIO_CONVERSATION_ID,
  didReachTerminalStatus,
  isActiveImageTask,
  selectStudioTask,
} from "@/lib/image-tasks/state";
import type { ImageTask } from "@/lib/image-tasks/types";
import { loadCurrentUser } from "@/lib/storage/local-session";

import { GenerationContext, type GenerationContextValue } from "./generation-context";
import { createInitialGenerationStates, isAnyGenerationActive, updateGenerationState, type StudioGenerationStates } from "./generation-state";

export function GenerationProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [generationStates, setGenerationStates] = useState<StudioGenerationStates>(createInitialGenerationStates);
  const [galleryRevision, setGalleryRevision] = useState(0);
  const userScopeRef = useRef(0);
  const statusesRef = useRef(new Map<string, ImageTask["status"]>());

  const applyTaskList = useCallback((items: ImageTask[], scope: number) => {
    if (scope !== userScopeRef.current) return undefined;
    let completed = false;
    let reachedTerminal = false;
    setGenerationStates((previous) => {
      let next = previous;
      const latestByMode = new Map<string, ImageTask>();
      for (const item of items) {
        const oldStatus = statusesRef.current.get(item.id);
        if (oldStatus && oldStatus !== "succeeded" && item.status === "succeeded") completed = true;
        if (didReachTerminalStatus(oldStatus, item.status)) reachedTerminal = true;
        statusesRef.current.set(item.id, item.status);
        const current = latestByMode.get(item.mode);
        if (!current || Date.parse(item.createdAt) > Date.parse(current.createdAt)) latestByMode.set(item.mode, item);
      }
      for (const item of latestByMode.values()) next = updateGenerationState(next, item);
      return next;
    });
    if (completed) setGalleryRevision((value) => value + 1);
    if (reachedTerminal) void loadCurrentUser().catch(() => undefined);
    return selectStudioTask(items);
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
    setGenerationStates(createInitialGenerationStates());
    if (!userId) return;
    const scope = userScopeRef.current;
    listImageTasks()
      .then((payload) => applyTaskList(payload.items, scope))
      .catch((error) => {
        if (scope === userScopeRef.current) {
          const message = error instanceof Error ? error.message : "任务记录加载失败";
          setGenerationStates((previous) => ({ ...previous, text: { ...previous.text, error: message } }));
        }
      });
  }, [applyTaskList, userId]);

  useEffect(() => {
    if (!userId) return;
    const scope = userScopeRef.current;
    return subscribeImageTaskStream((event) => {
      if (event.type === "init") applyTaskList(event.items, scope);
      else applyTaskList([event.task], scope);
    });
  }, [applyTaskList, userId]);

  useEffect(() => {
    if (!userId || !isAnyGenerationActive(generationStates)) return;
    const timer = window.setInterval(() => {
      void refreshTasks().catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [generationStates, refreshTasks, userId]);

  const startGeneration = useCallback<GenerationContextValue["startGeneration"]>(async (input) => {
    if (!userId) throw new Error("请先登录后再创作");
    const requestedAt = Date.now();
    const mode = input.mode as keyof StudioGenerationStates;
    setGenerationStates((previous) => ({ ...previous, [mode]: { ...previous[mode], starting: true, startedAt: requestedAt, error: undefined } }));
    try {
      const payload = await createImageTask({
        taskId: createClientId("web"),
        conversationId: COMMERCIAL_STUDIO_CONVERSATION_ID,
        turnId: createClientId("turn"),
        mode: input.mode,
        operation: input.operation,
        options: input.options,
        prompt: input.prompt,
        model: input.model,
        count: input.count,
        size: input.size,
        quality: input.quality || "",
        sourceImages: input.sourceImages,
        style: input.style,
        background: input.background,
        resolution: input.resolution,
        parentTaskId: input.parentTaskId,
        parentImageIndex: input.parentImageIndex,
      });
      statusesRef.current.set(payload.task.id, payload.task.status);
      setGenerationStates((previous) => updateGenerationState(previous, payload.task));
      void loadCurrentUser().catch(() => undefined);
      return payload.task;
    } catch (error) {
      const message = error instanceof Error ? error.message : "创建图片任务失败";
      setGenerationStates((previous) => ({ ...previous, [mode]: { ...previous[mode], starting: false, error: message } }));
      throw error;
    }
  }, [userId]);

  const cancelGeneration = useCallback<GenerationContextValue["cancelGeneration"]>(async (mode) => {
    if (!userId) return undefined;
    const current = generationStates[mode].task;
    if (!current || !isActiveImageTask(current)) return current;
    const payload = await cancelImageTask(current.id);
    const scope = userScopeRef.current;
    applyTaskList([payload.task], scope);
    void loadCurrentUser().catch(() => undefined);
    return payload.task;
  }, [applyTaskList, generationStates, userId]);

  const value = useMemo<GenerationContextValue>(() => {
    const textState = generationStates.text;
    return {
      states: generationStates,
      getGenerationState: (mode) => generationStates[mode],
      task: textState.task,
      busy: textState.starting || isActiveImageTask(textState.task),
      startedAt: textState.startedAt,
      resultUrls: textState.resultUrls,
      error: textState.error,
      galleryRevision,
      startGeneration,
      cancelGeneration,
      refreshTasks,
    };
  }, [cancelGeneration, generationStates, galleryRevision, refreshTasks, startGeneration]);

  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>;
}
