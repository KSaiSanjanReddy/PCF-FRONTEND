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

// Flattened BOM row type for the overview table
interface FlattenedBOMRow {
  key: string;
  // PCF Info
  pcf_request_number: string;
  pcf_sub_date_time: string;
  product_category: string;
  product_code: string;
  product_name: string;
  pcf_id: string;
  status: string;
  // BOM Info
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
  // Allocation Methodology
  split_allocation: boolean;
  sys_expansion_allocation: boolean;
  check_er_less_than_five: string;
  phy_mass_allocation: string;
  econ_allocation: string;
  // Packaging
  packaging_type: string;
  pack_weight_kg: number;
  emission_factor_box_kg: number;
  // Material Emissions
  material_emission_total: number;
  // Logistic
  distance_km: number;
  logistic_emission: number;
  // Production
  production_emission: number;
  // Waste
  waste_emission: number;
  // Total PCF
  total_pcf_value: number;
}

// Helper function to safely format numbers
const formatNumber = (val: any, decimals: number = 2, fallback: string = "0.00"): string => {
  if (val === null || val === undefined || val === "") return fallback;
  const num = typeof val === "number" ? val : parseFloat(val);
  if (isNaN(num)) return fallback;
  return num.toFixed(decimals);
};

const ComponentsMaster: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [flattenedData, setFlattenedData] = useState<FlattenedBOMRow[]>([]);
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
        // If no BOM details, still show the PCF row
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
          const production = bom.production_emission_calculation || {};
          const waste = bom.waste_emission_calculation || {};
          const pcfTotal = bom.pcf_total_emission_calculation || {};

          // Calculate total material emission
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
        setTotalCount(data.totalCount || data.data.length || 0);
        setTotalPages(Math.ceil((data.totalCount || data.data.length || 0) / pageSize));
      } else {
        message.error(result.message || "Failed to fetch components");
        setComponents([]);
        setFlattenedData([]);
      }
    } catch (error) {
      console.error("Error fetching components:", error);
      message.error("Failed to fetch components");
      setComponents([]);
      setFlattenedData([]);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
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

  // Overview columns matching the image
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
      width: 180,
      render: (text: string) => formatDate(text),
    },
    {
      title: "Product Category",
      dataIndex: "product_category",
      key: "product_category",
      width: 140,
    },
    {
      title: "Product Code",
      dataIndex: "product_code",
      key: "product_code",
      width: 120,
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      width: 180,
    },
    {
      title: "Material Number/ID",
      dataIndex: "material_number",
      key: "material_number",
      width: 150,
    },
    {
      title: "Component Name",
      dataIndex: "component_name",
      key: "component_name",
      width: 140,
    },
    {
      title: "Component Category",
      dataIndex: "component_category",
      key: "component_category",
      width: 150,
    },
    {
      title: "Detailed Descrip",
      dataIndex: "detailed_description",
      key: "detailed_description",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Manufacturer",
      dataIndex: "manufacturer",
      key: "manufacturer",
      width: 150,
    },
    {
      title: "Production Loc",
      dataIndex: "production_location",
      key: "production_location",
      width: 130,
    },
    {
      title: "Transport Mode",
      dataIndex: "transport_mode",
      key: "transport_mode",
      width: 180,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 90,
      align: "right",
    },
    {
      title: "Weight (gms)",
      dataIndex: "weight_gms",
      key: "weight_gms",
      width: 120,
      align: "right",
      render: (val: any) => formatNumber(val, 2),
    },
    {
      title: "Total Weight (gms)",
      dataIndex: "total_weight_gms",
      key: "total_weight_gms",
      width: 150,
      align: "right",
      render: (val: any) => formatNumber(val, 2),
    },
    {
      title: "Price (unit)",
      dataIndex: "price",
      key: "price",
      width: 110,
      align: "right",
      render: (val: any) => formatNumber(val, 2),
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      width: 110,
      align: "right",
      render: (val: any) => formatNumber(val, 2),
    },
    {
      title: "Economic Ratio",
      dataIndex: "economic_ratio",
      key: "economic_ratio",
      width: 130,
      align: "right",
    },
    {
      title: "Physical Allocation",
      dataIndex: "phy_mass_allocation",
      key: "phy_mass_allocation",
      width: 150,
    },
    {
      title: "Split Allocation",
      dataIndex: "split_allocation",
      key: "split_allocation",
      width: 130,
      render: (val: boolean) => val ? "Yes" : "No",
    },
    {
      title: "Sys Exp Allocation",
      dataIndex: "sys_expansion_allocation",
      key: "sys_expansion_allocation",
      width: 150,
      render: (val: boolean) => val ? "Yes" : "No",
    },
    {
      title: "Check ER",
      dataIndex: "check_er_less_than_five",
      key: "check_er_less_than_five",
      width: 100,
    },
    {
      title: "Econ Allocation",
      dataIndex: "econ_allocation",
      key: "econ_allocation",
      width: 140,
    },
    {
      title: "Packaging Type",
      dataIndex: "packaging_type",
      key: "packaging_type",
      width: 130,
    },
    {
      title: "Pack Weight (kg)",
      dataIndex: "pack_weight_kg",
      key: "pack_weight_kg",
      width: 140,
      align: "right",
      render: (val: any) => formatNumber(val, 3, "0.000"),
    },
    {
      title: "Material Emission (kg CO2e)",
      dataIndex: "material_emission_total",
      key: "material_emission_total",
      width: 180,
      align: "right",
      render: (val: any) => formatNumber(val, 6, "0.000000"),
    },
    {
      title: "Logistic Emission (kg CO2e)",
      dataIndex: "logistic_emission",
      key: "logistic_emission",
      width: 180,
      align: "right",
      render: (val: any) => formatNumber(val, 6, "0.000000"),
    },
    {
      title: "Production Emission",
      dataIndex: "production_emission",
      key: "production_emission",
      width: 160,
      align: "right",
      render: (val: any) => formatNumber(val, 6, "0.000000"),
    },
    {
      title: "Waste Emission",
      dataIndex: "waste_emission",
      key: "waste_emission",
      width: 140,
      align: "right",
      render: (val: any) => formatNumber(val, 6, "0.000000"),
    },
    {
      title: "Total PCF (kg CO2e)",
      dataIndex: "total_pcf_value",
      key: "total_pcf_value",
      width: 160,
      align: "right",
      render: (val: any) => formatNumber(val, 6, "0.000000"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      fixed: "right",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_: any, record: FlattenedBOMRow) => (
        <Button
          type="text"
          onClick={() => navigate(`/components-master/view/${record.pcf_id}`)}
          icon={<Eye size={16} className="flex items-center justify-center mt-[5px]" />}
        >
          View
        </Button>
      ),
    },
  ];

  // Material Emissions tab columns
  const materialEmissionColumns: ColumnsType<any> = [
    { title: "PCF Code", dataIndex: "code", key: "code", width: 120 },
    { title: "Component Name", dataIndex: "component_name", key: "component_name", width: 150 },
    { title: "Material Type", dataIndex: "material_type", key: "material_type", width: 140 },
    { title: "Composition (%)", dataIndex: "material_composition", key: "material_composition", width: 130, align: "right" },
    { title: "Composition Weight (kg)", dataIndex: "material_composition_weight", key: "material_composition_weight", width: 180, align: "right", render: (v: any) => formatNumber(v, 6, "0") },
    { title: "Emission Factor", dataIndex: "material_emission_factor", key: "material_emission_factor", width: 140, align: "right" },
    { title: "Material Emission (kg CO2e)", dataIndex: "material_emission", key: "material_emission", width: 180, align: "right", render: (v: any) => formatNumber(v, 6, "0") },
  ];

  // Production tab columns
  const productionColumns: ColumnsType<any> = [
    { title: "PCF Code", dataIndex: "code", key: "code", width: 120 },
    { title: "Component Name", dataIndex: "component_name", key: "component_name", width: 150 },
    { title: "Component Weight (kg)", dataIndex: "component_weight_kg", key: "component_weight_kg", width: 160, align: "right" },
    { title: "Allocation Method", dataIndex: "allocation_methodology", key: "allocation_methodology", width: 200 },
    { title: "Total Energy (kWh)", dataIndex: "total_energy_consumed_at_factory_level_kwh", key: "total_energy", width: 150, align: "right" },
    { title: "Electricity Factor", dataIndex: "emission_factor_of_electricity", key: "electricity_factor", width: 140, align: "right" },
    { title: "Products Produced", dataIndex: "no_of_products_current_component_produced", key: "products_produced", width: 150, align: "right" },
  ];

  // Logistics tab columns
  const logisticsColumns: ColumnsType<any> = [
    { title: "PCF Code", dataIndex: "code", key: "code", width: 120 },
    { title: "Component Name", dataIndex: "component_name", key: "component_name", width: 150 },
    { title: "Distance (km)", dataIndex: "distance_km", key: "distance_km", width: 120, align: "right" },
    { title: "Mode of Transport", dataIndex: "mode_of_transport", key: "mode_of_transport", width: 200 },
    { title: "Mass Transported (kg)", dataIndex: "mass_transported_kg", key: "mass_transported_kg", width: 160, align: "right" },
    { title: "Emission Factor", dataIndex: "transport_mode_emission_factor_value_kg_co2e_t_km", key: "emission_factor", width: 140, align: "right" },
    { title: "Transport Emission (kg CO2e)", dataIndex: "leg_wise_transport_emissions_per_unit_kg_co2e", key: "transport_emission", width: 200, align: "right", render: (v: any) => formatNumber(v, 6, "0") },
  ];

  // Packaging tab columns
  const packagingColumns: ColumnsType<any> = [
    { title: "PCF Code", dataIndex: "code", key: "code", width: 120 },
    { title: "Component Name", dataIndex: "component_name", key: "component_name", width: 150 },
    { title: "Packaging Type", dataIndex: "packaging_type", key: "packaging_type", width: 140 },
    { title: "Pack Weight (kg)", dataIndex: "pack_weight_kg", key: "pack_weight_kg", width: 140, align: "right" },
    { title: "Emission Factor Box (kg)", dataIndex: "emission_factor_box_kg", key: "emission_factor_box_kg", width: 170, align: "right" },
  ];

  // Extract data for specific tabs
  const getMaterialEmissionData = () => {
    const data: any[] = [];
    components.forEach((comp) => {
      comp.bom_details?.forEach((bom: any) => {
        bom.material_emission?.forEach((me: any) => {
          data.push({
            key: me.id,
            code: comp.code,
            component_name: bom.component_name,
            ...me,
          });
        });
      });
    });
    return data;
  };

  const getProductionData = () => {
    const data: any[] = [];
    components.forEach((comp) => {
      comp.bom_details?.forEach((bom: any) => {
        if (bom.production_emission_calculation) {
          data.push({
            key: `${comp.id}-${bom.id}`,
            code: comp.code,
            component_name: bom.component_name,
            ...bom.production_emission_calculation,
          });
        }
      });
    });
    return data;
  };

  const getLogisticsData = () => {
    const data: any[] = [];
    components.forEach((comp) => {
      comp.bom_details?.forEach((bom: any) => {
        if (bom.logistic_emission_calculation) {
          data.push({
            key: `${comp.id}-${bom.id}`,
            code: comp.code,
            component_name: bom.component_name,
            ...bom.logistic_emission_calculation,
          });
        }
      });
    });
    return data;
  };

  const getPackagingData = () => {
    const data: any[] = [];
    components.forEach((comp) => {
      comp.bom_details?.forEach((bom: any) => {
        if (bom.packaging_emission_calculation) {
          data.push({
            key: `${comp.id}-${bom.id}`,
            code: comp.code,
            component_name: bom.component_name,
            ...bom.packaging_emission_calculation,
          });
        }
      });
    });
    return data;
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
          className="rounded-xl overflow-hidden"
          size="small"
        />
      ),
    },
    {
      key: "material",
      label: "Material Emissions",
      children: (
        <Table
          columns={materialEmissionColumns}
          dataSource={getMaterialEmissionData()}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
          rowKey="key"
          className="rounded-xl overflow-hidden"
          size="small"
        />
      ),
    },
    {
      key: "production",
      label: "Production",
      children: (
        <Table
          columns={productionColumns}
          dataSource={getProductionData()}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          rowKey="key"
          className="rounded-xl overflow-hidden"
          size="small"
        />
      ),
    },
    {
      key: "logistics",
      label: "Logistics",
      children: (
        <Table
          columns={logisticsColumns}
          dataSource={getLogisticsData()}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1100 }}
          rowKey="key"
          className="rounded-xl overflow-hidden"
          size="small"
        />
      ),
    },
    {
      key: "packaging",
      label: "Packaging",
      children: (
        <Table
          columns={packagingColumns}
          dataSource={getPackagingData()}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          rowKey="key"
          className="rounded-xl overflow-hidden"
          size="small"
        />
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
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              className="component-master-tabs"
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
