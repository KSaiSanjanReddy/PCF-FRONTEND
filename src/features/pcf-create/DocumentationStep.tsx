import React, { useState } from 'react';
import { Card, Upload, Button, List, Typography, Space, message } from 'antd';
import { UploadOutlined, FilePdfOutlined, FileImageOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import pcfService from '../../lib/pcfService';

interface DocumentationStepProps {
  initialValues: any;
  onSave: (values: any) => void;
}

// Extended file type to store the key from upload response
interface ExtendedUploadFile extends UploadFile {
  fileKey?: string;
}

const { Text } = Typography;

const DocumentationStep: React.FC<DocumentationStepProps> = ({ initialValues, onSave }) => {
  const [fileList, setFileList] = useState<ExtendedUploadFile[]>(initialValues.documents || []);
  const [uploading, setUploading] = useState(false);

  // Custom upload handler using pcfService
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;

    setUploading(true);
    onProgress?.({ percent: 30 });

    try {
      const result = await pcfService.uploadBOMFile(file);

      if (result.success && result.url && result.key) {
        onProgress?.({ percent: 100 });
        onSuccess?.({ url: result.url, key: result.key }, file);
        message.success(`${file.name} uploaded successfully`);
      } else {
        onError?.(new Error(result.message || 'Upload failed'));
        message.error(`${file.name} upload failed: ${result.message}`);
      }
    } catch (error: any) {
      onError?.(error);
      message.error(`${file.name} upload failed`);
    } finally {
      setUploading(false);
    }
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList] as ExtendedUploadFile[];

    // Limit to 10 files
    newFileList = newFileList.slice(-10);

    // Read from response and store url/key
    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
        file.fileKey = file.response.key;
      }
      return file;
    });

    setFileList(newFileList);
  };

  const handleSave = () => {
    // Only save successfully uploaded files with their keys
    const uploadedDocs = fileList
      .filter(f => f.status === 'done' && (f.fileKey || f.url))
      .map(f => ({
        uid: f.uid,
        name: f.name,
        url: f.url,
        fileKey: f.fileKey,
        type: f.type,
        status: f.status,
      }));
    onSave({ documents: uploadedDocs });
  };

  const uploadProps: UploadProps = {
    customRequest: customUpload,
    onChange: handleChange,
    multiple: true,
    accept: '.pdf,.png,.jpg,.jpeg',
    fileList,
    beforeUpload: (file) => {
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      const isAllowed = allowedTypes.includes(file.type);
      if (!isAllowed) {
        message.error('You can only upload PDF, PNG, or JPG files!');
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
      }
      return (isAllowed && isLt10M) || Upload.LIST_IGNORE;
    },
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card title="Documentation & Attachments" className="shadow-sm">
        <div className="mb-6">
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from uploading company data or other
              banned files. Accepted formats: PDF, PNG, JPG (Max 10MB per file).
            </p>
          </Upload.Dragger>
        </div>

        <List
          header={<div className="font-semibold">Uploaded Files</div>}
          bordered
          dataSource={fileList}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => {
                    setFileList(fileList.filter(f => f.uid !== item.uid));
                  }}
                />
              ]}
            >
              <List.Item.Meta
                avatar={
                  item.type === 'application/pdf' ? 
                    <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} /> : 
                    <FileImageOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                }
                title={<a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>}
                description={item.status === 'done' ? <Text type="success">Uploaded</Text> : <Text type="secondary">Uploading...</Text>}
              />
            </List.Item>
          )}
        />
      </Card>

      <div className="flex justify-end">
        <Button type="primary" onClick={handleSave} size="large">
          Save & Next
        </Button>
      </div>
    </Space>
  );
};

export default DocumentationStep;
