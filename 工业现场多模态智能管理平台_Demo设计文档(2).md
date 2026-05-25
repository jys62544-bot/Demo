# 工业现场多模态数据采集与智能管理平台 Demo 设计文档

> 版本：v1.1  
> 目标：用于快速开发一个可演示、可路演、可交给投资人展示的系统原型。  
> 核心边界：**不从零构建 RAG，不训练模型，不实现真实知识图谱推理；重点完成多模态数据上传、元数据管理、管理端可视化、知识库/知识图谱模拟展示、Agent API 占位或转发。**

---

## 1. 项目定位

本项目定位为：

**面向工业现场的多模态数据采集与智能管理平台 Demo。**

系统通过员工端完成视频、图片、音频、文本、文档等多模态数据上传，通过管理端展示实时数据流、知识库增长、知识图谱、贡献排行榜、异常案例和管理决策问答。后续复杂 AI 能力通过外部 Agent API 接入，本系统只负责前端展示、数据管理、上传闭环和接口转发。

### 1.1 一句话介绍

本系统面向工业现场知识沉淀难、员工培训成本高、操作质量难监督、经验难复用等问题，构建一个支持多模态数据上传、知识资产展示、员工贡献激励和智能 Agent 辅助决策的可视化平台原型。

### 1.2 当前版本要实现什么

当前版本要完成：

1. 员工端登录。
2. 员工端上传视频、图片、音频、文本、PDF/Word 等多模态数据。
3. 上传时填写工业现场元数据：设备、工序、场景、标签、异常类型、风险等级等。
4. 后端保存文件和元数据。
5. 上传成功后自动生成一条知识条目。
6. 上传成功后自动增加员工贡献积分。
7. 管理端展示实时上传数据流。
8. 管理端展示模拟知识库和知识图谱。
9. 管理端展示异常案例列表。
10. 管理端展示员工知识贡献排行榜。
11. Agent 模块通过一个统一 API 占位或转发到外部大模型接口。
12. 提供完整 Demo 演示闭环。

### 1.3 当前版本不做什么

当前版本明确不做：

1. 不搭建真实 RAG 向量数据库。
2. 不训练工业视觉模型。
3. 不训练动作识别模型。
4. 不做真实视频异常检测算法。
5. 不做复杂权限系统。
6. 不做真实知识图谱数据库，例如 Neo4j。
7. 不做复杂审批流。
8. 不做企业级安全审计。
9. 不做高并发部署。
10. 不做生产级文件对象存储。

这些能力通过“模拟展示 + API 占位 + 可扩展架构”表现出来。

---

## 2. 系统角色设计

系统分为两个端：

1. 员工端。
2. 管理端。

### 2.1 员工角色

员工端用户主要功能：

- 登录系统。
- 上传多模态现场数据。
- 查看自己的上传记录。
- 查看自己的知识贡献积分。
- 使用 AI 助手进行现场问答。
- 查看自己的知识贡献历史。

员工端设计原则：

- 页面简洁。
- 操作步骤少。
- 适合平板、手机、工位电脑使用。
- 不展示复杂数据分析。
- 强调“上传、提问、学习、贡献”。

### 2.2 管理员/管理层角色

管理端用户主要功能：

- 查看系统总览大屏。
- 查看实时数据上传流。
- 查看知识库条目。
- 查看模拟知识图谱。
- 查看异常案例。
- 查看员工贡献排行榜。
- 使用管理决策 Agent。
- 查看统计图表。

管理端设计原则：

- 可视化强。
- 数据面板清晰。
- 适合路演展示。
- 重点表现“知识库正在增长”“员工贡献可量化”“异常操作可管理”“Agent 能辅助决策”。

---

## 3. 系统总体架构

### 3.1 简化架构

```text
┌─────────────────────────────────────────────┐
│                  前端系统                    │
│                                             │
│  员工端：上传 / AI助手 / 我的贡献             │
│  管理端：大屏 / 图谱 / 排行榜 / 异常案例       │
└───────────────────────▲─────────────────────┘
                        │ HTTP API
                        │ 可选 WebSocket / 轮询
┌───────────────────────┴─────────────────────┐
│                  后端服务                    │
│                                             │
│  登录认证 / 文件上传 / 元数据管理 / 统计接口   │
│  知识条目生成 / 积分生成 / Agent API 转发      │
└───────────────────────▲─────────────────────┘
                        │
       ┌────────────────┼────────────────┐
       │                │                │
┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────────┐
│   SQLite    │  │   uploads   │  │  外部 Agent API  │
│  业务数据    │  │   文件存储   │  │  问答/分析/决策  │
└─────────────┘  └─────────────┘  └─────────────────┘
```

### 3.2 推荐技术栈

#### 前端

- React 18
- Vite
- TypeScript
- React Router
- Ant Design
- ECharts
- Axios
- dayjs
- Zustand 或 React Context

#### 后端

- Python 3.10+
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite
- python-multipart
- pydantic
- requests 或 httpx

#### 文件存储

- 本地 `uploads/` 文件夹。
- 当前 Demo 阶段不需要 OSS/MinIO。

#### Agent API

当前版本支持两种模式：

1. Mock 模式：后端直接返回模板答案。
2. Proxy 模式：后端转发到外部大模型 API。

通过环境变量控制：

```env
AGENT_MODE=mock
AGENT_API_URL=
AGENT_API_KEY=
```

当 `AGENT_MODE=mock` 时，不请求外部接口。

当 `AGENT_MODE=proxy` 时，请求外部 Agent API。

---

## 4. 功能模块总览

### 4.1 员工端模块

| 模块 | 功能 |
|---|---|
| 登录页 | 员工/管理端统一登录 |
| 员工首页 | 今日数据、我的贡献、快捷入口 |
| 多模态上传 | 上传视频、图片、音频、文本、文档 |
| 上传记录 | 查看个人上传记录 |
| AI 助手 | 调用 Agent API 进行问答 |
| 我的贡献 | 查看积分、贡献记录、排名 |

### 4.2 管理端模块

| 模块 | 功能 |
|---|---|
| 管理驾驶舱 | 总览指标、趋势图、实时数据 |
| 实时数据流 | 展示最新上传内容 |
| 知识库展示 | 展示自动生成的知识条目 |
| 知识图谱 | 基于上传数据动态生成模拟图谱 |
| 异常案例 | 展示异常数据和风险等级 |
| 贡献排行榜 | 展示员工贡献积分排行 |
| Agent 决策问答 | 管理层输入问题，调用 Agent API |
| 文件详情 | 查看上传文件、元数据、知识条目 |

---

## 5. 页面设计细节

---

# 5.1 登录页

## 页面路径

```text
/login
```

## 页面功能

- 输入用户名和密码。
- 选择或自动识别用户角色。
- 登录成功后：
  - 员工跳转 `/employee/dashboard`
  - 管理员跳转 `/admin/dashboard`

## 预置账号

```text
员工账号：
username: employee
password: 123456

管理员账号：
username: admin
password: 123456
```

## 页面布局

```text
左侧：系统介绍 + 工业现场背景图/渐变背景
右侧：登录卡片
```

## 登录卡片内容

- 系统名称：工业现场多模态智能管理平台
- 用户名输入框
- 密码输入框
- 登录按钮
- Demo 账号提示

## 登录接口

```http
POST /api/auth/login
```

请求：

```json
{
  "username": "employee",
  "password": "123456"
}
```

返回：

```json
{
  "token": "demo-token-employee",
  "user": {
    "id": 1,
    "username": "employee",
    "name": "张三",
    "role": "employee",
    "department": "一号产线",
    "position": "操作员"
  }
}
```

---

# 5.2 员工端首页

## 页面路径

```text
/employee/dashboard
```

## 页面目标

让员工快速进入上传、问答和贡献查看。

## 页面模块

### 顶部欢迎区

显示：

```text
欢迎你，张三
所属部门：一号产线
岗位：设备操作员
```

### 指标卡片

4 个卡片：

1. 今日上传数量。
2. 我的知识贡献数量。
3. 我的积分。
4. AI 问答次数。

示例：

```text
今日上传：3
知识贡献：18
贡献积分：230
AI 问答：12
```

### 快捷入口

4 个按钮：

- 上传现场数据
- 询问 AI 助手
- 查看上传记录
- 我的贡献积分

### 最近上传记录

展示最近 5 条本人上传数据：

字段：

- 文件类型
- 标题
- 设备
- 工序
- 上传时间
- 状态

---

# 5.3 多模态上传页

## 页面路径

```text
/employee/upload
```

## 页面目标

完成系统最核心功能：多模态数据上传。

## 支持文件类型

| 类型 | 后缀 |
|---|---|
| 图片 | jpg, jpeg, png, webp |
| 视频 | mp4, mov, avi |
| 音频 | mp3, wav, m4a |
| 文档 | pdf, doc, docx, txt |
| 文本 | 可直接输入文本内容 |

## 页面布局

```text
┌─────────────────────────────────────────┐
│ 页面标题：多模态现场数据上传              │
├──────────────────────┬──────────────────┤
│ 左侧：文件拖拽上传区   │ 右侧：元数据表单  │
├──────────────────────┴──────────────────┤
│ 底部：最近上传记录                        │
└─────────────────────────────────────────┘
```

## 上传区设计

显示：

- 拖拽上传框。
- 支持点击选择文件。
- 文件类型图标。
- 上传进度条。
- 上传成功/失败状态。
- 文件预览：
  - 图片显示缩略图。
  - 视频显示文件名和视频图标。
  - 音频显示音频图标。
  - 文档显示文档图标。

## 元数据表单字段

| 字段 | 类型 | 是否必填 | 示例 |
|---|---|---|---|
| title | 输入框 | 是 | 设备A开机前检查流程 |
| file_type | 下拉框 | 是 | video/image/audio/document/text |
| device_name | 输入框/下拉框 | 是 | 设备A |
| process_name | 输入框/下拉框 | 是 | 开机检查 |
| scene_type | 下拉框 | 是 | 标准操作/异常操作/培训经验/故障案例/质检记录 |
| is_abnormal | 开关 | 否 | true/false |
| risk_level | 下拉框 | 否 | low/medium/high |
| tags | 标签输入 | 否 | 开机、安全锁、检查 |
| description | 多行文本 | 否 | 本视频展示设备A开机前安全锁检查流程 |
| text_content | 多行文本 | 文本类型时必填 | 老员工经验总结 |

## 场景类型枚举

```text
standard_operation    标准操作
abnormal_operation    异常操作
training_experience   培训经验
fault_case            故障案例
quality_inspection    质检记录
maintenance_record    维修记录
other                 其他
```

## 风险等级枚举

```text
none      无风险
low       低风险
medium    中风险
high      高风险
critical  严重风险
```

## 上传成功后的自动动作

后端需要执行：

1. 保存文件到 `uploads/`。
2. 保存上传记录到 `uploaded_files`。
3. 自动生成一条知识条目到 `knowledge_items`。
4. 如果 `is_abnormal=true`，生成异常案例记录。
5. 给上传员工增加贡献积分。
6. 返回完整上传结果。
7. 前端提示上传成功。
8. 前端刷新最近上传记录。
9. 管理端刷新实时数据流。

## 上传成功提示

```text
上传成功！
系统已自动生成一条知识条目，等待管理员审核。
本次贡献积分 +10。
```

如果是异常案例：

```text
异常案例上传成功！
系统已记录该异常，并同步到管理端异常案例看板。
本次贡献积分 +15。
```

---

# 5.4 员工端 AI 助手页

## 页面路径

```text
/employee/assistant
```

## 页面目标

通过统一 Agent API 实现问答占位。

## 员工端展示的 Agent 类型

1. 新员工培训助手。
2. 员工操作问答助手。
3. 异常操作提醒助手。

## 页面布局

```text
左侧：Agent 类型卡片
右侧：聊天窗口
底部：输入框 + 发送按钮
```

## Agent 卡片

### 新员工培训助手

描述：

```text
根据 SOP、培训资料和现场案例，为新员工生成学习建议和操作说明。
```

role_type：

```text
training_assistant
```

### 员工操作问答助手

描述：

```text
回答现场操作问题，提供标准流程和注意事项。
```

role_type：

```text
operation_qa
```

### 异常操作提醒助手

描述：

```text
根据上传的异常案例或现场描述，给出风险提示和改进建议。
```

role_type：

```text
abnormal_alert
```

## 示例问题快捷按钮

```text
设备A开机前需要检查什么？
这个报警提示应该怎么处理？
如何判断这个操作是否符合标准流程？
我上传的异常案例应该归类到哪一类？
```

## 调用接口

```http
POST /api/agent/chat
```

请求：

```json
{
  "user_id": 1,
  "role_type": "operation_qa",
  "question": "设备A开机前需要检查什么？",
  "context": {
    "device_name": "设备A",
    "process_name": "开机检查"
  }
}
```

返回：

```json
{
  "answer": "根据设备A开机前检查规范，建议依次检查电源状态、急停按钮、安全锁、润滑状态和报警面板。如果发现安全锁未闭合，应暂停开机并通知班组长复核。",
  "role_type": "operation_qa",
  "suggestions": [
    "查看设备A开机检查流程",
    "查看相关异常案例",
    "上传现场图片进一步分析"
  ],
  "sources": [
    "模拟SOP：设备A开机检查流程",
    "模拟案例：安全锁未闭合导致停机"
  ]
}
```

---

# 5.5 我的贡献页

## 页面路径

```text
/employee/contribution
```

## 页面目标

让员工看到自己的知识贡献价值，形成激励机制。

## 页面模块

### 我的积分卡片

显示：

- 当前积分。
- 本月新增积分。
- 知识贡献数量。
- 排名。

### 积分明细

表格字段：

- 时间。
- 行为类型。
- 关联文件。
- 积分。
- 说明。

### 我的上传贡献

展示本人上传文件列表。

### 我的知识条目

展示本人贡献生成的知识条目。

## 积分规则

| 行为 | 积分 |
|---|---|
| 上传普通文件 | +5 |
| 上传标准操作视频 | +10 |
| 上传培训经验 | +10 |
| 上传故障案例 | +15 |
| 上传异常操作案例 | +15 |
| 上传高风险异常案例 | +20 |
| 管理员审核通过 | +10 |
| 被标记为优质知识 | +20 |

当前 Demo 版本只实现上传时自动加分，审核加分可以先不做。

---

# 5.6 管理端驾驶舱

## 页面路径

```text
/admin/dashboard
```

## 页面目标

这是投资人和管理层最主要看到的页面。要有强烈的数据大屏感。

## 页面布局

```text
┌─────────────────────────────────────────────┐
│ 顶部：系统标题 + 当前时间 + 登录用户          │
├─────────────────────────────────────────────┤
│ 第一行：核心指标卡片                          │
├──────────────────────┬──────────────────────┤
│ 左侧：实时上传数据流   │ 右侧：贡献排行榜       │
├──────────────────────┼──────────────────────┤
│ 左下：异常案例列表     │ 右下：数据趋势图        │
└─────────────────────────────────────────────┘
```

## 顶部标题

```text
工业现场多模态智能管理平台
```

副标题：

```text
数据采集 · 知识沉淀 · 操作监督 · 智能决策
```

## 核心指标卡片

至少 6 个：

1. 多模态数据总量。
2. 今日新增上传。
3. 知识条目数量。
4. 异常案例数量。
5. 员工贡献人数。
6. Agent 调用次数。

示例：

```text
多模态数据总量：1,248
今日新增上传：36
知识条目数量：862
异常案例数量：57
贡献员工数量：42
AI 调用次数：319
```

Demo 阶段允许用数据库真实统计 + 初始 seed 数据混合展示。

## 实时上传数据流

展示最近 10 条上传记录。

格式：

```text
[10:32] 张三 上传了 视频《设备A开机前检查流程》
[10:35] 李四 上传了 图片《设备B异常报警面板》
[10:41] 王五 上传了 文档《轧机润滑系统维护经验》
```

如果是异常案例，显示红色标签：

```text
异常 / 高风险
```

## 贡献排行榜

展示前 5 名员工：

字段：

- 排名。
- 员工姓名。
- 部门。
- 贡献积分。
- 贡献知识数。

## 异常案例列表

展示最近异常案例：

字段：

- 时间。
- 标题。
- 设备。
- 工序。
- 风险等级。
- 上传人。

## 数据趋势图

使用 ECharts 折线图或柱状图。

展示最近 7 天：

- 上传数量。
- 异常数量。
- 知识条目数量。

---

# 5.7 管理端知识库页

## 页面路径

```text
/admin/knowledge
```

## 页面目标

展示系统中沉淀的知识条目。

## 页面内容

### 筛选区

筛选条件：

- 关键词。
- 知识类型。
- 设备。
- 工序。
- 状态。
- 贡献人。
- 是否异常。

### 知识条目表格

字段：

| 字段 | 说明 |
|---|---|
| title | 知识标题 |
| knowledge_type | 知识类型 |
| device_name | 设备 |
| process_name | 工序 |
| contributor_name | 贡献人 |
| status | 状态 |
| created_at | 创建时间 |
| action | 查看详情 |

### 知识类型枚举

```text
SOP
标准操作
异常案例
培训经验
故障处理
质检记录
维修经验
其他
```

### 状态枚举

```text
pending   待审核
approved  已入库
rejected  已驳回
```

当前 Demo 版本默认 `approved` 或 `pending` 均可。建议上传后先设为 `pending`，管理端看起来更真实。

---

# 5.8 管理端知识图谱页

## 页面路径

```text
/admin/graph
```

## 页面目标

用可视化方式展示“数据上传后知识库正在增长”。

## 技术实现

使用 ECharts Graph 即可，不需要 Neo4j。

## 节点类型

| 节点类型 | 示例 | 颜色建议 |
|---|---|---|
| employee | 张三 | 蓝色 |
| file | 设备A开机视频 | 灰色 |
| knowledge | 开机检查SOP | 绿色 |
| device | 设备A | 紫色 |
| process | 开机检查 | 橙色 |
| abnormal | 安全锁未闭合 | 红色 |

## 边关系

| 关系 | 示例 |
|---|---|
| uploaded | 张三 -> 上传文件 |
| generated | 上传文件 -> 知识条目 |
| related_device | 知识条目 -> 设备 |
| related_process | 知识条目 -> 工序 |
| abnormal_of | 异常案例 -> 工序 |
| contributed_by | 知识条目 -> 员工 |

## 图谱接口

```http
GET /api/dashboard/graph
```

返回：

```json
{
  "nodes": [
    { "id": "user_1", "name": "张三", "category": "employee" },
    { "id": "file_1", "name": "设备A开机流程视频", "category": "file" },
    { "id": "knowledge_1", "name": "设备A开机检查流程", "category": "knowledge" },
    { "id": "device_设备A", "name": "设备A", "category": "device" },
    { "id": "process_开机检查", "name": "开机检查", "category": "process" }
  ],
  "links": [
    { "source": "user_1", "target": "file_1", "label": "上传" },
    { "source": "file_1", "target": "knowledge_1", "label": "生成" },
    { "source": "knowledge_1", "target": "device_设备A", "label": "关联设备" },
    { "source": "knowledge_1", "target": "process_开机检查", "label": "关联工序" }
  ]
}
```

## 图谱交互

- 鼠标悬停显示节点详情。
- 点击节点右侧显示详情抽屉。
- 支持根据设备筛选。
- 支持根据员工筛选。
- 支持根据异常案例筛选。
- 上传新文件后刷新图谱。

---

# 5.9 管理端异常案例页

## 页面路径

```text
/admin/abnormal
```

## 页面目标

展示上传数据中被标记为异常的内容。

## 页面模块

### 风险统计卡片

- 低风险数量。
- 中风险数量。
- 高风险数量。
- 严重风险数量。

### 异常案例表格

字段：

- 标题。
- 设备。
- 工序。
- 风险等级。
- 上传人。
- 上传时间。
- 处理状态。
- 查看详情。

### 风险等级颜色

| 等级 | 颜色 |
|---|---|
| low | 蓝色 |
| medium | 橙色 |
| high | 红色 |
| critical | 深红色 |

### 异常详情页/弹窗

展示：

- 文件预览。
- 元数据。
- 描述。
- 关联知识条目。
- Agent 生成的模拟建议。

模拟建议可以是：

```text
系统建议：
该异常与“开机前安全锁检查”环节相关，建议重新学习设备A开机检查SOP，并由班组长复核后再进行上机操作。
```

---

# 5.10 管理端贡献排行榜页

## 页面路径

```text
/admin/ranking
```

## 页面目标

展示知识贡献激励机制。

## 页面内容

### 总榜

字段：

- 排名。
- 员工姓名。
- 部门。
- 上传数量。
- 知识条目数。
- 异常案例数。
- 总积分。

### 榜单类型

- 总贡献榜。
- 本周贡献榜。
- 异常发现榜。
- 培训经验榜。
- SOP 贡献榜。

Demo 阶段可以只做总贡献榜。

---

# 5.11 管理端 Agent 决策页

## 页面路径

```text
/admin/decision-agent
```

## 页面目标

让管理层输入问题，系统调用 Agent API 返回管理建议。

## 管理端 Agent 类型

1. 管理决策支持。
2. 工作质量监督。
3. 异常趋势分析。

## 示例问题

```text
最近哪个工序异常最多？
哪些员工贡献知识最多？
本周高风险异常集中在哪些设备？
如何提升新员工培训效率？
当前知识库还缺少哪些内容？
```

## 返回展示格式

Agent 返回内容应展示为结构化卡片：

```text
结论
数据依据
风险分析
建议措施
优先级
```

示例：

```text
结论：
最近异常主要集中在设备A的开机检查环节。

数据依据：
近7天相关异常案例共 8 条，占全部异常的 42%。

风险分析：
该问题可能导致设备带故障启动，存在中高风险。

建议措施：
1. 将设备A开机检查流程设为新员工必学内容。
2. 要求班组长对该环节进行现场复核。
3. 鼓励老员工上传标准操作视频。

优先级：
高。
```

---

## 6. 后端接口设计

统一前缀：

```text
/api
```

---

# 6.1 登录接口

```http
POST /api/auth/login
```

请求：

```json
{
  "username": "employee",
  "password": "123456"
}
```

返回：

```json
{
  "token": "demo-token-employee",
  "user": {
    "id": 1,
    "username": "employee",
    "name": "张三",
    "role": "employee",
    "department": "一号产线",
    "position": "操作员"
  }
}
```

错误返回：

```json
{
  "detail": "用户名或密码错误"
}
```

---

# 6.2 获取当前用户信息

```http
GET /api/user/profile
```

Header：

```text
Authorization: Bearer demo-token-employee
```

返回：

```json
{
  "id": 1,
  "username": "employee",
  "name": "张三",
  "role": "employee",
  "department": "一号产线",
  "position": "操作员"
}
```

---

# 6.3 文件上传接口

```http
POST /api/upload
```

请求类型：

```text
multipart/form-data
```

字段：

| 字段 | 类型 |
|---|---|
| file | File |
| title | string |
| file_type | string |
| device_name | string |
| process_name | string |
| scene_type | string |
| is_abnormal | boolean |
| risk_level | string |
| tags | string |
| description | string |
| user_id | number |
| text_content | string |

返回：

```json
{
  "message": "上传成功",
  "file": {
    "id": 1,
    "title": "设备A开机前检查流程",
    "file_name": "demo.mp4",
    "file_type": "video",
    "file_url": "/uploads/demo.mp4",
    "uploader_id": 1,
    "uploader_name": "张三",
    "device_name": "设备A",
    "process_name": "开机检查",
    "scene_type": "standard_operation",
    "is_abnormal": false,
    "risk_level": "none",
    "tags": "开机,安全锁,检查",
    "description": "设备A开机前标准检查流程",
    "created_at": "2026-05-25 10:30:00"
  },
  "knowledge_item": {
    "id": 1,
    "title": "设备A - 开机检查 - 设备A开机前检查流程",
    "knowledge_type": "标准操作",
    "status": "pending"
  },
  "score_added": 10
}
```

---

# 6.4 获取文件列表

```http
GET /api/files
```

Query 参数：

| 参数 | 说明 |
|---|---|
| user_id | 可选，只看某个用户 |
| file_type | 可选 |
| is_abnormal | 可选 |
| keyword | 可选 |
| limit | 默认 20 |
| offset | 默认 0 |

返回：

```json
{
  "items": [
    {
      "id": 1,
      "title": "设备A开机前检查流程",
      "file_type": "video",
      "file_url": "/uploads/demo.mp4",
      "uploader_name": "张三",
      "device_name": "设备A",
      "process_name": "开机检查",
      "scene_type": "standard_operation",
      "is_abnormal": false,
      "risk_level": "none",
      "tags": "开机,安全锁,检查",
      "created_at": "2026-05-25 10:30:00"
    }
  ],
  "total": 1
}
```

---

# 6.5 获取文件详情

```http
GET /api/files/{file_id}
```

返回：

```json
{
  "id": 1,
  "title": "设备A开机前检查流程",
  "file_type": "video",
  "file_url": "/uploads/demo.mp4",
  "uploader_name": "张三",
  "device_name": "设备A",
  "process_name": "开机检查",
  "scene_type": "standard_operation",
  "is_abnormal": false,
  "risk_level": "none",
  "tags": "开机,安全锁,检查",
  "description": "设备A开机前标准检查流程",
  "created_at": "2026-05-25 10:30:00",
  "knowledge_item": {
    "id": 1,
    "title": "设备A - 开机检查 - 设备A开机前检查流程",
    "status": "pending"
  }
}
```

---

# 6.6 获取知识条目列表

```http
GET /api/knowledge
```

Query 参数：

| 参数 | 说明 |
|---|---|
| keyword | 可选 |
| device_name | 可选 |
| process_name | 可选 |
| knowledge_type | 可选 |
| status | 可选 |

返回：

```json
{
  "items": [
    {
      "id": 1,
      "title": "设备A - 开机检查 - 设备A开机前检查流程",
      "knowledge_type": "标准操作",
      "source_file_id": 1,
      "device_name": "设备A",
      "process_name": "开机检查",
      "contributor_name": "张三",
      "tags": "开机,安全锁,检查",
      "status": "pending",
      "created_at": "2026-05-25 10:30:00"
    }
  ],
  "total": 1
}
```

---

# 6.7 管理端统计接口

```http
GET /api/dashboard/summary
```

返回：

```json
{
  "total_files": 1248,
  "today_uploads": 36,
  "total_knowledge": 862,
  "total_abnormal": 57,
  "total_contributors": 42,
  "agent_calls": 319,
  "file_type_distribution": {
    "video": 320,
    "image": 480,
    "audio": 96,
    "document": 210,
    "text": 142
  },
  "risk_distribution": {
    "low": 18,
    "medium": 25,
    "high": 12,
    "critical": 2
  }
}
```

说明：

- 如果真实数据库数量不足，可以用 seed 数据初始化。
- 不要纯前端写死，尽量从后端返回，方便演示时动态变化。

---

# 6.8 最近上传接口

```http
GET /api/dashboard/recent-uploads
```

返回：

```json
{
  "items": [
    {
      "id": 1,
      "time": "10:32",
      "uploader_name": "张三",
      "title": "设备A开机前检查流程",
      "file_type": "video",
      "device_name": "设备A",
      "process_name": "开机检查",
      "is_abnormal": false,
      "risk_level": "none"
    }
  ]
}
```

---

# 6.9 贡献排行榜接口

```http
GET /api/dashboard/ranking
```

返回：

```json
{
  "items": [
    {
      "rank": 1,
      "user_id": 1,
      "user_name": "张三",
      "department": "一号产线",
      "upload_count": 18,
      "knowledge_count": 16,
      "abnormal_count": 3,
      "total_points": 230
    }
  ]
}
```

---

# 6.10 图谱接口

```http
GET /api/dashboard/graph
```

返回：

```json
{
  "nodes": [
    {
      "id": "user_1",
      "name": "张三",
      "category": "employee"
    },
    {
      "id": "device_设备A",
      "name": "设备A",
      "category": "device"
    },
    {
      "id": "process_开机检查",
      "name": "开机检查",
      "category": "process"
    },
    {
      "id": "file_1",
      "name": "设备A开机前检查流程",
      "category": "file"
    },
    {
      "id": "knowledge_1",
      "name": "设备A - 开机检查",
      "category": "knowledge"
    }
  ],
  "links": [
    {
      "source": "user_1",
      "target": "file_1",
      "label": "上传"
    },
    {
      "source": "file_1",
      "target": "knowledge_1",
      "label": "生成"
    },
    {
      "source": "knowledge_1",
      "target": "device_设备A",
      "label": "关联设备"
    },
    {
      "source": "knowledge_1",
      "target": "process_开机检查",
      "label": "关联工序"
    }
  ]
}
```

---

# 6.11 Agent 聊天接口

```http
POST /api/agent/chat
```

请求：

```json
{
  "user_id": 1,
  "role_type": "operation_qa",
  "question": "设备A开机前需要检查什么？",
  "context": {
    "device_name": "设备A",
    "process_name": "开机检查"
  }
}
```

返回：

```json
{
  "answer": "根据设备A开机前检查规范，建议依次检查电源状态、急停按钮、安全锁、润滑状态和报警面板。",
  "role_type": "operation_qa",
  "suggestions": [
    "查看设备A开机检查流程",
    "查看相关异常案例",
    "上传现场图片进一步分析"
  ],
  "sources": [
    "模拟SOP：设备A开机检查流程",
    "模拟案例：安全锁未闭合导致停机"
  ]
}
```

## Agent Mock 规则

如果 `AGENT_MODE=mock`，根据 `role_type` 返回不同模板。

### training_assistant

返回：

```text
我会根据你的岗位和当前工序，为你整理学习路径。建议先学习设备结构，再学习标准操作流程，最后结合异常案例进行训练。
```

### operation_qa

返回：

```text
根据当前设备和工序，建议优先检查安全状态、设备报警面板、关键按钮位置和 SOP 中的强制确认步骤。
```

### abnormal_alert

返回：

```text
该情况可能涉及异常操作。建议记录现场图片或视频，并由班组长复核。若存在安全风险，应立即暂停操作。
```

### quality_supervisor

返回：

```text
从管理角度看，当前异常主要集中在操作前检查环节，建议加强新员工培训和班组长复核。
```

### management_decision

返回：

```text
根据当前上传数据和异常记录，建议优先关注高风险设备和异常频发工序，并将老员工经验沉淀为标准培训材料。
```

---

## 7. 数据库设计

数据库使用 SQLite。

数据库文件：

```text
backend/app.db
```

---

# 7.1 users 表

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

预置数据：

```sql
INSERT INTO users (username, password, role, name, department, position)
VALUES
('employee', '123456', 'employee', '张三', '一号产线', '设备操作员'),
('admin', '123456', 'admin', '李经理', '生产管理部', '管理人员'),
('worker2', '123456', 'employee', '王师傅', '二号产线', '资深操作员'),
('worker3', '123456', 'employee', '赵工', '维修班组', '维修工程师');
```

---

# 7.2 uploaded_files 表

```sql
CREATE TABLE uploaded_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT NOT NULL,
  file_url TEXT,
  uploader_id INTEGER,
  uploader_name TEXT,
  device_name TEXT,
  process_name TEXT,
  scene_type TEXT,
  is_abnormal INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'none',
  tags TEXT,
  description TEXT,
  text_content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

# 7.3 knowledge_items 表

```sql
CREATE TABLE knowledge_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  knowledge_type TEXT,
  source_file_id INTEGER,
  device_name TEXT,
  process_name TEXT,
  contributor_id INTEGER,
  contributor_name TEXT,
  tags TEXT,
  status TEXT DEFAULT 'pending',
  summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

# 7.4 contribution_scores 表

```sql
CREATE TABLE contribution_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_name TEXT,
  action_type TEXT,
  points INTEGER,
  related_file_id INTEGER,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

# 7.5 agent_messages 表

```sql
CREATE TABLE agent_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  role_type TEXT,
  question TEXT,
  answer TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

# 7.6 abnormal_cases 表

```sql
CREATE TABLE abnormal_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_file_id INTEGER,
  title TEXT,
  device_name TEXT,
  process_name TEXT,
  risk_level TEXT,
  uploader_id INTEGER,
  uploader_name TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  ai_suggestion TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. 后端业务逻辑设计

---

# 8.1 上传逻辑

伪代码：

```python
def upload_file(file, form_data):
    # 1. 校验用户
    user = get_user(form_data.user_id)

    # 2. 保存文件
    saved_path = save_file_to_uploads(file)

    # 3. 写入 uploaded_files 表
    uploaded_file = create_uploaded_file_record(
        title=form_data.title,
        file_name=file.filename,
        file_type=form_data.file_type,
        file_url=saved_path,
        uploader_id=user.id,
        uploader_name=user.name,
        device_name=form_data.device_name,
        process_name=form_data.process_name,
        scene_type=form_data.scene_type,
        is_abnormal=form_data.is_abnormal,
        risk_level=form_data.risk_level,
        tags=form_data.tags,
        description=form_data.description,
        text_content=form_data.text_content
    )

    # 4. 自动生成知识条目
    knowledge_item = create_knowledge_item_from_file(uploaded_file)

    # 5. 如果异常，则生成异常案例
    if uploaded_file.is_abnormal:
        create_abnormal_case(uploaded_file)

    # 6. 增加贡献积分
    points = calculate_points(uploaded_file)
    add_contribution_score(user, uploaded_file, points)

    # 7. 返回结果
    return {
        "file": uploaded_file,
        "knowledge_item": knowledge_item,
        "score_added": points
    }
```

---

# 8.2 自动生成知识条目规则

根据上传数据生成知识标题：

```text
{设备名称} - {工序名称} - {上传标题}
```

例如：

```text
设备A - 开机检查 - 设备A开机前检查流程
```

知识类型规则：

| scene_type | knowledge_type |
|---|---|
| standard_operation | 标准操作 |
| abnormal_operation | 异常案例 |
| training_experience | 培训经验 |
| fault_case | 故障处理 |
| quality_inspection | 质检记录 |
| maintenance_record | 维修经验 |
| other | 其他 |

summary 生成规则：

当前 Demo 不调用 AI，直接模板生成：

```text
该知识条目来源于员工 {贡献人} 上传的 {文件类型} 数据，关联设备为 {设备名称}，关联工序为 {工序名称}，标签为 {标签}。
```

---

# 8.3 积分计算规则

```python
def calculate_points(uploaded_file):
    points = 5

    if uploaded_file.file_type == "video":
        points += 5

    if uploaded_file.scene_type in ["standard_operation", "training_experience"]:
        points += 5

    if uploaded_file.is_abnormal:
        points += 10

    if uploaded_file.risk_level == "high":
        points += 5

    if uploaded_file.risk_level == "critical":
        points += 10

    return points
```

---

# 8.4 异常案例生成规则

如果 `is_abnormal=true`，自动写入 `abnormal_cases`。

ai_suggestion 可以模板生成：

```text
该异常与 {设备名称} 的 {工序名称} 环节相关，建议班组长复核该操作，并将相关经验纳入培训材料。
```

如果风险等级是 high/critical，建议：

```text
该异常风险等级较高，建议暂停相关操作，完成现场复核后再恢复生产。
```

---

# 8.5 图谱生成规则

图谱不需要单独存表，可根据已有数据动态生成。

从最近 N 条 uploaded_files 和 knowledge_items 中生成：

节点：

1. 员工节点。
2. 文件节点。
3. 知识节点。
4. 设备节点。
5. 工序节点。
6. 异常节点。

边：

1. 员工 -> 文件：上传。
2. 文件 -> 知识：生成。
3. 知识 -> 设备：关联设备。
4. 知识 -> 工序：关联工序。
5. 异常案例 -> 工序：异常发生于。

---

## 9. 前端项目结构设计

推荐目录：

```text
frontend/
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router/
│   │   └── index.tsx
│   ├── api/
│   │   ├── request.ts
│   │   ├── auth.ts
│   │   ├── upload.ts
│   │   ├── dashboard.ts
│   │   ├── knowledge.ts
│   │   └── agent.ts
│   ├── store/
│   │   └── userStore.ts
│   ├── layouts/
│   │   ├── EmployeeLayout.tsx
│   │   └── AdminLayout.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── employee/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Upload.tsx
│   │   │   ├── Assistant.tsx
│   │   │   └── Contribution.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── Knowledge.tsx
│   │       ├── Graph.tsx
│   │       ├── Abnormal.tsx
│   │       ├── Ranking.tsx
│   │       └── DecisionAgent.tsx
│   ├── components/
│   │   ├── StatCard.tsx
│   │   ├── FileTypeTag.tsx
│   │   ├── RiskTag.tsx
│   │   ├── UploadForm.tsx
│   │   ├── RecentUploadList.tsx
│   │   ├── ContributionRanking.tsx
│   │   ├── KnowledgeGraph.tsx
│   │   └── AgentChat.tsx
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── global.css
```

---

## 10. 后端项目结构设计

推荐目录：

```text
backend/
├── requirements.txt
├── main.py
├── app.db
├── uploads/
├── app/
│   ├── __init__.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── seed.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── upload.py
│   │   ├── files.py
│   │   ├── knowledge.py
│   │   ├── dashboard.py
│   │   └── agent.py
│   └── services/
│       ├── file_service.py
│       ├── knowledge_service.py
│       ├── score_service.py
│       ├── graph_service.py
│       └── agent_service.py
```

---

## 11. 前端视觉风格

### 11.1 整体风格

工业科技风，但不要太花。

建议：

- 背景：浅色管理后台风格，管理大屏局部使用深色卡片。
- 主色：蓝色/青色。
- 强调色：橙色用于中风险，红色用于高风险。
- 卡片：圆角、轻阴影。
- 数据看板：数字大、单位清楚。
- 图谱：节点颜色区分类型。

### 11.2 员工端风格

- 简洁。
- 大按钮。
- 操作明确。
- 上传页面重点突出。

### 11.3 管理端风格

- 数据密度高。
- 有看板感。
- 图表和列表结合。
- 适合演示投屏。

---

## 12. Demo 数据设计

为了路演效果，系统启动时需要初始化一批 seed 数据。

### 12.1 设备

```text
设备A：自动上料机
设备B：轧制设备
设备C：质检视觉工位
设备D：包装机械臂
```

### 12.2 工序

```text
开机检查
上料操作
运行监控
异常停机处理
产品质检
设备维护
安全复核
```

### 12.3 示例上传记录

1. 设备A开机前安全锁检查视频。
2. 设备B运行中报警图片。
3. 轧制设备润滑系统维护经验文档。
4. 新员工上料操作培训音频。
5. 产品表面划痕质检图片。
6. 机械臂异常停机处理记录。
7. 未佩戴手套的错误操作图片。
8. 包装工位标准作业流程 PDF。

### 12.4 示例员工

```text
张三：一号产线，设备操作员
王师傅：二号产线，资深操作员
赵工：维修班组，维修工程师
李经理：生产管理部，管理员
刘班长：一号产线，班组长
```

---

## 13. 启动方式

### 13.1 后端启动

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows 使用 venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端地址：

```text
http://localhost:8000
```

API 文档：

```text
http://localhost:8000/docs
```

### 13.2 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端地址：

```text
http://localhost:5173
```

---

## 14. 环境变量设计

后端 `.env`：

```env
APP_NAME=Industrial Multimodal Demo
DATABASE_URL=sqlite:///./app.db
UPLOAD_DIR=uploads
AGENT_MODE=mock
AGENT_API_URL=
AGENT_API_KEY=
```

前端 `.env`：

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 15. 给代码 Agent 的开发任务拆分

请代码 Agent 严格按下面顺序开发，不要一上来做复杂 AI。

---

# 阶段 1：后端基础

1. 创建 FastAPI 项目。
2. 配置 SQLite 和 SQLAlchemy。
3. 创建 users、uploaded_files、knowledge_items、contribution_scores、agent_messages、abnormal_cases 表。
4. 编写 seed 初始化逻辑。
5. 实现登录接口。
6. 实现文件上传接口。
7. 实现文件列表和详情接口。
8. 实现知识条目列表接口。
9. 实现贡献排行榜接口。
10. 实现 dashboard summary 接口。
11. 实现 graph 接口。
12. 实现 agent chat mock 接口。

验收标准：

- `http://localhost:8000/docs` 能看到所有接口。
- 使用 employee/123456 能登录。
- 上传文件后，数据库中新增 uploaded_files、knowledge_items、contribution_scores。
- 如果 is_abnormal=true，数据库中新增 abnormal_cases。
- dashboard 数据能随上传变化。

---

# 阶段 2：前端基础

1. 创建 React + Vite + TypeScript 项目。
2. 安装 Ant Design、ECharts、Axios、React Router。
3. 实现登录页。
4. 实现路由守卫。
5. 实现员工端布局。
6. 实现管理端布局。
7. 实现 API 请求封装。

验收标准：

- 能访问 `/login`。
- 员工登录跳转 `/employee/dashboard`。
- 管理员登录跳转 `/admin/dashboard`。
- 页面刷新后能保持登录状态。

---

# 阶段 3：员工端

1. 实现员工首页。
2. 实现多模态上传页。
3. 实现上传成功后刷新记录。
4. 实现员工 AI 助手页。
5. 实现我的贡献页。

验收标准：

- 员工能上传图片、视频、音频、文档。
- 上传时能填写设备、工序、标签、风险等级。
- 上传成功后能看到成功提示和积分。
- 员工首页数据能刷新。
- AI 助手能返回 mock 答案。

---

# 阶段 4：管理端

1. 实现管理驾驶舱。
2. 实现实时上传数据流。
3. 实现贡献排行榜。
4. 实现异常案例列表。
5. 实现知识库页面。
6. 实现知识图谱页面。
7. 实现管理决策 Agent 页面。

验收标准：

- 管理端能看到统计卡片。
- 上传新文件后，管理端刷新能看到新记录。
- 知识图谱中出现员工、文件、知识、设备、工序节点。
- 异常案例页能看到 abnormal 文件。
- 排行榜能根据积分排序。
- 决策 Agent 能返回结构化建议。

---

# 阶段 5：演示优化

1. 增加 loading 状态。
2. 增加空状态。
3. 增加错误提示。
4. 增加上传进度条。
5. 增加文件预览。
6. 增加图表动画。
7. 增加 Demo 数据。
8. 增加 README。

验收标准：

- 系统可稳定演示 5 分钟。
- 页面无明显报错。
- 核心 Demo 流程完整。

---

## 16. Demo 演示脚本

### 16.1 演示主线

1. 打开登录页。
2. 使用员工账号登录。
3. 进入员工端首页，展示“上传、问答、贡献”三个入口。
4. 进入多模态上传页。
5. 上传一个“设备A错误操作图片/视频”。
6. 填写：
   - 设备：设备A
   - 工序：开机检查
   - 场景：异常操作
   - 风险等级：high
   - 标签：安全锁、开机、异常
7. 点击上传。
8. 系统提示：
   - 上传成功
   - 生成知识条目
   - 积分增加
   - 异常案例同步
9. 切换到管理端。
10. 展示管理驾驶舱：
    - 今日新增上传 +1
    - 异常案例 +1
    - 知识条目 +1
11. 打开知识图谱。
12. 展示新节点：
    - 张三 -> 上传 -> 错误操作视频 -> 生成 -> 异常案例 -> 关联设备A/开机检查
13. 打开贡献排行榜。
14. 展示张三积分提升。
15. 打开管理决策 Agent。
16. 提问：
    - 最近哪个工序异常最多？
17. Agent 返回管理建议。
18. 总结系统价值：
    - 数据采集闭环。
    - 知识自动沉淀。
    - 异常案例可视化。
    - 员工贡献可量化。
    - Agent 支持管理决策。

---

## 17. README 要求

项目根目录需要包含 README.md。

README 包含：

1. 项目介绍。
2. 技术栈。
3. 功能列表。
4. 项目结构。
5. 启动方式。
6. 默认账号。
7. API 地址。
8. Demo 演示流程。
9. 后续扩展方向。

默认账号写明：

```text
员工端：
employee / 123456

管理端：
admin / 123456
```

---

## 18. 关键验收清单

最终系统完成后，必须满足以下要求。

### 18.1 功能验收

- [ ] 能登录员工端。
- [ ] 能登录管理端。
- [ ] 员工能上传图片。
- [ ] 员工能上传视频。
- [ ] 员工能上传音频。
- [ ] 员工能上传文档。
- [ ] 员工能提交纯文本经验。
- [ ] 上传后能保存文件。
- [ ] 上传后能保存元数据。
- [ ] 上传后能自动生成知识条目。
- [ ] 上传后能自动增加积分。
- [ ] 异常上传能进入异常案例。
- [ ] 管理端能看到统计数据。
- [ ] 管理端能看到实时上传流。
- [ ] 管理端能看到知识库列表。
- [ ] 管理端能看到知识图谱。
- [ ] 管理端能看到贡献排行榜。
- [ ] 管理端能看到异常案例。
- [ ] Agent 问答能返回结果。

### 18.2 展示验收

- [ ] 管理端首页具有大屏感。
- [ ] 指标卡片清晰。
- [ ] 知识图谱节点颜色区分明确。
- [ ] 风险等级颜色明显。
- [ ] 上传成功反馈明显。
- [ ] 页面无明显空白。
- [ ] 初始 seed 数据丰富。
- [ ] Demo 流程 5 分钟内可以完整讲完。

### 18.3 工程验收

- [ ] 前后端能分别启动。
- [ ] 前端 API 地址可配置。
- [ ] 后端上传目录自动创建。
- [ ] SQLite 数据库自动初始化。
- [ ] README 完整。
- [ ] 无硬编码绝对路径。
- [ ] 无明显控制台报错。

---

## 19. 后续扩展方向

当前 Demo 完成后，可以扩展：

1. 接入真实大模型 Agent API。
2. 接入真实 RAG 向量数据库。
3. 使用 MinIO 或云 OSS 存储文件。
4. 使用 Neo4j 构建真实知识图谱。
5. 使用 PaddleOCR 做图片文字识别。
6. 使用 Whisper 做语音转文字。
7. 使用视频抽帧 + 多模态模型分析视频。
8. 接入摄像头实时监控。
9. 加入管理员审核流程。
10. 加入企业微信/钉钉提醒。
11. 加入工单系统。
12. 加入真实权限管理。
13. 加入操作质量评分模型。
14. 加入员工培训路径生成。
15. 加入 SOP 版本管理。

---

## 20. 最终交付物

代码 Agent 最终需要交付：

```text
industrial-multimodal-demo/
├── README.md
├── frontend/
│   └── React 前端项目
└── backend/
    └── FastAPI 后端项目
```

必须保证：

1. README 中有启动步骤。
2. 前端能打开。
3. 后端能启动。
4. 登录能成功。
5. 上传能成功。
6. 管理端能看到上传结果。
7. Agent 页面能返回 mock 或外部 API 答案。

---

## 21. 给代码 Agent 的总提示词

下面这段可以直接复制给代码 Agent：

```text
请根据本 Markdown 设计文档，完整开发一个“工业现场多模态数据采集与智能管理平台 Demo”。

重要边界：
1. 当前版本不需要真实 RAG。
2. 当前版本不需要训练 AI 模型。
3. 当前版本不需要真实知识图谱数据库。
4. 当前版本需要真实完成多模态文件上传、元数据保存、知识条目自动生成、积分自动生成、管理端可视化展示。
5. Agent 模块先实现 mock 模式，同时预留 proxy 模式，可通过环境变量切换到外部 API。
6. 前端使用 React + Vite + TypeScript + Ant Design + ECharts。
7. 后端使用 FastAPI + SQLite + SQLAlchemy。
8. 文件存储到后端 uploads/ 目录。
9. 系统包含员工端和管理端两套页面。
10. 必须提供 README，写清启动方式和默认账号。

请严格按以下优先级开发：
第一，后端数据库和接口。
第二，前端登录和布局。
第三，员工端上传闭环。
第四，管理端大屏和图谱展示。
第五，Agent mock 问答。
第六，演示数据和 README。

验收标准：
1. employee/123456 登录后进入员工端。
2. admin/123456 登录后进入管理端。
3. 员工上传图片/视频/音频/文档后，后端保存文件和元数据。
4. 上传成功后自动生成知识条目。
5. 上传成功后自动增加贡献积分。
6. 如果标记为异常，则自动进入异常案例。
7. 管理端 dashboard 能看到总览指标、最近上传、异常案例、排行榜。
8. 知识图谱页面能根据数据库数据动态生成节点和边。
9. Agent 聊天页面能根据不同 role_type 返回不同 mock 答案。
10. 整个项目可以本地一键启动并演示。
```

---

## 22. 项目最核心的 Demo 价值

这个 Demo 不追求完整 AI 后端，而是突出四个能力：

1. **多模态数据入口**：工业现场的视频、图片、音频、文档和文本都能进入系统。
2. **知识沉淀闭环**：上传数据自动变成知识条目。
3. **管理可视化**：管理者能看到数据增长、异常案例、知识图谱和贡献排行。
4. **Agent 扩展能力**：AI 能力通过 API 接入，未来可以替换为真实 RAG、视觉模型和决策模型。

最终要让投资人看到：

```text
这个系统已经具备完整的数据入口和业务闭环，AI 能力可以通过 API 快速接入，后续具备很强的工业场景扩展空间。
```

---

## 23. 外部 Agent API 与 API Key 接入设计

本系统中的 Agent 不在前端直接调用大模型 API，而是采用：

```text
前端 Agent 页面
    ↓
后端 /api/agent/chat
    ↓
后端读取环境变量中的 API Key
    ↓
调用外部 Agent / 大模型 API
    ↓
后端把结果返回给前端
```

### 23.1 重要安全原则

必须遵守以下原则：

1. **API Key 只能放在后端环境变量中。**
2. **API Key 不能写死在前端代码里。**
3. **API Key 不能提交到 GitHub。**
4. **前端只请求自己的后端接口 `/api/agent/chat`。**
5. **后端再去请求真实 Agent API。**
6. **`.env` 文件必须加入 `.gitignore`。**
7. **README 只能提供 `.env.example`，不能包含真实 Key。**

错误做法：

```ts
// 严禁这样写在前端
const apiKey = "sk-xxxx";
```

正确做法：

```text
前端：只调用 http://后端地址/api/agent/chat
后端：从 os.getenv("AGENT_API_KEY") 读取 Key
```

### 23.2 后端环境变量设计

后端目录下需要提供两个文件：

```text
backend/.env.example
backend/.env
```

其中 `.env.example` 提交到仓库，内容如下：

```env
# 后端运行环境
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000

# 数据库
DATABASE_URL=sqlite:///./industrial_demo.db

# 文件上传目录
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=200

# Agent 模式：mock 或 proxy
# mock：不调用外部 API，直接返回模拟答案
# proxy：调用外部 Agent / 大模型 API
AGENT_MODE=mock

# OpenAI-Compatible API 配置
# 如果使用 OpenAI、DeepSeek、Qwen、硅基流动或其他兼容 OpenAI 格式的中转站，可以使用下面三个变量
AGENT_API_BASE_URL=https://api.openai.com/v1
AGENT_API_KEY=your_api_key_here
AGENT_MODEL=gpt-4o-mini

# API 超时时间，单位秒
AGENT_TIMEOUT_SECONDS=60

# 前端访问后端时允许的来源，开发环境可以使用 *，部署时建议写具体域名
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

`.env` 文件由实际部署者创建，内容示例：

```env
APP_ENV=production
APP_HOST=0.0.0.0
APP_PORT=8000
DATABASE_URL=sqlite:///./industrial_demo.db
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=200
AGENT_MODE=proxy
AGENT_API_BASE_URL=https://api.openai.com/v1
AGENT_API_KEY=sk-替换成真实key
AGENT_MODEL=gpt-4o-mini
AGENT_TIMEOUT_SECONDS=60
CORS_ORIGINS=https://your-domain.com,http://your-server-ip
```

### 23.3 前端环境变量设计

前端目录下需要提供：

```text
frontend/.env.example
frontend/.env.development
frontend/.env.production
```

`frontend/.env.example`：

```env
# 本地开发时后端地址
VITE_API_BASE_URL=http://localhost:8000

# 项目标题
VITE_APP_TITLE=工业现场多模态智能管理平台
```

`frontend/.env.production`：

```env
# 如果前后端同域部署，并且 Nginx 已将 /api 代理到后端，可以写空或写 /api 前缀方案
VITE_API_BASE_URL=
VITE_APP_TITLE=工业现场多模态智能管理平台
```

前端请求封装要求：

```ts
// frontend/src/api/request.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export const request = axios.create({
  baseURL,
  timeout: 60000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 23.4 Agent API 模式设计

后端 Agent 服务需要支持两种模式：

```text
AGENT_MODE=mock
AGENT_MODE=proxy
```

#### 23.4.1 mock 模式

用于本地开发、比赛演示、没有 API Key 的情况。

特点：

1. 不调用外部 API。
2. 根据 `role_type` 返回不同模板答案。
3. 永远不会因为 API Key 错误导致系统不可演示。

mock 返回示例：

```json
{
  "answer": "根据当前上传的 SOP 与异常案例记录，建议优先检查设备安全锁、急停按钮和上料前状态确认流程。",
  "role_type": "employee_assistant",
  "mode": "mock",
  "sources": ["设备A开机流程SOP", "历史异常案例#001"],
  "suggestions": ["查看相关SOP", "上传现场图片", "联系班组长复核"]
}
```

#### 23.4.2 proxy 模式

用于真实接入外部 Agent API。

后端接口仍然是：

```http
POST /api/agent/chat
```

前端请求体：

```json
{
  "role_type": "management_decision",
  "question": "最近哪个工序异常最多？",
  "context": {
    "device_name": "设备A",
    "process_name": "开机流程"
  }
}
```

后端处理流程：

```text
1. 接收前端问题。
2. 从数据库查询最近上传数据、异常案例、知识条目和排行榜摘要。
3. 拼接 system prompt。
4. 读取 AGENT_API_BASE_URL、AGENT_API_KEY、AGENT_MODEL。
5. 调用外部 OpenAI-Compatible Chat Completions API。
6. 解析返回结果。
7. 保存对话记录到 agent_messages 表。
8. 返回给前端。
```

### 23.5 OpenAI-Compatible API 调用格式

为了兼容 OpenAI、DeepSeek、Qwen、硅基流动或其他中转站，建议后端统一使用 OpenAI-Compatible 格式。

请求地址：

```text
{AGENT_API_BASE_URL}/chat/completions
```

请求头：

```http
Authorization: Bearer ${AGENT_API_KEY}
Content-Type: application/json
```

请求体：

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "你是工业现场智能管理平台的 Agent，请根据系统数据回答问题。"
    },
    {
      "role": "user",
      "content": "最近哪个工序异常最多？"
    }
  ],
  "temperature": 0.3
}
```

后端 Python 示例：

```python
# backend/app/services/agent_service.py
import os
import httpx

AGENT_MODE = os.getenv("AGENT_MODE", "mock")
AGENT_API_BASE_URL = os.getenv("AGENT_API_BASE_URL", "")
AGENT_API_KEY = os.getenv("AGENT_API_KEY", "")
AGENT_MODEL = os.getenv("AGENT_MODEL", "gpt-4o-mini")
AGENT_TIMEOUT_SECONDS = int(os.getenv("AGENT_TIMEOUT_SECONDS", "60"))


def build_system_prompt(role_type: str, dashboard_summary: dict | None = None) -> str:
    base = """
你是一个工业现场多模态智能管理平台中的智能 Agent。
当前系统不是完整 RAG，只能基于后端传入的上传记录、知识条目、异常案例、员工贡献排行等摘要数据进行回答。
回答要面向工业现场，结构清晰，给出结论、依据和建议。
"""
    role_map = {
        "new_employee_training": "你的角色是新员工培训助手，负责解释 SOP、推荐学习路径和提示安全注意事项。",
        "employee_assistant": "你的角色是员工操作问答助手，负责回答现场操作问题。",
        "quality_supervision": "你的角色是工作质量监督助手，负责分析异常操作和质量风险。",
        "abnormal_alert": "你的角色是异常操作提醒助手，负责识别和解释异常案例。",
        "management_decision": "你的角色是管理决策支持助手，负责总结数据趋势并给管理建议。"
    }
    return base + "\n" + role_map.get(role_type, "你的角色是通用工业现场助手。")


def mock_agent_answer(role_type: str, question: str) -> dict:
    templates = {
        "new_employee_training": "建议新员工先学习设备结构、安全规范、标准开机流程和常见异常案例，再进行实操。",
        "employee_assistant": "建议按照 SOP 先检查设备状态、确认安全锁、查看报警代码，并保留现场图片作为记录。",
        "quality_supervision": "当前操作质量风险主要来自流程跳步、检查项遗漏和异常记录不完整，建议加强关键步骤复核。",
        "abnormal_alert": "该情况可能属于中风险异常，建议立即停止当前操作并通知班组长复核。",
        "management_decision": "从当前数据看，异常主要集中在开机前检查和上料确认环节，建议针对新员工开展专项培训。"
    }
    return {
        "answer": templates.get(role_type, "系统已收到问题，建议结合 SOP 和历史案例进一步确认。"),
        "role_type": role_type,
        "mode": "mock",
        "sources": ["模拟SOP条目", "模拟异常案例", "模拟上传记录"],
        "suggestions": ["查看相关SOP", "查看异常案例", "上传现场数据"]
    }


async def call_agent(role_type: str, question: str, context: dict | None = None) -> dict:
    if AGENT_MODE == "mock":
        return mock_agent_answer(role_type, question)

    if not AGENT_API_BASE_URL or not AGENT_API_KEY:
        # 生产演示时不能直接崩溃，降级到 mock
        fallback = mock_agent_answer(role_type, question)
        fallback["mode"] = "mock_fallback_missing_api_key"
        return fallback

    system_prompt = build_system_prompt(role_type, context)
    url = AGENT_API_BASE_URL.rstrip("/") + "/chat/completions"

    payload = {
        "model": AGENT_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ],
        "temperature": 0.3
    }

    headers = {
        "Authorization": f"Bearer {AGENT_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=AGENT_TIMEOUT_SECONDS) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            answer = data["choices"][0]["message"]["content"]
            return {
                "answer": answer,
                "role_type": role_type,
                "mode": "proxy",
                "sources": context.get("sources", []) if context else [],
                "suggestions": ["查看知识条目", "查看异常案例", "继续追问"]
            }
    except Exception as e:
        fallback = mock_agent_answer(role_type, question)
        fallback["mode"] = "mock_fallback_api_error"
        fallback["error_message"] = str(e)
        return fallback
```

### 23.6 Agent Prompt 设计

后端调用外部 API 时，需要根据不同 Agent 类型拼接不同 system prompt。

#### 新员工培训助手 prompt

```text
你是工业现场新员工培训助手。
你的任务是根据系统提供的 SOP、上传记录、异常案例摘要，为新员工提供清晰、分步骤、可执行的学习建议。
回答必须包含：
1. 标准操作步骤
2. 安全注意事项
3. 常见错误
4. 推荐学习内容
5. 是否需要请班组长复核
不要编造不存在的具体文件编号，如果上下文不足，要说明“当前系统数据不足”。
```

#### 员工操作问答助手 prompt

```text
你是工业现场员工操作问答助手。
你的任务是帮助一线员工解决现场操作问题。
回答必须简洁、明确、可执行。
如果问题涉及安全风险，必须优先提示停止操作、确认安全状态、联系班组长。
回答结构：
1. 判断结论
2. 建议操作步骤
3. 风险提醒
4. 需要上传或补充的信息
```

#### 工作质量监督 prompt

```text
你是工业现场工作质量监督 Agent。
你的任务是基于上传记录、异常案例、员工贡献记录，对操作质量进行分析。
回答必须包含：
1. 当前风险点
2. 可能原因
3. 涉及工序
4. 改进建议
5. 管理者需要关注的指标
```

#### 异常操作提醒 prompt

```text
你是工业现场异常操作提醒 Agent。
你的任务是根据用户描述或上传记录判断是否存在异常风险。
风险等级分为 low、medium、high。
如果无法确定，输出 medium，并建议人工复核。
回答结构：
1. 风险等级
2. 异常原因
3. 立即处理建议
4. 后续记录建议
```

#### 管理决策支持 prompt

```text
你是工业现场管理决策支持 Agent。
你的任务是根据系统数据为管理层提供决策建议。
回答必须包含：
1. 管理结论
2. 数据依据
3. 主要风险
4. 优先级排序
5. 下一步行动建议
不要只给泛泛建议，必须结合传入的数据摘要。
```

### 23.7 后端 Agent 接口详细设计

接口：

```http
POST /api/agent/chat
```

请求体：

```json
{
  "role_type": "management_decision",
  "question": "最近哪个工序异常最多？",
  "context": {
    "device_name": "设备A",
    "process_name": "开机流程"
  }
}
```

响应体：

```json
{
  "answer": "从当前上传记录和异常案例看，异常主要集中在开机前检查环节……",
  "role_type": "management_decision",
  "mode": "proxy",
  "sources": ["最近上传记录", "异常案例统计", "知识条目摘要"],
  "suggestions": ["查看异常案例", "安排专项培训", "导出周报"]
}
```

后端要保存到 `agent_messages` 表：

```text
user_id
role_type
question
answer
mode
created_at
```

### 23.8 API Key 配置常见问题处理

后端启动时需要打印非敏感配置：

```text
AGENT_MODE=proxy
AGENT_API_BASE_URL=https://xxx/v1
AGENT_MODEL=xxx
AGENT_API_KEY=已配置
```

严禁打印完整 API Key。

可以只显示：

```text
AGENT_API_KEY=sk-****abcd
```

如果 Key 未配置：

```text
AGENT_API_KEY=未配置，系统将自动降级为 mock 模式
```

如果外部 API 报错：

1. 后端不要崩溃。
2. 返回 mock_fallback_api_error。
3. 前端显示“当前为演示模式，外部 Agent API 暂不可用”。
4. 管理端仍然可以继续演示。

---

## 24. 部署成公网可访问网站的设计

本项目最终要支持部署成可以通过浏览器访问的网站，例如：

```text
http://服务器IP
https://your-domain.com
```

部署目标：

```text
用户访问网站
    ↓
Nginx 提供前端静态页面
    ↓
前端请求 /api
    ↓
Nginx 反向代理到 FastAPI 后端
    ↓
后端访问 SQLite / uploads / Agent API
```

### 24.1 推荐部署方案

推荐使用一台 Linux 云服务器部署：

```text
Ubuntu 22.04 / Ubuntu 24.04
2 核 CPU
4GB 内存
40GB 磁盘
开放 80、443、8000 端口
```

正式展示建议：

```text
Nginx + 前端静态文件 + FastAPI + systemd
```

开发调试可以：

```text
前端 npm run dev
后端 uvicorn app.main:app --reload
```

公网演示建议不要用开发服务器直接暴露给用户。

### 24.2 服务器目录规划

服务器上建议放到：

```text
/opt/industrial-multimodal-demo/
├── frontend/
│   └── dist/                 # 前端打包后的静态文件
├── backend/
│   ├── app/
│   ├── uploads/              # 上传文件目录
│   ├── industrial_demo.db     # SQLite 数据库
│   ├── .env                  # 后端环境变量
│   └── venv/                 # Python 虚拟环境
└── deploy/
    ├── nginx.conf
    └── industrial-demo.service
```

### 24.3 前端打包

本地或服务器执行：

```bash
cd frontend
npm install
npm run build
```

打包后生成：

```text
frontend/dist/
```

`dist` 目录由 Nginx 直接提供。

### 24.4 后端生产启动

进入后端：

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

创建 `.env`：

```bash
cp .env.example .env
nano .env
```

生产 `.env` 示例：

```env
APP_ENV=production
APP_HOST=0.0.0.0
APP_PORT=8000
DATABASE_URL=sqlite:///./industrial_demo.db
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=200
AGENT_MODE=proxy
AGENT_API_BASE_URL=https://api.openai.com/v1
AGENT_API_KEY=sk-替换成真实key
AGENT_MODEL=gpt-4o-mini
AGENT_TIMEOUT_SECONDS=60
CORS_ORIGINS=https://your-domain.com,http://your-server-ip
```

手动测试启动：

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

浏览器访问：

```text
http://服务器IP:8000/docs
```

如果能看到 FastAPI Swagger 页面，说明后端启动成功。

### 24.5 使用 systemd 托管后端

创建服务文件：

```bash
sudo nano /etc/systemd/system/industrial-demo.service
```

内容：

```ini
[Unit]
Description=Industrial Multimodal Demo FastAPI Service
After=network.target

[Service]
User=root
WorkingDirectory=/opt/industrial-multimodal-demo/backend
EnvironmentFile=/opt/industrial-multimodal-demo/backend/.env
ExecStart=/opt/industrial-multimodal-demo/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable industrial-demo
sudo systemctl start industrial-demo
```

查看状态：

```bash
sudo systemctl status industrial-demo
```

查看日志：

```bash
sudo journalctl -u industrial-demo -f
```

注意：systemd 中后端只监听 `127.0.0.1:8000`，不直接暴露给公网，由 Nginx 代理访问，更安全。

### 24.6 Nginx 部署前端和代理后端

安装 Nginx：

```bash
sudo apt update
sudo apt install -y nginx
```

创建 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/industrial-demo
```

如果只有 IP，没有域名：

```nginx
server {
    listen 80;
    server_name _;

    client_max_body_size 200M;

    root /opt/industrial-multimodal-demo/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8000/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/industrial-demo /etc/nginx/sites-enabled/industrial-demo
sudo nginx -t
sudo systemctl reload nginx
```

访问：

```text
http://服务器IP
```

### 24.7 如果有域名，配置 HTTPS

如果有域名，例如：

```text
demo.example.com
```

需要先在域名 DNS 中添加 A 记录：

```text
demo.example.com → 服务器公网 IP
```

然后安装 certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
```

申请证书：

```bash
sudo certbot --nginx -d demo.example.com
```

完成后访问：

```text
https://demo.example.com
```

### 24.8 云服务器安全组配置

云服务器控制台需要开放：

```text
TCP 22：SSH 登录
TCP 80：HTTP 网站访问
TCP 443：HTTPS 网站访问
```

如果使用 Nginx 代理后端，不建议开放：

```text
TCP 8000
```

如果只是临时调试，可以短暂开放 8000，调试完关闭。

### 24.9 文件上传访问设计

后端需要把上传文件目录映射成静态访问路径。

FastAPI 示例：

```python
from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

上传成功后返回：

```json
{
  "file_url": "/uploads/2026/05/xxx.mp4"
}
```

前端展示文件时：

```ts
const fullUrl = file.file_url.startsWith('http')
  ? file.file_url
  : `${import.meta.env.VITE_API_BASE_URL || ''}${file.file_url}`;
```

如果同域部署，`file_url` 可以直接使用 `/uploads/xxx`。

### 24.10 SQLite 部署注意事项

Demo 阶段可以使用 SQLite，但要注意：

1. 数据库文件要放在后端目录下。
2. 后端进程必须对数据库文件有读写权限。
3. 不要频繁手动删除数据库。
4. 需要定期备份 `industrial_demo.db` 和 `uploads/`。

备份命令示例：

```bash
cd /opt/industrial-multimodal-demo/backend
mkdir -p backups
tar -czvf backups/backup_$(date +%Y%m%d_%H%M%S).tar.gz industrial_demo.db uploads/
```

### 24.11 一键部署脚本建议

建议代码 Agent 提供：

```text
deploy/deploy.sh
```

脚本功能：

```text
1. 拉取代码或确认当前目录。
2. 安装前端依赖并打包。
3. 创建后端虚拟环境。
4. 安装 Python 依赖。
5. 创建 uploads 目录。
6. 初始化数据库。
7. 安装 systemd 服务。
8. 配置 Nginx。
9. 重启服务。
```

脚本骨架：

```bash
#!/usr/bin/env bash
set -e

PROJECT_DIR=/opt/industrial-multimodal-demo

cd $PROJECT_DIR/frontend
npm install
npm run build

cd $PROJECT_DIR/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
mkdir -p uploads

if [ ! -f .env ]; then
  cp .env.example .env
  echo "请编辑 backend/.env，填写 AGENT_API_KEY 等配置"
fi

sudo systemctl daemon-reload
sudo systemctl restart industrial-demo || true
sudo nginx -t
sudo systemctl reload nginx

echo "部署完成，请访问服务器 IP 或域名。"
```

### 24.12 Docker Compose 部署备选方案

如果希望部署更统一，也可以提供 Docker Compose。

目录：

```text
docker-compose.yml
frontend/Dockerfile
backend/Dockerfile
nginx/default.conf
```

`docker-compose.yml` 示例：

```yaml
version: "3.9"

services:
  backend:
    build: ./backend
    container_name: industrial-demo-backend
    env_file:
      - ./backend/.env
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/industrial_demo.db:/app/industrial_demo.db
    expose:
      - "8000"
    restart: always

  frontend:
    build: ./frontend
    container_name: industrial-demo-frontend
    expose:
      - "80"
    restart: always

  nginx:
    image: nginx:stable
    container_name: industrial-demo-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ./backend/uploads:/app/uploads
    depends_on:
      - backend
      - frontend
    restart: always
```

Docker 方式适合后续扩展，但对于比赛 Demo，Nginx + systemd 更容易排错。

### 24.13 部署验收标准

公网部署完成后，需要满足：

1. 浏览器访问 `http://服务器IP` 能打开前端首页。
2. `employee/123456` 能登录员工端。
3. `admin/123456` 能登录管理端。
4. 员工端能上传图片、视频、音频、文档。
5. 管理端能看到上传记录。
6. 管理端知识图谱能出现新增节点。
7. Agent 页面在 `AGENT_MODE=mock` 时能返回模拟答案。
8. Agent 页面在 `AGENT_MODE=proxy` 且 Key 正确时能返回外部 API 答案。
9. 刷新页面不会 404。
10. 上传文件能通过 `/uploads/xxx` 访问或预览。
11. 后端服务重启后数据不丢失。
12. Nginx 日志和 systemd 日志能正常查看。

---

## 25. 代码 Agent 需要额外完成的 API Key 与部署任务

在原有开发任务之外，代码 Agent 必须额外完成以下内容。

### 25.1 API Key 接入任务

```text
[ ] 后端支持读取 backend/.env。
[ ] 后端提供 backend/.env.example。
[ ] 后端实现 AGENT_MODE=mock。
[ ] 后端实现 AGENT_MODE=proxy。
[ ] 后端实现 OpenAI-Compatible /chat/completions 调用。
[ ] API Key 只允许后端读取，不能出现在前端代码中。
[ ] 外部 API 调用失败时自动降级 mock。
[ ] 后端日志不能输出完整 API Key。
[ ] 前端 Agent 页面显示当前返回模式：mock / proxy / fallback。
[ ] README 写清楚如何填写 AGENT_API_BASE_URL、AGENT_API_KEY、AGENT_MODEL。
```

### 25.2 部署任务

```text
[ ] 前端支持 npm run build。
[ ] 前端生产环境支持同域 /api 请求。
[ ] 后端支持 uvicorn 生产启动。
[ ] 后端支持 /uploads 静态文件访问。
[ ] 提供 Nginx 配置示例。
[ ] 提供 systemd 服务文件示例。
[ ] 提供部署步骤 README。
[ ] 提供 .gitignore，排除 .env、uploads 大文件、数据库备份。
[ ] 提供可选 deploy/deploy.sh。
[ ] 写清楚云服务器安全组需要开放 80/443/22。
```

---

## 26. 更新后的给代码 Agent 的总提示词

下面这段是更新后的完整提示词，可以直接复制给代码 Agent：

```text
请根据本 Markdown 设计文档，完整开发一个“工业现场多模态数据采集与智能管理平台 Demo”。

重要边界：
1. 当前版本不需要真实 RAG。
2. 当前版本不需要训练 AI 模型。
3. 当前版本不需要真实知识图谱数据库。
4. 当前版本需要真实完成多模态文件上传、元数据保存、知识条目自动生成、积分自动生成、管理端可视化展示。
5. Agent 模块必须支持 mock 模式和 proxy 模式。
6. mock 模式不调用外部 API，返回可演示模板答案。
7. proxy 模式通过后端读取环境变量中的 AGENT_API_KEY，调用 OpenAI-Compatible API。
8. API Key 只能放在 backend/.env，不能写入前端，不能提交到 Git。
9. 前端使用 React + Vite + TypeScript + Ant Design + ECharts。
10. 后端使用 FastAPI + SQLite + SQLAlchemy。
11. 文件存储到后端 uploads/ 目录。
12. 系统包含员工端和管理端两套页面。
13. 必须提供 README，写清本地启动、API Key 配置、mock/proxy 切换、公网部署方式。
14. 必须提供 .env.example、Nginx 配置示例、systemd 服务示例。
15. 系统后续要能部署成公网可访问网站，推荐 Nginx 托管前端并反向代理 /api 到后端。

请严格按以下优先级开发：
第一，后端数据库和接口。
第二，前端登录和布局。
第三，员工端上传闭环。
第四，管理端大屏和图谱展示。
第五，Agent mock 问答。
第六，Agent proxy API Key 接入。
第七，演示数据和 README。
第八，部署配置文件和部署说明。

验收标准：
1. employee/123456 登录后进入员工端。
2. admin/123456 登录后进入管理端。
3. 员工上传图片/视频/音频/文档后，后端保存文件和元数据。
4. 上传成功后自动生成知识条目。
5. 上传成功后自动增加贡献积分。
6. 如果标记为异常，则自动进入异常案例。
7. 管理端 dashboard 能看到总览指标、最近上传、异常案例、排行榜。
8. 知识图谱页面能根据数据库数据动态生成节点和边。
9. Agent 聊天页面能根据不同 role_type 返回不同 mock 答案。
10. backend/.env 中配置 AGENT_MODE=proxy、AGENT_API_BASE_URL、AGENT_API_KEY、AGENT_MODEL 后，Agent 能调用外部 API。
11. 外部 API 调用失败时，系统自动降级 mock，不能导致页面崩溃。
12. 前端打包后可以由 Nginx 访问。
13. Nginx 能将 /api/ 代理到 FastAPI 后端。
14. 上传文件能通过 /uploads/ 路径访问。
15. README 包含本地启动步骤、API Key 配置步骤、服务器部署步骤、默认账号。
```

---

## 23. 最新需求更新：双端视觉风格规范

本节为最新需求，代码 Agent 必须优先执行。系统仍然分为两个端：员工端和老板/管理端，但两个端的视觉风格要明显区分。

### 23.1 员工端视觉定位

员工端定位：**简洁、亲和、低学习成本、适合现场员工快速操作**。

设计关键词：

- 简洁
- 明亮
- 轻量
- 低压迫感
- 操作按钮清晰
- 卡片式布局
- 少用复杂图表
- 适合手机、平板、工位电脑

### 23.2 员工端配色：马克龙配色

员工端采用“马克龙配色”，即低饱和、高明度、柔和风格。颜色不能太刺眼，整体要温和、干净。

推荐色板：

| 用途 | 色值 | 说明 |
|---|---:|---|
| 页面背景 | `#F8FAFC` | 浅灰白背景，干净简洁 |
| 主色 | `#A7C7E7` | 马卡龙浅蓝，用于主按钮、重点状态 |
| 辅助色 1 | `#B8E0D2` | 马卡龙薄荷绿，用于成功状态、贡献积分 |
| 辅助色 2 | `#F7D6E0` | 马卡龙粉，用于温和提示 |
| 辅助色 3 | `#FFF1B8` | 马卡龙浅黄，用于提醒但不制造紧张感 |
| 文本主色 | `#334155` | 深灰蓝，保证可读性 |
| 文本次色 | `#64748B` | 次级说明文字 |
| 卡片背景 | `#FFFFFF` | 白色卡片 |
| 边框 | `#E2E8F0` | 浅灰边框 |
| 危险色 | `#FCA5A5` | 柔和红色，用于异常提示 |

员工端不要使用大面积黑色、深蓝、强紫、霓虹光效。员工端不是科技大屏，而是实用工具。

### 23.3 员工端页面风格要求

#### 23.3.1 登录页

布局：

- 居中卡片登录。
- 背景使用浅色渐变：`#F8FAFC` 到 `#E0F2FE`。
- 登录卡片圆角 `20px`。
- 阴影轻柔。
- 标题文案：`工业现场智能助手`。
- 副标题文案：`多模态数据上传 · 现场问答 · 知识贡献`。

#### 23.3.2 员工首页

布局：

- 顶部欢迎区。
- 中部 4 个快捷入口。
- 底部最近上传记录。

快捷入口：

1. 上传现场数据
2. 询问操作助手
3. 查看我的贡献
4. 学习标准流程

卡片风格：

- 白底。
- 圆角 `16px`。
- 图标使用柔和色块。
- 每个卡片只保留一个主操作。

#### 23.3.3 多模态上传页

上传页是员工端核心页面，必须非常清晰。

页面结构：

- 左侧/上方：拖拽上传区。
- 右侧/下方：元数据表单。
- 底部：最近上传记录。

上传区风格：

- 虚线边框。
- 浅蓝背景。
- 支持点击上传和拖拽上传。
- 文件类型图标分为视频、图片、音频、文本、文档。

上传成功提示：

```text
上传成功！
系统已生成一条知识条目，等待管理员审核。
本次贡献积分 +10。
```

#### 23.3.4 员工 AI 助手页

员工端只显示与员工相关的三个助手：

1. 新员工培训助手
2. 员工操作问答助手
3. 异常操作提醒助手

不要在员工端显示“管理决策支持”，避免角色混乱。

#### 23.3.5 我的贡献页

展示内容：

- 我的总积分
- 本月贡献数
- 被采纳知识数
- 最近上传记录
- 贡献徽章

徽章可以使用柔和风格：

- 新手贡献者
- SOP 贡献者
- 案例贡献者
- 知识达人

### 23.4 老板/管理端视觉定位

老板端/管理端定位：**科技感、数据化、可信、适合大屏展示、适合投资人演示**。

设计关键词：

- 蓝紫配色
- 深色背景
- 科技大屏
- 数据驾驶舱
- 发光边框
- 渐变卡片
- 动态知识图谱
- 实时数据流
- 管理决策感

### 23.5 老板端配色：蓝紫科技风

推荐色板：

| 用途 | 色值 | 说明 |
|---|---:|---|
| 页面背景 | `#050816` | 深色科技背景 |
| 背景辅助 | `#0F172A` | 深蓝灰卡片背景 |
| 主色 | `#3B82F6` | 科技蓝 |
| 辅助紫 | `#8B5CF6` | 科技紫 |
| 高亮青 | `#22D3EE` | 数据高亮 |
| 成功绿 | `#34D399` | 正向指标 |
| 警告黄 | `#FBBF24` | 中风险提醒 |
| 危险红 | `#F87171` | 高风险异常 |
| 主文本 | `#E5E7EB` | 浅色文字 |
| 次文本 | `#94A3B8` | 次级文字 |
| 边框光效 | `rgba(59, 130, 246, 0.35)` | 蓝色发光边框 |

老板端可以使用渐变：

```css
background: radial-gradient(circle at top left, rgba(59,130,246,0.25), transparent 32%),
            radial-gradient(circle at top right, rgba(139,92,246,0.22), transparent 30%),
            #050816;
```

### 23.6 老板端页面风格要求

#### 23.6.1 管理驾驶舱

顶部指标卡：

1. 多模态数据总量
2. 今日新增上传
3. 知识条目数量
4. 异常案例数量
5. AI 调用次数
6. 员工贡献人数

指标卡风格：

- 深色半透明背景。
- 蓝紫渐变边框。
- 数字使用大字号。
- 可以带轻微发光效果。

#### 23.6.2 实时数据流

展示最近上传和异常事件：

```text
[10:32] 张三 上传了 设备A-开机流程视频
[10:35] 李四 上传了 设备B-异常报警图片
[10:38] 王五 上传了 设备C-维修经验文档
```

风格要求：

- 类似终端日志/数据流。
- 时间用青色。
- 异常用红色标签。
- 标准知识贡献用绿色标签。

#### 23.6.3 知识图谱

知识图谱是老板端的核心视觉亮点。

节点配色：

| 节点类型 | 颜色 |
|---|---:|
| 设备 | `#3B82F6` |
| 工序 | `#8B5CF6` |
| 知识条目 | `#22D3EE` |
| 员工 | `#34D399` |
| 异常案例 | `#F87171` |

交互要求：

- 鼠标悬停显示节点详情。
- 点击节点显示侧边详情面板。
- 上传新数据后图谱新增节点。
- 管理端刷新后仍能看到新增节点。

#### 23.6.4 贡献排行榜

排行榜风格：

- Top 1 使用金色高亮。
- Top 2 使用银色灰。
- Top 3 使用铜色。
- 其余使用蓝紫卡片。

展示字段：

- 排名
- 员工姓名
- 部门
- 贡献积分
- 上传数量
- 被采纳数量

#### 23.6.5 异常案例展示

异常案例要有风险等级：

- 低风险：蓝色/青色
- 中风险：黄色
- 高风险：红色

卡片字段：

- 异常标题
- 设备名称
- 工序名称
- 风险等级
- 上传人
- 上传时间
- 处理建议

#### 23.6.6 管理决策问答

老板端显示两个决策类 Agent：

1. 工作质量监督 Agent
2. 管理决策支持 Agent

页面风格：

- 左侧是问题输入区。
- 右侧是分析结果卡片。
- 结果包括：结论、数据依据、风险分析、建议动作。

### 23.7 代码层面的主题实现要求

代码 Agent 必须实现双主题系统。

建议方式：

```text
src/styles/theme.ts
src/styles/employee-theme.css
src/styles/admin-theme.css
```

或者使用 Tailwind CSS 时，在组件中区分：

```text
employee 页面：浅色、马卡龙、白底卡片
admin 页面：深色、蓝紫渐变、科技大屏
```

必须满足：

1. 员工端和老板端视觉差异明显。
2. 员工端不使用深色科技风。
3. 老板端不使用马卡龙浅色风。
4. 登录后根据角色进入不同布局。
5. 代码中需要有清晰的 `EmployeeLayout` 和 `AdminLayout`。

推荐目录：

```text
src/layouts/EmployeeLayout.tsx
src/layouts/AdminLayout.tsx
src/pages/employee/Home.tsx
src/pages/employee/Upload.tsx
src/pages/employee/Assistant.tsx
src/pages/employee/Profile.tsx
src/pages/admin/Dashboard.tsx
src/pages/admin/KnowledgeGraph.tsx
src/pages/admin/Uploads.tsx
src/pages/admin/Ranking.tsx
src/pages/admin/Alerts.tsx
src/pages/admin/DecisionAgent.tsx
```

---

## 24. 最新需求更新：无服务器部署方案

用户当前没有自己的服务器，因此部署方案必须优先考虑 Cloudflare 或 GitHub，而不是云服务器、宝塔、Nginx、自建 FastAPI 常驻服务。

### 24.1 结论：推荐 Cloudflare，不推荐只用 GitHub Pages

本项目包含：

1. 前端页面。
2. 登录。
3. 上传文件。
4. 保存上传记录。
5. 保存知识条目。
6. 保存积分。
7. 调用外部 Agent API。
8. 保护 API Key。

因此不能只靠 GitHub Pages 完成完整系统。GitHub Pages 适合部署纯静态前端页面，但不能直接运行后端、数据库、文件上传处理和 API Key 代理。

推荐方案：

```text
Cloudflare Pages：部署前端 React/Vite 页面
Cloudflare Workers：作为后端 API
Cloudflare D1：保存用户、上传记录、知识条目、积分、Agent 对话
Cloudflare R2：保存图片、视频、音频、文档等上传文件
Cloudflare 环境变量/Secrets：保存外部 Agent API Key
```

### 24.2 部署方案对比

| 方案 | 能否部署前端 | 能否部署后端 API | 能否存文件 | 能否存数据库 | 能否保护 API Key | 推荐程度 |
|---|---|---|---|---|---|---|
| GitHub Pages | 可以 | 不可以 | 不适合 | 不可以 | 不可以 | 只适合静态演示 |
| Cloudflare Pages | 可以 | 可通过 Functions/Workers | 需接 R2 | 需接 D1 | 可以 | 推荐 |
| Cloudflare Workers | 可以做 API | 可以 | 可接 R2 | 可接 D1 | 可以 | 推荐 |
| Vercel | 可以 | 可以 | 不适合大文件 | 需外部 DB | 可以 | 也可选 |
| Netlify | 可以 | 可以 | 不适合大文件 | 需外部 DB | 可以 | 也可选 |

本项目最推荐：**Cloudflare Pages + Workers + D1 + R2**。

### 24.3 推荐的无服务器架构

```text
用户浏览器
  ↓
Cloudflare Pages 前端
  ↓ /api/*
Cloudflare Worker 后端
  ├── D1：存元数据、用户、知识条目、积分
  ├── R2：存上传文件
  └── 外部 Agent API：问答、分析、决策
```

### 24.4 为什么 GitHub Pages 不够

GitHub Pages 的定位是静态网站托管，只能托管 HTML、CSS、JavaScript 和静态资源。它不能直接运行后端服务，也不能在服务端安全保存 API Key，更不能处理服务端数据库逻辑。

如果强行用 GitHub Pages，只能做：

```text
纯前端静态展示
假登录
假上传
假知识图谱
假排行榜
假 Agent 返回
```

这种适合非常早期 UI 演示，但不适合你现在要的“真实上传 + API Key 接入 + 可访问网站”。

### 24.5 Cloudflare 版本需要调整的技术栈

原方案如果用 FastAPI + SQLite，更适合有服务器的情况。

无服务器方案建议改为：

| 原方案 | Cloudflare 方案 |
|---|---|
| FastAPI | Cloudflare Workers / Pages Functions |
| SQLite 本地文件 | Cloudflare D1 |
| uploads 本地文件夹 | Cloudflare R2 |
| .env 文件 | Cloudflare Variables / Secrets |
| Nginx | 不需要 |
| systemd | 不需要 |
| 服务器安全组 | 不需要 |

前端仍然可以使用：

```text
React + Vite + Ant Design / Tailwind + ECharts
```

后端建议使用：

```text
TypeScript + Cloudflare Workers + Hono
```

推荐后端框架 Hono，因为它非常适合 Cloudflare Workers，路由写法简单。

### 24.6 Cloudflare 项目目录建议

推荐使用单仓库 monorepo：

```text
industrial-demo/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   └── dist/
│
├── worker/
│   ├── package.json
│   ├── wrangler.toml
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── upload.ts
│   │   │   ├── files.ts
│   │   │   ├── knowledge.ts
│   │   │   ├── dashboard.ts
│   │   │   └── agent.ts
│   │   └── utils/
│   │       ├── response.ts
│   │       ├── auth.ts
│   │       └── agent.ts
│   └── migrations/
│       └── 0001_init.sql
│
└── README.md
```

### 24.7 Cloudflare D1 数据库设计

D1 使用 SQLite 语法。建表 SQL 可以复用原来的 SQLite 设计。

`worker/migrations/0001_init.sql`：

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  name TEXT,
  department TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uploaded_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_url TEXT,
  r2_key TEXT,
  uploader_id INTEGER,
  uploader_name TEXT,
  device_name TEXT,
  process_name TEXT,
  scene_type TEXT,
  is_abnormal INTEGER DEFAULT 0,
  risk_level TEXT,
  tags TEXT,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  knowledge_type TEXT,
  source_file_id INTEGER,
  device_name TEXT,
  process_name TEXT,
  contributor_name TEXT,
  tags TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contribution_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_name TEXT,
  action_type TEXT,
  points INTEGER,
  related_file_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  role_type TEXT,
  question TEXT,
  answer TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO users (username, password, role, name, department)
VALUES
('employee', '123456', 'employee', '张三', '一线生产部'),
('admin', '123456', 'admin', '王经理', '生产管理部');
```

### 24.8 Cloudflare R2 文件存储设计

上传文件不再保存到本地 `uploads/`，而是保存到 R2 bucket。

推荐 bucket 名称：

```text
industrial-demo-uploads
```

R2 key 命名规则：

```text
uploads/{user_id}/{timestamp}_{original_filename}
```

例如：

```text
uploads/1/20260525_103012_deviceA_startup.mp4
```

D1 中保存：

```text
file_url：可访问文件地址或后端读取地址
r2_key：R2 内部对象 key
```

### 24.9 Worker 环境变量与 API Key 接入

Cloudflare Worker 中不能把 API Key 写死在代码里，必须用 Cloudflare 的 Variables / Secrets。

需要配置：

```text
AGENT_API_KEY=你的外部Agent API Key
AGENT_API_BASE_URL=https://api.example.com/v1
AGENT_MODEL=your-model-name
AGENT_MODE=proxy
```

开发环境可以使用 `.dev.vars`：

```env
AGENT_API_KEY=sk-xxxxxxxxxxxxxxxx
AGENT_API_BASE_URL=https://api.example.com/v1
AGENT_MODEL=gpt-4o-mini
AGENT_MODE=proxy
```

注意：

1. `.dev.vars` 只能本地使用。
2. 不能提交到 GitHub。
3. 必须加入 `.gitignore`。
4. 线上环境要在 Cloudflare Dashboard 里配置 Secret。

`.gitignore` 必须包含：

```text
.env
.env.local
.dev.vars
node_modules
frontend/dist
```

### 24.10 wrangler.toml 示例

`worker/wrangler.toml`：

```toml
name = "industrial-demo-api"
main = "src/index.ts"
compatibility_date = "2026-05-25"

[[d1_databases]]
binding = "DB"
database_name = "industrial-demo-db"
database_id = "替换为你的D1数据库ID"

[[r2_buckets]]
binding = "UPLOAD_BUCKET"
bucket_name = "industrial-demo-uploads"

[vars]
AGENT_API_BASE_URL = "https://api.example.com/v1"
AGENT_MODEL = "gpt-4o-mini"
AGENT_MODE = "proxy"
```

API Key 不建议写在 `wrangler.toml` 的 `[vars]` 中，应该用 secret：

```bash
cd worker
npx wrangler secret put AGENT_API_KEY
```

### 24.11 Worker 后端 API 清单

Cloudflare Worker 版本保留同样 API：

```text
POST /api/auth/login
GET  /api/user/profile

POST /api/upload
GET  /api/files
GET  /api/files/:id
GET  /api/file/:id/download

GET  /api/knowledge
POST /api/knowledge

GET  /api/dashboard/summary
GET  /api/dashboard/recent-uploads
GET  /api/dashboard/ranking
GET  /api/dashboard/graph

POST /api/agent/chat
```

### 24.12 上传接口在 Worker 中的处理逻辑

`POST /api/upload`：

前端使用 `FormData`：

```ts
const formData = new FormData();
formData.append('file', file);
formData.append('title', title);
formData.append('device_name', deviceName);
formData.append('process_name', processName);
formData.append('scene_type', sceneType);
formData.append('is_abnormal', isAbnormal ? '1' : '0');
formData.append('risk_level', riskLevel);
formData.append('tags', tags.join(','));
formData.append('description', description);
```

Worker 逻辑：

```text
1. 解析 FormData。
2. 获取 file 对象。
3. 生成 r2_key。
4. 将文件 put 到 R2。
5. 在 D1 的 uploaded_files 表写入记录。
6. 自动在 knowledge_items 表写入一条知识条目。
7. 自动在 contribution_scores 表写入 +10 分记录。
8. 返回上传成功结果。
```

### 24.13 Agent API 转发逻辑

前端永远不要直接请求外部大模型 API。前端只请求：

```text
POST /api/agent/chat
```

Worker 从环境变量读取 `AGENT_API_KEY`，再请求外部 Agent API。

伪代码：

```ts
const apiKey = env.AGENT_API_KEY;
const baseUrl = env.AGENT_API_BASE_URL;
const model = env.AGENT_MODEL;

const resp = await fetch(`${baseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ]
  })
});
```

如果外部 API 失败，Worker 返回 mock 答案：

```json
{
  "answer": "当前外部 Agent API 暂不可用，系统已返回演示模式结果：根据已有上传数据，建议优先关注异常案例数量较高的工序。",
  "mode": "mock_fallback"
}
```

### 24.14 Cloudflare 部署步骤

#### 24.14.1 准备 Cloudflare 账号

1. 注册 Cloudflare 账号。
2. 安装 Node.js。
3. 登录 Wrangler：

```bash
npm install -g wrangler
wrangler login
```

#### 24.14.2 创建 D1 数据库

```bash
cd worker
npx wrangler d1 create industrial-demo-db
```

把返回的 `database_id` 写入 `wrangler.toml`。

执行迁移：

```bash
npx wrangler d1 migrations apply industrial-demo-db --remote
```

#### 24.14.3 创建 R2 Bucket

```bash
npx wrangler r2 bucket create industrial-demo-uploads
```

#### 24.14.4 设置 API Key Secret

```bash
npx wrangler secret put AGENT_API_KEY
```

然后输入真实 API Key。

其他变量可以放到 `wrangler.toml`：

```toml
[vars]
AGENT_API_BASE_URL = "https://api.example.com/v1"
AGENT_MODEL = "gpt-4o-mini"
AGENT_MODE = "proxy"
```

#### 24.14.5 部署 Worker API

```bash
cd worker
npm install
npm run deploy
```

部署后得到类似：

```text
https://industrial-demo-api.xxx.workers.dev
```

#### 24.14.6 部署前端到 Cloudflare Pages

前端 `.env.production`：

```env
VITE_API_BASE_URL=https://industrial-demo-api.xxx.workers.dev/api
```

打包：

```bash
cd frontend
npm install
npm run build
```

部署方式一：Cloudflare Pages 连接 GitHub 仓库。

配置：

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: frontend
```

部署方式二：Direct Upload。

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name industrial-demo-web
```

### 24.15 GitHub Pages 备选部署方案

如果只想快速给别人看前端界面，不要求真实上传、不要求真实 Agent API，可以用 GitHub Pages。

GitHub Pages 方案：

```text
React/Vite 前端静态部署到 GitHub Pages
所有数据使用 localStorage 或 mock JSON
上传只是浏览器本地预览，不真正保存文件
Agent 返回固定 mock 文案
```

适合：

- UI 展示
- 路演初稿
- 没有后端的静态原型

不适合：

- 真实上传文件
- 保存数据库
- 保护 API Key
- 真实调用 Agent API
- 多用户共享数据

### 24.16 GitHub Pages 静态 Demo 实现要求

如果代码 Agent 选择 GitHub Pages 模式，必须提供 `DEMO_MODE=true`。

前端 `.env.production`：

```env
VITE_DEMO_MODE=true
VITE_API_BASE_URL=
```

在 demo 模式下：

1. 登录使用固定账号。
2. 上传数据保存到 `localStorage`。
3. 知识图谱从 `localStorage` 生成。
4. 排行榜使用 mock 数据 + localStorage 数据。
5. Agent 返回固定模拟答案。
6. 页面刷新后本机数据仍保留。
7. 换电脑访问时数据不共享。

### 24.17 GitHub Pages 部署步骤

前端项目需要配置 `base`。

`vite.config.ts`：

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/industrial-demo/'
});
```

部署：

```bash
cd frontend
npm install
npm run build
npm install --save-dev gh-pages
```

`package.json` 增加：

```json
{
  "scripts": {
    "deploy:gh-pages": "gh-pages -d dist"
  }
}
```

执行：

```bash
npm run deploy:gh-pages
```

然后在 GitHub 仓库 Settings → Pages 中选择 `gh-pages` 分支。

### 24.18 最终推荐

如果你想做“能真实上传、能接 Agent API、能公开访问”的版本，选：

```text
Cloudflare Pages + Cloudflare Workers + D1 + R2
```

如果你只想做“纯前端静态展示页面”，选：

```text
GitHub Pages
```

本项目设计文档后续以 Cloudflare 版本为主，GitHub Pages 只作为静态演示备选。

---

## 25. 更新后的代码 Agent 总提示词补充

请在原始总提示词后追加以下要求：

```text
新增需求：

1. 系统仍然分为员工端和老板/管理端。
2. 员工端必须使用简洁风格和马克龙配色：浅色背景、白色卡片、低饱和柔和色彩、清晰按钮、低学习成本。
3. 老板/管理端必须使用科技风和蓝紫配色：深色背景、蓝紫渐变、发光卡片、数据大屏、知识图谱、实时数据流。
4. 代码中必须拆分 EmployeeLayout 和 AdminLayout。
5. 员工端不要出现复杂科技大屏效果；老板端不要使用马卡龙浅色风。
6. 用户没有服务器，因此部署方案优先使用 Cloudflare。
7. 完整可访问版本使用 Cloudflare Pages 部署前端，Cloudflare Workers 提供后端 API，Cloudflare D1 保存数据库记录，Cloudflare R2 保存上传文件，Cloudflare Secrets 保存外部 Agent API Key。
8. 不能把 API Key 写在前端代码里，也不能提交到 GitHub。
9. 需要提供 wrangler.toml、D1 migration SQL、R2 上传逻辑、Agent API 转发逻辑。
10. 需要提供 README，写清楚 Cloudflare 部署步骤。
11. 同时提供 GitHub Pages 静态 Demo 模式，使用 localStorage 和 mock 数据，说明该模式不能真实保存服务器文件，不能保护 API Key，只适合展示 UI。
12. 最终项目需要支持两种运行模式：
    - cloudflare 模式：真实上传、真实数据库、真实 Agent API 转发。
    - static-demo 模式：GitHub Pages 静态演示、localStorage、mock Agent。
```
