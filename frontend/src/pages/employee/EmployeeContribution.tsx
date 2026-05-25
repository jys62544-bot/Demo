import { CloudUploadOutlined, DatabaseOutlined, TrophyOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Row, Spin, Statistic, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import { useAuth } from "../../store/useAuth";
import type { Contribution, KnowledgeItem, UploadedFile } from "../../types";

export default function EmployeeContribution() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [contributionData, fileData, knowledgeData] = await Promise.all([
        api.contributions({ user_id: user?.id, limit: 20 }),
        api.files({ user_id: user?.id, limit: 10 }),
        api.knowledge({ limit: 10 }),
      ]);
      setTotalPoints(contributionData.total_points);
      setContributions(contributionData.items);
      setFiles(fileData.items);
      setKnowledge(knowledgeData.items.filter((item) => !user?.id || item.contributor_id === user.id));
      setLoading(false);
    }

    void load();
  }, [user?.id]);

  return (
    <AppShell scope="employee" title="我的贡献" subtitle="查看上传记录、贡献积分和沉淀出的知识条目">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="累计积分" value={totalPoints} prefix={<TrophyOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="上传记录" value={files.length} suffix="条" prefix={<CloudUploadOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="知识条目" value={knowledge.length} suffix="条" prefix={<DatabaseOutlined />} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="section-spacing">
          <Col xs={24} xl={13}>
            <Card title="积分明细">
              <Table
                rowKey="id"
                dataSource={contributions}
                pagination={false}
                locale={{ emptyText: <Empty description="暂无积分记录" /> }}
                columns={[
                  { title: "说明", dataIndex: "description" },
                  { title: "动作", dataIndex: "action_type", width: 120, render: (value: string) => <Tag>{value}</Tag> },
                  { title: "积分", dataIndex: "points", width: 90, render: (value: number) => <strong>+{value}</strong> },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} xl={11}>
            <Card title="最近上传">
              <Table
                rowKey="id"
                dataSource={files}
                pagination={false}
                locale={{ emptyText: <Empty description="暂无上传记录" /> }}
                columns={[
                  { title: "标题", dataIndex: "title" },
                  { title: "类型", dataIndex: "file_type", width: 90, render: (value: string) => <Tag>{value}</Tag> },
                  {
                    title: "风险",
                    dataIndex: "risk_level",
                    width: 100,
                    render: (value: string, row: UploadedFile) => <Tag color={row.is_abnormal ? "red" : "green"}>{riskLabel(value)}</Tag>,
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Card title="我的知识条目" className="section-spacing">
          <Table
            rowKey="id"
            dataSource={knowledge}
            pagination={false}
            locale={{ emptyText: <Empty description="暂无知识条目" /> }}
            columns={[
              { title: "标题", dataIndex: "title" },
              { title: "知识类型", dataIndex: "knowledge_type", width: 140, render: (value: string) => <Tag color="blue">{value}</Tag> },
              { title: "设备", dataIndex: "device_name", width: 120 },
              { title: "状态", dataIndex: "status", width: 100, render: (value: string) => <Tag>{value}</Tag> },
            ]}
          />
        </Card>
      </Spin>
    </AppShell>
  );
}

function riskLabel(value: string) {
  const labels: Record<string, string> = {
    none: "正常",
    low: "低风险",
    medium: "中风险",
    high: "高风险",
    critical: "严重",
  };
  return labels[value] || value;
}
