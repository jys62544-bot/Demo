import { DatabaseOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Form, Input, Select, Space, Spin, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { KnowledgeItem } from "../../types";

type SearchForm = {
  keyword?: string;
  status?: string;
};

export default function AdminKnowledge() {
  const [form] = Form.useForm<SearchForm>();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [total, setTotal] = useState(0);

  const handleSearch = async (values: SearchForm = {}) => {
    setLoading(true);
    const data = await api.knowledge({ ...values, limit: 50 });
    setItems(data.items);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    api.knowledge({ limit: 50 }).then((data) => {
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
    <AppShell scope="admin" title="知识库" subtitle="从多模态上传自动沉淀出的现场知识条目">
      <Card className="dashboard-card-dark">
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="标题、设备、工序、标签" allowClear />
          </Form.Item>
          <Form.Item name="status">
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 140 }}
              options={[
                { label: "待审核", value: "pending" },
                { label: "已通过", value: "approved" },
                { label: "已归档", value: "archived" },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            查询
          </Button>
        </Form>
      </Card>

      <Card className="dashboard-card-dark section-spacing" title={`知识条目 ${total}`}>
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            dataSource={items}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="暂无知识条目" /> }}
            columns={[
              {
                title: "标题",
                dataIndex: "title",
                render: (value: string, row: KnowledgeItem) => (
                  <Space direction="vertical" size={2}>
                    <span>{value}</span>
                    <span className="muted-small">{row.summary}</span>
                  </Space>
                ),
              },
              { title: "类型", dataIndex: "knowledge_type", width: 140, render: (value: string) => <Tag color="cyan">{value}</Tag> },
              { title: "设备", dataIndex: "device_name", width: 120 },
              { title: "工序", dataIndex: "process_name", width: 130 },
              { title: "贡献人", dataIndex: "contributor_name", width: 110 },
              { title: "状态", dataIndex: "status", width: 100, render: (value: string) => <Tag icon={<DatabaseOutlined />}>{value}</Tag> },
            ]}
          />
        </Spin>
      </Card>
    </AppShell>
  );
}
