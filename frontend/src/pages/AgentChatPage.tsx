import { InboxOutlined, SendOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, Tag, Upload, message } from "antd";
import type { UploadFile } from "antd";
import { useState } from "react";
import { api } from "../api/client";
import AgentMarkdown from "../components/AgentMarkdown";
import AppShell from "../layouts/AppShell";
import type { AgentAttachment, AgentChatResponse, AgentRoleType, FileType } from "../types";

type AgentChatPageProps = {
  scope: "employee" | "admin";
  title: string;
  defaultRole: AgentRoleType;
};

type ChatForm = {
  role_type: AgentRoleType;
  question: string;
  device_name?: string;
  process_name?: string;
};

type ChatItem = {
  id: number;
  side: "user" | "assistant";
  text: string;
  response?: AgentChatResponse;
};

const employeeRoleOptions = [
  { label: "新员工培训助手", value: "training_assistant" },
  { label: "操作问答助手", value: "operation_qa" },
  { label: "异常提醒助手", value: "abnormal_alert" },
];

const adminRoleOptions = [
  { label: "质量监督助手", value: "quality_supervisor" },
  { label: "管理决策支持", value: "management_decision" },
];

export default function AgentChatPage({ scope, title, defaultRole }: AgentChatPageProps) {
  const [form] = Form.useForm<ChatForm>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const roleOptions = scope === "admin" ? adminRoleOptions : employeeRoleOptions;

  const onFinish = async (values: ChatForm) => {
    const question = values.question.trim();
    if (!question) return;
    setSubmitting(true);
    try {
      const uploadedAttachments = await Promise.all(fileList.map(uploadAgentAttachment));
      const userMessage: ChatItem = {
        id: Date.now(),
        side: "user",
        text: uploadedAttachments.length ? `${question}\n已附加 ${uploadedAttachments.length} 个多模态文件` : question,
      };
      setMessages((current) => [...current, userMessage]);

      const response = await api.agentChat(values.role_type, question, {
        context: {
          device_name: values.device_name || undefined,
          process_name: values.process_name || undefined,
        },
        attachments: uploadedAttachments,
      });
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, side: "assistant", text: response.answer, response },
      ]);
      form.resetFields(["question"]);
      setFileList([]);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Agent 调用失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell scope={scope} title={title} subtitle="基于上传记录、知识条目和异常案例生成建议">
      <Row gutter={[18, 18]}>
        <Col xs={24} xl={15}>
          <Card className={scope === "admin" ? "dashboard-card-dark" : undefined} title="对话">
            <Space direction="vertical" size={12} className="full-width chat-list">
              {messages.length ? (
                messages.map((item) => <ChatBubble item={item} key={item.id} />)
              ) : (
                <Alert type="info" showIcon message="输入问题后开始对话，可附加图片、视频或音频文件。" />
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card className={scope === "admin" ? "dashboard-card-dark" : undefined} title="提问">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                role_type: defaultRole,
                question:
                  scope === "admin"
                    ? "根据最近电力设备异常和贡献排行，今天管理端应该优先关注什么？"
                    : "1号主变压器红外测温前需要检查什么？",
                device_name: "1号主变压器",
                process_name: "红外测温巡检",
              }}
              onFinish={onFinish}
            >
              <Form.Item name="role_type" label="Agent 角色" rules={[{ required: true }]}>
                <Select options={roleOptions} />
              </Form.Item>
              <Row gutter={12}>
                <Col xs={24} md={12} xl={24}>
                  <Form.Item name="device_name" label="设备">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} xl={24}>
                  <Form.Item name="process_name" label="工序">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="question" label="问题" rules={[{ required: true, message: "请输入问题" }]}>
                <Input.TextArea rows={5} />
              </Form.Item>
              <Form.Item label="多模态附件">
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
                  <p className="ant-upload-text">选择图片、视频或音频</p>
                </Upload.Dragger>
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submitting} block>
                发送
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </AppShell>
  );
}

function ChatBubble({ item }: { item: ChatItem }) {
  return (
    <div className={item.side === "user" ? "chat-bubble chat-bubble-user" : "chat-bubble chat-bubble-agent"}>
      {item.side === "assistant" ? <AgentMarkdown content={item.text} /> : <p>{item.text}</p>}
      {item.response ? (
        <Space direction="vertical" size={8} className="full-width">
          <Tag color={item.response.mode === "proxy" ? "green" : "gold"}>{item.response.mode}</Tag>
          <div>
            {item.response.sources.map((source) => (
              <Tag key={source}>{source}</Tag>
            ))}
          </div>
          <div className="suggestion-list">
            {item.response.suggestions.map((suggestion) => (
              <span key={suggestion}>{suggestion}</span>
            ))}
          </div>
        </Space>
      ) : null}
    </div>
  );
}

async function uploadAgentAttachment(file: UploadFile): Promise<AgentAttachment> {
  if (!file.originFileObj) throw new Error("附件文件不存在");
  const fileType = detectFileType(file);
  const attachmentType = attachmentTypeFor(fileType);
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
  return { type: attachmentType, file_id: uploaded.file.id, detail: "auto", max_frames: 6, fps: 1 };
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
