import { AlertOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Form, Input, Select, Space, Spin, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { AbnormalCase } from "../../types";

type SearchForm = {
  device_name?: string;
  risk_level?: string;
  status?: string;
};

const riskColor: Record<string, string> = {
  low: "blue",
  medium: "gold",
  high: "red",
  critical: "volcano",
};

export default function AdminAbnormal() {
  const [form] = Form.useForm<SearchForm>();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AbnormalCase[]>([]);
  const [total, setTotal] = useState(0);

  const handleSearch = async (values: SearchForm = {}) => {
    setLoading(true);
    const data = await api.abnormalCases({ ...values, limit: 50 });
    setItems(data.items);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    api.abnormalCases({ limit: 50 }).then((data) => {
      if (cancelled) return;
      setItems(data.items);
      setTotal(data.total);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell scope="admin" title="异常案例" subtitle="自动汇聚上传中标记为异常的现场记录">
      <Card className="dashboard-card-dark">
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="device_name">
            <Input prefix={<SearchOutlined />} placeholder="设备名称" allowClear />
          </Form.Item>
          <Form.Item name="risk_level">
            <Select
              placeholder="风险等级"
              allowClear
              style={{ width: 140 }}
              options={[
                { label: "低风险", value: "low" },
                { label: "中风险", value: "medium" },
                { label: "高风险", value: "high" },
                { label: "严重", value: "critical" },
              ]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 140 }}
              options={[
                { label: "待处理", value: "pending" },
                { label: "处理中", value: "processing" },
                { label: "已关闭", value: "closed" },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            查询
          </Button>
        </Form>
      </Card>

      <Card className="dashboard-card-dark section-spacing" title={`异常案例 ${total}`}>
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            dataSource={items}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="暂无异常案例" /> }}
            columns={[
              {
                title: "案例",
                dataIndex: "title",
                render: (value: string, row: AbnormalCase) => (
                  <Space direction="vertical" size={2}>
                    <span>{value}</span>
                    <span className="muted-small">{row.description}</span>
                  </Space>
                ),
              },
              { title: "设备", dataIndex: "device_name", width: 110 },
              { title: "工序", dataIndex: "process_name", width: 130 },
              {
                title: "风险",
                dataIndex: "risk_level",
                width: 110,
                render: (value: string) => <Tag color={riskColor[value]}>{riskLabel(value)}</Tag>,
              },
              { title: "上传人", dataIndex: "uploader_name", width: 110 },
              { title: "状态", dataIndex: "status", width: 100, render: (value: string) => <Tag icon={<AlertOutlined />}>{value}</Tag> },
            ]}
          />
        </Spin>
      </Card>
    </AppShell>
  );
}

function riskLabel(value: string) {
  const labels: Record<string, string> = {
    low: "低风险",
    medium: "中风险",
    high: "高风险",
    critical: "严重",
  };
  return labels[value] || value;
}
