# 星海图像工作台

普通用户前端 UI。项目名：`xinghai-image-studio-ui`。

## 边界

本项目只负责用户界面：登录、注册、图片生成页、作品展示、积分页、账号页。

业务数据不在前端保存。用户、积分、作品、生图记录、兑换码、订单、管理员后台都由后端 `xinghai-studio-console` 负责。

后端入口：

```text
https://img-api.xinghaihub.com
http://100.126.43.55:18080
```

管理员后台：

```text
https://img-api.xinghaihub.com/admin
http://100.126.43.55:18080/admin
```

## 技术栈

```text
框架: React 19
语言: TypeScript
构建: Vite
样式: Tailwind CSS
组件: Radix UI / 自定义组件
部署: nginx Docker，后续可迁 CF Pages
默认端口: 18100
```

## 端口

```text
前端 UI: 18100
后端控制台/API: 18080
```

## 本地开发

```bash
npm install
npm run dev
```

访问：

```text
http://127.0.0.1:18100
```

## 图像创作页

`/studio` 使用后端异步任务接口 `POST /api/image/tasks`，并通过 `GET /api/image/tasks` 每 2 秒同步状态。任务状态由 `CommercialShell` 下的全局 `GenerationProvider` 管理，不再绑定创作页组件：切换到作品、积分或账号页不会终止任务；返回创作页会恢复生成中、成功图片或失败原因；刷新页面后会从后端最近 50 个当前用户任务中恢复。

右侧按任务 `count` 显示加载画布和等待时间。成功后完整展示 `task.images[].url`，单图支持缩放、适应画布、拖拽查看和打开原图，多图按双列网格展示且不裁切。失败和取消状态会保留后端中文原因，积分变化通过 `GET /api/auth/me` 重新同步。

作品页只调用当前 Cookie Session 对应的 `GET /api/gallery`。进入页面立即读取当前账号作品；任务处于 `queued`、`running`、`cancel_requested` 时每 2 秒刷新；任务转为 `succeeded` 后立即刷新。页面提供“刷新作品”按钮，并在账号切换或退出时先清空旧账号卡片，避免串号展示。

站点支持浅色、暗色、彩色三套主题。顶部导航、创作页“灵感光谱”和右侧“灵感色板”使用同一主题状态，选择后立即更新整站并写入 `localStorage`；历史 `graphite` 值自动迁移为彩色主题。默认保留 Aurora V5 彩色风格，不改变七种创作模式、参数和页面宽度结构。

站点名称、Logo、页脚、联系邮箱和文档入口读取 `GET /api/public/site-info`；接口暂不可用时保留“星海图像”默认品牌，不阻塞登录和生图。

桌面端工作区最大宽度为 `1240px` 并居中显示，左侧控制区固定约 `480px`，参数区独立滚动，底部生成按钮固定可见。窄屏改为上下排列，不把业务数据保存在前端。

## 构建和 Docker 部署

```bash
npm run build
docker compose up -d --build
```

Docker 只跑 nginx 静态站点。`/api/*` 和 `/v1/*` 会反代到 `http://100.126.43.55:18080`。

健康检查：

```bash
curl http://127.0.0.1:18100/healthz
```

## 商用部署方式

商用时仍然部署到自己的服务器。推荐方式：

```text
用户域名 -> nginx/Cloudflare -> xinghai-image-studio-ui:18100 -> /api,/v1 -> xinghai-studio-console:18080
```

前端镜像不放上游 AUTH KEY，不直接管理账号池。后端统一鉴权、扣积分、落库、调度 image2api。

## CF Pages 说明

当前不默认上 CF Pages。先用 Docker 部署在自有服务器，保持 `/api/*` 和 `/v1/*` 同源反代到 `18080`。

后续迁 CF Pages 时，优先用 Cloudflare Pages Functions / Worker 做 `/api` 同源代理。不要把后端 AUTH KEY 写进前端。

## 来源说明

UI 参考 `peiyizhi0724/ChatGpt-Image-Studio`，保留上游 MIT License：

```text
LICENSE.upstream.ChatGpt-Image-Studio
```
