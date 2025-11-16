import React from "react";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Space,
  Steps,
  Typography,
} from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

const PCFRequestCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSave = () => {
    // For now, just validate and stay on page; integrate API later
    form
      .validateFields()
      .then(() => {
        // Placeholder: navigate back to list after a fake save
        navigate("/pcf-request");
      })
      .catch(() => undefined);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 8,
          colorPrimary: "#52c41a",
          colorSuccess: "#52c41a",
          colorWarning: "#faad14",
          colorError: "#dc3545",
          colorInfo: "#1890ff",
        },
        components: {
          Card: { paddingLG: 16, borderRadius: 12 },
          Button: { borderRadius: 8 },
          Select: { borderRadius: 8 },
          Input: { borderRadius: 8 },
          DatePicker: { borderRadius: 8 },
        },
      }}
    >
      <div className="bg-gray-100 p-6">
        <Space direction="vertical" size={16} className="w-full">
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => navigate("/pcf-request")}
            className="p-0 text-gray-700"
          >
            PCF Request
          </Button>
          <Card>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <Title level={3} style={{ marginBottom: 4 }}>
                  Create PCF Request
                </Title>
                <Text type="secondary">PCF Request → New Request</Text>
              </div>
              <Space>
                <Button type="primary" onClick={handleSave}>
                  Save
                </Button>
              </Space>
            </div>
          </Card>

          <Card>
            <Steps
              current={0}
              items={[
                {
                  title: (
                    <div style={{ textAlign: "center" }}>Basic Information</div>
                  ),
                  description: (
                    <div style={{ textAlign: "center", color: "#52c41a" }}>
                      Active
                    </div>
                  ),
                },
                { title: "Product Details", description: "Pending" },
                { title: "Documentation", description: "Pending" },
                { title: "Review & Submit", description: "Pending" },
              ]}
            />
          </Card>

          <Card title="Product Details">
            <Form
              form={form}
              layout="vertical"
              initialValues={{ priority: undefined }}
            >
              <Row gutter={[16, 8]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Request Title"
                    name="title"
                    rules={[{ required: true, message: "Enter request title" }]}
                  >
                    <Input placeholder="Enter request title" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Priority"
                    name="priority"
                    rules={[{ required: true, message: "Select priority" }]}
                  >
                    <Select
                      placeholder="Select Priority"
                      size="large"
                      options={[
                        { label: "High", value: "high" },
                        { label: "Medium", value: "medium" },
                        { label: "Low", value: "low" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Requesting Organization"
                    name="organization"
                    rules={[{ required: true, message: "Enter organization" }]}
                  >
                    <Input placeholder="Enter organization name" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Due Date"
                    name="dueDate"
                    rules={[{ required: true, message: "Select due date" }]}
                  >
                    <DatePicker
                      className="w-full"
                      placeholder="mm/dd/yyyy"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Request Description" name="description">
                    <TextArea
                      placeholder="Provide a detailed description of your PCF request..."
                      rows={5}
                      style={{ resize: "vertical" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex justify-end">
                <Button type="primary" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </Form>
          </Card>
        </Space>
      </div>
    </ConfigProvider>
  );
};

export default PCFRequestCreate;
