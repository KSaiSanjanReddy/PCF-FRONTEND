import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Select,
  Progress,
  List,
  Avatar,
  message,
  Dropdown,
  Tooltip,
} from "antd";
import type { MenuProps } from "antd/lib/menu";
import {
  FileText,
  Plus,
  FolderPlus,
  Download,
  Archive,
  Search,
  Filter,
  MoreHorizontal,
  File,
  Clock,
  HardDrive,
  Trash2,
  Eye,
  Edit,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  documentMasterService,
} from "../lib/documentMasterService";
import type { DocumentItem as DocumentItemType } from "../lib/documentMasterService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
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

  const fetchDocuments = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const result = await documentMasterService.getDocumentList(page, pageSize);
      if (result.success) {
        setDocuments(result.data);
        setPagination({
          ...pagination,
          current: page,
          total: result.total_count || 0,
        });
      } else {
        message.error(result.message);
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
      onClick: () => message.info(`Viewing ${record.document_title}`),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Edit size={16} />,
      onClick: () => message.info(`Editing ${record.document_title}`),
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
          <div style={{ 
            padding: 8, 
            borderRadius: 8, 
            background: "#e6f7ff", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <FileText size={20} className="text-blue-500" />
          </div>
          <Space direction="vertical" size={0}>
            <Text strong>{text}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.code} • {record.version}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "document_type",
      key: "document_type",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Category",
      dataIndex: "categoryDetails",
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
      title: "Uploader",
      dataIndex: "created_by",
      key: "created_by",
      responsive: ["lg"],
      render: (_: string, record: DocumentItemType) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: "#87d068" }}>
            {record.createdBy?.user_name?.[0] || "U"}
          </Avatar>
          <Text>{record.createdBy?.user_name || "Unknown"}</Text>
        </Space>
      ),
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

  // Mock Data for Dashboard
  const stats = [
    { title: "Total Documents", value: "1,248", icon: FileText, color: "#1890ff" },
    { title: "PCF Documents", value: "856", icon: File, color: "#52c41a" },
    { title: "Pending Review", value: "42", icon: Clock, color: "#faad14" },
    { title: "Storage Used", value: "45.2 GB", icon: HardDrive, color: "#722ed1" },
  ];

  const recentActivity = [
    { title: "New PCF Report uploaded", time: "2 mins ago", user: "Sarah Smith" },
    { title: "Safety Guidelines updated", time: "1 hour ago", user: "Mike Johnson" },
    { title: "Q3 Audit Report approved", time: "3 hours ago", user: "Anna Davis" },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  return (
    <Layout style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>Document Master</Title>
            <Text type="secondary">Centralized document management and organization</Text>
          </div>
          <Space>
            <Button icon={<Download size={16} />}>Export</Button>
            <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate("/document-master/new")}>
              Upload New
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]}>
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card bordered={false} hoverable>
                <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                  <div>
                    <Text type="secondary">{stat.title}</Text>
                    <Title level={3} style={{ margin: "8px 0 0" }}>{stat.value}</Title>
                  </div>
                  <div style={{
                    padding: "12px",
                    borderRadius: "12px",
                    background: `${stat.color}15`,
                    color: stat.color,
                    display: "flex"
                  }}>
                    <stat.icon size={24} />
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          {/* Main Content - Document List */}
          <Col xs={24} lg={16}>
            <Card bordered={false} title="All Documents">
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                {/* Filters */}
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                  <Col flex="auto">
                    <Input prefix={<Search size={16} />} placeholder="Search documents..." style={{ maxWidth: 300 }} />
                  </Col>
                  <Col>
                    <Space>
                      <Select defaultValue="all" style={{ width: 150 }}>
                        <Option value="all">All Types</Option>
                        <Option value="pdf">PDF</Option>
                        <Option value="doc">Word</Option>
                      </Select>
                      <Button icon={<Filter size={16} />}>Filters</Button>
                    </Space>
                  </Col>
                </Row>

                {/* Bulk Actions Bar */}
                {hasSelected && (
                  <div style={{ 
                    background: "#e6f7ff", 
                    padding: "8px 16px", 
                    borderRadius: "8px", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    border: "1px solid #91d5ff"
                  }}>
                    <Text>{selectedRowKeys.length} selected</Text>
                    <Space>
                      <Button size="small" icon={<Download size={14} />}>Download</Button>
                      <Button size="small" icon={<Archive size={14} />}>Archive</Button>
                      <Button size="small" danger icon={<Trash2 size={14} />}>Delete</Button>
                    </Space>
                  </div>
                )}

                {/* Table */}
                <Table
                  rowSelection={rowSelection}
                  columns={columns as any}
                  dataSource={documents}
                  rowKey="id"
                  loading={loading}
                  pagination={pagination}
                  onChange={handleTableChange}
                />
              </Space>
            </Card>
          </Col>

          {/* Sidebar - Analytics & Quick Actions */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Quick Actions */}
              <Card bordered={false} title="Quick Actions">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button block icon={<Plus size={16} />} style={{ textAlign: "left", height: "auto", padding: "12px" }} onClick={() => navigate("/document-master/new")}>
                    <Space direction="vertical" size={0}>
                      <Text strong>Upload New Document</Text>
                    </Space>
                  </Button>
                  <Button block icon={<FolderPlus size={16} />} style={{ textAlign: "left", height: "auto", padding: "12px" }}>
                    <Space direction="vertical" size={0}>
                      <Text strong>Create New Folder</Text>
                    </Space>
                  </Button>
                  <Button block icon={<Download size={16} />} style={{ textAlign: "left", height: "auto", padding: "12px" }}>
                    <Space direction="vertical" size={0}>
                      <Text strong>Bulk Download</Text>
                    </Space>
                  </Button>
                </Space>
              </Card>

              {/* Storage Analytics */}
              <Card bordered={false} title="Storage Analytics">
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text>Total Storage</Text>
                      <Text strong>45.2 GB / 100 GB</Text>
                    </div>
                    <Progress percent={45} showInfo={false} strokeColor="#1890ff" />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text>Documents</Text>
                      <Text strong>65%</Text>
                    </div>
                    <Progress percent={65} showInfo={false} strokeColor="#52c41a" />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text>Images</Text>
                      <Text strong>25%</Text>
                    </div>
                    <Progress percent={25} showInfo={false} strokeColor="#faad14" />
                  </div>
                </Space>
              </Card>

              {/* Recent Activity */}
              <Card bordered={false} title="Recent Activity">
                <List
                  itemLayout="horizontal"
                  dataSource={recentActivity}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar style={{ backgroundColor: "#1890ff" }} icon={<FileText size={12} />} size="small" />}
                        title={<Text style={{ fontSize: "14px" }}>{item.title}</Text>}
                        description={<Text type="secondary" style={{ fontSize: "12px" }}>{item.user} • {item.time}</Text>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Space>
          </Col>
        </Row>
      </Space>
    </Layout>
  );
};

export default DocumentMaster;
