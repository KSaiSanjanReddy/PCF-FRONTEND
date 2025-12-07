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
} from "antd";
import { LeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import productService, {
  type ProductCategory,
  type ProductSubCategory,
  type ManufacturingProcess,
  type LifeCycleStage,
} from "../lib/productService";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Dropdown Data
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ProductSubCategory[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<
    ProductSubCategory[]
  >([]);
  const [manufacturingProcesses, setManufacturingProcesses] = useState<
    ManufacturingProcess[]
  >([]);
  const [lifeCycleStages, setLifeCycleStages] = useState<LifeCycleStage[]>([]);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
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
    } catch (error) {
      console.error("Error loading dropdowns:", error);
      message.error("Failed to load dropdown options");
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const filtered = subCategories.filter(
      (sc) => sc.product_category_id === categoryId
    );
    setFilteredSubCategories(filtered);
    form.setFieldsValue({ product_sub_category_id: undefined });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const productData = {
        ...values,
        // Ensure numeric values are numbers
        ts_weight_kg: Number(values.ts_weight_kg),
        ed_estimated_pcf: Number(values.ed_estimated_pcf),
        ed_recyclability: Number(values.ed_recyclability),
        ed_renewable_energy: Number(values.ed_renewable_energy),
      };

      const result = await productService.createProduct(productData);

      if (result.status) {
        message.success(result.message || "Product created successfully");
        navigate("/product-portfolio/all-products");
      } else {
        message.error(result.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      // message.error("An error occurred while creating the product");
    } finally {
      setLoading(false);
    }
  };

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
          <Space direction="vertical" size={16} className="w-full  mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => navigate("/product-portfolio/all-products")}
                className="p-0 text-gray-600 hover:text-blue-600"
              >
                Back to Products
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-2">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Add New Product
                </Title>
                <Text type="secondary">
                  Enter the details of the new product to add it to the
                  portfolio.
                </Text>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                ts_weight_kg: 0,
                ed_estimated_pcf: 0,
                ed_recyclability: 0,
                ed_renewable_energy: 0,
              }}
            >
              <Card className="shadow-sm">
                <Title level={4} className="mb-6 text-gray-800">
                  Product Information
                </Title>
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Product Name"
                      name="product_name"
                      rules={[
                        {
                          required: true,
                          message: "Please enter product name",
                        },
                      ]}
                    >
                      <Input
                        placeholder="e.g. Stainless Steel Bracket"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Product Code"
                      name="product_code"
                      rules={[
                        {
                          required: true,
                          message: "Please enter product code",
                        },
                      ]}
                    >
                      <Input placeholder="e.g. PRD-001" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Category"
                      name="product_category_id"
                      rules={[
                        { required: true, message: "Please select a category" },
                      ]}
                    >
                      <Select
                        placeholder="Select category"
                        size="large"
                        onChange={handleCategoryChange}
                        options={categories.map((c) => ({
                          label: c.name,
                          value: c.id,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Sub Category"
                      name="product_sub_category_id"
                      rules={[
                        {
                          required: true,
                          message: "Please select a sub-category",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select sub-category"
                        size="large"
                        disabled={!form.getFieldValue("product_category_id")}
                        options={filteredSubCategories.map((sc) => ({
                          label: sc.name,
                          value: sc.id,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="Description"
                      name="description"
                      rules={[
                        { required: true, message: "Please enter description" },
                      ]}
                    >
                      <TextArea rows={3} placeholder="Product description..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4} className="mb-6 text-gray-800">
                  Technical Specifications
                </Title>
                <Row gutter={24}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Weight (kg)"
                      name="ts_weight_kg"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber
                        className="w-full"
                        size="large"
                        min={0}
                        step={0.01}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Dimensions"
                      name="ts_dimensions"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="e.g. 10x20x5 cm" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Material"
                      name="ts_material"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="e.g. Steel" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Manufacturing Process"
                      name="ts_manufacturing_process_id"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Select
                        placeholder="Select process"
                        size="large"
                        options={manufacturingProcesses.map((mp) => ({
                          label: mp.name,
                          value: mp.id,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Supplier"
                      name="ts_supplier"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="Supplier Name" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Part Number"
                      name="ts_part_number"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="Supplier Part Number" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4} className="mb-6 text-gray-800">
                  Environmental Data
                </Title>
                <Row gutter={24}>
                  <Col xs={24} md={6}>
                    <Form.Item
                      label="Est. PCF (kg CO2e)"
                      name="ed_estimated_pcf"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber
                        className="w-full"
                        size="large"
                        min={0}
                        step={0.01}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item
                      label="Recyclability (%)"
                      name="ed_recyclability"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber
                        className="w-full"
                        size="large"
                        min={0}
                        max={100}
                        step={0.1}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item
                      label="Renewable Energy (%)"
                      name="ed_renewable_energy"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber
                        className="w-full"
                        size="large"
                        min={0}
                        max={100}
                        step={0.1}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item
                      label="Life Cycle Stage"
                      name="ed_life_cycle_stage_id"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Select
                        placeholder="Select stage"
                        size="large"
                        options={lifeCycleStages.map((lcs) => ({
                          label: lcs.name,
                          value: lcs.id,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <div className="flex justify-end gap-4 mt-8">
                  <Button
                    size="large"
                    onClick={() => navigate("/product-portfolio/all-products")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                  >
                    Create Product
                  </Button>
                </div>
              </Card>
            </Form>
          </Space>
        </Spin>
      </div>
    </ConfigProvider>
  );
};

export default ProductCreate;
