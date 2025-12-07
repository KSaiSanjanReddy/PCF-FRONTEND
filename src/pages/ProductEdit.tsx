import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  message,
  Spin,
  Divider,
  Tag,
} from "antd";
import { LeftOutlined, SaveOutlined, ReloadOutlined, DeleteOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { Package } from "lucide-react";
import productService from "../lib/productService";
import type {
  ProductCategory,
  ProductSubCategory,
  ManufacturingProcess,
  LifeCycleStage,
  Product,
} from "../lib/productService";
import dayjs from "dayjs";
import { documentMasterService } from "../lib/documentMasterService";
import type { DocumentItem as DocumentItemType } from "../lib/documentMasterService";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  // Dropdown Data
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ProductSubCategory[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<ProductSubCategory[]>([]);
  const [manufacturingProcesses, setManufacturingProcesses] = useState<ManufacturingProcess[]>([]);
  const [lifeCycleStages, setLifeCycleStages] = useState<LifeCycleStage[]>([]);
  const [productDocuments, setProductDocuments] = useState<DocumentItemType[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setInitialLoading(true);
      const [cats, subCats, mfgProcs, lcs] = await Promise.all([
        productService.getProductCategories(),
        productService.getProductSubCategories(),
        productService.getManufacturingProcesses(),
        productService.getLifeCycleStages(),
      ]);

      if (cats.status) setCategories(cats.data.rows || []);
      if (subCats.status) setSubCategories(subCats.data.rows || []);
      if (mfgProcs.status) setManufacturingProcesses(mfgProcs.data.rows || []);
      if (lcs.status) setLifeCycleStages(lcs.data.rows || []);

      if (id) {
        const productRes = await productService.getProductById(id);
        if (productRes.status && productRes.data) {
          const prod = productRes.data;
          setProduct(prod);
          
          // Filter subcategories initially
          if (subCats.status && prod.product_category_id) {
             const filtered = (subCats.data.rows || []).filter((sc: ProductSubCategory) => sc.product_category_id === prod.product_category_id);
             setFilteredSubCategories(filtered);
          }

          form.setFieldsValue({
            ...prod,
            // Original: ts_weight_kg, ed_estimated_pcf, ed_recyclability, ed_renewable_energy were directly assigned without explicit Number conversion comment
            // Ensure numbers are set correctly
            ts_weight_kg: Number(prod.ts_weight_kg),
            ed_estimated_pcf: Number(prod.ed_estimated_pcf),
            ed_recyclability: Number(prod.ed_recyclability),
            ed_renewable_energy: Number(prod.ed_renewable_energy),
          });

          if (prod.product_code) {
            await fetchProductDocuments(prod.product_code);
          }
        } else {
            message.error("Failed to load product details");
            navigate("/product-portfolio/all-products");
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      message.error("Failed to load data");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchProductDocuments = async (productCode: string) => {
    try {
      // Original: Documents card in sidebar was using static mock data without API integration
      setDocumentsLoading(true);
      const result = await documentMasterService.getDocumentList(1, 50);
      if (result.success) {
        const filteredDocs = (result.data || []).filter(
          (doc: DocumentItemType) => doc.product_code === productCode
        );
        setProductDocuments(filteredDocs);
      } else {
        message.error(result.message || "Failed to fetch product documents");
      }
    } catch (error) {
      console.error("Error fetching product documents:", error);
      message.error("Failed to fetch product documents");
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const filtered = subCategories.filter(sc => sc.product_category_id === categoryId);
    setFilteredSubCategories(filtered);
    form.setFieldsValue({ product_sub_category_id: undefined });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const productData = {
        ...values,
        id: id, // Important for update
        ts_weight_kg: Number(values.ts_weight_kg),
        ed_estimated_pcf: Number(values.ed_estimated_pcf),
        ed_recyclability: Number(values.ed_recyclability),
        ed_renewable_energy: Number(values.ed_renewable_energy),
      };

      const result = await productService.updateProduct(productData);

      if (result.status) {
        message.success(result.message || "Product updated successfully");
        navigate(`/product-portfolio/view/${id}`);
      } else {
        message.error(result.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      // message.error("An error occurred while updating the product");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <Spin size="large" />
        </div>
      );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 8,
          colorPrimary: "#1890ff",
        },
        components: {
          Card: { borderRadius: 12 },
          Button: { borderRadius: 8 },
          Select: { borderRadius: 8 },
          Input: { borderRadius: 8 },
          InputNumber: { borderRadius: 8 },
        },
      }}
    >
      <div className="bg-gray-50 p-6 min-h-screen w-full">
        <Spin spinning={loading}>
          <Space direction="vertical" size={16} className="w-full mx-auto">
            {/* Header */}
            <div className="mb-4">
                <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => navigate(`/product-portfolio/view/${id}`)}
                className="p-0 text-gray-600 hover:text-blue-600 mb-2"
                >
                Back to Product Overview
                </Button>
                
                <Card className="shadow-sm border-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-600 p-3 rounded-xl">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <Title level={3} style={{ margin: 0 }}>
                            Edit Product
                            </Title>
                            <Text type="secondary">
                            Update Product Information and attributes
                            </Text>
                        </div>
                    </div>
                </Card>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
            >
                <Row gutter={24}>
                    {/* Main Content */}
                    <Col xs={24} lg={16}>
                        <Space direction="vertical" size={24} className="w-full">
                            {/* Basic Information */}
                            <Card className="shadow-sm" title="Basic Information">
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Product Name"
                                            name="product_name"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <Input size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Product Code"
                                            name="product_code"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <Input size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Category"
                                            name="product_category_id"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <Select
                                                size="large"
                                                onChange={handleCategoryChange}
                                                options={categories.map(c => ({ label: c.name, value: c.id }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Sub-Category"
                                            name="product_sub_category_id"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <Select
                                                size="large"
                                                disabled={!form.getFieldValue("product_category_id")}
                                                options={filteredSubCategories.map(sc => ({ label: sc.name, value: sc.id }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item
                                            label="Description"
                                            name="description"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <TextArea rows={3} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Technical Specifications */}
                            <Card className="shadow-sm" title="Technical Specifications">
                                <Row gutter={24}>
                                    <Col xs={24} md={8}>
                                        <Form.Item
                                            label="Weight (kg)"
                                            name="ts_weight_kg"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <InputNumber className="w-full" size="large" min={0} step={0.01} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item
                                            label="Dimensions (L×W×H)"
                                            name="ts_dimensions"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <Input size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item
                                            label="Material"
                                            name="ts_material"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <Input size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Manufacturing Process"
                                            name="ts_manufacturing_process_id"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <Select
                                                size="large"
                                                options={manufacturingProcesses.map(mp => ({ label: mp.name, value: mp.id }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Supplier"
                                            name="ts_supplier"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <Input size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Part Number"
                                            name="ts_part_number"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <Input size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Environmental Data */}
                            <Card className="shadow-sm" title="Environmental Data">
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Carbon Footprint (kg CO₂e)"
                                            name="ed_estimated_pcf"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <InputNumber className="w-full" size="large" min={0} step={0.01} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Recyclability (%)"
                                            name="ed_recyclability"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <InputNumber className="w-full" size="large" min={0} max={100} step={0.1} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Renewable Energy (%)"
                                            name="ed_renewable_energy"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <InputNumber className="w-full" size="large" min={0} max={100} step={0.1} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Life Cycle Stage"
                                            name="ed_life_cycle_stage_id"
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <Select
                                                size="large"
                                                options={lifeCycleStages.map(lcs => ({ label: lcs.name, value: lcs.id }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Space>
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} lg={8}>
                        <Space direction="vertical" size={24} className="w-full">
                            {/* Status & Settings */}
                            <Card className="shadow-sm" title="Status & Settings">
                                <Form.Item label="Product Status" className="mb-4">
                                    <Select defaultValue="Active" size="large">
                                        <Select.Option value="Active">Active</Select.Option>
                                        <Select.Option value="Inactive">Inactive</Select.Option>
                                        <Select.Option value="Draft">Draft</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item label="Emission Status" className="mb-4">
                                    <Select defaultValue="Approved" size="large">
                                        <Select.Option value="Approved">Approved</Select.Option>
                                        <Select.Option value="Pending">Pending</Select.Option>
                                        <Select.Option value="Rejected">Rejected</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item label="Version" className="mb-0">
                                    <div className="flex gap-2">
                                        <Input defaultValue="v2.3" size="large" />
                                        <Button icon={<ReloadOutlined />} size="large" />
                                    </div>
                                </Form.Item>
                            </Card>

                            {/* Documents */}
                            <Card className="shadow-sm" title="Documents">
                                {/* Original: Static drag & drop UI and hardcoded document row without API integration */}
                                <div className="mb-3 flex justify-between items-center">
                                    <Text type="secondary">Documents linked to this product</Text>
                                    <Button
                                        type="link"
                                        icon={<CloudUploadOutlined />}
                                        onClick={() => navigate("/document-master/new")}
                                    >
                                        Upload Document
                                    </Button>
                                </div>
                                <Spin spinning={documentsLoading}>
                                    {productDocuments && productDocuments.length > 0 ? (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {productDocuments.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="bg-gray-50 p-3 rounded flex justify-between items-center"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-green-500" />
                                                        <span className="text-sm">
                                                            {doc.document_title} ({doc.version})
                                                        </span>
                                                    </div>
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        onClick={() =>
                                                            message.info("Open document details from Document Master")
                                                        }
                                                    >
                                                        View
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-3 rounded text-center">
                                            <Text type="secondary" className="text-sm">
                                                No documents linked to this product yet.
                                            </Text>
                                        </div>
                                    )}
                                </Spin>
                            </Card>

                            {/* Audit Information */}
                            <Card className="shadow-sm" title="Audit Information">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <Text type="secondary">Created By:</Text>
                                        <Text>{product?.created_by || "System"}</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text type="secondary">Created Date:</Text>
                                        <Text>{product?.created_date ? dayjs(product.created_date).format("DD MMM YYYY") : "-"}</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text type="secondary">Last Modified:</Text>
                                        <Text>{product?.update_date ? dayjs(product.update_date).format("DD MMM YYYY") : "-"}</Text>
                                    </div>
                                </div>
                            </Card>
                        </Space>
                    </Col>
                </Row>

                <div className="flex justify-end gap-4 mt-8 pb-8">
                    <Button size="large" onClick={() => navigate(`/product-portfolio/view/${id}`)}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Save Changes
                    </Button>
                </div>
            </Form>
          </Space>
        </Spin>
      </div>
    </ConfigProvider>
  );
};

// Helper component for file icon
const FileText = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

export default ProductEdit;
