import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Modal,
  Upload,
  message,
  Space,
  Row,
  Col,
  Table,
  Badge,
  Tag,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  FileExcelOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  DownOutlined,
  RightOutlined,
  ShopOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import { listSetup, type SetupItem } from "../../lib/dataSetupService";
import BomTable from "./BomTable";

interface ProductDetailsStepProps {
  initialValues: any;
  onSave: (values: any) => void;
  onBack?: () => void;
}

const { Option } = Select;

const ProductDetailsStep: React.FC<ProductDetailsStepProps> = ({
  initialValues,
  onSave,
  onBack,
}) => {
  const [form] = Form.useForm();
  const [isBomModalVisible, setIsBomModalVisible] = useState(false);
  const [isMappingModalVisible, setIsMappingModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );
  const [pendingBomData, setPendingBomData] = useState<any[]>([]);
  const [bomData, setBomData] = useState<any[]>(initialValues.bomData || []);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [productCategories, setProductCategories] = useState<SetupItem[]>([]);
  const [componentCategories, setComponentCategories] = useState<SetupItem[]>(
    []
  );
  const [componentTypes, setComponentTypes] = useState<SetupItem[]>([]);
  const [manufacturers, setManufacturers] = useState<SetupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [rawCsvData, setRawCsvData] = useState<string>("");

  // Field definitions for mapping
  const fieldDefinitions = [
    { key: "materialNumber", label: "Material Number / MPN", required: false },
    { key: "componentName", label: "Component Name", required: true },
    { key: "quantity", label: "Quantity", required: false },
    {
      key: "productionLocation",
      label: "Production Location",
      required: false,
    },
    { key: "manufacturer", label: "Manufacturer", required: false },
    {
      key: "detailedDescription",
      label: "Detailed Description",
      required: false,
    },
    { key: "weight", label: "Weight (gms) /unit", required: false },
    { key: "totalWeight", label: "Total Weight (gms)", required: false },
    { key: "category", label: "Component Category", required: false },
    { key: "price", label: "Price", required: false },
    { key: "totalPrice", label: "Total Price", required: false },
    { key: "supplierEmail", label: "supplier_email", required: false },
    { key: "supplierName", label: "supplier_name", required: false },
    { key: "supplierNumber", label: "supplier_number", required: false },
  ];

  // Load dropdown data
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        setLoading(true);
        const [productCats, componentCats, compTypes, mfrs] = await Promise.all(
          [
          listSetup("product-category"),
          listSetup("component-category"),
          listSetup("component-type"),
          listSetup("manufacturer"),
        ]);
        setProductCategories(productCats);
        setComponentCategories(componentCats);
        setComponentTypes(compTypes);
        setManufacturers(mfrs);
      } catch (error) {
        console.error("Error loading dropdowns:", error);
        message.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    loadDropdowns();
  }, []);

  // Sync form and BOM data with initialValues when they change
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      if (initialValues.bomData) {
        setBomData(initialValues.bomData);
      }
    }
  }, [initialValues, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave({ ...values, bomData });
    });
  };

  const handleDeleteComponent = (key: string) => {
    setBomData(bomData.filter((item) => item.key !== key));
  };

  const handleBomFieldChange = (key: string, field: string, value: string) => {
    setBomData(
      bomData.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  // Auto-detect column mapping based on header names
  const autoDetectMapping = (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {};

    headers.forEach((header) => {
      const headerLower = header.toLowerCase().trim();

      // Try to match each field
      fieldDefinitions.forEach((field) => {
        const fieldLabelLower = field.label.toLowerCase();
        const fieldKeyLower = field.key.toLowerCase();

        if (
          headerLower.includes(fieldKeyLower) ||
          headerLower === fieldLabelLower ||
          (fieldLabelLower.includes(headerLower) && headerLower.length > 3)
        ) {
          if (!mapping[field.key] || field.required) {
            mapping[field.key] = header;
          }
        }
      });
    });

    return mapping;
  };

  // Parse CSV file using column mapping
  const parseCSV = (text: string, mapping: Record<string, string>): any[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header and one data row");
    }

    // Parse header row
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));

    // Get column index from mapping
    const getColumnIndex = (fieldKey: string): number => {
      const mappedHeader = mapping[fieldKey];
      if (!mappedHeader) return -1;
      return headers.findIndex((h) => h === mappedHeader);
    };

    // Check required fields
    const componentNameIdx = getColumnIndex("componentName");
    if (componentNameIdx === -1) {
      throw new Error('CSV file must have "Component Name" column mapped');
    }

    // Parse data rows
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Handle CSV parsing with quoted fields
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add last value

      if (values.length < headers.length) {
        // Pad with empty strings if needed
        while (values.length < headers.length) {
          values.push("");
        }
      }

      // Extract component name (required)
      const componentName =
        values[componentNameIdx]?.replace(/^"|"$/g, "") || "";
      if (!componentName) continue; // Skip empty rows

      // Helper to get value by field key
      const getValue = (fieldKey: string): string => {
        const idx = getColumnIndex(fieldKey);
        return idx !== -1 ? values[idx]?.replace(/^"|"$/g, "") || "" : "";
      };

      // Extract numeric values
      const weightGrams = parseFloat(getValue("weight") || "0");
      const totalWeightGrams = parseFloat(
        getValue("totalWeight") || weightGrams.toString()
      );
      const price = parseFloat(getValue("price") || "0");
      const totalPrice = parseFloat(getValue("totalPrice") || price.toString());

      data.push({
        key: `bom-${i}-${Date.now()}`,
        materialNumber: getValue("materialNumber"),
        componentName: componentName,
        quantity: getValue("quantity") || "1",
        productionLocation: getValue("productionLocation"),
        manufacturer: getValue("manufacturer"),
        detailedDescription: getValue("detailedDescription"),
        weight: weightGrams.toFixed(2),
        totalWeight: totalWeightGrams.toFixed(2),
        category: getValue("category"),
        price: price.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
        supplierEmail: getValue("supplierEmail"),
        supplierName: getValue("supplierName"),
        supplierNumber: getValue("supplierNumber"),
        emission: "",
        questionerStatus: "Pending",
      });
    }

    return data;
  };

  const handleFileUpload = (file: File) => {
    // Check file type
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isCSV && !isExcel) {
      message.error("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }

    // For now, only CSV is supported. Excel support can be added later with a library like xlsx
    if (!isCSV) {
      message.warning(
        "Excel file support coming soon. Please use CSV format for now."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text || text.trim().length === 0) {
          message.error("File is empty");
          return;
        }

        // Parse headers
        const lines = text.split("\n").filter((line) => line.trim());
        if (lines.length < 2) {
          message.error(
            "CSV file must have at least a header and one data row"
          );
          return;
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/^"|"$/g, ""));

        // Auto-detect mapping
        const autoMapping = autoDetectMapping(headers);

        // Store raw data and show mapping modal
        setRawCsvData(text);
        setCsvHeaders(headers);
        setColumnMapping(autoMapping);
        setIsBomModalVisible(false);
        setIsMappingModalVisible(true);
      } catch (error: any) {
        console.error("CSV reading error:", error);
        message.error(
          `Failed to read file: ${error.message || "Invalid file format"}`
        );
      }
    };

    reader.onerror = () => {
      message.error("Failed to read file");
    };

    reader.readAsText(file, "UTF-8");
  };

  const handleMappingConfirm = () => {
    try {
      // Validate required mapping
      if (!columnMapping.componentName) {
        message.error("Please map 'Component Name' field (required)");
        return;
      }

      // Parse CSV with mapping
      const parsedData = parseCSV(rawCsvData, columnMapping);

      if (parsedData.length === 0) {
        message.warning("No valid data found in the CSV file");
        return;
      }

      // Show review modal
      setPendingBomData(parsedData);
      setIsMappingModalVisible(false);
      setIsReviewModalVisible(true);
    } catch (error: any) {
      console.error("CSV parsing error:", error);
      message.error(
        `Failed to parse CSV: ${error.message || "Invalid file format"}`
      );
    }
  };

  const handleConfirmImport = () => {
    setBomData(pendingBomData);
    setPendingBomData([]);
    setIsReviewModalVisible(false);
    message.success(
      `${pendingBomData.length} components imported successfully`
    );
  };

  const handleAddComponent = () => {
    const newComponent = {
      key: `bom-new-${Date.now()}`,
      materialNumber: "",
      componentName: "",
      quantity: "1",
      productionLocation: "",
      manufacturer: "",
      detailedDescription: "",
      weight: "0.00",
      totalWeight: "0.00",
      category: "",
      price: "0.00",
      totalPrice: "0.00",
      supplierEmail: "",
      supplierName: "",
      supplierNumber: "",
      emission: "",
      questionerStatus: "Pending",
    };
    setBomData([...bomData, newComponent]);
  };

  const toggleRowExpansion = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const handleBomUpload: UploadProps["onChange"] = (info) => {
    const file = info.file.originFileObj;
    if (!file || !(file instanceof File)) return;

    // Handle file reading
    if (info.file.status === "uploading") {
      return;
    }

    if (info.file.status === "done") {
      handleFileUpload(file);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = bomData.reduce(
      (acc, item) => {
        acc.totalWeight += parseFloat(item.weight || "0");
        acc.totalCost += parseFloat(item.totalPrice || item.price || "0");
        acc.totalEmission += parseFloat(item.emission || "0");
        return acc;
      },
      { totalWeight: 0, totalCost: 0, totalEmission: 0 }
    );
    return totals;
  };

  const totals = calculateTotals();




  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card title="Product Details" className="shadow-sm">
        <Form form={form} layout="vertical" initialValues={initialValues}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Product Category *"
                name="productCategory"
                rules={[{ required: true, message: "Select Product Category" }]}
              >
                <Select
                  placeholder="Select Product Category"
                  loading={loading}
                  showSearch
                  filterOption={(input, option) => {
                    const label =
                      typeof option?.label === "string"
                        ? option.label
                        : String(option?.children || "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {productCategories.map((cat) => (
                    <Option key={cat.id || cat.code} value={cat.id || cat.code}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Component Category *"
                name="componentCategory"
                rules={[
                  { required: true, message: "Select Component Category" },
                ]}
              >
                <Select
                  placeholder="Select Component Category"
                  loading={loading}
                  showSearch
                  filterOption={(input, option) => {
                    const label =
                      typeof option?.label === "string"
                        ? option.label
                        : String(option?.children || "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {componentCategories.map((cat) => (
                    <Option key={cat.id || cat.code} value={cat.id || cat.code}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Component Type *"
                name="componentType"
                rules={[{ required: true, message: "Enter Component Type" }]}
              >
                <Select
                  placeholder="Select Component Type"
                  loading={loading}
                  showSearch
                  filterOption={(input, option) => {
                    const label =
                      typeof option?.label === "string"
                        ? option.label
                        : String(option?.children || "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {componentTypes.map((type) => (
                    <Option
                      key={type.id || type.code}
                      value={type.id || type.code}
                    >
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Product Code" name="productCode">
                <Input placeholder="Enter product code" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Manufacture" name="manufacture">
                <Select
                  placeholder="Select Manufacturer"
                  loading={loading}
                  showSearch
                  filterOption={(input, option) => {
                    const label =
                      typeof option?.label === "string"
                        ? option.label
                        : String(option?.children || "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {manufacturers.map((mfr) => (
                    <Option key={mfr.id || mfr.code} value={mfr.id || mfr.code}>
                      {mfr.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Model/Version" name="modelVersion">
                <Input placeholder="Enter model or version" />
              </Form.Item>
            </Col>
          </Row>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ExperimentOutlined className="text-green-600 text-lg" />
                <span className="font-semibold text-base text-gray-800">
                  Product Specifications
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-50 to-green-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider w-1/3">
                      Specification Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider w-1/3">
                      Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-green-800 uppercase tracking-wider w-1/4">
                      Unit
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-green-800 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  <Form.List name="specifications">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-12 text-center bg-gray-50/50"
                            >
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                                <ExperimentOutlined className="text-2xl text-gray-400" />
                              </div>
                              <p className="text-gray-500 mb-4">
                                No specifications added yet
                              </p>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                icon={<PlusOutlined />}
                                className="border-green-500 text-green-600 hover:border-green-600 hover:text-green-700"
                              >
                                Add First Specification
                              </Button>
                            </td>
                          </tr>
                        )}

                        {fields.map(({ key, name, ...restField }, index) => (
                          <tr
                            key={key}
                            className={`group hover:bg-gray-50 transition-colors duration-150 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                            }`}
                          >
                            <td className="px-6 py-4">
                              <Form.Item
                                {...restField}
                                name={[name, "name"]}
                                rules={[
                                  { required: true, message: "Required" },
                                ]}
                                className="!mb-0"
                              >
                                <Input
                                  placeholder="e.g. Voltage"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors placeholder-gray-400"
                                  bordered={false}
                                  style={{ background: "transparent" }}
                                />
                              </Form.Item>
                            </td>
                            <td className="px-6 py-4">
                              <Form.Item
                                {...restField}
                                name={[name, "value"]}
                                rules={[
                                  { required: true, message: "Required" },
                                ]}
                                className="!mb-0"
                              >
                                <Input
                                  placeholder="e.g. 220"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors placeholder-gray-400"
                                  bordered={false}
                                  style={{ background: "transparent" }}
                                />
                              </Form.Item>
                            </td>
                            <td className="px-6 py-4">
                              <Form.Item
                                {...restField}
                                name={[name, "unit"]}
                                className="!mb-0"
                              >
                                <Input
                                  placeholder="e.g. V"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors placeholder-gray-400"
                                  bordered={false}
                                  style={{ background: "transparent" }}
                                />
                              </Form.Item>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => remove(name)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                title="Remove specification"
                              >
                                <DeleteOutlined className="text-lg" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {fields.length > 0 && (
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-dashed border-gray-300">
                            <td colSpan={4} className="px-6 py-3 text-center">
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                icon={<PlusOutlined />}
                                block
                                className="border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600"
                              >
                                Add Another Specification
                              </Button>
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </Form.List>
                </tbody>
              </table>
            </div>
          </div>
        </Form>
      </Card>

      <Card
        title="BOM Details"
        className="shadow-sm"
        extra={
          <Button
            icon={<UploadOutlined />}
            onClick={() => setIsBomModalVisible(true)}
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            ↑ Import BOM
          </Button>
        }
      >
        {/* BOM Table */}

          <BomTable bomData={bomData} />
      </Card>

      <div className="flex justify-end gap-3">
        {onBack && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            className="border-green-500 text-green-600 "
            size="large"
          >
            Back
          </Button>
        )}
        <Button
          type="primary"
          onClick={handleSave}
          icon={<SaveOutlined />}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          size="large"
        >
          Save
        </Button>
      </div>

      {/* Import BOM Modal */}
      <Modal
        title="Import BOM"
        open={isBomModalVisible}
        onCancel={() => setIsBomModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="p-8 text-center">
          <Upload.Dragger
            name="file"
            accept=".csv,.xlsx,.xls"
            showUploadList={false}
            beforeUpload={(file) => {
              // Handle file upload immediately (client-side parsing)
              if (file instanceof File) {
                handleFileUpload(file);
              }
              return false; // Prevent default upload behavior
            }}
          >
            <p className="ant-upload-drag-icon">
              <FileExcelOutlined style={{ fontSize: 48, color: "#52c41a" }} />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for Excel (.xlsx, .xls) and CSV files. Strictly prohibited
              from uploading company data or other banned files.
            </p>
          </Upload.Dragger>
        </div>
      </Modal>

      {/* Column Mapping Modal */}
      <Modal
        title="Map CSV Columns to Data Fields"
        open={isMappingModalVisible}
        onCancel={() => {
          setIsMappingModalVisible(false);
          setRawCsvData("");
          setCsvHeaders([]);
          setColumnMapping({});
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsMappingModalVisible(false);
              setRawCsvData("");
              setCsvHeaders([]);
              setColumnMapping({});
            }}
          >
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleMappingConfirm}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Continue to Review
          </Button>,
        ]}
        width={900}
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Map your CSV columns to the corresponding data fields. Required
            fields are marked with *.
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Table
              dataSource={fieldDefinitions}
              columns={[
                {
                  title: "Data Field",
                  dataIndex: "label",
                  key: "label",
                  width: 200,
                  render: (label: string, record: any) => (
                    <span>
                      {label}
                      {record.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                  ),
                },
                {
                  title: "CSV Column",
                  key: "mapping",
                  width: 300,
                  render: (_, record: any) => (
                    <Select
                      value={columnMapping[record.key] || undefined}
                      placeholder="Select CSV column"
                      onChange={(value) => {
                        setColumnMapping({
                          ...columnMapping,
                          [record.key]: value,
                        });
                      }}
                      style={{ width: "100%" }}
                      showSearch
                      filterOption={(input, option) => {
                        const label =
                          typeof option?.label === "string"
                            ? option.label
                            : String(option?.children || "");
                        return label
                          .toLowerCase()
                          .includes(input.toLowerCase());
                      }}
                    >
                      <Option value="">-- Not Mapped --</Option>
                      {csvHeaders.map((header) => (
                        <Option key={header} value={header}>
                          {header}
                        </Option>
                      ))}
                    </Select>
                  ),
                },
              ]}
              pagination={false}
              rowKey="key"
              size="small"
            />
          </div>
        </div>
      </Modal>

      {/* Review & Confirm Import Modal */}
      <Modal
        title="Review & Confirm Import"
        open={isReviewModalVisible}
        onCancel={() => {
          setIsReviewModalVisible(false);
          setPendingBomData([]);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsReviewModalVisible(false);
              setPendingBomData([]);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="back"
            onClick={() => {
              setIsReviewModalVisible(false);
              setIsMappingModalVisible(true);
            }}
          >
            Back to Mapping
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmImport}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Confirm Import
          </Button>,
        ]}
        width={1400}
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Review the imported data. <strong>{pendingBomData.length}</strong>{" "}
            components found.
          </p>
          <Table
            dataSource={pendingBomData}
            columns={[
              {
                title: "Component Name",
                dataIndex: "componentName",
                key: "componentName",
                width: 150,
                fixed: "left",
              },
              {
                title: "Material Number",
                dataIndex: "materialNumber",
                key: "materialNumber",
                width: 120,
              },
              {
                title: "Quantity",
                dataIndex: "quantity",
                key: "quantity",
                width: 80,
              },
              {
                title: "Production Location",
                dataIndex: "productionLocation",
                key: "productionLocation",
                width: 120,
              },
              {
                title: "Manufacturer",
                dataIndex: "manufacturer",
                key: "manufacturer",
                width: 120,
              },
              {
                title: "Weight (g)",
                dataIndex: "weight",
                key: "weight",
                width: 100,
              },
              {
                title: "Total Weight (g)",
                dataIndex: "totalWeight",
                key: "totalWeight",
                width: 120,
              },
              {
                title: "Category",
                dataIndex: "category",
                key: "category",
                width: 120,
              },
              {
                title: "Price",
                dataIndex: "price",
                key: "price",
                width: 100,
                render: (price) => `₹ ${price || "0.00"}`,
              },
              {
                title: "Total Price",
                dataIndex: "totalPrice",
                key: "totalPrice",
                width: 100,
                render: (price) => `₹ ${price || "0.00"}`,
              },
              {
                title: "Supplier Name",
                dataIndex: "supplierName",
                key: "supplierName",
                width: 150,
              },
              {
                title: "Supplier Email",
                dataIndex: "supplierEmail",
                key: "supplierEmail",
                width: 150,
              },
              {
                title: "Supplier Number",
                dataIndex: "supplierNumber",
                key: "supplierNumber",
                width: 120,
              },
              {
                title: "Description",
                dataIndex: "detailedDescription",
                key: "detailedDescription",
                width: 200,
                ellipsis: true,
                render: (text: string) => (
                  <span title={text}>{text || "-"}</span>
                ),
              },
            ]}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1500, y: 400 }}
            rowKey="key"
            size="small"
          />
        </div>
      </Modal>
    </Space>
  );
};

export default ProductDetailsStep;
