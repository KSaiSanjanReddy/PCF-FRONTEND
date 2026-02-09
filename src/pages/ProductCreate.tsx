import React, { useState, useEffect } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  message,
  Spin,
} from "antd";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft, Save } from "lucide-react";
import productService, {
  type ProductCategory,
  type ProductSubCategory,
  type ManufacturingProcess,
  type LifeCycleStage,
} from "../lib/productService";
import { usePermissions } from "../contexts/PermissionContext";

const { TextArea } = Input;

const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const { canCreate } = usePermissions();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Redirect if user doesn't have create permission
  useEffect(() => {
    if (!canCreate("Product Portfolio")) {
      message.error("You don't have permission to create products");
      navigate("/product-portfolio/all-products");
    }
  }, [canCreate, navigate]);

  // Dropdown Data
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ProductSubCategory[]>([]);
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

      // API returns data as array directly, not data.rows
      if (cats.status) setCategories(Array.isArray(cats.data) ? cats.data : cats.data?.rows || []);
      if (subCats.status) setSubCategories(Array.isArray(subCats.data) ? subCats.data : subCats.data?.rows || []);
      if (mfgProcs.status) setManufacturingProcesses(Array.isArray(mfgProcs.data) ? mfgProcs.data : mfgProcs.data?.rows || []);
      if (lcs.status) setLifeCycleStages(Array.isArray(lcs.data) ? lcs.data : lcs.data?.rows || []);
    } catch (error) {
      console.error("Error loading dropdowns:", error);
      message.error("Failed to load dropdown options");
    }
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
      message.error("An error occurred while creating the product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Spin spinning={loading}>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/product-portfolio/all-products")}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                  <p className="text-gray-500">Enter the details of the new product to add it to the portfolio</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/product-portfolio/all-products")}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 shadow-lg shadow-green-600/20 transition-all"
                >
                  <Save size={18} />
                  <span>Create Product</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Section */}
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
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  Product Information
                </h3>
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
                      label="Category"
                      name="product_category_id"
                      rules={[
                        { required: true, message: "Please select a category" },
                      ]}
                    >
                      <Select
                        placeholder="Select category"
                        size="large"
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
                        options={subCategories.map((sc) => ({
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

                <div className="border-t border-gray-100 my-6"></div>

                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  Technical Specifications
                </h3>
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
                  <Col xs={24} md={8}>
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
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Supplier"
                      name="ts_supplier"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="Supplier Name" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Part Number"
                      name="ts_part_number"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input placeholder="Supplier Part Number" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <div className="border-t border-gray-100 my-6"></div>

                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-amber-600" />
                  </div>
                  Environmental Data
                </h3>
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
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Product Status (Optional)"
                      name="product_status"
                    >
                      <Select size="large" placeholder="Select status" allowClear>
                        <Select.Option value="">No Status</Select.Option>
                        <Select.Option value="Active">Active</Select.Option>
                        <Select.Option value="Inactive">Inactive</Select.Option>
                        <Select.Option value="Draft">Draft</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

              </div>
            </Form>
          </div>
        </Spin>
      </div>
  );
};

export default ProductCreate;
