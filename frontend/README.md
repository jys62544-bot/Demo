# 工业现场多模态智能管理平台前端

React + Vite + TypeScript 前端，用于黑客松 Demo 的员工端和管理端演示。

## 启动

```powershell
npm install
npm run dev
```

默认访问：

```text
http://127.0.0.1:5173/login
```

## 环境变量

复制 `.env.example` 为本地 `.env` 后按需调整：

```text
VITE_API_BASE_URL=
VITE_USE_MOCK=false
```

`VITE_USE_MOCK=false` 时页面会真实调用后端，不再自动回退 mock。本地 API 开发需要同时启动 `worker/`：Vite 会把 `/api` 和 `/uploads` 代理到 `http://127.0.0.1:8787`。

本地真实链路需要同时启动 `worker/`：

```powershell
cd ..\worker
npm install
npm run d1:migrate:local
npm run dev -- --ip 127.0.0.1 --port 8787
```

## 账号

- 员工端：`employee / Demo@2026#IM-Safe`
- 管理端：`admin / Demo@2026#IM-Safe`

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
