import { Card, Col, Row, Statistic } from "antd";
import ReactECharts from "echarts-for-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { GraphData } from "../../types";

const categoryColor: Record<string, string> = {
  employee: "#38bdf8",
  file: "#22c55e",
  knowledge: "#a78bfa",
  device: "#f59e0b",
  process: "#f43f5e",
};

export default function AdminGraph() {
  const [graph, setGraph] = useState<GraphData>({ nodes: [], links: [] });

  useEffect(() => {
    api.graph().then(setGraph);
  }, []);

  const option = useMemo(
    () => ({
      tooltip: {},
      legend: [
        {
          data: [...new Set(graph.nodes.map((node) => node.category))],
          textStyle: { color: "#cbd5e1" },
        },
      ],
      series: [
        {
          type: "graph",
          layout: "force",
          roam: true,
          draggable: true,
          categories: [...new Set(graph.nodes.map((node) => node.category))].map((name) => ({ name })),
          data: graph.nodes.map((node) => ({
            ...node,
            symbolSize: node.value || 44,
            itemStyle: { color: categoryColor[node.category] || "#94a3b8" },
            label: { show: true, color: "#e2e8f0" },
          })),
          links: graph.links,
          edgeLabel: { show: true, formatter: "{c}", color: "#94a3b8" },
          lineStyle: { color: "source", opacity: 0.55 },
          force: { repulsion: 220, edgeLength: 120 },
        },
      ],
    }),
    [graph],
  );

  return (
    <AppShell scope="admin" title="知识图谱" subtitle="把员工、文件、知识、设备和工序串成可讲解的关系网络">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="metric-card">
            <Statistic title="节点数量" value={graph.nodes.length} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="metric-card">
            <Statistic title="关系数量" value={graph.links.length} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="metric-card">
            <Statistic title="关系类型" value={new Set(graph.nodes.map((node) => node.category)).size} suffix="类" />
          </Card>
        </Col>
      </Row>
      <Card className="dashboard-card-dark section-spacing" title="现场知识关系图">
        <ReactECharts option={option} style={{ height: 560 }} />
      </Card>
    </AppShell>
  );
}
