# Xinghai Studio 前端 API 接入说明

## 契约来源

商业前端只能按后端仓库维护的契约接入：

```text
/home/div/1_Project_dir/AI/image/xinghai-studio-console/docs/API.md
/home/div/1_Project_dir/AI/image/xinghai-studio-console/docs/openapi-studio.yaml
```

`API.md` 是人工可读契约，`openapi-studio.yaml` 是机器可读契约。两者不一致时停止接入，由后端代理先修正文档。

```text
接入契约版本: 2026-07-15.sentinel-compat.1
后端契约 Commit: dd6e4fc135255fc6bf3fb6bde3b406689b91fb5c
后端实现基线 Commit: bc2f84dd5af7add5174ab7ad18adaee83b764ece
```

本次接入已确认实现基线是后端当前 `origin/main` 的祖先，`API.md`、OpenAPI 与 `API_CHANGELOG.md` 版本一致。

接口未进入后端契约时，前端不允许自行伪造路径、请求字段、响应字段、Mock 业务数据或临时 BFF。字段变化必须由后端先更新两份契约，前端再更新类型和页面。

## 调用规则

- 普通用户接口使用 Cookie Session，不使用 Bearer Token。
- 请求统一使用相对路径 `/api/*`，并携带 `credentials: "include"`。
- JSON 错误提示按 `message`、`error`、HTTP 状态依次降级。
- 商业前端禁止调用 `/api/admin/*`、`/api/accounts*`、`/api/me/*`、`/v1/*`。
- 前端业务数据不落本地数据库；用户、积分、作品和图片任务以后端为准。

## 当前接入矩阵

| 页面/能力 | 后端接口 | 前端调用位置 | 当前状态 |
|---|---|---|---|
| 注册规则 | `GET /api/auth/registration-policy` | `src/lib/storage/local-session.ts`、`src/app/auth/register/page.tsx` | 已接入 |
| 当前用户 | `GET /api/auth/me` | `src/lib/storage/local-session.ts` | 已接入 |
| 注册 | `POST /api/auth/register` | `src/lib/storage/local-session.ts` | 已接入 |
| 登录 | `POST /api/auth/login` | `src/lib/storage/local-session.ts` | 已接入 |
| 退出 | `POST /api/auth/logout` | `src/lib/storage/local-session.ts` | 已接入 |
| 兑换积分 | `POST /api/credits/redeem` | `src/lib/storage/local-session.ts` | 已接入，只发送 `code` |
| 获取作品 | `GET /api/gallery` | `src/lib/storage/local-session.ts`、`src/app/gallery/page.tsx` | 已接入，按当前用户加载；活跃任务期间轮询，成功后立即刷新 |
| 灵魂画廊模板 | 无新增接口，本地静态素材 | `src/app/soul-gallery/*`、`public/soul-gallery-assets/*` | 已接入 19 项；搜索、分类、复制和带入创作均在前端完成 |
| 清空作品 | `DELETE /api/gallery` | `src/lib/storage/local-session.ts` | 已接入 |
| 同步生图 | `POST /api/image/generate` | `src/lib/image2api/client.ts` | 保留兼容客户端，当前商业 `/studio` 不再使用 |
| 站点公开信息 | `GET /api/public/site-info` | `src/lib/site-info.ts`、`src/components/commercial/app-shell.tsx` | 已接入，驱动品牌名称、Logo、页脚、联系方式和文档入口 |
| 异步图片任务 | `POST/GET /api/image/tasks` | `src/lib/image-tasks/*`、`src/components/commercial/generation-provider.tsx`、`src/app/studio/page.tsx` | 商业 `/studio` 已接入；跨路由保留状态，刷新后按当前用户恢复 |

## 前端依赖的关键字段

### 注册规则

```ts
type RegistrationPolicy = {
  enabled: boolean;
  allowedEmailDomains: string[];
  ipLimitEnabled: boolean;
  ipAccountLimit: number;
  phoneRequired: boolean;
  smsRequired: boolean;
};
```

注册页在规则加载完成前不得提交。`enabled=false` 时禁用注册；`allowedEmailDomains` 用于提示和前端预校验；`phoneRequired`、`smsRequired` 决定对应字段是否显示及必填。后端仍负责最终校验。

### 用户

前端依赖 `id`、`name`、`email`、`phone`、`credits`、`role`、`unlimitedCredits`、`createdAt`。登录、注册、生图和积分兑换返回的新用户对象必须刷新当前会话展示。

### 生图

商业创作页使用异步请求字段 `taskId`、`conversationId`、`turnId`、`mode`、`prompt`、`model`、`count`、`size`、`quality`、`sourceImages`。固定 `conversationId=commercial-studio`，客户端 ID 仅用于幂等；源图和遮罩按契约映射为 `sourceImages[].role=image|mask`。

前端消费 `queued`、`running`、`cancel_requested`、`succeeded`、`failed`、`cancelled` 六种状态。全局 Provider 位于 `CommercialShell` 与路由 `Outlet` 之间，因此子页面卸载不会清除任务；登录用户变化时立即清空上一账号任务，再读取当前账号最近任务。成功图片只读取 `task.images[].url`，失败原因优先显示 `task.error`。

作品页依赖后端 `GET /api/gallery` 的用户隔离结果。页面进入、手动刷新、活跃任务轮询、任务成功事件都会重新请求后端；账号变化先清空旧卡片，避免短暂显示上一用户作品。

灵魂画廊不属于用户作品，也不读取或写入后端业务数据。19 项目录和图片随前端静态发布；搜索、分类、详情和复制均在浏览器内完成。“带入创作”通过 React Router state 一次性填充 `/studio` 提示词，随后清除 state，不新增接口、不改变异步任务请求字段。

2026-07-15 前端自动化验证覆盖：异步请求字段、任务列表恢复、跨路由 loading 状态、成功后恢复全部图片、成功后作品自动刷新、失败原因恢复、用户切换清空旧作品、浅色/暗色/彩色主题持久化。浏览器模拟成功链路结果为 `galleryCards=1`、`resultCards=1`、返回创作页 `data-preview-state=results`。

同日通过真实后端提交两次异步 1K 单图任务，均完成 `queued -> running -> failed` 状态同步；150 秒后后端返回 `image_timeout`，积分从 19 自动退回 20，作品保持为空。该结果证明前端跨页跟踪、失败恢复和退款后用户状态同步正常；真实图片成功受当前后端上游账号链路状态影响，不在前端伪造成功作品。联调结束后已清理临时用户、Session、积分记录、图片任务、作品和用量记录。

## 已发现的接口缺口

1. 后端契约没有“发送短信验证码”接口。启用 `smsRequired` 后，前端只能显示验证码输入框，无法主动发送验证码。
2. 积分页展示了充值套餐，但契约没有创建订单、支付、查询订单或支付回调对应的用户接口，当前套餐只能展示。
3. 当前商业 `/studio` 已接入异步创建和轮询恢复；契约提供取消接口与 SSE，但当前页面尚未增加取消按钮和完整任务列表。

## 变更流程

```text
后端实现接口
  -> 后端更新 docs/API.md
  -> 后端更新 docs/openapi-studio.yaml
  -> 前端核对契约差异
  -> 前端更新类型和请求层
  -> 前端接入页面
  -> npm run lint && npm run test && npm run build
  -> 更新本文件接入矩阵和缺口
```
