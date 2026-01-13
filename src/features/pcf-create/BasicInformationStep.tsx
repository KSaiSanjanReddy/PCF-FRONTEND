import React from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Button, Card } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface BasicInformationStepProps {
  initialValues: any;
  onSave: (values: any) => void;
}

const BasicInformationStep: React.FC<BasicInformationStepProps> = ({ initialValues, onSave }) => {
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then((values) => {
      // Convert dayjs date to string or keep as object depending on requirement
      // For now passing as is, parent can handle formatting
      onSave(values);
    });
  };

  return (
    <Card title="Basic Information" className="shadow-sm">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Request Title"
              name="title"
              rules={[{ required: true, message: 'Enter request title' }]}
            >
              <Input placeholder="Enter request title" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Priority"
              name="priority"
              rules={[{ required: true, message: 'Select priority' }]}
            >
              <Select
                placeholder="Select Priority"
                size="large"
                options={[
                  { label: 'High', value: 'High' },
                  { label: 'Medium', value: 'Medium' },
                  { label: 'Low', value: 'Low' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Requesting Organization"
              name="organization"
              rules={[{ required: true, message: 'Enter organization name' }]}
            >
              <Input placeholder="Enter organization name" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Due Date"
              name="dueDate"
              rules={[
                { required: true, message: 'Select due date' },
                {
                  validator: (_, value) => {
                    if (value && value.isBefore(dayjs(), 'day')) {
                      return Promise.reject(new Error('Past dates are not allowed'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker
                className="w-full"
                placeholder="MM/DD/YYYY"
                size="large"
                format="MM/DD/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Request Description" name="description">
              <TextArea
                placeholder="Provide a detailed description of your PCF request..."
                rows={5}
                maxLength={200}
                showCount
                style={{ resize: 'vertical' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end mt-4">
          <Button type="primary" onClick={handleSave} size="large">
            Save
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default BasicInformationStep;
