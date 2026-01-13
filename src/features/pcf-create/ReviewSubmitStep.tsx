import React from 'react';
import { Card, Button, Typography, Row, Col, Table, List, Alert, Space, Tag } from 'antd';
import { EditOutlined, FilePdfOutlined, FileImageOutlined, CheckCircleFilled, InfoCircleFilled, WarningFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import BomTable from './BomTable';

interface ReviewSubmitStepProps {
  formData: any;
  onEditStep: (step: number) => void;
  onSubmit: () => void;
}

const { Title, Text } = Typography;

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ formData, onEditStep, onSubmit }) => {
  


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
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  item.type === 'application/pdf' ? 
                    <FilePdfOutlined style={{ fontSize: 20, color: '#ff4d4f' }} /> : 
                    <FileImageOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                }
                title={<a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>}
                description={<Text type="secondary" style={{ fontSize: 12 }}>{item.size ? `${(item.size / 1024).toFixed(1)} KB` : ''} • Uploaded just now</Text>}
              />
            </List.Item>
          )}
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
    </Space>
  );
};

export default ReviewSubmitStep;
