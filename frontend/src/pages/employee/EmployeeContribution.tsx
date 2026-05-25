import { TrophyOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import { useAuth } from "../../store/useAuth";
import type { Contribution, UploadedFile } from "../../types";
import { fileTypeLabel, formatTime, riskColor, riskLabel } from "../../utils/labels";

export default function EmployeeContribution() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    Promise.all([api.contributions(user?.id), api.files()]).then(([contributionData, fileData]) => {
      setContributions(contributionData.items);
      setTotalPoints(contributionData.total_points);
      setFiles(fileData.items.filter((item) => !user?.id || item.uploader_id === user.id).slice(0, 8));
    });
  }, [user?.id]);

  return (
    <AppShell scope="employee" title="我的贡献" subtitle="查看上传记录、积分明细和知识沉淀情况">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="总积分" value={totalPoints} prefix={<TrophyOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="上传记录" value={files.length} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="异常贡献" value={files.filter((item) => item.is_abnormal).length} suffix="条" />
          </Card>
        </Col>
      </Row>
      <Card className="section-spacing" title="积分明细">
        <Table
          rowKey="id"
          dataSource={contributions}
          pagination={{ pageSize: 6 }}
          columns={[
            { title: "说明", dataIndex: "description" },
            { title: "动作", dataIndex: "action_type", width: 140, render: (value) => <Tag>{value}</Tag> },
            { title: "积分", dataIndex: "points", width: 100, render: (value) => <strong>+{value}</strong> },
            { title: "时间", dataIndex: "created_at", width: 130, render: formatTime },
          ]}
        />
      </Card>
      <Card className="section-spacing" title="最近上传">
        <Table
          rowKey="id"
          dataSource={files}
          pagination={false}
          columns={[
            { title: "标题", dataIndex: "title" },
            { title: "类型", dataIndex: "file_type", width: 100, render: (value) => fileTypeLabel[value as keyof typeof fileTypeLabel] },
            { title: "设备", dataIndex: "device_name", width: 110 },
            { title: "工序", dataIndex: "process_name", width: 120 },
            {
              title: "风险",
              dataIndex: "risk_level",
              width: 110,
              render: (value) => <Tag color={riskColor[value as keyof typeof riskColor]}>{riskLabel[value as keyof typeof riskLabel]}</Tag>,
            },
          ]}
        />
      </Card>
    </AppShell>
  );
}
