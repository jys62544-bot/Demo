import { Card, Input, Space, Table, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { KnowledgeItem } from "../../types";
import { formatTime, statusLabel } from "../../utils/labels";

export default function AdminKnowledge() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.knowledge().then((data) => {
      setItems(data.items);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const text = keyword.trim();
    if (!text) return items;
    return items.filter((item) => `${item.title}${item.device_name}${item.process_name}${item.tags}`.includes(text));
  }, [items, keyword]);

  return (
    <AppShell scope="admin" title="知识库" subtitle="查看由现场上传自动沉淀的知识条目">
      <Card
        className="dashboard-card-dark"
        title="知识条目"
        extra={<Input.Search placeholder="搜索设备、工序、标签" onSearch={setKeyword} onChange={(e) => setKeyword(e.target.value)} />}
      >
        <Table
          rowKey="id"
          loading={loading}
          dataSource={filtered}
          pagination={{ pageSize: 8 }}
          columns={[
            {
              title: "知识标题",
              dataIndex: "title",
              render: (value: string, row) => (
                <Space orientation="vertical" size={2}>
                  <Typography.Text strong>{value}</Typography.Text>
                  <Typography.Text type="secondary">{row.summary}</Typography.Text>
                </Space>
              ),
            },
            { title: "类型", dataIndex: "knowledge_type", width: 110, render: (value) => <Tag color="blue">{value}</Tag> },
            { title: "设备", dataIndex: "device_name", width: 110 },
            { title: "工序", dataIndex: "process_name", width: 120 },
            { title: "贡献人", dataIndex: "contributor_name", width: 100 },
            {
              title: "状态",
              dataIndex: "status",
              width: 100,
              render: (value: string) => <Tag color={value === "approved" ? "green" : "gold"}>{statusLabel[value] || value}</Tag>,
            },
            { title: "时间", dataIndex: "created_at", width: 120, render: formatTime },
          ]}
        />
      </Card>
    </AppShell>
  );
}
