import { ApartmentOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Row, Spin, Statistic } from "antd";
import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { GraphData } from "../../types";

const categoryColors: Record<string, string> = {
  employee: "#34d399",
  file: "#94a3b8",
  knowledge: "#22d3ee",
  device: "#3b82f6",
  process: "#8b5cf6",
  abnormal: "#f87171",
};

export default function AdminGraph() {
  const [loading, setLoading] = useState(true);
  const [graph, setGraph] = useState<GraphData | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api.graph();
      setGraph(data);
      setLoading(false);
    }

    void load();
  }, []);

  const categories = Array.from(new Set(graph?.nodes.map((node) => node.category) || []));
  const option = {
    backgroundColor: "transparent",
    tooltip: {},
    legend: [
      {
        data: categories,
        textStyle: { color: "#cbd5e1" },
      },
    ],
    series: [
      {
        type: "graph",
        layout: "force",
        roam: true,
        draggable: true,
        force: { repulsion: 180, edgeLength: 120 },
        categories: categories.map((name) => ({ name, itemStyle: { color: categoryColors[name] || "#cbd5e1" } })),
        label: { show: true, color: "#e2e8f0", overflow: "truncate", width: 120 },
        edgeLabel: {
          show: true,
          formatter: (params: { data?: { label?: string; name?: string } }) => params.data?.label || params.data?.name || "",
          color: "#94a3b8",
          fontSize: 11,
        },
        data: (graph?.nodes || []).map((node) => ({
          ...node,
          symbolSize: node.category === "knowledge" ? 52 : 44,
          itemStyle: { color: categoryColors[node.category] || "#cbd5e1" },
        })),
        links: graph?.links || [],
        lineStyle: { color: "#64748b", width: 1.2, curveness: 0.12 },
      },
    ],
  };

  return (
    <AppShell scope="admin" title="知识图谱" subtitle="动态组装员工、文件、知识、设备、工序和异常关系">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card className="metric-card">
              <Statistic title="节点" value={graph?.nodes.length || 0} prefix={<ApartmentOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="metric-card">
              <Statistic title="关系" value={graph?.links.length || 0} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="metric-card">
              <Statistic title="类型" value={categories.length} />
            </Card>
          </Col>
        </Row>

        <Card className="dashboard-card-dark section-spacing" title="动态知识图谱">
          {graph?.nodes.length ? <ReactECharts option={option} style={{ height: 620 }} /> : <Empty description="暂无图谱数据" />}
        </Card>
      </Spin>
    </AppShell>
  );
}
