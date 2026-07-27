# Xinghai Studio 前端 API 接入说明

## 契约来源与版本

商业前端只按后端仓库维护的契约接入：

```text
/home/div/1_Project_dir/AI/image/xinghai-studio-console/docs/API.md
/home/div/1_Project_dir/AI/image/xinghai-studio-console/docs/openapi-studio.yaml
/home/div/1_Project_dir/AI/image/xinghai-studio-console/docs/API_CHANGELOG.md
```

```text
接入契约版本: 2026-07-28.masked-edit.2
后端契约 Commit: db2a8e51851bc88032a7a799b696416d43efddc3
后端实现基线 Commit: 9929fee4e55770074207eff3d64a0623e6833b20
```

上述两个后端提交均为完整 SHA；实现基线是契约提交的祖先。前端不根据页面需要猜路径、字段、响应或业务数据，也不新增 BFF、Mock 业务接口或本地业务数据库。

## 调用规则

- 普通用户接口使用 Cookie Session，不使用管理员 JWT 或 `/v1` Bearer Key。
- JSON 与 multipart 请求统一使用相对路径 `/api/*`，并携带 `credentials: "include"`。
- JSON 错误展示顺序：`message` -> `error.message` / `error` -> HTTP 状态。
- `/api/admin/*`、`/api/accounts*`、`/api/me/*`、`/v1/*` 只属于管理或兼容接口，商业用户页面不调用。
- 用户、积分、作品、任务状态和视频结果以后端返回为准；本地 UI 状态只保存当前页面交互。

## 普通用户接入矩阵

| 页面/能力 | 后端接口 | 前端调用位置 | 状态 |
|---|---|---|---|
| 公开站点信息 | `GET /api/public/site-info` | `src/lib/site-info.ts`、`src/components/commercial/app-shell.tsx` | 已接入；失败时使用默认品牌 |
| 注册规则 | `GET /api/auth/registration-policy` | `src/lib/storage/local-session.ts`、注册页 | 已接入 |
| 当前用户 | `GET /api/auth/me` | `src/lib/storage/local-session.ts`、`session-hooks.ts` | 已接入 |
| 注册/登录/退出 | `POST /api/auth/register`、`POST /api/auth/login`、`POST /api/auth/logout` | `src/lib/storage/local-session.ts` | 已接入 |
| 兑换积分 | `POST /api/credits/redeem` | `src/lib/storage/local-session.ts` | 已接入，只发送兑换码 |
| 作品列表/清空 | `GET /api/gallery`、`DELETE /api/gallery` | `src/lib/storage/local-session.ts`、`src/app/gallery/*` | 已接入；最多展示后端最新 30 条中的可查看作品 |
| 图片异步任务创建/列表/详情/取消 | `POST/GET /api/image/tasks`、`GET/DELETE /api/image/tasks/:id` | `src/lib/image-tasks/*`、`src/components/commercial/generation-provider.tsx` | 已接入；局部编辑使用 `mode=image + role=mask`，后端强制限制在选区内 |
| 图片任务实时流 | `GET /api/image/tasks/stream` | `src/lib/image-tasks/client.ts`、`GenerationProvider` | 已接入；SSE 断线由 2 秒轮询兜底 |
| 提示词优化 | `POST /api/prompt/optimize` | `src/lib/prompt-optimizer/*`、图像/视频工作台 | 已接入四套 profile |
| 图片提示词兼容接口 | `POST /api/image/prompt/optimize` | 暂无页面调用 | 保留后端兼容，不重复接入 |
| 视频模型目录 | `GET /api/models?type=video` | `src/lib/video-tasks/client.ts`、`src/app/video/*` | 已接入，按能力动态渲染 |
| 视频任务创建/列表/详情 | `POST/GET /api/video/tasks`、`GET /api/video/tasks/:task_id` | `src/lib/video-tasks/*`、`src/app/video/page.tsx` | 已接入 |
| 本地去背景 | `POST /api/image/cutout` | `src/lib/image-operations/client.ts`、图像工作台 | 已接入，返回 PNG 暂存当前工作台 |
| 本地换背景 | `POST /api/image/background-replace` | `src/lib/image-operations/client.ts`、图像工作台 | 已接入，返回 PNG 暂存当前工作台 |
| 本地局部修复 | `POST /api/image/local-mask-edit` | `src/lib/image-operations/client.ts`、`ImageEditModal` | 已接入，返回 PNG 暂存当前工作台 |

## 图片工作台接入行为

### 请求字段

`/studio` 使用异步图片任务，不再把商业页面绑定到同步等待接口。创建请求由 `GenerationProvider` 补齐：

```ts
{
  taskId,
  conversationId: "commercial-studio",
  turnId,
  mode,
  prompt,
  model,
  count: 1 | 2 | 4,
  size,
  quality,
  resolution: "1K" | "2K" | "4K",
  sourceImages: [{ id, role: "image" | "mask", name, dataUrl, url }]
}
```

参考图和遮罩按后端 `sourceImages[].role` 发送；AI 局部编辑固定使用 `mode=image`，发送第一张 `role=image` 原图和最后一张黑底白色 `role=mask` 选区，白色区域允许修改。历史 `mode=edit` 仅用于恢复兼容。背景替换的第二张背景图只用于本地 multipart 接口，不会误发到图片任务的未知 role。客户端 ID 在没有 `crypto.randomUUID()` 的内网 HTTP 环境回退到 `getRandomValues()`。

### 分类隔离

文生图、图生图、图片编辑、超分和批量一致性分别维护：

- 提示词
- 参考图/遮罩
- 模型选择
- 比例、数量、分辨率和分类专属参数
- 图片任务状态与结果预览

切换分类只切换当前视图，不取消其他分类正在执行的任务；返回分类时显示该分类自己的任务。任务状态按后端 `task.mode` 分发，SSE 事件中的旧任务不会覆盖同分类较新的任务。每个分类的模型选择器都位于参数区顶部，当前均展示 `GPT Image 2.0`（请求值 `gpt-image-2`），后续可以按分类扩展 `studioModeModels`。

分类控件与后端能力的对应关系：

- `text`：模型、比例、数量、分辨率、提示词。
- `image`：参考图、参考强度、构图保持，以及上述输出设置。局部编辑属于该分类：上传源图、结果图、作品图和大图预览都从这里打开遮罩编辑器，提交后任务与结果继续留在图生图预览。
- 历史 `edit`：不再显示独立分类；旧路由和后端旧任务统一归并到 `image`。
- `remove-bg`：去背景、换背景、换衣服、换脸、加文字。去背景和换背景使用本地接口；其他动作通过已有图片任务和明确提示词执行。
- `upscale`：2×、4×、图片变体、老照片修复、人脸增强，通过已有图片任务和明确提示词执行。
- `batch`：参考图、角色一致性、构图变化、输出设置。

后端当前没有单独的换衣服、换脸、超分 API，因此前端不会伪造新路径；这些动作只复用已发布的 `/api/image/tasks` 契约。

### 任务生命周期

前端消费：`queued`、`running`、`cancel_requested`、`succeeded`、`failed`、`cancelled`。

- `CommercialShell` 在路由 `Outlet` 外层挂载 `GenerationProvider`，离开 `/studio` 不会终止后端任务。
- 首次进入或账号切换时读取当前账号最近 50 条任务；退出或切换账号会清空旧账号状态。
- 成功结果读取 `task.images[].url`；恢复时跳过 `sourceStatus=unavailable`，缺失或 `unknown` 保持兼容加载。
- SSE 收到 `init` 或 `task.upsert` 后立即更新；连接异常时保留状态并由活动任务轮询 `GET /api/image/tasks`。
- 后端心跳会为同一成功图片刷新 `/p/img/*` 签名；前端按任务、图片路径和可用状态去重，保留已渲染 URL，避免每 2 秒重复下载大图。`sourceStatus` 变化时仍会更新。
- 当前分类有活动任务时，底部按钮变为取消；调用 `DELETE /api/image/tasks/:id` 后显示 `cancel_requested`。该状态不会被迟到的成功或 Mask 合成失败覆盖，后端收尾后退款并返回 `cancelled`。
- 终态后调用 `GET /api/auth/me` 同步积分；成功任务会触发作品页刷新。

### 结果图操作

图生图上传源图后直接显示高对比“局部编辑”按钮。单图工具栏、多图结果卡片和点击图片后的大图预览也常驻该入口；点击后仍保持图生图分类选中，不进入隐藏分类或空预览。

局部编辑器会生成兼容 Alpha 遮罩、黑底白色选区遮罩和带涂抹效果的界面预览；`/studio` 与旧 `/image` 代码路径的 AI 图片任务、`/api/image/local-mask-edit` 本地修复都只提交 `selectionFile`（黑底白色选区），不提交预览图。商业工作台 AI 请求固定使用 `mode=image`，`sourceImages[0].role=image`，最后一项 `role=mask`。后端在成功发布前执行原图 + 模型结果 + 遮罩像素合成，遮罩外保持原图像素；`invalid_mask`、`mask_postprocess_failed` 作为失败任务展示、退款且不进入作品库。

作品页的“整体变化”和“局部编辑”会把签名 `/p/img/*` 源图带入工作台。该地址是浏览器同源相对路径，提交图片任务或带图优化前，前端先携带 Cookie 读取图片并转成 Data URL，再放入 `sourceImages[].dataUrl` / `sourceImage`；这样既保留作品代理鉴权，也符合后端参考图摄取只接受 Data URL、Base64 或公开 HTTP(S) URL 的契约。

## 提示词优化

工作台调用统一接口：

```text
POST /api/prompt/optimize
```

profile 映射如下：

```text
text                 -> text_to_image
image（含历史 edit） -> image_to_image
video-text           -> text_to_video
video-image          -> image_to_video
```

图片和图生视频会在有参考图时发送 `sourceImage`；视频同时发送 `duration`、`resolution`、`motion`。后端未配置或上游失败时仍返回 HTTP 200，并以 `fallback=true` 返回原提示词，前端显示降级提示但不阻断后续生成。
提示词优化使用独立的“优化中”状态，不会把请求误显示为生图任务，也不会创建或取消图片任务；返回后只更新当前分类的提示词。

## 视频工作台接入行为

`/video` 只提供文生视频和图生视频，使用独立的视频任务和预览，不复用图片任务状态，也不显示图片缩放、图片数量或局部编辑控件。

- 页面登录后读取 `/api/models?type=video`，只展示 `runtimeReady=true` 且具备当前输入模式能力的模型。
- 比例、分辨率和时长从模型 `capabilities` 动态生成；当前后端可返回 480p/720p/1080p、16:9/9:16/1:1/4:3/3:4、5/10/18 秒，前端不写死不可用选项。
- 图生视频额外上传一张 PNG/JPEG/WebP 起始图，作为 `sourceImage` Data URL；文生视频省略该字段。
- 创建时调用 `POST /api/video/tasks`，发送 `model`、`prompt`、`optimizedPrompt`、`aspectRatio`、`resolution`、`duration`、`motion`。
- 活动任务每 2 秒调用 `GET /api/video/tasks/:task_id`；离开页面后后端继续执行，重新进入通过 `GET /api/video/tasks` 恢复。
- 成功任务只在存在 `task.url` 时渲染原生 `<video controls>`，同时展示实际 `seconds`、`size`、进度、状态和动态积分。
- 视频错误读取文档定义的嵌套结构 `error: { code, message }`，不会把对象直接渲染成 `[object Object]`。

音频入口 `/audio` 目前只有界面占位。后端契约明确音频模型尚未开放普通用户执行接口，前端不提交音频任务。

## 本地图片处理

三个本地接口均使用 `multipart/form-data`，不消耗图片模型积分：

- `cutoutImage(File)` -> `/api/image/cutout`，字段 `image`、`tolerance`、`feather`。
- `replaceImageBackground(File, File)` -> `/api/image/background-replace`，字段 `foreground`、`background`、`auto_cutout`。
- `localMaskEdit(File, File)` -> `/api/image/local-mask-edit`，字段 `image`、`mask`、`radius`。

接口成功返回 `image/png` Blob。前端转换为 Data URL，仅保存在当前 React 工作台状态，可继续下载或送入下一步编辑；后端契约没有本地处理结果的作品落库接口，所以这些结果不会伪装成作品库记录。

## 有意未接入的契约能力

1. `POST /api/image/generate`：保留在兼容客户端，商业 `/studio` 使用异步任务以支持批量、取消和断线恢复。
2. `POST /api/image/prompt/optimize`：后端兼容入口，商业页面统一使用通用 profile 接口。
3. 短信发送：注册规则可要求 `smsCode`，但契约没有发送验证码接口，前端只按规则展示字段。
4. 充值订单/支付：当前后端普通用户契约只有兑换码接口，积分页不伪造支付请求。
5. 音频执行：后端目前没有普通用户音频任务接口。
6. 管理员代理池、账号池和配置接口：只在控制台使用，不进入商业用户前端。

## 验证命令

前端改动收尾按以下顺序执行：

```bash
npm run lint
npm run test
npm run build
npx tsc --noEmit
git diff --check
```

运行态入口：

```text
前端健康检查: http://127.0.0.1:18100/healthz
后端健康检查: http://127.0.0.1:18080/healthz
前端页面: http://127.0.0.1:18100/studio
视频页面: http://127.0.0.1:18100/video
```

登录后的端到端检查重点：登录 -> 图生图上传源图 -> 打开遮罩编辑器 -> 创建 `mode=image + role=mask` 任务 -> 状态轮询/SSE -> 对比遮罩外像素 -> 从结果工具栏和大图预览再次进入局部编辑 -> 积分同步。
