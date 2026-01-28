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
  Divider,
  Timeline,
  message,
  Empty,
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
  FileText,
  ArrowLeft,
  ChevronRight,
  MoreHorizontal,
  Wrench,
  Zap,
  Settings,
} from "lucide-react";
import componentMasterService, { type ComponentItem } from "../lib/componentMasterService";

const { Title, Text } = Typography;
const { Option } = Select;

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
  status?: string;
  update_date?: string;
  created_date?: string;
  bom_details?: any[];
  createdby?: { user_name?: string };
  [key: string]: any;
}

interface PCFDataSummary {
  total_pcf: number;
  material_value: number;
  production_value: number;
  logistic_value: number;
  waste_value: number;
  packaging_value: number;
  last_updated: string;
  status: string;
}

const ComponentsMasterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [componentData, setComponentData] = useState<ComponentData | null>(null);
  const [pcfSummary, setPcfSummary] = useState<PCFDataSummary | null>(null);

  // Calculate PCF summary from component data
  const calculatePCFSummary = (data: ComponentData): PCFDataSummary | null => {
    let total_pcf = 0;
    let material_value = 0;
    let production_value = 0;
    let logistic_value = 0;
    let waste_value = 0;
    let packaging_value = 0;

    data.bom_details?.forEach((bom: any) => {
      const pcfTotal = bom.pcf_total_emission_calculation;
      if (pcfTotal) {
        total_pcf += pcfTotal.total_pcf_value || 0;
        material_value += pcfTotal.material_value || 0;
        production_value += pcfTotal.production_value || 0;
        logistic_value += pcfTotal.logistic_value || 0;
        waste_value += pcfTotal.waste_value || 0;
        packaging_value += pcfTotal.packaging_value || 0;
      }
    });

    if (total_pcf === 0) return null;

    return {
      total_pcf,
      material_value,
      production_value,
      logistic_value,
      waste_value,
      packaging_value,
      last_updated: data.update_date || data.created_date || "",
      status: data.status || "draft",
    };
  };

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
        const extractString = (value: any, fallback: string = "N/A"): string => {
          if (!value) return fallback;
          if (typeof value === "string") return value;
          if (typeof value === "object" && value.name) return value.name;
          return fallback;
        };

        const transformedData: ComponentData = {
          ...data,
          id: data.id,
          componentCode: data.code || data.componentCode || "N/A",
          componentName: extractString(data.componentName) || extractString(data.component_category) || extractString(data.request_title) || "N/A",
          lifecycleStage: extractString(data.lifecycleStage) || extractString(data.component_category) || "N/A",
          manufacturer: extractString(data.manufacturer) || "N/A",
          location: extractString(data.location) || extractString((data as any).production_location) || "N/A",
          materialType: extractString(data.materialType) || extractString(data.bom_details?.[0]?.material_type) || "N/A",
          weight: extractString(data.weight) || (data.bom_details?.[0]?.weight_gms ? `${data.bom_details[0].weight_gms} gms` : "N/A"),
          recyclability: extractString(data.recyclability) || "N/A",
          certificateStatus: extractString(data.certificateStatus) || "N/A",
        };
        setComponentData(transformedData);
        setPcfSummary(calculatePCFSummary(transformedData));
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return "N/A";
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "completed" || statusLower === "approved" || statusLower === "verified" || statusLower === "valid") return "green";
    if (statusLower === "draft" || statusLower === "uploaded") return "orange";
    if (statusLower === "review" || statusLower === "pending") return "blue";
    if (statusLower === "expired" || statusLower === "rejected") return "red";
    return "default";
  };

  const getProductIcon = (iconName: string) => {
    const icons: { [key: string]: any } = { wrench: Wrench, zap: Zap, settings: Settings, file: FileText };
    const IconComponent = icons[iconName] || FileText;
    return <IconComponent size={16} />;
  };

  // Overview Tab
  const renderOverviewTab = () => {
    const bomUsage = componentData?.bom_details?.map((bom: any, idx: number) => ({
      key: bom.id || idx,
      pcfRequestNumber: componentData.componentCode,
      productName: bom.component_name || "N/A",
      productIcon: "wrench",
      quantityUnits: `${bom.quantity || 1} Units`,
      status: componentData.status || "Draft",
    })) || [];

    return (
      <div>
        <Card className="mb-6">
          <Title level={4} className="mb-4">Component Details</Title>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Component Code</Text>
              <div className="text-lg font-semibold">{componentData?.componentCode}</div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Component Name</Text>
              <div className="text-lg font-semibold text-green-600">{componentData?.componentName}</div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Lifecycle Stage</Text>
              <div className="text-lg font-semibold">{componentData?.lifecycleStage}</div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Manufacturer</Text>
              <div className="text-lg font-semibold">{componentData?.manufacturer}</div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Location</Text>
              <div className="text-lg font-semibold">{componentData?.location}</div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Material Type</Text>
              <div className="text-lg font-semibold">{componentData?.materialType}</div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Weight / Quantity</Text>
              <div className="text-lg font-semibold">{componentData?.weight}</div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text type="secondary">Status</Text>
              <div><Tag color={getStatusColor(componentData?.status || "")}>{componentData?.status || "Draft"}</Tag></div>
            </Col>
          </Row>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title level={4} className="mb-0">BOM Items</Title>
            <Input placeholder="Search..." prefix={<Search size={16} />} className="w-64" />
          </div>
          {bomUsage.length > 0 ? (
            <Table
              columns={[
                { title: "PCF Code", dataIndex: "pcfRequestNumber", key: "pcfRequestNumber" },
                { title: "Component Name", dataIndex: "productName", key: "productName", render: (text: string, record: any) => <Space>{getProductIcon(record.productIcon)}{text}</Space> },
                { title: "Quantity", dataIndex: "quantityUnits", key: "quantityUnits" },
                { title: "Status", dataIndex: "status", key: "status", render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag> },
              ]}
              dataSource={bomUsage}
              rowKey="key"
              pagination={false}
            />
          ) : (
            <Empty description="No BOM items found" />
          )}
        </Card>
      </div>
    );
  };

  // PCF Data Tab
  const renderPCFDataTab = () => {
    if (!pcfSummary) {
      return (
        <div className="py-12">
          <Empty description="No PCF data available" />
        </div>
      );
    }

    const total = pcfSummary.total_pcf || 1;
    const lifecycleData = [
      { stage: "Raw Material Extraction", value: pcfSummary.material_value, percentage: (pcfSummary.material_value / total) * 100 },
      { stage: "Manufacturing", value: pcfSummary.production_value, percentage: (pcfSummary.production_value / total) * 100 },
      { stage: "Transport", value: pcfSummary.logistic_value, percentage: (pcfSummary.logistic_value / total) * 100 },
      { stage: "Packaging", value: pcfSummary.packaging_value, percentage: (pcfSummary.packaging_value / total) * 100 },
      { stage: "End-of-Life", value: pcfSummary.waste_value, percentage: (pcfSummary.waste_value / total) * 100 },
    ];

    const isVerified = pcfSummary.status?.toLowerCase() === "approved";

    return (
      <div>
        <Row gutter={16} className="mb-6">
          {/* PCF Available Card */}
          <Col xs={24} md={8}>
            <Card className="h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-600 font-medium">PCF Available</span>
                <Tag color={isVerified ? "green" : "gold"}>{isVerified ? "Verified" : "Pending"}</Tag>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {pcfSummary.total_pcf.toExponential(2)} kgCO<sub>2</sub>e
              </div>
              <Divider className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text type="secondary">Last updated:</Text>
                  <Text>{formatDate(pcfSummary.last_updated)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">BOM Items:</Text>
                  <Text>{componentData?.bom_details?.length || 0}</Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Verification Info */}
          <Col xs={24} md={8}>
            <Card className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-semibold text-gray-900">Verification Info</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Text type="secondary">Status:</Text>
                  <Tag color={isVerified ? "green" : "gold"}>{isVerified ? "Verified" : "Pending"}</Tag>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Last Updated:</Text>
                  <Text strong>{formatDate(pcfSummary.last_updated)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Created By:</Text>
                  <Text strong>{componentData?.createdby?.user_name || "N/A"}</Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col xs={24} md={8}>
            <Card className="h-full">
              <span className="font-semibold text-gray-900 block mb-4">Quick Actions</span>
              <Space direction="vertical" className="w-full">
                <Button type="primary" icon={<Download size={16} />} block className="bg-green-500 hover:bg-green-600">
                  Export PCF Report
                </Button>
                <Button icon={<Plus size={16} />} block onClick={() => navigate("/components-master/new")}>
                  Request Component PCF
                </Button>
                <Button icon={<Eye size={16} />} block>
                  View Full PCF Details
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Lifecycle Breakdown */}
        <Card>
          <Title level={4} className="mb-4">Lifecycle Breakdown</Title>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="text-left px-6 py-3 font-medium">Stage</th>
                  <th className="text-left px-6 py-3 font-medium">PCF Value</th>
                  <th className="text-left px-6 py-3 font-medium">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {lifecycleData.map((item, index) => (
                  <tr key={item.stage} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 text-gray-900">{item.stage}</td>
                    <td className="px-6 py-4 text-gray-700">{item.value.toFixed(5)} kgCO<sub>2</sub>e</td>
                    <td className="px-6 py-4 text-gray-700">{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
                <tr className="bg-green-50 font-semibold">
                  <td className="px-6 py-4 text-green-700">Total</td>
                  <td className="px-6 py-4 text-green-700">{pcfSummary.total_pcf.toExponential(2)} kgCO<sub>2</sub>e</td>
                  <td className="px-6 py-4 text-green-700">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // Certificates Tab
  const renderCertificatesTab = () => (
    <div className="py-12">
      <Empty
        image={<FileText size={48} className="text-gray-300 mx-auto" />}
        description={
          <div className="text-center">
            <p className="text-gray-500 mb-2">No certificates available</p>
            <p className="text-gray-400 text-sm">Certificates will appear here once uploaded</p>
          </div>
        }
      >
        <Button type="primary" icon={<Upload size={16} />} className="bg-green-500 hover:bg-green-600">
          Upload Certificate
        </Button>
      </Empty>
    </div>
  );

  // History Tab
  const renderHistoryTab = () => {
    const historyData = [
      { id: "1", user: componentData?.createdby?.user_name || "System", action: "Created", description: "Component created", date: formatDate(componentData?.created_date || ""), color: "green" },
      ...(componentData?.update_date && componentData.update_date !== componentData.created_date ? [
        { id: "2", user: componentData?.createdby?.user_name || "System", action: "Updated", description: "Component updated", date: formatDate(componentData.update_date), color: "blue" }
      ] : []),
    ];

    return (
      <Card>
        <div className="flex items-center justify-between mb-6">
          <Title level={4} className="mb-0">Component History</Title>
          <Button type="primary" icon={<Download size={16} />} className="bg-green-500 hover:bg-green-600">
            Export History
          </Button>
        </div>

        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8}>
            <Select placeholder="Filter by Action" className="w-full" defaultValue="all">
              <Option value="all">All Actions</Option>
              <Option value="created">Created</Option>
              <Option value="updated">Updated</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select placeholder="Date Range" className="w-full" defaultValue="all">
              <Option value="all">All Time</Option>
              <Option value="week">Last Week</Option>
              <Option value="month">Last Month</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Input placeholder="Search..." prefix={<Search size={16} />} />
          </Col>
        </Row>

        {historyData.length > 0 ? (
          <Timeline
            items={historyData.map((entry) => ({
              dot: <div className={`w-8 h-8 bg-${entry.color}-100 rounded-full flex items-center justify-center`}>
                <CheckCircle size={16} className={`text-${entry.color}-600`} />
              </div>,
              children: (
                <div className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Text strong>{entry.user}</Text>
                        <Tag color={entry.color}>{entry.action}</Tag>
                      </div>
                      <Text type="secondary">{entry.description}</Text>
                    </div>
                    <Text type="secondary" className="text-sm">{entry.date}</Text>
                  </div>
                </div>
              ),
            }))}
          />
        ) : (
          <Empty description="No history available" />
        )}
      </Card>
    );
  };

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
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate("/components-master")} />
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Puzzle className="w-6 h-6 text-white" />
            </div>
            <div>
              <Title level={3} className="!mb-0">{componentData.componentName}</Title>
              <Text type="secondary">Code: {componentData.componentCode}</Text>
            </div>
          </div>
          <Space>
            <Button icon={<Edit size={16} />}>Edit</Button>
            <Button danger icon={<Trash2 size={16} />}>Delete</Button>
            <Button type="primary" icon={<Upload size={16} />} className="bg-green-500 hover:bg-green-600">Upload</Button>
          </Space>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "overview", label: "Overview", children: renderOverviewTab() },
            { key: "pcf-data", label: "PCF Data", children: renderPCFDataTab() },
            { key: "certificates", label: "Certificates", children: renderCertificatesTab() },
            { key: "history", label: "History", children: renderHistoryTab() },
          ]}
        />
      </div>
    </div>
  );
};

export default ComponentsMasterView;
