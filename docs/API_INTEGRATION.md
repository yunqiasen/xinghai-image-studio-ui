# Xinghai Studio 前端 API 接入说明

## 契约来源

商业前端只能按后端仓库维护的契约接入：

```text
/home/div/1_Project_dir/AI/image/xinghai-studio-console/docs/API.md
/home/div/1_Project_dir/AI/image/xinghai-studio-console/docs/openapi-studio.yaml
```

`API.md` 是人工可读契约，`openapi-studio.yaml` 是机器可读契约。两者不一致时停止接入，由后端代理先修正文档。

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
| 站点公开信息 | `GET /api/public/site-info` | 暂无 | 未接入，页面品牌信息仍是静态内容 |
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

同步生图依赖 `ok`、`taskId`、`imageUrls`、`user`、`creditsCost`。失败提示按 `message`、`error`、HTTP 状态降级。提交后右侧立即按请求 `n` 渲染加载占位和等待时间；成功后完整消费 `imageUrls`，单图进入可缩放画布，多图按双列网格展示且不裁切。

## 已发现的接口缺口

1. 后端契约没有“发送短信验证码”接口。启用 `smsRequired` 后，前端只能显示验证码输入框，无法主动发送验证码。
2. 积分页展示了充值套餐，但契约没有创建订单、支付、查询订单或支付回调对应的用户接口，当前套餐只能展示。
3. 当前商业 `/studio` 使用同步生图。批量任务、排队进度、取消、断线恢复尚未迁移到已文档化的异步任务接口。
4. `GET /api/public/site-info` 已有契约，但前端品牌名称、Logo、页脚和联系方式尚未接入。
5. `src/lib/storage/local-session.ts` 仍保留早期 `addCredits(amount)` 兼容函数；商业页面未调用，后续应删除，禁止新增调用。

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
