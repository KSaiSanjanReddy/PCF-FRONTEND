import React, { useState, useEffect } from "react";
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
  Typography,
  Upload,
  message,
  Spin,
} from "antd";
import {
  LeftOutlined,
  SaveOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import dayjs from "dayjs";
import taskService from "../lib/taskService";
import { listSetup, type SetupItem } from "../lib/dataSetupService";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface PCFOption {
  pcf_id: string;
  pcf_code: string;
  request_title: string | null;
  priority: string | null;
  request_organization: string | null;
  bom_id: string;
  bom_code: string;
  component_name: string;
  material_number: string;
}

const TaskCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<SetupItem[]>([]);
  const [pcfOptions, setPcfOptions] = useState<PCFOption[]>([]);
  const [bomSuppliers, setBomSuppliers] = useState<Array<{
    id: string;
    name: string;
    type: "user" | "supplier";
  }>>([]);
  const [users, setUsers] = useState<Array<{
    user_id: string;
    user_name: string;
    user_email: string;
    user_role: string;
  }>>([]);
  const [selectedPCF, setSelectedPCF] = useState<string | undefined>();
  const [selectedBOM, setSelectedBOM] = useState<string | undefined>();
  const [bomOptions, setBomOptions] = useState<Array<{ bom_id: string; bom_code: string; component_name: string; material_number: string }>>([]);

  // Load dropdown data
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        // Load categories
        const categoryList = await listSetup("product-category");
        setCategories(categoryList);

        // Load PCF dropdown
        const pcfResult = await taskService.getPCFDropdown();
        if (pcfResult.success && pcfResult.data) {
          setPcfOptions(pcfResult.data);
        }

        // Load users list
        const usersResult = await taskService.getUsersList();
        if (usersResult.success && usersResult.data) {
          setUsers(usersResult.data);
        }
      } catch (error) {
        console.error("Error loading dropdowns:", error);
        message.error("Failed to load dropdown options");
      }
    };

    loadDropdowns();
  }, []);

  // Load BOM suppliers when BOM is selected
  useEffect(() => {
    const loadBOMSuppliers = async () => {
      if (selectedBOM) {
        try {
          const result = await taskService.getBOMSupplierDropdown(selectedBOM);
          if (result.success && result.data) {
            setBomSuppliers(result.data);
          }
        } catch (error) {
          console.error("Error loading BOM suppliers:", error);
        }
      } else {
        setBomSuppliers([]);
      }
    };

    loadBOMSuppliers();
  }, [selectedBOM]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      setLoading(true);

      // Format due date to ISO string
      const dueDate = values.due_date
        ? dayjs(values.due_date).toISOString()
        : "";

      // Parse tags from comma-separated string
      const tags = values.tags
        ? values.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0)
        : [];

      const taskData = {
        task_title: values.task_title,
        category_id: values.category_id,
        priority: values.priority,
        assign_to: values.assign_to || [],
        due_date: dueDate,
        description: values.description,
        pcf_id: values.pcf_id,
        bom_id: values.bom_id,
        related_product: values.related_product,
        estimated_hour: values.estimated_hour ? Number(values.estimated_hour) : undefined,
        tags: tags.length > 0 ? tags : undefined,
        attachments: values.attachments,
      };

      const result = await taskService.createTask(taskData);

      if (result.success) {
        message.success(result.message || "Task created successfully");
        navigate("/task-management");
      } else {
        message.error(result.message || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      message.error("An error occurred while creating the task");
    } finally {
      setLoading(false);
    }
  };

  const handlePCFChange = (value: string) => {
    setSelectedPCF(value);
    // Get BOMs for selected PCF
    const pcfItem = pcfOptions.find((pcf) => pcf.pcf_id === value);
    if (pcfItem) {
      // Get all BOMs for this PCF
      const bomsForPCF = pcfOptions
        .filter((pcf) => pcf.pcf_id === value)
        .map((pcf) => ({
          bom_id: pcf.bom_id,
          bom_code: pcf.bom_code,
          component_name: pcf.component_name,
          material_number: pcf.material_number,
        }));
      // Remove duplicates based on bom_id
      const uniqueBoms = Array.from(
        new Map(bomsForPCF.map((bom) => [bom.bom_id, bom])).values()
      );
      setBomOptions(uniqueBoms);
    } else {
      setBomOptions([]);
    }
    // Reset BOM when PCF changes
    form.setFieldsValue({ bom_id: undefined });
    setSelectedBOM(undefined);
  };

  const handleBOMChange = (value: string) => {
    setSelectedBOM(value);
  };

  // Get assignee options - combine BOM suppliers and users
  const assigneeOptions = [
    // Add BOM suppliers if available
    ...bomSuppliers.map((supplier) => ({
      label: `${supplier.name} (${supplier.type})`,
      value: supplier.id,
    })),
    // Add users (only if not already in BOM suppliers)
    ...users
      .filter((user) => !bomSuppliers.some((s) => s.id === user.user_id))
      .map((user) => ({
        label: `${user.user_name} (user)`,
        value: user.user_id,
      })),
  ];

  // Load BOM options when PCF is selected
  useEffect(() => {
    if (selectedPCF) {
      // Get all BOMs for selected PCF from pcfOptions
      const bomsForPCF = pcfOptions
        .filter((pcf) => pcf.pcf_id === selectedPCF)
        .map((pcf) => ({
          bom_id: pcf.bom_id,
          bom_code: pcf.bom_code,
          component_name: pcf.component_name,
          material_number: pcf.material_number,
        }));
      // Remove duplicates based on bom_id
      const uniqueBoms = Array.from(
        new Map(bomsForPCF.map((bom) => [bom.bom_id, bom])).values()
      );
      setBomOptions(uniqueBoms);
    } else {
      setBomOptions([]);
    }
  }, [selectedPCF, pcfOptions]);

  // Upload props
  const uploadProps = {
    beforeUpload: (file: File) => {
      const isValidType = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/png",
      ].includes(file.type);

      const isValidSize = file.size / 1024 / 1024 < 10;

      if (!isValidType) {
        message.error("File format not supported!");
        return false;
      }
      if (!isValidSize) {
        message.error("File size must be less than 10MB!");
        return false;
      }

      // For now, just show a message. In production, upload to server and get URL
      message.info("File upload functionality will be implemented with backend integration");
      return false;
    },
    showUploadList: false,
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
        <Spin spinning={loading}>
          <Space direction="vertical" size={16} className="w-full">
            {/* Header */}
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => navigate("/task-management")}
              className="p-0 text-gray-700 mb-2"
            >
              Task Management
            </Button>

            <Card>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-500 p-4 rounded-xl w-14 h-14 flex items-center justify-center">
                  <CheckSquare color="white" size={32} />
                </div>
                <div>
                  <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
                    Task Details
                  </Title>
                  <Text type="secondary">
                    Fill in the Information below to create a new task.
                  </Text>
                </div>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{
                  estimated_hour: 0,
                }}
              >
                {/* Task Information Section */}
                <div className="mb-6">
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Task Information
                  </Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Task Title"
                        name="task_title"
                        rules={[
                          { required: true, message: "Enter task title" },
                        ]}
                      >
                        <Input
                          placeholder="Enter task title..."
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Category"
                        name="category_id"
                        rules={[
                          { required: true, message: "Select category" },
                        ]}
                      >
                        <Select
                          placeholder="Select category..."
                          size="large"
                          options={categories.map((cat) => ({
                            label: cat.name,
                            value: cat.id,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Priority"
                        name="priority"
                        rules={[
                          { required: true, message: "Select priority" },
                        ]}
                      >
                        <Select
                          placeholder="Select priority..."
                          size="large"
                          options={[
                            { label: "High", value: "High" },
                            { label: "Medium", value: "Medium" },
                            { label: "Low", value: "Low" },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Assign To"
                        name="assign_to"
                        rules={[
                          { required: true, message: "Select assignee" },
                        ]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select assignee..."
                          size="large"
                          options={assigneeOptions}
                          disabled={assigneeOptions.length === 0}
                          notFoundContent={
                            assigneeOptions.length === 0
                              ? "Loading assignees..."
                              : "No assignees found"
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Due Date"
                        name="due_date"
                        rules={[
                          { required: true, message: "Select due date" },
                        ]}
                      >
                        <DatePicker
                          className="w-full"
                          placeholder="mm/dd/yyyy"
                          size="large"
                          format="MM/DD/YYYY"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="Description"
                        name="description"
                        rules={[
                          { required: true, message: "Enter description" },
                        ]}
                      >
                        <TextArea
                          placeholder="Provide detailed description of the task..."
                          rows={5}
                          style={{ resize: "vertical" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Additional Details Section */}
                <div className="mb-6">
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Additional Details
                  </Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={
                          <span>
                            Related Product <Text type="secondary">(Optional)</Text>
                          </span>
                        }
                        name="related_product"
                      >
                        <Select
                          placeholder="Select product..."
                          size="large"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                          }
                          options={pcfOptions
                            .filter((pcf) => pcf.pcf_id)
                            .map((pcf) => ({
                              label: pcf.request_title || pcf.pcf_code || (pcf.pcf_id ? `PCF-${pcf.pcf_id.substring(0, 8)}` : "Unknown"),
                              value: pcf.pcf_id,
                            }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Estimated Hours" name="estimated_hour">
                        <Input
                          type="number"
                          placeholder="0"
                          size="large"
                          min={0}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={
                          <span>
                            PCF Request <Text type="secondary">(Optional)</Text>
                          </span>
                        }
                        name="pcf_id"
                      >
                        <Select
                          placeholder="Select PCF request..."
                          size="large"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                          }
                          options={pcfOptions
                            .filter((pcf) => pcf.pcf_id)
                            .map((pcf) => ({
                              label: pcf.request_title || pcf.pcf_code || (pcf.pcf_id ? `PCF-${pcf.pcf_id.substring(0, 8)}` : "Unknown"),
                              value: pcf.pcf_id,
                            }))}
                          onChange={handlePCFChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={
                          <span>
                            BOM <Text type="secondary">(Optional)</Text>
                          </span>
                        }
                        name="bom_id"
                      >
                        <Select
                          placeholder="Select BOM..."
                          size="large"
                          onChange={handleBOMChange}
                          disabled={!selectedPCF}
                          options={bomOptions.map((bom) => ({
                            label: `${bom.bom_code} - ${bom.component_name} (${bom.material_number})`,
                            value: bom.bom_id,
                          }))}
                          notFoundContent={
                            selectedPCF
                              ? "No BOMs found for this PCF"
                              : "Please select a PCF first"
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label={
                          <span>
                            Tags <Text type="secondary">(Optional)</Text>
                          </span>
                        }
                        name="tags"
                      >
                        <Input
                          placeholder="Enter tags separated by commas..."
                          size="large"
                        />
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
                          Example: urgent, review-required, documentation
                        </Text>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Attachments Section */}
                {/* <div className="mb-6">
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Attachments
                  </Title>
                  <Form.Item name="attachments">
                    <Upload.Dragger {...uploadProps} className="w-full">
                      <p className="ant-upload-drag-icon">
                        <CloudUploadOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                      </p>
                      <p className="ant-upload-text">
                        Drop files here or click to upload
                      </p>
                      <p className="ant-upload-hint">
                        Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
                      </p>
                    </Upload.Dragger>
                  </Form.Item>
                </div> */}

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                  <Button
                    size="large"
                    onClick={() => navigate("/task-management")}
                  >
                    <LeftOutlined /> Back
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                  >
                    Save
                  </Button>
                </div>
              </Form>
            </Card>
          </Space>
        </Spin>
      </div>
    </ConfigProvider>
  );
};

export default TaskCreate;

