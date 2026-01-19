import React, { useEffect, useState } from "react";
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

const { Title, Text } = Typography;
const { Option } = Select;

interface ComponentItem {
  id: string;
  componentCode: string;
  componentName: string;
  lifecycleStage: string;
  manufacturer: string;
  location: string;
  materialType: string;
  weight: string;
  recyclability: string;
  certificateStatus: string;
  status: string;
}

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

  // Mock data - replace with API call later
  const mockComponents: ComponentItem[] = [
    {
      id: "1",
      componentCode: "ABC 123",
      componentName: "Steel Shaft",
      lifecycleStage: "Use Phase",
      manufacturer: "XYZ Ltd.",
      location: "Germany",
      materialType: "Alloy Steel",
      weight: "2.3 kg",
      recyclability: "Yes (80%)",
      certificateStatus: "Uploaded on 10 Jul 2025",
      status: "active",
    },
    {
      id: "2",
      componentCode: "DEF 456",
      componentName: "Aluminum Frame",
      lifecycleStage: "Manufacturing",
      manufacturer: "ABC Corp",
      location: "USA",
      materialType: "Aluminum",
      weight: "1.5 kg",
      recyclability: "Yes (95%)",
      certificateStatus: "Pending",
      status: "active",
    },
    {
      id: "3",
      componentCode: "GHI 789",
      componentName: "Plastic Housing",
      lifecycleStage: "End-of-Life",
      manufacturer: "Plastico Inc",
      location: "China",
      materialType: "Polycarbonate",
      weight: "0.8 kg",
      recyclability: "Yes (60%)",
      certificateStatus: "Expired",
      status: "inactive",
    },
  ];

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    filterComponents();
  }, [searchTerm, filterStatus, components]);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const result = await componentService.getComponentList();
      // setComponents(result.data);
      
      // Mock data for now
      setTimeout(() => {
        setComponents(mockComponents);
        setFilteredComponents(mockComponents);
        setPagination({
          ...pagination,
          total: mockComponents.length,
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error("Failed to fetch components");
      setLoading(false);
    }
  };

  const filterComponents = () => {
    let filtered = [...components];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.componentCode?.toLowerCase().includes(searchLower) ||
          c.componentName?.toLowerCase().includes(searchLower) ||
          c.manufacturer?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    setFilteredComponents(filtered);
    setPagination({
      ...pagination,
      total: filtered.length,
    });
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
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
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Puzzle className="w-6 h-6 text-white" />
          </div>
          <div>
            <Title level={2} className="mb-0">
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
          className="bg-green-500 hover:bg-green-600"
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
