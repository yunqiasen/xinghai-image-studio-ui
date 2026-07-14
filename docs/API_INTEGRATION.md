# Xinghai Studio 前端 API 接入说明

## 契约来源

商业前端只能按后端仓库维护的契约接入：

```text
/home/div/1_Project_dir/AI/image/xinghai-studio-console/docs/API.md
/home/div/1_Project_dir/AI/image/xinghai-studio-console/docs/openapi-studio.yaml
```

`API.md` 是人工可读契约，`openapi-studio.yaml` 是机器可读契约。两者不一致时停止接入，由后端代理先修正文档。

```text
接入契约版本: 2026-07-14.account-evidence.3
后端契约 Commit: d186edfaceaf6a910501e3a73153beb3ba4fb40b
后端实现基线 Commit: 5ad504907dc499ba0e4714fbf875e4e965cb104c
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
| 获取作品 | `GET /api/gallery` | `src/lib/storage/local-session.ts` | 已接入 |
| 清空作品 | `DELETE /api/gallery` | `src/lib/storage/local-session.ts` | 已接入 |
| 同步生图 | `POST /api/image/generate` | `src/lib/image2api/client.ts`、`src/app/studio/page.tsx` | 已接入，含生成中、失败、单图和多图结果状态 |
| 站点公开信息 | `GET /api/public/site-info` | `src/lib/site-info.ts`、`src/components/commercial/app-shell.tsx` | 已接入，驱动品牌名称、Logo、页脚、联系方式和文档入口 |
| 异步图片任务 | `/api/image/tasks*` | `src/lib/api.ts`、`src/app/image/*` | 有旧实现，但当前商业路由未启用 |

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

同步生图依赖 `ok`、`taskId`、`imageUrls`、`user`、`creditsCost`。失败提示按 `message`、`error`、HTTP 状态降级。提交后右侧立即按请求 `n` 渲染加载占位和等待时间；成功后完整消费 `imageUrls`，单图进入可缩放画布，多图按双列网格展示且不裁切。右侧任务信息栏同步展示模型、比例、分辨率、数量和作品保存状态。

2026-07-15 通过前端同源入口 `http://127.0.0.1:18100/api/image/generate` 完成真实 1K 单图验证：HTTP 200，38 秒返回 1 张 PNG，`creditsCost=1`，积分从 19 更新为 18；返回的 `/p/img/*` 签名图片经前端代理访问为 HTTP 200。另一次直连后端验证在 48 秒返回 1 张图片。临时账号及对应作品、任务记录已清理。

## 已发现的接口缺口

1. 后端契约没有“发送短信验证码”接口。启用 `smsRequired` 后，前端只能显示验证码输入框，无法主动发送验证码。
2. 积分页展示了充值套餐，但契约没有创建订单、支付、查询订单或支付回调对应的用户接口，当前套餐只能展示。
3. 当前商业 `/studio` 使用同步生图。批量任务、排队进度、取消、断线恢复尚未迁移到已文档化的异步任务接口。

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
