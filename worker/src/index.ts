export interface Env {
  DB: D1Database;
  UPLOAD_BUCKET: R2Bucket;
  AGENT_MODE?: string;
  AGENT_API_BASE_URL?: string;
  AGENT_API_KEY?: string;
  AGENT_MODEL?: string;
  AGENT_TEXT_MODEL?: string;
  AGENT_VISION_MODEL?: string;
  AGENT_TIMEOUT_SECONDS?: string;
  AGENT_ENABLE_THINKING?: string;
  AGENT_MAX_TOKENS?: string;
  CORS_ORIGINS?: string;
  CORS_ORIGIN_SUFFIXES?: string;
}

type User = {
  id: number;
  username: string;
  password: string;
  role: "employee" | "admin";
  name: string;
  department: string | null;
  position: string | null;
  created_at: string;
};

type UploadedFile = {
  id: number;
  title: string;
  file_name: string | null;
  file_type: FileType;
  file_url: string | null;
  storage_key: string | null;
  uploader_id: number | null;
  uploader_name: string | null;
  device_name: string | null;
  process_name: string | null;
  scene_type: SceneType;
  is_abnormal: number;
  risk_level: RiskLevel;
  tags: string | null;
  description: string | null;
  text_content: string | null;
  created_at: string;
};

type KnowledgeItem = {
  id: number;
  title: string;
  knowledge_type: string | null;
  source_file_id: number | null;
  device_name: string | null;
  process_name: string | null;
  contributor_id: number | null;
  contributor_name: string | null;
  tags: string | null;
  status: string;
  summary: string | null;
  created_at: string;
};

type AbnormalCase = {
  id: number;
  source_file_id: number | null;
  title: string | null;
  device_name: string | null;
  process_name: string | null;
  risk_level: RiskLevel | null;
  uploader_id: number | null;
  uploader_name: string | null;
  description: string | null;
  status: string;
  ai_suggestion: string | null;
  created_at: string;
};

type FileType = "video" | "image" | "audio" | "document" | "text";
type SceneType =
  | "standard_operation"
  | "abnormal_operation"
  | "training_experience"
  | "fault_case"
  | "quality_inspection"
  | "maintenance_record"
  | "other";
type RiskLevel = "none" | "low" | "medium" | "high" | "critical";
type AgentRole =
  | "training_assistant"
  | "operation_qa"
  | "abnormal_alert"
  | "quality_supervisor"
  | "management_decision";

type AgentAttachment = {
  type: "image_url" | "video_url" | "audio_url";
  url?: string;
  file_id?: number;
  detail?: "auto" | "low" | "high";
  max_frames?: number;
  fps?: number;
};

type AgentChatRequest = {
  user_id?: number;
  role_type: AgentRole;
  question: string;
  context?: Record<string, unknown>;
  attachments?: AgentAttachment[];
};

const FILE_TYPES = new Set<FileType>(["video", "image", "audio", "document", "text"]);
const SCENE_TYPES = new Set<SceneType>([
  "standard_operation",
  "abnormal_operation",
  "training_experience",
  "fault_case",
  "quality_inspection",
  "maintenance_record",
  "other",
]);
const RISK_LEVELS = new Set<RiskLevel>(["none", "low", "medium", "high", "critical"]);
const AGENT_ROLES = new Set<AgentRole>([
  "training_assistant",
  "operation_qa",
  "abnormal_alert",
  "quality_supervisor",
  "management_decision",
]);

const SCENE_TO_KNOWLEDGE: Record<SceneType, string> = {
  standard_operation: "标准操作",
  abnormal_operation: "异常案例",
  training_experience: "培训经验",
  fault_case: "故障处理",
  quality_inspection: "质检记录",
  maintenance_record: "维修经验",
  other: "其他",
};

const MOCK_ANSWERS: Record<AgentRole, string> = {
  training_assistant: "建议新员工先学习两票三制、电气五防、主变巡检、开关柜倒闸和汽机辅机点检，再进入现场跟班实操。",
  operation_qa: "建议按照电力运行 SOP 先核对设备双重编号、运行方式、保护压板状态和现场测温/振动数据，必要时通知值长复核。",
  abnormal_alert: "该情况可能属于电力设备中高风险异常，建议立即保留运行证据、复测关键参数，并通知值长和检修班组。",
  quality_supervisor: "当前操作质量风险主要来自倒闸票执行偏差、巡检测温遗漏和异常复盘不足，建议加强两票复核。",
  management_decision: "从当前数据看，异常主要集中在主变红外测温、开关柜倒闸和汽机给水泵运行监听环节，建议安排专项复测和检修联动。",
};

const SUGGESTIONS: Record<AgentRole, string[]> = {
  training_assistant: ["查看两票三制培训", "查看开关柜倒闸案例"],
  operation_qa: ["查看设备巡检 SOP", "查看同类电力异常案例"],
  abnormal_alert: ["通知值长复核", "查看近期同类设备异常"],
  quality_supervisor: ["查看风险巡检排行", "导出异常案例清单"],
  management_decision: ["查看主变测温趋势", "安排电气专项复测"],
};

const ENABLE_THINKING_MODELS = new Set([
  "Qwen/Qwen3-8B",
  "Qwen/Qwen3-14B",
  "Qwen/Qwen3-30B-A3B",
  "Qwen/Qwen3-32B",
  "Qwen/Qwen3-235B-A22B",
  "tencent/Hunyuan-A13B-Instruct",
  "zai-org/GLM-4.5V",
  "zai-org/GLM-4.6V",
  "zai-org/GLM-5V-Turbo",
  "deepseek-ai/DeepSeek-V3.1",
  "deepseek-ai/DeepSeek-V3.1-Terminus",
  "deepseek-ai/DeepSeek-V3.2-Exp",
  "deepseek-ai/DeepSeek-V3.2",
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    try {
      await ensureSeeded(env);
      const url = new URL(request.url);
      const response = await routeRequest(request, env, url);
      return withCors(response, request, env);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      const detail = error instanceof Error ? error.message : "Internal Server Error";
      return jsonResponse({ detail }, request, env, status);
    }
  },
};

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function routeRequest(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;

  if (request.method === "POST" && path === "/api/auth/login") return login(request, env);
  if (request.method === "GET" && path === "/api/user/profile") return profile(request, env);
  if (request.method === "POST" && path === "/api/upload") return upload(request, env);
  if (request.method === "GET" && path === "/api/files") return listFiles(request, env, url);
  if (request.method === "GET" && /^\/api\/files\/\d+$/.test(path)) {
    return getFile(request, env, Number(path.split("/").at(-1)));
  }
  if (request.method === "GET" && path === "/api/knowledge") return listKnowledge(request, env, url);
  if (request.method === "GET" && path === "/api/abnormal-cases") return listAbnormal(request, env, url);
  if (request.method === "GET" && path === "/api/contributions") return listContributions(request, env, url);
  if (request.method === "GET" && path === "/api/dashboard/summary") return dashboardSummary(request, env);
  if (request.method === "GET" && path === "/api/dashboard/recent-uploads") return recentUploads(request, env, url);
  if (request.method === "GET" && path === "/api/dashboard/ranking") return ranking(request, env, url);
  if (request.method === "GET" && path === "/api/dashboard/graph") return graph(request, env);
  if (request.method === "POST" && path === "/api/agent/chat") return agentChat(request, env);
  if (request.method === "GET" && path.startsWith("/uploads/")) return fetchUpload(env, decodeURIComponent(path.slice(9)));

  throw new HttpError(404, "接口不存在");
}

function jsonResponse(data: unknown, request: Request, env: Env, status = 200): Response {
  return withCors(
    new Response(JSON.stringify(data), {
      status,
      headers: { "content-type": "application/json; charset=utf-8" },
    }),
    request,
    env,
  );
}

function withCors(response: Response, request: Request, env: Env): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request, env))) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const requestOrigin = request.headers.get("Origin") ?? "";
  const allowed = (env.CORS_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedSuffixes = (env.CORS_ORIGIN_SUFFIXES ?? "")
    .split(",")
    .map((suffix) => suffix.trim())
    .filter(Boolean);
  const origin =
    allowed.includes(requestOrigin) || allowedSuffixes.some((suffix) => requestOrigin.endsWith(suffix))
      ? requestOrigin
      : allowed[0] ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
  };
}

async function getCurrentUser(request: Request, env: Env): Promise<User> {
  const header = request.headers.get("Authorization") ?? "";
  const match = header.match(/^Bearer demo-token-(.+)$/);
  if (!match) throw new HttpError(401, "认证信息无效");

  const user = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(match[1]).first<User>();
  if (!user) throw new HttpError(401, "认证信息无效");
  return user;
}

function publicUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    department: user.department,
    position: user.position,
  };
}

function boolResponse(value: number | boolean | null | undefined): boolean {
  return value === true || value === 1;
}

function normalizeFile(item: UploadedFile) {
  return { ...item, is_abnormal: boolResponse(item.is_abnormal) };
}

function intParam(url: URL, name: string, fallback: number, min = 0, max = 100): number {
  const raw = url.searchParams.get(name);
  if (raw === null) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) throw new HttpError(400, `${name} 参数不合法`);
  return value;
}

function boolEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function intEnv(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
}

function nowIso(): string {
  return new Date().toISOString();
}

async function login(request: Request, env: Env): Promise<Response> {
  const payload = (await request.json()) as { username?: string; password?: string };
  const user = await env.DB.prepare("SELECT * FROM users WHERE username = ? AND password = ?")
    .bind(payload.username ?? "", payload.password ?? "")
    .first<User>();
  if (!user) throw new HttpError(401, "用户名或密码错误");
  return jsonResponse({ token: `demo-token-${user.username}`, user: publicUser(user) }, request, env);
}

async function profile(request: Request, env: Env): Promise<Response> {
  const user = await getCurrentUser(request, env);
  return jsonResponse(publicUser(user), request, env);
}

async function upload(request: Request, env: Env): Promise<Response> {
  const user = await getCurrentUser(request, env);
  const form = await request.formData();

  const title = requiredFormText(form, "title");
  const fileType = requiredFormText(form, "file_type") as FileType;
  const deviceName = requiredFormText(form, "device_name");
  const processName = requiredFormText(form, "process_name");
  const sceneType = requiredFormText(form, "scene_type") as SceneType;
  const abnormal = parseFormBool(optionalFormText(form, "is_abnormal") ?? "0");
  const inputRisk = (optionalFormText(form, "risk_level") ?? "none") as RiskLevel;
  const riskLevel = abnormal ? inputRisk : "none";
  const tags = optionalFormText(form, "tags");
  const description = optionalFormText(form, "description");
  const textContent = optionalFormText(form, "text_content");

  if (!FILE_TYPES.has(fileType)) throw new HttpError(400, "file_type 不合法");
  if (!SCENE_TYPES.has(sceneType)) throw new HttpError(400, "scene_type 不合法");
  if (!RISK_LEVELS.has(inputRisk)) throw new HttpError(400, "risk_level 不合法");
  if (fileType === "text" && !textContent) throw new HttpError(400, "text 类型必须提供 text_content");

  let fileName: string | null = null;
  let fileUrl: string | null = null;
  let storageKey: string | null = null;
  const formFile = form.get("file");

  if (fileType !== "text") {
    if (typeof formFile !== "object" || formFile === null || !("stream" in formFile)) {
      throw new HttpError(400, "非 text 类型必须上传文件");
    }
    const uploaded = formFile as File;
    fileName = uploaded.name;
    storageKey = `${compactTimestamp()}_${crypto.randomUUID().slice(0, 8)}_${safeFilename(fileName)}`;
    fileUrl = `/uploads/${storageKey}`;
    await env.UPLOAD_BUCKET.put(storageKey, uploaded.stream(), {
      httpMetadata: { contentType: uploaded.type || contentTypeForFile(fileName, fileType) },
    });
  }

  const createdAt = nowIso();
  const result = await env.DB.prepare(
    `INSERT INTO uploaded_files
      (title, file_name, file_type, file_url, storage_key, uploader_id, uploader_name, device_name,
       process_name, scene_type, is_abnormal, risk_level, tags, description, text_content, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      title,
      fileName,
      fileType,
      fileUrl,
      storageKey,
      user.id,
      user.name,
      deviceName,
      processName,
      sceneType,
      abnormal ? 1 : 0,
      riskLevel,
      tags,
      description,
      fileType === "text" ? textContent : null,
      createdAt,
    )
    .run();
  const fileId = Number(result.meta.last_row_id);
  const uploadedFile = (await env.DB.prepare("SELECT * FROM uploaded_files WHERE id = ?")
    .bind(fileId)
    .first<UploadedFile>())!;

  const knowledge = await createKnowledge(env, uploadedFile, createdAt);
  const abnormalCase = abnormal ? await createAbnormalCase(env, uploadedFile, createdAt) : null;
  const scoreAdded = calculatePoints(uploadedFile);
  await createScore(env, uploadedFile, scoreAdded, createdAt);

  return jsonResponse(
    {
      message: "上传成功",
      file: normalizeFile(uploadedFile),
      knowledge_item: knowledge,
      abnormal_case: abnormalCase,
      score_added: scoreAdded,
    },
    request,
    env,
  );
}

function requiredFormText(form: FormData, key: string): string {
  const value = form.get(key);
  if (typeof value !== "string" || value.trim() === "") throw new HttpError(400, `${key} 为必填字段`);
  return value.trim();
}

function optionalFormText(form: FormData, key: string): string | null {
  const value = form.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function parseFormBool(value: string): boolean {
  if (value === "0") return false;
  if (value === "1") return true;
  throw new HttpError(400, "is_abnormal 只能为 '0' 或 '1'");
}

function compactTimestamp(): string {
  return new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
}

function safeFilename(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned || "upload.bin";
}

function contentTypeForFile(fileName: string, fileType: FileType): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return { image: "image/png", video: "video/mp4", audio: "audio/mpeg", document: "application/octet-stream", text: "text/plain" }[
    fileType
  ];
}

async function createKnowledge(env: Env, file: UploadedFile, createdAt: string): Promise<KnowledgeItem> {
  const title = `${file.device_name} - ${file.process_name} - ${file.title}`;
  const summary = `该知识条目来源于员工 ${file.uploader_name} 上传的 ${file.file_type} 数据，关联设备为 ${file.device_name}，关联工序为 ${file.process_name}，标签为 ${file.tags ?? "未填写"}。`;
  const result = await env.DB.prepare(
    `INSERT INTO knowledge_items
      (title, knowledge_type, source_file_id, device_name, process_name, contributor_id, contributor_name,
       tags, status, summary, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
  )
    .bind(
      title,
      SCENE_TO_KNOWLEDGE[file.scene_type],
      file.id,
      file.device_name,
      file.process_name,
      file.uploader_id,
      file.uploader_name,
      file.tags,
      summary,
      createdAt,
    )
    .run();
  return (await env.DB.prepare("SELECT * FROM knowledge_items WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first<KnowledgeItem>())!;
}

async function createAbnormalCase(env: Env, file: UploadedFile, createdAt: string): Promise<AbnormalCase> {
  const suggestion =
    file.risk_level === "high" || file.risk_level === "critical"
      ? "该异常风险等级较高，建议暂停相关操作，完成现场复核后再恢复生产。"
      : `该异常与 ${file.device_name} 的 ${file.process_name} 环节相关，建议班组长复核该操作，并将相关经验纳入培训材料。`;
  const result = await env.DB.prepare(
    `INSERT INTO abnormal_cases
      (source_file_id, title, device_name, process_name, risk_level, uploader_id, uploader_name,
       description, status, ai_suggestion, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
  )
    .bind(
      file.id,
      file.title,
      file.device_name,
      file.process_name,
      file.risk_level,
      file.uploader_id,
      file.uploader_name,
      file.description,
      suggestion,
      createdAt,
    )
    .run();
  return (await env.DB.prepare("SELECT * FROM abnormal_cases WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first<AbnormalCase>())!;
}

async function createScore(env: Env, file: UploadedFile, points: number, createdAt: string): Promise<void> {
  const actionType = boolResponse(file.is_abnormal) ? "upload_abnormal" : file.file_type === "video" ? "upload_video" : "upload_normal";
  const description = boolResponse(file.is_abnormal)
    ? `上传${riskLabel(file.risk_level)}异常案例：${file.title}`
    : file.file_type === "video"
      ? `上传视频资料：${file.title}`
      : `上传现场资料：${file.title}`;
  await env.DB.prepare(
    `INSERT INTO contribution_scores
      (user_id, user_name, action_type, points, related_file_id, description, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(file.uploader_id, file.uploader_name, actionType, points, file.id, description, createdAt)
    .run();
}

function calculatePoints(file: UploadedFile): number {
  let points = 5;
  if (file.file_type === "video") points += 5;
  if (file.scene_type === "standard_operation" || file.scene_type === "training_experience") points += 5;
  if (boolResponse(file.is_abnormal)) points += 10;
  if (file.risk_level === "high") points += 5;
  if (file.risk_level === "critical") points += 10;
  return points;
}

function riskLabel(riskLevel: RiskLevel | null): string {
  return { low: "低风险", medium: "中风险", high: "高风险", critical: "严重风险", none: "" }[riskLevel ?? "none"];
}

async function fetchUpload(env: Env, key: string): Promise<Response> {
  const object = await env.UPLOAD_BUCKET.get(key);
  if (!object) throw new HttpError(404, "文件不存在");
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
}

async function listFiles(request: Request, env: Env, url: URL): Promise<Response> {
  await getCurrentUser(request, env);
  const { where, values } = buildFileFilters(url);
  const limit = intParam(url, "limit", 20, 1, 100);
  const offset = intParam(url, "offset", 0, 0, 100000);
  const total = await countRows(env, "uploaded_files", where, values);
  const items = await env.DB.prepare(
    `SELECT * FROM uploaded_files ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
  )
    .bind(...values, limit, offset)
    .all<UploadedFile>();
  return jsonResponse({ items: items.results.map(normalizeFile), total }, request, env);
}

function buildFileFilters(url: URL): { where: string; values: unknown[] } {
  const clauses: string[] = [];
  const values: unknown[] = [];
  const userId = url.searchParams.get("user_id");
  const fileType = url.searchParams.get("file_type");
  const abnormal = url.searchParams.get("is_abnormal");
  const keyword = url.searchParams.get("keyword");

  if (userId) {
    clauses.push("uploader_id = ?");
    values.push(Number(userId));
  }
  if (fileType) {
    clauses.push("file_type = ?");
    values.push(fileType);
  }
  if (abnormal !== null) {
    if (abnormal !== "0" && abnormal !== "1") throw new HttpError(400, "is_abnormal 查询参数只能为 0 或 1");
    clauses.push("is_abnormal = ?");
    values.push(Number(abnormal));
  }
  if (keyword) {
    clauses.push("(title LIKE ? OR device_name LIKE ? OR process_name LIKE ? OR tags LIKE ? OR description LIKE ?)");
    values.push(...Array(5).fill(`%${keyword}%`));
  }

  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", values };
}

async function getFile(request: Request, env: Env, fileId: number): Promise<Response> {
  await getCurrentUser(request, env);
  const file = await env.DB.prepare("SELECT * FROM uploaded_files WHERE id = ?").bind(fileId).first<UploadedFile>();
  if (!file) throw new HttpError(404, "文件不存在");
  return jsonResponse(normalizeFile(file), request, env);
}

async function listKnowledge(request: Request, env: Env, url: URL): Promise<Response> {
  await getCurrentUser(request, env);
  const { where, values } = buildKnowledgeFilters(url);
  const limit = intParam(url, "limit", 20, 1, 100);
  const offset = intParam(url, "offset", 0, 0, 100000);
  const total = await countRows(env, "knowledge_items", where, values);
  const items = await env.DB.prepare(
    `SELECT * FROM knowledge_items ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
  )
    .bind(...values, limit, offset)
    .all<KnowledgeItem>();
  return jsonResponse({ items: items.results, total }, request, env);
}

function buildKnowledgeFilters(url: URL): { where: string; values: unknown[] } {
  const clauses: string[] = [];
  const values: unknown[] = [];
  const keyword = url.searchParams.get("keyword");
  const knowledgeType = url.searchParams.get("knowledge_type");
  const deviceName = url.searchParams.get("device_name");
  const status = url.searchParams.get("status");
  if (knowledgeType) {
    clauses.push("knowledge_type = ?");
    values.push(knowledgeType);
  }
  if (deviceName) {
    clauses.push("device_name = ?");
    values.push(deviceName);
  }
  if (status) {
    clauses.push("status = ?");
    values.push(status);
  }
  if (keyword) {
    clauses.push("(title LIKE ? OR device_name LIKE ? OR process_name LIKE ? OR tags LIKE ? OR summary LIKE ?)");
    values.push(...Array(5).fill(`%${keyword}%`));
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", values };
}

async function listAbnormal(request: Request, env: Env, url: URL): Promise<Response> {
  await getCurrentUser(request, env);
  const clauses: string[] = [];
  const values: unknown[] = [];
  for (const [param, column] of [
    ["risk_level", "risk_level"],
    ["status", "status"],
    ["device_name", "device_name"],
  ] as const) {
    const value = url.searchParams.get(param);
    if (value) {
      clauses.push(`${column} = ?`);
      values.push(value);
    }
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = intParam(url, "limit", 20, 1, 100);
  const offset = intParam(url, "offset", 0, 0, 100000);
  const total = await countRows(env, "abnormal_cases", where, values);
  const items = await env.DB.prepare(
    `SELECT * FROM abnormal_cases ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
  )
    .bind(...values, limit, offset)
    .all<AbnormalCase>();
  return jsonResponse({ items: items.results, total }, request, env);
}

async function countRows(env: Env, table: string, where: string, values: unknown[]): Promise<number> {
  const row = await env.DB.prepare(`SELECT COUNT(*) AS count FROM ${table} ${where}`).bind(...values).first<{ count: number }>();
  return Number(row?.count ?? 0);
}

async function listContributions(request: Request, env: Env, url: URL): Promise<Response> {
  const user = await getCurrentUser(request, env);
  const requestedUserId = url.searchParams.get("user_id");
  const effectiveUserId = requestedUserId ? Number(requestedUserId) : user.role === "employee" ? user.id : null;
  const where = effectiveUserId ? "WHERE user_id = ?" : "";
  const values = effectiveUserId ? [effectiveUserId] : [];
  const limit = intParam(url, "limit", 20, 1, 100);
  const offset = intParam(url, "offset", 0, 0, 100000);
  const total = await countRows(env, "contribution_scores", where, values);
  const points = await env.DB.prepare(`SELECT COALESCE(SUM(points), 0) AS total_points FROM contribution_scores ${where}`)
    .bind(...values)
    .first<{ total_points: number }>();
  const items = await env.DB.prepare(
    `SELECT * FROM contribution_scores ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
  )
    .bind(...values, limit, offset)
    .all();
  return jsonResponse({ items: items.results, total, total_points: Number(points?.total_points ?? 0) }, request, env);
}

async function dashboardSummary(request: Request, env: Env): Promise<Response> {
  await getCurrentUser(request, env);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayIso = today.toISOString();
  const [files, knowledge, abnormal, contributors, agentCalls, typeRows, riskRows] = await Promise.all([
    scalarCount(env, "SELECT COUNT(*) AS count FROM uploaded_files"),
    scalarCount(env, "SELECT COUNT(*) AS count FROM knowledge_items"),
    scalarCount(env, "SELECT COUNT(*) AS count FROM abnormal_cases"),
    scalarCount(env, "SELECT COUNT(DISTINCT uploader_id) AS count FROM uploaded_files"),
    scalarCount(env, "SELECT COUNT(*) AS count FROM agent_messages"),
    env.DB.prepare("SELECT file_type, COUNT(*) AS count FROM uploaded_files GROUP BY file_type").all<{ file_type: FileType; count: number }>(),
    env.DB.prepare("SELECT risk_level, COUNT(*) AS count FROM abnormal_cases GROUP BY risk_level").all<{ risk_level: RiskLevel; count: number }>(),
  ]);
  const todayUploads = await scalarCount(env, "SELECT COUNT(*) AS count FROM uploaded_files WHERE created_at >= ?", [todayIso]);

  const fileDistribution: Record<FileType, number> = { video: 0, image: 0, audio: 0, document: 0, text: 0 };
  for (const row of typeRows.results) if (row.file_type in fileDistribution) fileDistribution[row.file_type] = Number(row.count);
  const riskDistribution: Record<Exclude<RiskLevel, "none">, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const row of riskRows.results) {
    if (row.risk_level !== "none" && row.risk_level in riskDistribution) riskDistribution[row.risk_level] = Number(row.count);
  }

  return jsonResponse(
    {
      total_files: files,
      today_uploads: todayUploads,
      total_knowledge: knowledge,
      total_abnormal: abnormal,
      total_contributors: contributors,
      agent_calls: agentCalls,
      file_type_distribution: fileDistribution,
      risk_distribution: riskDistribution,
      daily_trend: await dailyTrend(env),
    },
    request,
    env,
  );
}

async function scalarCount(env: Env, sql: string, values: unknown[] = []): Promise<number> {
  const row = await env.DB.prepare(sql).bind(...values).first<{ count: number }>();
  return Number(row?.count ?? 0);
}

async function dailyTrend(env: Env): Promise<Array<{ date: string; uploads: number; knowledge: number; abnormal: number }>> {
  const result = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let daysBack = 6; daysBack >= 0; daysBack--) {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - daysBack);
    const next = new Date(day);
    next.setUTCDate(day.getUTCDate() + 1);
    const start = day.toISOString();
    const end = next.toISOString();
    result.push({
      date: start.slice(0, 10),
      uploads: await scalarCount(env, "SELECT COUNT(*) AS count FROM uploaded_files WHERE created_at >= ? AND created_at < ?", [start, end]),
      knowledge: await scalarCount(env, "SELECT COUNT(*) AS count FROM knowledge_items WHERE created_at >= ? AND created_at < ?", [start, end]),
      abnormal: await scalarCount(env, "SELECT COUNT(*) AS count FROM abnormal_cases WHERE created_at >= ? AND created_at < ?", [start, end]),
    });
  }
  return result;
}

async function recentUploads(request: Request, env: Env, url: URL): Promise<Response> {
  await getCurrentUser(request, env);
  const limit = intParam(url, "limit", 10, 1, 100);
  const rows = await env.DB.prepare(
    `SELECT id, title, file_type, uploader_name, device_name, process_name, is_abnormal, risk_level, created_at
     FROM uploaded_files ORDER BY created_at DESC, id DESC LIMIT ?`,
  )
    .bind(limit)
    .all<UploadedFile>();
  return jsonResponse({ items: rows.results.map(normalizeFile) }, request, env);
}

async function ranking(request: Request, env: Env, url: URL): Promise<Response> {
  await getCurrentUser(request, env);
  const limit = intParam(url, "limit", 10, 1, 100);
  const rows = await env.DB.prepare(
    `SELECT
       u.id AS user_id,
       u.name AS user_name,
       u.department AS department,
       COUNT(DISTINCT f.id) AS upload_count,
       COUNT(DISTINCT k.id) AS knowledge_count,
       COUNT(DISTINCT a.id) AS abnormal_count,
       COALESCE(SUM(s.points), 0) AS total_points
     FROM users u
     LEFT JOIN uploaded_files f ON f.uploader_id = u.id
     LEFT JOIN knowledge_items k ON k.contributor_id = u.id
     LEFT JOIN abnormal_cases a ON a.uploader_id = u.id
     LEFT JOIN contribution_scores s ON s.user_id = u.id
     WHERE u.role = 'employee'
     GROUP BY u.id
     ORDER BY total_points DESC, upload_count DESC
     LIMIT ?`,
  )
    .bind(limit)
    .all<Record<string, number | string | null>>();
  return jsonResponse(
    { items: rows.results.map((row, index) => ({ rank: index + 1, ...row })) },
    request,
    env,
  );
}

async function graph(request: Request, env: Env): Promise<Response> {
  await getCurrentUser(request, env);
  const abnormalCases = await env.DB.prepare(
    "SELECT * FROM abnormal_cases ORDER BY created_at DESC, id DESC LIMIT 4",
  ).all<AbnormalCase>();
  const nodes = new Map<string, { id: string; name: string; category: string }>();
  const links: Array<{ source: string; target: string; label: string }> = [];

  for (const abnormal of abnormalCases.results) {
    const knowledge = await env.DB.prepare("SELECT * FROM knowledge_items WHERE source_file_id = ?")
      .bind(abnormal.source_file_id)
      .first<KnowledgeItem>();
    const deviceId = `device_${abnormal.device_name}`;
    const processId = `process_${abnormal.process_name}`;
    const abnormalId = `abnormal_${abnormal.id}`;
    const riskId = `risk_${abnormal.risk_level}`;

    addNode(nodes, deviceId, abnormal.device_name ?? "未知设备", "device");
    addNode(nodes, processId, abnormal.process_name ?? "未知巡检环节", "process");
    addNode(nodes, abnormalId, abnormal.title ?? "未命名异常", "abnormal");
    addNode(nodes, riskId, graphRiskLabel(abnormal.risk_level), "risk");
    links.push({ source: deviceId, target: abnormalId, label: "出现问题" });
    links.push({ source: abnormalId, target: processId, label: "发生环节" });
    links.push({ source: abnormalId, target: riskId, label: "风险等级" });

    if (knowledge) {
      const knowledgeId = `knowledge_${knowledge.id}`;
      addNode(nodes, knowledgeId, knowledge.title, "knowledge");
      links.push({ source: abnormalId, target: knowledgeId, label: "沉淀知识" });
      links.push({ source: knowledgeId, target: processId, label: "复盘环节" });
    }
  }

  return jsonResponse({ nodes: [...nodes.values()], links }, request, env);
}

function addNode(nodes: Map<string, { id: string; name: string; category: string }>, id: string, name: string, category: string) {
  nodes.set(id, { id, name, category });
}

function graphRiskLabel(value: string | null): string {
  return {
    none: "无风险",
    low: "低风险",
    medium: "中风险",
    high: "高风险",
    critical: "严重风险",
  }[value ?? "none"] ?? "未知风险";
}

async function agentChat(request: Request, env: Env): Promise<Response> {
  const user = await getCurrentUser(request, env);
  const payload = (await request.json()) as AgentChatRequest;
  validateAgentPayload(payload);

  const mode = env.AGENT_MODE ?? "mock";
  let responseMode: "mock" | "proxy" | "mock_fallback" = "mock";
  let answer = mockAnswer(payload.role_type, payload.question);

  if (mode === "proxy" && env.AGENT_API_KEY) {
    try {
      answer = await proxyAgentAnswer(env, payload);
      responseMode = "proxy";
    } catch (error) {
      console.warn("Agent proxy failed", error instanceof Error ? error.message : String(error));
      responseMode = "mock_fallback";
      answer = mockAnswer(payload.role_type, payload.question);
    }
  }

  await env.DB.prepare(
    "INSERT INTO agent_messages (user_id, role_type, question, answer, mode, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(user.id, payload.role_type, payload.question, answer, responseMode, nowIso())
    .run();

  return jsonResponse(
    {
      answer,
      role_type: payload.role_type,
      mode: responseMode,
      suggestions: SUGGESTIONS[payload.role_type],
      sources:
        payload.role_type === "management_decision" || payload.role_type === "quality_supervisor"
          ? ["D1统计：近7天电力设备异常与贡献排行", "D1知识库：设备巡检与运行知识条目"]
          : ["D1知识库：电力设备标准巡检流程", "D1异常案例：主变测温与倒闸复核记录"],
    },
    request,
    env,
  );
}

function validateAgentPayload(payload: AgentChatRequest): void {
  if (!payload.question || typeof payload.question !== "string") throw new HttpError(422, "question 为必填字段");
  if (!AGENT_ROLES.has(payload.role_type)) throw new HttpError(422, "role_type 不在支持的枚举范围内");
  for (const attachment of payload.attachments ?? []) {
    if (!["image_url", "video_url", "audio_url"].includes(attachment.type)) throw new HttpError(422, "附件类型不合法");
    if (!attachment.url && attachment.file_id === undefined) throw new HttpError(422, "附件必须提供 url 或 file_id");
    if (attachment.url && attachment.file_id !== undefined) throw new HttpError(422, "附件 url 和 file_id 只能二选一");
  }
}

function mockAnswer(roleType: AgentRole, question: string): string {
  return `${MOCK_ANSWERS[roleType]} 当前问题：${question}`;
}

async function proxyAgentAnswer(env: Env, payload: AgentChatRequest): Promise<string> {
  const model = selectedAgentModel(env, payload);
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: await systemPrompt(env, payload.role_type) },
      { role: "user", content: await userContent(env, payload) },
    ],
    temperature: 0.2,
    max_tokens: intEnv(env.AGENT_MAX_TOKENS, 800, 1, 8192),
  };
  if (supportsEnableThinking(model)) body.enable_thinking = boolEnv(env.AGENT_ENABLE_THINKING, false);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(env.AGENT_TIMEOUT_SECONDS ?? "60") * 1000);
  try {
    const response = await fetch(`${(env.AGENT_API_BASE_URL ?? "https://api.siliconflow.cn/v1").replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AGENT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(await response.text());
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Agent API 返回为空");
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

function selectedAgentModel(env: Env, payload: AgentChatRequest): string {
  if ((payload.attachments ?? []).length > 0) {
    return env.AGENT_VISION_MODEL ?? env.AGENT_MODEL ?? "Qwen/Qwen3-VL-32B-Instruct";
  }
  return env.AGENT_TEXT_MODEL ?? "Qwen/Qwen3-30B-A3B-Instruct-2507";
}

async function systemPrompt(env: Env, roleType: AgentRole): Promise<string> {
  const recent = await env.DB.prepare("SELECT title FROM uploaded_files ORDER BY created_at DESC LIMIT 5").all<{ title: string }>();
  const abnormal = await env.DB.prepare("SELECT title FROM abnormal_cases ORDER BY created_at DESC LIMIT 5").all<{ title: string }>();
  const promptMap: Record<AgentRole, string> = {
    training_assistant: "你是电力工厂新员工培训助手，请给出分步骤学习建议并提示两票三制、电气五防和设备安全规范。",
    operation_qa: "你是电力运行一线操作问答助手，请优先提示安全风险、SOP步骤、复核点和升级汇报条件。",
    abnormal_alert: "你是电力设备异常提醒助手，请判断风险等级并给出立即处理、隔离复测和汇报建议。",
    quality_supervisor: "你是电力运行质量监督助手，请分析巡检、倒闸、监盘和消缺质量风险点、原因和改进建议。",
    management_decision: "你是电力工厂管理决策助手，请输出结论、依据、风险、建议和优先级。",
  };
  return `${promptMap[roleType]} 请只输出最终答案，不要输出推理过程或 <think> 标签。请使用 Markdown 组织答案，优先使用二级标题、要点列表和必要的表格。\n最近上传：${recent.results.map((row) => row.title).join("；")}\n异常案例：${abnormal.results.map((row) => row.title).join("；")}`;
}

function supportsEnableThinking(model: string): boolean {
  return ENABLE_THINKING_MODELS.has(model);
}

async function userContent(env: Env, payload: AgentChatRequest): Promise<string | Array<Record<string, unknown>>> {
  const attachments = payload.attachments ?? [];
  if (!attachments.length) return payload.question;
  const content = [];
  for (const attachment of attachments) content.push(await attachmentPart(env, attachment));
  content.push({ type: "text", text: payload.question });
  return content;
}

async function attachmentPart(env: Env, attachment: AgentAttachment): Promise<Record<string, unknown>> {
  const url = attachment.url ?? (await uploadedFileDataUrl(env, attachment));
  const value: Record<string, unknown> = { url };
  if (attachment.detail && (attachment.type === "image_url" || attachment.type === "video_url")) value.detail = attachment.detail;
  if (attachment.type === "video_url") {
    if (attachment.max_frames !== undefined) value.max_frames = attachment.max_frames;
    if (attachment.fps !== undefined) value.fps = attachment.fps;
  }
  return { type: attachment.type, [attachment.type]: value };
}

async function uploadedFileDataUrl(env: Env, attachment: AgentAttachment): Promise<string> {
  const file = await env.DB.prepare("SELECT * FROM uploaded_files WHERE id = ?").bind(attachment.file_id).first<UploadedFile>();
  if (!file || !file.storage_key) throw new HttpError(404, "Agent 附件文件不存在");
  const expected: Record<FileType, AgentAttachment["type"] | null> = {
    image: "image_url",
    video: "video_url",
    audio: "audio_url",
    document: null,
    text: null,
  };
  if (expected[file.file_type] !== attachment.type) throw new HttpError(400, "Agent 附件类型与已上传文件类型不匹配");
  const object = await env.UPLOAD_BUCKET.get(file.storage_key);
  if (!object) throw new HttpError(404, "Agent 附件文件不存在");
  const mime = object.httpMetadata?.contentType ?? contentTypeForFile(file.file_name ?? file.storage_key, file.file_type);
  const encoded = arrayBufferToBase64(await object.arrayBuffer());
  return `data:${mime};base64,${encoded}`;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

const SEED_USERS = [
  ["employee", "Demo@2026#IM-Safe", "employee", "张三", "集控运行一值", "巡检操作员"],
  ["admin", "Demo@2026#IM-Safe", "admin", "李经理", "发电运行部", "运行值长"],
  ["worker2", "Demo@2026#IM-Safe", "employee", "王师傅", "电气检修班", "资深电气检修工"],
  ["worker3", "Demo@2026#IM-Safe", "employee", "赵工", "继电保护班", "继保工程师"],
  ["worker4", "Demo@2026#IM-Safe", "employee", "刘班长", "锅炉运行二值", "运行班长"],
] as const;

const DEVICES = ["1号主变压器", "6kV厂用开关柜", "汽轮机给水泵", "锅炉引风机", "脱硫循环泵", "继电保护屏"];
const PROCESSES = ["红外测温巡检", "倒闸操作", "运行参数监盘", "异常缺陷处理", "保护压板核对", "润滑油系统点检", "电缆沟安全巡检"];
const NORMAL_SCENES: Array<[SceneType, FileType, string]> = [
  ["standard_operation", "video", "标准倒闸操作视频"],
  ["training_experience", "audio", "运行经验口述记录"],
  ["maintenance_record", "document", "检修消缺记录"],
  ["quality_inspection", "image", "红外测温记录"],
  ["other", "text", "巡检补充说明"],
];
const ABNORMAL_SCENES: Array<[SceneType, FileType, string, RiskLevel]> = [
  ["abnormal_operation", "image", "套管温升异常图片", "high"],
  ["fault_case", "document", "辅机跳闸处理记录", "medium"],
  ["abnormal_operation", "video", "倒闸操作票执行偏差视频", "critical"],
  ["quality_inspection", "image", "电缆沟积水隐患图片", "low"],
];

async function ensureSeeded(env: Env): Promise<void> {
  const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM users").first<{ count: number }>();
  if (Number(count?.count ?? 0) > 0) return;

  for (const user of SEED_USERS) {
    await env.DB.prepare(
      "INSERT INTO users (username, password, role, name, department, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(...user, nowIso())
      .run();
  }

  const users = await env.DB.prepare("SELECT * FROM users WHERE role = 'employee' ORDER BY id").all<User>();
  for (let index = 0; index < 60; index++) {
    const uploader = users.results[index % users.results.length];
    const device = DEVICES[index % DEVICES.length];
    const process = PROCESSES[index % PROCESSES.length];
    const isAbnormal = index % 4 === 1;
    const normal = NORMAL_SCENES[index % NORMAL_SCENES.length];
    const abnormal = ABNORMAL_SCENES[Math.floor(index / 4) % ABNORMAL_SCENES.length];
    const [sceneType, fileType, suffix, risk] = isAbnormal
      ? abnormal
      : [normal[0], normal[1], normal[2], "none" as RiskLevel];
    const title = `${device}${process}${suffix}${String(index + 1).padStart(2, "0")}`;
    const createdAt = daysAgoIso(index % 10);
    const seedFile = await seedStorageObject(env, index, title, fileType);

    const result = await env.DB.prepare(
      `INSERT INTO uploaded_files
        (title, file_name, file_type, file_url, storage_key, uploader_id, uploader_name, device_name,
         process_name, scene_type, is_abnormal, risk_level, tags, description, text_content, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        title,
        seedFile.fileName,
        fileType,
        seedFile.fileUrl,
        seedFile.storageKey,
        uploader.id,
        uploader.name,
        device,
        process,
        sceneType,
        isAbnormal ? 1 : 0,
        risk,
        `${device},${process},${tagForScene(sceneType)}`,
        `${device}在${process}环节的${suffix}，用于演示电力工厂运行、巡检、消缺和知识沉淀闭环。`,
        fileType === "text" ? `${title}：该文本经验用于说明电力设备巡检注意事项、复核要点和风险边界。` : null,
        createdAt,
      )
      .run();
    const file = (await env.DB.prepare("SELECT * FROM uploaded_files WHERE id = ?")
      .bind(result.meta.last_row_id)
      .first<UploadedFile>())!;
    await createKnowledge(env, file, createdAt);
    if (isAbnormal) await createAbnormalCase(env, file, createdAt);
    await createScore(env, file, calculatePoints(file), createdAt);
  }

  const roles: AgentRole[] = ["training_assistant", "operation_qa", "abnormal_alert", "quality_supervisor", "management_decision"];
  for (let index = 0; index < 12; index++) {
    const user = SEED_USERS[index % SEED_USERS.length];
    await env.DB.prepare(
      "INSERT INTO agent_messages (user_id, role_type, question, answer, mode, created_at) VALUES (?, ?, ?, ?, 'mock', ?)",
    )
      .bind(index + 1, roles[index % roles.length], `电力巡检演示问题 ${index + 1}`, "这是用于大屏统计的电力工厂历史 Agent mock 对话。", daysAgoIso(index % 7))
      .run();
  }
}

async function seedStorageObject(
  env: Env,
  index: number,
  title: string,
  fileType: FileType,
): Promise<{ fileName: string | null; fileUrl: string | null; storageKey: string | null }> {
  if (fileType === "text") return { fileName: null, fileUrl: null, storageKey: null };
  const extension = { video: ".mp4", image: ".png", audio: ".mp3", document: ".pdf", text: ".txt" }[fileType];
  const storageKey = `seed_${String(index + 1).padStart(2, "0")}${extension}`;
  await env.UPLOAD_BUCKET.put(storageKey, new TextEncoder().encode(`power plant seed placeholder for ${title}`), {
    httpMetadata: { contentType: contentTypeForFile(storageKey, fileType) },
  });
  return { fileName: storageKey, fileUrl: `/uploads/${storageKey}`, storageKey };
}

function tagForScene(sceneType: SceneType): string {
  return {
    standard_operation: "标准操作",
    abnormal_operation: "异常",
    training_experience: "培训",
    fault_case: "故障",
    quality_inspection: "质检",
    maintenance_record: "维护",
    other: "经验",
  }[sceneType];
}

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}
