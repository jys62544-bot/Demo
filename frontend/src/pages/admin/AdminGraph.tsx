import { ApartmentOutlined, DatabaseOutlined, FileTextOutlined, ToolOutlined, UserOutlined, WarningOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Row, Space, Statistic, Table, Tag, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { GraphData, GraphLink, GraphNode } from "../../types";

const categoryMeta: Record<
  string,
  {
    label: string;
    color: string;
    icon: ReactNode;
    description: string;
    size: number;
  }
> = {
  employee: { label: "员工", color: "#38bdf8", icon: <UserOutlined />, description: "现场数据贡献人", size: 58 },
  file: { label: "文件", color: "#22c55e", icon: <FileTextOutlined />, description: "上传的多模态资料", size: 50 },
  knowledge: { label: "知识", color: "#a78bfa", icon: <DatabaseOutlined />, description: "系统沉淀的知识条目", size: 64 },
  device: { label: "设备", color: "#f59e0b", icon: <ToolOutlined />, description: "关联设备资产", size: 52 },
  process: { label: "工序", color: "#fb7185", icon: <ApartmentOutlined />, description: "现场作业环节", size: 52 },
  abnormal: { label: "问题", color: "#ef4444", icon: <WarningOutlined />, description: "异常现象与缺陷案例", size: 58 },
  risk: { label: "风险", color: "#facc15", icon: <WarningOutlined />, description: "问题处置优先级", size: 48 },
};

type GraphFormatterParams = {
  dataType?: "node" | "edge";
  data?: Partial<GraphNode & GraphLink> & { category?: string; value?: string | number };
  name?: string;
};

export default function AdminGraph() {
  const [graph, setGraph] = useState<GraphData>({ nodes: [], links: [] });
  const [compactGraph, setCompactGraph] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);

  useEffect(() => {
    api.graph().then(setGraph);
  }, []);

  useEffect(() => {
    const handleResize = () => setCompactGraph(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const categories = useMemo(() => [...new Set(graph.nodes.map((node) => node.category))], [graph.nodes]);
  const nodeNameMap = useMemo(() => new Map(graph.nodes.map((node) => [node.id, node.name])), [graph.nodes]);
  const relationRows = useMemo(
    () =>
      graph.links.map((link, index) => ({
        key: `${link.source}-${link.target}-${index}`,
        sourceName: nodeNameMap.get(String(link.source)) || String(link.source),
        relation: link.label || link.name || "关联",
        targetName: nodeNameMap.get(String(link.target)) || String(link.target),
      })),
    [graph.links, nodeNameMap],
  );
  const relationTypeCount = useMemo(
    () => new Set(graph.links.map((link) => link.label || link.name || "关联")).size,
    [graph.links],
  );

  const option = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        confine: true,
        backgroundColor: "rgba(2, 6, 23, 0.96)",
        borderColor: "rgba(148, 163, 184, 0.28)",
        textStyle: { color: "#e2e8f0" },
        formatter: (params: GraphFormatterParams) => {
          if (params.dataType === "edge") {
            const data = params.data;
            const source = nodeNameMap.get(String(data?.source)) || data?.source;
            const target = nodeNameMap.get(String(data?.target)) || data?.target;
            return `${source}<br/><span style="color:#fbbf24">${data?.label || data?.name || "关联"}</span><br/>${target}`;
          }
          const data = params.data;
          const meta = data?.category ? categoryMeta[data.category] : undefined;
          return `${meta?.label || data?.category || "节点"}<br/><strong>${data?.name || params.name}</strong>`;
        },
      },
      legend: [
        {
          top: 0,
          left: 4,
          icon: "circle",
          itemWidth: 10,
          itemHeight: 10,
          data: categories,
          formatter: (name: string) => categoryMeta[name]?.label || name,
          textStyle: { color: "#cbd5e1", fontSize: 12 },
        },
      ],
      series: [
        {
          name: "现场知识网络",
          type: "graph",
          layout: "force",
          top: 52,
          bottom: 18,
          left: 12,
          right: 12,
          roam: true,
          draggable: true,
          focusNodeAdjacency: true,
          categories: categories.map((name) => ({ name })),
          data: graph.nodes.map((node) => ({
            ...node,
            symbolSize: node.value || categoryMeta[node.category]?.size || 46,
            itemStyle: {
              color: categoryMeta[node.category]?.color || "#94a3b8",
              borderColor: "rgba(248, 250, 252, 0.78)",
              borderWidth: 2,
              shadowBlur: 18,
              shadowColor: `${categoryMeta[node.category]?.color || "#94a3b8"}66`,
            },
            label: {
              show: !compactGraph,
              position: "right",
              distance: 8,
              formatter: truncateLabel(node.name),
              color: "#f8fafc",
              fontSize: 12,
              lineHeight: 16,
              backgroundColor: "rgba(15, 23, 42, 0.76)",
              borderColor: "rgba(148, 163, 184, 0.22)",
              borderWidth: 1,
              borderRadius: 4,
              padding: [3, 7],
            },
            emphasis: {
              scale: 1.08,
              label: { color: "#ffffff", fontWeight: 700 },
              itemStyle: { borderColor: "#ffffff", borderWidth: 3 },
            },
          })),
          links: graph.links.map((link) => ({
            ...link,
            value: link.label || link.name || "关联",
            lineStyle: {
              color: "rgba(148, 163, 184, 0.5)",
              width: 1.6,
              curveness: 0.13,
            },
            emphasis: {
              lineStyle: { color: "#fbbf24", width: 3, opacity: 0.95 },
            },
          })),
          edgeSymbol: ["none", "arrow"],
          edgeSymbolSize: [0, 7],
          edgeLabel: {
            show: !compactGraph,
            formatter: (params: GraphFormatterParams) => String(params.data?.value || ""),
            color: "#cbd5e1",
            fontSize: 11,
            backgroundColor: "rgba(15, 23, 42, 0.82)",
            borderColor: "rgba(148, 163, 184, 0.16)",
            borderWidth: 1,
            borderRadius: 4,
            padding: [2, 5],
          },
          lineStyle: { opacity: 0.64 },
          force: {
            repulsion: compactGraph ? 290 : 420,
            gravity: 0.08,
            edgeLength: compactGraph ? [86, 132] : [120, 190],
            friction: 0.72,
          },
        },
      ],
    }),
    [categories, compactGraph, graph, nodeNameMap],
  );

  return (
    <AppShell scope="admin" title="知识图谱" subtitle="围绕电力设备异常，展示问题、巡检环节、风险等级和处置知识之间的联系">
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
            <Statistic title="关系类型" value={relationTypeCount} suffix="类" />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="section-spacing">
        <Col xs={24} xl={17}>
          <Card
            className="dashboard-card-dark graph-visual-card"
            title="电力设备问题关系图"
            extra={<span className="graph-hint">少量关键节点，突出问题链路</span>}
          >
            {graph.nodes.length ? <ReactECharts option={option} style={{ height: 610 }} /> : <Empty />}
          </Card>
        </Col>
        <Col xs={24} xl={7}>
          <Card className="dashboard-card-dark graph-side-card" title="图谱阅读">
            <Space orientation="vertical" size={14} className="full-width">
              <Typography.Paragraph className="graph-summary">
                当前图谱不展示上传流水，而是把电力设备异常压缩成“设备到问题到环节、风险和知识”的链路，帮助值长判断先处理什么、由谁复盘、沉淀到哪类知识。
              </Typography.Paragraph>
              <div className="graph-category-list">
                {categories.map((category) => (
                  <div className="graph-category-item" key={category}>
                    <span className="graph-category-icon" style={{ color: categoryMeta[category]?.color || "#94a3b8" }}>
                      {categoryMeta[category]?.icon || <ApartmentOutlined />}
                    </span>
                    <div>
                      <Typography.Text strong>{categoryMeta[category]?.label || category}</Typography.Text>
                      <div className="muted-small">{categoryMeta[category]?.description || "关系节点"}</div>
                    </div>
                    <Tag color="blue">{graph.nodes.filter((node) => node.category === category).length}</Tag>
                  </div>
                ))}
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      <Card className="dashboard-card-dark section-spacing" title="关系明细">
        <Table
          rowKey="key"
          size="middle"
          dataSource={relationRows}
          pagination={{ pageSize: 6 }}
          columns={[
            { title: "起点", dataIndex: "sourceName" },
            { title: "关系", dataIndex: "relation", width: 140, render: (value: string) => <Tag color="gold">{value}</Tag> },
            { title: "终点", dataIndex: "targetName" },
          ]}
        />
      </Card>
    </AppShell>
  );
}

function truncateLabel(value: string) {
  return value.length > 12 ? `${value.slice(0, 12)}...` : value;
}
