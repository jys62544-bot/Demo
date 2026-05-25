# 工业现场多模态智能管理平台前端

React + Vite + TypeScript 前端，用于黑客松 Demo 的员工端和管理端演示。

## 启动

```powershell
npm install
npm run dev
```

默认访问：

```text
http://localhost:5173/login
```

## 环境变量

复制 `.env.example` 为本地 `.env` 后按需调整：

```text
VITE_API_BASE_URL=
VITE_USE_MOCK=false
```

`VITE_USE_MOCK=false` 时页面会真实调用后端，不再自动回退 mock。Cloudflare 本地开发建议同时启动 `worker/`：Vite 会把 `/api` 和 `/uploads` 代理到 `http://127.0.0.1:8787`。

部署到 Cloudflare Pages 时，将 `VITE_API_BASE_URL` 设置为 Worker 地址，例如：

```text
https://industrial-demo-api.<your-subdomain>.workers.dev
```

Cloudflare Pages 项目名：`industrial-demo-frontend`。Worker 发布成功后，可用下面方式构建并上传：

```powershell
$env:VITE_API_BASE_URL="https://industrial-demo-api.<your-subdomain>.workers.dev"
$env:VITE_USE_MOCK="false"
npm run build
npx wrangler pages deploy dist --project-name industrial-demo-frontend
```

## 账号

- 员工端：`employee / 123456`
- 管理端：`admin / 123456`

## 已完成页面

- `/login`
- `/employee/dashboard`
- `/employee/upload`
- `/employee/assistant`
- `/employee/contribution`
- `/admin/dashboard`
- `/admin/knowledge`
- `/admin/graph`
- `/admin/abnormal`
- `/admin/ranking`
- `/admin/decision-agent`

## 验证

```powershell
npm run lint
npm run build
```
