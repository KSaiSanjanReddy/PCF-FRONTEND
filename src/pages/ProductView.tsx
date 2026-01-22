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
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CloudOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  PieChartOutlined,
  SaveOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { Package, FileText, ArrowLeft, Edit } from "lucide-react";
import productService from "../lib/productService";
import type { Product } from "../lib/productService";
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
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [dataEntryMethod, setDataEntryMethod] = useState<"manual" | "contact">(
    "manual"
  );

  // Own Emissions state
  const [ownEmissionLoading, setOwnEmissionLoading] = useState(false);
  const [ownEmission, setOwnEmission] = useState<OwnEmission | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<OwnEmissionDocument[]>(
    []
  );
  const [reportingPeriodFrom, setReportingPeriodFrom] = useState<Dayjs | null>(
    null
  );
  const [reportingPeriodTo, setReportingPeriodTo] = useState<Dayjs | null>(
    null
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

  const handleDeleteSupportingDocument = async (documentId: string) => {
    if (!documentId) return;
    try {
      // Original: Directly manipulated static UI without API call for deleting supporting documents
      setOwnEmissionLoading(true);
      const response = await ownEmissionService.deleteSupportingDocument(
        documentId
      );
      if (response.status) {
        message.success("Supporting document deleted successfully");
        if (id) {
          await fetchOwnEmission(id);
        }
      } else {
        message.error(
          response.message || "Failed to delete supporting document"
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
          ownEmission?.id ? "Updated successfully" : "Created successfully"
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
          : null
      );
      setReportingPeriodTo(
        ownEmission.reporting_period_to
          ? dayjs(ownEmission.reporting_period_to)
          : null
      );
      setFuelCombustionValue(ownEmission.fuel_combustion_value || "");
      setProcessEmissionValue(ownEmission.process_emission_value || "");
      setFugitiveEmissionValue(ownEmission.fugitive_emission_value || "");
      setElectricityLocationValue(
        ownEmission.electicity_location_based_value || ""
      );
      setElectricityMarketValue(
        ownEmission.electicity_market_based_value || ""
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

      const response = await ownEmissionService.submitContactRequest(
        contactData
      );
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

  const items = [
    {
      key: "1",
      label: "Product Overview",
      children: (
        <div className="flex flex-col gap-6">
          {/* General Product Information */}
          <Card
            className="shadow-sm rounded-xl"
            title="General Product Information"
          >
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Tag color="blue">{product.category_name || "General"}</Tag>
              </Col>
              <Col xs={24} md={6}>
                <Text type="secondary" className="block text-xs uppercase mb-1">
                  Product Category
                </Text>
                <Text strong>{product.category_name || "-"}</Text>
              </Col>
              <Col xs={24} md={6}>
                <Text type="secondary" className="block text-xs uppercase mb-1">
                  Created By
                </Text>
                <Text strong>
                  {product.created_by || "System"} -{" "}
                  {product.created_date
                    ? dayjs(product.created_date).format("DD MMM YYYY")
                    : "-"}
                </Text>
              </Col>
              <Col xs={24} md={6}>
                <Text type="secondary" className="block text-xs uppercase mb-1">
                  Last Updated By
                </Text>
                <Text strong>
                  {product.updated_by || "-"} -{" "}
                  {product.update_date
                    ? dayjs(product.update_date).format("DD MMM YYYY")
                    : "-"}
                </Text>
              </Col>
              <Col xs={24} md={6}>
                <Text type="secondary" className="block text-xs uppercase mb-1">
                  Version
                </Text>
                <Text strong>v1.0</Text> {/* Placeholder */}
              </Col>
              <Col span={24}>
                <Text type="secondary" className="block text-xs uppercase mb-1">
                  Description
                </Text>
                <Text>
                  {product.description || "No description available."}
                </Text>
              </Col>
            </Row>
          </Card>

          {/* Product Metrics */}
          <Card className="shadow-sm rounded-xl" title="Product Metrics">
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="bg-blue-50 rounded-lg">
                  <Statistic
                    title={
                      <span className="text-blue-600">Total Emission</span>
                    }
                    value={product.ed_estimated_pcf}
                    precision={2}
                    suffix="kg CO₂e"
                    valueStyle={{ color: "#1890ff" }}
                    prefix={<CloudOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="bg-green-50 rounded-lg">
                  <Statistic
                    title={
                      <span className="text-green-600">Components Linked</span>
                    }
                    value={0} // Placeholder
                    valueStyle={{ color: "#52c41a" }}
                    prefix={<AppstoreOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="bg-orange-50 rounded-lg">
                  <Statistic
                    title={
                      <span className="text-orange-600">Version Count</span>
                    }
                    value={1} // Placeholder
                    valueStyle={{ color: "#fa8c16" }}
                    prefix={<HistoryOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="bg-purple-50 rounded-lg">
                  <Statistic
                    title={
                      <span className="text-purple-600">PCF Coverage</span>
                    }
                    value={product.pcf_status === "Available" ? 100 : 0} // Logic based on status
                    suffix="%"
                    valueStyle={{ color: "#722ed1" }}
                    prefix={<PieChartOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          <Row gutter={24}>
            {/* Product Attributes */}
            <Col xs={24} lg={8}>
              <Card
                className="shadow-sm rounded-xl h-full"
                title="Product Attributes"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between">
                    <Text type="secondary">Product Code :</Text>
                    <Text strong>{product.product_code}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Category :</Text>
                    <Text strong>{product.category_name}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Sub- Category :</Text>
                    <Text strong>{product.sub_category_name}</Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text type="secondary">Status :</Text>
                    <Tag color="green">Active</Tag> {/* Placeholder */}
                  </div>
                  <div className="flex justify-between items-center">
                    <Text type="secondary">Emission Status :</Text>
                    <Tag color="blue">
                      {product.pcf_status || "Not Available"}
                    </Tag>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      block
                      onClick={() =>
                        navigate(`/product-portfolio/edit/${product.id}`)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDelete}
                    >
                      Archive
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 text-center">
                    Last updated on{" "}
                    {product.update_date
                      ? dayjs(product.update_date).format("DD MMM YYYY, h:mm A")
                      : "-"}
                  </div>
                </div>
              </Card>
            </Col>

            {/* Linked Information */}
            <Col xs={24} lg={16}>
              <Card
                className="shadow-sm rounded-xl h-full"
                title="Linked Information"
              >
                <Title level={5}>Linked BOMs</Title>
                <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mb-2">
                  <div>
                    <Text strong className="block">
                      No BOMs Linked
                    </Text>
                    <Text type="secondary" className="text-xs">
                      Start by linking a BOM in the Edit screen.
                    </Text>
                  </div>
                  {/* <Tag color="green">Active</Tag> */}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "2",
      label: "BOM",
      children: (
        <div className="p-4 text-center text-gray-500">
          BOM Information (Coming Soon)
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
                        dataEntryMethod === "manual"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => setDataEntryMethod("manual")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            dataEntryMethod === "manual"
                              ? "border-green-500"
                              : "border-gray-300"
                          }`}
                        >
                          {dataEntryMethod === "manual" && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          )}
                        </div>
                        <Text strong>Enter data Manually</Text>
                      </div>
                      <Text type="secondary" className="text-sm">
                        Input emission data directly using the form below
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

              {dataEntryMethod === "manual" ? (
                <>
                  {/* Reporting Period and Calculation Method */}
                  <Row gutter={24} className="mb-6">
                    <Col span={8}>
                      <div>
                        <Text strong className="block mb-2">
                          Reporting Period
                        </Text>
                        <Text type="secondary" className="block mb-2 text-sm">
                          From
                        </Text>
                        <DatePicker
                          value={reportingPeriodFrom}
                          onChange={setReportingPeriodFrom}
                          placeholder="mm/dd/yyyy"
                          size="large"
                          className="w-full"
                          format="MM/DD/YYYY"
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <Text strong className="block mb-2">
                          &nbsp;
                        </Text>
                        <Text type="secondary" className="block mb-2 text-sm">
                          To
                        </Text>
                        <DatePicker
                          value={reportingPeriodTo}
                          onChange={setReportingPeriodTo}
                          placeholder="mm/dd/yyyy"
                          size="large"
                          className="w-full"
                          format="MM/DD/YYYY"
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <Text strong className="block mb-2">
                          Calculation Method
                        </Text>
                        <Text type="secondary" className="block mb-2 text-sm">
                          &nbsp;
                        </Text>
                        <Select
                          placeholder="GHG Protocol"
                          size="large"
                          className="w-full"
                        />
                      </div>
                    </Col>
                  </Row>

                  {/* Scope 1 Emissions (Direct) */}
                  <div className="mb-6">
                    <Title level={5}>Scope 1 Emissions (Direct)</Title>
                    <Row gutter={24}>
                      <Col span={8}>
                        <div className="mb-4">
                          <Text strong className="block mb-2">
                            Fuel Combustion
                          </Text>
                          <InputNumber
                            value={fuelCombustionValue}
                            onChange={(value) =>
                              setFuelCombustionValue(value?.toString() || "")
                            }
                            placeholder="0.00"
                            size="large"
                            className="w-full"
                            addonAfter={
                              <Select defaultValue="tCO2e" className="w-24">
                                <Select.Option value="tCO2e">
                                  t CO₂e
                                </Select.Option>
                              </Select>
                            }
                          />
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="mb-4">
                          <Text strong className="block mb-2">
                            Process Emissions
                          </Text>
                          <InputNumber
                            value={processEmissionValue}
                            onChange={(value) =>
                              setProcessEmissionValue(value?.toString() || "")
                            }
                            placeholder="0.00"
                            size="large"
                            className="w-full"
                            addonAfter={
                              <Select defaultValue="tCO2e" className="w-24">
                                <Select.Option value="tCO2e">
                                  t CO₂e
                                </Select.Option>
                              </Select>
                            }
                          />
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="mb-4">
                          <Text strong className="block mb-2">
                            Fugitive Emissions
                          </Text>
                          <InputNumber
                            value={fugitiveEmissionValue}
                            onChange={(value) =>
                              setFugitiveEmissionValue(value?.toString() || "")
                            }
                            placeholder="0.00"
                            size="large"
                            className="w-full"
                            addonAfter={
                              <Select defaultValue="tCO2e" className="w-24">
                                <Select.Option value="tCO2e">
                                  t CO₂e
                                </Select.Option>
                              </Select>
                            }
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Scope 2 Emissions (Indirect) */}
                  <div className="mb-6">
                    <Title level={5}>Scope 2 Emissions (Indirect)</Title>
                    <Row gutter={24}>
                      <Col span={8}>
                        <div className="mb-4">
                          <Text strong className="block mb-2">
                            Electricity (Location-based)
                          </Text>
                          <InputNumber
                            value={electricityLocationValue}
                            onChange={(value) =>
                              setElectricityLocationValue(
                                value?.toString() || ""
                              )
                            }
                            placeholder="0.00"
                            size="large"
                            className="w-full"
                            addonAfter={
                              <Select defaultValue="tCO2e" className="w-24">
                                <Select.Option value="tCO2e">
                                  t CO₂e
                                </Select.Option>
                              </Select>
                            }
                          />
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="mb-4">
                          <Text strong className="block mb-2">
                            Electricity (Market-based)
                          </Text>
                          <InputNumber
                            value={electricityMarketValue}
                            onChange={(value) =>
                              setElectricityMarketValue(value?.toString() || "")
                            }
                            placeholder="0.00"
                            size="large"
                            className="w-full"
                            addonAfter={
                              <Select defaultValue="tCO2e" className="w-24">
                                <Select.Option value="tCO2e">
                                  t CO₂e
                                </Select.Option>
                              </Select>
                            }
                          />
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="mb-4">
                          <Text strong className="block mb-2">
                            Steam/Heat/Cooling
                          </Text>
                          <InputNumber
                            value={steamHeatCoolingValue}
                            onChange={(value) =>
                              setSteamHeatCoolingValue(value?.toString() || "")
                            }
                            placeholder="0.00"
                            size="large"
                            className="w-full"
                            addonAfter={
                              <Select defaultValue="tCO2e" className="w-24">
                                <Select.Option value="tCO2e">
                                  t CO₂e
                                </Select.Option>
                              </Select>
                            }
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Supporting Documentation */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <Title level={5} style={{ margin: 0 }}>
                        Supporting Documentation
                      </Title>
                      {/* Original: <Button type="link" className="text-green-600">+ Add Document</Button> */}
                      <Button type="link" className="text-green-600">
                        + Add Document
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {supportingDocs && supportingDocs.length > 0 ? (
                        supportingDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-green-500" />
                              <div>
                                <Text strong>{doc.document}</Text>
                                <Text
                                  type="secondary"
                                  className="block text-xs"
                                >
                                  Uploaded on{" "}
                                  {doc.created_date
                                    ? dayjs(doc.created_date).format(
                                        "DD MMM YYYY"
                                      )
                                    : "-"}
                                </Text>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {/* Original: Button type="text" icon={<EyeOutlined />} without API backed view */}
                              <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() =>
                                  message.info(
                                    "View for supporting documents is not implemented yet"
                                  )
                                }
                              />
                              {/* Original: Button type="text" icon={<DownloadOutlined />} without API backed download */}
                              <Button
                                type="text"
                                icon={<DownloadOutlined />}
                                onClick={() =>
                                  message.info(
                                    "Download for supporting documents is not implemented yet"
                                  )
                                }
                              />
                              {/* Original: Button type="text" danger icon={<DeleteOutlined />} without API call */}
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  handleDeleteSupportingDocument(doc.id)
                                }
                                loading={ownEmissionLoading}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <Text type="secondary">
                            No supporting documents available for this emission
                            record.
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="mb-6">
                    <Title level={5}>Additional Notes</Title>
                    <TextArea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      rows={3}
                      placeholder="Add any relevant information about the emission calculations..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4">
                    <Button
                      size="large"
                      icon={<ReloadOutlined />}
                      onClick={handleResetForm}
                      disabled={ownEmissionLoading}
                    >
                      Reset
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      icon={<SaveOutlined />}
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleSaveOwnEmission}
                      loading={ownEmissionLoading}
                    >
                      Save
                    </Button>
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
                                    calculateTotalEmissions().scope1
                                  ) /
                                    parseFloat(
                                      calculateTotalEmissions().total
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
                                    calculateTotalEmissions().scope2
                                  ) /
                                    parseFloat(
                                      calculateTotalEmissions().total
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
        <div className="p-4 text-center text-gray-500">
          PCF Calculation (Coming Soon)
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
            className="p-0 text-gray-600 hover:text-blue-600 mb-4"
          >
            Product Portfolio
          </Button>
          <Card className="shadow-sm rounded-xl border-0">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {product.product_name}
                </Title>
                <Text type="secondary">{product.product_code}</Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs and Content */}
        <Tabs defaultActiveKey="1" items={items} className="custom-tabs" />
      </div>
    </div>
  );
};

export default ProductView;
