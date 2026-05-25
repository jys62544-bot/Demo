import { AlertOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Table, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { AbnormalCase, RiskLevel } from "../../types";
import { formatTime, riskColor, riskLabel, statusLabel } from "../../utils/labels";

export default function AdminAbnormal() {
  const [items, setItems] = useState<AbnormalCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.abnormalCases().then((data) => {
      setItems(data.items);
      setLoading(false);
    });
  }, []);

  const counts = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      const key = item.risk_level || "none";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  return (
    <AppShell scope="admin" title="异常案例" subtitle="按风险等级查看异常记录和 AI 建议">
      <Row gutter={[16, 16]}>
        {(["medium", "high", "critical"] as RiskLevel[]).map((level) => (
          <Col xs={24} md={8} key={level}>
            <Card className="metric-card">
              <Statistic
                title={riskLabel[level]}
                value={counts[level] || 0}
                prefix={<AlertOutlined />}
                suffix="条"
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Card className="dashboard-card-dark section-spacing" title="异常案例列表">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={items}
          pagination={{ pageSize: 8 }}
          columns={[
            {
              title: "案例",
              dataIndex: "title",
              render: (value: string, row) => (
                <div>
                  <Typography.Text strong>{value}</Typography.Text>
                  <div className="muted-small">{row.description}</div>
                </div>
              ),
            },
            { title: "设备", dataIndex: "device_name", width: 110 },
            { title: "工序", dataIndex: "process_name", width: 120 },
            {
              title: "风险",
              dataIndex: "risk_level",
              width: 100,
              render: (value: RiskLevel) => <Tag color={riskColor[value]}>{riskLabel[value]}</Tag>,
            },
            {
              title: "状态",
              dataIndex: "status",
              width: 100,
              render: (value: string) => <Tag color={value === "resolved" ? "green" : "gold"}>{statusLabel[value] || value}</Tag>,
            },
            { title: "AI 建议", dataIndex: "ai_suggestion", responsive: ["lg"] },
            { title: "时间", dataIndex: "created_at", width: 120, render: formatTime },
          ]}
        />
      </Card>
    </AppShell>
  );
}
