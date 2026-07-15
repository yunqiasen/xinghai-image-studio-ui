# 灵魂画廊与主题视觉 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 为星海图像增加 19 项本地精选素材的灵魂画廊，深化暗色主题，并保持彩色主题原有的克制极光配色。

**Architecture:** 静态目录数据与素材跟随前端构建发布；画廊页面负责搜索、分类和详情交互；React Router location state 只负责把提示词一次性传到现有创作页。所有用户作品、生图任务和积分仍由既有后端接口管理。

**Tech Stack:** React 19、TypeScript、React Router 7、Radix Dialog、Tailwind CSS 4、Vitest、Vite。

---

### Task 1: 建立精选目录契约

**Files:**
- Create: `src/app/soul-gallery/catalog.ts`
- Create: `src/app/soul-gallery/catalog.test.ts`
- Create: `public/soul-gallery-assets/imagic6/*`
- Create: `public/soul-gallery-assets/imya/*`

- [x] **Step 1: 写失败测试**：断言目录正好 19 项，指定标题全部存在，每项提示词非空且图片使用 `/soul-gallery/` 路径，并验证 `filterSoulGallery` 对标题、提示词与分类生效。
- [x] **Step 2: 验证 RED**：运行 `npx vitest run src/app/soul-gallery/catalog.test.ts`，预期因模块尚不存在而失败。
- [x] **Step 3: 实现目录与过滤器**：导出 `SoulGalleryItem`、`soulGalleryCatalog`、`soulGalleryCategories`、`filterSoulGallery(items, query, category)`；分类 `全部` 不过滤，搜索统一转小写并去首尾空格。
- [x] **Step 4: 复制本地素材**：将 8 项 imagic6 与 11 项 imya WebP 复制到对应 public 子目录；深海巨鲸 PNG 转换为 WebP，质量 86。
- [x] **Step 5: 验证 GREEN**：运行目录测试，预期全部通过。

### Task 2: 增加画廊页面与导航

**Files:**
- Create: `src/app/soul-gallery/page.tsx`
- Create: `src/app/soul-gallery/page.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/commercial/app-shell.tsx`
- Create: `src/components/commercial/navigation.ts`
- Create: `src/components/commercial/navigation.test.ts`
- Modify: `src/app/globals.css`

- [x] **Step 1: 写失败测试**：静态渲染页面并断言标题、19 项统计、搜索标签和精选卡片；导航测试断言 `作品 -> 灵魂画廊 -> 积分`。
- [x] **Step 2: 验证 RED**：运行两份测试，预期因页面和导航模块尚不存在而失败。
- [x] **Step 3: 实现页面**：使用 Hero、搜索、筛选、CSS columns 瀑布流、Radix Dialog、复制按钮和 `navigate('/studio', { state: { prompt } })`。
- [x] **Step 4: 接入路由导航**：增加 `/soul-gallery` 路由和 `WandSparkles` 导航项，保持原有入口顺序。
- [x] **Step 5: 实现样式**：添加 `soul-gallery-*` 主题变量、卡片、详情弹窗和移动端规则。
- [x] **Step 6: 验证 GREEN**：运行页面与导航测试，预期全部通过。

### Task 3: 创作页一次性接收提示词

**Files:**
- Create: `src/app/studio/route-prompt.ts`
- Create: `src/app/studio/route-prompt.test.ts`
- Modify: `src/app/studio/page.tsx`

- [x] **Step 1: 写失败测试**：断言 `readStudioRoutePrompt` 只接受带非空字符串 prompt 的 state，并将 4000 字符以上内容截到 4000。
- [x] **Step 2: 验证 RED**：运行 `npx vitest run src/app/studio/route-prompt.test.ts`，预期因函数尚不存在而失败。
- [x] **Step 3: 实现路由解析**：导出 `MAX_STUDIO_PROMPT_LENGTH = 4000` 与纯函数 `readStudioRoutePrompt(state)`。
- [x] **Step 4: 接入创作页**：使用 `useLocation`/`useNavigate` 读取一次提示词，设置后 `navigate('/studio', { replace: true, state: null })` 清除 state。
- [x] **Step 5: 验证 GREEN**：运行路由提示词测试和现有 studio 测试，预期全部通过。

### Task 4: 调整主题视觉

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/studio/page.tsx`

- [x] **Step 1: 调整暗色 token**：将商业背景和 studio 面板改为深蓝黑/深靛蓝，并增加青蓝、浅紫和玫紫径向渐变。
- [x] **Step 2: 确认彩色 token**：沿用增强前的浅灰蓝底色与青、珊瑚、紫、金四色边缘光晕，不为导航和主要按钮增加高饱和渐变。
- [x] **Step 3: 降低内联背景阻碍**：给 studio 首层背景增加主题可覆盖类名，分别定义 dark/colorful 强度。
- [x] **Step 4: 运行主题与 studio 测试**：预期无回归。

### Task 5: 验证、文档、集成与部署

**Files:**
- Modify: `README.md`
- Modify: `docs/API_INTEGRATION.md`

- [x] **Step 1: 全量验证**：依次运行 `npm run lint`、`npm run test`、`npm run build`。
- [x] **Step 2: 浏览器验收**：验证 1920×1080、1366×768、390×844；检查导航、搜索、分类、弹窗、复制、带入创作和三主题。
- [x] **Step 3: 更新文档**：README 记录灵魂画廊、19 项静态素材与主题视觉；API_INTEGRATION 更新契约 SHA，并注明画廊及带入创作不新增 API。
- [x] **Step 4: 一致性检查**：运行 `git diff --check`，确认只有本任务文件进入提交。
- [x] **Step 5: 提交并集成**：提交功能分支，合并到 main；保留 main 已有 AGENTS、compose 与备份文件。
- [x] **Step 6: Push 和部署**：push origin/main；用主仓库当前 `docker-compose.yml` 执行 `docker compose up -d --build`。
- [x] **Step 7: Live 验证**：检查 `/healthz`、`/`、`/soul-gallery`，并记录容器、端口和 URL 证据。
