import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
  Tabs,
  Card,
  Tag,
  Button,
  Row,
  Col,
  Statistic,
  Divider,
  message,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Typography,
  Collapse,
  Table,
  Progress,
  Avatar,
  Pagination,
  Drawer,
  Menu,
} from "antd";
import type { TableColumnsType, MenuProps } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  LeftOutlined,
  SearchOutlined,
  DownOutlined,
  LinkOutlined,
  BarChartOutlined,
  ShareAltOutlined,
  PlusOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Package, FileText, ArrowLeft, Edit } from "lucide-react";
import productService from "../lib/productService";
import { usePermissions } from "../contexts/PermissionContext";
import type {
  Product,
  LinkedPCF,
  BomPcfDropdownItem,
  BomPcfDetails,
  BomListItem,
  SecondaryDataEntries,
  SecondaryDataBomItem,
} from "../lib/productService";
import ownEmissionService from "../lib/ownEmissionService";
import type {
  OwnEmission,
  OwnEmissionDocument,
  ContactTeamData,
} from "../lib/ownEmissionService";
import dayjs, { type Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProductView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canUpdate, canDelete } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [dataEntryMethod, setDataEntryMethod] = useState<
    "questionnaire" | "contact"
  >("questionnaire");

  // Own Emission Questionnaire state
  const [ownEmissionPcfId, setOwnEmissionPcfId] = useState<string | null>(null);
  const [questionnaireLink, setQuestionnaireLink] = useState<string>("");
  const [ownEmissionClientId, setOwnEmissionClientId] = useState<string>("");
  const [ownEmissionClientName, setOwnEmissionClientName] = useState<string>("");
  const [ownEmissionLinkLoading, setOwnEmissionLinkLoading] = useState(false);

  // Own Emissions state
  const [ownEmissionLoading, setOwnEmissionLoading] = useState(false);
  const [ownEmission, setOwnEmission] = useState<OwnEmission | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<OwnEmissionDocument[]>(
    [],
  );
  const [reportingPeriodFrom, setReportingPeriodFrom] = useState<Dayjs | null>(
    null,
  );
  const [reportingPeriodTo, setReportingPeriodTo] = useState<Dayjs | null>(
    null,
  );
  const [fuelCombustionValue, setFuelCombustionValue] = useState<string>("");
  const [processEmissionValue, setProcessEmissionValue] = useState<string>("");
  const [fugitiveEmissionValue, setFugitiveEmissionValue] =
    useState<string>("");
  const [electricityLocationValue, setElectricityLocationValue] =
    useState<string>("");
  const [electricityMarketValue, setElectricityMarketValue] =
    useState<string>("");
  const [steamHeatCoolingValue, setSteamHeatCoolingValue] =
    useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  // Contact form state
  const [contactFullName, setContactFullName] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");

  // Linked PCFs state
  const [linkedPCFs, setLinkedPCFs] = useState<LinkedPCF[]>([]);
  const [linkedPCFsLoading, setLinkedPCFsLoading] = useState(false);

  // BOM tab state
  const [bomPcfDropdown, setBomPcfDropdown] = useState<BomPcfDropdownItem[]>(
    [],
  );
  const [selectedBomPcfId, setSelectedBomPcfId] = useState<string | null>(null);
  const [bomPcfDetails, setBomPcfDetails] = useState<BomPcfDetails | null>(
    null,
  );
  const [bomLoading, setBomLoading] = useState(false);
  const [bomComponentSearch, setBomComponentSearch] = useState("");
  const [bomCurrentPage, setBomCurrentPage] = useState(1);
  const bomPageSize = 7;

  // PCF tab state
  const [pcfActiveMenu, setPcfActiveMenu] = useState<string>("pcf-overview");
  const [pcfHistoryData, setPcfHistoryData] = useState<BomPcfDetails[]>([]);
  const [pcfHistoryLoading, setPcfHistoryLoading] = useState(false);
  const [pcfHistoryTab, setPcfHistoryTab] = useState<string>("history");
  const [secondaryDataEntries, setSecondaryDataEntries] =
    useState<SecondaryDataEntries | null>(null);
  const [secondaryDataLoading, setSecondaryDataLoading] = useState(false);
  const [secondaryDataSelectedPcf, setSecondaryDataSelectedPcf] = useState<
    string | null
  >(null);
  const [secondaryDataSearch, setSecondaryDataSearch] = useState("");
  const [secondaryDataCurrentPage, setSecondaryDataCurrentPage] = useState(1);
  const [secondaryDataDrawerOpen, setSecondaryDataDrawerOpen] = useState(false);
  const [selectedSecondaryDataItem, setSelectedSecondaryDataItem] =
    useState<SecondaryDataBomItem | null>(null);
  const secondaryDataPageSize = 7;

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      fetchOwnEmission(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await productService.getProductById(productId);
      if (response.status && response.data) {
        setProduct(response.data);
        // Fetch linked PCFs, BOM dropdown, and PCF history using product code
        if (response.data.product_code) {
          fetchLinkedPCFs(response.data.product_code);
          fetchBomPcfDropdown(response.data.product_code);
          fetchPcfHistoryData(response.data.product_code);
        }
      } else {
        message.error("Failed to fetch product details");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      message.error("Error fetching product details");
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnEmission = async (productId: string) => {
    try {
      setOwnEmissionLoading(true);
      const response = await ownEmissionService.getByProductId(productId);
      if (response.status && response.data) {
        const data = response.data;
        setOwnEmission(data);
        setSupportingDocs(data.supporting_documents || []);

        // Populate form fields
        if (data.reporting_period_from) {
          setReportingPeriodFrom(dayjs(data.reporting_period_from));
        }
        if (data.reporting_period_to) {
          setReportingPeriodTo(dayjs(data.reporting_period_to));
        }
        setFuelCombustionValue(data.fuel_combustion_value || "");
        setProcessEmissionValue(data.process_emission_value || "");
        setFugitiveEmissionValue(data.fugitive_emission_value || "");
        setElectricityLocationValue(data.electicity_location_based_value || "");
        setElectricityMarketValue(data.electicity_market_based_value || "");
        setSteamHeatCoolingValue(data.steam_heat_cooling_value || "");
        setAdditionalNotes(data.additional_notes || "");
      }
    } catch (error) {
      console.error("Error fetching own emission:", error);
    } finally {
      setOwnEmissionLoading(false);
    }
  };

  const fetchLinkedPCFs = async (productCode: string) => {
    try {
      setLinkedPCFsLoading(true);
      const response =
        await productService.getLinkedPCFsByProductCode(productCode);
      if (response.status && response.data) {
        setLinkedPCFs(response.data);
      }
    } catch (error) {
      console.error("Error fetching linked PCFs:", error);
    } finally {
      setLinkedPCFsLoading(false);
    }
  };

  const fetchBomPcfDropdown = async (productCode: string) => {
    try {
      const response = await productService.getBomPcfDropdown(productCode);
      if (response.status && response.data) {
        setBomPcfDropdown(response.data);
        // Auto-select first item if available
        if (response.data.length > 0) {
          setSelectedBomPcfId(response.data[0].id);
          fetchBomPcfDetails(response.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching BOM PCF dropdown:", error);
    }
  };

  const fetchBomPcfDetails = async (bomPcfId: string) => {
    try {
      setBomLoading(true);
      const response = await productService.getBomPcfDetailsById(bomPcfId);
      if (response.status && response.data && response.data.length > 0) {
        setBomPcfDetails(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching BOM PCF details:", error);
    } finally {
      setBomLoading(false);
    }
  };

  const handleBomPcfChange = (value: string) => {
    setSelectedBomPcfId(value);
    setBomCurrentPage(1);
    fetchBomPcfDetails(value);
  };

  const fetchPcfHistoryData = async (productCode: string) => {
    try {
      setPcfHistoryLoading(true);
      const response =
        await productService.getPcfBomHistoryDetails(productCode);
      if (response.status && response.data) {
        setPcfHistoryData(response.data);
      }
    } catch (error) {
      console.error("Error fetching PCF history:", error);
    } finally {
      setPcfHistoryLoading(false);
    }
  };

  const fetchSecondaryDataEntries = async (
    bomPcfId: string,
    productCode: string,
  ) => {
    try {
      setSecondaryDataLoading(true);
      const response = await productService.getSecondaryDataEntries(
        bomPcfId,
        productCode,
      );
      if (response.status && response.data) {
        setSecondaryDataEntries(response.data);
      }
    } catch (error) {
      console.error("Error fetching secondary data entries:", error);
    } finally {
      setSecondaryDataLoading(false);
    }
  };

  const handleSecondaryDataPcfChange = (value: string) => {
    setSecondaryDataSelectedPcf(value);
    setSecondaryDataCurrentPage(1);
    if (product?.product_code) {
      fetchSecondaryDataEntries(value, product.product_code);
    }
  };

  const handleViewSecondaryDataDetails = (item: SecondaryDataBomItem) => {
    setSelectedSecondaryDataItem(item);
    setSecondaryDataDrawerOpen(true);
  };

  const handleDeleteSupportingDocument = async (documentId: string) => {
    if (!documentId) return;
    try {
      // Original: Directly manipulated static UI without API call for deleting supporting documents
      setOwnEmissionLoading(true);
      const response =
        await ownEmissionService.deleteSupportingDocument(documentId);
      if (response.status) {
        message.success("Supporting document deleted successfully");
        if (id) {
          await fetchOwnEmission(id);
        }
      } else {
        message.error(
          response.message || "Failed to delete supporting document",
        );
      }
    } catch (error) {
      console.error("Error deleting supporting document:", error);
      message.error("Error deleting supporting document");
    } finally {
      setOwnEmissionLoading(false);
    }
  };

  const handleSaveOwnEmission = async () => {
    if (!product || !id) return;

    // Validate required fields
    if (!reportingPeriodFrom || !reportingPeriodTo) {
      message.error("Please select reporting period");
      return;
    }

    try {
      setOwnEmissionLoading(true);

      // Note: Using placeholder IDs since we don't have master data APIs
      const formData = {
        id: ownEmission?.id,
        product_id: id,
        reporting_period_from: reportingPeriodFrom.format("YYYY-MM-DD"),
        reporting_period_to: reportingPeriodTo.format("YYYY-MM-DD"),
        calculation_method_id: "DEFAULT_CALC_METHOD", // Placeholder

        fuel_combustion_id: "DEFAULT_FUEL_ID", // Placeholder
        fuel_combustion_value: fuelCombustionValue,
        process_emission_id: "DEFAULT_PROCESS_ID", // Placeholder
        process_emission_value: processEmissionValue,
        fugitive_emission_id: "DEFAULT_FUGITIVE_ID", // Placeholder
        fugitive_emission_value: fugitiveEmissionValue,

        electicity_location_based_id: "DEFAULT_ELEC_LOC_ID", // Placeholder
        electicity_location_based_value: electricityLocationValue,
        electicity_market_based_id: "DEFAULT_ELEC_MKT_ID", // Placeholder
        electicity_market_based_value: electricityMarketValue,
        steam_heat_cooling_id: "DEFAULT_STEAM_ID", // Placeholder
        steam_heat_cooling_value: steamHeatCoolingValue,

        additional_notes: additionalNotes,
      };

      let response;
      if (ownEmission?.id) {
        response = await ownEmissionService.update(formData);
      } else {
        response = await ownEmissionService.create(formData);
      }

      if (response.status) {
        message.success(
          ownEmission?.id ? "Updated successfully" : "Created successfully",
        );
        fetchOwnEmission(id); // Refresh data
      } else {
        message.error(response.message || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving own emission:", error);
      message.error("Error saving own emission");
    } finally {
      setOwnEmissionLoading(false);
    }
  };

  const handleResetForm = () => {
    if (ownEmission) {
      // Reset to saved values
      setReportingPeriodFrom(
        ownEmission.reporting_period_from
          ? dayjs(ownEmission.reporting_period_from)
          : null,
      );
      setReportingPeriodTo(
        ownEmission.reporting_period_to
          ? dayjs(ownEmission.reporting_period_to)
          : null,
      );
      setFuelCombustionValue(ownEmission.fuel_combustion_value || "");
      setProcessEmissionValue(ownEmission.process_emission_value || "");
      setFugitiveEmissionValue(ownEmission.fugitive_emission_value || "");
      setElectricityLocationValue(
        ownEmission.electicity_location_based_value || "",
      );
      setElectricityMarketValue(
        ownEmission.electicity_market_based_value || "",
      );
      setSteamHeatCoolingValue(ownEmission.steam_heat_cooling_value || "");
      setAdditionalNotes(ownEmission.additional_notes || "");
    } else {
      // Clear all fields
      setReportingPeriodFrom(null);
      setReportingPeriodTo(null);
      setFuelCombustionValue("");
      setProcessEmissionValue("");
      setFugitiveEmissionValue("");
      setElectricityLocationValue("");
      setElectricityMarketValue("");
      setSteamHeatCoolingValue("");
      setAdditionalNotes("");
    }
  };

  const handleSubmitContactRequest = async () => {
    if (!contactFullName || !contactPhone || !contactEmail) {
      message.error("Please fill in all required fields");
      return;
    }

    try {
      setOwnEmissionLoading(true);
      const contactData: ContactTeamData = {
        full_name: contactFullName,
        phone_number: contactPhone,
        email_address: contactEmail,
        message: contactMessage,
        product_id: id,
      };

      const response =
        await ownEmissionService.submitContactRequest(contactData);
      if (response.status) {
        message.success("Request submitted successfully");
        // Clear form
        setContactFullName("");
        setContactPhone("");
        setContactEmail("");
        setContactMessage("");
      } else {
        message.error(response.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting contact request:", error);
      message.error("Error submitting request");
    } finally {
      setOwnEmissionLoading(false);
    }
  };

  const calculateTotalEmissions = () => {
    const scope1 =
      (parseFloat(fuelCombustionValue) || 0) +
      (parseFloat(processEmissionValue) || 0) +
      (parseFloat(fugitiveEmissionValue) || 0);
    const scope2 =
      (parseFloat(electricityLocationValue) || 0) +
      (parseFloat(electricityMarketValue) || 0) +
      (parseFloat(steamHeatCoolingValue) || 0);
    const total = scope1 + scope2;

    return {
      total: total.toFixed(2),
      scope1: scope1.toFixed(2),
      scope2: scope2.toFixed(2),
      scope3: "0.00", // Not implemented yet
    };
  };

  const handleDelete = async () => {
    if (!product) return;
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(product.id);
        message.success("Product deleted successfully");
        navigate("/product-portfolio/all-products");
      } catch (error) {
        console.error("Error deleting product:", error);
        message.error("Failed to delete product");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center">
        <Text>Product not found</Text>
        <Button onClick={() => navigate("/product-portfolio/all-products")}>
          Back to List
        </Button>
      </div>
    );
  }

  // Calculate total components from linked PCFs
  const totalComponentsLinked = linkedPCFs.reduce((total, pcf) => {
    return total + (parseInt(pcf.total_component_used_count) || 0);
  }, 0);

  // Calculate total emission from linked PCFs
  const totalEmissionFromPCFs = linkedPCFs.reduce((total, pcf) => {
    return total + (pcf.overall_pcf || 0);
  }, 0);

  const items = [
    {
      key: "1",
      label: "Product Overview",
      children: (
        <div className="flex flex-col gap-6">
          {/* General Product Information - Collapsible */}
          <Collapse
            defaultActiveKey={["1"]}
            expandIconPosition="end"
            className="bg-white rounded-xl shadow-sm border-0"
            items={[
              {
                key: "1",
                label: (
                  <div className="flex items-center gap-3">
                    <Text strong className="text-base">
                      General Product Information
                    </Text>
                    <Tag
                      color="cyan"
                      className="rounded-full px-3 py-0.5 text-xs font-medium"
                    >
                      {product.category_name || "General"}
                    </Tag>
                  </div>
                ),
                children: (
                  <div className="pt-2">
                    <Row gutter={[48, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <Text type="secondary" className="block text-xs mb-1">
                          Product Category
                        </Text>
                        <Text strong>{product.category_name || "-"}</Text>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Text type="secondary" className="block text-xs mb-1">
                          Product Sub-Category
                        </Text>
                        <Text strong>{product.sub_category_name || "-"}</Text>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Text type="secondary" className="block text-xs mb-1">
                          Created By
                        </Text>
                        <Text strong>
                          {product.created_by_name || "System"} -{" "}
                          {product.created_date
                            ? dayjs(product.created_date).format("DD MMM YYYY")
                            : "-"}
                        </Text>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Text type="secondary" className="block text-xs mb-1">
                          Last Submitted By
                        </Text>
                        <Text strong>
                          {product.updated_by_name || "-"} -{" "}
                          {product.update_date
                            ? dayjs(product.update_date).format("DD MMM YYYY")
                            : "-"}
                        </Text>
                      </Col>
                    </Row>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Text type="secondary" className="block text-xs mb-1">
                        Description
                      </Text>
                      <Text className="text-gray-700">
                        {product.description || "No description available."}
                      </Text>
                    </div>
                  </div>
                ),
              },
            ]}
          />

          {/* Linked Information & Product Level Emission Metrics */}
          <Row gutter={24}>
            {/* Linked Information */}
            <Col xs={24} lg={12}>
              <div className="border border-gray-200 rounded-xl p-6 h-full bg-white">
                <Text strong className="text-base block mb-4">
                  Linked Information
                </Text>
                <Text type="secondary" className="block mb-3 text-sm">
                  Linked PCFs
                </Text>
                <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                  {linkedPCFsLoading ? (
                    <div className="text-center py-8">
                      <Spin size="small" />
                    </div>
                  ) : linkedPCFs.length > 0 ? (
                    linkedPCFs.map((pcf) => (
                      <div
                        key={pcf.id}
                        className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <Text className="text-gray-700">
                          {pcf.request_title || pcf.code}
                        </Text>
                        {pcf.status && (
                          <Tag
                            color={
                              pcf.status === "Approved"
                                ? "green"
                                : pcf.status === "Pending"
                                  ? "orange"
                                  : "blue"
                            }
                            className="rounded-full px-3 py-0.5 text-xs font-medium m-0"
                          >
                            {pcf.status}
                          </Tag>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Text type="secondary">No PCFs linked yet</Text>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Product Level Emission Metrics */}
            <Col xs={24} lg={12}>
              <div className="bg-white rounded-xl p-6 h-full">
                <Text strong className="text-base block mb-6">
                  Product Level Emission Metrics
                </Text>
                <div className="flex flex-col gap-4">
                  {/* Total Emission Card */}
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <Text className="block text-sm text-gray-500 mb-1">
                          Total Emission
                        </Text>
                        <div className="flex items-baseline gap-1">
                          <Text className="text-3xl font-semibold text-blue-500">
                            {totalEmissionFromPCFs > 0
                              ? totalEmissionFromPCFs.toExponential(2)
                              : product.ed_estimated_pcf
                                ? product.ed_estimated_pcf.toExponential(2)
                                : "0.00"}
                          </Text>
                        </div>
                        <Text className="text-sm text-blue-500 mt-1 block">
                          T CO₂e
                        </Text>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Total Components Linked Card */}
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <Text className="block text-sm text-emerald-500 mb-1">
                          Total Components Linked
                        </Text>
                        <div className="flex items-baseline gap-1">
                          <Text className="text-3xl font-semibold text-emerald-500">
                            {totalComponentsLinked}
                          </Text>
                        </div>
                        <Text className="text-sm text-emerald-500 mt-1 block">
                          Active Components
                        </Text>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-emerald-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M20.5,11H19V7C19,5.89 18.1,5 17,5H13V3.5A2.5,2.5 0 0,0 10.5,1A2.5,2.5 0 0,0 8,3.5V5H4A2,2 0 0,0 2,7V10.8H3.5C5,10.8 6.2,12 6.2,13.5C6.2,15 5,16.2 3.5,16.2H2V20A2,2 0 0,0 4,22H7.8V20.5C7.8,19 9,17.8 10.5,17.8C12,17.8 13.2,19 13.2,20.5V22H17A2,2 0 0,0 19,20V16H20.5A2.5,2.5 0 0,0 23,13.5A2.5,2.5 0 0,0 20.5,11Z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "2",
      label: "BOM",
      children: (
        <div className="flex flex-col gap-6">
          {/* General Product Information - Collapsible */}
          <Collapse
            defaultActiveKey={["1"]}
            expandIconPosition="end"
            className="bg-white rounded-xl shadow-sm border-0"
            items={[
              {
                key: "1",
                label: (
                  <div className="flex items-center gap-3">
                    <Text strong className="text-base">
                      General Product Information
                    </Text>
                    <Tag
                      color="cyan"
                      className="rounded-full px-3 py-0.5 text-xs font-medium"
                    >
                      {product.category_name || "General"}
                    </Tag>
                  </div>
                ),
                children: (
                  <div className="pt-2">
                    <Row gutter={[48, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <Text type="secondary" className="block text-xs mb-1">
                          Product Category
                        </Text>
                        <Text strong>{product.category_name || "-"}</Text>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Text type="secondary" className="block text-xs mb-1">
                          Product Type
                        </Text>
                        <Text strong>{product.sub_category_name || "-"}</Text>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Text type="secondary" className="block text-xs mb-1">
                          Creation Date
                        </Text>
                        <Text strong>
                          {product.created_date
                            ? dayjs(product.created_date).format("DD MMM YYYY")
                            : "-"}
                        </Text>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Text type="secondary" className="block text-xs mb-1">
                          ProductStatus
                        </Text>
                        <Text strong className="text-emerald-600">
                          Active
                        </Text>
                      </Col>
                    </Row>
                  </div>
                ),
              },
            ]}
          />

          {/* PCF Section */}
          <Row gutter={24}>
            {/* PCF Dropdown */}
            <Col xs={24} lg={8}>
              <div className="bg-white rounded-xl p-5 shadow-sm h-full">
                <Text strong className="text-base block mb-4">
                  PCF
                </Text>
                <div className="mb-3">
                  <Text type="secondary" className="block text-xs mb-2">
                    PCF Request ID
                  </Text>
                  <Select
                    value={selectedBomPcfId}
                    onChange={handleBomPcfChange}
                    className="w-full"
                    size="large"
                    loading={bomLoading}
                    suffixIcon={<DownOutlined />}
                    placeholder="Select PCF Request"
                  >
                    {bomPcfDropdown.map((item) => (
                      <Select.Option key={item.id} value={item.id}>
                        <div className="flex items-center gap-2">
                          <Avatar
                            size="small"
                            className="bg-amber-400 text-white text-xs"
                          >
                            {item.request_title?.charAt(0)?.toUpperCase() ||
                              "N"}
                          </Avatar>
                          <span>{item.request_title || item.code}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                {bomPcfDetails && (
                  <Text type="secondary" className="text-xs text-blue-500">
                    Processed on{" "}
                    {bomPcfDetails.created_date
                      ? dayjs(bomPcfDetails.created_date).format("DD MMM YYYY")
                      : "-"}
                  </Text>
                )}
              </div>
            </Col>

            {/* PCF Analyser */}
            <Col xs={24} lg={16}>
              <div className="bg-white rounded-xl p-5 shadow-sm h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Text strong className="text-base block">
                      PCF Analyser
                    </Text>
                    <Text type="secondary" className="text-sm">
                      Component PCF Progress
                    </Text>
                  </div>
                  <div className="text-right">
                    <Text type="secondary" className="block text-xs">
                      PCF Value
                    </Text>
                    <Text strong className="text-lg text-blue-600">
                      {bomPcfDetails?.overall_pcf
                        ? `${bomPcfDetails.overall_pcf.toExponential(2)} kg CO₂e`
                        : "0.00 kg CO₂e"}
                    </Text>
                  </div>
                </div>
                <div className="mb-2 flex justify-between items-center">
                  <div></div>
                  <Text type="secondary" className="text-xs">
                    {bomPcfDetails?.bom_list?.length || 0}/
                    {bomPcfDetails?.bom_list?.length || 0} components completed
                  </Text>
                </div>
                <Progress
                  percent={100}
                  showInfo={false}
                  strokeColor={{
                    "0%": "#22c55e",
                    "100%": "#16a34a",
                  }}
                  trailColor="#e5e7eb"
                  size={["100%", 12]}
                />
                <div className="flex justify-between mt-1">
                  <Text type="secondary" className="text-xs">
                    0%
                  </Text>
                  <Text type="secondary" className="text-xs">
                    100%
                  </Text>
                </div>
              </div>
            </Col>
          </Row>

          {/* Component Used In Section */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <Text strong className="text-lg">
                Component Used In
              </Text>
              <Input
                placeholder="Search Components..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={bomComponentSearch}
                onChange={(e) => {
                  setBomComponentSearch(e.target.value);
                  setBomCurrentPage(1);
                }}
                className="w-64"
                allowClear
              />
            </div>

            {/* Components Table */}
            {bomLoading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-emerald-500 text-white">
                        <th className="px-4 py-3 text-left text-sm font-medium rounded-tl-lg">
                          Material Number
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Component
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          Components
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          Sub Components
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium rounded-tr-lg">
                          Total PCF
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filteredBomList = (
                          bomPcfDetails?.bom_list || []
                        ).filter(
                          (item) =>
                            item.component_name
                              ?.toLowerCase()
                              .includes(bomComponentSearch.toLowerCase()) ||
                            item.material_number
                              ?.toLowerCase()
                              .includes(bomComponentSearch.toLowerCase()),
                        );
                        const paginatedList = filteredBomList.slice(
                          (bomCurrentPage - 1) * bomPageSize,
                          bomCurrentPage * bomPageSize,
                        );

                        if (paginatedList.length === 0) {
                          return (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-4 py-8 text-center text-gray-500"
                              >
                                No components found
                              </td>
                            </tr>
                          );
                        }

                        return paginatedList.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`border-b border-gray-100 hover:bg-gray-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {item.material_number || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {item.component_name || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">
                              {item.material_emission?.length || 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">
                              {item.material_emission?.length
                                ? Math.max(0, item.material_emission.length - 1)
                                : 0}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">
                              {item.quantity || 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-right">
                              {item.pcf_total_emission_calculation
                                ?.total_pcf_value
                                ? `${item.pcf_total_emission_calculation.total_pcf_value.toExponential(1)} kg CO₂e`
                                : "-"}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <Text type="secondary" className="text-sm">
                    Showing{" "}
                    {Math.min(
                      (bomCurrentPage - 1) * bomPageSize + 1,
                      (bomPcfDetails?.bom_list || []).filter(
                        (item) =>
                          item.component_name
                            ?.toLowerCase()
                            .includes(bomComponentSearch.toLowerCase()) ||
                          item.material_number
                            ?.toLowerCase()
                            .includes(bomComponentSearch.toLowerCase()),
                      ).length,
                    )}{" "}
                    to{" "}
                    {Math.min(
                      bomCurrentPage * bomPageSize,
                      (bomPcfDetails?.bom_list || []).filter(
                        (item) =>
                          item.component_name
                            ?.toLowerCase()
                            .includes(bomComponentSearch.toLowerCase()) ||
                          item.material_number
                            ?.toLowerCase()
                            .includes(bomComponentSearch.toLowerCase()),
                      ).length,
                    )}{" "}
                    of{" "}
                    {
                      (bomPcfDetails?.bom_list || []).filter(
                        (item) =>
                          item.component_name
                            ?.toLowerCase()
                            .includes(bomComponentSearch.toLowerCase()) ||
                          item.material_number
                            ?.toLowerCase()
                            .includes(bomComponentSearch.toLowerCase()),
                      ).length
                    }{" "}
                    entries
                  </Text>
                  <Pagination
                    current={bomCurrentPage}
                    pageSize={bomPageSize}
                    total={
                      (bomPcfDetails?.bom_list || []).filter(
                        (item) =>
                          item.component_name
                            ?.toLowerCase()
                            .includes(bomComponentSearch.toLowerCase()) ||
                          item.material_number
                            ?.toLowerCase()
                            .includes(bomComponentSearch.toLowerCase()),
                      ).length
                    }
                    onChange={(page) => setBomCurrentPage(page)}
                    showSizeChanger={false}
                    size="small"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Own Emission",
      children: (
        <Row gutter={24}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card
              className="shadow-sm rounded-xl"
              title="Own Emission Data Entry"
            >
              {/* Data Entry Method Selection */}
              <div className="mb-6">
                <Text strong className="block mb-4">
                  Select Data Entry Method
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div
                      className={`border-2 p-4 rounded-lg cursor-pointer transition-all ${
                        dataEntryMethod === "questionnaire"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => setDataEntryMethod("questionnaire")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            dataEntryMethod === "questionnaire"
                              ? "border-green-500"
                              : "border-gray-300"
                          }`}
                        >
                          {dataEntryMethod === "questionnaire" && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          )}
                        </div>
                        <Text strong>Client Questionnaire</Text>
                      </div>
                      <Text type="secondary" className="text-sm">
                        Fill the questionnaire to calculate product emissions
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div
                      className={`border-2 p-4 rounded-lg cursor-pointer transition-all ${
                        dataEntryMethod === "contact"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => setDataEntryMethod("contact")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            dataEntryMethod === "contact"
                              ? "border-green-500"
                              : "border-gray-300"
                          }`}
                        >
                          {dataEntryMethod === "contact" && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          )}
                        </div>
                        <Text strong>Contact Enviguide Team</Text>
                      </div>
                      <Text type="secondary" className="text-sm">
                        Get expert help with your emission calculations
                      </Text>
                    </div>
                  </Col>
                </Row>
              </div>

              <Divider />

              {dataEntryMethod === "questionnaire" ? (
                <>
                  {/* Client Questionnaire Link Generator */}
                  <div className="mb-6">
                    <Title level={5}>Generate Client Questionnaire Link</Title>
                    <Text type="secondary" className="block mb-4">
                      Select a PCF to generate a questionnaire link for calculating product emissions.
                    </Text>

                    {/* PCF Selection */}
                    <div className="mb-6">
                      <Text strong className="block mb-2">
                        Select PCF <span className="text-red-500">*</span>
                      </Text>
                      <Select
                        placeholder="Select a PCF"
                        size="large"
                        className="w-full"
                        value={ownEmissionPcfId}
                        onChange={async (value) => {
                          setOwnEmissionPcfId(value);
                          setQuestionnaireLink("");
                          setOwnEmissionClientId("");
                          setOwnEmissionClientName("");

                          if (value && id) {
                            try {
                              setOwnEmissionLinkLoading(true);
                              // Fetch PCF details to get submittedBy.user_id
                              const pcfResponse = await productService.getBomPcfDetailsById(value);
                              if (pcfResponse.status && pcfResponse.data?.[0]) {
                                const pcfData = pcfResponse.data[0];
                                const clientId = pcfData.pcf_request_stages?.pcf_request_created_by?.user_id || "";
                                const clientName = pcfData.pcf_request_stages?.pcf_request_created_by?.user_name || "";

                                setOwnEmissionClientId(clientId);
                                setOwnEmissionClientName(clientName);

                                if (clientId) {
                                  const baseUrl = window.location.origin;
                                  const link = `${baseUrl}/supplier-questionnaire?is_client=true&client_id=${clientId}&product_id=${id}&bom_pcf_id=${value}`;
                                  setQuestionnaireLink(link);
                                } else {
                                  message.warning("No client found for this PCF");
                                }
                              }
                            } catch (error) {
                              console.error("Error fetching PCF details:", error);
                              message.error("Failed to fetch PCF details");
                            } finally {
                              setOwnEmissionLinkLoading(false);
                            }
                          }
                        }}
                        loading={bomLoading || ownEmissionLinkLoading}
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as unknown as string)
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {bomPcfDropdown.map((pcf) => (
                          <Select.Option key={pcf.id} value={pcf.id}>
                            {pcf.code} - {pcf.request_title}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>

                    {/* Generated Link Display */}
                    {questionnaireLink && (
                      <div className="mb-6">
                        <Text strong className="block mb-2">
                          Questionnaire Link
                        </Text>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <LinkOutlined className="text-green-600" />
                            <Text className="text-sm text-gray-600 break-all">
                              {questionnaireLink}
                            </Text>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="primary"
                              icon={<LinkOutlined />}
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                navigator.clipboard.writeText(questionnaireLink);
                                message.success("Link copied to clipboard!");
                              }}
                            >
                              Copy Link
                            </Button>
                            <Button
                              icon={<ShareAltOutlined />}
                              onClick={() => window.open(questionnaireLink, "_blank")}
                            >
                              Open Questionnaire
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <InfoCircleOutlined className="text-blue-500 text-lg mt-0.5" />
                        <div>
                          <Text strong className="block mb-1">
                            How it works
                          </Text>
                          <Text type="secondary" className="text-sm">
                            1. Select a PCF from the dropdown above
                            <br />
                            2. A unique questionnaire link will be generated
                            <br />
                            3. Use the link to fill the questionnaire with product emission data
                            <br />
                            4. The questionnaire data will be associated with this product
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Info Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Title level={5} style={{ margin: 0, marginBottom: 12 }}>
                      Product Details
                    </Title>
                    <Row gutter={16}>
                      <Col span={6}>
                        <Text type="secondary" className="block text-xs">
                          Product Code:
                        </Text>
                        <Text strong>{product?.product_code || "-"}</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary" className="block text-xs">
                          Product Name:
                        </Text>
                        <Text strong>{product?.product_name || "-"}</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary" className="block text-xs">
                          Category:
                        </Text>
                        <Text strong>{product?.category_name || "-"}</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary" className="block text-xs">
                          Client:
                        </Text>
                        <Text strong className="text-xs">
                          {ownEmissionClientName || ownEmissionClientId || "-"}
                        </Text>
                      </Col>
                    </Row>
                  </div>
                </>
              ) : (
                <>
                  {/* Contact Form */}
                  <Row gutter={24} className="mb-6">
                    <Col span={12}>
                      <div>
                        <Text strong className="block mb-2">
                          Full Name<span className="text-red-500">*</span>
                        </Text>
                        <Input
                          value={contactFullName}
                          onChange={(e) => setContactFullName(e.target.value)}
                          placeholder="John Doe"
                          size="large"
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <Text strong className="block mb-2">
                          Phone Number<span className="text-red-500">*</span>
                        </Text>
                        <Input
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          size="large"
                        />
                      </div>
                    </Col>
                    <Col span={24}>
                      <div className="mb-4">
                        <Text strong className="block mb-2">
                          Email Address<span className="text-red-500">*</span>
                        </Text>
                        <Input
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="john.doe@company.com"
                          size="large"
                          type="email"
                        />
                      </div>
                    </Col>
                    <Col span={24}>
                      <div className="mb-4">
                        <Text strong className="block mb-2">
                          Message
                        </Text>
                        <TextArea
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          rows={4}
                          placeholder="Please provide details about your emission calculation needs and any specific questions you have..."
                        />
                      </div>
                    </Col>
                  </Row>

                  {/* Product Info Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <Row gutter={16}>
                      <Col span={6}>
                        <Text type="secondary" className="block text-xs">
                          Product:
                        </Text>
                        <Text strong>
                          {product?.product_code || "CF-10234"}
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary" className="block text-xs">
                          Category:
                        </Text>
                        <Text strong>
                          {product?.category_name || "Chassis"}
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary" className="block text-xs">
                          Status:
                        </Text>
                        <Tag color="orange">Data</Tag>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary" className="block text-xs">
                          Date:
                        </Text>
                        <Text strong>{dayjs().format("M/D/YYYY")}</Text>
                      </Col>
                    </Row>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="primary"
                      size="large"
                      icon={<SaveOutlined />}
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleSubmitContactRequest}
                      loading={ownEmissionLoading}
                    >
                      Submit
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <div className="flex flex-col gap-6">
              {/* Product Summary */}
              <Card className="shadow-sm rounded-xl" title="Product Summary">
                <div className="space-y-4">
                  <div>
                    <Text type="secondary" className="block text-sm">
                      Product Code:
                    </Text>
                    <Text strong className="text-base">
                      {product?.product_code || "CF-10234"}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" className="block text-sm">
                      Name:
                    </Text>
                    <Text strong className="text-base">
                      {product?.product_name || "Chassis Frame"}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" className="block text-sm">
                      Category:
                    </Text>
                    <Text strong className="text-base">
                      {product?.category_name} › {product?.sub_category_name}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" className="block text-sm">
                      Manufacturer:
                    </Text>
                    <Text strong className="text-base">
                      {product?.ts_supplier || "Tesla Inc."}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" className="block text-sm">
                      Weight:
                    </Text>
                    <Text strong className="text-base">
                      {product?.ts_weight_kg || "125"} kg
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" className="block text-sm">
                      Material:
                    </Text>
                    <Text strong className="text-base">
                      {product?.ts_material || "Aluminum Alloy"}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" className="block text-sm">
                      Created On:
                    </Text>
                    <Text strong className="text-base">
                      {product?.created_date
                        ? dayjs(product.created_date).format("DD MMM YYYY")
                        : "12 Jun 2023"}
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Emission Summary */}
              <Card
                className="shadow-sm rounded-xl"
                title={
                  <div className="flex justify-between items-center">
                    <span>Emission Summary</span>
                    <Tag color="orange">Draft</Tag>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <Text type="secondary" className="block text-sm mb-2">
                      Total Emissions
                    </Text>
                    <div className="flex items-baseline justify-center gap-2">
                      <Text className="text-4xl font-bold">
                        {calculateTotalEmissions().total}
                      </Text>
                      <Text type="secondary">t CO₂e</Text>
                    </div>
                    <div className="mt-2">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                        <Text className="text-xl font-semibold text-gray-400">
                          0%
                        </Text>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Text className="text-sm">Scope 1 (Direct)</Text>
                      <Text strong>
                        {calculateTotalEmissions().scope1} t CO₂e
                      </Text>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${
                            parseFloat(calculateTotalEmissions().total) > 0
                              ? (
                                  (parseFloat(
                                    calculateTotalEmissions().scope1,
                                  ) /
                                    parseFloat(
                                      calculateTotalEmissions().total,
                                    )) *
                                  100
                                ).toFixed(0)
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Text className="text-sm">Scope 2 (Indirect)</Text>
                      <Text strong>
                        {calculateTotalEmissions().scope2} t CO₂e
                      </Text>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            parseFloat(calculateTotalEmissions().total) > 0
                              ? (
                                  (parseFloat(
                                    calculateTotalEmissions().scope2,
                                  ) /
                                    parseFloat(
                                      calculateTotalEmissions().total,
                                    )) *
                                  100
                                ).toFixed(0)
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Text className="text-sm">Scope 3 (Value Chain)</Text>
                      <Text strong>
                        {calculateTotalEmissions().scope3} t CO₂e
                      </Text>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Help & Resources */}
              <Card className="shadow-sm rounded-xl" title="Help & Resources">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Text strong className="block">
                        Emission Calculation Guide
                      </Text>
                      <Text type="secondary" className="text-xs">
                        Learn how to calculate emissions
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Text strong className="block">
                        Emission Factor Database
                      </Text>
                      <Text type="secondary" className="text-xs">
                        Find appropriate emission factors
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Text strong className="block">
                        Contact Support
                      </Text>
                      <Text type="secondary" className="text-xs">
                        Get help with your calculations
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      ),
    },
    {
      key: "4",
      label: "PCF",
      children: (
        <div className="flex gap-6">
          {/* Left Sidebar - PCF Management */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <Text strong className="text-base block mb-4">
                PCF Management
              </Text>
              <div className="flex flex-col gap-1">
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    pcfActiveMenu === "linked-secondary"
                      ? "bg-emerald-50 text-emerald-600"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                  onClick={() => {
                    setPcfActiveMenu("linked-secondary");
                    // Auto-select first PCF if available
                    if (
                      bomPcfDropdown.length > 0 &&
                      !secondaryDataSelectedPcf
                    ) {
                      const firstPcfId = bomPcfDropdown[0].id;
                      setSecondaryDataSelectedPcf(firstPcfId);
                      if (product?.product_code) {
                        fetchSecondaryDataEntries(
                          firstPcfId,
                          product.product_code,
                        );
                      }
                    }
                  }}
                >
                  <LinkOutlined
                    className={
                      pcfActiveMenu === "linked-secondary"
                        ? "text-emerald-600"
                        : ""
                    }
                  />
                  <Text
                    className={
                      pcfActiveMenu === "linked-secondary"
                        ? "text-emerald-600 font-medium"
                        : ""
                    }
                  >
                    Linked Secondary Data Source
                  </Text>
                </div>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    pcfActiveMenu === "manage-pcf"
                      ? "bg-emerald-50 text-emerald-600"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                  onClick={() => setPcfActiveMenu("manage-pcf")}
                >
                  <svg
                    className={`w-4 h-4 ${pcfActiveMenu === "manage-pcf" ? "text-emerald-600" : ""}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                  </svg>
                  <Text
                    className={
                      pcfActiveMenu === "manage-pcf"
                        ? "text-emerald-600 font-medium"
                        : ""
                    }
                  >
                    Manage PCF
                  </Text>
                </div>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    pcfActiveMenu === "pcf-overview"
                      ? "bg-emerald-50 text-emerald-600"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                  onClick={() => setPcfActiveMenu("pcf-overview")}
                >
                  <BarChartOutlined
                    className={
                      pcfActiveMenu === "pcf-overview" ? "text-emerald-600" : ""
                    }
                  />
                  <Text
                    className={
                      pcfActiveMenu === "pcf-overview"
                        ? "text-emerald-600 font-medium"
                        : ""
                    }
                  >
                    PCF Overview
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* PCF Overview View */}
            {pcfActiveMenu === "pcf-overview" && (
              <div className="flex flex-col gap-6">
                <Row gutter={24}>
                  {/* Active PCF Card */}
                  <Col xs={24} lg={12}>
                    <div className="bg-white rounded-xl p-5 shadow-sm h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <Text strong className="text-base">
                          Active PCF
                        </Text>
                        <InfoCircleOutlined className="text-gray-400" />
                        <div className="flex-1"></div>
                        <Avatar
                          size="small"
                          className="bg-amber-400 text-white text-xs"
                        >
                          {pcfHistoryData[0]?.request_title
                            ?.charAt(0)
                            ?.toUpperCase() || "N"}
                        </Avatar>
                        <Text type="secondary" className="text-xs">
                          Last updated:{" "}
                          {pcfHistoryData[0]?.created_date
                            ? dayjs(pcfHistoryData[0].created_date).format(
                                "DD-MM-YYYY",
                              )
                            : "-"}
                        </Text>
                      </div>
                      <div className="mb-3">
                        <Text type="secondary" className="block text-xs mb-2">
                          Version
                        </Text>
                        <Tag
                          color="green"
                          className="rounded-full px-3 py-0.5 text-xs"
                        >
                          {pcfHistoryData[0]?.model_version || "v1.0"} Active
                        </Tag>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-6 text-center">
                        <Text className="text-5xl font-bold text-gray-800">
                          {pcfHistoryData[0]?.overall_pcf?.toFixed(1) || "0.0"}
                        </Text>
                        <Text type="secondary" className="block mt-2">
                          kg CO₂e
                        </Text>
                      </div>
                    </div>
                  </Col>

                  {/* PCF History / Own Emission */}
                  <Col xs={24} lg={12}>
                    <div className="bg-white rounded-xl p-5 shadow-sm h-full">
                      <div className="flex gap-4 mb-4 border-b border-gray-100">
                        <div
                          className={`pb-3 cursor-pointer ${
                            pcfHistoryTab === "history"
                              ? "border-b-2 border-emerald-500 text-emerald-600 font-medium"
                              : "text-gray-500"
                          }`}
                          onClick={() => setPcfHistoryTab("history")}
                        >
                          PCF History
                        </div>
                        <div
                          className={`pb-3 cursor-pointer ${
                            pcfHistoryTab === "own-emission"
                              ? "border-b-2 border-emerald-500 text-emerald-600 font-medium"
                              : "text-gray-500"
                          }`}
                          onClick={() => setPcfHistoryTab("own-emission")}
                        >
                          Own Emission
                        </div>
                      </div>

                      {pcfHistoryTab === "history" && (
                        <div>
                          <Text strong className="block mb-4">
                            Version History
                          </Text>
                          {pcfHistoryLoading ? (
                            <div className="flex justify-center py-8">
                              <Spin size="small" />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto">
                              {pcfHistoryData.map((item, index) => (
                                <div
                                  key={item.id}
                                  className="border border-gray-200 rounded-lg p-4"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      <Tag
                                        color={
                                          index === 0 ? "green" : "default"
                                        }
                                        className="rounded-full px-2 py-0 text-xs m-0"
                                      >
                                        {item.model_version ||
                                          `v${pcfHistoryData.length - index}.0`}
                                        {index === 0 && " Active"}
                                      </Tag>
                                      <Text strong>
                                        {item.overall_pcf?.toFixed(1) || "0.0"}{" "}
                                        kg CO₂e
                                      </Text>
                                    </div>
                                    <Text type="secondary" className="text-xs">
                                      {item.created_date
                                        ? dayjs(item.created_date).format(
                                            "MMM DD, YYYY",
                                          )
                                        : "-"}
                                    </Text>
                                  </div>
                                  <Text
                                    type="secondary"
                                    className="text-sm block mb-2"
                                  >
                                    {item.request_description ||
                                      "PCF calculation update"}
                                  </Text>
                                  <div className="flex items-center gap-2">
                                    <Avatar
                                      size="small"
                                      className="bg-gray-300 text-white text-xs"
                                    >
                                      {item.request_title
                                        ?.charAt(0)
                                        ?.toUpperCase() || "U"}
                                    </Avatar>
                                    <Text type="secondary" className="text-xs">
                                      {item.request_title || "User"}
                                    </Text>
                                  </div>
                                </div>
                              ))}
                              {pcfHistoryData.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                  No version history available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {pcfHistoryTab === "own-emission" && (
                        <div className="text-center py-8 text-gray-500">
                          Own emission data will be displayed here
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button
                    icon={<ShareAltOutlined />}
                    className="border-emerald-500 text-emerald-500"
                  >
                    Share
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="bg-emerald-500 hover:bg-emerald-600 border-0"
                    onClick={() => navigate("/pcf-request/new")}
                  >
                    Create PCF
                  </Button>
                </div>
              </div>
            )}

            {/* Manage PCF View */}
            {pcfActiveMenu === "manage-pcf" && (
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Avatar size="default" className="bg-amber-400 text-white">
                    {pcfHistoryData[0]?.request_title
                      ?.charAt(0)
                      ?.toUpperCase() || "N"}
                  </Avatar>
                  <Text strong className="text-xl">
                    Supplier PCF Data
                  </Text>
                  <div className="flex-1"></div>
                  <Text type="secondary">PCF Value: </Text>
                  <Text strong>
                    {pcfHistoryData[0]?.overall_pcf?.toFixed(2) || "0.00"}
                  </Text>
                </div>

                {/* Supplier Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-emerald-500 text-white">
                        <th className="px-4 py-3 text-left text-sm font-medium rounded-tl-lg">
                          Supplier Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Supplier ID
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          PCF State
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          Shared PCFs
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          Components Supplied
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium rounded-tr-lg">
                          PCF Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Extract unique suppliers from all BOM lists
                        const suppliersMap = new Map();
                        pcfHistoryData.forEach((pcf) => {
                          pcf.bom_list?.forEach((bom) => {
                            if (
                              bom.supplier &&
                              !suppliersMap.has(bom.supplier.sup_id)
                            ) {
                              suppliersMap.set(bom.supplier.sup_id, {
                                ...bom.supplier,
                                pcf_state: pcf.status,
                                components_count: 1,
                                pcf_value:
                                  bom.pcf_total_emission_calculation
                                    ?.total_pcf_value || 0,
                                location: bom.production_location || "N/A",
                              });
                            } else if (bom.supplier) {
                              const existing = suppliersMap.get(
                                bom.supplier.sup_id,
                              );
                              existing.components_count += 1;
                              existing.pcf_value +=
                                bom.pcf_total_emission_calculation
                                  ?.total_pcf_value || 0;
                            }
                          });
                        });

                        const suppliers = Array.from(suppliersMap.values());

                        if (suppliers.length === 0) {
                          return (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-4 py-8 text-center text-gray-500"
                              >
                                No supplier data available
                              </td>
                            </tr>
                          );
                        }

                        return suppliers.map((supplier, index) => (
                          <tr
                            key={supplier.sup_id}
                            className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                          >
                            <td className="px-4 py-3 text-sm">
                              {supplier.supplier_name}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {supplier.location}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {supplier.code}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Tag
                                color={
                                  supplier.pcf_state === "Approved"
                                    ? "green"
                                    : "orange"
                                }
                                className="rounded-full"
                              >
                                {supplier.pcf_state === "Approved"
                                  ? "Secondary Data"
                                  : "PCF Data Unavailable"}
                              </Tag>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">2</td>
                            <td className="px-4 py-3 text-sm text-center">
                              {supplier.components_count}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              {supplier.pcf_value.toFixed(3)}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Linked Secondary Data Source View */}
            {pcfActiveMenu === "linked-secondary" && (
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <Text strong className="text-xl block text-center mb-6">
                  Secondary Data Entries
                </Text>

                {/* Filters */}
                <Row gutter={16} className="mb-4">
                  <Col xs={24} sm={12} md={5}>
                    <Text type="secondary" className="block text-xs mb-1">
                      PCF Request ID
                    </Text>
                    <Select
                      value={secondaryDataSelectedPcf}
                      onChange={handleSecondaryDataPcfChange}
                      className="w-full"
                      placeholder="Select PCF Request"
                      loading={secondaryDataLoading}
                    >
                      {bomPcfDropdown.map((item) => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.request_title || item.code}
                        </Select.Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={5}>
                    <Text type="secondary" className="block text-xs mb-1">
                      Lifecycle Stage
                    </Text>
                    <Select
                      className="w-full"
                      defaultValue="all"
                      placeholder="All Lifecycle Stages"
                    >
                      <Select.Option value="all">
                        All Lifecycle Stages
                      </Select.Option>
                      <Select.Option value="production">
                        Production
                      </Select.Option>
                      <Select.Option value="distribution">
                        Distribution
                      </Select.Option>
                      <Select.Option value="use">Use Phase</Select.Option>
                      <Select.Option value="end-of-life">
                        End - of - Life
                      </Select.Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={5}>
                    <Text type="secondary" className="block text-xs mb-1">
                      Material Type
                    </Text>
                    <Select
                      className="w-full"
                      defaultValue="all"
                      placeholder="All Material Types"
                    >
                      <Select.Option value="all">
                        All Material Types
                      </Select.Option>
                      <Select.Option value="aluminum">Aluminum</Select.Option>
                      <Select.Option value="steel">Steel</Select.Option>
                      <Select.Option value="plastic">Plastic</Select.Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={5}>
                    <Text type="secondary" className="block text-xs mb-1">
                      Source
                    </Text>
                    <Select
                      className="w-full"
                      defaultValue="all"
                      placeholder="All Sources"
                    >
                      <Select.Option value="all">All Sources</Select.Option>
                      <Select.Option value="catena-x">Catena-X</Select.Option>
                      <Select.Option value="ecoinvent">Ecoinvent</Select.Option>
                      <Select.Option value="internal">
                        Internal DB
                      </Select.Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Text type="secondary" className="block text-xs mb-1">
                      Search
                    </Text>
                    <Input
                      placeholder="Search by keyword..."
                      prefix={<SearchOutlined className="text-gray-400" />}
                      value={secondaryDataSearch}
                      onChange={(e) => {
                        setSecondaryDataSearch(e.target.value);
                        setSecondaryDataCurrentPage(1);
                      }}
                      allowClear
                    />
                  </Col>
                </Row>

                {/* Secondary Data Table */}
                {secondaryDataLoading ? (
                  <div className="flex justify-center py-12">
                    <Spin size="large" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-emerald-500 text-white">
                            <th className="px-4 py-3 text-left text-sm font-medium rounded-tl-lg">
                              Material Component
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium">
                              Source
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium">
                              Lifecycle Stage
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium">
                              Emission Value(Kg2Coe)
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-medium rounded-tr-lg">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const bomList =
                              secondaryDataEntries?.bom_list || [];
                            const filteredList = bomList.filter(
                              (item) =>
                                item.component_name
                                  ?.toLowerCase()
                                  .includes(
                                    secondaryDataSearch.toLowerCase(),
                                  ) ||
                                item.material_number
                                  ?.toLowerCase()
                                  .includes(secondaryDataSearch.toLowerCase()),
                            );
                            const paginatedList = filteredList.slice(
                              (secondaryDataCurrentPage - 1) *
                                secondaryDataPageSize,
                              secondaryDataCurrentPage * secondaryDataPageSize,
                            );

                            if (paginatedList.length === 0) {
                              return (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className="px-4 py-8 text-center text-gray-500"
                                  >
                                    {secondaryDataSelectedPcf
                                      ? "No secondary data entries found"
                                      : "Please select a PCF Request ID"}
                                  </td>
                                </tr>
                              );
                            }

                            return paginatedList.map((item, index) => (
                              <tr
                                key={item.bom_id}
                                className={`border-b border-gray-100 hover:bg-gray-50 ${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                }`}
                              >
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">⬡</span>
                                    {item.component_name || "-"}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Tag
                                    color={
                                      item.data_source === "Catena-X"
                                        ? "cyan"
                                        : item.data_source === "Ecoinvent"
                                          ? "green"
                                          : "orange"
                                    }
                                    className="rounded-full"
                                  >
                                    {item.data_source || "Internal DB"}
                                  </Tag>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {secondaryDataEntries?.life_cycle_stage_name ||
                                    "Production"}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {item.pcf_total_emission_calculation
                                    ?.total_pcf_value
                                    ? item.pcf_total_emission_calculation.total_pcf_value.toExponential(
                                        2,
                                      )
                                    : "-"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    onClick={() =>
                                      handleViewSecondaryDataDetails(item)
                                    }
                                  />
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {secondaryDataEntries?.bom_list &&
                      secondaryDataEntries.bom_list.length > 0 && (
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                          <Text type="secondary" className="text-sm">
                            Showing{" "}
                            {Math.min(
                              (secondaryDataCurrentPage - 1) *
                                secondaryDataPageSize +
                                1,
                              (secondaryDataEntries?.bom_list || []).filter(
                                (item) =>
                                  item.component_name
                                    ?.toLowerCase()
                                    .includes(
                                      secondaryDataSearch.toLowerCase(),
                                    ) ||
                                  item.material_number
                                    ?.toLowerCase()
                                    .includes(
                                      secondaryDataSearch.toLowerCase(),
                                    ),
                              ).length,
                            )}{" "}
                            to{" "}
                            {Math.min(
                              secondaryDataCurrentPage * secondaryDataPageSize,
                              (secondaryDataEntries?.bom_list || []).filter(
                                (item) =>
                                  item.component_name
                                    ?.toLowerCase()
                                    .includes(
                                      secondaryDataSearch.toLowerCase(),
                                    ) ||
                                  item.material_number
                                    ?.toLowerCase()
                                    .includes(
                                      secondaryDataSearch.toLowerCase(),
                                    ),
                              ).length,
                            )}{" "}
                            of{" "}
                            {
                              (secondaryDataEntries?.bom_list || []).filter(
                                (item) =>
                                  item.component_name
                                    ?.toLowerCase()
                                    .includes(
                                      secondaryDataSearch.toLowerCase(),
                                    ) ||
                                  item.material_number
                                    ?.toLowerCase()
                                    .includes(
                                      secondaryDataSearch.toLowerCase(),
                                    ),
                              ).length
                            }{" "}
                            entries
                          </Text>
                          <Pagination
                            current={secondaryDataCurrentPage}
                            pageSize={secondaryDataPageSize}
                            total={
                              (secondaryDataEntries?.bom_list || []).filter(
                                (item) =>
                                  item.component_name
                                    ?.toLowerCase()
                                    .includes(
                                      secondaryDataSearch.toLowerCase(),
                                    ) ||
                                  item.material_number
                                    ?.toLowerCase()
                                    .includes(
                                      secondaryDataSearch.toLowerCase(),
                                    ),
                              ).length
                            }
                            onChange={(page) =>
                              setSecondaryDataCurrentPage(page)
                            }
                            showSizeChanger={false}
                            size="small"
                          />
                        </div>
                      )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Secondary Data Details Drawer */}
          <Drawer
            title={
              <div className="flex items-center justify-between">
                <Text strong>Secondary Data Details</Text>
              </div>
            }
            placement="right"
            onClose={() => setSecondaryDataDrawerOpen(false)}
            open={secondaryDataDrawerOpen}
            width={500}
          >
            {selectedSecondaryDataItem && (
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600">⬡</span>
                  </div>
                  <div>
                    <Text strong className="block">
                      {selectedSecondaryDataItem.component_name}
                    </Text>
                    <Text type="secondary" className="text-xs">
                      {selectedSecondaryDataItem.material_number}
                    </Text>
                  </div>
                </div>

                {/* Info Grid */}
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <Text type="secondary" className="block text-xs">
                        Material Type
                      </Text>
                      <Text strong>
                        {selectedSecondaryDataItem.material_emission?.[0]
                          ?.material_type || "N/A"}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <Text type="secondary" className="block text-xs">
                        Lifecycle Stage
                      </Text>
                      <Text strong>
                        {secondaryDataEntries?.life_cycle_stage_name ||
                          "Production"}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <Text type="secondary" className="block text-xs">
                        Emission Value
                      </Text>
                      <Text strong>
                        {selectedSecondaryDataItem
                          .pcf_total_emission_calculation?.total_pcf_value
                          ? `${selectedSecondaryDataItem.pcf_total_emission_calculation.total_pcf_value.toExponential(2)} kgCO₂e`
                          : "N/A"}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <Text type="secondary" className="block text-xs">
                        Validity Period
                      </Text>
                      <Text strong>Jan 2024 - Dec 2025</Text>
                    </div>
                  </Col>
                </Row>

                {/* Data Source */}
                <div>
                  <Text strong className="block mb-2">
                    Data Source
                  </Text>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                      <span className="text-white text-xs">E</span>
                    </div>
                    <div>
                      <Text strong className="block text-sm">
                        {selectedSecondaryDataItem.data_source || "Ecoinvent"}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        Version 3.8
                      </Text>
                    </div>
                  </div>
                  <Text type="secondary" className="text-xs mt-1 block">
                    Published by Ecoinvent Association
                  </Text>
                </div>

                {/* Data Quality Scores */}
                {selectedSecondaryDataItem.dqr_rating && (
                  <div>
                    <Text strong className="block mb-2">
                      Data Quality Scores
                    </Text>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Text className="w-28 text-sm">Transparency</Text>
                        <Progress
                          percent={90}
                          size="small"
                          className="flex-1"
                          strokeColor="#22c55e"
                          showInfo={false}
                        />
                        <Text className="text-sm">4.5/5</Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Text className="w-28 text-sm">Reliability</Text>
                        <Progress
                          percent={84}
                          size="small"
                          className="flex-1"
                          strokeColor="#3b82f6"
                          showInfo={false}
                        />
                        <Text className="text-sm">4.2/5</Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Text className="w-28 text-sm">Completeness</Text>
                        <Progress
                          percent={76}
                          size="small"
                          className="flex-1"
                          strokeColor="#f59e0b"
                          showInfo={false}
                        />
                        <Text className="text-sm">3.8/5</Text>
                      </div>
                    </div>
                  </div>
                )}

                {/* Emission Breakdown */}
                <div>
                  <Text strong className="block mb-2">
                    Emission Breakdown
                  </Text>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <Text type="secondary" className="text-sm">
                        Raw Material Extraction
                      </Text>
                      <Text className="text-sm">
                        {selectedSecondaryDataItem
                          .pcf_total_emission_calculation?.material_value
                          ? `${selectedSecondaryDataItem.pcf_total_emission_calculation.material_value.toExponential(2)} kgCO₂e`
                          : "-"}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary" className="text-sm">
                        Processing
                      </Text>
                      <Text className="text-sm">
                        {selectedSecondaryDataItem
                          .pcf_total_emission_calculation?.production_value
                          ? `${selectedSecondaryDataItem.pcf_total_emission_calculation.production_value.toExponential(2)} kgCO₂e`
                          : "-"}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary" className="text-sm">
                        Transportation
                      </Text>
                      <Text className="text-sm">
                        {selectedSecondaryDataItem
                          .pcf_total_emission_calculation?.logistic_value
                          ? `${selectedSecondaryDataItem.pcf_total_emission_calculation.logistic_value.toExponential(2)} kgCO₂e`
                          : "-"}
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Usage Recommendation */}
                <div>
                  <Text strong className="block mb-2">
                    Usage Recommendation
                  </Text>
                  <Text type="secondary" className="text-sm">
                    Recommended for use with automotive body panels and
                    structural components when primary data is unavailable.
                    Verified by third-party assessment.
                  </Text>
                </div>

                {/* License & Usage Note */}
                <div>
                  <Text strong className="block mb-2">
                    License & Usage Note
                  </Text>
                  <Text type="secondary" className="text-sm">
                    Licensed for commercial use under Ecoinvent terms.
                    Attribution required when publishing results. Data should be
                    updated when primary sources become available.
                  </Text>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <Button icon={<DownloadOutlined />} className="flex-1">
                    Download
                  </Button>
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 border-0"
                  >
                    Link to Component
                  </Button>
                </div>
              </div>
            )}
          </Drawer>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => navigate("/product-portfolio/all-products")}
            className="p-0 text-gray-600 hover:text-gray-900 mb-4 font-normal"
          >
            Product Portfolio
          </Button>
          <div className="flex items-center gap-4 mt-2">
            <div className="bg-emerald-500 p-3 rounded-xl">
              <Package className="w-7 h-7 text-white" />
            </div>
            <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
              {product.product_name}
            </Title>
          </div>
        </div>

        {/* Tabs and Content */}
        <Tabs
          defaultActiveKey="1"
          items={items}
          className="product-view-tabs"
          tabBarStyle={{
            marginBottom: 24,
            borderBottom: "1px solid #e5e7eb",
          }}
        />
      </div>
    </div>
  );
};

export default ProductView;
