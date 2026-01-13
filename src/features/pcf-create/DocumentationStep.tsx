import React, { useState } from 'react';
import { Card, Upload, Button, List, Typography, Space, message } from 'antd';
import { UploadOutlined, FilePdfOutlined, FileImageOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

interface DocumentationStepProps {
  initialValues: any;
  onSave: (values: any) => void;
}

const { Text } = Typography;

const DocumentationStep: React.FC<DocumentationStepProps> = ({ initialValues, onSave }) => {
  const [fileList, setFileList] = useState<UploadFile[]>(initialValues.documents || []);

  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];

    // Limit to 5 files for now
    newFileList = newFileList.slice(-5);

    // Read from response and show file link
    newFileList = newFileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);

    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleSave = () => {
    onSave({ documents: fileList });
  };

  const uploadProps: UploadProps = {
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188', // Mock upload URL
    onChange: handleChange,
    multiple: true,
    accept: '.pdf,.png',
    fileList,
    beforeUpload: (file) => {
      const isPdfOrPng = file.type === 'application/pdf' || file.type === 'image/png';
      if (!isPdfOrPng) {
        message.error('You can only upload PDF or PNG files!');
      }
      return isPdfOrPng || Upload.LIST_IGNORE;
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
              banned files. Accepted formats: PDF, PNG.
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
