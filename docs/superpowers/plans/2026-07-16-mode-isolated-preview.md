# 分类隔离预览与任务状态 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让每个创作分类拥有独立预览、任务状态、提示词、素材和模型选择，同时保证切换分类不会取消后台任务。

**Architecture:** 将生成 Provider 从单任务状态改为按 `StudioMode` 索引的状态表。任务列表轮询按 `task.mode` 分发到对应分类；`StudioPage` 只把当前分类状态传给预览。模型列表放入 `mode-config.ts`，`ModeSettings` 在分类参数顶部渲染当前分类模型。

**Tech Stack:** React 19、TypeScript、React Context、Vitest、ReactDOM server rendering、Vite。

---

## 文件结构

- Modify: `/home/div/1_Project_dir/AI/image/xinghai-image-studio-ui/src/components/commercial/generation-context.ts` — 暴露按分类读取状态的类型和启动接口。
- Modify: `/home/div/1_Project_dir/AI/image/xinghai-image-studio-ui/src/components/commercial/generation-provider.tsx` — 保存按分类任务状态，轮询后按 `mode` 回填。
- Modify: `/home/div/1_Project_dir/AI/image/xinghai-image-studio-ui/src/app/studio/mode-config.ts` — 新增分类模型配置和模型选项类型。
- Modify: `/home/div/1_Project_dir/AI/image/xinghai-studio-console/src/app/studio/mode-settings.tsx` — 在分类参数最上方渲染模型选择器，并按分类读取模型列表。
- Modify: `/home/div/1_Project_dir/AI/image/xinghai-image-studio-ui/src/app/studio/page.tsx` — 使用当前分类状态，按分类读取和提交模型、任务、结果。
- Modify: `/home/div/1_Project_dir/AI/image/xinghai-image-studio-ui/src/app/studio/mode-settings.test.tsx` — 验证模型选择器在分类参数顶部且各分类当前只有 GPT Image 2.0。
- Create: `/home/div/1_Project_dir/AI/image/xinghai-image-studio-ui/src/components/commercial/generation-state.test.ts` — 验证按 mode 分发任务状态的纯函数行为。
- Modify: `/home/div/1_Project_dir/AI/image/xinghai-image-studio-ui/src/components/commercial/generation-provider.test.tsx` — 验证 Provider 任务隔离和切换不中断；若当前仓库没有该测试文件，则在此路径创建。
- Modify: `/home/div/1_Project_dir/AI/image/xinghai-image-studio-ui/README.md` — 记录分类预览隔离和后台任务不中断行为。
- Modify: `/home/div/1_Project_dir/AI/image/xinghai-image-studio-ui/docs/API_INTEGRATION.md` — 记录前端按任务 `mode` 管理 UI 状态，不新增后端接口。

### Task 1: 定义按分类的生成状态和模型配置

**Files:**
- Modify: `src/components/commercial/generation-context.ts`
- Create: `src/components/commercial/generation-state.ts`
- Modify: `src/app/studio/mode-config.ts`
- Test: `src/components/commercial/generation-state.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
it("keeps generation state isolated by studio mode", () => {
  const states = createInitialGenerationStates();
  const textTask = { id: "text-task", mode: "text", status: "succeeded" } as ImageTask;
  const next = updateGenerationState(states, textTask);

  expect(next.text.task?.id).toBe("text-task");
  expect(next.image.task).toBeUndefined();
  expect(next.text.resultUrls).toEqual(taskImageUrls(textTask));
  expect(next.image.resultUrls).toEqual([]);
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- src/components/commercial/generation-state.test.ts
```

Expected: FAIL because the per-mode state helpers do not exist.

- [ ] **Step 3: 写最小实现**

定义 `StudioGenerationState`、`StudioGenerationStates`、`createInitialGenerationStates()` 和 `updateGenerationState(states, task)`。状态表覆盖 `StudioMode` 的全部分类；未知 mode 不写入已知分类。`generation-context.ts` 将 `states`、`getGenerationState(mode)` 和 `startGeneration` 的返回类型暴露给 Provider 与页面。

在 `mode-config.ts` 增加：

```ts
export type StudioModelOption = { value: string; label: string };
export const studioModeModels: Record<StudioMode, StudioModelOption[]> = {
  text: [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
  image: [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
  edit: [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
  "remove-bg": [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
  upscale: [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
  batch: [{ value: "gpt-image-2", label: "GPT Image 2.0" }],
};
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npm test -- src/components/commercial/generation-state.test.ts
```

Expected: PASS.

- [ ] **Step 5: 提交**

```bash
git add src/components/commercial/generation-context.ts src/components/commercial/generation-state.ts src/components/commercial/generation-state.test.ts src/app/studio/mode-config.ts
git commit -m "feat: define isolated studio generation state"
```

### Task 2: 将 Provider 改成按分类轮询和回填

**Files:**
- Modify: `src/components/commercial/generation-provider.tsx`
- Modify: `src/components/commercial/generation-context.ts`
- Test: `src/components/commercial/generation-provider.test.tsx`

- [ ] **Step 1: 写失败测试**

覆盖两个行为：

```tsx
it("does not replace image mode state when text task completes", async () => {
  // 提供 text succeeded 与 image queued 两条任务
  // 刷新后断言 text 只有 text 结果，image 保持自己的 queued 状态且无 text 结果
});

it("keeps the active task alive when the selected mode changes", async () => {
  // 启动 text 任务后切换页面当前 mode 到 image
  // 断言 text 任务仍在轮询，未调用取消接口
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- src/components/commercial/generation-provider.test.tsx
```

Expected: FAIL because Provider 当前只有单一 `task` 状态。

- [ ] **Step 3: 写最小实现**

Provider 内部改为：

```ts
const [generationStates, setGenerationStates] = useState<StudioGenerationStates>(createInitialGenerationStates);
```

`applyTaskList` 遍历所有返回任务，按 `item.mode` 更新对应状态，不再调用单任务选择器覆盖全局状态。轮询条件改为所有分类状态中存在 active task；轮询启动和清理不依赖当前 UI 分类。`startGeneration(input)` 设置 `starting: true` 到 `input.mode`，创建成功后把任务写回该 mode；失败只写回该 mode 的 `error`。Provider 不新增取消逻辑，不因分类切换清理状态。

保留 `galleryRevision`、用户切换 scope 和现有任务终态处理。

- [ ] **Step 4: 运行测试确认通过**

```bash
npm test -- src/components/commercial/generation-provider.test.tsx src/components/commercial/generation-state.test.ts
```

Expected: PASS.

- [ ] **Step 5: 提交**

```bash
git add src/components/commercial/generation-provider.tsx src/components/commercial/generation-context.ts src/components/commercial/generation-provider.test.tsx
git commit -m "feat: keep studio generation tasks isolated by mode"
```

### Task 3: 接入 StudioPage 当前分类状态

**Files:**
- Modify: `src/app/studio/page.tsx`
- Test: `src/app/studio/page.test.ts`

- [ ] **Step 1: 写失败测试**

新增页面契约断言：切换分类使用当前 mode 的 `busy`、结果、错误和开始时间；图生图初始预览不读取文生图结果；提交请求使用当前分类的模型值。

```ts
it("passes only the selected mode generation state to the preview", () => {
  expect(source).toContain("generationStates[mode]");
  expect(source).not.toContain("resultUrls={resultUrls}");
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- src/app/studio/page.test.ts
```

Expected: FAIL because `StudioPage` 当前仍读取 Provider 的单一状态。

- [ ] **Step 3: 写最小实现**

将 `useGeneration()` 解构改为读取 `generationStates`，然后：

```ts
const currentGeneration = generationStates[mode];
```

`StudioPreview` 使用 `currentGeneration.busy`、`currentGeneration.resultUrls`、`currentGeneration.error` 和 `currentGeneration.startedAt`。`submitGeneration` 继续传当前分类的 `settings.model`，任务 mode 使用 `targetMode`。切换 mode 不清空 assets、prompts 或 Provider 状态；当前页面只显示当前 mode 的状态。

- [ ] **Step 4: 运行测试确认通过**

```bash
npm test -- src/app/studio/page.test.ts src/app/studio/studio-preview.test.tsx
```

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/app/studio/page.tsx src/app/studio/page.test.ts
 git commit -m "feat: render selected studio mode preview state"
```

### Task 4: 将每个分类模型选择器移到参数区顶部

**Files:**
- Modify: `src/app/studio/mode-settings.tsx`
- Modify: `src/app/studio/mode-settings.test.tsx`
- Modify: `src/app/studio/mode-config.ts`

- [ ] **Step 1: 写失败测试**

```tsx
it("renders the selected mode model selector before mode-specific controls", () => {
  const html = renderMode("image");
  expect(html.indexOf("模型")).toBeLessThan(html.indexOf("上传参考图"));
  expect(html).toContain("GPT Image 2.0");
});

it("uses only the models configured for the selected mode", () => {
  const html = renderMode("remove-bg");
  expect(html).toContain("GPT Image 2.0");
  expect(html.match(/GPT Image 2.0/g)?.length).toBe(1);
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- src/app/studio/mode-settings.test.tsx
```

Expected: FAIL because model is currently rendered only when the mode definition contains `model`, and not consistently at the top.

- [ ] **Step 3: 写最小实现**

`ModeSettings` 在所有分类控件之前渲染模型选择器，使用 `studioModeModels[mode]` 生成 options。保留当前选择器样式和 `onChange("model", ...)`。如果未来某分类模型列表不含当前值，显示该分类列表第一项并通过当前分类变更回调写回；当前所有列表只有 `gpt-image-2`，不增加后端请求。

- [ ] **Step 4: 运行测试确认通过**

```bash
npm test -- src/app/studio/mode-settings.test.tsx src/app/studio/mode-config.test.ts
```

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/app/studio/mode-settings.tsx src/app/studio/mode-settings.test.tsx src/app/studio/mode-config.ts
git commit -m "feat: show per-mode model selectors at top"
```

### Task 5: 文档、全量验证和部署前检查

**Files:**
- Modify: `README.md`
- Modify: `docs/API_INTEGRATION.md`

- [ ] **Step 1: 更新文档**

记录分类预览隔离、切换不取消任务、任务按 mode 回填、模型列表按分类配置且当前只有 GPT Image 2.0。明确没有新增 API 字段和后端接口。

- [ ] **Step 2: 运行完整前端质量门禁**

```bash
npm run lint
npm run test
npm run build
git diff --check
```

Expected: lint、全部测试、build 和 diff check 均退出 0；允许已有 Vite chunk-size warning，但不能有失败。

- [ ] **Step 3: 检查代码和文档一致性**

```bash
rg -n "isolat|隔离|mode|GPT Image 2.0|任务" README.md docs/API_INTEGRATION.md src/components/commercial src/app/studio
```

确认文档与实际实现一致，未产生后端仓库改动。

- [ ] **Step 4: 构建并验证前端容器**

```bash
docker compose up -d --build
curl -fsS http://127.0.0.1:18100/healthz
curl -fsS -o /tmp/xinghai-ui.html -w '%{http_code}\n' http://127.0.0.1:18100/studio
```

Expected: health 返回 `ok: true`，工作台返回 HTTP 200。

- [ ] **Step 5: 检查 Git 边界并提交文档**

```bash
git status --short
git diff --check
git add README.md docs/API_INTEGRATION.md
git commit -m "docs: document isolated studio mode previews"
```

保留既有未提交的 `AGENTS.md`、`docker-compose.yml`、备份文件和 `artifacts/`，不加入提交。

- [ ] **Step 6: 推送并回报证据**

```bash
git push origin main
git rev-parse HEAD
git status --short
```

回报前端目录、分支、提交、push 状态、compose 文件、18100 入口、验证 URL、测试结果、上游兼容性和未影响后端的结论。
