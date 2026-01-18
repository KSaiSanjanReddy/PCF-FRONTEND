import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Steps,
  Card,
  Button,
  Tag,
  Avatar,
  List,
  Input,
  Form,
  Modal,
  message,
  Spin,
  Divider,
  Row,
  Col,
  Typography,
} from "antd";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  FileText,
  Calendar,
  Layers,
  Box,
  Cpu,
  Hash,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  ChevronLeft,
} from "lucide-react";
import pcfService from "../lib/pcfService";
import authService from "../lib/authService";
import taskService, { type TaskItem } from "../lib/taskService";
import { CheckSquare, ArrowRight } from "lucide-react";

const { Step } = Steps;
const { TextArea } = Input;
const { Title, Text } = Typography;

const PCFRequestView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [newComment, setNewComment] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  // Fetch tasks when BOM is verified
  useEffect(() => {
    if (id && requestData?.pcf_request_stages?.is_bom_verified) {
      fetchTasks(id);
    }
  }, [id, requestData?.pcf_request_stages?.is_bom_verified]);

  const fetchData = async (pcfId: string) => {
    setLoading(true);
    try {
      const [requestResult, commentsResult] = await Promise.all([
        pcfService.getPCFBOMById(pcfId),
        pcfService.listPCFComments(pcfId),
      ]);

      if (requestResult.success && requestResult.data) {
        // Handle array response (API returns array of 1 item)
        const data = Array.isArray(requestResult.data)
          ? requestResult.data[0]
          : requestResult.data;
        setRequestData(data);
      } else {
        message.error(requestResult.message || "Failed to load request details");
      }

      if (commentsResult.success && commentsResult.data) {
        setComments(commentsResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (pcfId: string) => {
    setTasksLoading(true);
    try {
      const result = await taskService.getTasksByBomPcfId(pcfId);
      if (result.success && result.data) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const result = await pcfService.verifyPCFRequest(id);
      if (result.success) {
        message.success("PCF Request approved successfully");
        fetchData(id); // Refresh data
      } else {
        message.error(result.message || "Failed to approve request");
      }
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) {
      message.warning("Please provide a reason for rejection");
      return;
    }
    setSubmitting(true);
    try {
      const result = await pcfService.rejectPCFRequest(id, rejectReason);
      if (result.success) {
        message.success("PCF Request rejected successfully");
        setRejectModalVisible(false);
        setRejectReason("");
        fetchData(id); // Refresh data
      } else {
        message.error(result.message || "Failed to reject request");
      }
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      const result = await pcfService.addPCFComment(id, newComment);
      if (result.success) {
        message.success("Comment added");
        setNewComment("");
        // Refresh comments
        const commentsResult = await pcfService.listPCFComments(id);
        if (commentsResult.success && commentsResult.data) {
          setComments(commentsResult.data);
        }
      } else {
        message.error(result.message || "Failed to add comment");
      }
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="p-6 text-center">
        <Title level={4}>Request not found</Title>
        <Button onClick={() => navigate("/pcf-requests")}>Go Back</Button>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine current step based on status/flags
  const getCurrentStep = () => {
    const stages = requestData.pcf_request_stages || {};
    if (stages.is_result_submitted) return 7;
    if (stages.is_result_validation_verified) return 6;
    if (stages.is_pcf_calculated) return 5;
    if (stages.is_dqr_completed) return 4;
    if (stages.is_data_collected) return 3;
    if (stages.is_bom_verified) return 2;
    if (stages.is_pcf_request_submitted) return 1;
    if (stages.is_pcf_request_created) return 0;
    return 0;
  };

  const steps = [
    { title: "PCF Request Created", icon: <CheckCircle size={16} /> },
    { title: "PCF Request Submitted", icon: <Send size={16} /> },
    { title: "BOM Verified", icon: <CheckCircle size={16} /> },
    { title: "Data Collection", icon: <Layers size={16} /> },
    { title: "Data Quality Rating", icon: <User size={16} /> },
    { title: "PCF Calculation", icon: <Cpu size={16} /> },
    { title: "Result Validation", icon: <CheckCircle size={16} /> },
    { title: "Result Submitted", icon: <FileText size={16} /> },
  ];

  return (
    <div className="p-6 mx-auto bg-gray-50 min-h-screen">
      {/* Back Button */}
      <Button
        type="text"
        icon={<ChevronLeft size={16} />}
        onClick={() => navigate(-1)}
        className="mb-4 hover:bg-gray-200"
      >
        Back to List
      </Button>

      {/* Header Card */}
      <Card className="!mb-6 shadow-sm rounded-xl border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Box size={32} className="text-green-600" />
            </div>
            <div>
              <Title level={3} className="m-0 text-gray-800">
                {requestData.request_title || "PCF Request"}
              </Title>
              <Text type="secondary" className="text-gray-500">
                {requestData.code}
              </Text>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white px-2 py-2 rounded-lg flex items-center gap-2 border border-green-100">
              <span className="bg-green-50 p-2 rounded-md text-green-600 w-10 h-10 flex items-center justify-center">
              <Clock size={16} className="text-green-600" />
              </span>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Stages Complete
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {getCurrentStep() + 1}/8
                </div>
              </div>
            </div>
            <div className="bg-white px-2 py-2 rounded-lg flex items-center gap-2 border border-blue-100">
              <span className="bg-blue-50 p-2 rounded-md text-blue-600 w-10 h-10 flex items-center justify-center">
                <Calendar size={16} className="text-blue-600" />
              </span>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Due Date
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {new Date(requestData.due_date).toLocaleDateString()}
                </div>
              </div>
            </div>
              <div className="bg-white px-2 py-2 rounded-lg flex items-center gap-2 border border-orange-100">
              <span className="bg-orange-50 p-2 rounded-md text-orange-600 w-10 h-10 flex items-center justify-center">
                <AlertTriangle size={16} className="text-orange-600" />
              </span>
              <div>
                <div className="text-xs text-gray-500 font-medium">Priority</div>
                <div className="text-sm font-bold text-gray-800">
                  {requestData.priority}
                </div>
              </div>
            </div>
            <div className="bg-white px-2 py-2 rounded-lg flex items-center gap-2 border border-purple-100">
              <span className="bg-purple-50 p-2 rounded-md text-purple-600 w-10 h-10 flex items-center justify-center">
                <User size={16} className="text-purple-600" />
              </span>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Submitted By
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {requestData.request_organization || "Unknown"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-6" />

        <Row gutter={[24, 24]}>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Reference Number
            </Text>
            <Text className="text-gray-800 font-medium">
              {requestData.request_title}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Submitted On
            </Text>
            <Text className="text-gray-800 font-medium">
              {formatDate(requestData.created_date)}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Due Date
            </Text>
            <Text className="text-gray-800 font-medium">
              {formatDate(requestData.due_date)}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Current Stage
            </Text>
            <Tag color="blue" className="font-medium">
              {steps[getCurrentStep()].title}
            </Tag>
          </Col>
        </Row>

        <Divider className="my-6" />

        <Row gutter={[24, 24]}>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Product Category
            </Text>
            <Text className="text-gray-800 font-medium">
              {requestData.product_category?.name || "N/A"}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Component Category
            </Text>
            <Text className="text-gray-800 font-medium">
              {requestData.component_category?.name || "N/A"}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Component Type
            </Text>
            <Text className="text-gray-800 font-medium">
              {requestData.component_type?.name || "N/A"}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Product Code
            </Text>
            <Text className="text-gray-800 font-medium">
              {requestData.product_code || "N/A"}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Stage Stepper */}
      <Card className="!mb-6 shadow-sm rounded-xl border-gray-200">
        <Title level={4} className="mb-6">
          PCF Request Stage
        </Title>
        <div className="overflow-x-auto pb-4">
          <style>{`
            .pcf-steps-container .ant-steps-item-icon {
              margin-top: 0 !important;
              width: 32px !important;
              height: 32px !important;
              line-height: 32px !important;

            }
            .pcf-steps-container .ant-steps-item-tail {
              top: 16px !important;
              height: 2px !important;
              margin-top: 0 !important;
              padding: 0 !important;
              transform: translateY(0) !important;
            }
            .pcf-steps-container .ant-steps-item:not(:last-child) .ant-steps-item-tail {
              right: calc(-50% + 16px) !important;
            }
            .pcf-steps-container .ant-steps-item-content {
              margin-top: 8px !important;
            }
            .pcf-steps-container .ant-steps-item-process .ant-steps-item-icon {
              background: transparent !important;
            }
            .pcf-steps-container .ant-steps-item-finish .ant-steps-item-icon {
              background: transparent !important;
            }
          `}</style>
          <div className="pcf-steps-container">
            <Steps current={getCurrentStep()} labelPlacement="vertical" size="small">
              {steps.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  icon={
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        index <= getCurrentStep()
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      {step.icon}
                    </div>
                  }
                />
              ))}
            </Steps>
          </div>
        </div>

        {/* Current Stage Details - Placeholder for now */}
        <div className="mt-8 bg-green-50 border border-green-100 rounded-xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {steps[getCurrentStep()].title}
              </h3>
              <p className="text-gray-600">
                Stage Description: In this stage, we are processing the{" "}
                {steps[getCurrentStep()].title.toLowerCase()}.
              </p>
            </div>
            <Tag color="processing">In Progress</Tag>
          </div>
        </div>
      </Card>

      {/* Task Management Section - Show after BOM is verified */}
      {requestData?.pcf_request_stages?.is_bom_verified && (
        <Card className="!mb-6 shadow-sm rounded-xl border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare size={24} className="text-green-600" />
            </div>
            <Title level={4} className="m-0">
              Task Management
            </Title>
          </div>

          <Spin spinning={tasksLoading}>
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Title level={5} className="m-0">
                            {task.task_title}
                          </Title>
                          <Tag
                            color={
                              task.priority === "High"
                                ? "red"
                                : task.priority === "Medium"
                                ? "orange"
                                : "green"
                            }
                          >
                            {task.priority}
                          </Tag>
                          <Tag
                            color={
                              task.status === "Completed"
                                ? "green"
                                : task.status === "In Progress"
                                ? "blue"
                                : task.status === "Under Review"
                                ? "orange"
                                : "default"
                            }
                          >
                            {task.status}
                          </Tag>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <Text type="secondary" className="block text-xs mb-1">
                              Task Code
                            </Text>
                            <Text className="font-medium">{task.code}</Text>
                          </div>
                          <div>
                            <Text type="secondary" className="block text-xs mb-1">
                              Category
                            </Text>
                            <Text className="font-medium">
                              {task.category_name || "N/A"}
                            </Text>
                          </div>
                          <div>
                            <Text type="secondary" className="block text-xs mb-1">
                              Due Date
                            </Text>
                            <Text className="font-medium">
                              {task.due_date
                                ? formatDate(task.due_date)
                                : "N/A"}
                            </Text>
                          </div>
                          <div>
                            <Text type="secondary" className="block text-xs mb-1">
                              Progress
                            </Text>
                            <Text className="font-medium">
                              {task.progress ?? 0}%
                            </Text>
                          </div>
                        </div>
                        {task.description && (
                          <div className="mt-3">
                            <Text type="secondary" className="block text-xs mb-1">
                              Description
                            </Text>
                            <Text className="text-gray-700">
                              {task.description}
                            </Text>
                          </div>
                        )}
                        {task.assigned_entities && task.assigned_entities.length > 0 && (
                          <div className="mt-3">
                            <Text type="secondary" className="block text-xs mb-1">
                              Assigned To
                            </Text>
                            <div className="flex flex-wrap gap-2">
                              {task.assigned_entities.map((entity) => (
                                <Tag key={entity.id} color="blue">
                                  {entity.name} ({entity.type})
                                </Tag>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        type="link"
                        icon={<ArrowRight size={16} />}
                        onClick={() =>
                          navigate(`/task-management/view/${task.id}`)
                        }
                        className="ml-4"
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <CheckSquare size={48} className="text-gray-400 mx-auto" />
                </div>
                <Text type="secondary" className="block mb-4">
                  No tasks have been created for this PCF request yet.
                </Text>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckSquare size={18} />}
                  onClick={() =>
                    navigate(`/task-management/new?bom_pcf_id=${id}`)
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  Create Task
                </Button>
              </div>
            )}
          </Spin>
        </Card>
      )}

      {/* Completed Stages List */}
      {/* <Card className="!mb-6 shadow-sm rounded-xl border-gray-200">
        <Title level={4} className="mb-6">
          Completed Stages
        </Title>
        <div className="space-y-4">
          {getCurrentStep() > 0 && (
            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">
                    {steps[getCurrentStep() - 1].title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Completed on {formatDate(new Date().toISOString())}
                  </div>
                </div>
              </div>
              <Tag color="success">Approved</Tag>
            </div>
          )}

        </div>
      </Card> */}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        <Button
          danger
          size="large"
          icon={<ThumbsDown size={18} />}
          onClick={() => setRejectModalVisible(true)}
          disabled={requestData.is_rejected || requestData.is_approved}
        >
          Reject
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<ThumbsUp size={18} />}
          className="bg-green-600 hover:bg-green-700"
          onClick={handleApprove}
          loading={submitting}
          disabled={requestData.is_rejected || requestData.is_approved}
        >
          Approve
        </Button>
      </div>

      {/* Comments Section */}
      <Card className="!mb-6 shadow-sm rounded-xl border-gray-200">
        <Title level={4} className="mb-6">
          Comments
        </Title>
        <List
          className="mb-6"
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_id}`}
                  />
                }
                title={
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">
                      {item.user_name || "User"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(item.commented_at)}
                    </span>
                  </div>
                }
                description={item.comment}
              />
            </List.Item>
          )}
        />
        <div className="flex gap-4">
          <Avatar
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${authService.getCurrentUser()?.id}`}
          />
          <div className="flex-1">
            <TextArea
              rows={3}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-3 rounded-xl"
            />
            <div className="flex justify-end">
              <Button
                type="primary"
                icon={<MessageSquare size={16} />}
                onClick={handleAddComment}
                loading={commentLoading}
                className="bg-blue-600"
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Reject Modal */}
      <Modal
        title="Reject Request"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        confirmLoading={submitting}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <p className="mb-4">Please provide a reason for rejecting this request:</p>
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Enter rejection reason..."
        />
      </Modal>
    </div>
  );
};

export default PCFRequestView;
