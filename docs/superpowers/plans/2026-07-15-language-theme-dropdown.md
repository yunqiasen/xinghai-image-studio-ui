# Language and Theme Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent Chinese/English UI switching, convert language and appearance controls to accessible dropdowns, and make the colorful theme visually distinct.

**Architecture:** A lightweight locale context owns language state and translation lookup. Reusable Radix Select components consume locale/theme context; commercial pages translate fixed UI copy while preserving dynamic user and backend content. CSS variables and theme-specific selectors deepen the colorful appearance without changing layout or business flows.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Radix Select, Tailwind CSS.

**后续视觉调整（2026-07-15）：** 用户取消高饱和彩色增强，当前实现恢复到增强前的克制极光配色；Task 4 中的高饱和方案只保留为历史执行记录，不代表当前运行效果。

---

### Task 1: Locale state and translation contract

**Files:**
- Create: `src/components/language-modes.ts`
- Create: `src/components/language-provider.tsx`
- Test: `src/components/language-provider.test.tsx`

- [ ] Write failing tests for locale normalization, dictionary lookup, interpolation, storage persistence, and `<html lang>` synchronization.
- [ ] Run `npm run test -- src/components/language-provider.test.tsx` and confirm failures are caused by missing locale modules.
- [ ] Implement `LanguageProvider`, `useLanguage`, storage helpers, and typed translations.
- [ ] Re-run the focused test and keep the full suite green.

### Task 2: Accessible dropdown selectors and navigation

**Files:**
- Create: `src/components/language-selector.tsx`
- Modify: `src/components/theme-selector.tsx`
- Modify: `src/components/theme-modes.ts`
- Modify: `src/components/commercial/navigation.ts`
- Modify: `src/components/commercial/app-shell.tsx`
- Modify: `src/main.tsx`
- Test: `src/components/selectors.test.tsx`
- Test: `src/components/commercial/navigation.test.ts`

- [ ] Write failing server-render tests proving both controls use Select triggers and navigation renders in Chinese and English.
- [ ] Run focused tests and confirm expected failures.
- [ ] Implement the two compact dropdowns and place language before appearance in the top bar.
- [ ] Re-run focused and full tests.

### Task 3: Translate commercial pages

**Files:**
- Modify: `src/app/landing/page.tsx`
- Modify: `src/app/studio/page.tsx`
- Modify: `src/app/studio/studio-preview.tsx`
- Modify: `src/app/gallery/page.tsx`
- Modify: `src/app/soul-gallery/page.tsx`
- Modify: `src/app/billing/page.tsx`
- Modify: `src/app/account/page.tsx`
- Modify: `src/app/auth/login/page.tsx`
- Modify: `src/app/auth/register/page.tsx`
- Modify: related tests under `src/app/**`

- [ ] Add failing render tests for key English states in the studio preview and soul gallery.
- [ ] Run focused tests and confirm Chinese-only output causes the failures.
- [ ] Replace fixed copy with `t()` and locale-aware title/category formatting; preserve prompts and backend messages.
- [ ] Re-run focused and full tests.

### Task 4: Colorful theme differentiation and responsive polish

**Files:**
- Modify: `src/app/globals.css`
- Test: `src/components/theme-provider.test.ts`

- [ ] Add failing source assertions for colorful gradient tokens and dropdown-only selector classes.
- [ ] Run the focused test and confirm expected failure.
- [ ] Add saturated aurora variables, glass borders, gradient active states, compact mobile selectors, focus rings, and reduced-motion behavior.
- [ ] Re-run tests and build.

### Task 5: Browser QA, documentation, release, and deployment

**Files:**
- Modify: `README.md`
- Modify: `docs/API_INTEGRATION.md`

- [ ] Verify Chinese/English switching, refresh persistence, both dropdowns, all three themes, and no overflow at 1920×1080, 1366×768, and 390×844.
- [ ] Run `npm run lint`, `npm run test`, and `npm run build`.
- [ ] Update user documentation only after tests pass, then run `git diff --check`.
- [ ] Commit and push `feat/language-theme-dropdown`, merge into `main` without touching unrelated local files, and push `main`.
- [ ] Deploy with the repository `docker-compose.yml`, then verify `http://127.0.0.1:18100/healthz`, `/`, `/studio`, and `/soul-gallery`.
