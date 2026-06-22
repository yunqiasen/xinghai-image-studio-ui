# AGENTS.md — xinghai-image-studio-ui

本仓库是星海图像普通用户前端 UI。

## 项目定位

```text
仓库: https://github.com/yunqiasen/xinghai-image-studio-ui
默认分支: main
固定端口: 18100
```

本项目参考 `peiyizhi0724/ChatGpt-Image-Studio` 的 UI 思路。保留 `LICENSE.upstream.ChatGpt-Image-Studio`。

## 技术栈

```text
React 19
TypeScript
Vite
Tailwind CSS
Radix UI / 自定义组件
nginx Docker 静态部署
```

## 负责范围

```text
页面展示
登录/注册表单
图片工作台
作品相册
积分页面
账号页面
调用后端 API
```

业务数据不在前端保存。用户、积分、作品、生图记录、兑换码、订单、管理员后台都由 `xinghai-studio-console` 负责。

## 当前部署策略

当前默认：Docker 部署在自有服务器。

```text
用户域名 / Cloudflare
  -> xinghai-image-studio-ui:18100
  -> /api/* 和 /v1/* 反代
  -> xinghai-studio-console:18080
```

CF Pages 暂时只作为后续优化。只有登录、积分、作品、支付接口稳定后再迁移。

迁到 CF Pages 时只能二选一：

```text
方案 A：VITE_PUBLIC_API_BASE=https://img-api.xinghaihub.com，后端处理 CORS。
方案 B：Cloudflare Pages Functions / Worker 做 /api 代理，继续保持同源调用。
```

禁止把后端 `api.v1_key`、账号 token、Cookie 写进前端环境变量或前端 bundle。

## 端口和入口

```text
前端本机: http://127.0.0.1:18100
前端内网: http://100.126.43.55:18100
后端 API: http://100.126.43.55:18080
```

禁止随意改 `18100`。

## 开发检查

改代码前先跑：

```bash
pwd
git status --short
git branch --show-current
git remote -v
```

## 测试

代码改动后至少跑：

```bash
npm run lint
npm run test
npm run build
```

## Docker 部署

```bash
npm run build
docker compose up -d --build
```

验证：

```bash
curl -fsS http://127.0.0.1:18100/healthz
curl -fsS -o /tmp/xinghai-ui.html -w '%{http_code}' http://127.0.0.1:18100/
```

## 禁止事项

禁止在本仓库新增临时 BFF、JSON 数据库、后台用户管理。

禁止提交：

```text
node_modules/
dist/
data/
.env
.env.local
账号 token
后端 AUTH KEY
cookie
本地密钥
```
