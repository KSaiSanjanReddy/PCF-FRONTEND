import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  message,
  Empty,
  Image,
  Spin,
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
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Wrench,
  Zap,
  Settings,
  Clock,
  Calendar,
  User,
  AlertTriangle,
  Box,
  Layers,
} from "lucide-react";
import componentMasterService, { type ComponentItem } from "../lib/componentMasterService";
import { documentMasterService } from "../lib/documentMasterService";

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
  const { id: code } = useParams<{ id: string }>(); // Route param is still "id" but contains the PCF code
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bomId = searchParams.get('bomId');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [componentData, setComponentData] = useState<ComponentData | null>(null);
  const [pcfSummary, setPcfSummary] = useState<PCFDataSummary | null>(null);
  const [documentUrls, setDocumentUrls] = useState<{ key: string; url: string; name: string }[]>([]);
  const [imageUrls, setImageUrls] = useState<{ key: string; url: string; name: string }[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

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

  // Fetch document and image URLs
  const fetchDocumentUrls = async (data: ComponentData) => {
    setLoadingDocuments(true);
    try {
      const docs: { key: string; url: string; name: string }[] = [];
      const imgs: { key: string; url: string; name: string }[] = [];

      // Fetch technical specification files
      if (data.technical_specification_file && Array.isArray(data.technical_specification_file)) {
        for (const key of data.technical_specification_file) {
          const result = await documentMasterService.getFileUrl(key);
          if (result.success && result.url) {
            docs.push({
              key,
              url: result.url,
              name: key.split('/').pop() || key,
            });
          }
        }
      }

      // Fetch product images
      if (data.product_images && Array.isArray(data.product_images)) {
        for (const key of data.product_images) {
          const result = await documentMasterService.getFileUrl(key);
          if (result.success && result.url) {
            imgs.push({
              key,
              url: result.url,
              name: key.split('/').pop() || key,
            });
          }
        }
      }

      setDocumentUrls(docs);
      setImageUrls(imgs);
    } catch (error) {
      console.error("Error fetching document URLs:", error);
      message.error("Failed to load documents");
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchComponentData = useCallback(async () => {
    if (!code) {
      message.error("Component code is missing");
      navigate("/components-master");
      return;
    }

    setLoading(true);
    try {
      const result = await componentMasterService.getComponentByCode(code);

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
          componentCode: data.code || "N/A",
          componentName: data.request_title || "N/A",
          lifecycleStage: extractString(data.component_category) || "N/A",
          manufacturer: extractString(data.manufacturer) || "N/A",
          location: data.bom_details?.[0]?.production_location || "N/A",
          materialType: data.bom_details?.[0]?.material_emission?.[0]?.material_type || "N/A",
          weight: data.bom_details?.[0]?.weight_gms ? `${data.bom_details[0].weight_gms} gms` : "N/A",
          recyclability: "N/A",
          certificateStatus: data.status || "N/A",
        };
        setComponentData(transformedData);
        setPcfSummary(calculatePCFSummary(transformedData));
        await fetchDocumentUrls(transformedData);
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
  }, [code, navigate]);

  useEffect(() => {
    if (code) {
      fetchComponentData();
    }
  }, [code, fetchComponentData]);

  useEffect(() => {
    if (bomId) {
      setActiveTab("overview");
    }
  }, [bomId]);

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
      id: bom.id,
      materialNumber: bom.material_number || "N/A",
      componentName: bom.component_name || "N/A",
      componentCategory: bom.component_category || "N/A",
      manufacturer: bom.manufacturer || "N/A",
      weight: bom.weight_gms ? `${bom.weight_gms} gms` : "N/A",
      price: bom.price ? `$${bom.price}` : "N/A",
    })) || [];

    return (
      <div>
        <Title level={4} className="mb-4">BOM Details</Title>
        {bomUsage.length > 0 ? (
          <Table
            columns={[
              { title: "Material Number", dataIndex: "materialNumber", key: "materialNumber", width: 150 },
              { title: "Component Name", dataIndex: "componentName", key: "componentName", width: 200 },
              { title: "Component Category", dataIndex: "componentCategory", key: "componentCategory", width: 150 },
              { title: "Manufacturer", dataIndex: "manufacturer", key: "manufacturer", width: 150 },
              { title: "Weight", dataIndex: "weight", key: "weight", width: 120 },
              { title: "Price", dataIndex: "price", key: "price", width: 100 },
            ]}
            dataSource={bomUsage}
            rowKey="key"
            pagination={false}
            scroll={{ x: 800 }}
            rowClassName={(record: any) => record.id === bomId ? 'bg-green-50 border-l-4 border-green-500' : ''}
          />
        ) : (
          <Empty description="No BOM items found" />
        )}
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
    const isVerified = pcfSummary.status?.toLowerCase() === "approved";

    return (
      <div>
        <Row gutter={16} className="mb-6">
          {/* PCF Available Card */}
          <Col xs={24} md={8}>
            <Card className="h-full border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-600 font-semibold">PCF Available</span>
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
            <Card className="h-full border border-gray-200">
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
            <Card className="h-full border border-gray-200">
              <span className="font-semibold text-gray-900 block mb-4">Quick Actions</span>
              <Space direction="vertical" className="w-full">
                <Button type="primary" icon={<Download size={16} />} block className="shadow-lg shadow-green-600/20">
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

        {/* BOM Items Emission Breakdown */}
        <Card className="border border-gray-200">
          <Title level={4} className="mb-4">Component Emission Breakdown</Title>
          <div className="overflow-x-auto">
            {(() => {
              // Prepare BOM data
              const bomItems = componentData?.bom_details?.map((bom: any, idx: number) => {
                const pcfTotal = bom.pcf_total_emission_calculation || {};
                return {
                  id: bom.id || idx,
                  componentName: bom.component_name || "N/A",
                  materialNumber: bom.material_number || "N/A",
                  materialEmission: pcfTotal.material_value || 0,
                  productionEmission: pcfTotal.production_value || 0,
                  logisticEmission: pcfTotal.logistic_value || 0,
                  packagingEmission: pcfTotal.packaging_value || 0,
                  wasteEmission: pcfTotal.waste_value || 0,
                  totalPcf: pcfTotal.total_pcf_value || 0,
                };
              }) || [];

              // Calculate totals
              const totalMaterial = bomItems.reduce((sum, item) => sum + item.materialEmission, 0);
              const totalProduction = bomItems.reduce((sum, item) => sum + item.productionEmission, 0);
              const totalLogistic = bomItems.reduce((sum, item) => sum + item.logisticEmission, 0);
              const totalPackaging = bomItems.reduce((sum, item) => sum + item.packagingEmission, 0);
              const totalWaste = bomItems.reduce((sum, item) => sum + item.wasteEmission, 0);
              const grandTotal = bomItems.reduce((sum, item) => sum + item.totalPcf, 0);

              // Build columns dynamically
              const columns: any[] = [
                {
                  title: "Emission Category",
                  dataIndex: "category",
                  key: "category",
                  width: 200,
                  fixed: "left",
                  render: (text: string) => <span className="font-medium">{text}</span>,
                },
              ];

              // Add a column for each BOM item
              bomItems.forEach((bom) => {
                columns.push({
                  title: (
                    <div>
                      <div className="font-semibold">{bom.componentName}</div>
                      <div className="text-xs font-normal text-gray-400">{bom.materialNumber}</div>
                    </div>
                  ),
                  dataIndex: bom.id,
                  key: bom.id,
                  width: 150,
                  align: "right" as const,
                  render: (val: number) => val.toFixed(6),
                });
              });

              // Add total column
              columns.push({
                title: "Total",
                dataIndex: "total",
                key: "total",
                width: 150,
                align: "right" as const,
                fixed: "right",
                render: (val: number) => <span className="font-semibold text-green-600">{val.toFixed(6)}</span>,
              });

              // Build rows (transposed)
              const dataSource = [
                {
                  key: "material",
                  category: "Material Emission (kgCO₂e)",
                  ...Object.fromEntries(bomItems.map(bom => [bom.id, bom.materialEmission])),
                  total: totalMaterial,
                },
                {
                  key: "production",
                  category: "Production Emission (kgCO₂e)",
                  ...Object.fromEntries(bomItems.map(bom => [bom.id, bom.productionEmission])),
                  total: totalProduction,
                },
                {
                  key: "logistics",
                  category: "Logistics Emission (kgCO₂e)",
                  ...Object.fromEntries(bomItems.map(bom => [bom.id, bom.logisticEmission])),
                  total: totalLogistic,
                },
                {
                  key: "packaging",
                  category: "Packaging Emission (kgCO₂e)",
                  ...Object.fromEntries(bomItems.map(bom => [bom.id, bom.packagingEmission])),
                  total: totalPackaging,
                },
                {
                  key: "waste",
                  category: "Waste Emission (kgCO₂e)",
                  ...Object.fromEntries(bomItems.map(bom => [bom.id, bom.wasteEmission])),
                  total: totalWaste,
                },
                {
                  key: "total",
                  category: "Total PCF (kgCO₂e)",
                  ...Object.fromEntries(bomItems.map(bom => [bom.id, bom.totalPcf])),
                  total: grandTotal,
                },
              ];

              return (
                <Table
                  columns={columns}
                  dataSource={dataSource}
                  pagination={false}
                  scroll={{ x: Math.max(600, 350 + bomItems.length * 150) }}
                  rowClassName={(record) => record.key === "total" ? "bg-green-50 font-semibold" : ""}
                />
              );
            })()}
          </div>
        </Card>
      </div>
    );
  };

  // Certificates Tab
  const renderCertificatesTab = () => {
    if (loadingDocuments) {
      return (
        <div className="py-12 text-center">
          <div className="text-gray-500">Loading documents...</div>
        </div>
      );
    }

    const hasDocuments = documentUrls.length > 0 || imageUrls.length > 0;

    if (!hasDocuments) {
      return (
        <div className="py-12">
          <Empty
            image={<FileText size={48} className="text-gray-300 mx-auto" />}
            description={
              <div className="text-center">
                <p className="text-gray-500 mb-2">No documents available</p>
                <p className="text-gray-400 text-sm">Documents will appear here once uploaded</p>
              </div>
            }
          />
        </div>
      );
    }

    return (
      <div>
        {/* Technical Specification Files */}
        {documentUrls.length > 0 && (
          <Card className="mb-6 border border-gray-200">
            <Title level={4} className="mb-4">Technical Specification Files</Title>
            <Table
              columns={[
                {
                  title: "File Name",
                  dataIndex: "name",
                  key: "name",
                  render: (text: string) => (
                    <Space>
                      <FileText size={16} className="text-blue-500" />
                      <Text>{text}</Text>
                    </Space>
                  )
                },
                {
                  title: "Actions",
                  key: "actions",
                  width: 200,
                  render: (_: any, record: { key: string; url: string; name: string }) => (
                    <Space>
                      <Button
                        type="link"
                        icon={<Eye size={16} />}
                        onClick={() => window.open(record.url, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        type="link"
                        icon={<Download size={16} />}
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = record.url;
                          link.download = record.name;
                          link.click();
                        }}
                      >
                        Download
                      </Button>
                    </Space>
                  )
                },
              ]}
              dataSource={documentUrls}
              rowKey="key"
              pagination={false}
            />
          </Card>
        )}

        {/* Product Images */}
        {imageUrls.length > 0 && (
          <Card className="border border-gray-200">
            <Title level={4} className="mb-4">Product Images</Title>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageUrls.map((img) => (
                <div key={img.key} className="border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow">
                  <Image
                    src={img.url}
                    alt={img.name}
                    className="w-full h-48 object-cover rounded"
                    preview={{
                      mask: <Eye size={20} />,
                    }}
                  />
                  <div className="mt-2 text-sm text-gray-600 truncate" title={img.name}>
                    {img.name}
                  </div>
                  <Button
                    type="link"
                    size="small"
                    icon={<Download size={14} />}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = img.url;
                      link.download = img.name;
                      link.click();
                    }}
                    className="p-0 mt-1"
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };


  if (loading || !componentData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto bg-gray-50 min-h-screen">
      {/* Back Button */}
      <Button
        type="text"
        icon={<ChevronLeft size={16} />}
        onClick={() => navigate("/components-master")}
        className="mb-4 hover:bg-gray-200"
      >
        Back to Components
      </Button>

      {/* Header Card */}
      <Card className="!mb-6 shadow-sm rounded-xl border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Puzzle size={32} className="text-green-600" />
            </div>
            <div>
              <Title level={3} className="m-0 text-gray-800">
                {componentData.componentName}
              </Title>
              <Text type="secondary" className="text-gray-500">
                {componentData.componentCode}
              </Text>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white px-2 py-2 rounded-lg flex items-center gap-2 border border-green-100">
              <span className="bg-green-50 p-2 rounded-md text-green-600 w-10 h-10 flex items-center justify-center">
                <CheckCircle size={16} className="text-green-600" />
              </span>
              <div>
                <div className="text-xs text-gray-500 font-medium">Status</div>
                <div className="text-sm font-bold text-gray-800">
                  {componentData.status || "Draft"}
                </div>
              </div>
            </div>
            <div className="bg-white px-2 py-2 rounded-lg flex items-center gap-2 border border-blue-100">
              <span className="bg-blue-50 p-2 rounded-md text-blue-600 w-10 h-10 flex items-center justify-center">
                <Layers size={16} className="text-blue-600" />
              </span>
              <div>
                <div className="text-xs text-gray-500 font-medium">BOM Items</div>
                <div className="text-sm font-bold text-gray-800">
                  {componentData.bom_details?.length || 0}
                </div>
              </div>
            </div>
            <div className="bg-white px-2 py-2 rounded-lg flex items-center gap-2 border border-orange-100">
              <span className="bg-orange-50 p-2 rounded-md text-orange-600 w-10 h-10 flex items-center justify-center">
                <AlertTriangle size={16} className="text-orange-600" />
              </span>
              <div>
                <div className="text-xs text-gray-500 font-medium">Priority</div>
                <div className="text-sm font-bold text-gray-800">
                  {componentData.priority || "N/A"}
                </div>
              </div>
            </div>
            <div className="bg-white px-2 py-2 rounded-lg flex items-center gap-2 border border-purple-100">
              <span className="bg-purple-50 p-2 rounded-md text-purple-600 w-10 h-10 flex items-center justify-center">
                <User size={16} className="text-purple-600" />
              </span>
              <div>
                <div className="text-xs text-gray-500 font-medium">Created By</div>
                <div className="text-sm font-bold text-gray-800">
                  {componentData.createdby?.user_name || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-6" />

        <Row gutter={[24, 24]}>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              PCF Code
            </Text>
            <Text className="text-gray-800 font-medium">
              {componentData.componentCode}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Product Code
            </Text>
            <Text className="text-gray-800 font-medium">
              {componentData.product_code || "N/A"}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Due Date
            </Text>
            <Text className="text-gray-800 font-medium">
              {componentData.due_date ? formatDate(componentData.due_date) : "N/A"}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Request Organization
            </Text>
            <Text className="text-gray-800 font-medium">
              {componentData.request_organization || "N/A"}
            </Text>
          </Col>
        </Row>

        <Divider className="my-6" />

        <Row gutter={[24, 24]}>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Product Category
            </Text>
            <Text className="text-gray-800 font-medium">
              {componentData.product_category?.name || "N/A"}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Component Category
            </Text>
            <Text className="text-gray-800 font-medium">
              {componentData.component_category?.name || "N/A"}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Component Type
            </Text>
            <Text className="text-gray-800 font-medium">
              {componentData.component_type?.name || "N/A"}
            </Text>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" className="block text-xs uppercase font-bold mb-1">
              Created Date
            </Text>
            <Text className="text-gray-800 font-medium">
              {componentData.created_date ? formatDate(componentData.created_date) : "N/A"}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Tabs Card */}
      <Card className="shadow-sm rounded-xl border-gray-200">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "overview", label: "Overview", children: renderOverviewTab() },
            { key: "pcf-data", label: "PCF Data", children: renderPCFDataTab() },
            { key: "certificates", label: "Certificates", children: renderCertificatesTab() },
          ]}
        />
      </Card>
    </div>
  );
};

export default ComponentsMasterView;
