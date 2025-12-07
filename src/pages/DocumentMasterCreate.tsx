import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Space,
  Typography,
  Row,
  Col,
  message,
  Breadcrumb,
  Divider,
  Spin,
} from "antd";
import {
  Inbox,
  ArrowLeft,
  Save,
  FileText,
  X,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { documentMasterService } from "../lib/documentMasterService";
import type { CategoryItem, TagItem } from "../lib/documentMasterService";

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;
const { TextArea } = Input;

const DocumentMasterCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  const isEdit = location.pathname.includes("/edit");
  const isView = location.pathname.includes("/view");
  const isNew = !isEdit && !isView;

  useEffect(() => {
    const fetchData = async () => {
      const [categoryList, tagList] = await Promise.all([
        documentMasterService.getCategoryList(),
        documentMasterService.getTagList(),
      ]);
      setCategories(categoryList);
      setTags(tagList);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDocument = async () => {
      if (id) {
        setFetching(true);
        try {
          const result = await documentMasterService.getDocumentById(id);
          if (result.success) {
            const doc = result.data;
            form.setFieldsValue({
              document_type: doc.document_type,
              category: doc.category,
              product_code: doc.product_code,
              version: doc.version,
              document_title: doc.document_title,
              description: doc.description,
              tags: doc.tags,
              access_level: doc.access_level,
            });
            // Mock file list for now as API returns file names
            if (doc.document && doc.document.length > 0) {
              setFileList(
                doc.document.map((fileName, index) => ({
                  uid: `-${index}`,
                  name: fileName,
                  status: "done",
                  size: 1024 * 1024, // Mock size
                }))
              );
            }
          } else {
            message.error(result.message);
            navigate("/document-master");
          }
        } catch (error) {
          message.error("Failed to fetch document details");
          navigate("/document-master");
        } finally {
          setFetching(false);
        }
      }
    };
    fetchDocument();
  }, [id, form, navigate]);

  const handleSave = async (addAnother: boolean = false) => {
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        message.error("Please upload a document");
        return;
      }

      setLoading(true);
      
      const payload = {
        ...values,
        document: fileList.map((file) => file.name),
        file_size: (fileList[0].size / 1024 / 1024).toFixed(2) + " MB", // Mock size
      };

      let result;
      if (isEdit && id) {
        result = await documentMasterService.updateDocument({ ...payload, id });
      } else {
        result = await documentMasterService.addDocument(payload);
      }

      if (result.success) {
        message.success(`Document ${isEdit ? "updated" : "added"} successfully`);
        if (addAnother && isNew) {
          form.resetFields();
          setFileList([]);
          form.setFieldsValue({ access_level: "Public" });
        } else {
          navigate("/document-master");
        }
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error("Validation failed:", error);
      message.error("Please fill in all required fields");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: (file: any) => {
      if (isView) return false;
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: any) => {
      if (isView) return false;
      setFileList([file]); // Allow only single file for now
      return false; // Prevent auto upload
    },
    fileList,
    showUploadList: false, // Custom render
    disabled: isView,
  };

  const getPageTitle = () => {
    if (isView) return "View Document";
    if (isEdit) return "Edit Document";
    return "Upload New Document";
  };

  const getPageSubtitle = () => {
    if (isView) return "View document details";
    if (isEdit) return "Update document details";
    return "Add a new document to the system";
  };

  if (fetching) {
    return (
      <Layout style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Loading document details..." />
      </Layout>
    );
  }

  return (
    <Layout style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Breadcrumb & Header */}
        <div>
          <Breadcrumb
            items={[
              { title: <a onClick={() => navigate("/document-master")}>Document Master</a> },
              { title: getPageTitle() },
            ]}
            style={{ marginBottom: 16 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Space>
              {/* <Button icon={<ArrowLeft size={16} />} onClick={() => navigate("/document-master")} /> */}
              <div>
                <Title level={2} style={{ margin: 0 }}>{getPageTitle()}</Title>
                <Text type="secondary">{getPageSubtitle()}</Text>
              </div>
            </Space>
            <Space>
              <Button onClick={() => navigate("/document-master")}>{isView ? "Back" : "Cancel"}</Button>
              {!isView && (
                <>
                  {isNew && (
                    <Button 
                      icon={<Plus size={16} />} 
                      onClick={() => handleSave(true)} 
                      loading={loading}
                    >
                      Save & Add Another
                    </Button>
                  )}
                  <Button 
                    type="primary" 
                    icon={<Save size={16} />} 
                    onClick={() => handleSave(false)} 
                    loading={loading}
                  >
                    {isEdit ? "Update Document" : "Save Document"}
                  </Button>
                </>
              )}
            </Space>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ access_level: "Public" }}
          disabled={isView}
        >
          <Row gutter={24}>
            {/* Left Column - Upload Area */}
            <Col xs={24} lg={8}>
              <Card title="Document Upload" bordered={false} style={{ height: "100%" }}>
                <Form.Item required tooltip="Upload the document file">
                  <Dragger 
                    {...uploadProps} 
                    style={{ 
                      padding: "48px 0", 
                      background: isView ? "#f5f5f5" : "#fafafa", 
                      border: "2px dashed #d9d9d9",
                      borderRadius: "8px",
                      cursor: isView ? "not-allowed" : "pointer"
                    }}
                    disabled={isView}
                  >
                    <p className="ant-upload-drag-icon text-center flex items-center justify-center">
                      <Inbox size={64} color={isView ? "#d9d9d9" : "#1890ff"} strokeWidth={1.5} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
                      {isView ? "Document File" : "Click or drag file to this area to upload"}
                    </p>
                    {!isView && (
                      <p className="ant-upload-hint" style={{ padding: "0 24px" }}>
                        Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                        banned files.
                      </p>
                    )}
                  </Dragger>
                </Form.Item>
                
                {fileList.length > 0 && (
                  <div style={{ 
                    marginTop: 24, 
                    padding: 16, 
                    background: "#e6f7ff", 
                    borderRadius: 8, 
                    border: "1px solid #91d5ff",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between" 
                  }}>
                    <Space>
                      <div style={{ padding: 8, background: "#fff", borderRadius: 4 }}>
                        <FileText size={24} color="#1890ff" />
                      </div>
                      <div>
                        <Text strong style={{ display: "block" }}>{fileList[0].name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{(fileList[0].size / 1024).toFixed(2)} KB</Text>
                      </div>
                    </Space>
                    {!isView && (
                      <Button type="text" icon={<X size={16} />} onClick={() => setFileList([])} danger />
                    )}
                  </div>
                )}
              </Card>
            </Col>

            {/* Right Column - Form Details */}
            <Col xs={24} lg={16}>
              <Card 
                title={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Document Details</span>
                    {!isView && <Button type="link" icon={<RotateCcw size={14} />} onClick={() => form.resetFields()}>Reset Form</Button>}
                  </div>
                } 
                bordered={false}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="document_type"
                      label="Document Type"
                      rules={[{ required: true, message: "Please select document type" }]}
                    >
                      <Select placeholder="Select type" size="large">
                        <Option value="Manual">Manual</Option>
                        <Option value="Specification">Specification</Option>
                        <Option value="Report">Report</Option>
                        <Option value="Certificate">Certificate</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="category"
                      label="Category"
                      rules={[{ required: true, message: "Please select category" }]}
                    >
                      <Select placeholder="Select category" loading={categories.length === 0} size="large">
                        {categories.map((cat) => (
                          <Option key={cat.id} value={cat.id}>
                            {cat.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="product_code"
                      label="Product Code"
                      rules={[{ required: true, message: "Please enter product code" }]}
                    >
                      <Input placeholder="e.g. PRD-001" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="version"
                      label="Version"
                      rules={[{ required: true, message: "Please enter version" }]}
                    >
                      <Input placeholder="e.g. v1.0" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="document_title"
                  label="Document Title"
                  rules={[{ required: true, message: "Please enter document title" }]}
                >
                  <Input placeholder="Enter document title" size="large" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: "Please enter description" }]}
                >
                  <TextArea rows={4} placeholder="Enter document description" showCount maxLength={500} />
                </Form.Item>

                <Divider />

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="tags"
                      label="Tags"
                      rules={[{ required: true, message: "Please select tags" }]}
                    >
                      <Select mode="multiple" placeholder="Select tags" loading={tags.length === 0} size="large">
                        {tags.map((tag) => (
                          <Option key={tag.id} value={tag.id}>
                            {tag.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="access_level"
                      label="Access Level"
                      rules={[{ required: true, message: "Please select access level" }]}
                    >
                      <Select placeholder="Select access level" size="large">
                        <Option value="Public">Public</Option>
                        <Option value="Private">Private</Option>
                        <Option value="Restricted">Restricted</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Form>
      </Space>
    </Layout>
  );
};

export default DocumentMasterCreate;
