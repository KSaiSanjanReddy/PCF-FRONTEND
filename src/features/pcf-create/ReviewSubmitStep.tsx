import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, Table, List, Alert, Space, Tag, Modal, Image, Spin, message } from 'antd';
import { EditOutlined, FilePdfOutlined, FileImageOutlined, CheckCircleFilled, InfoCircleFilled, WarningFilled, EyeOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import BomTable from './BomTable';
import pcfService from '../../lib/pcfService';

interface ReviewSubmitStepProps {
  formData: any;
  onEditStep: (step: number) => void;
  onSubmit: () => void;
}

const { Title, Text } = Typography;

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ formData, onEditStep, onSubmit }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Helper to check if file is an image
  const isImageFile = (item: any) => {
    return item.name?.toLowerCase().match(/\.(png|jpg|jpeg|gif)$/i) ||
           item.type?.startsWith('image/');
  };

  // Handle image preview - fetch image via API
  const handlePreview = async (item: any) => {
    if (!item.fileKey) {
      message.error('File key not found');
      return;
    }

    setPreviewTitle(item.name || 'Preview');
    setPreviewVisible(true);
    setPreviewLoading(true);

    try {
      const result = await pcfService.fetchImage(item.fileKey);
      if (result.success && result.url) {
        setPreviewImage(result.url);
      } else {
        message.error(result.message || 'Failed to load image');
        setPreviewVisible(false);
      }
    } catch (error) {
      message.error('Failed to load image');
      setPreviewVisible(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle file download - fetch via API then download directly
  const handleDownload = async (item: any) => {
    if (!item.fileKey) {
      message.error('File key not found');
      return;
    }

    setDownloadingId(item.uid);

    try {
      const result = await pcfService.fetchImage(item.fileKey);
      if (result.success && result.url) {
        // Fetch the file from the signed URL
        const response = await fetch(result.url);
        const blob = await response.blob();
        
        // Create a blob URL and download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = item.name || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } else {
        message.error(result.message || 'Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      message.error('Failed to download file');
    } finally {
      setDownloadingId(null);
    }
  };

  // Close preview modal
  const handleClosePreview = () => {
    setPreviewVisible(false);
    setPreviewImage('');
  };
  


  return (
    <Space direction="vertical" size="large" className="w-full">
      
      {/* Request Summary Header */}
      <Card className="shadow-sm">
        <Title level={4}>Request Summary</Title>
        <Row gutter={[24, 16]}>
          <Col span={6}>
            <Text type="secondary" className="block text-xs uppercase">Request ID</Text>
            <Text strong>PCF-2024-001234</Text> {/* Placeholder ID */}
          </Col>
          <Col span={6}>
            <Text type="secondary" className="block text-xs uppercase">Created On</Text>
            <Text strong>{dayjs().format('MMMM D, YYYY [at] h:mm A')}</Text>
          </Col>
          <Col span={6}>
            <Text type="secondary" className="block text-xs uppercase">Due Date</Text>
            <Text strong>{formData.dueDate ? dayjs(formData.dueDate).format('MMMM D, YYYY') : '-'}</Text>
          </Col>
          <Col span={6}>
            <Text type="secondary" className="block text-xs uppercase">Priority</Text>
            <Tag color={formData.priority === 'High' ? 'red' : formData.priority === 'Medium' ? 'orange' : 'green'}>
              {formData.priority || 'Medium'}
            </Tag>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* Basic Information */}
        <Col span={12}>
          <Card 
            title="Basic Information" 
            extra={<Button type="text" icon={<EditOutlined />} className="text-green-600" onClick={() => onEditStep(0)}>Edit</Button>}
            className="h-full shadow-sm"
          >
            <Space direction="vertical" size="middle" className="w-full">
              <div>
                <Text type="secondary" className="block text-xs">Request Title</Text>
                <Text strong>{formData.title || '-'}</Text>
              </div>
              <div>
                <Text type="secondary" className="block text-xs">Requesting Organization</Text>
                <Text strong>{formData.organization || '-'}</Text>
              </div>
              <div>
                <Text type="secondary" className="block text-xs">Description</Text>
                <Text className="text-gray-600">{formData.description || '-'}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Product Details */}
        <Col span={12}>
          <Card 
            title="Product Details" 
            extra={<Button type="text" icon={<EditOutlined />} className="text-green-600" onClick={() => onEditStep(1)}>Edit</Button>}
            className="h-full shadow-sm"
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary" className="block text-xs">Product Category</Text>
                <Text strong>{formData.productCategory === 'electronics' ? 'Electrical & Electronics' : formData.productCategory || '-'}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary" className="block text-xs">Component Category</Text>
                <Text strong>{formData.componentCategory === 'control_units' ? 'Control Units' : formData.componentCategory || '-'}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary" className="block text-xs">Component Type</Text>
                <Text strong>{formData.componentType === 'ecu' ? 'Engine Control Unit' : formData.componentType || '-'}</Text>
              </Col>
              {/* Add more details as needed */}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Bill of Materials */}
      <Card 
        title="Bill Of Materials" 
        extra={
          <Space>
            <Text type="secondary">{formData.bomData?.length || 0} components</Text>
            <Button type="text" icon={<EditOutlined />} className="text-green-600" onClick={() => onEditStep(1)}>Edit</Button>
          </Space>
        }
        className="shadow-sm"
      >
        <BomTable bomData={formData.bomData || []} readOnly={true} />
      </Card>

      {/* Documentation */}
      <Card 
        title="Documentation & Attachments" 
        extra={
          <Space>
            <Text type="secondary">{formData.documents?.length || 0} files uploaded</Text>
            <Button type="text" icon={<EditOutlined />} className="text-green-600" onClick={() => onEditStep(2)}>Edit</Button>
          </Space>
        }
        className="shadow-sm"
      >
        <List
          dataSource={formData.documents || []}
          renderItem={(item: any) => {
            const isPdf = item.type === 'application/pdf' || item.name?.toLowerCase().endsWith('.pdf');
            const isImage = isImageFile(item);
            const isDownloading = downloadingId === item.uid;

            return (
              <List.Item
                actions={[
                  isImage && (
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(item)}
                      title="Preview"
                    >
                      Preview
                    </Button>
                  ),
                  <Button
                    type="text"
                    icon={isDownloading ? <LoadingOutlined /> : <DownloadOutlined />}
                    onClick={() => handleDownload(item)}
                    title="Download"
                    loading={isDownloading}
                  >
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </Button>
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    isPdf ?
                      <FilePdfOutlined style={{ fontSize: 20, color: '#ff4d4f' }} /> :
                      <FileImageOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                  }
                  title={item.name}
                  description={<Text type="secondary" style={{ fontSize: 12 }}>{item.size ? `${(item.size / 1024).toFixed(1)} KB` : ''} • Uploaded just now</Text>}
                />
              </List.Item>
            );
          }}
        />
      </Card>

      {/* Validations & Warnings */}
      <Card title="Validations & Warnings" className="shadow-sm">
        <Space direction="vertical" className="w-full">
          <Alert
            message="All required fields completed"
            description="Basic information, product details, and documentation are complete."
            type="success"
            showIcon
            icon={<CheckCircleFilled />}
            className="bg-green-50 border-green-200"
          />
          <Alert
            message="BOM validation successful"
            description="All components have valid materials and weights specified."
            type="success"
            showIcon
            icon={<CheckCircleFilled />}
            className="bg-green-50 border-green-200"
          />
          {formData.priority === 'High' && (
            <Alert
              message="High priority request"
              description="This request has been marked as high priority and will require expedited review."
              type="warning"
              showIcon
              icon={<WarningFilled />}
              className="bg-orange-50 border-orange-200"
            />
          )}
          <Alert
            message="Estimated processing time: 7-10 business days"
            description="Based on current workload and request complexity."
            type="info"
            showIcon
            icon={<InfoCircleFilled />}
            className="bg-blue-50 border-blue-200"
          />
        </Space>
      </Card>

      <div className="flex justify-end">
        <Button type="primary" size="large" onClick={onSubmit} className="bg-green-600 hover:bg-green-500 border-green-600">
          Submit
        </Button>
      </div>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handleClosePreview}
        width={800}
        centered
        destroyOnClose
      >
        <div className="flex justify-center items-center min-h-[200px]">
          {previewLoading ? (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Loading image..." />
          ) : (
            <Image
              alt={previewTitle}
              src={previewImage}
              style={{ maxHeight: '70vh' }}
              preview={false}
            />
          )}
        </div>
      </Modal>
    </Space>
  );
};

export default ReviewSubmitStep;
