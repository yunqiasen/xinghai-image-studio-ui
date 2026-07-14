# Studio Centered Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 将用户确认的居中版图像创作工作台落到生产前端，并通过后端同步生图 API 呈现加载、单图和多图结果。

**Architecture:** `StudioPage` 保留表单和提交状态，新的 `StudioPreview` 专门渲染右侧状态。纯函数模块负责比例、网格和计时格式，API 客户端继续使用 `/api/image/generate` 并增强后端错误解析。

**Tech Stack:** React 19、TypeScript、Tailwind CSS、Vitest、React DOM Server

---

### Task 1: 锁定后端响应和预览规则

**Files:**
- Create: `src/lib/image2api/normalize.test.ts`
- Create: `src/app/studio/preview-layout.test.ts`
- Create: `src/app/studio/preview-layout.ts`
- Modify: `src/lib/image2api/normalize.ts`

- [x] 写失败测试：后端仅返回 `message` 时必须成为中文错误；预览规则需输出 1/2/3/4 图网格、合法宽高比和等待时间。
- [x] 运行 `npm run test -- src/lib/image2api/normalize.test.ts src/app/studio/preview-layout.test.ts`，确认因缺少行为失败。
- [x] 实现错误优先级与纯预览规则。
- [x] 重跑定向测试并确认通过。

### Task 2: 实现右侧状态组件

**Files:**
- Create: `src/app/studio/studio-preview.test.tsx`
- Create: `src/app/studio/studio-preview.tsx`

- [x] 写失败的服务端渲染测试，覆盖生成中、多图结果和失败文案。
- [x] 运行 `npm run test -- src/app/studio/studio-preview.test.tsx`，确认组件缺失导致失败。
- [x] 实现空闲、生成中、失败、单图、多图状态以及单图缩放控件。
- [x] 重跑定向测试并确认通过。

### Task 3: 重构创作页布局并接入状态

**Files:**
- Modify: `src/app/studio/page.test.ts`
- Modify: `src/app/studio/layout-constants.ts`
- Modify: `src/app/studio/page.tsx`
- Modify: `src/components/commercial/app-shell.tsx`

- [x] 先更新布局测试，要求 1240px 居中工作区、480px 左栏、固定底部操作区和独立滚动参数区。
- [x] 运行 `npm run test -- src/app/studio/page.test.ts`，确认旧布局不符合新断言。
- [x] 重构页面为固定标题、双列主体、固定提交栏，接入 `StudioPreview` 的 busy/result/error/count 参数。
- [x] 保持请求字段、上传和积分行为不变；提交前清空旧错误，失败时把错误传到右侧。
- [x] 重跑创作页及预览测试。

### Task 4: 全量验证和文档

**Files:**
- Modify: `docs/API_INTEGRATION.md`
- Modify: `README.md`

- [x] 运行 `npm run lint`、`npm run test`、`npm run build`。
- [x] 测试全部通过后更新文档，记录 `/studio` 的同步 API、加载反馈、多图布局和桌面尺寸策略。
- [x] 运行 `git diff --check` 并复查仓库差异不包含原工作区的 `AGENTS.md`、`docker-compose.yml` 与备份文件。
- [x] 提交分支，合并到 `main`，push、Docker 部署并验证 `/healthz`、首页和 `/studio`。
