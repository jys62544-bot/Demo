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
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=false
```

后端不可用时，API 层会回退到 mock 数据，保证页面可演示。

## 账号

- 员工端：`employee / 123456`
- 管理端：`admin / 123456`

## 已完成页面

- `/login`
- `/employee/dashboard`
- `/employee/upload`
- `/admin/dashboard`

其余演示页面已接入路由，占位待实现。

## 验证

```powershell
npm run lint
npm run build
```
