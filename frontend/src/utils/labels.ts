import dayjs from "dayjs";
import type { FileType, RiskLevel, SceneType } from "../types";

export const fileTypeLabel: Record<FileType, string> = {
  video: "视频",
  image: "图片",
  audio: "音频",
  document: "文档",
  text: "文本",
};

export const sceneTypeLabel: Record<SceneType, string> = {
  standard_operation: "标准操作",
  abnormal_operation: "异常操作",
  training_experience: "培训经验",
  fault_case: "故障案例",
  quality_inspection: "质检记录",
  maintenance_record: "维修记录",
  other: "其他",
};

export const riskLabel: Record<RiskLevel, string> = {
  none: "正常",
  low: "低风险",
  medium: "中风险",
  high: "高风险",
  critical: "严重",
};

export const riskColor: Record<RiskLevel, string> = {
  none: "default",
  low: "blue",
  medium: "gold",
  high: "red",
  critical: "volcano",
};

export const statusLabel: Record<string, string> = {
  pending: "待处理",
  processing: "处理中",
  resolved: "已解决",
  approved: "已沉淀",
  rejected: "已驳回",
};

export const formatTime = (value?: string | null) => (value ? dayjs(value).format("MM-DD HH:mm") : "-");
