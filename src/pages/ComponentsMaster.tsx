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
  Tabs,
  Empty,
} from "antd";
import {
  Puzzle,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Search,
  Download,
  FileText,
  Shield,
} from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import componentMasterService, { type ComponentItem } from "../lib/componentMasterService";

// Helper function to safely format numbers
const formatNumber = (val: any, decimals: number = 2, fallback: string = "0.00"): string => {
  if (val === null || val === undefined || val === "") return fallback;
  const num = typeof val === "number" ? val : parseFloat(val);
  if (isNaN(num)) return fallback;
  return num.toFixed(decimals);
};

// Flattened BOM row type for the overview table
interface FlattenedBOMRow {
  key: string;
  pcf_request_number: string;
  pcf_sub_date_time: string;
  product_category: string;
  product_code: string;
  product_name: string;
  pcf_id: string;
  status: string;
  material_number: string;
  component_name: string;
  component_category: string;
  detailed_description: string;
  manufacturer: string;
  production_location: string;
  transport_mode: string;
  quantity: number;
  weight_gms: number;
  total_weight_gms: number;
  price: number;
  total_price: number;
  economic_ratio: number;
  split_allocation: boolean;
  sys_expansion_allocation: boolean;
  check_er_less_than_five: string;
  phy_mass_allocation: string;
  econ_allocation: string;
  packaging_type: string;
  pack_weight_kg: number;
  emission_factor_box_kg: number;
  material_emission_total: number;
  distance_km: number;
  logistic_emission: number;
  production_emission: number;
  waste_emission: number;
  total_pcf_value: number;
}

// PCF Data aggregated type
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

const ComponentsMaster: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [flattenedData, setFlattenedData] = useState<FlattenedBOMRow[]>([]);
  const [pcfSummary, setPcfSummary] = useState<PCFDataSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<[string | null, string | null] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");

  // Flatten the component data to show each BOM item as a row
  const flattenComponentData = (components: ComponentItem[]): FlattenedBOMRow[] => {
    const flattened: FlattenedBOMRow[] = [];

    components.forEach((comp) => {
      const bomDetails = comp.bom_details || [];

      if (bomDetails.length === 0) {
        flattened.push({
          key: comp.id,
          pcf_request_number: comp.code || "N/A",
          pcf_sub_date_time: comp.created_date || "",
          product_category: comp.product_category?.name || "N/A",
          product_code: comp.product_code || "N/A",
          product_name: comp.request_title || "N/A",
          pcf_id: comp.id,
          status: comp.status || "draft",
          material_number: "N/A",
          component_name: "N/A",
          component_category: "N/A",
          detailed_description: "N/A",
          manufacturer: "N/A",
          production_location: "N/A",
          transport_mode: "N/A",
          quantity: 0,
          weight_gms: 0,
          total_weight_gms: 0,
          price: 0,
          total_price: 0,
          economic_ratio: 0,
          split_allocation: false,
          sys_expansion_allocation: false,
          check_er_less_than_five: "N/A",
          phy_mass_allocation: "N/A",
          econ_allocation: "N/A",
          packaging_type: "N/A",
          pack_weight_kg: 0,
          emission_factor_box_kg: 0,
          material_emission_total: 0,
          distance_km: 0,
          logistic_emission: 0,
          production_emission: 0,
          waste_emission: 0,
          total_pcf_value: 0,
        });
      } else {
        bomDetails.forEach((bom: any, index: number) => {
          const allocationMethod = bom.allocation_methodology || {};
          const packaging = bom.packaging_emission_calculation || {};
          const logistic = bom.logistic_emission_calculation || {};
          const pcfTotal = bom.pcf_total_emission_calculation || {};

          let materialEmissionTotal = 0;
          if (bom.material_emission && Array.isArray(bom.material_emission)) {
            materialEmissionTotal = bom.material_emission.reduce(
              (sum: number, m: any) => sum + (m.material_emission || 0),
              0
            );
          }

          flattened.push({
            key: `${comp.id}-${bom.id || index}`,
            pcf_request_number: comp.code || "N/A",
            pcf_sub_date_time: comp.created_date || "",
            product_category: comp.product_category?.name || "N/A",
            product_code: comp.product_code || "N/A",
            product_name: comp.request_title || "N/A",
            pcf_id: comp.id,
            status: comp.status || "draft",
            material_number: bom.material_number || "N/A",
            component_name: bom.component_name || "N/A",
            component_category: bom.component_category || "N/A",
            detailed_description: bom.detail_description || "N/A",
            manufacturer: bom.manufacturer || "N/A",
            production_location: bom.production_location || "N/A",
            transport_mode: logistic.mode_of_transport || "N/A",
            quantity: bom.quantity || 0,
            weight_gms: bom.weight_gms || 0,
            total_weight_gms: bom.total_weight_gms || 0,
            price: bom.price || 0,
            total_price: bom.total_price || 0,
            economic_ratio: bom.economic_ratio || 0,
            split_allocation: allocationMethod.split_allocation || false,
            sys_expansion_allocation: allocationMethod.sys_expansion_allocation || false,
            check_er_less_than_five: allocationMethod.check_er_less_than_five || "N/A",
            phy_mass_allocation: allocationMethod.phy_mass_allocation_er_less_than_five || "N/A",
            econ_allocation: allocationMethod.econ_allocation_er_greater_than_five || "N/A",
            packaging_type: packaging.packaging_type || "N/A",
            pack_weight_kg: packaging.pack_weight_kg || 0,
            emission_factor_box_kg: packaging.emission_factor_box_kg || 0,
            material_emission_total: materialEmissionTotal,
            distance_km: logistic.distance_km || 0,
            logistic_emission: logistic.leg_wise_transport_emissions_per_unit_kg_co2e || 0,
            production_emission: pcfTotal.production_value || 0,
            waste_emission: pcfTotal.waste_value || 0,
            total_pcf_value: pcfTotal.total_pcf_value || 0,
          });
        });
      }
    });

    return flattened;
  };

  // Calculate PCF summary from components
  const calculatePCFSummary = (components: ComponentItem[]): PCFDataSummary | null => {
    let total_pcf = 0;
    let material_value = 0;
    let production_value = 0;
    let logistic_value = 0;
    let waste_value = 0;
    let packaging_value = 0;
    let last_updated = "";
    let status = "draft";

    components.forEach((comp) => {
      if (comp.update_date && comp.update_date > last_updated) {
        last_updated = comp.update_date;
      }
      if (comp.status === "Approved") {
        status = "Approved";
      }

      comp.bom_details?.forEach((bom: any) => {
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
    });

    if (total_pcf === 0) return null;

    return {
      total_pcf,
      material_value,
      production_value,
      logistic_value,
      waste_value,
      packaging_value,
      last_updated,
      status,
    };
  };

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
        setFlattenedData(flattenComponentData(data.data));
        setPcfSummary(calculatePCFSummary(data.data));
        setTotalCount(data.totalCount || data.data.length || 0);
        setTotalPages(Math.ceil((data.totalCount || data.data.length || 0) / pageSize));
      } else {
        message.error(result.message || "Failed to fetch components");
        setComponents([]);
        setFlattenedData([]);
        setPcfSummary(null);
      }
    } catch (error) {
      console.error("Error fetching components:", error);
      message.error("Failed to fetch components");
      setComponents([]);
      setFlattenedData([]);
      setPcfSummary(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, dateRange, statusFilter]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return "N/A";
    }
  };

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

  // Overview columns
  const overviewColumns: ColumnsType<FlattenedBOMRow> = [
    {
      title: "PCF Request Number",
      dataIndex: "pcf_request_number",
      key: "pcf_request_number",
      width: 150,
      fixed: "left",
      render: (text: string, record: FlattenedBOMRow) => (
        <Button
          type="link"
          onClick={() => navigate(`/components-master/view/${record.pcf_id}`)}
          className="p-0 font-semibold"
        >
          {text}
        </Button>
      ),
    },
    {
      title: "PCF Sub Date & Time",
      dataIndex: "pcf_sub_date_time",
      key: "pcf_sub_date_time",
      width: 150,
      render: (text: string) => formatDate(text),
    },
    { title: "Product Category", dataIndex: "product_category", key: "product_category", width: 140 },
    { title: "Product Code", dataIndex: "product_code", key: "product_code", width: 120 },
    { title: "Product Name", dataIndex: "product_name", key: "product_name", width: 180 },
    { title: "Material Number/ID", dataIndex: "material_number", key: "material_number", width: 150 },
    { title: "Component Name", dataIndex: "component_name", key: "component_name", width: 140 },
    { title: "Component Category", dataIndex: "component_category", key: "component_category", width: 150 },
    { title: "Detailed Descrip", dataIndex: "detailed_description", key: "detailed_description", width: 200, ellipsis: true },
    { title: "Manufacturer", dataIndex: "manufacturer", key: "manufacturer", width: 150 },
    { title: "Production Loc", dataIndex: "production_location", key: "production_location", width: 130 },
    { title: "Transport Mode", dataIndex: "transport_mode", key: "transport_mode", width: 180 },
    { title: "Quantity", dataIndex: "quantity", key: "quantity", width: 90, align: "right" },
    { title: "Weight (gms)", dataIndex: "weight_gms", key: "weight_gms", width: 120, align: "right", render: (val: any) => formatNumber(val, 2) },
    { title: "Total Weight (gms)", dataIndex: "total_weight_gms", key: "total_weight_gms", width: 150, align: "right", render: (val: any) => formatNumber(val, 2) },
    { title: "Price (unit)", dataIndex: "price", key: "price", width: 110, align: "right", render: (val: any) => formatNumber(val, 2) },
    { title: "Total Price", dataIndex: "total_price", key: "total_price", width: 110, align: "right", render: (val: any) => formatNumber(val, 2) },
    { title: "Economic Ratio", dataIndex: "economic_ratio", key: "economic_ratio", width: 130, align: "right" },
    { title: "Physical Allocation", dataIndex: "phy_mass_allocation", key: "phy_mass_allocation", width: 150 },
    { title: "Split Allocation", dataIndex: "split_allocation", key: "split_allocation", width: 130, render: (val: boolean) => val ? "Yes" : "No" },
    { title: "Sys Exp Allocation", dataIndex: "sys_expansion_allocation", key: "sys_expansion_allocation", width: 150, render: (val: boolean) => val ? "Yes" : "No" },
    { title: "Check ER", dataIndex: "check_er_less_than_five", key: "check_er_less_than_five", width: 100 },
    { title: "Econ Allocation", dataIndex: "econ_allocation", key: "econ_allocation", width: 140 },
    { title: "Packaging Type", dataIndex: "packaging_type", key: "packaging_type", width: 130 },
    { title: "Pack Weight (kg)", dataIndex: "pack_weight_kg", key: "pack_weight_kg", width: 140, align: "right", render: (val: any) => formatNumber(val, 3, "0.000") },
    { title: "Material Emission (kg CO2e)", dataIndex: "material_emission_total", key: "material_emission_total", width: 180, align: "right", render: (val: any) => formatNumber(val, 6, "0.000000") },
    { title: "Logistic Emission (kg CO2e)", dataIndex: "logistic_emission", key: "logistic_emission", width: 180, align: "right", render: (val: any) => formatNumber(val, 6, "0.000000") },
    { title: "Production Emission", dataIndex: "production_emission", key: "production_emission", width: 160, align: "right", render: (val: any) => formatNumber(val, 6, "0.000000") },
    { title: "Waste Emission", dataIndex: "waste_emission", key: "waste_emission", width: 140, align: "right", render: (val: any) => formatNumber(val, 6, "0.000000") },
    { title: "Total PCF (kg CO2e)", dataIndex: "total_pcf_value", key: "total_pcf_value", width: 160, align: "right", render: (val: any) => formatNumber(val, 6, "0.000000") },
    { title: "Status", dataIndex: "status", key: "status", width: 120, fixed: "right", render: (status: string) => getStatusTag(status) },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_: any, record: FlattenedBOMRow) => (
        <Button
          type="text"
          onClick={() => navigate(`/components-master/view/${record.pcf_id}`)}
          icon={<Eye size={16} />}
        >
          View
        </Button>
      ),
    },
  ];

  // PCF Data Tab Content
  const PCFDataTab = () => {
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

    return (
      <div className="space-y-6">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PCF Available Card */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-600 font-medium">PCF Available</span>
              <Tag color={pcfSummary.status === "Approved" ? "green" : "gold"}>
                {pcfSummary.status === "Approved" ? "Verified" : "Pending"}
              </Tag>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {pcfSummary.total_pcf.toExponential(2)} kgCO<sub>2</sub>e
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Last updated: {formatDate(pcfSummary.last_updated)}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Components:</span>
                <span className="font-medium">{components.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total BOM Items:</span>
                <span className="font-medium">{flattenedData.length}</span>
              </div>
            </div>
          </div>

          {/* Verification Info Card */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-semibold text-gray-900">Verification Info</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status:</span>
                <Tag color={pcfSummary.status === "Approved" ? "green" : "gold"}>
                  {pcfSummary.status === "Approved" ? "Verified" : "Pending"}
                </Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated:</span>
                <span className="font-medium">{formatDate(pcfSummary.last_updated)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Approved Count:</span>
                <span className="font-medium">{statusCounts.approved}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <span className="font-semibold text-gray-900 block mb-4">Quick Actions</span>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                <Download size={16} />
                Export PCF Report
              </button>
              <button
                onClick={() => navigate("/components-master/new")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Plus size={16} />
                Request Component PCF
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <Eye size={16} />
                View Full PCF Details
              </button>
            </div>
          </div>
        </div>

        {/* Lifecycle Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 p-6 pb-4">Lifecycle Breakdown</h3>
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
                    <td className="px-6 py-4 text-gray-700">
                      {item.value.toFixed(5)} kgCO<sub>2</sub>e
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
                <tr className="bg-green-50 font-semibold">
                  <td className="px-6 py-4 text-green-700">Total</td>
                  <td className="px-6 py-4 text-green-700">
                    {pcfSummary.total_pcf.toExponential(2)} kgCO<sub>2</sub>e
                  </td>
                  <td className="px-6 py-4 text-green-700">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Certificates Tab Content
  const CertificatesTab = () => (
    <div className="py-12">
      <Empty
        image={<FileText size={48} className="text-gray-300 mx-auto" />}
        description={
          <div className="text-center">
            <p className="text-gray-500 mb-2">No certificates available</p>
            <p className="text-gray-400 text-sm">Certificates will appear here once PCF data is verified</p>
          </div>
        }
      />
    </div>
  );

  // History Tab Content
  const HistoryTab = () => {
    const historyData = components.map((comp) => ({
      key: comp.id,
      code: comp.code,
      title: comp.request_title,
      status: comp.status,
      created_date: comp.created_date,
      update_date: comp.update_date,
      created_by: comp.createdby?.user_name || "N/A",
    }));

    const historyColumns: ColumnsType<any> = [
      { title: "PCF Code", dataIndex: "code", key: "code", width: 120 },
      { title: "Request Title", dataIndex: "title", key: "title", width: 200 },
      { title: "Status", dataIndex: "status", key: "status", width: 120, render: (status: string) => getStatusTag(status) },
      { title: "Created By", dataIndex: "created_by", key: "created_by", width: 150 },
      { title: "Created Date", dataIndex: "created_date", key: "created_date", width: 150, render: (d: string) => formatDate(d) },
      { title: "Last Updated", dataIndex: "update_date", key: "update_date", width: 150, render: (d: string) => formatDate(d) },
    ];

    return (
      <Table
        columns={historyColumns}
        dataSource={historyData}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
        rowKey="key"
        size="small"
      />
    );
  };

  const tabItems = [
    {
      key: "overview",
      label: "Overview",
      children: (
        <Table
          columns={overviewColumns}
          dataSource={flattenedData}
          pagination={false}
          scroll={{ x: 4000, y: 500 }}
          rowKey="key"
          size="small"
        />
      ),
    },
    {
      key: "pcf",
      label: "PCF Data",
      children: <PCFDataTab />,
    },
    {
      key: "certificates",
      label: "Certificates",
      children: <CertificatesTab />,
    },
    {
      key: "history",
      label: "History",
      children: <HistoryTab />,
    },
  ];

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center flex-wrap gap-6">
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Puzzle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Components Master</h1>
                  <p className="text-gray-500">Streamlined tracking and administration for all component details</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <div className="bg-blue-50 rounded-xl p-4 min-w-[180px] border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 w-11 h-11 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 font-medium">In Progress</div>
                    <div className="text-2xl font-bold text-blue-700">{statusCounts.inProgress}</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 min-w-[180px] border border-green-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 w-11 h-11 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-green-600 font-medium">Approved</div>
                    <div className="text-2xl font-bold text-green-700">{statusCounts.approved}</div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 min-w-[180px] border border-amber-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 w-11 h-11 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-amber-600 font-medium">Draft</div>
                    <div className="text-2xl font-bold text-amber-700">{statusCounts.draft}</div>
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
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
            />
          </Spin>

          {activeTab === "overview" && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-gray-500 text-sm">
                Showing <span className="font-medium text-gray-900">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> to{" "}
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pageNum) => (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentsMaster;
