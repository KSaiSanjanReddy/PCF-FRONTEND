import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  message,
  Dropdown,
  Spin,
} from "antd";
import type { MenuProps } from "antd/lib/menu";
import {
  FileText,
  Plus,
  Download,
  Search,
  MoreHorizontal,
  File,
  Clock,
  HardDrive,
  Trash2,
  Eye,
  Edit,
  Share2,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  documentMasterService,
} from "../lib/documentMasterService";
import type { DocumentItem as DocumentItemType } from "../lib/documentMasterService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Option } = Select;

const DocumentMaster: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentItemType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState({
    totalDocuments: 0,
    pendingDocuments: 0,
    pcfDocuments: 0,
    approvedDocuments: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchDocuments = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const result = await documentMasterService.getDocumentList(page, pageSize);
      if (result.data) {
        setDocuments(result.data);
        setPagination({
          ...pagination,
          current: result.currentPage || page,
          total: result.totalRecords || 0,
        });

        if (result.stats) {
          setStats({
            totalDocuments: result.stats.totalDocuments,
            pendingDocuments: result.stats.pendingDocuments,
            pcfDocuments: result.stats.pcfDocuments,
            approvedDocuments: result.data.filter((d: DocumentItemType) => d.status === "Approved").length,
          });
        }
      } else {
        message.error(result.message || "Failed to fetch documents");
      }
    } catch (error) {
      message.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleTableChange = (newPagination: any) => {
    fetchDocuments(newPagination.current, newPagination.pageSize);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await documentMasterService.deleteDocument(id);
      if (result.success) {
        message.success("Document deleted successfully");
        fetchDocuments(pagination.current, pagination.pageSize);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error("Failed to delete document");
    }
  };

  const getRowActions = (record: DocumentItemType): MenuProps["items"] => [
    {
      key: "view",
      label: "View Details",
      icon: <Eye size={16} />,
      onClick: () => navigate(`/document-master/view/${record.id}`),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Edit size={16} />,
      onClick: () => navigate(`/document-master/edit/${record.id}`),
    },
    {
      key: "download",
      label: "Download",
      icon: <Download size={16} />,
      onClick: () => message.success(`Downloading ${record.document_title}`),
    },
    {
      key: "share",
      label: "Share",
      icon: <Share2 size={16} />,
      onClick: () => message.info(`Sharing ${record.document_title}`),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 size={16} />,
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ];

  const columns = [
    {
      title: "Document Name",
      dataIndex: "document_title",
      key: "document_title",
      render: (text: string, record: DocumentItemType) => (
        <Space>
          <div className="p-2 bg-green-100 rounded-xl">
            <FileText size={20} className="text-green-600" />
          </div>
          <Space direction="vertical" size={0}>
            <span className="font-medium text-gray-900">{text}</span>
            <span className="text-xs text-gray-500">
              {record.code} • {record.version}
            </span>
          </Space>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "document_type",
      key: "document_type",
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: "Category",
      dataIndex: "category_details",
      key: "category",
      render: (category: any) => category?.name || "-",
      responsive: ["md"],
    },
    {
      title: "Size",
      dataIndex: "file_size",
      key: "file_size",
      responsive: ["sm"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "Approved") color = "success";
        if (status === "Pending") color = "warning";
        if (status === "Rejected") color = "error";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Last Modified",
      dataIndex: "update_date",
      key: "update_date",
      responsive: ["xl"],
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: DocumentItemType) => (
        <Dropdown menu={{ items: getRowActions(record) }} trigger={["click"]}>
          <Button type="text" icon={<MoreHorizontal size={16} />} />
        </Dropdown>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.document_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

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
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Document Master
                  </h1>
                  <p className="text-gray-500">
                    Centralized document management and organization
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - Summary Cards */}
            <div className="flex gap-3 flex-wrap">
              {/* Total Documents */}
              <div className="bg-blue-50 rounded-xl p-4 min-w-[140px] border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 font-medium">Total</div>
                    <div className="text-xl font-bold text-blue-700">{stats.totalDocuments}</div>
                  </div>
                </div>
              </div>

              {/* PCF Documents */}
              <div className="bg-green-50 rounded-xl p-4 min-w-[140px] border border-green-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 w-10 h-10 rounded-xl flex items-center justify-center">
                    <File className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-green-600 font-medium">PCF Docs</div>
                    <div className="text-xl font-bold text-green-700">{stats.pcfDocuments}</div>
                  </div>
                </div>
              </div>

              {/* Pending */}
              <div className="bg-amber-50 rounded-xl p-4 min-w-[140px] border border-amber-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 w-10 h-10 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs text-amber-600 font-medium">Pending</div>
                    <div className="text-xl font-bold text-amber-700">{stats.pendingDocuments}</div>
                  </div>
                </div>
              </div>

              {/* Approved */}
              <div className="bg-purple-50 rounded-xl p-4 min-w-[140px] border border-purple-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 w-10 h-10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-purple-600 font-medium">Approved</div>
                    <div className="text-xl font-bold text-purple-700">{stats.approvedDocuments}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Documents</h2>
            <Space wrap>
              <Input
                prefix={<Search size={16} className="text-gray-400" />}
                placeholder="Search documents..."
                className="w-[200px]"
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                defaultValue="all"
                className="w-[140px]"
                size="large"
                value={typeFilter}
                onChange={(value) => setTypeFilter(value)}
              >
                <Option value="all">All Types</Option>
                <Option value="Manual">Manual</Option>
                <Option value="Specification">Specification</Option>
                <Option value="Report">Report</Option>
                <Option value="Certificate">Certificate</Option>
              </Select>
              <Button
                icon={<Download size={16} />}
                size="large"
              >
                Export
              </Button>
              <Button
                type="primary"
                icon={<Plus size={16} />}
                size="large"
                onClick={() => navigate("/document-master/new")}
                className="shadow-lg shadow-green-600/20"
              >
                Upload New
              </Button>
            </Space>
          </div>

          <Spin spinning={loading}>
            <Table
              rowSelection={rowSelection}
              columns={columns as any}
              dataSource={filteredDocuments}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 1000 }}
              className="rounded-xl overflow-hidden"
            />
          </Spin>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-gray-500 text-sm">
              Showing <span className="font-medium text-gray-900">{(pagination.current - 1) * pagination.pageSize + 1}</span> to{" "}
              <span className="font-medium text-gray-900">{Math.min(pagination.current * pagination.pageSize, pagination.total)}</span> of{" "}
              <span className="font-medium text-gray-900">{pagination.total}</span> entries
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.current === 1}
                onClick={() => handleTableChange({ ...pagination, current: pagination.current - 1 })}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {Array.from(
                { length: Math.min(Math.ceil(pagination.total / pagination.pageSize), 5) },
                (_, i) => i + 1
              ).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handleTableChange({ ...pagination, current: pageNum })}
                  className={`w-9 h-9 rounded-lg font-medium transition-all ${
                    pagination.current === pageNum
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => handleTableChange({ ...pagination, current: pagination.current + 1 })}
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

export default DocumentMaster;
