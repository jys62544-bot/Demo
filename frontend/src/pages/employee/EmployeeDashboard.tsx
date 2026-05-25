import {
  ArrowRightOutlined,
  CloudUploadOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Statistic, Typography } from "antd";
import { Link } from "react-router-dom";
import AppShell from "../../layouts/AppShell";

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
  return (
    <AppShell
      scope="employee"
      title="员工首页"
      subtitle="先把现场数据提交进系统，让知识沉淀和管理端展示形成闭环"
    >
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
            <Statistic title="今日上传" value={3} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic title="知识贡献" value={12} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic title="贡献积分" value={285} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic title="AI 问答" value={8} suffix="次" />
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
    </AppShell>
  );
}
