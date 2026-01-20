import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Space,
  Row,
  Col,
  message,
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
  Upload as UploadIcon,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { documentMasterService } from "../lib/documentMasterService";
import type { CategoryItem, TagItem } from "../lib/documentMasterService";

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
            if (doc.document && doc.document.length > 0) {
              setFileList(
                doc.document.map((fileName: string, index: number) => ({
                  uid: `-${index}`,
                  name: fileName,
                  status: "done",
                  size: 1024 * 1024,
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
        file_size: (fileList[0].size / 1024 / 1024).toFixed(2) + " MB",
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
      setFileList([file]);
      return false;
    },
    fileList,
    showUploadList: false,
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Spin size="large" tip="Loading document details..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/document-master")}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getPageTitle()}
                </h1>
                <p className="text-gray-500">{getPageSubtitle()}</p>
              </div>
            </div>
            <Space>
              <Button
                onClick={() => navigate("/document-master")}
                size="large"
              >
                {isView ? "Back" : "Cancel"}
              </Button>
              {!isView && (
                <>
                  {isNew && (
                    <Button
                      icon={<Plus size={16} />}
                      onClick={() => handleSave(true)}
                      loading={loading}
                      size="large"
                    >
                      Save & Add Another
                    </Button>
                  )}
                  <Button
                    type="primary"
                    icon={<Save size={16} />}
                    onClick={() => handleSave(false)}
                    loading={loading}
                    size="large"
                    className="shadow-lg shadow-green-600/20"
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
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Upload</h3>
                <Form.Item required tooltip="Upload the document file">
                  <Dragger
                    {...uploadProps}
                    className={`!border-2 !border-dashed !rounded-xl ${
                      isView
                        ? "!bg-gray-50 !border-gray-200 !cursor-not-allowed"
                        : "!bg-green-50/30 !border-green-200 hover:!border-green-400 !cursor-pointer"
                    }`}
                    style={{ padding: "48px 0" }}
                    disabled={isView}
                  >
                    <p className="ant-upload-drag-icon text-center flex items-center justify-center">
                      <UploadIcon size={48} className={isView ? "text-gray-300" : "text-green-500"} strokeWidth={1.5} />
                    </p>
                    <p className="ant-upload-text text-base font-medium text-gray-700">
                      {isView ? "Document File" : "Click or drag file to upload"}
                    </p>
                    {!isView && (
                      <p className="ant-upload-hint text-gray-500 px-6">
                        Support for single or bulk upload. PDF, DOC, DOCX formats accepted.
                      </p>
                    )}
                  </Dragger>
                </Form.Item>

                {fileList.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between">
                    <Space>
                      <div className="p-2 bg-white rounded-lg">
                        <FileText size={24} className="text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 block">{fileList[0].name}</span>
                        <span className="text-xs text-gray-500">{(fileList[0].size / 1024).toFixed(2)} KB</span>
                      </div>
                    </Space>
                    {!isView && (
                      <Button type="text" icon={<X size={16} />} onClick={() => setFileList([])} danger />
                    )}
                  </div>
                )}
              </div>
            </Col>

            {/* Right Column - Form Details */}
            <Col xs={24} lg={16}>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Document Details</h3>
                  {!isView && (
                    <Button
                      type="link"
                      icon={<RotateCcw size={14} />}
                      onClick={() => form.resetFields()}
                      className="text-gray-500 hover:text-green-600"
                    >
                      Reset Form
                    </Button>
                  )}
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="document_type"
                      label={<span className="text-gray-700 font-medium">Document Type</span>}
                      rules={[{ required: true, message: "Please select document type" }]}
                    >
                      <Select placeholder="Select type" size="large" className="w-full">
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
                      label={<span className="text-gray-700 font-medium">Category</span>}
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
                      label={<span className="text-gray-700 font-medium">Product Code</span>}
                      rules={[{ required: true, message: "Please enter product code" }]}
                    >
                      <Input placeholder="e.g. PRD-001" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="version"
                      label={<span className="text-gray-700 font-medium">Version</span>}
                      rules={[{ required: true, message: "Please enter version" }]}
                    >
                      <Input placeholder="e.g. v1.0" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="document_title"
                  label={<span className="text-gray-700 font-medium">Document Title</span>}
                  rules={[{ required: true, message: "Please enter document title" }]}
                >
                  <Input placeholder="Enter document title" size="large" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={<span className="text-gray-700 font-medium">Description</span>}
                  rules={[{ required: true, message: "Please enter description" }]}
                >
                  <TextArea rows={4} placeholder="Enter document description" showCount maxLength={500} />
                </Form.Item>

                <div className="border-t border-gray-100 my-6"></div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="tags"
                      label={<span className="text-gray-700 font-medium">Tags</span>}
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
                      label={<span className="text-gray-700 font-medium">Access Level</span>}
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
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default DocumentMasterCreate;
