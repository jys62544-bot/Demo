import type {
  AbnormalCase,
  AgentChatResponse,
  DashboardSummary,
  GraphData,
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
    department: "一号产线",
    position: "设备操作员",
  },
  admin: {
    id: 2,
    username: "admin",
    name: "李经理",
    role: "admin",
    department: "生产管理部",
    position: "管理端负责人",
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
    title: "设备A未闭合安全锁图片",
    file_type: "image",
    uploader_name: "张三",
    device_name: "设备A",
    process_name: "开机检查",
    is_abnormal: true,
    risk_level: "high",
    created_at: "2026-05-25T09:30:00",
  },
  {
    id: 102,
    title: "产线巡检标准动作视频",
    file_type: "video",
    uploader_name: "王五",
    device_name: "设备B",
    process_name: "巡检",
    is_abnormal: false,
    risk_level: "none",
    created_at: "2026-05-25T09:10:00",
  },
  {
    id: 103,
    title: "质检台面异常震动录音",
    file_type: "audio",
    uploader_name: "赵六",
    device_name: "设备C",
    process_name: "产品质检",
    is_abnormal: true,
    risk_level: "medium",
    created_at: "2026-05-25T08:48:00",
  },
];

export const mockRanking: RankingRow[] = [
  {
    rank: 1,
    user_id: 1,
    user_name: "张三",
    department: "一号产线",
    upload_count: 19,
    knowledge_count: 17,
    abnormal_count: 6,
    total_points: 285,
  },
  {
    rank: 2,
    user_id: 3,
    user_name: "王五",
    department: "二号产线",
    upload_count: 15,
    knowledge_count: 14,
    abnormal_count: 4,
    total_points: 220,
  },
  {
    rank: 3,
    user_id: 4,
    user_name: "赵六",
    department: "质检组",
    upload_count: 12,
    knowledge_count: 11,
    abnormal_count: 5,
    total_points: 205,
  },
];

export const mockAbnormalCases: AbnormalCase[] = [
  {
    id: 1,
    title: "设备A开机检查安全锁未闭合",
    device_name: "设备A",
    process_name: "开机检查",
    risk_level: "high",
    uploader_name: "张三",
    description: "安全锁未闭合仍尝试启动，存在误操作风险。",
    status: "pending",
    ai_suggestion: "建议班组长复核安全锁检查流程，并增加开机前二次确认。",
    created_at: "2026-05-25T09:30:00",
  },
  {
    id: 2,
    title: "质检台面异常震动",
    device_name: "设备C",
    process_name: "产品质检",
    risk_level: "medium",
    uploader_name: "赵六",
    description: "录音中存在连续异响，疑似固定件松动。",
    status: "processing",
    ai_suggestion: "建议停机检查固定螺栓，并记录维修前后声纹变化。",
    created_at: "2026-05-25T08:48:00",
  },
];

export const mockGraph: GraphData = {
  categories: [
    { name: "employee" },
    { name: "file" },
    { name: "knowledge" },
    { name: "device" },
    { name: "process" },
  ],
  nodes: [
    { id: "employee-1", name: "张三", category: "employee", value: 60 },
    { id: "file-101", name: "安全锁图片", category: "file", value: 48 },
    { id: "knowledge-1", name: "异常案例", category: "knowledge", value: 42 },
    { id: "device-a", name: "设备A", category: "device", value: 52 },
    { id: "process-start", name: "开机检查", category: "process", value: 46 },
  ],
  links: [
    { source: "employee-1", target: "file-101", name: "上传" },
    { source: "file-101", target: "knowledge-1", name: "生成" },
    { source: "knowledge-1", target: "device-a", name: "关联设备" },
    { source: "knowledge-1", target: "process-start", name: "关联工序" },
  ],
};

export const mockAgentAnswer: AgentChatResponse = {
  answer:
    "最近异常主要集中在开机检查环节，风险点以安全锁未闭合和班前确认遗漏为主。建议把开机检查拆成两人复核，并在员工端上传页增加安全锁专项标签。",
  role_type: "management_decision",
  mode: "mock",
  suggestions: ["强化开机检查培训", "将安全锁纳入班组长复核", "在大屏持续跟踪高风险趋势"],
  sources: ["近 7 日异常案例", "贡献上传记录", "知识条目摘要"],
};

export const createMockUpload = (title: string): UploadedFile => ({
  id: Date.now(),
  title,
  file_type: "image",
  file_url: null,
  uploader_id: 1,
  uploader_name: "张三",
  device_name: "设备A",
  process_name: "开机检查",
  scene_type: "abnormal_operation",
  is_abnormal: true,
  risk_level: "high",
  tags: "安全锁,开机,异常",
  description: "演示模式上传记录",
  created_at: new Date().toISOString(),
});
