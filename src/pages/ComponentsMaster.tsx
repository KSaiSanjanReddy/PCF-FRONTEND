import React, { useEffect, useState, useCallback } from "react";
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
  Puzzle,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Search,
} from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import componentMasterService, { type ComponentItem } from "../lib/componentMasterService";

const ComponentsMaster: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<[string | null, string | null] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComponents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await componentMasterService.getComponentList({
        pageNumber: currentPage,
        pageSize: pageSize,
        search: searchTerm || undefined,
        fromDate: dateRange?.[0] || undefined,
        toDate: dateRange?.[1] || undefined,
        pcfStatus: statusFilter !== "all" ? statusFilter : undefined,
      });

      if (result.success && result.data) {
        const data = result.data;
        setComponents(data.data);
        setTotalCount(data.totalCount || data.data.length || 0);
        setTotalPages(Math.ceil((data.totalCount || data.data.length || 0) / pageSize));
      } else {
        message.error(result.message || "Failed to fetch components");
        setComponents([]);
      }
    } catch (error) {
      console.error("Error fetching components:", error);
      message.error("Failed to fetch components");
      setComponents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, dateRange, statusFilter]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  // Calculate status counts from current data
  const statusCounts = {
    inProgress: components.filter((item) =>
      item.status?.toLowerCase() === "in-progress" ||
      item.status?.toLowerCase() === "in progress" ||
      item.status?.toLowerCase() === "pending"
    ).length,
    approved: components.filter((item) =>
      item.status?.toLowerCase() === "approved" ||
      item.status?.toLowerCase() === "completed"
    ).length,
    draft: components.filter((item) =>
      !item.status ||
      item.status?.toLowerCase() === "draft" ||
      item.status?.toLowerCase() === "null"
    ).length,
  };

  // Filter requests based on status filter
  const filteredComponents = statusFilter === "all"
    ? components
    : components.filter((item) => {
        const status = item.status?.toLowerCase() || "";
        if (statusFilter === "Approved") return status === "approved" || status === "completed";
        if (statusFilter === "null") return !item.status || status === "draft" || status === "null";
        return status === statusFilter.toLowerCase();
      });

  const getStatusTag = (status: string | undefined) => {
    const statusLower = status?.toLowerCase() || "";
    const statusConfig: Record<string, { color: string; label: string }> = {
      "approved": { color: "green", label: "Approved" },
      "completed": { color: "green", label: "Completed" },
      "in-progress": { color: "blue", label: "In Progress" },
      "in progress": { color: "blue", label: "In Progress" },
      "pending": { color: "blue", label: "Pending" },
      "draft": { color: "gold", label: "Draft" },
      "rejected": { color: "red", label: "Rejected" },
    };
    const config = statusConfig[statusLower] || { color: "gold", label: "Draft" };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const columns: ColumnsType<ComponentItem> = [
    {
      title: "PCF Code",
      dataIndex: "code",
      key: "code",
      width: 130,
      render: (text: string, record: ComponentItem) => (
        <Button
          type="link"
          onClick={() => navigate(`/components-master/view/${record.id}`)}
          className="p-0 font-semibold"
        >
          {text || "N/A"}
        </Button>
      ),
    },
    {
      title: "Request Title",
      dataIndex: "request_title",
      key: "request_title",
      width: 200,
      render: (text: string) => <span className="font-medium">{text || "N/A"}</span>,
    },
    {
      title: "Product Category",
      key: "product_category",
      width: 150,
      render: (_: any, record: ComponentItem) => (
        <span>{record.product_category?.name || "N/A"}</span>
      ),
    },
    {
      title: "Component Category",
      key: "component_category",
      width: 150,
      render: (_: any, record: ComponentItem) => (
        <span>{record.component_category?.name || "N/A"}</span>
      ),
    },
    {
      title: "Manufacturer",
      key: "manufacturer",
      width: 150,
      render: (_: any, record: ComponentItem) => (
        <span>{record.manufacturer?.name || "N/A"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Created By",
      key: "createdby",
      width: 150,
      render: (_: any, record: ComponentItem) => (
        <span>{record.createdby?.user_name || "N/A"}</span>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "created_date",
      key: "created_date",
      width: 180,
      render: (date: string) => {
        if (!date) return "N/A";
        try {
          const d = new Date(date);
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const day = d.getDate();
          const month = months[d.getMonth()];
          const year = d.getFullYear();
          const hours = d.getHours();
          const minutes = d.getMinutes();
          const ampm = hours >= 12 ? "PM" : "AM";
          const displayHours = hours % 12 || 12;
          const displayMinutes = minutes.toString().padStart(2, "0");
          return `${day} ${month} ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
        } catch {
          return "N/A";
        }
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: any, record: ComponentItem) => (
        <Button
          type="text"
          onClick={() => navigate(`/components-master/view/${record.id}`)}
          icon={<Eye size={16} className="flex items-center justify-center mt-[5px]" />}
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
                  <Puzzle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Components Master
                  </h1>
                  <p className="text-gray-500">
                    Streamlined tracking and administration for all component details
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
                    <div className="text-sm text-blue-600 font-medium">In Progress</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {statusCounts.inProgress}
                    </div>
                  </div>
                </div>
              </div>

              {/* Approved Card */}
              <div className="bg-green-50 rounded-xl p-4 min-w-[180px] border border-green-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 w-11 h-11 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-green-600 font-medium">Approved</div>
                    <div className="text-2xl font-bold text-green-700">
                      {statusCounts.approved}
                    </div>
                  </div>
                </div>
              </div>

              {/* Draft Card */}
              <div className="bg-amber-50 rounded-xl p-4 min-w-[180px] border border-amber-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 w-11 h-11 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-amber-600 font-medium">Draft</div>
                    <div className="text-2xl font-bold text-amber-700">
                      {statusCounts.draft}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Components Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Component List</h2>
            <Space wrap>
              <Input
                placeholder="Search..."
                prefix={<Search size={16} className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={() => {
                  setCurrentPage(1);
                  fetchComponents();
                }}
                allowClear
                className="w-[200px]"
                size="large"
              />
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
                  setCurrentPage(1);
                }}
                className="w-[240px]"
                allowClear
              />
              <Select
                defaultValue="All Status"
                className="w-[150px]"
                size="large"
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Approved", value: "Approved" },
                  { label: "Draft", value: "null" },
                ]}
              />
              <Button
                type="primary"
                icon={<Plus size={16} />}
                size="large"
                onClick={() => navigate("/components-master/new")}
                className="shadow-lg shadow-green-600/20"
              >
                Add Component
              </Button>
            </Space>
          </div>

          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredComponents}
              pagination={false}
              scroll={{ x: 1400 }}
              rowKey="id"
              className="rounded-xl overflow-hidden"
            />
          </Spin>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-gray-500 text-sm">
              Showing <span className="font-medium text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-medium text-gray-900">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
              <span className="font-medium text-gray-900">{totalCount}</span> entries
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
                (_, i) => i + 1
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

export default ComponentsMaster;
