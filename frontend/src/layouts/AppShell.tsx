import {
  AlertOutlined,
  ApartmentOutlined,
  BarChartOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  HomeOutlined,
  LogoutOutlined,
  MessageOutlined,
  RobotOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Space, Tag, Typography } from "antd";
import type { MenuProps } from "antd";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";

const { Header, Sider, Content } = Layout;

interface AppShellProps {
  scope: "employee" | "admin";
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AppShell({ scope, title, subtitle, children }: AppShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dark = scope === "admin";

  const items: MenuProps["items"] =
    scope === "admin"
      ? [
          { key: "/admin/dashboard", icon: <BarChartOutlined />, label: <Link to="/admin/dashboard">管理驾驶舱</Link> },
          { key: "/admin/knowledge", icon: <DatabaseOutlined />, label: <Link to="/admin/knowledge">知识库</Link> },
          { key: "/admin/graph", icon: <ApartmentOutlined />, label: <Link to="/admin/graph">知识图谱</Link> },
          { key: "/admin/abnormal", icon: <AlertOutlined />, label: <Link to="/admin/abnormal">异常案例</Link> },
          { key: "/admin/ranking", icon: <TrophyOutlined />, label: <Link to="/admin/ranking">贡献排行</Link> },
          { key: "/admin/decision-agent", icon: <RobotOutlined />, label: <Link to="/admin/decision-agent">Agent 决策</Link> },
        ]
      : [
          { key: "/employee/dashboard", icon: <HomeOutlined />, label: <Link to="/employee/dashboard">员工首页</Link> },
          { key: "/employee/upload", icon: <CloudUploadOutlined />, label: <Link to="/employee/upload">现场上传</Link> },
          { key: "/employee/assistant", icon: <MessageOutlined />, label: <Link to="/employee/assistant">AI 助手</Link> },
          { key: "/employee/contribution", icon: <TrophyOutlined />, label: <Link to="/employee/contribution">我的贡献</Link> },
        ];

  return (
    <Layout className={dark ? "app-shell app-shell-admin" : "app-shell app-shell-employee"}>
      <Sider width={236} className="app-sider" theme={dark ? "dark" : "light"}>
        <div className="brand-block">
          <div className="brand-mark">IM</div>
          <div>
            <div className="brand-title">工业智管 Demo</div>
            <div className="brand-subtitle">{dark ? "管理端" : "员工端"}</div>
          </div>
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={items} theme={dark ? "dark" : "light"} />
      </Sider>
      <Layout>
        <Header className="app-header">
          <div>
            <Typography.Title level={3} className="page-title">
              {title}
            </Typography.Title>
            {subtitle ? <div className="page-subtitle">{subtitle}</div> : null}
          </div>
          <Space size={12}>
            <Tag color={dark ? "geekblue" : "green"}>{user?.department || "Demo Team"}</Tag>
            <Space className="user-chip">
              <UserOutlined />
              <span>{user?.name}</span>
            </Space>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              退出
            </Button>
          </Space>
        </Header>
        <Content className="app-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
