import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Checkbox, Radio, InputNumber, Button, Table, Space, Typography, Tooltip, Badge, Empty, Tag } from 'antd';
import { QUESTIONNAIRE_OPTIONS } from '../../config/questionnaireConfig';
import { PlusOutlined, DeleteOutlined, UploadOutlined, QuestionCircleOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { QuestionnaireSection, QuestionnaireField } from '../../config/questionnaireSchema';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface DynamicQuestionnaireFormProps {
  section: QuestionnaireSection;
  initialValues: any;
  onFinish: (values: any) => void;
  form: any; // Ant Form instance
  onValuesChange?: (changedValues: any, allValues: any) => void;
  autoPopulatedFields?: Set<string>;
  formErrors?: Record<string, string[]>;
}

const DynamicQuestionnaireForm: React.FC<DynamicQuestionnaireFormProps> = ({ 
  section, 
  initialValues, 
  onFinish,
  form,
  onValuesChange,
  autoPopulatedFields = new Set(),
  formErrors = {}
}) => {
  const [charCounts, setCharCounts] = useState<Record<string, number>>({});

  // Sync initialValues when they change (for auto-population)
  // This is important for Form.List components that need to be updated when data is auto-populated
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      // Only update if there are actual values to set
      const currentValues = form.getFieldsValue();
      const hasNewData = JSON.stringify(currentValues) !== JSON.stringify(initialValues);
      
      if (hasNewData) {
        console.log("DynamicQuestionnaireForm: Updating form values from initialValues", initialValues);
        form.setFieldsValue(initialValues);
      }
    }
  }, [initialValues, form]);

  // Track character counts for textareas
  useEffect(() => {
    if (!section) return;
    const fields = section.fields.filter(f => f.type === 'textarea');
    const counts: Record<string, number> = {};
    fields.forEach(field => {
      const value = form.getFieldValue(field.name.split('.'));
      if (value) {
        counts[field.name] = value.length;
      }
    });
    setCharCounts(counts);
  }, [section, form]);

  if (!section) {
    return null;
  }
  
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
            
            // Check if dependency field has been answered at all
            const isAnswered = dependencyValue !== undefined && 
                              dependencyValue !== null && 
                              dependencyValue !== '';
            
            // If dependency field hasn't been answered, don't show dependent field
            if (!isAnswered) {
              return null;
            }
            
            // Handle different value types
            if (typeof expectedValue === 'boolean') {
              // For boolean dependencies (checkboxes), check exact match
              if (dependencyValue !== expectedValue) {
                return null;
              }
            } else if (Array.isArray(dependencyValue)) {
              // For array values (multi-select), check if expected value is in array
              if (!dependencyValue.includes(expectedValue)) {
                return null;
              }
            } else {
              // For string/number values, check exact match
              if (dependencyValue !== expectedValue) {
                return null;
              }
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
        <div className={`mb-3 transition-all duration-200 ${field.className || ''}`} key={field.name}>
          {field.label && <h4 className="text-sm font-medium text-gray-900 mb-2">{field.label}</h4>}
          <div className="text-sm text-gray-600 whitespace-pre-line">{field.content}</div>
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

    const isAutoPopulated = autoPopulatedFields.has(field.name);
    const fieldErrors = formErrors[field.name] || [];

    let inputComponent;
    switch (field.type) {
      case 'text':
        inputComponent = (
          <Input 
            {...commonProps}
            suffix={isAutoPopulated && (
              <Tooltip title="Auto-populated from BOM data">
                <InfoCircleOutlined className="text-green-500" />
              </Tooltip>
            )}
          />
        );
        break;
      case 'textarea':
        inputComponent = (
          <div>
            <TextArea 
              {...commonProps} 
              rows={4}
              maxLength={field.maxLength}
              showCount={!!field.maxLength}
              onChange={(e) => {
                setCharCounts(prev => ({ ...prev, [field.name]: e.target.value.length }));
                // Clear error if user starts typing
                if (e.target.value && fieldErrors.length > 0) {
                  // Error will be cleared by form validation
                }
              }}
            />
            {field.maxLength && (
              <div className="text-xs text-gray-400 mt-1">
                {charCounts[field.name] || 0} / {field.maxLength} characters
              </div>
            )}
          </div>
        );
        break;
      case 'number':
        inputComponent = (
          <InputNumber 
            {...commonProps}
            style={{ width: '100%' }}
            min={field.min}
            max={field.max}
          />
        );
        break;
      case 'select':
        inputComponent = (
          <Select 
            {...commonProps} 
            mode={field.mode}
            showSearch={field.options && field.options.length > 5}
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
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
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 {field.options.map((opt: any) => {
                   const label = typeof opt === 'string' ? opt : opt.label;
                   const value = typeof opt === 'string' ? opt : opt.value;
                   return (
                     <div key={value} className="flex items-center">
                       <Checkbox value={value} className="hover:bg-gray-50 p-1 rounded">
                         {label}
                       </Checkbox>
                     </div>
                   );
                 })}
               </div>
             </Checkbox.Group>
           );
        } else {
          const isAutoPopulated = autoPopulatedFields.has(field.name);
          const fieldErrors = formErrors[field.name] || [];
          return (
            <Form.Item
              key={field.name}
              name={field.name.split('.')}
              valuePropName="checked"
              rules={[
                {
                  validator: (_: any, value: boolean) => {
                    if (field.required && !value) {
                      const questionNumber = field.label?.match(/^\d+\./)?.[0] || '';
                      return Promise.reject(new Error(
                        questionNumber 
                          ? `Please check this box to acknowledge ${questionNumber.slice(0, -1)}`
                          : `This field is required. Please check the box to continue.`
                      ));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
              className={`mb-2 transition-all duration-200 ${fieldErrors.length > 0 ? 'animate-pulse' : ''}`}
              validateStatus={fieldErrors.length > 0 ? 'error' : undefined}
              help={fieldErrors.length > 0 ? fieldErrors[0] : undefined}
              extra={isAutoPopulated && (
                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <InfoCircleOutlined className="text-xs" />
                  Auto-populated from BOM data
                </div>
              )}
            >
              <div className="flex items-center gap-2">
                <Checkbox>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Checkbox>
                {isAutoPopulated && (
                  <Tag color="green" icon={<InfoCircleOutlined />} className="text-xs">
                    Auto-filled
                  </Tag>
                )}
              </div>
            </Form.Item>
          );
        }
        break;
      case 'radio':
        inputComponent = (
          <div className="w-full">
            <style>{`
              .yes-no-radio-group .ant-radio-button-wrapper {
                text-align: center;
                font-weight: 700;
                padding: 8px 24px;
                min-width: 100px;
                height: 40px;
                line-height: 24px;
                border: 1px solid #d1d5db;
                background-color: #f3f4f6;
                color: #374151;
                border-radius: 8px;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                font-size: 13px;
                letter-spacing: 0.5px;
                transition: all 0.2s;
                margin: 0;
              }
              .yes-no-radio-group .ant-radio-button-wrapper:not(:first-child)::before {
                display: none;
              }
              .yes-no-radio-group .ant-radio-button-wrapper:hover {
                background-color: #e5e7eb;
                border-color: #9ca3af;
                color: #374151;
              }
              .yes-no-radio-group .ant-radio-button-wrapper-checked {
                background-color: #52c41a !important;
                border-color: #52c41a !important;
                color: #ffffff !important;
                box-shadow: 0 2px 4px 0 rgba(82, 196, 26, 0.2);
              }
              .yes-no-radio-group .ant-radio-button-wrapper-checked:hover {
                background-color: #73d13d !important;
                border-color: #73d13d !important;
              }
            `}</style>
            <Radio.Group className="yes-no-radio-group">
              <div className="inline-flex gap-3">
                {field.options?.map((opt: any) => {
                  const label = typeof opt === 'string' ? opt : opt.label;
                  const value = typeof opt === 'string' ? opt : opt.value;
                  return (
                    <Radio.Button 
                      key={value} 
                      value={value}
                    >
                      {label.toUpperCase()}
                    </Radio.Button>
                  );
                })}
              </div>
            </Radio.Group>
          </div>
        );
        break;
      case 'file':
        inputComponent = (
          <div>
            <Button icon={<UploadOutlined />} className="hover:border-green-400 hover:text-green-600">
              Click to Upload
            </Button>
            {field.placeholder && (
              <div className="text-xs text-gray-500 mt-2">{field.placeholder}</div>
            )}
          </div>
        );
        break;
      default:
        inputComponent = <Input {...commonProps} />;
    }

    return (
      <Form.Item
        key={field.name}
        name={field.name.split('.')}
        label={
          <div className="flex items-center gap-2">
            <span>{field.label}</span>
            {field.required && <span className="text-red-500">*</span>}
            {field.placeholder && (
              <Tooltip title={field.placeholder}>
                <QuestionCircleOutlined className="text-gray-400 text-xs" />
              </Tooltip>
            )}
            {isAutoPopulated && (
              <Tag color="green" icon={<InfoCircleOutlined />} className="text-xs">
                Auto-filled
              </Tag>
            )}
          </div>
        }
        rules={[
          { 
            required: field.required, 
            message: field.required 
              ? (() => {
                  const questionNumber = field.label?.match(/^\d+\./)?.[0] || '';
                  if (questionNumber) {
                    return `Please answer ${questionNumber.slice(0, -1)}. This field is required.`;
                  }
                  return `This field is required. Please provide a value.`;
                })()
              : undefined
          },
          // Email validation
          ...(field.name.toLowerCase().includes('email') || field.label?.toLowerCase().includes('e-mail') || field.label?.toLowerCase().includes('email') ? [{
            type: 'email' as const,
            message: 'Please enter a valid email address (e.g., name@example.com)'
          }] : []),
          // Number validation
          ...(field.type === 'number' && field.min !== undefined ? [{
            type: 'number' as const,
            min: field.min,
            message: `Please enter a value of at least ${field.min}`
          }] : []),
          ...(field.type === 'number' && field.max !== undefined ? [{
            type: 'number' as const,
            max: field.max,
            message: `Please enter a value that does not exceed ${field.max}`
          }] : []),
          // Text length validation
          ...(field.type === 'text' && field.maxLength ? [{
            max: field.maxLength,
            message: `Please limit your response to ${field.maxLength} characters or less`
          }] : [])
        ].filter(Boolean)}
        className={`mb-2 transition-all duration-200 ${fieldErrors.length > 0 ? 'animate-pulse' : ''}`}
        validateStatus={fieldErrors.length > 0 ? 'error' : isAutoPopulated ? 'success' : undefined}
        help={fieldErrors.length > 0 ? fieldErrors[0] : undefined}
        extra={isAutoPopulated && (
          <div className="text-xs text-green-600 mt-1">
            This field was automatically populated from your BOM data. You can modify it if needed.
          </div>
        )}
      >
        {inputComponent}
      </Form.Item>
    );
  };

  const renderTableField = (field: QuestionnaireField) => {
    const isAutoPopulated = autoPopulatedFields.has(field.name);
    
    return (
      <div 
        key={field.name} 
        className={`mb-3 border rounded-lg bg-gray-50 transition-all duration-200 ${
          isAutoPopulated ? 'border-green-200 bg-green-50' : 'border-gray-200'
        }`}
      >
        <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">{field.label}</h4>
              {field.required && <span className="text-red-500">*</span>}
              {isAutoPopulated && (
                <Tag color="green" icon={<InfoCircleOutlined />} className="text-xs">
                  Auto-filled
                </Tag>
              )}
            </div>
            {field.placeholder && (
              <Tooltip title={field.placeholder}>
                <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
              </Tooltip>
            )}
          </div>
          {/* {isAutoPopulated && (
            <div className="text-xs text-green-600 mt-2">
              This table was automatically populated from your BOM data. You can modify or add more entries.
            </div>
          )} */}
        </div>
        
        <div className="p-4">
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => {
              // Watch for changes in the stationary_combustion list
              if (field.name === 'scope_1.stationary_combustion') {
                const prevList = prevValues?.scope_1?.stationary_combustion || [];
                const currList = currentValues?.scope_1?.stationary_combustion || [];
                if (prevList.length !== currList.length) return true;
                return prevList.some((prevRow: any, index: number) => {
                  return prevRow?.fuel_type !== currList[index]?.fuel_type;
                });
              }
              return false;
            }}
          >
            {() => (
          <Form.List 
            name={field.name.split('.')}
            rules={field.required ? [
              {
                validator: async (_, value) => {
                  if (!value || value.length === 0) {
                    const questionNumber = field.label?.match(/^\d+\./)?.[0] || '';
                    return Promise.reject(
                      new Error(
                        questionNumber
                          ? `Please add at least one entry to ${questionNumber.slice(0, -1)}. This table is required.`
                          : 'Please add at least one entry to this table. This field is required.'
                      )
                    );
                  }
                  return Promise.resolve();
                }
              }
            ] : undefined}
          >
            {(fields, { add, remove }, { errors }) => {
              const columns = [
                ...(field.columns?.map((col, colIndex) => {
                  const isAutoPopulatedCol = isAutoPopulated && colIndex < 2; // First 2 columns typically auto-populated
                  
                  // Check if this is the sub_fuel_type column in stationary_combustion table
                  const isSubFuelType = col.name === 'sub_fuel_type' && field.name === 'scope_1.stationary_combustion';
                  
                  return {
                    title: (
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        {col.required && <span className="text-red-500">*</span>}
                      </div>
                    ),
                    dataIndex: col.name,
                    key: col.name,
                    width: col.type === 'number' ? 120 : undefined,
                    render: (_: any, fieldRecord: any) => {
                      // For sub_fuel_type, we need to get fuel_type from the same row
                      if (isSubFuelType) {
                        const fieldPath = field.name.split('.');
                        // Get fuel_type from the form - this will be re-evaluated when Form.Item shouldUpdate triggers
                        const rowValues = form.getFieldValue([...fieldPath, fieldRecord.name]);
                        const fuelType = rowValues?.fuel_type;
                        const subFuelOptions = fuelType && QUESTIONNAIRE_OPTIONS.FUEL_SUB_TYPES[fuelType as keyof typeof QUESTIONNAIRE_OPTIONS.FUEL_SUB_TYPES]
                          ? QUESTIONNAIRE_OPTIONS.FUEL_SUB_TYPES[fuelType as keyof typeof QUESTIONNAIRE_OPTIONS.FUEL_SUB_TYPES]
                          : [];
                        
                        return (
                          <Form.Item
                            name={[fieldRecord.name, col.name]}
                            rules={[
                              { 
                                required: col.required, 
                                message: col.required 
                                  ? `Please fill in "${col.label}" for this row. This field is required.`
                                  : undefined
                              }
                            ].filter(Boolean)}
                            className="mb-0"
                          >
                            <Select 
                              placeholder={fuelType ? col.placeholder : 'Select fuel type first'} 
                              style={{ minWidth: 120, width: '100%' }} 
                              mode={col.mode}
                              disabled={!fuelType}
                              showSearch={subFuelOptions.length > 5}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {subFuelOptions.map((opt: string) => (
                                <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        );
                      }
                      
                      // For fuel_type, add onChange to clear sub_fuel_type
                      if (col.name === 'fuel_type' && field.name === 'scope_1.stationary_combustion') {
                        return (
                          <Form.Item
                            name={[fieldRecord.name, col.name]}
                            rules={[
                              { 
                                required: col.required, 
                                message: col.required 
                                  ? `Please fill in "${col.label}" for this row. This field is required.`
                                  : undefined
                              }
                            ].filter(Boolean)}
                            className="mb-0"
                          >
                            <Select 
                              placeholder={col.placeholder} 
                              style={{ minWidth: 120, width: '100%' }} 
                              mode={col.mode}
                              showSearch={col.options && col.options.length > 5}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                              onChange={(value) => {
                                // Clear sub_fuel_type when fuel_type changes
                                form.setFieldValue([...field.name.split('.'), fieldRecord.name, 'sub_fuel_type'], undefined);
                              }}
                            >
                              {col.options?.map((opt: any) => {
                                const label = typeof opt === 'string' ? opt : opt.label;
                                const value = typeof opt === 'string' ? opt : opt.value;
                                return <Select.Option key={value} value={value}>{label}</Select.Option>;
                              })}
                            </Select>
                          </Form.Item>
                        );
                      }
                      
                      // Default rendering for other columns
                      return (
                        <Form.Item
                          name={[fieldRecord.name, col.name]}
                          rules={[
                            { 
                              required: col.required, 
                              message: col.required 
                                ? `Please fill in "${col.label}" for this row. This field is required.`
                                : undefined
                            },
                            ...(col.type === 'number' && col.min !== undefined ? [{
                              type: 'number' as const,
                              min: col.min,
                              message: `${col.label} must be at least ${col.min}`
                            }] : []),
                            ...(col.type === 'number' && col.max !== undefined ? [{
                              type: 'number' as const,
                              max: col.max,
                              message: `${col.label} must not exceed ${col.max}`
                            }] : [])
                          ].filter(Boolean)}
                          className="mb-0"
                        >
                          {col.type === 'select' ? (
                            <Select 
                              placeholder={col.placeholder} 
                              style={{ minWidth: 120, width: '100%' }} 
                              mode={col.mode}
                              showSearch={col.options && col.options.length > 5}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {col.options?.map((opt: any) => {
                                const label = typeof opt === 'string' ? opt : opt.label;
                                const value = typeof opt === 'string' ? opt : opt.value;
                                return <Select.Option key={value} value={value}>{label}</Select.Option>;
                              })}
                            </Select>
                          ) : col.type === 'number' ? (
                            <InputNumber 
                              placeholder={col.placeholder} 
                              style={{ width: '100%' }}
                              min={col.min}
                              max={col.max}
                            />
                          ) : (
                            <Input 
                              placeholder={col.placeholder}
                              className={isAutoPopulatedCol ? 'bg-green-50' : ''}
                            />
                          )}
                        </Form.Item>
                      );
                    }
                  };
                }) || []),
                {
                  title: 'Action',
                  key: 'action',
                  width: 70,
                  fixed: 'right' as const,
                  render: (_: any, fieldRecord: any) => (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(fieldRecord.name)}
                      className="hover:bg-red-50"
                      size="small"
                    />
                  )
                }
              ];

              return (
                <>
                  {fields.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span className="text-gray-400">
                          No items added yet. Click the button below to add your first entry.
                        </span>
                      }
                      className="py-8"
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <Table
                        dataSource={fields}
                        columns={columns}
                        pagination={false}
                        rowKey="key"
                        size="small"
                        bordered
                        className="mb-4"
                        scroll={{ x: 'max-content' }}
                        rowClassName={(_, index) => 
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }
                      />
                    </div>
                  )}
                  {errors.length > 0 && (
                    <div className="mt-2">
                      {errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 flex items-center gap-1">
                          <InfoCircleOutlined className="text-xs" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {fields.length} {fields.length === 1 ? 'item' : 'items'}
                      {field.required && fields.length === 0 && (
                        <span className="text-red-500 ml-1">(Required - add at least one entry)</span>
                      )}
                    </span>
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      icon={<PlusOutlined />}
                      className="hover:border-green-400 hover:text-green-600"
                    >
                      {field.addButtonLabel || 'Add Row'}
                    </Button>
                  </div>
                </>
              );
            }}
          </Form.List>
            )}
          </Form.Item>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <Title level={3} className="mb-2">{section.title}</Title>
        {section.description && (
          <Text type="secondary" className="text-sm">{section.description}</Text>
        )}
      </div>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        onValuesChange={onValuesChange}
        scrollToFirstError
        className="space-y-2"
      >
        {section.fields.map((field, index) => (
          <div 
            key={field.name} 
            className="transition-all duration-200 hover:bg-gray-50 -mx-2 px-2 rounded"
          >
            {renderField(field)}
          </div>
        ))}
      </Form>
    </div>
  );
};

export default DynamicQuestionnaireForm;
