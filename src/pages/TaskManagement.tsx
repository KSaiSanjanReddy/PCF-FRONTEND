import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Button,
  Select,
  Space,
  Tag,
  Divider,
  Spin,
  message,
  Progress,
  Popconfirm,
} from "antd";
import { ConfigProvider } from "antd";
import {
  CheckSquare,
  Plus,
  Trash2,
  Filter,
  Clock,
  CheckCircle,
  FileText,
  Eye,
} from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import taskService from "../lib/taskService";
import type { TaskItem } from "../lib/taskService";
import { useNavigate } from "react-router-dom";

interface TaskManagementItem {
  id: string;
  taskName: string;
  status: "To Do" | "Under Review" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  assignee: string;
  category: string;
  dueDate: string;
  progress: number;
}

const TaskManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tasks, setTasks] = useState<TaskManagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const navigate = useNavigate();
  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month}, ${year}`;
    } catch (error) {
      return "N/A";
    }
  };

  // Fetch task list from API
  const fetchTaskList = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await taskService.getTaskList(currentPage, pageSize, {
        priority: priorityFilter,
        assignee: assigneeFilter,
        category: categoryFilter,
      });

      if (result.success && result.data) {
        // Transform API data to TaskManagementItem
        const transformedData: TaskManagementItem[] = result.data.map(
          (item) => {
            // Get assignee names from assigned_entities array
            const assigneeNames =
              item.assigned_entities?.map((entity) => entity.name).join(", ") ||
              "Unassigned";

            // Map API status to UI status
            const statusMap: Record<string, "To Do" | "Under Review" | "In Progress" | "Completed"> = {
              "Created": "To Do",
              "To Do": "To Do",
              "Under Review": "Under Review",
              "In Progress": "In Progress",
              "Completed": "Completed",
            };
            
            return {
              id: item.id,
              taskName: item.task_title || "N/A",
              status: statusMap[item.status || "Created"] || "To Do",
              priority: item.priority || "Low",
              assignee: assigneeNames,
              category: item.category_name || "N/A",
              dueDate: item.due_date ? formatDate(item.due_date) : "N/A",
              progress: item.progress ?? 0,
            };
          }
        );

        setTasks(transformedData);
        setTotalCount(result.total_count || 0);
        setTotalPages(result.total_pages || 1);
      } else {
        message.error(result.message || "Failed to fetch tasks");
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching task list:", error);
      message.error("An error occurred while fetching tasks");
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, priorityFilter, assigneeFilter, categoryFilter]);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchTaskList();
  }, [fetchTaskList]);

  // Calculate status counts from current data
  const statusCounts = {
    toDo: tasks.filter((item) => item.status === "To Do" || item.status === "Created").length,
    underReview: tasks.filter((item) => item.status === "Under Review").length,
    inProgress: tasks.filter((item) => item.status === "In Progress").length,
    completed: tasks.filter((item) => item.status === "Completed").length,
  };

  // Get unique assignees and categories for filters
  const uniqueAssignees = Array.from(
    new Set(tasks.map((task) => task.assignee))
  );
  const uniqueCategories = Array.from(
    new Set(tasks.map((task) => task.category))
  );

  const getStatusTag = (status: string) => {
    const statusConfig = {
      "To Do": { color: "default", label: "To-Do" },
      "Under Review": { color: "orange", label: "Under Review" },
      "In Progress": { color: "blue", label: "In Progress" },
      Completed: { color: "green", label: "Completed" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const getPriorityTag = (priority: string) => {
    const priorityConfig = {
      Low: { color: "green", label: "Low" },
      Medium: { color: "orange", label: "Medium" },
      High: { color: "red", label: "High" },
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return "#d9d9d9";
    if (progress < 50) return "#faad14";
    if (progress < 100) return "#1890ff";
    return "#52c41a";
  };

  // Handle task deletion
  const handleDelete = async (taskId: string) => {
    try {
      const result = await taskService.deleteTask(taskId);
      if (result.success) {
        message.success("Task deleted successfully");
        fetchTaskList();
      } else {
        message.error(result.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("An error occurred while deleting the task");
    }
  };

  const columns: ColumnsType<TaskManagementItem> = [
    {
      title: "Task",
      dataIndex: "taskName",
      key: "taskName",
      width: 250,
      render: (text) => (
        <Space>
          <FileText size={16} className="text-gray-500" />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (priority) => getPriorityTag(priority),
    },
    {
      title: "Assignee",
      dataIndex: "assignee",
      key: "assignee",
      width: 150,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 180,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 150,
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      width: 200,
      render: (progress) => (
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Progress
            percent={progress}
            strokeColor={getProgressColor(progress)}
            showInfo={false}
            size="small"
          />
          <span className="text-xs text-gray-600">{progress}%</span>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-2">
          <Popconfirm
            title="Delete Task"
            description="Are you sure you want to delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              className="flex items-center justify-center"
            />
          </Popconfirm>
          <Button
            type="text"
            icon={<Eye size={16} />}
            onClick={() => navigate(`/task-management/view/${record.id}`)}
            className="flex items-center justify-center text-blue-500 hover:text-blue-700"
          />
        </div>
      ),
    },
  ];

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
          Card: {
            paddingLG: 16,
            borderRadius: 12,
          },
          Button: {
            borderRadius: 8,
          },
          Select: {
            borderRadius: 8,
          },
          Tag: {
            borderRadius: 9999,
          },
        },
      }}
    >
      <div className="bg-gray-100 p-6">
        <div className="">
          {/* Header Section */}
          <Card className="mb-6">
            <div className="flex justify-between items-center flex-wrap gap-6">
              {/* Left Section - Title and Description */}
              <div className="flex-1 min-w-[300px]">
                <Space align="center" size={16}>
                  <div className="bg-green-500 p-4 rounded-xl w-14 h-14 flex items-center justify-center">
                    <CheckSquare color="white" size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold mb-1 text-gray-900">
                      Task Management
                    </h1>
                    <p className="m-0 text-gray-600 text-base">
                      Organized tracking and execution of all assigned tasks.
                    </p>
                  </div>
                </Space>
              </div>

              {/* Right Section - Summary Cards */}
              <div className="flex gap-4 flex-wrap">
                {/* To-Do Card */}
                <Card
                  bordered
                  hoverable
                  className="w-[220px] min-w-[200px] bg-white"
                  styles={{
                    body: {
                      padding: "12px",
                      borderRadius: "12px",
                    },
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center">
                      <FileText color="#6c757d" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">To-Do</div>
                      <div className="text-xl font-bold text-gray-900">
                        {statusCounts.toDo}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Under Review Card */}
                <Card
                  bordered
                  hoverable
                  className="w-[220px] min-w-[200px] bg-white"
                  styles={{
                    body: {
                      padding: "12px",
                      borderRadius: "12px",
                    },
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center">
                      <Clock color="#faad14" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Under Review</div>
                      <div className="text-xl font-bold text-gray-900">
                        {statusCounts.underReview}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* In Progress Card */}
                <Card
                  bordered
                  hoverable
                  className="w-[220px] min-w-[200px] bg-white"
                  styles={{
                    body: {
                      padding: "12px",
                      borderRadius: "12px",
                    },
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                      <Clock color="#1890ff" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">In Progress</div>
                      <div className="text-xl font-bold text-gray-900">
                        {statusCounts.inProgress}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Completed Card */}
                <Card
                  bordered
                  hoverable
                  className="w-[220px] min-w-[200px] bg-white"
                  styles={{
                    body: {
                      padding: "12px",
                      borderRadius: "12px",
                    },
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                      <CheckCircle color="#52c41a" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Completed</div>
                      <div className="text-xl font-bold text-gray-900">
                        {statusCounts.completed}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
          <Divider />

          {/* Tasks Section */}
          <Card>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-bold m-0">Tasks</h2>
              <Space wrap>
                <Button
                  icon={<Filter size={16} />}
                  size="large"
                  className="border-gray-300"
                >
                  Filter
                </Button>
                <Select
                  defaultValue="All Priorities"
                  className="w-[150px]"
                  size="large"
                  value={priorityFilter}
                  onChange={(value) => setPriorityFilter(value)}
                  options={[
                    { label: "All Priorities", value: "all" },
                    { label: "Low", value: "low" },
                    { label: "Medium", value: "medium" },
                    { label: "High", value: "high" },
                  ]}
                />
                <Select
                  defaultValue="All Assignees"
                  className="w-[150px]"
                  size="large"
                  value={assigneeFilter}
                  onChange={(value) => setAssigneeFilter(value)}
                  options={[
                    { label: "All Assignees", value: "all" },
                    ...uniqueAssignees.map((assignee) => ({
                      label: assignee,
                      value: assignee,
                    })),
                  ]}
                />
                <Select
                  defaultValue="All Categories"
                  className="w-[160px]"
                  size="large"
                  value={categoryFilter}
                  onChange={(value) => setCategoryFilter(value)}
                  options={[
                    { label: "All Categories", value: "all" },
                    ...uniqueCategories.map((category) => ({
                      label: category,
                      value: category,
                    })),
                  ]}
                />
                <Button
                  type="primary"
                  icon={<Plus size={16} />}
                  size="large"
                  onClick={() => navigate("/task-management/new")}
                >
                  Create Task
                </Button>
              </Space>
            </div>

            <Spin spinning={isLoading}>
              <Table
                columns={columns}
                dataSource={tasks}
                pagination={false}
                scroll={{ x: 1200 }}
                rowKey="id"
                loading={isLoading}
              />
            </Spin>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Space className="w-full justify-between">
                <div className="text-gray-600 text-sm">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
                  entries
                </div>
                <div>
                  <Space size={4}>
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="border-none py-1 px-2"
                    >
                      <div className="text-base">‹</div>
                    </Button>
                    {Array.from(
                      { length: Math.min(totalPages, 10) },
                      (_, i) => i + 1
                    ).map((pageNum) => (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        type={currentPage === pageNum ? "primary" : "text"}
                        className="w-8 h-8 p-0 font-semibold border-none"
                      >
                        {pageNum}
                      </Button>
                    ))}
                    <Button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="border-none py-1 px-2"
                    >
                      <div className="text-base">›</div>
                    </Button>
                  </Space>
                </div>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default TaskManagement;
