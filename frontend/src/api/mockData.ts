import type {
  AbnormalCase,
  AgentChatResponse,
  Contribution,
  DashboardSummary,
  GraphData,
  KnowledgeItem,
  RankingRow,
  RecentUpload,
  UploadedFile,
  User,
} from "../types";

export const demoUsers: Record<string, User> = {
  employee: {
    id: 1,
    username: "employee",
    name: "张三",
    role: "employee",
    department: "集控运行一值",
    position: "巡检操作员",
  },
  admin: {
    id: 2,
    username: "admin",
    name: "李经理",
    role: "admin",
    department: "发电运行部",
    position: "运行值长",
  },
};

export const mockSummary: DashboardSummary = {
  total_files: 68,
  today_uploads: 9,
  total_knowledge: 62,
  total_abnormal: 18,
  total_contributors: 6,
  agent_calls: 27,
  file_type_distribution: {
    video: 16,
    image: 22,
    audio: 8,
    document: 10,
    text: 12,
  },
  risk_distribution: {
    low: 4,
    medium: 6,
    high: 7,
    critical: 1,
  },
  daily_trend: [
    { date: "2026-05-19", uploads: 5, knowledge: 4, abnormal: 1 },
    { date: "2026-05-20", uploads: 7, knowledge: 6, abnormal: 2 },
    { date: "2026-05-21", uploads: 8, knowledge: 8, abnormal: 3 },
    { date: "2026-05-22", uploads: 6, knowledge: 5, abnormal: 1 },
    { date: "2026-05-23", uploads: 10, knowledge: 9, abnormal: 4 },
    { date: "2026-05-24", uploads: 11, knowledge: 10, abnormal: 3 },
    { date: "2026-05-25", uploads: 9, knowledge: 8, abnormal: 4 },
  ],
};

export const mockRecentUploads: RecentUpload[] = [
  {
    id: 101,
    title: "1号主变压器套管红外测温异常图片",
    file_type: "image",
    uploader_name: "张三",
    device_name: "1号主变压器",
    process_name: "红外测温巡检",
    is_abnormal: true,
    risk_level: "high",
    created_at: "2026-05-25T09:30:00",
  },
  {
    id: 102,
    title: "6kV开关柜倒闸操作标准视频",
    file_type: "video",
    uploader_name: "王师傅",
    device_name: "6kV厂用开关柜",
    process_name: "倒闸操作",
    is_abnormal: false,
    risk_level: "none",
    created_at: "2026-05-25T09:10:00",
  },
  {
    id: 103,
    title: "汽轮机给水泵轴承异响录音",
    file_type: "audio",
    uploader_name: "赵工",
    device_name: "汽轮机给水泵",
    process_name: "运行监听",
    is_abnormal: true,
    risk_level: "medium",
    created_at: "2026-05-25T08:48:00",
  },
];

export const mockFiles: UploadedFile[] = mockRecentUploads.map((item) => ({
  ...item,
  file_name: `${item.id}.png`,
  file_url: null,
  uploader_id: item.uploader_name === "张三" ? 1 : 3,
  scene_type: item.is_abnormal ? "abnormal_operation" : "standard_operation",
  tags: item.is_abnormal ? "安全,异常,巡检" : "标准,巡检",
  description: item.is_abnormal ? "电力设备巡检发现异常，需要沉淀为案例。" : "电力运行标准操作记录。",
}));

export const mockKnowledgeItems: KnowledgeItem[] = [
  {
    id: 1,
    title: "1号主变压器 - 红外测温巡检 - 套管温升异常",
    knowledge_type: "异常案例",
    source_file_id: 101,
    device_name: "1号主变压器",
    process_name: "红外测温巡检",
    contributor_id: 1,
    contributor_name: "张三",
    tags: "主变,套管,红外测温,温升异常",
    status: "pending",
    summary: "红外测温发现高压套管局部温升偏高，建议复测负荷、电流和接头温度，必要时安排停电消缺。",
    created_at: "2026-05-25T09:30:00",
  },
  {
    id: 2,
    title: "6kV厂用开关柜 - 倒闸操作 - 标准操作视频",
    knowledge_type: "标准操作",
    source_file_id: 102,
    device_name: "6kV厂用开关柜",
    process_name: "倒闸操作",
    contributor_id: 3,
    contributor_name: "王师傅",
    tags: "开关柜,倒闸,五防,标准操作",
    status: "approved",
    summary: "6kV开关柜倒闸前后核对设备双重编号、五防闭锁、接地刀闸和操作票关键步骤。",
    created_at: "2026-05-25T09:10:00",
  },
  {
    id: 3,
    title: "汽轮机给水泵 - 运行监听 - 轴承异响录音",
    knowledge_type: "故障处理",
    source_file_id: 103,
    device_name: "汽轮机给水泵",
    process_name: "运行监听",
    contributor_id: 4,
    contributor_name: "赵工",
    tags: "给水泵,轴承,异响,振动",
    status: "pending",
    summary: "监听中出现周期性摩擦声，建议比对振动值、轴承温度和润滑油压趋势。",
    created_at: "2026-05-25T08:48:00",
  },
];

export const mockRanking: RankingRow[] = [
  {
    rank: 1,
    user_id: 1,
    user_name: "张三",
    department: "集控运行一值",
    upload_count: 19,
    knowledge_count: 17,
    abnormal_count: 6,
    total_points: 285,
  },
  {
    rank: 2,
    user_id: 3,
    user_name: "王师傅",
    department: "电气检修班",
    upload_count: 15,
    knowledge_count: 14,
    abnormal_count: 4,
    total_points: 220,
  },
  {
    rank: 3,
    user_id: 4,
    user_name: "赵工",
    department: "继电保护班",
    upload_count: 12,
    knowledge_count: 11,
    abnormal_count: 5,
    total_points: 205,
  },
];

export const mockAbnormalCases: AbnormalCase[] = [
  {
    id: 1,
    title: "1号主变压器套管温升异常",
    device_name: "1号主变压器",
    process_name: "红外测温巡检",
    risk_level: "high",
    uploader_name: "张三",
    description: "高压套管接线端子温度较同相历史值升高，存在接触电阻增大风险。",
    status: "pending",
    ai_suggestion: "建议复测负荷电流和红外温度，通知电气检修班核查接头压接状态。",
    created_at: "2026-05-25T09:30:00",
  },
  {
    id: 2,
    title: "汽轮机给水泵轴承异响",
    device_name: "汽轮机给水泵",
    process_name: "运行监听",
    risk_level: "medium",
    uploader_name: "赵工",
    description: "监听中存在周期性摩擦声，轴承振动趋势需复核。",
    status: "processing",
    ai_suggestion: "建议比对轴承温度、振动和润滑油压，必要时切换备用泵并安排点检。",
    created_at: "2026-05-25T08:48:00",
  },
];

export const mockContributions: Contribution[] = [
  {
    id: 1,
    user_id: 1,
    user_name: "张三",
    action_type: "upload_abnormal",
    points: 20,
    related_file_id: 101,
    description: "上传高风险异常图片并生成案例",
    created_at: "2026-05-25T09:30:00",
  },
  {
    id: 2,
    user_id: 1,
    user_name: "张三",
    action_type: "upload_video",
    points: 15,
    related_file_id: 88,
    description: "上传标准操作视频",
    created_at: "2026-05-24T16:12:00",
  },
  {
    id: 3,
    user_id: 1,
    user_name: "张三",
    action_type: "upload_normal",
    points: 10,
    related_file_id: 77,
    description: "提交班前巡检经验",
    created_at: "2026-05-23T11:20:00",
  },
];

export const mockGraph: GraphData = {
  categories: [
    { name: "device" },
    { name: "abnormal" },
    { name: "process" },
    { name: "risk" },
    { name: "knowledge" },
  ],
  nodes: [
    { id: "device-a", name: "1号主变压器", category: "device", value: 52 },
    { id: "abnormal-1", name: "套管温升异常", category: "abnormal", value: 56 },
    { id: "process-thermal", name: "红外测温巡检", category: "process", value: 46 },
    { id: "risk-high", name: "高风险", category: "risk", value: 42 },
    { id: "knowledge-1", name: "主变温升处置知识", category: "knowledge", value: 48 },
    { id: "device-pump", name: "汽轮机给水泵", category: "device", value: 52 },
    { id: "abnormal-2", name: "轴承异响", category: "abnormal", value: 50 },
    { id: "process-listen", name: "运行监听", category: "process", value: 46 },
    { id: "risk-medium", name: "中风险", category: "risk", value: 40 },
  ],
  links: [
    { source: "device-a", target: "abnormal-1", name: "出现问题" },
    { source: "abnormal-1", target: "process-thermal", name: "发生环节" },
    { source: "abnormal-1", target: "risk-high", name: "风险等级" },
    { source: "abnormal-1", target: "knowledge-1", name: "沉淀知识" },
    { source: "knowledge-1", target: "process-thermal", name: "复盘环节" },
    { source: "device-pump", target: "abnormal-2", name: "出现问题" },
    { source: "abnormal-2", target: "process-listen", name: "发生环节" },
    { source: "abnormal-2", target: "risk-medium", name: "风险等级" },
  ],
};

export const mockAgentAnswer: AgentChatResponse = {
  answer: `## 今日风险结论

最近异常主要集中在 **主变红外测温** 和 **汽轮机给水泵运行监听** 两类巡检场景。

| 优先级 | 设备 | 风险点 | 建议 |
| --- | --- | --- | --- |
| 高 | 1号主变压器 | 套管接头温升偏高 | 复测负荷、电流和接头温度 |
| 中 | 汽轮机给水泵 | 轴承异响趋势 | 比对振动、温度和油压 |

建议把主变测温复测、开关柜倒闸操作复核、给水泵点检列为本班重点。`,
  role_type: "management_decision",
  mode: "mock",
  suggestions: ["复测主变套管温度", "核对开关柜倒闸操作票", "跟踪给水泵振动趋势"],
  sources: ["近 7 日电力设备异常案例", "运行班组上传记录", "知识条目摘要"],
};

export const createMockUpload = (title: string): UploadedFile => ({
  id: Date.now(),
  title,
  file_type: "image",
  file_url: null,
  uploader_id: 1,
  uploader_name: "张三",
  device_name: "1号主变压器",
  process_name: "红外测温巡检",
  scene_type: "abnormal_operation",
  is_abnormal: true,
  risk_level: "high",
  tags: "主变,红外测温,温升异常",
  description: "演示模式上传的电力巡检记录",
  created_at: new Date().toISOString(),
});
