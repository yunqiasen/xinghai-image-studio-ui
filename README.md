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
