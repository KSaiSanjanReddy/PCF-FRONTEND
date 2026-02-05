import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Select,
  Space,
  Tag,
  DatePicker,
  Spin,
  message,
  Input,
} from "antd";
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
  Search,
} from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import pcfService from "../lib/pcfService";
import type { PCFBOMItem } from "../lib/pcfService";
import dayjs from "dayjs";
import { usePermissions } from "../contexts/PermissionContext";

interface PCFRequestItem {
  id: string;
  requestNumber: string;
  productName: string;
  productIcon: React.ReactNode;
  status: "in-progress" | "completed" | "draft" | "rejected" | "open";
  submittedBy: string;
  submittedOn: string;
}

interface PCFFilters {
  is_approved?: boolean;
  is_rejected?: boolean;
  is_draft?: boolean | null;
  search?: string;
  from_date?: string;
  to_date?: string;
}

const PCFRequest: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { canCreate } = usePermissions();
  const [pageSize, setPageSize] = useState(10);
  const [pcfRequests, setPcfRequests] = useState<PCFRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  // Debounce search term - waits 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    item: any,
  ): "in-progress" | "completed" | "draft" | "rejected" | "open" => {
    const status = item.status?.toLowerCase() || "";

    if (status === "rejected") return "rejected";
    if (status === "approved" || status === "completed") return "completed";
    if (status === "draft" || item.is_draft) return "draft";
    if (
      status === "in-progress" ||
      status === "in progress" ||
      status === "pending"
    )
      return "in-progress";

    // Default to draft if status is unclear
    return "open";
  };

  // Build filters object based on current state
  const buildFilters = useCallback((): PCFFilters => {
    const filters: PCFFilters = {};

    // Status filter - map to API params
    if (statusFilter === "completed") {
      filters.is_approved = true;
    } else if (statusFilter === "rejected") {
      filters.is_rejected = true;
    } else if (statusFilter === "draft") {
      filters.is_draft = true;
    } else if (statusFilter === "in-progress") {
      // In-progress means not approved, not rejected, not draft (pending)
      filters.is_approved = false;
      filters.is_rejected = false;
      filters.is_draft = false;
    }
    // "all" - no status filters

    // Search filter (using debounced value)
    if (debouncedSearchTerm.trim()) {
      filters.search = debouncedSearchTerm.trim();
    }

    // Date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      filters.from_date = dateRange[0].format("YYYY-MM-DD");
      filters.to_date = dateRange[1].format("YYYY-MM-DD");
    }

    return filters;
  }, [statusFilter, debouncedSearchTerm, dateRange]);

  // Fetch PCF BOM list from API
  const fetchPCFList = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = buildFilters();
      const result = await pcfService.getPCFBOMList(
        currentPage,
        pageSize,
        filters,
      );

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
        const transformedData: PCFRequestItem[] = result.data.map(
          (item: any) => {
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
          },
        );

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
  }, [currentPage, pageSize, buildFilters]);

  // Load data on component mount and when page/filters change
  useEffect(() => {
    fetchPCFList();
  }, [fetchPCFList]);

  // Reset to page 1 when filters change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearch = () => {
    // Immediately trigger search on Enter without waiting for debounce
    setDebouncedSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  // Calculate status counts from current data
  const statusCounts = {
    inProgress: pcfRequests.filter((item) => item.status === "in-progress")
      .length,
    completed: pcfRequests.filter((item) => item.status === "completed").length,
    pending: pcfRequests.filter((item) => item.status === "draft").length,
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      "in-progress": { color: "blue", label: "In Progress" },
      completed: { color: "green", label: "Completed" },
      draft: { color: "gold", label: "Draft" },
      rejected: { color: "red", label: "Rejected" },
    };
    const config = statusConfig[status] || { color: "default", label: status || "Unknown" };
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
    <div className="p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center flex-wrap gap-6">
            {/* Left Section - Title and Description */}
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    PCF Request Management
                  </h1>
                  <p className="text-gray-500">
                    Streamlined carbon footprint tracking and approval workflow
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - Summary Cards */}
            <div className="flex gap-4 flex-wrap">
              {/* In Progress Card */}
              <div className="bg-blue-50 rounded-xl p-4 min-w-[180px] border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 w-11 h-11 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 font-medium">
                      In Progress
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {statusCounts.inProgress}
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Card */}
              <div className="bg-green-50 rounded-xl p-4 min-w-[180px] border border-green-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 w-11 h-11 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-green-600 font-medium">
                      Completed
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {statusCounts.completed}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Card */}
              <div className="bg-amber-50 rounded-xl p-4 min-w-[180px] border border-amber-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 w-11 h-11 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-amber-600 font-medium">
                      Pending
                    </div>
                    <div className="text-2xl font-bold text-amber-700">
                      {statusCounts.pending}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              PCF Requests
            </h2>
            <Space wrap>
              <Input
                placeholder="Search code, title, category..."
                prefix={<Search size={16} className="text-gray-400" />}
                size="large"
                className="w-[250px]"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
              <DatePicker.RangePicker
                size="large"
                format="DD MMM YYYY"
                placeholder={["Start Date", "End Date"]}
                value={dateRange}
                onChange={handleDateRangeChange}
                className="w-[260px]"
                allowClear
              />
              <Select
                className="w-[150px]"
                size="large"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "In Progress", value: "in-progress" },
                  { label: "Completed", value: "completed" },
                  { label: "Pending", value: "pending" },
                  { label: "Rejected", value: "rejected" },
                ]}
              />
              {canCreate("PCF Request") && (
                <Button
                  type="primary"
                  icon={<Plus size={16} />}
                  size="large"
                  onClick={() => navigate("/pcf-request/new")}
                  className="shadow-lg shadow-green-600/20"
                >
                  New Request
                </Button>
              )}
            </Space>
          </div>

          <Spin spinning={isLoading}>
            <Table
              columns={columns}
              dataSource={pcfRequests}
              pagination={false}
              scroll={{ x: 1200 }}
              rowKey="id"
              loading={isLoading}
              className="rounded-xl overflow-hidden"
            />
          </Spin>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-gray-500 text-sm">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-900">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-medium text-gray-900">{totalCount}</span>{" "}
              entries
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {Array.from(
                { length: Math.min(totalPages, 5) },
                (_, i) => i + 1,
              ).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-lg font-medium transition-all ${
                    currentPage === pageNum
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-600/20"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCFRequest;
