import React, { useEffect, useState, useCallback } from "react";
import {
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
  message,
} from "antd";
import {
  Puzzle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Wrench,
  Zap,
  Settings,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import componentMasterService, { type ComponentItem } from "../lib/componentMasterService";

const { Title, Text } = Typography;
const { Option } = Select;

// interface ComponentItem {
//   id: string;
//   componentCode: string;
//   componentName: string;
//   lifecycleStage: string;
//   manufacturer: string;
//   location: string;
//   materialType: string;
//   weight: string;
//   recyclability: string;
//   certificateStatus: string;
//   status: string;
// }

const ComponentsMaster: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<ComponentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchComponents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await componentMasterService.getComponentList({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        search: searchTerm || undefined,
      });

      if (result.success && result.data) {
        const data = result.data;
        setComponents(data.data);
        setFilteredComponents(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.totalCount || data.data.length || 0,
        }));
      } else {
        message.error(result.message || "Failed to fetch components");
        setComponents([]);
        setFilteredComponents([]);
      }
    } catch (error) {
      console.error("Error fetching components:", error);
      message.error("Failed to fetch components");
      setComponents([]);
      setFilteredComponents([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchTerm]);

  const filterComponents = useCallback(() => {
    let filtered = [...components];

    // Apply search filter (client-side filtering for immediate feedback)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.componentCode?.toLowerCase().includes(searchLower) ||
          c.componentName?.toLowerCase().includes(searchLower) ||
          c.manufacturer?.toLowerCase().includes(searchLower) ||
          c.code?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    setFilteredComponents(filtered);
  }, [searchTerm, filterStatus, components]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  useEffect(() => {
    filterComponents();
  }, [filterComponents]);

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "default";
      default:
        return "default";
    }
  };

  const getProductIcon = (index: number) => {
    const icons = [Wrench, Zap, Settings, FileText];
    return icons[index % icons.length];
  };

  const columns = [
    {
      title: "Component Code",
      dataIndex: "componentCode",
      key: "componentCode",
      render: (text: string, record: ComponentItem) => (
        <Button
          type="link"
          onClick={() => navigate(`/components-master/view/${record.id}`)}
          className="p-0 font-semibold"
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Component Name",
      dataIndex: "componentName",
      key: "componentName",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Lifecycle Stage",
      dataIndex: "lifecycleStage",
      key: "lifecycleStage",
    },
    {
      title: "Manufacturer",
      dataIndex: "manufacturer",
      key: "manufacturer",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Material Type",
      dataIndex: "materialType",
      key: "materialType",
    },
    {
      title: "Weight / Quantity",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ComponentItem) => (
        <Space>
          <Button
            type="text"
            icon={<Eye size={16} />}
            onClick={() => navigate(`/components-master/view/${record.id}`)}
          />
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => navigate(`/components-master/edit/${record.id}`)}
          />
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => {
              // TODO: Implement delete
              message.info("Delete functionality coming soon");
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <Puzzle className="w-6 h-6 text-white" />
          </div>
          <div>
            <Title level={2} className="!mb-0 !text-gray-900">
              Components Master
            </Title>
            <Text type="secondary">
              Streamlined tracking and administration for all component details
            </Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          size="large"
          onClick={() => navigate("/components-master/new")}
        >
          Add Component
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by code, name, or manufacturer..."
              prefix={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Reset to first page when searching
                if (e.target.value !== searchTerm) {
                  setPagination({ ...pagination, current: 1 });
                }
              }}
              onPressEnter={() => {
                // Fetch from API when Enter is pressed
                fetchComponents();
              }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Filter by Status"
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full"
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredComponents}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default ComponentsMaster;
