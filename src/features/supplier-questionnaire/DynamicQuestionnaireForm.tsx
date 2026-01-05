import React from 'react';
import { Form, Input, Select, Checkbox, InputNumber, Button, Table, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { QuestionnaireSection, QuestionnaireField } from '../../config/questionnaireSchema';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface DynamicQuestionnaireFormProps {
  section: QuestionnaireSection;
  initialValues: any;
  onFinish: (values: any) => void;
  form: any; // Ant Form instance
}

const DynamicQuestionnaireForm: React.FC<DynamicQuestionnaireFormProps> = ({ 
  section, 
  initialValues, 
  onFinish,
  form
}) => {
  
  const renderField = (field: QuestionnaireField) => {
    // Handle conditional rendering
    if (field.dependency) {
      return (
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => {
            // Helper to get nested value
            const getValue = (obj: any, path: string) => {
              return path.split('.').reduce((acc, part) => acc && acc[part], obj);
            };
            
            const prev = getValue(prevValues, field.dependency!.field);
            const curr = getValue(currentValues, field.dependency!.field);
            return prev !== curr;
          }}
        >
          {({ getFieldValue }) => {
            const dependencyValue = getFieldValue(field.dependency!.field.split('.'));
            const expectedValue = field.dependency!.value;
            
            // Simple equality check for now
            if (dependencyValue !== expectedValue) {
              return null;
            }
            return renderFieldContent(field);
          }}
        </Form.Item>
      );
    }

    return renderFieldContent(field);
  };

  const renderFieldContent = (field: QuestionnaireField) => {
    if (field.type === 'info') {
      return (
        <div className={`mb-6 ${field.className || ''}`} key={field.name}>
          {field.label && <h4 className="text-sm font-medium text-gray-900 mb-2">{field.label}</h4>}
          <div className="text-sm text-gray-600">{field.content}</div>
        </div>
      );
    }

    if (field.type === 'table') {
      return renderTableField(field);
    }

    const commonProps = {
      placeholder: field.placeholder,
      disabled: field.disabled,
      style: { width: '100%' }
    };

    let inputComponent;
    switch (field.type) {
      case 'text':
        inputComponent = <Input {...commonProps} />;
        break;
      case 'textarea':
        inputComponent = <TextArea {...commonProps} rows={4} />;
        break;
      case 'number':
        inputComponent = <InputNumber {...commonProps} />;
        break;
      case 'select':
        inputComponent = (
          <Select {...commonProps}>
            {field.options?.map((opt: any) => {
              const label = typeof opt === 'string' ? opt : opt.label;
              const value = typeof opt === 'string' ? opt : opt.value;
              return <Select.Option key={value} value={value}>{label}</Select.Option>;
            })}
          </Select>
        );
        break;
      case 'checkbox':
        if (field.options) {
           inputComponent = (
             <Checkbox.Group style={{ width: '100%' }}>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                 {field.options.map((opt: any) => {
                   const label = typeof opt === 'string' ? opt : opt.label;
                   const value = typeof opt === 'string' ? opt : opt.value;
                   return (
                     <div key={value}>
                       <Checkbox value={value}>{label}</Checkbox>
                     </div>
                   );
                 })}
               </div>
             </Checkbox.Group>
           );
        } else {
          return (
            <Form.Item
              key={field.name}
              name={field.name.split('.')}
              valuePropName="checked"
              rules={[{ required: field.required, message: `${field.label} is required` }]}
            >
              <Checkbox>{field.label}</Checkbox>
            </Form.Item>
          );
        }
        break;
      case 'file':
        inputComponent = (
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        );
        break;
      default:
        inputComponent = <Input {...commonProps} />;
    }

    return (
      <Form.Item
        key={field.name}
        name={field.name.split('.')}
        label={field.label}
        rules={[{ required: field.required, message: `${field.label} is required` }]}
        className="mb-4"
      >
        {inputComponent}
      </Form.Item>
    );
  };

  const renderTableField = (field: QuestionnaireField) => {
    return (
      <div key={field.name} className="mb-6 border p-4 rounded-lg bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900 mb-4">{field.label}</h4>
        <Form.List name={field.name.split('.')}>
          {(fields, { add, remove }) => {
            const columns = [
              ...(field.columns?.map(col => ({
                title: col.label,
                dataIndex: col.name,
                key: col.name,
                render: (_: any, fieldRecord: any) => (
                  <Form.Item
                    name={[fieldRecord.name, col.name]}
                    rules={[{ required: col.required, message: 'Required' }]}
                    className="mb-0" // Remove bottom margin for table layout
                  >
                    {col.type === 'select' ? (
                      <Select placeholder={col.placeholder} style={{ minWidth: 120 }}>
                        {col.options?.map((opt: any) => {
                          const label = typeof opt === 'string' ? opt : opt.label;
                          const value = typeof opt === 'string' ? opt : opt.value;
                          return <Select.Option key={value} value={value}>{label}</Select.Option>;
                        })}
                      </Select>
                    ) : col.type === 'number' ? (
                      <InputNumber placeholder={col.placeholder} style={{ width: '100%' }} />
                    ) : (
                      <Input placeholder={col.placeholder} />
                    )}
                  </Form.Item>
                )
              })) || []),
              {
                title: 'Action',
                key: 'action',
                width: 60,
                render: (_: any, fieldRecord: any) => (
                  <DeleteOutlined 
                    className="text-red-500 cursor-pointer hover:text-red-700" 
                    onClick={() => remove(fieldRecord.name)} 
                  />
                )
              }
            ];

            return (
              <>
                <Table
                  dataSource={fields}
                  columns={columns}
                  pagination={false}
                  rowKey="key"
                  size="small"
                  bordered
                  className="mb-4"
                />
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  {field.addButtonLabel || 'Add Item'}
                </Button>
              </>
            );
          }}
        </Form.List>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-8">
        <Title level={3}>{section.title}</Title>
        {section.description && <Text type="secondary">{section.description}</Text>}
      </div>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        scrollToFirstError
      >
        {section.fields.map(field => renderField(field))}
      </Form>
    </div>
  );
};

export default DynamicQuestionnaireForm;
