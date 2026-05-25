import { TrophyOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { RankingRow } from "../../types";

export default function AdminRanking() {
  const [items, setItems] = useState<RankingRow[]>([]);

  useEffect(() => {
    api.ranking(20).then(setItems);
  }, []);

  const leader = items[0];

  return (
    <AppShell scope="admin" title="贡献排行榜" subtitle="把员工上传、知识沉淀和异常发现转化为可展示贡献">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="metric-card">
            <Statistic title="榜首员工" value={leader?.user_name || "-"} prefix={<TrophyOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="metric-card">
            <Statistic title="最高积分" value={leader?.total_points || 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="metric-card">
            <Statistic title="上榜人数" value={items.length} suffix="人" />
          </Card>
        </Col>
      </Row>
      <Card className="dashboard-card-dark section-spacing" title="员工贡献总榜">
        <Table
          rowKey="user_id"
          dataSource={items}
          pagination={false}
          columns={[
            { title: "排名", dataIndex: "rank", width: 80, render: (rank) => <Tag color={rank <= 3 ? "gold" : "blue"}>#{rank}</Tag> },
            { title: "姓名", dataIndex: "user_name" },
            { title: "部门", dataIndex: "department" },
            { title: "上传数", dataIndex: "upload_count" },
            { title: "知识数", dataIndex: "knowledge_count" },
            { title: "异常数", dataIndex: "abnormal_count" },
            { title: "总积分", dataIndex: "total_points", render: (value) => <strong>{value}</strong> },
          ]}
        />
      </Card>
    </AppShell>
  );
}
