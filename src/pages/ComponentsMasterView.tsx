import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Tabs,
  Statistic,
  Divider,
  Timeline,
  Avatar,
  message,
  DatePicker,
} from "antd";
import {
  Puzzle,
  Edit,
  Trash2,
  Upload,
  Search,
  Eye,
  Download,
  Share2,
  Plus,
  Shield,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Wrench,
  Zap,
  Settings,
  File,
  ArrowLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import dayjs from "dayjs";
import componentMasterService, { type ComponentItem } from "../lib/componentMasterService";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ComponentData {
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
  [key: string]: any; // Allow additional fields from API
}

interface PCFUsage {
  pcfRequestNumber: string;
  productName: string;
  productIcon: string;
  quantityUnits: string;
  status: string;
}

interface LifecycleBreakdown {
  stage: string;
  pcfValue: string;
  percentage: string;
}

interface Certificate {
  id: string;
  name: string;
  status: string;
  uploadedDate: string;
  fileName: string;
  issueDate: string;
  verifiedBy: string;
  expiryDate: string;
  fileSize: string;
  daysUntilExpiry: string;
}

interface CertificateHistory {
  date: string;
  action: string;
  fileName: string;
  user: string;
  status: string;
}

interface HistoryEntry {
  id: string;
  user: string;
  action: string;
  description: string;
  date: string;
  icon: string;
  color: string;
}

const ComponentsMasterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [componentData, setComponentData] = useState<ComponentData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const mockPCFUsage: PCFUsage[] = [
    {
      pcfRequestNumber: "P001",
      productName: "Engine Control Unit",
      productIcon: "wrench",
      quantityUnits: "3 Units",
      status: "Completed",
    },
    {
      pcfRequestNumber: "P002",
      productName: "Chassis Frame",
      productIcon: "zap",
      quantityUnits: "4 Units",
      status: "Completed",
    },
    {
      pcfRequestNumber: "P003",
      productName: "Battery Pack",
      productIcon: "settings",
      quantityUnits: "2 Units",
      status: "Draft",
    },
    {
      pcfRequestNumber: "P004",
      productName: "Headlight Assembly",
      productIcon: "file",
      quantityUnits: "1 Unit",
      status: "Review",
    },
  ];

  const mockLifecycleBreakdown: LifecycleBreakdown[] = [
    { stage: "Raw Material Extraction", pcfValue: "0.00021 kgCO₂e", percentage: "60.9%" },
    { stage: "Manufacturing", pcfValue: "0.00009 kgCO₂e", percentage: "26.1%" },
    { stage: "Transport", pcfValue: "0.00003 kgCO₂e", percentage: "8.7%" },
    { stage: "Use Phase", pcfValue: "0.00007 kgCO₂e", percentage: "20.3%" },
    { stage: "End-of-Life", pcfValue: "0.00007 kgCO₂e", percentage: "14.5%" },
  ];

  const mockCertificate: Certificate = {
    id: "1",
    name: "ISO 9001:2015 Quality Management",
    status: "Valid",
    uploadedDate: "10 Jul 2025",
    fileName: "asdfg.PDF",
    issueDate: "10 May 2025",
    verifiedBy: "Pranay",
    expiryDate: "10 May 2026",
    fileSize: "2.4 MB",
    daysUntilExpiry: "365 Days",
  };

  const mockCertificateHistory: CertificateHistory[] = [
    { date: "P001", action: "Verified", fileName: "asdfg.PDF", user: "3 Units", status: "Active" },
    { date: "P001", action: "Uploaded", fileName: "asdfg.PDF", user: "3 Units", status: "Active" },
    { date: "P001", action: "Expired", fileName: "asdfg.PDF", user: "3 Units", status: "Archived" },
  ];

  const mockHistory: HistoryEntry[] = [
    {
      id: "1",
      user: "Admin User",
      action: "Updated PCF Data",
      description: "New Total PCF: 3.45e-4 kgCO2e",
      date: "15 Aug 2025, 14:32",
      icon: "check",
      color: "blue",
    },
    {
      id: "2",
      user: "QA Manager",
      action: "Uploaded Certificate",
      description: "certificate_steelshaft.pdf",
      date: "10 Jul 2025, 09:15",
      icon: "check",
      color: "green",
    },
    {
      id: "3",
      user: "Engineer",
      action: "Updated Component",
      description: "Updated material specifications and weight",
      date: "25 Jun 2025, 16:45",
      icon: "edit",
      color: "orange",
    },
    {
      id: "4",
      user: "Engineer",
      action: "Created Component",
      description: "Initial setup: Steel Shaft",
      date: "01 Jun 2025, 10:30",
      icon: "plus",
      color: "purple",
    },
  ];

  const fetchComponentData = useCallback(async () => {
    if (!id) {
      message.error("Component ID is missing");
      navigate("/components-master");
      return;
    }

    setLoading(true);
    try {
      const result = await componentMasterService.getComponentById(id);

      if (result.success && result.data) {
        const data = result.data;
        // Helper function to safely extract string from object or string
        const extractString = (value: any, fallback: string = "N/A"): string => {
          if (!value) return fallback;
          if (typeof value === "string") return value;
          if (typeof value === "object" && value.name) return value.name;
          return fallback;
        };

        // Extract string values first to prevent object rendering
        const componentCode = data.code || data.componentCode || "N/A";
        const componentName = extractString(data.componentName) || extractString(data.component_category) || extractString(data.component_type) || extractString(data.request_title) || "N/A";
        const lifecycleStage = extractString(data.lifecycleStage) || extractString(data.component_category) || "N/A";
        const manufacturer = extractString(data.manufacturer) || extractString(data.manufacturer_details) || "N/A";
        const location = extractString(data.location) || extractString((data as any).production_location) || "N/A";
        const materialType = extractString(data.materialType) || extractString(data.bom_details?.[0]?.material_type) || "N/A";
        const weight = extractString(data.weight) || (data.bom_details?.[0]?.weight_gms ? `${data.bom_details[0].weight_gms} gms` : "N/A");
        const recyclability = extractString(data.recyclability) || "N/A";
        const certificateStatus = extractString(data.certificateStatus) || "N/A";

        // Transform API response to ComponentData format
        // Spread original data first, then override with string values
        const transformedData: ComponentData = {
          ...data,
          id: data.id,
          componentCode,
          componentName,
          lifecycleStage,
          manufacturer,
          location,
          materialType,
          weight,
          recyclability,
          certificateStatus,
        };
        setComponentData(transformedData);
      } else {
        message.error(result.message || "Failed to fetch component data");
        navigate("/components-master");
      }
    } catch (error) {
      console.error("Error fetching component data:", error);
      message.error("Failed to fetch component data");
      navigate("/components-master");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchComponentData();
    }
  }, [id, fetchComponentData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "green";
      case "draft":
        return "orange";
      case "review":
        return "purple";
      case "verified":
        return "green";
      case "uploaded":
        return "orange";
      case "expired":
        return "red";
      case "active":
        return "cyan";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };

  const getProductIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      wrench: Wrench,
      zap: Zap,
      settings: Settings,
      file: FileText,
    };
    const IconComponent = icons[iconName] || FileText;
    return <IconComponent size={16} />;
  };

  const getActionIcon = (iconName: string, color: string) => {
    const icons: { [key: string]: any } = {
      check: CheckCircle,
      edit: Edit,
      plus: Plus,
    };
    const IconComponent = icons[iconName] || FileText;
    const colorMap: { [key: string]: string } = {
      blue: "#3b82f6",
      green: "#10b981",
      orange: "#f97316",
      purple: "#a855f7",
    };
    return <IconComponent size={16} style={{ color: colorMap[color] || "#666" }} />;
  };

  const getTimelineDotStyle = (color: string) => {
    const colorMap: { [key: string]: { bg: string; border: string } } = {
      blue: { bg: "#dbeafe", border: "#3b82f6" },
      green: { bg: "#d1fae5", border: "#10b981" },
      orange: { bg: "#fed7aa", border: "#f97316" },
      purple: { bg: "#e9d5ff", border: "#a855f7" },
    };
    const colors = colorMap[color] || { bg: "#f3f4f6", border: "#666" };
    return {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: colors.bg,
      border: `2px solid ${colors.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  };

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div>
      {/* Component Details */}
      <Card className="mb-6">
        <Title level={4} className="mb-4">
          Components Details
        </Title>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text type="secondary">Component Code</Text>
              <div className="text-lg font-semibold">{componentData?.componentCode}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text type="secondary">Component Name</Text>
              <div className="text-lg font-semibold text-green-600">
                {componentData?.componentName}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text type="secondary">Lifecycle Stage</Text>
              <div className="text-lg font-semibold">{componentData?.lifecycleStage}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text type="secondary">Manufacturer</Text>
              <div className="text-lg font-semibold">{componentData?.manufacturer}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text type="secondary">Location</Text>
              <div className="text-lg font-semibold">{componentData?.location}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text type="secondary">Material Type</Text>
              <div className="text-lg font-semibold">{componentData?.materialType}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text type="secondary">Weight / Quantity</Text>
              <div className="text-lg font-semibold">{componentData?.weight}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text type="secondary">Recyclability</Text>
              <div className="text-lg font-semibold">{componentData?.recyclability}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text type="secondary">Certificate Status</Text>
              <div className="text-lg font-semibold text-green-600">
                {componentData?.certificateStatus}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Component Used In */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="mb-0">
            Component Used In
          </Title>
          <Space>
            <Input
              placeholder="Search here..."
              prefix={<Search size={16} />}
              className="w-64"
            />
            <Button type="text" icon={<MoreHorizontal size={16} />} />
          </Space>
        </div>
        <Table
          columns={[
            {
              title: "PCF Request Number",
              dataIndex: "pcfRequestNumber",
              key: "pcfRequestNumber",
            },
            {
              title: "Product Name",
              dataIndex: "productName",
              key: "productName",
              render: (text: string, record: PCFUsage) => (
                <Space>
                  {getProductIcon(record.productIcon)}
                  {text}
                </Space>
              ),
            },
            {
              title: "Quantity Units",
              dataIndex: "quantityUnits",
              key: "quantityUnits",
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
              ),
            },
          ]}
          dataSource={mockPCFUsage}
          rowKey="pcfRequestNumber"
          pagination={{
            current: 1,
            pageSize: 7,
            total: 24,
            showTotal: (total, range) =>
              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          }}
        />
      </Card>
    </div>
  );

  // PCF Data Tab Content
  const renderPCFDataTab = () => (
    <div>
      <Row gutter={16} className="mb-6">
        {/* PCF Available Card */}
        <Col xs={24} md={8}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Title level={5} className="mb-0">
                PCF Available
              </Title>
              <Tag color="green">Verified</Tag>
            </div>
            <Statistic
              value={3.45e-4}
              suffix="kgCO₂e"
              valueStyle={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
            />
            <Divider className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text type="secondary">Last updated:</Text>
                <Text>15 Jul 2025</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Declared Unit:</Text>
                <Text>Per Component</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Standard:</Text>
                <Text>ISO 14067</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Emission Stage:</Text>
                <Text>Cradle-to-Gate</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Verification Info Card */}
        <Col xs={24} md={8}>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <Title level={5} className="mb-0">
                Verification Info
              </Title>
            </div>
            <div className="space-y-3">
              <div>
                <Text type="secondary">Certification:</Text>
                <div>
                  <Tag color="green">Verified</Tag>
                </div>
              </div>
              <div>
                <Text type="secondary">Last Updated:</Text>
                <div className="font-semibold">15 Aug 2025</div>
              </div>
              <div>
                <Text type="secondary">Data Quality:</Text>
                <div className="font-semibold">High</div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Quick Actions Card */}
        <Col xs={24} md={8}>
          <Card>
            <Title level={5} className="mb-4">
              Quick Actions
            </Title>
            <Space direction="vertical" className="w-full">
              <Button
                type="primary"
                icon={<Download size={16} />}
                block
                className="bg-green-500 hover:bg-green-600"
              >
                Export PCF Report
              </Button>
              <Button
                type="primary"
                icon={<Plus size={16} />}
                block
                className="bg-green-500 hover:bg-green-600"
              >
                + Request Component PCF
              </Button>
              <Button
                icon={<Eye size={16} />}
                block
              >
                View Full PCF Details
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Lifecycle Breakdown */}
      <Card>
        <Title level={4} className="mb-4">
          Lifecycle Breakdown
        </Title>
        <Table
          columns={[
            {
              title: "Stage",
              dataIndex: "stage",
              key: "stage",
            },
            {
              title: "PCF Value",
              dataIndex: "pcfValue",
              key: "pcfValue",
            },
            {
              title: "Percentage",
              dataIndex: "percentage",
              key: "percentage",
            },
          ]}
          dataSource={[
            ...mockLifecycleBreakdown,
            {
              stage: "Total",
              pcfValue: "3.45e-4 kgCO₂e",
              percentage: "100%",
            },
          ]}
          rowKey="stage"
          pagination={false}
          rowClassName={(record, index) =>
            index === mockLifecycleBreakdown.length
              ? "bg-green-500 text-white font-semibold"
              : ""
          }
        />
      </Card>
    </div>
  );

  // Certificates Tab Content
  const renderCertificatesTab = () => (
    <div>
      {/* Current Certificate */}
      <Card className="mb-6">
        <Title level={4} className="mb-4">
          Certificates
        </Title>
        <Card className="bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Puzzle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <Title level={5} className="mb-2">
                  {mockCertificate.name}
                </Title>
                <Space>
                  <Tag color="green">{mockCertificate.status}</Tag>
                  <Text type="secondary">•</Text>
                  <Text type="secondary">Uploaded on {mockCertificate.uploadedDate}</Text>
                </Space>
              </div>
            </div>
            <Space>
              <Button type="text" icon={<Eye size={16} />} />
              <Button type="text" icon={<Download size={16} />} />
            </Space>
          </div>
          <Divider className="my-4" />
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <div className="space-y-3">
                <div>
                  <Text type="secondary">File Name:</Text>
                  <div className="font-semibold">{mockCertificate.fileName}</div>
                </div>
                <div>
                  <Text type="secondary">Issue Date:</Text>
                  <div className="font-semibold">{mockCertificate.issueDate}</div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="space-y-3">
                <div>
                  <Text type="secondary">Verified By:</Text>
                  <div className="font-semibold">{mockCertificate.verifiedBy}</div>
                </div>
                <div>
                  <Text type="secondary">Expiry Date:</Text>
                  <div className="font-semibold">{mockCertificate.expiryDate}</div>
                </div>
                <div>
                  <Text type="secondary">File Size:</Text>
                  <div className="font-semibold">{mockCertificate.fileSize}</div>
                </div>
                <div>
                  <Text type="secondary">Days Until Expiry:</Text>
                  <div className="font-semibold text-green-600">
                    {mockCertificate.daysUntilExpiry}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Card>

      {/* Certificate History */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="mb-0">
            Certificate History
          </Title>
          <Button
            type="primary"
            icon={<Share2 size={16} />}
            className="bg-green-500 hover:bg-green-600"
          >
            Share Certificate
          </Button>
        </div>
        <Table
          columns={[
            {
              title: "Date",
              dataIndex: "date",
              key: "date",
            },
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              render: (action: string) => (
                <Tag color={getStatusColor(action)}>{action}</Tag>
              ),
            },
            {
              title: "File Name",
              dataIndex: "fileName",
              key: "fileName",
            },
            {
              title: "User",
              dataIndex: "user",
              key: "user",
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
              ),
            },
          ]}
          dataSource={mockCertificateHistory}
          rowKey="date"
          pagination={false}
        />
      </Card>
    </div>
  );

  // History Tab Content
  const renderHistoryTab = () => (
    <div>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <Title level={4} className="mb-0">
            Component History
          </Title>
          <Button
            type="primary"
            icon={<Download size={16} />}
            className="bg-green-500 hover:bg-green-600"
          >
            Export History
          </Button>
        </div>

        {/* Filters */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Select placeholder="Filter by Action" className="w-full" defaultValue="all">
              <Option value="all">All Actions</Option>
              <Option value="created">Created</Option>
              <Option value="updated">Updated</Option>
              <Option value="certificate">Certificate</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select placeholder="Date Range" className="w-full" defaultValue="all">
              <Option value="all">All Time</Option>
              <Option value="week">Last Week</Option>
              <Option value="month">Last Month</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select placeholder="User" className="w-full" defaultValue="all">
              <Option value="all">All Users</Option>
              <Option value="admin">Admin User</Option>
              <Option value="qa">QA Manager</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search by keyword..."
              prefix={<Search size={16} />}
            />
          </Col>
        </Row>

        {/* Timeline */}
        <Timeline
          items={mockHistory.map((entry) => ({
            dot: (
              <div style={getTimelineDotStyle(entry.color)}>
                {getActionIcon(entry.icon, entry.color)}
              </div>
            ),
            children: (
              <div className="pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Text strong>{entry.user}</Text>
                      <Tag color={entry.color}>{entry.action}</Tag>
                    </div>
                    <Text type="secondary">{entry.description}</Text>
                  </div>
                  <Text type="secondary" className="text-sm">
                    {entry.date}
                  </Text>
                </div>
              </div>
            ),
          }))}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <Text type="secondary">Showing 1 to 7 of 24 entries</Text>
          <Space>
            <Button icon={<ArrowLeft size={16} />} />
            <Button type="primary" className="bg-green-500">
              1
            </Button>
            <Button>2</Button>
            <Button>3</Button>
            <Button icon={<ChevronRight size={16} />} />
          </Space>
        </div>
      </Card>
    </div>
  );

  if (loading || !componentData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/components-master")}
          />
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Puzzle className="w-6 h-6 text-white" />
          </div>
          <div>
            <Title level={2} className="!mb-0">
              Components Master
            </Title>
            <Text type="secondary">
              Streamlined tracking and administration for all component details
            </Text>
          </div>
        </div>
        <Space>
          <Button icon={<Edit size={16} />}>Edit</Button>
          <Button danger icon={<Trash2 size={16} />}>
            Delete
          </Button>
          <Button
            type="primary"
            icon={<Upload size={16} />}
            className="bg-green-500 hover:bg-green-600"
          >
            Upload
          </Button>
        </Space>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "overview",
            label: "Overview",
            children: renderOverviewTab(),
          },
          {
            key: "pcf-data",
            label: "PCF Data",
            children: renderPCFDataTab(),
          },
          {
            key: "certificates",
            label: "Certificates",
            children: renderCertificatesTab(),
          },
          {
            key: "history",
            label: "History",
            children: renderHistoryTab(),
          },
        ]}
        className="components-master-tabs"
        style={{
          marginTop: "24px",
        }}
      />
    </div>
  );
};

export default ComponentsMasterView;
