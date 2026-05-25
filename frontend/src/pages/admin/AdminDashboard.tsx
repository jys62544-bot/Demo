import { AlertOutlined, CloudUploadOutlined, DatabaseOutlined, RobotOutlined, TeamOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Row, Space, Spin, Statistic, Table, Tag, Typography } from "antd";
import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { DashboardSummary, RankingRow, RecentUpload } from "../../types";

const riskColor: Record<string, string> = {
  none: "default",
  low: "blue",
  medium: "gold",
  high: "red",
  critical: "volcano",
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<RecentUpload[]>([]);
  const [ranking, setRanking] = useState<RankingRow[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [summaryData, recentData, rankingData] = await Promise.all([
        api.dashboardSummary(),
        api.recentUploads(8),
        api.ranking(5),
      ]);
      setSummary(summaryData);
      setRecent(recentData);
      setRanking(rankingData);
      setLoading(false);
    }

    void load();
  }, []);

  const trendOption = {
    backgroundColor: "transparent",
    color: ["#38bdf8", "#22c55e", "#f97316"],
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(15, 23, 42, 0.94)",
      borderColor: "rgba(148, 163, 184, 0.28)",
      textStyle: { color: "#e2e8f0" },
      axisPointer: {
        type: "line",
        lineStyle: { color: "rgba(125, 211, 252, 0.44)", width: 1 },
      },
    },
    legend: {
      top: 0,
      right: 8,
      icon: "roundRect",
      itemWidth: 18,
      itemHeight: 8,
      textStyle: { color: "#cbd5e1", fontSize: 13 },
    },
    grid: { left: 44, right: 24, top: 58, bottom: 38, containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: true,
      data: summary?.daily_trend.map((item) => item.date.slice(5)) || [],
      axisLine: { lineStyle: { color: "rgba(148, 163, 184, 0.34)" } },
      axisTick: { show: false },
      axisLabel: { color: "#94a3b8", margin: 14, fontSize: 12 },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitNumber: 4,
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.13)", type: "dashed" } },
      axisLabel: { color: "#94a3b8", margin: 12 },
    },
    series: [
      {
        name: "上传",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        showSymbol: true,
        z: 4,
        data: summary?.daily_trend.map((item) => item.uploads) || [],
        lineStyle: { color: "#38bdf8", width: 3 },
        itemStyle: { color: "#38bdf8", borderColor: "#dbeafe", borderWidth: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(56,189,248,0.24)" },
              { offset: 1, color: "rgba(56,189,248,0.02)" },
            ],
          },
        },
      },
      {
        name: "知识",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        showSymbol: true,
        z: 5,
        data: summary?.daily_trend.map((item) => item.knowledge) || [],
        lineStyle: { color: "#22c55e", width: 3 },
        itemStyle: { color: "#22c55e", borderColor: "#ecfccb", borderWidth: 2 },
      },
      {
        name: "异常",
        type: "bar",
        barWidth: 28,
        barMaxWidth: 36,
        z: 2,
        data: summary?.daily_trend.map((item) => item.abnormal) || [],
        itemStyle: {
          borderRadius: [7, 7, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#fb923c" },
              { offset: 1, color: "#ea580c" },
            ],
          },
        },
      },
    ],
  };

  return (
    <AppShell scope="admin" title="管理驾驶舱" subtitle="实时查看数据增长、异常风险、知识沉淀和员工贡献">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <MetricCard icon={<CloudUploadOutlined />} title="数据总量" value={summary?.total_files || 0} suffix="条" />
          <MetricCard icon={<DatabaseOutlined />} title="知识条目" value={summary?.total_knowledge || 0} suffix="条" />
          <MetricCard icon={<AlertOutlined />} title="异常案例" value={summary?.total_abnormal || 0} suffix="条" alert />
          <MetricCard icon={<TeamOutlined />} title="贡献员工" value={summary?.total_contributors || 0} suffix="人" />
          <MetricCard icon={<RobotOutlined />} title="Agent 调用" value={summary?.agent_calls || 0} suffix="次" />
        </Row>

        <Row gutter={[16, 16]} className="section-spacing">
          <Col xs={24} xl={15}>
            <Card className="dashboard-card-dark" title="7 天趋势">
              {summary ? <ReactECharts option={trendOption} style={{ height: 360 }} /> : <Empty />}
            </Card>
          </Col>
          <Col xs={24} xl={9}>
            <Card className="dashboard-card-dark" title="风险分布">
              <div className="risk-grid">
                {Object.entries(summary?.risk_distribution || {}).map(([level, count]) => (
                  <div className={`risk-tile risk-${level}`} key={level}>
                    <span>{riskLabel(level)}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card className="dashboard-card-dark" title="实时上传数据流">
              <Table
                rowKey="id"
                size="middle"
                pagination={false}
                dataSource={recent}
                columns={[
                  { title: "标题", dataIndex: "title" },
                  { title: "设备", dataIndex: "device_name", width: 100 },
                  { title: "工序", dataIndex: "process_name", width: 110 },
                  {
                    title: "风险",
                    dataIndex: "risk_level",
                    width: 100,
                    render: (level: string, row) => (
                      <Tag color={riskColor[level]}>{row.is_abnormal ? riskLabel(level) : "正常"}</Tag>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} xl={9}>
            <Card className="dashboard-card-dark" title="贡献排行 TOP 5">
              <Space orientation="vertical" size={12} className="full-width">
                {ranking.map((row) => (
                  <div className="ranking-row" key={row.user_id}>
                    <span className="rank-no">{row.rank}</span>
                    <div>
                      <Typography.Text strong>{row.user_name}</Typography.Text>
                      <div className="muted-small">{row.department}</div>
                    </div>
                    <strong>{row.total_points}</strong>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </Spin>
    </AppShell>
  );
}

function MetricCard({
  icon,
  title,
  value,
  suffix,
  alert,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  suffix: string;
  alert?: boolean;
}) {
  return (
    <Col xs={24} sm={12} xl={alert ? 4 : 5}>
      <Card className="metric-card">
        <Space align="center">
          <div className={alert ? "metric-icon metric-icon-alert" : "metric-icon"}>{icon}</div>
          <Statistic title={title} value={value} suffix={suffix} />
        </Space>
      </Card>
    </Col>
  );
}

function riskLabel(level: string) {
  const labels: Record<string, string> = {
    none: "无风险",
    low: "低风险",
    medium: "中风险",
    high: "高风险",
    critical: "严重",
  };
  return labels[level] || level;
}
