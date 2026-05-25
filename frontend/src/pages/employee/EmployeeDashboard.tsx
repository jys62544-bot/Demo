import {
  ArrowRightOutlined,
  CloudUploadOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Empty, Row, Space, Spin, Statistic, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { DashboardSummary, RecentUpload } from "../../types";

const actions = [
  {
    title: "上传现场数据",
    description: "图片、视频、音频、文档和文本经验统一提交",
    icon: <CloudUploadOutlined />,
    to: "/employee/upload",
  },
  {
    title: "询问 AI 助手",
    description: "快速获得操作建议和异常处理参考",
    icon: <MessageOutlined />,
    to: "/employee/assistant",
  },
  {
    title: "查看我的贡献",
    description: "追踪积分、知识条目和上传历史",
    icon: <TrophyOutlined />,
    to: "/employee/contribution",
  },
];

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<RecentUpload[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [summaryData, recentData, contributionData] = await Promise.all([
        api.dashboardSummary(),
        api.recentUploads(5),
        api.contributions({ limit: 20 }),
      ]);
      setSummary(summaryData);
      setRecent(recentData);
      setPoints(contributionData.total_points);
      setLoading(false);
    }

    void load();
  }, []);

  return (
    <AppShell
      scope="employee"
      title="员工首页"
      subtitle="先把现场数据提交进系统，让知识沉淀和管理端展示形成闭环"
    >
      <Spin spinning={loading}>
        <section className="employee-hero-panel">
          <div>
            <Typography.Title level={2}>今日重点：上传一条异常现场记录</Typography.Title>
            <Typography.Paragraph>
              演示主线从员工端开始。提交异常图片后，系统会生成知识条目、增加积分，并同步到管理端异常案例。
            </Typography.Paragraph>
            <Button type="primary" size="large" icon={<CloudUploadOutlined />}>
              <Link to="/employee/upload">开始上传</Link>
            </Button>
          </div>
          <SafetyCertificateOutlined className="hero-line-icon" />
        </section>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} xl={6}>
            <Card>
              <Statistic title="今日上传" value={summary?.today_uploads || 0} suffix="条" />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card>
              <Statistic title="知识贡献" value={summary?.total_knowledge || 0} suffix="条" />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card>
              <Statistic title="贡献积分" value={points} />
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card>
              <Statistic title="AI 问答" value={summary?.agent_calls || 0} suffix="次" />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="section-spacing">
          {actions.map((action) => (
            <Col xs={24} lg={8} key={action.title}>
              <Card className="action-card">
                <Space align="start" size={14}>
                  <div className="action-icon">{action.icon}</div>
                  <div>
                    <Typography.Title level={4}>{action.title}</Typography.Title>
                    <Typography.Paragraph type="secondary">{action.description}</Typography.Paragraph>
                    <Link to={action.to}>
                      进入模块 <ArrowRightOutlined />
                    </Link>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="section-spacing" title="最近上传">
          <Table
            rowKey="id"
            dataSource={recent}
            pagination={false}
            locale={{ emptyText: <Empty description="暂无上传记录" /> }}
            columns={[
              { title: "标题", dataIndex: "title" },
              { title: "类型", dataIndex: "file_type", width: 100, render: (value: string) => <Tag>{value}</Tag> },
              { title: "设备", dataIndex: "device_name", width: 110 },
              {
                title: "风险",
                dataIndex: "risk_level",
                width: 100,
                render: (value: string, row: RecentUpload) => <Tag color={row.is_abnormal ? "red" : "green"}>{riskLabel(value)}</Tag>,
              },
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
