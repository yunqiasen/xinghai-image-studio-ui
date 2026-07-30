# Image Editing Workbench UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复创作台文字复制、素材放大、图片编辑粘贴和双图槽，加入动作化素材模板与可视化文字定位，并完成上线验收。

**Architecture:** 把图片编辑素材角色和粘贴路由抽成纯函数，把上传槽、素材灯箱、右侧素材模板和文字画布拆成独立组件；`StudioPage` 只协调 mode/action/assets 和任务提交。继续使用现有 `POST /api/image/tasks` 契约，不新增前端业务接口。

**Tech Stack:** React 19、TypeScript、Vite、Tailwind CSS、Vitest、现有图片任务 API。

---

### Task 1: 图片编辑素材角色与粘贴路由

**Files:**
- Create: `src/app/studio/image-edit-assets.ts`
- Create: `src/app/studio/image-edit-assets.test.ts`
- Modify: `src/app/studio/prompt-paste.ts`
- Modify: `src/app/studio/prompt-paste.test.ts`
- Modify: `src/app/studio/page.tsx`

- [ ] 写失败测试：文生图粘贴切图生图；图片编辑粘贴留在原模式并依次分配 `image + background|garment|face`；最多两个；切动作清理不匹配辅助角色。
- [ ] 运行 `npx vitest run src/app/studio/image-edit-assets.test.ts src/app/studio/prompt-paste.test.ts`，确认因函数缺失失败。
- [ ] 实现 `auxiliaryRoleForEditAction`、`normalizeImageEditAssets`、`mergeImageEditPastedAssets`、`pasteTargetMode`。
- [ ] 修改 `StudioPage.handlePromptImagePaste` 和 `changeSetting` 使用纯函数，确保图片编辑不跳模式。
- [ ] 再运行定向测试并提交。

### Task 2: 双图槽与素材灯箱

**Files:**
- Create: `src/app/studio/studio-image-lightbox.tsx`
- Create: `src/app/studio/image-asset-slots.tsx`
- Create: `src/app/studio/image-asset-slots.test.tsx`
- Modify: `src/app/studio/mode-settings.tsx`
- Modify: `src/app/studio/studio-preview.tsx`

- [ ] 写失败测试：图片编辑换背景/换衣/换脸渲染横向“上传主图/上传参考图”两个空槽，缩略图可打开灯箱，关闭按钮不冒泡。
- [ ] 运行定向测试确认失败。
- [ ] 抽取共用灯箱，加入 ESC 关闭，并让结果图和上传图共用。
- [ ] 实现固定两列 `ImageAssetSlots`；去背景/加文字仅显示主图槽；普通图生图仍保留最多四张参考图。
- [ ] 运行定向测试并提交。

### Task 3: 动作化素材模板和隐藏系统提示

**Files:**
- Create: `src/app/studio/image-edit-templates.ts`
- Create: `src/app/studio/image-edit-templates.test.ts`
- Create: `src/app/studio/image-edit-template-panel.tsx`
- Modify: `src/app/studio/studio-preview.tsx`
- Modify: `src/app/studio/page.tsx`
- Modify: `src/app/studio/mode-config.ts`

- [ ] 写失败测试：换背景、换衣、换脸分别返回正确模板和目标角色；图片编辑右侧不出现提示词模板按钮。
- [ ] 运行定向测试确认失败。
- [ ] 使用 `public/soul-gallery-assets` 本地素材建立三类模板目录。
- [ ] 点击模板时只替换当前动作的辅助角色并保持主图。
- [ ] 图片编辑右侧显示素材模板；去背景和加文字不显示内部提示模板；用户提示词保持原文。
- [ ] 运行定向测试并提交。

### Task 4: 可视化文字位置编辑

**Files:**
- Create: `src/app/studio/text-overlay-editor.tsx`
- Create: `src/app/studio/text-overlay-editor.test.tsx`
- Create: `src/app/studio/text-overlay-position.ts`
- Create: `src/app/studio/text-overlay-position.test.ts`
- Modify: `src/app/studio/mode-settings.tsx`
- Modify: `src/app/studio/studio-preview.tsx`
- Modify: `src/app/studio/page.tsx`
- Modify: `src/app/studio/studio-settings-state.ts`
- Modify: `src/app/studio/operation-request.ts`

- [ ] 写失败测试：拖动显示坐标转原图像素坐标；九宫格返回正确 position；UI 不再渲染 X/Y 数字输入。
- [ ] 运行定向测试确认失败。
- [ ] 实现文字画布：原图、文字选框、拖动、九宫格快捷位置和即时字号/颜色/字体预览。
- [ ] 左侧改为文字内容、sans/serif、字号滑块、颜色和位置快捷键；不显示数字坐标。
- [ ] 提交继续发送契约支持的 `fontFamily/fontSize/textColor/position/x/y`。
- [ ] 运行定向测试并提交。

### Task 5: 文字选择、滚动条和命名

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/studio/layout-constants.ts`
- Modify: `src/app/studio/page.tsx`
- Modify: `src/components/language-modes.ts`
- Modify: `src/app/studio/mode-config.test.ts`
- Modify: `src/components/theme-style.test.ts`

- [ ] 写失败测试：中文和英文入口名称为“放大/去水印 / Enlarge & Remove Watermark”；创作台存在可复制文字策略和隐藏滚动条规则。
- [ ] 运行定向测试确认失败。
- [ ] 为创作台文本元素添加可选择覆盖，保留图片、画布、滑块不可选。
- [ ] 参数区和右侧栏保留滚动但隐藏滚动条。
- [ ] 修改分类名称和说明，不改 operation。
- [ ] 运行定向测试并提交。

### Task 6: 完整验证、文档、上线

**Files:**
- Modify: `README.md`
- Modify: `docs/API_INTEGRATION.md`

- [ ] 运行 `npm run lint`、`npm run test`、`npm run build`、`npx tsc --noEmit`。
- [ ] 更新 README 和 API_INTEGRATION，记录双图槽、粘贴路由、素材模板、文字画布和滚动条行为。
- [ ] 运行 `git diff --check` 并检查后端契约版本未变化。
- [ ] 合并到 main，push origin/main，执行 `docker compose up -d --build`。
- [ ] 用浏览器实测文字复制、图片编辑粘贴不跳转、两个图片槽、参考图灯箱 ESC、动作模板、文字拖动和新分类名称，保存截图。
- [ ] 核对前端/后端健康检查和线上 Bundle。
