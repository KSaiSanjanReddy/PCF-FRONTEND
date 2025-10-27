import React, { useState } from "react";
import {
  Table,
  Card,
  Button,
  Select,
  Pagination,
  Space,
  Tag,
  Divider,
  DatePicker,
} from "antd";
import { ConfigProvider } from "antd";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
  Car,
  Battery,
  Lightbulb,
  Microchip,
} from "lucide-react";
import type { ColumnsType } from "antd/es/table";

interface PCFRequestItem {
  id: number;
  requestNumber: string;
  productName: string;
  productIcon: React.ReactNode;
  status: "in-progress" | "completed" | "draft" | "rejected";
  submittedBy: string;
  submittedOn: string;
}

const PCFRequest: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<
    [string | null, string | null] | null
  >(null);

  // Mock data - matching the image exactly
  const pcfRequests: PCFRequestItem[] = [
    {
      id: 1,
      requestNumber: "PCF-2023-0002",
      productName: "Engine Control Unit",
      productIcon: <Microchip className="text-blue-600" size={20} />,
      status: "in-progress",
      submittedBy: "Tesla Inc.",
      submittedOn: "23 Jul 2023, 10:45 AM",
    },
    {
      id: 2,
      requestNumber: "PCF-2023-0002",
      productName: "Chassis Frame",
      productIcon: <Car className="text-purple-600" size={20} />,
      status: "completed",
      submittedBy: "BMW AG",
      submittedOn: "23 Jul 2023, 10:45 AM",
    },
    {
      id: 3,
      requestNumber: "PCF-2023-0002",
      productName: "Battery Pack",
      productIcon: <Battery className="text-green-600" size={20} />,
      status: "draft",
      submittedBy: "Volkswagen Group",
      submittedOn: "23 Jul 2023, 10:45 AM",
    },
    {
      id: 4,
      requestNumber: "PCF-2023-0002",
      productName: "Headlight Assembly",
      productIcon: <Lightbulb className="text-yellow-600" size={20} />,
      status: "rejected",
      submittedBy: "Ford Motor Company",
      submittedOn: "23 Jul 2023, 10:45 AM",
    },
    {
      id: 5,
      requestNumber: "PCF-2023-0002",
      productName: "Steering System",
      productIcon: <Car className="text-indigo-600" size={20} />,
      status: "in-progress",
      submittedBy: "Mercedes-Benz AG",
      submittedOn: "23 Jul 2023, 10:45 AM",
    },
    {
      id: 6,
      requestNumber: "PCF-2023-0002",
      productName: "Suspension Unit",
      productIcon: <Car className="text-teal-600" size={20} />,
      status: "completed",
      submittedBy: "Audi AG",
      submittedOn: "23 Jul 2023, 10:45 AM",
    },
    {
      id: 7,
      requestNumber: "PCF-2023-0002",
      productName: "Climate Control",
      productIcon: <Microchip className="text-orange-600" size={20} />,
      status: "draft",
      submittedBy: "Toyota Motor Corp.",
      submittedOn: "23 Jul 2023, 10:45 AM",
    },
    {
      id: 8,
      requestNumber: "PCF-2023-0002",
      productName: "Steering System",
      productIcon: <Car className="text-indigo-600" size={20} />,
      status: "in-progress",
      submittedBy: "Mercedes-Benz AG",
      submittedOn: "23 Jul 2023, 10:45 AM",
    },
  ];

  const statusCounts = {
    inProgress: 12,
    completed: 8,
    pending: 4,
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      "in-progress": { color: "blue", label: "In Progress" },
      completed: { color: "green", label: "Completed" },
      draft: { color: "gold", label: "Draft" },
      rejected: { color: "red", label: "Rejected" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const columns: ColumnsType<PCFRequestItem> = [
    {
      title: "PCF Request Number",
      dataIndex: "requestNumber",
      key: "requestNumber",
      width: 180,
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      width: 250,
      render: (_, record) => (
        <Space>
          {record.productIcon}
          <span>{record.productName}</span>
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
      title: "Submitted By",
      dataIndex: "submittedBy",
      key: "submittedBy",
      width: 200,
    },
    {
      title: "Submitted On",
      dataIndex: "submittedOn",
      key: "submittedOn",
      width: 200,
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: () => (
        <Button type="text" onClick={() => console.log("View clicked")}>
          <Eye size={18} />
        </Button>
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
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="">
          {/* Header Section */}
          <Card className="mb-6">
            <div className="flex justify-between items-center flex-wrap gap-6">
              {/* Left Section - Title and Description */}
              <div className="flex-1 min-w-[300px]">
                <Space align="center" size={16}>
                  <div className="bg-green-500 p-4 rounded-xl w-14 h-14 flex items-center justify-center">
                    <ClipboardList color="white" size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold mb-1 text-gray-900">
                      PCF Request Management
                    </h1>
                    <p className="m-0 text-gray-600 text-base">
                      Streamlined carbon footprint tracking and approval
                      workflow
                    </p>
                  </div>
                </Space>
              </div>

              {/* Right Section - Summary Cards */}
              <div className="flex gap-4 flex-wrap">
                {/* In Progress Card */}
                <Card
                  bordered
                  hoverable
                  className="w-[220px] min-w-[200px] bg-white "
                  styles={{
                    body: {
                      padding: "12px",
                      borderRadius: "12px",
                    },
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                      <Clock color="#007bff" size={24} />
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
                  className="w-[220px] min-w-[200px] bg-white "
                  styles={{
                    body: {
                      padding: "12px",
                      borderRadius: "12px",
                    },
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                      <CheckCircle color="#28a745" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Completed</div>
                      <div className="text-xl font-bold text-gray-900">
                        {statusCounts.completed}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Pending Card */}
                <Card
                  bordered
                  hoverable
                  className="w-[220px] min-w-[200px] bg-white "
                  styles={{
                    body: {
                      padding: "12px",
                      borderRadius: "12px",
                    },
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center">
                      <AlertCircle color="#dc3545" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Pending</div>
                      <div className="text-xl font-bold text-gray-900">
                        {statusCounts.pending}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
          <Divider />

          {/* Requests Section */}
          <Card>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-bold m-0">PCF Requests</h2>
              <Space wrap>
                <DatePicker.RangePicker
                  size="large"
                  format="DD MMM YYYY"
                  placeholder={["Start Date", "End Date"]}
                  onChange={(dates) => {
                    if (dates) {
                      setDateRange([
                        dates[0]?.format("YYYY-MM-DD") || null,
                        dates[1]?.format("YYYY-MM-DD") || null,
                      ]);
                    } else {
                      setDateRange(null);
                    }
                  }}
                  className="w-[240px]"
                  allowClear
                />
                <Select
                  defaultValue="All Status"
                  className="w-[150px]"
                  size="large"
                  options={[
                    { label: "All Status", value: "all" },
                    { label: "In Progress", value: "in-progress" },
                    { label: "Completed", value: "completed" },
                    { label: "Draft", value: "draft" },
                    { label: "Rejected", value: "rejected" },
                  ]}
                />
                <Select
                  defaultValue="All Categories"
                  className="w-[160px]"
                  size="large"
                  options={[
                    { label: "All Categories", value: "all" },
                    { label: "Electronics", value: "electronics" },
                    { label: "Mechanical", value: "mechanical" },
                    { label: "Power Systems", value: "power" },
                  ]}
                />
                <Button type="primary" icon={<Plus size={16} />} size="large">
                  New Request
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={pcfRequests}
              pagination={false}
              scroll={{ x: 1200 }}
              rowKey="id"
            />

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Space className="w-full justify-between">
                <div className="text-gray-600 text-sm">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, 24)} of 24 entries
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
                    {[1, 2, 3].map((pageNum) => (
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
                      disabled={currentPage === 3}
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

export default PCFRequest;
