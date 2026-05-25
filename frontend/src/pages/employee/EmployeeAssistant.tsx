import { MessageOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Card, Input, Segmented, Space, Tag, Typography } from "antd";
import { useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { AgentChatResponse, AgentRoleType } from "../../types";

export default function EmployeeAssistant() {
  const [roleType, setRoleType] = useState<AgentRoleType>("operation_qa");
  const [question, setQuestion] = useState("设备A开机检查前应该重点确认哪些风险？");
  const [answer, setAnswer] = useState<AgentChatResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    setLoading(true);
    const data = await api.agentChat(roleType, question);
    setAnswer(data);
    setLoading(false);
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
          <Button type="primary" icon={<SendOutlined />} loading={loading} onClick={ask}>
            询问 AI 助手
          </Button>
        </Space>
      </Card>
      {answer ? (
        <Card className="section-spacing" title={<><MessageOutlined /> 回答</>}>
          <Typography.Paragraph>{answer.answer}</Typography.Paragraph>
          <Space wrap>
            <Tag color="green">{answer.mode}</Tag>
            {answer.sources.map((source) => (
              <Tag key={source}>{source}</Tag>
            ))}
          </Space>
          <div className="agent-suggestions employee-suggestions">
            {answer.suggestions.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </Card>
      ) : null}
    </AppShell>
  );
}
