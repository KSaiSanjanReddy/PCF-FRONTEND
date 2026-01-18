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
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import dayjs from "dayjs";
import taskService from "../lib/taskService";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface PCFOption {
  id: string;
  code: string;
  request_title: string | null;
  priority: string | null;
  request_organization: string | null;
}

interface ProductOption {
  id: string;
  product_code: string;
  product_name: string;
}

interface CategoryOption {
  id: string;
  code: string;
  name: string;
  description?: string;
}

const TaskCreate: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [pcfOptions, setPcfOptions] = useState<PCFOption[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
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

  // Load dropdown data
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        // Load categories
        const categoryResult = await taskService.getCategoryDropdown();
        if (categoryResult.success && categoryResult.data) {
          setCategories(categoryResult.data);
        }

        // Load PCF dropdown
        const pcfResult = await taskService.getPCFDropdown();
        if (pcfResult.success && pcfResult.data) {
          setPcfOptions(pcfResult.data);
        }

        // Load product dropdown
        const productResult = await taskService.getProductDropdown();
        if (productResult.success && productResult.data) {
          setProductOptions(productResult.data);
        }

        // Load users list
        const usersResult = await taskService.getUsersList();
        if (usersResult.success && usersResult.data) {
          setUsers(usersResult.data);
        }

        // Pre-select PCF if bom_pcf_id is in query params
        const bomPcfId = searchParams.get("bom_pcf_id");
        if (bomPcfId) {
          setSelectedPCF(bomPcfId);
          form.setFieldsValue({ bom_pcf_id: bomPcfId });
          
          // Load BOM suppliers for pre-selected PCF
          const bomSuppliersResult = await taskService.getBOMSupplierDropdown(bomPcfId);
          if (bomSuppliersResult.success && bomSuppliersResult.data) {
            setBomSuppliers(bomSuppliersResult.data);
            const supplierIds = bomSuppliersResult.data.map((supplier) => supplier.id);
            form.setFieldsValue({ assign_to: supplierIds });
          }
        }
      } catch (error) {
        console.error("Error loading dropdowns:", error);
        message.error("Failed to load dropdown options");
      }
    };

    loadDropdowns();
  }, [searchParams, form]);

  // Load BOM suppliers when PCF is selected (this will be triggered by handlePCFChange)
  useEffect(() => {
    if (!selectedPCF) {
      setBomSuppliers([]);
    }
  }, [selectedPCF]);

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
        bom_pcf_id: values.bom_pcf_id,
        product: values.product,
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

  const handlePCFChange = async (value: string) => {
    setSelectedPCF(value);
    
    // Load BOM suppliers immediately when PCF changes
    if (value) {
      try {
        const result = await taskService.getBOMSupplierDropdown(value);
        if (result.success && result.data) {
          setBomSuppliers(result.data);
          
          // Automatically select all suppliers in the "Assign To" field
          const supplierIds = result.data.map((supplier) => supplier.id);
          const currentAssignTo = form.getFieldValue("assign_to") || [];
          
          // Combine existing assignees with new suppliers (avoid duplicates)
          const allAssignees = Array.from(
            new Set([...currentAssignTo, ...supplierIds])
          );
          
          form.setFieldsValue({ assign_to: allAssignees });
        }
      } catch (error) {
        console.error("Error loading BOM suppliers:", error);
      }
    } else {
      setBomSuppliers([]);
    }
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
                {/* Task Details Section */}
                <div className="mb-6">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Task Title*"
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
                        label="Due Date*"
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
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Category*"
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
                        label="Priority*"
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
                    <Col span={24}>
                      <Form.Item
                        label="Description*"
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
                        name="product"
                      >
                        <Select
                          placeholder="Select product..."
                          size="large"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                          }
                          options={productOptions.map((product) => ({
                            label: `${product.product_code} - ${product.product_name}`,
                            value: product.id,
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
                        label="PCF Request*"
                        name="bom_pcf_id"
                        rules={[
                          { required: true, message: "Select PCF Request" },
                        ]}
                      >
                        <Select
                          placeholder="Select PCF..."
                          size="large"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                          }
                          options={pcfOptions.map((pcf) => ({
                            label: pcf.request_title || pcf.code || `PCF-${pcf.id.substring(0, 8)}`,
                            value: pcf.id,
                          }))}
                          onChange={handlePCFChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Assign To*"
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
                    style={{ borderColor: "#52c41a", color: "#52c41a" }}
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

