import { InboxOutlined } from "@ant-design/icons";
import { Alert, App as AntApp, Button, Card, Col, Form, Input, Row, Select, Switch, Upload } from "antd";
import type { UploadFile } from "antd";
import { useState } from "react";
import { api } from "../../api/client";
import AppShell from "../../layouts/AppShell";
import type { FileType, RiskLevel, SceneType, UploadResponse } from "../../types";

type UploadForm = {
  title: string;
  file_type: FileType;
  device_name: string;
  process_name: string;
  scene_type: SceneType;
  is_abnormal: boolean;
  risk_level: RiskLevel;
  tags?: string;
  description?: string;
  text_content?: string;
};

const fileTypeOptions = [
  { label: "图片", value: "image" },
  { label: "视频", value: "video" },
  { label: "音频", value: "audio" },
  { label: "文档", value: "document" },
  { label: "文本经验", value: "text" },
];

const sceneOptions = [
  { label: "标准操作", value: "standard_operation" },
  { label: "异常操作", value: "abnormal_operation" },
  { label: "培训经验", value: "training_experience" },
  { label: "故障案例", value: "fault_case" },
  { label: "质检记录", value: "quality_inspection" },
  { label: "维修记录", value: "maintenance_record" },
  { label: "其他", value: "other" },
];

export default function EmployeeUpload() {
  const [form] = Form.useForm<UploadForm>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const { message } = AntApp.useApp();
  const fileType = Form.useWatch("file_type", form);
  const isAbnormal = Form.useWatch("is_abnormal", form);

  const onFinish = async (values: UploadForm) => {
    setSubmitting(true);
    setResult(null);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === "is_abnormal") {
          formData.append(key, value ? "1" : "0");
          return;
        }
        formData.append(key, String(value));
      });
      if (values.file_type !== "text" && fileList[0]?.originFileObj) {
        formData.append("file", fileList[0].originFileObj);
      }
      const response = await api.upload(formData);
      setResult(response);
      message.success(`上传成功，积分 +${response.score_added}`);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "上传失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell scope="employee" title="多模态上传" subtitle="提交现场数据后自动生成知识条目、积分和异常案例">
      <Row gutter={[18, 18]}>
        <Col xs={24} xl={15}>
          <Card title="现场数据表单">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                title: "设备A未闭合安全锁图片",
                file_type: "image",
                device_name: "设备A",
                process_name: "开机检查",
                scene_type: "abnormal_operation",
                is_abnormal: true,
                risk_level: "high",
                tags: "安全锁,开机,异常",
                description: "安全锁未闭合，尝试开机前需要复核。",
              }}
              onFinish={onFinish}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="file_type" label="数据类型" rules={[{ required: true }]}>
                    <Select options={fileTypeOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="device_name" label="设备名称" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="process_name" label="工序名称" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="scene_type" label="场景类型" rules={[{ required: true }]}>
                    <Select options={sceneOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="risk_level" label="风险等级" rules={[{ required: true }]}>
                    <Select
                      disabled={!isAbnormal}
                      options={[
                        { label: "无风险", value: "none" },
                        { label: "低风险", value: "low" },
                        { label: "中风险", value: "medium" },
                        { label: "高风险", value: "high" },
                        { label: "严重风险", value: "critical" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="tags" label="标签">
                    <Input placeholder="逗号分隔" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="is_abnormal" label="是否异常" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              {fileType === "text" ? (
                <Form.Item name="text_content" label="文本经验" rules={[{ required: true, message: "请输入文本内容" }]}>
                  <Input.TextArea rows={6} />
                </Form.Item>
              ) : (
                <Form.Item label="上传文件" required>
                  <Upload.Dragger
                    beforeUpload={() => false}
                    maxCount={1}
                    fileList={fileList}
                    onChange={({ fileList: next }) => setFileList(next)}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽现场文件到此处</p>
                    <p className="ant-upload-hint">演示建议上传异常图片，便于管理端指标即时变化。</p>
                  </Upload.Dragger>
                </Form.Item>
              )}

              <Form.Item name="description" label="描述">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Button type="primary" htmlType="submit" size="large" loading={submitting}>
                提交现场数据
              </Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card title="上传后自动完成">
            <div className="upload-flow">
              <div>保存原始多模态数据</div>
              <div>生成知识条目</div>
              <div>计算员工贡献积分</div>
              <div>异常数据同步案例库</div>
            </div>
          </Card>
          {result ? (
            <Alert
              className="section-spacing"
              type="success"
              showIcon
              message={`${result.message}，积分 +${result.score_added}`}
              description={`已生成知识条目：${result.knowledge_item.title}`}
            />
          ) : null}
        </Col>
      </Row>
    </AppShell>
  );
}
