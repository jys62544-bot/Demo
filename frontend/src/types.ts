export type UserRole = "employee" | "admin";
export type FileType = "video" | "image" | "audio" | "document" | "text";
export type RiskLevel = "none" | "low" | "medium" | "high" | "critical";
export type SceneType =
  | "standard_operation"
  | "abnormal_operation"
  | "training_experience"
  | "fault_case"
  | "quality_inspection"
  | "maintenance_record"
  | "other";
export type AgentRoleType =
  | "training_assistant"
  | "operation_qa"
  | "abnormal_alert"
  | "quality_supervisor"
  | "management_decision";

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  department?: string | null;
  position?: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UploadedFile {
  id: number;
  title: string;
  file_name?: string | null;
  file_type: FileType;
  file_url?: string | null;
  uploader_id?: number | null;
  uploader_name?: string | null;
  device_name?: string | null;
  process_name?: string | null;
  scene_type?: SceneType | null;
  is_abnormal: boolean;
  risk_level: RiskLevel;
  tags?: string | null;
  description?: string | null;
  text_content?: string | null;
  created_at: string;
}

export interface KnowledgeItem {
  id: number;
  title: string;
  knowledge_type?: string | null;
  source_file_id?: number | null;
  device_name?: string | null;
  process_name?: string | null;
  contributor_id?: number | null;
  contributor_name?: string | null;
  tags?: string | null;
  status: string;
  summary?: string | null;
  created_at: string;
}

export interface AbnormalCase {
  id: number;
  source_file_id?: number | null;
  title?: string | null;
  device_name?: string | null;
  process_name?: string | null;
  risk_level?: RiskLevel | null;
  uploader_id?: number | null;
  uploader_name?: string | null;
  description?: string | null;
  status: string;
  ai_suggestion?: string | null;
  created_at: string;
}

export interface Contribution {
  id: number;
  user_id?: number | null;
  user_name?: string | null;
  action_type?: string | null;
  points: number;
  related_file_id?: number | null;
  description?: string | null;
  created_at: string;
}

export interface UploadResponse {
  message: string;
  file: UploadedFile;
  knowledge_item: KnowledgeItem;
  abnormal_case?: AbnormalCase | null;
  score_added: number;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface DashboardSummary {
  total_files: number;
  today_uploads: number;
  total_knowledge: number;
  total_abnormal: number;
  total_contributors: number;
  agent_calls: number;
  file_type_distribution: Record<FileType, number>;
  risk_distribution: Record<Exclude<RiskLevel, "none">, number>;
  daily_trend: Array<{
    date: string;
    uploads: number;
    knowledge: number;
    abnormal: number;
  }>;
}

export interface RecentUpload {
  id: number;
  title: string;
  file_type: FileType;
  uploader_name?: string | null;
  device_name?: string | null;
  process_name?: string | null;
  is_abnormal: boolean;
  risk_level: RiskLevel;
  created_at: string;
}

export interface RankingRow {
  rank: number;
  user_id: number;
  user_name: string;
  department?: string | null;
  upload_count: number;
  knowledge_count: number;
  abnormal_count: number;
  total_points: number;
}

export interface GraphNode {
  id: string;
  name: string;
  category: string;
  value?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  name?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  categories?: Array<{ name: string }>;
}

export interface AgentChatResponse {
  answer: string;
  role_type: AgentRoleType;
  mode: "mock" | "proxy" | "mock_fallback";
  suggestions: string[];
  sources: string[];
}
