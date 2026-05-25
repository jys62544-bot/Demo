import axios from "axios";
import type {
  AgentChatResponse,
  AgentRoleType,
  DashboardSummary,
  GraphData,
  ListResponse,
  LoginResponse,
  RankingRow,
  RecentUpload,
  UploadResponse,
  User,
} from "../types";
import {
  createMockUpload,
  demoUsers,
  mockAgentAnswer,
  mockGraph,
  mockRanking,
  mockRecentUploads,
  mockSummary,
} from "./mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const FORCE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 8000,
});

export const mediaUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

const authHeader = () => {
  const token = localStorage.getItem("demo_token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const withMockFallback = async <T>(request: () => Promise<T>, fallback: () => T): Promise<T> => {
  if (FORCE_MOCK) return fallback();
  try {
    return await request();
  } catch {
    return fallback();
  }
};

export const api = {
  async login(username: string, password: string): Promise<LoginResponse> {
    return withMockFallback(
      async () => {
        const response = await client.post<LoginResponse>("/auth/login", { username, password });
        return response.data;
      },
      () => {
        const user = demoUsers[username];
        if (!user || password !== "123456") {
          throw new Error("用户名或密码错误");
        }
        return { token: `demo-token-${username}`, user };
      },
    );
  },

  async profile(): Promise<User> {
    return withMockFallback(
      async () => {
        const response = await client.get<User>("/user/profile", { headers: authHeader() });
        return response.data;
      },
      () => demoUsers.employee,
    );
  },

  async upload(formData: FormData): Promise<UploadResponse> {
    return withMockFallback(
      async () => {
        const response = await client.post<UploadResponse>("/upload", formData, {
          headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
        });
        return response.data;
      },
      () => {
        const file = createMockUpload(String(formData.get("title") || "设备A未闭合安全锁图片"));
        return {
          message: "上传成功",
          file,
          knowledge_item: {
            id: file.id,
            title: `${file.device_name} - ${file.process_name} - ${file.title}`,
            knowledge_type: "异常案例",
            source_file_id: file.id,
            device_name: file.device_name,
            process_name: file.process_name,
            contributor_id: 1,
            contributor_name: "张三",
            tags: file.tags,
            status: "pending",
            summary: "由演示上传自动生成的异常知识条目。",
            created_at: file.created_at,
          },
          abnormal_case: {
            id: file.id,
            source_file_id: file.id,
            title: file.title,
            device_name: file.device_name,
            process_name: file.process_name,
            risk_level: "high",
            uploader_id: 1,
            uploader_name: "张三",
            description: file.description,
            status: "pending",
            ai_suggestion: "建议复核开机前安全锁检查流程。",
            created_at: file.created_at,
          },
          score_added: 20,
        };
      },
    );
  },

  async dashboardSummary(): Promise<DashboardSummary> {
    return withMockFallback(
      async () => {
        const response = await client.get<DashboardSummary>("/dashboard/summary", { headers: authHeader() });
        return response.data;
      },
      () => mockSummary,
    );
  },

  async recentUploads(limit = 8): Promise<RecentUpload[]> {
    return withMockFallback(
      async () => {
        const response = await client.get<{ items: RecentUpload[] }>(`/dashboard/recent-uploads?limit=${limit}`, {
          headers: authHeader(),
        });
        return response.data.items;
      },
      () => mockRecentUploads,
    );
  },

  async ranking(limit = 5): Promise<RankingRow[]> {
    return withMockFallback(
      async () => {
        const response = await client.get<{ items: RankingRow[] }>(`/dashboard/ranking?limit=${limit}`, {
          headers: authHeader(),
        });
        return response.data.items;
      },
      () => mockRanking,
    );
  },

  async graph(): Promise<GraphData> {
    return withMockFallback(
      async () => {
        const response = await client.get<GraphData>("/dashboard/graph", { headers: authHeader() });
        return response.data;
      },
      () => mockGraph,
    );
  },

  async abnormalCases(): Promise<ListResponse<unknown>> {
    return withMockFallback(
      async () => {
        const response = await client.get<ListResponse<unknown>>("/abnormal-cases?limit=8", { headers: authHeader() });
        return response.data;
      },
      () => ({ items: [], total: 0 }),
    );
  },

  async agentChat(roleType: AgentRoleType, question: string): Promise<AgentChatResponse> {
    return withMockFallback(
      async () => {
        const response = await client.post<AgentChatResponse>(
          "/agent/chat",
          { role_type: roleType, question, context: {} },
          { headers: authHeader() },
        );
        return response.data;
      },
      () => ({ ...mockAgentAnswer, role_type: roleType }),
    );
  },
};
