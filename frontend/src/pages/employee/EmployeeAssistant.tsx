import { InboxOutlined, MessageOutlined, SendOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Input, Segmented, Space, Spin, Tag, Typography, Upload, message } from "antd";
import type { UploadFile } from "antd";
import { useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { AgentAttachment, AgentChatResponse, AgentRoleType, FileType } from "../../types";

export default function EmployeeAssistant() {
  const [roleType, setRoleType] = useState<AgentRoleType>("operation_qa");
  const [question, setQuestion] = useState("设备A开机检查前应该重点确认哪些风险？");
  const [answer, setAnswer] = useState<AgentChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    const text = question.trim();
    if (!text) {
      message.warning("请输入问题");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const attachments = await Promise.all(fileList.map(uploadAgentAttachment));
      const data = await api.agentChat(roleType, text, { attachments });
      setAnswer(data);
      setFileList([]);
    } catch (requestError) {
      const text = requestError instanceof Error ? requestError.message : "Agent 调用失败";
      setError(text);
      message.error("AI 助手暂时没有返回，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell scope="employee" title="AI 助手" subtitle="面向员工的现场操作问答和培训建议">
      <Card title="选择助手类型">
        <Space orientation="vertical" size={16} className="full-width">
          <Segmented
            value={roleType}
            onChange={(value) => setRoleType(value as AgentRoleType)}
            options={[
              { label: "操作问答", value: "operation_qa" },
              { label: "培训助手", value: "training_assistant" },
              { label: "异常提醒", value: "abnormal_alert" },
            ]}
          />
          <Input.TextArea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} />
          <Upload.Dragger
            beforeUpload={() => false}
            multiple
            maxCount={3}
            accept="image/*,video/*,audio/*"
            fileList={fileList}
            onChange={({ fileList: next }) => setFileList(next)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">可附加现场图片、视频或音频</p>
          </Upload.Dragger>
          <Button type="primary" icon={<SendOutlined />} loading={loading} onClick={ask}>
            询问 AI 助手
          </Button>
        </Space>
      </Card>
      <Card className="section-spacing" title={<><MessageOutlined /> 回复</>}>
        <Spin spinning={loading} tip="AI 正在生成回复，外部模型可能需要 10-30 秒">
          {error ? <Alert type="error" showIcon message="调用失败" description={error} /> : null}
          {answer ? (
            <>
              <Typography.Paragraph>{answer.answer}</Typography.Paragraph>
              <Space wrap>
                <Tag color={answer.mode === "proxy" ? "green" : "blue"}>{answer.mode}</Tag>
                {answer.sources.map((source) => (
                  <Tag key={source}>{source}</Tag>
                ))}
              </Space>
              <div className="agent-suggestions employee-suggestions">
                {answer.suggestions.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </>
          ) : !error ? (
            <Alert type="info" showIcon message="回复会显示在这里" description="点击“询问 AI 助手”后等待生成结果。" />
          ) : null}
        </Spin>
      </Card>
    </AppShell>
  );
}

async function uploadAgentAttachment(file: UploadFile): Promise<AgentAttachment> {
  if (!file.originFileObj) throw new Error("附件文件不存在");
  const fileType = detectFileType(file);
  const formData = new FormData();
  formData.append("title", `Agent附件-${file.name}`);
  formData.append("file_type", fileType);
  formData.append("device_name", "Agent对话附件");
  formData.append("process_name", "智能问答");
  formData.append("scene_type", "other");
  formData.append("is_abnormal", "0");
  formData.append("risk_level", "none");
  formData.append("description", "Agent 聊天上传的多模态附件");
  formData.append("file", file.originFileObj);
  const uploaded = await api.upload(formData);
  return { type: attachmentTypeFor(fileType), file_id: uploaded.file.id, detail: "auto", max_frames: 6, fps: 1 };
}

function detectFileType(file: UploadFile): Extract<FileType, "image" | "video" | "audio"> {
  const mime = file.type || "";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  throw new Error("Agent 附件仅支持图片、视频或音频");
}

function attachmentTypeFor(fileType: Extract<FileType, "image" | "video" | "audio">): AgentAttachment["type"] {
  if (fileType === "image") return "image_url";
  if (fileType === "video") return "video_url";
  return "audio_url";
}
