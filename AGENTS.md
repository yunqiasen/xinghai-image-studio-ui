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

## 前端代理职责与 API 契约工作流

前端代理只允许修改本仓库：

```text
/home/div/1_Project_dir/AI/image/xinghai-image-studio-ui
```

后端代理负责实现接口并维护以下唯一契约：

```text
/home/div/1_Project_dir/AI/image/xinghai-studio-console/docs/API.md
/home/div/1_Project_dir/AI/image/xinghai-studio-console/docs/openapi-studio.yaml
```

前端接入规则：

1. 开始接入前先读取上述两份后端契约，再核对前端 `docs/API_INTEGRATION.md`。
2. 只调用已经进入后端契约的普通用户接口，不根据页面需求自行猜测路径、字段或响应。
3. 后端字段变化时，后端代理必须先更新 `API.md` 和 OpenAPI；前端随后更新类型、请求函数、页面和测试。
4. 契约缺少接口时，在 `docs/API_INTEGRATION.md` 记录缺口并交给后端代理，不得在前端伪造 BFF、Mock 业务接口或本地数据源。
5. 普通用户接口统一使用相对路径 `/api/*` 和 Cookie Session，请求必须携带 `credentials: "include"`。
6. `/api/admin/*`、`/api/accounts*`、`/api/me/*`、`/v1/*` 不属于商业前端接口，禁止接入用户页面。
7. 联调完成后同步更新 `docs/API_INTEGRATION.md` 的“当前接入矩阵”和“接口缺口”。

前端代理不修改后端仓库，不回退其他代理的改动。发现工作区已有未提交文件时，只提交自己明确修改的文件。

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
