import { RobotOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Card, Input, Segmented, Space, Tag, Typography } from "antd";
import { useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { AgentChatResponse, AgentRoleType } from "../../types";

export default function AdminDecisionAgent() {
  const [roleType, setRoleType] = useState<AgentRoleType>("management_decision");
  const [question, setQuestion] = useState("最近哪个工序异常最多？");
  const [answer, setAnswer] = useState<AgentChatResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    setLoading(true);
    const data = await api.agentChat(roleType, question);
    setAnswer(data);
    setLoading(false);
  };

  return (
    <AppShell scope="admin" title="Agent 决策" subtitle="把异常、贡献和知识数据转成结构化管理建议">
      <Card className="dashboard-card-dark">
        <Space orientation="vertical" size={16} className="full-width">
          <Segmented
            value={roleType}
            onChange={(value) => setRoleType(value as AgentRoleType)}
            options={[
              { label: "管理决策", value: "management_decision" },
              { label: "质量监督", value: "quality_supervisor" },
              { label: "异常预警", value: "abnormal_alert" },
            ]}
          />
          <Input.TextArea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} />
          <Button type="primary" icon={<SendOutlined />} loading={loading} onClick={ask}>
            生成决策建议
          </Button>
        </Space>
      </Card>
      {answer ? (
        <Card className="dashboard-card-dark section-spacing" title={<><RobotOutlined /> Agent 结果</>}>
          <Typography.Paragraph>{answer.answer}</Typography.Paragraph>
          <Space wrap>
            <Tag color={answer.mode === "proxy" ? "green" : "blue"}>{answer.mode}</Tag>
            {answer.sources.map((source) => (
              <Tag key={source}>{source}</Tag>
            ))}
          </Space>
          <div className="agent-suggestions">
            {answer.suggestions.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </Card>
      ) : null}
    </AppShell>
  );
}
