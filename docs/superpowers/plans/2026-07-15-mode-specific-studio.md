# 分类化图像创作工作台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将创作工作台改为按创作类型切换独立设置，并支持右侧模板填充和结果图回流局部编辑。

**Architecture:** 新增纯配置模块描述七类模式的设置、模板和子选项；StudioPage 负责模式状态、源图状态和任务提交，ModeSettings 只渲染当前模式控件；StudioPreview 负责右侧模板卡片和结果图编辑入口。继续使用现有异步任务字段，不新增后端接口。

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vitest, Lucide React, 现有 ImageEditModal。

---

### Task 1: 模式配置与模板数据

**Files:**
- Create: `src/app/studio/mode-config.ts`
- Create: `src/app/studio/mode-config.test.ts`
- Modify: `src/lib/billing/pricing.ts`

- [ ] 写失败测试：断言七类模式名称、图片编辑五个子类型、超分四个选项、图生图包含分辨率/模板/提示词。
- [ ] 运行 `npm run test -- src/app/studio/mode-config.test.ts`，确认因模块不存在失败。
- [ ] 实现模式配置、分类模板和专属选项类型；将 `remove-bg` 显示名称改为“图片编辑”，将 `upscale` 显示名称改为“超分”。
- [ ] 保留现有 `StudioMode` 值，避免任务历史和后端 mode 字段变化。
- [ ] 重跑聚焦测试。

### Task 2: 动态设置面板

**Files:**
- Create: `src/app/studio/mode-settings.tsx`
- Modify: `src/app/studio/page.tsx`
- Test: `src/app/studio/page.test.ts`

- [ ] 写失败测试：不同 mode 的渲染结果包含不同标题；图生图包含比例、分辨率、模板、提示词；图片编辑不包含分辨率；超分包含 2×/4×、变体、老照片修复、人脸增强。
- [ ] 实现公共源图上传区、模式专属控件和统一提示词输入区。
- [ ] 图生图保留分辨率、风格模板和提示词。
- [ ] 图片编辑加入去背景、换背景、换衣服、换脸、加文字子类型，并隐藏分辨率设置。
- [ ] 超分加入 2×、4×、图片变体、老照片修复、人脸增强选项。
- [ ] 批量一致性加入角色参考图、数量、角色一致性和构图变化控件。
- [ ] 运行 studio 聚焦测试。

### Task 3: 右侧模板卡片

**Files:**
- Modify: `src/app/studio/studio-preview.tsx`
- Modify: `src/app/studio/page.tsx`
- Modify: `src/app/studio/page.test.ts`

- [ ] 写失败测试：预览区渲染当前模式模板，点击模板调用回调并返回模板文本。
- [ ] 从左侧参数区移除模板卡片。
- [ ] 在右侧信息栏加入“提示词模板”卡片，显示当前分类模板和“更多”。
- [ ] 点击模板只填充当前分类提示词，不提交任务。
- [ ] 确认移动端模板卡片位于预览内容后，按钮可触控。

### Task 4: 结果图回流局部编辑

**Files:**
- Modify: `src/app/studio/studio-preview.tsx`
- Modify: `src/app/studio/page.tsx`
- Modify: `src/app/studio/route-prompt.ts`
- Modify: `src/app/studio/route-prompt.test.ts`
- Modify: `src/components/image-edit-modal.tsx` only if callback needs a small compatibility adjustment

- [ ] 写失败测试：结果卡片渲染“局部编辑”入口；路由/状态解析能保留源图 URL 和模式。
- [ ] 单图和多图结果卡片加入 hover、focus-visible 和移动端可见的编辑按钮，避免嵌套链接。
- [ ] 点击按钮切换 `edit` mode，保存结果 URL 为源图，不转 Data URL、不重新选择文件。
- [ ] 打开现有 ImageEditModal，继续使用其遮罩画笔、撤销、重做和清空能力。
- [ ] 任务请求同时保留源图 URL 和遮罩 Data URL，当前不新增后端字段。
- [ ] 运行结果预览和路由测试。

### Task 5: 文本选择与响应式样式

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/commercial/app-shell.tsx` if shell-level selection rule is needed
- Modify: `src/app/studio/studio-preview.tsx`
- Test: `src/app/studio/studio-preview.test.tsx`

- [ ] 写失败测试：商业正文和提示词容器包含可选文本类，结果图片拖拽区域仍保持拖拽语义。
- [ ] 允许商业正文、提示词、模板说明和状态文字选择复制。
- [ ] 只给按钮、图片、预览拖拽画布和控制项设置 `user-select: none`。
- [ ] 为结果编辑按钮添加清晰焦点态、触控尺寸和 reduced-motion 兼容。
- [ ] 验证三种主题和 390px 宽度无横向溢出。

### Task 6: 验证、文档和部署

**Files:**
- Modify: `README.md`
- Modify: `docs/API_INTEGRATION.md`

- [ ] 运行 `npm run lint`、`npm run test`、`npm run build` 和 `git diff --check`。
- [ ] 更新 README 和 API 接入说明，记录分类设置、模板右移、结果图回流和 API 边界。
- [ ] 只提交前端仓库本次文件，保留既有未提交的 `AGENTS.md`、`docker-compose.yml` 和备份文件。
- [ ] 推送 `origin/main`，使用当前 compose 部署前端。
- [ ] 验证 `/healthz`、`/studio`、本机和内网入口。
