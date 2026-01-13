import React, { useState, useEffect, useCallback } from "react";
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
  Spin,
  message,
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
import { useNavigate } from "react-router-dom";
import pcfService from "../lib/pcfService";
import type { PCFBOMItem } from "../lib/pcfService";

interface PCFRequestItem {
  id: string;
  requestNumber: string;
  productName: string;
  productIcon: React.ReactNode;
  status: "in-progress" | "completed" | "draft" | "rejected";
  submittedBy: string;
  submittedOn: string;
}

const PCFRequest: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<
    [string | null, string | null] | null
  >(null);
  const [pcfRequests, setPcfRequests] = useState<PCFRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Helper function to get product icon based on category
  const getProductIcon = (categoryName: string): React.ReactNode => {
    const category = categoryName?.toLowerCase() || "";
    if (category.includes("battery") || category.includes("power")) {
      return <Battery className="text-green-600" size={20} />;
    } else if (category.includes("frame") || category.includes("chassis")) {
      return <Car className="text-purple-600" size={20} />;
    } else if (category.includes("light")) {
      return <Lightbulb className="text-yellow-600" size={20} />;
    } else if (category.includes("control") || category.includes("unit")) {
      return <Microchip className="text-blue-600" size={20} />;
    }
    return <Car className="text-indigo-600" size={20} />;
  };

  // Helper function to determine status from API response
  const getStatus = (
    item: any
  ): "in-progress" | "completed" | "draft" | "rejected" => {
    const status = item.status?.toLowerCase() || "";
    
    if (status === "rejected") return "rejected";
    if (status === "approved" || status === "completed") return "completed";
    if (status === "draft" || item.is_draft) return "draft";
    if (status === "in-progress" || status === "in progress" || status === "pending") return "in-progress";
    
    // Default to draft if status is unclear
    return "draft";
  };

  // Fetch PCF BOM list from API
  const fetchPCFList = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await pcfService.getPCFBOMList(currentPage, pageSize);

      if (result.success && result.data && Array.isArray(result.data)) {
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
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? "PM" : "AM";
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, "0");
            return `${day} ${month} ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
          } catch (error) {
            return "N/A";
          }
        };

        // Transform API data to PCFRequestItem
        const transformedData: PCFRequestItem[] = result.data.map((item: any) => {
          // Extract product category name from nested structure or direct field
          const productCategoryName = 
            item.product_category?.name || 
            item.product_category_name || 
            item.component_category?.name ||
            item.component_category_name || 
            "N/A";
          
          // Extract submitted by from nested structure
          const submittedBy = 
            item.pcf_request_stages?.pcf_request_created_by?.user_name ||
            item.created_by_name ||
            "Unknown";
          
          // Extract created date
          const createdDate = 
            item.pcf_request_stages?.pcf_request_created_date ||
            item.created_date ||
            item.createdDate;
          
          return {
            id: item.id,
            requestNumber: item.code || item.request_number || "N/A",
            productName: productCategoryName,
            productIcon: getProductIcon(productCategoryName),
            status: getStatus(item),
            submittedBy: submittedBy,
            submittedOn: createdDate ? formatDate(createdDate) : "N/A",
          };
        });

        setPcfRequests(transformedData);
        setTotalCount(result.total_count || transformedData.length);
        setTotalPages(result.total_pages || 1);
        
        // Debug logging
        console.log("PCF List fetched:", {
          totalItems: transformedData.length,
          totalCount: result.total_count,
          totalPages: result.total_pages,
          sampleItem: transformedData[0],
        });
      } else {
        console.error("PCF List fetch failed:", {
          success: result.success,
          hasData: !!result.data,
          isArray: Array.isArray(result.data),
          result,
        });
        message.error(result.message || "Failed to fetch PCF requests");
        setPcfRequests([]);
      }
    } catch (error) {
      console.error("Error fetching PCF list:", error);
      message.error("An error occurred while fetching PCF requests");
      setPcfRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  // Load data on component mount and when page changes
  useEffect(() => {
    fetchPCFList();
  }, [fetchPCFList]);

  // Calculate status counts from current data
  const statusCounts = {
    inProgress: pcfRequests.filter((item) => item.status === "in-progress")
      .length,
    completed: pcfRequests.filter((item) => item.status === "completed").length,
    pending: pcfRequests.filter((item) => item.status === "draft").length,
  };

  // Filter requests based on status filter
  const filteredRequests =
    statusFilter === "all"
      ? pcfRequests
      : pcfRequests.filter((item) => item.status === statusFilter);

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
      render: (_, record) => (
        <Button
          type="text"
          onClick={() => navigate(`/pcf-request/${record.id}`)}
          icon={
            <Eye
              size={16}
              className="flex items-center justify-center mt-[5px]"
            />
          }
        >
          View
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
      <div className="bg-gray-100 p-6">
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
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
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
                <Button
                  type="primary"
                  icon={<Plus size={16} />}
                  size="large"
                  onClick={() => navigate("/pcf-request/new")}
                >
                  New Request
                </Button>
              </Space>
            </div>

            <Spin spinning={isLoading}>
              <Table
                columns={columns}
                dataSource={filteredRequests}
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

export default PCFRequest;
