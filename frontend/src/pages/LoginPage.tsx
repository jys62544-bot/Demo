import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { App as AntApp, Button, Card, Form, Input, Segmented, Space, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";

type LoginForm = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const [rolePreset, setRolePreset] = useState<"employee" | "admin">("employee");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginForm>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { message } = AntApp.useApp();

  const applyPreset = (value: "employee" | "admin") => {
    setRolePreset(value);
    form.setFieldsValue({ username: value, password: "123456" });
  };

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      message.success(`已进入${result.user.role === "admin" ? "管理端" : "员工端"}`);
      navigate(result.user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard", { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-copy">
          <div className="login-kicker">Industrial Multimodal Intelligence</div>
          <Typography.Title className="login-title">工业现场多模态智能管理平台</Typography.Title>
          <Typography.Paragraph className="login-description">
            统一采集现场图片、视频、音频、文档与文本经验，沉淀知识资产，并用管理大屏呈现异常、贡献与 Agent 决策。
          </Typography.Paragraph>
          <div className="login-metrics">
            <div>
              <strong>5 min</strong>
              <span>演示闭环</span>
            </div>
            <div>
              <strong>5 类</strong>
              <span>多模态入口</span>
            </div>
            <div>
              <strong>2 端</strong>
              <span>员工与管理</span>
            </div>
          </div>
        </div>
        <Card className="login-card">
          <Space orientation="vertical" size={18} className="full-width">
            <div>
              <Typography.Title level={3} className="compact-title">
                登录 Demo
              </Typography.Title>
              <Typography.Text type="secondary">选择预置身份，快速进入演示流程。</Typography.Text>
            </div>
            <Segmented
              block
              value={rolePreset}
              onChange={(value) => applyPreset(value as "employee" | "admin")}
              options={[
                { label: "员工端", value: "employee" },
                { label: "管理端", value: "admin" },
              ]}
            />
            <Form
              form={form}
              layout="vertical"
              initialValues={{ username: "employee", password: "123456" }}
              onFinish={onFinish}
            >
              <Form.Item name="username" label="账号" rules={[{ required: true, message: "请输入账号" }]}>
                <Input size="large" prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }]}>
                <Input.Password size="large" prefix={<LockOutlined />} />
              </Form.Item>
              <Button type="primary" size="large" htmlType="submit" loading={loading} block>
                进入系统
              </Button>
            </Form>
          </Space>
        </Card>
      </section>
    </main>
  );
}
