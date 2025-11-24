import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { LeftOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { CheckSquare, FileText } from "lucide-react";
import dayjs from "dayjs";
import taskService, { type TaskItem } from "../lib/taskService";

const { Title, Text } = Typography;

const TaskView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<TaskItem | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const result = await taskService.getTaskById(id);
        if (result.success && result.data) {
          setTask(result.data);
        } else {
          message.error(result.message || "Failed to load task details");
          navigate("/task-management");
        }
      } catch (error) {
        console.error("Error loading task:", error);
        message.error("An error occurred while loading task details");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, navigate]);

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      "To Do": { color: "default", label: "To-Do" },
      "Under Review": { color: "orange", label: "Under Review" },
      "In Progress": { color: "blue", label: "In Progress" },
      "Completed": { color: "green", label: "Completed" },
    };
    const config = statusConfig[status] || { color: "default", label: status };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const getPriorityTag = (priority: string) => {
    const priorityConfig: Record<string, { color: string; label: string }> = {
      Low: { color: "green", label: "Low" },
      Medium: { color: "orange", label: "Medium" },
      High: { color: "red", label: "High" },
    };
    const config = priorityConfig[priority] || { color: "default", label: priority };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  if (!task && !loading) {
    return null;
  }

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
          Card: { paddingLG: 24, borderRadius: 12 },
          Button: { borderRadius: 8 },
          Descriptions: { itemPaddingBottom: 16 },
        },
      }}
    >
      <div className="bg-gray-100 p-6 min-h-screen">
        <Spin spinning={loading}>
          <Space direction="vertical" size={16} className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center">
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => navigate("/task-management")}
                className="p-0 text-gray-700 hover:text-green-600"
              >
                Back to Task Management
              </Button>
              {/* Optional: Add Edit button here if needed in future */}
            </div>

            <Card>
              <div className="flex items-start gap-4 mb-8">
                <div className="bg-green-500 p-4 rounded-xl w-14 h-14 flex items-center justify-center flex-shrink-0">
                  <CheckSquare color="white" size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                        {task?.task_title || "Task Details"}
                      </Title>
                      <Space>
                        {task?.status && getStatusTag(task.status)}
                        <Text type="secondary">ID: {task?.code || task?.id}</Text>
                      </Space>
                    </div>
                  </div>
                </div>
              </div>

              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card type="inner" title="Task Information" className="bg-gray-50">
                    <Descriptions layout="vertical" column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                      <Descriptions.Item label="Category">
                        <Text strong>{task?.category_name || "N/A"}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Priority">
                        {task?.priority ? getPriorityTag(task.priority) : "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Due Date">
                        <Space>
                          <FileText size={16} className="text-gray-400" />
                          <Text>{task?.due_date ? dayjs(task.due_date).format("MMM D, YYYY") : "N/A"}</Text>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Estimated Hours">
                        {task?.estimated_hour ? `${task.estimated_hour} hrs` : "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Assignees" span={2}>
                        <Space wrap>
                          {task?.assigned_entities && task.assigned_entities.length > 0 ? (
                            task.assigned_entities.map((entity) => (
                              <Tag key={entity.id} color="blue">
                                {entity.name} ({entity.type})
                              </Tag>
                            ))
                          ) : (
                            <Text type="secondary">Unassigned</Text>
                          )}
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>
                    
                    <div className="mt-4">
                      <Text type="secondary" className="block mb-2">Description</Text>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-[100px]">
                        <Text className="whitespace-pre-wrap">
                          {task?.description || "No description provided."}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col span={24}>
                  <Card type="inner" title="Additional Details" className="bg-gray-50">
                    <Descriptions layout="vertical" column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
                      <Descriptions.Item label="Related Product">
                        {task?.related_product || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="PCF Request">
                        {task?.pcf_id ? (
                          <Button type="link" className="p-0 h-auto" onClick={() => navigate(`/pcf-request/${task.pcf_id}`)}>
                            View PCF Request
                          </Button>
                        ) : (
                          "N/A"
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="BOM">
                        {task?.bom_id || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tags" span={3}>
                        <Space wrap>
                          {task?.tags && task.tags.length > 0 ? (
                            task.tags.map((tag, index) => (
                              <Tag key={index} color="cyan">{tag}</Tag>
                            ))
                          ) : (
                            "No tags"
                          )}
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                <Col span={24}>
                  <div className="flex justify-between text-gray-400 text-sm px-2">
                    <span>Created by: {task?.created_by_name || task?.created_by} on {task?.created_date ? dayjs(task.created_date).format("MMM D, YYYY HH:mm") : "N/A"}</span>
                    {task?.updated_by && (
                      <span>Last updated by: {task?.updated_by_name || task?.updated_by} on {task?.update_date ? dayjs(task.update_date).format("MMM D, YYYY HH:mm") : "N/A"}</span>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>
          </Space>
        </Spin>
      </div>
    </ConfigProvider>
  );
};

export default TaskView;
