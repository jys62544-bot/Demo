import { TeamOutlined, TrophyOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Row, Spin, Statistic, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { RankingRow } from "../../types";

export default function AdminRanking() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RankingRow[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api.ranking(20);
      setItems(data);
      setLoading(false);
    }

    void load();
  }, []);

  const top = items[0];

  return (
    <AppShell scope="admin" title="贡献排行榜" subtitle="按上传、知识沉淀、异常案例和积分综合排序">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card className="metric-card">
              <Statistic title="参与员工" value={items.length} suffix="人" prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="metric-card">
              <Statistic title="最高积分" value={top?.total_points || 0} prefix={<TrophyOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="metric-card">
              <Statistic title="冠军员工" value={top?.user_name || "-"} />
            </Card>
          </Col>
        </Row>

        <Card className="dashboard-card-dark section-spacing" title="总榜">
          <Table
            rowKey="user_id"
            dataSource={items}
            pagination={false}
            locale={{ emptyText: <Empty description="暂无排行数据" /> }}
            columns={[
              { title: "排名", dataIndex: "rank", width: 90, render: (value: number) => <Tag color="blue">#{value}</Tag> },
              { title: "姓名", dataIndex: "user_name" },
              { title: "部门", dataIndex: "department" },
              { title: "上传数", dataIndex: "upload_count", width: 100 },
              { title: "知识数", dataIndex: "knowledge_count", width: 100 },
              { title: "异常数", dataIndex: "abnormal_count", width: 100 },
              { title: "总积分", dataIndex: "total_points", width: 120, render: (value: number) => <strong>{value}</strong> },
            ]}
          />
        </Card>
      </Spin>
    </AppShell>
  );
}
