import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Checkbox, Radio, InputNumber, Button, Table, Space, Typography, Tooltip, Badge, Empty, Tag, Spin, Upload, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { QUESTIONNAIRE_OPTIONS } from '../../config/questionnaireConfig';
import { PlusOutlined, DeleteOutlined, UploadOutlined, QuestionCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, LoadingOutlined, FileOutlined } from '@ant-design/icons';
import type { QuestionnaireSection, QuestionnaireField, ApiDropdownType } from '../../config/questionnaireSchema';
import questionnaireDropdownService, { type DropdownItem } from '../../lib/questionnaireDropdownService';
import supplierQuestionnaireService from '../../lib/supplierQuestionnaireService';

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
  isClientMode?: boolean; // Client mode uses Product Code/Name instead of MPN/Component Name
}

// Type for storing dropdown data
type DropdownDataMap = Record<ApiDropdownType, DropdownItem[]>;

// Type for dependent dropdown data (keyed by parent value)
type DependentDropdownMap = Record<string, DropdownItem[]>;

const DynamicQuestionnaireForm: React.FC<DynamicQuestionnaireFormProps> = ({
  section,
  initialValues,
  onFinish,
  form,
  onValuesChange,
  autoPopulatedFields = new Set(),
  formErrors = {},
  isClientMode = false
}) => {
  const [charCounts, setCharCounts] = useState<Record<string, number>>({});

  // State for API dropdown data
  const [dropdownData, setDropdownData] = useState<Partial<DropdownDataMap>>({});
  const [dropdownLoading, setDropdownLoading] = useState<Record<string, boolean>>({});

  // State for dependent/cascading dropdowns (sub-fuel types by fuel type, energy types by source)
  const [subFuelTypesByFuel, setSubFuelTypesByFuel] = useState<DependentDropdownMap>({});
  const [energyTypesBySource, setEnergyTypesBySource] = useState<DependentDropdownMap>({});

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

  // Fetch API dropdown data when section changes
  useEffect(() => {
    if (!section) return;

    // Collect all unique apiDropdown types needed for this section
    const apiDropdownTypes = new Set<ApiDropdownType>();

    const collectApiDropdowns = (fields: QuestionnaireField[]) => {
      fields.forEach(field => {
        if (field.apiDropdown && !field.dependsOnField) {
          // Only fetch non-dependent dropdowns initially
          apiDropdownTypes.add(field.apiDropdown);
        }
        if (field.columns) {
          field.columns.forEach(col => {
            if (col.apiDropdown && !col.dependsOnField) {
              apiDropdownTypes.add(col.apiDropdown);
            }
          });
        }
      });
    };

    collectApiDropdowns(section.fields);

    // Fetch each dropdown type
    const fetchDropdowns = async () => {
      for (const dropdownType of apiDropdownTypes) {
        // Skip if already loaded
        if (dropdownData[dropdownType]) continue;

        setDropdownLoading(prev => ({ ...prev, [dropdownType]: true }));

        try {
          let data: DropdownItem[] = [];

          switch (dropdownType) {
            case 'fuelType':
              data = await questionnaireDropdownService.getFuelTypeDropdown();
              break;
            case 'subFuelType':
              data = await questionnaireDropdownService.getSubFuelTypeDropdown();
              break;
            case 'refrigerantType':
              data = await questionnaireDropdownService.getRefrigerantTypeDropdown();
              break;
            case 'energySource':
              data = await questionnaireDropdownService.getEnergySourceDropdown();
              break;
            case 'processSpecificEnergy':
              data = await questionnaireDropdownService.getProcessSpecificEnergyDropdown();
              break;
            case 'energyType':
              data = await questionnaireDropdownService.getEnergyTypeDropdown();
              break;
            case 'bomMaterials':
              // BOM materials are derived from form data (products_manufactured)
              // This is handled separately in renderSelectField
              data = [];
              break;
            case 'wasteType':
              data = await questionnaireDropdownService.getWasteTypeDropdown();
              break;
            case 'wasteTreatmentType':
              data = await questionnaireDropdownService.getWasteTreatmentTypeDropdown();
              break;
          }

          setDropdownData(prev => ({ ...prev, [dropdownType]: data }));
        } catch (error) {
          console.error(`Failed to fetch ${dropdownType} dropdown:`, error);
        } finally {
          setDropdownLoading(prev => ({ ...prev, [dropdownType]: false }));
        }
      }
    };

    fetchDropdowns();
  }, [section]);

  // Track in-flight requests to prevent duplicate calls
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  // Helper to check if a value looks like a valid API ID (ULID format)
  // ULIDs are 26 characters, alphanumeric
  const isValidApiId = (value: string): boolean => {
    if (!value || typeof value !== 'string') return false;
    // ULID format: 26 alphanumeric characters
    // Also accept UUIDs and other ID formats that don't contain spaces
    return /^[A-Za-z0-9_-]{10,}$/.test(value) && !value.includes(' ');
  };

  // Function to fetch dependent dropdown data (sub-fuel by fuel, energy type by source)
  const fetchDependentDropdown = useCallback(async (
    dropdownType: 'subFuelTypeByFuel' | 'energyTypeBySource',
    parentId: string
  ) => {
    if (!parentId) return;

    // Validate that parentId is an actual API ID, not a display name
    if (!isValidApiId(parentId)) {
      console.warn(`Invalid API ID format for ${dropdownType}: "${parentId}" - skipping fetch`);
      return;
    }

    const cacheKey = `${dropdownType}_${parentId}`;

    // Check if already cached
    if (dropdownType === 'subFuelTypeByFuel' && subFuelTypesByFuel[parentId]) return;
    if (dropdownType === 'energyTypeBySource' && energyTypesBySource[parentId]) return;

    // Check if request is already in flight
    if (pendingRequests.has(cacheKey)) return;

    // Mark request as pending
    setPendingRequests(prev => new Set(prev).add(cacheKey));
    setDropdownLoading(prev => ({ ...prev, [cacheKey]: true }));

    try {
      let data: DropdownItem[] = [];

      if (dropdownType === 'subFuelTypeByFuel') {
        data = await questionnaireDropdownService.getSubFuelTypeByFuelTypeDropdown(parentId);
        setSubFuelTypesByFuel(prev => ({ ...prev, [parentId]: data }));
      } else if (dropdownType === 'energyTypeBySource') {
        data = await questionnaireDropdownService.getEnergyTypeBySourceDropdown(parentId);
        setEnergyTypesBySource(prev => ({ ...prev, [parentId]: data }));
      }
    } catch (error) {
      console.error(`Failed to fetch ${dropdownType} for ${parentId}:`, error);
    } finally {
      setDropdownLoading(prev => ({ ...prev, [cacheKey]: false }));
      setPendingRequests(prev => {
        const next = new Set(prev);
        next.delete(cacheKey);
        return next;
      });
    }
  }, [subFuelTypesByFuel, energyTypesBySource, pendingRequests]);

  // Helper to get dropdown options for a field
  const getDropdownItems = useCallback((
    apiDropdownType: ApiDropdownType,
    dependsOnField?: string,
    parentValue?: string
  ): DropdownItem[] => {
    // Handle dependent dropdowns
    if (dependsOnField && parentValue) {
      // Only return cached data if parentValue is a valid API ID
      if (!isValidApiId(parentValue)) {
        return [];
      }
      if (apiDropdownType === 'subFuelTypeByFuel') {
        return subFuelTypesByFuel[parentValue] || [];
      }
      if (apiDropdownType === 'energyTypeBySource') {
        return energyTypesBySource[parentValue] || [];
      }
    }

    // Return static dropdown data
    return dropdownData[apiDropdownType] || [];
  }, [dropdownData, subFuelTypesByFuel, energyTypesBySource]);

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
              // For boolean dependencies, convert dependencyValue to boolean for comparison
              const depBool = typeof dependencyValue === 'string' 
                ? (dependencyValue.toLowerCase() === 'yes' || dependencyValue.toLowerCase() === 'true')
                : Boolean(dependencyValue);
              if (depBool !== expectedValue) {
                return null;
              }
            } else if (Array.isArray(dependencyValue)) {
              // For array values (multi-select), check if expected value is in array
              if (!dependencyValue.includes(expectedValue)) {
                return null;
              }
            } else {
              // For string/number values, check exact match (case-insensitive for Yes/No)
              const depStr = String(dependencyValue).toLowerCase();
              const expStr = String(expectedValue).toLowerCase();
              if (depStr !== expStr) {
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
          // Multi-select checkbox group
          inputComponent = (
            <Checkbox.Group>
              <Space direction="vertical" size="small">
                {field.options.map((opt: any) => {
                  const label = typeof opt === 'string' ? opt : opt.label;
                  const value = typeof opt === 'string' ? opt : opt.value;
                  return (
                    <Checkbox key={value} value={value}>
                      {label}
                    </Checkbox>
                  );
                })}
              </Space>
            </Checkbox.Group>
          );
        } else {
          // Single checkbox (acknowledgement)
          inputComponent = (
            <Checkbox>
              {field.placeholder || 'I acknowledge'}
            </Checkbox>
          );
        }
        break;
      case 'radio':
        inputComponent = (
          <Radio.Group>
            <Space size="large">
              {field.options?.map((opt: any) => {
                const label = typeof opt === 'string' ? opt : opt.label;
                const value = typeof opt === 'string' ? opt : opt.value;
                return (
                  <Radio key={value} value={value}>
                    {label}
                  </Radio>
                );
              })}
            </Space>
          </Radio.Group>
        );
        break;
      case 'file':
        // Get current file key from form if exists (from draft or previous upload)
        const currentFileKey = form.getFieldValue(field.name.split('.'));

        const fileUploadProps: UploadProps = {
          customRequest: async (options) => {
            const { file, onSuccess, onError, onProgress } = options;
            onProgress?.({ percent: 30 });

            try {
              const result = await supplierQuestionnaireService.uploadSupplierFile(file as File);
              if (result.success && result.key) {
                onProgress?.({ percent: 100 });
                onSuccess?.({ url: result.url, key: result.key }, file as any);
                message.success(`File uploaded successfully`);
                // Store the file key in form
                form.setFieldValue(field.name.split('.'), result.key);
              } else {
                onError?.(new Error(result.message || 'Upload failed'));
                message.error(result.message || 'Upload failed');
              }
            } catch (error: any) {
              onError?.(error);
              message.error('Upload failed');
            }
          },
          maxCount: 1,
          accept: '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg',
          showUploadList: false,
        };

        // Extract filename from file key
        const getFileName = (key: string) => {
          if (!key) return '';
          const parts = key.split('/');
          const fileName = parts[parts.length - 1];
          // Remove the prefix (IMG-timestamp-uuid-)
          const match = fileName.match(/^[A-Z]+-\d+-[a-f0-9-]+-(.+)$/);
          return match ? match[1] : fileName;
        };

        inputComponent = (
          <div>
            {currentFileKey ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircleOutlined className="text-green-600" />
                <span className="flex-1 text-sm text-gray-700 truncate" title={getFileName(currentFileKey)}>
                  {getFileName(currentFileKey)}
                </span>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    form.setFieldValue(field.name.split('.'), undefined);
                    // Force re-render
                    form.validateFields([field.name.split('.')]);
                  }}
                />
                <Upload {...fileUploadProps}>
                  <Button size="small" icon={<UploadOutlined />}>
                    Replace
                  </Button>
                </Upload>
              </div>
            ) : (
              <Upload {...fileUploadProps}>
                <Button icon={<UploadOutlined />} className="hover:border-green-400 hover:text-green-600">
                  Click to Upload
                </Button>
              </Upload>
            )}
            {field.placeholder && (
              <div className="text-xs text-gray-500 mt-2">{field.placeholder}</div>
            )}
          </div>
        );
        break;
      default:
        inputComponent = <Input {...commonProps} />;
    }

    // For single checkbox (without options), use valuePropName="checked"
    const isSingleCheckbox = field.type === 'checkbox' && !field.options;
    
    return (
      <Form.Item
        key={field.name}
        name={field.name.split('.')}
        valuePropName={isSingleCheckbox ? "checked" : undefined}
        label={
          <div className="flex items-center gap-2">
            <span>{field.label}</span>
            {field.required && <span className="text-red-500">*</span>}
            {field.placeholder && field.type !== 'checkbox' && (
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
                  if (isSingleCheckbox) {
                    return questionNumber 
                      ? `Please check this box to acknowledge ${questionNumber.slice(0, -1)}`
                      : `This field is required. Please check the box to continue.`;
                  }
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
              // Watch for changes in tables with dependent dropdowns
              const fieldPath = field.name.split('.');
              const getNestedValue = (obj: any, path: string[]) => {
                return path.reduce((acc, key) => acc?.[key], obj);
              };
              const prevList = getNestedValue(prevValues, fieldPath) || [];
              const currList = getNestedValue(currentValues, fieldPath) || [];

              if (prevList.length !== currList.length) return true;

              // Check if any dependent field values changed
              const hasDependentColumns = field.columns?.some(c => c.dependsOnField);
              if (hasDependentColumns) {
                return prevList.some((prevRow: any, index: number) => {
                  const currRow = currList[index];
                  return field.columns?.some(col => {
                    if (col.dependsOnField) {
                      return prevRow?.[col.dependsOnField] !== currRow?.[col.dependsOnField];
                    }
                    return false;
                  });
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

                  // Check if this column has a dependent dropdown
                  const hasDependentDropdown = col.apiDropdown && col.dependsOnField;

                  // Check if this column's value is depended on by another column
                  const isDependedOn = field.columns?.some(c => c.dependsOnField === col.name);

                  // Determine display label for client mode
                  let displayLabel = col.label;
                  if (isClientMode) {
                    if (col.name === 'mpn') {
                      displayLabel = 'Product Code';
                    } else if (col.name === 'component_name') {
                      displayLabel = 'Product Name';
                    }
                  }

                  return {
                    title: (
                      <div className="flex items-center gap-1">
                        <span>{displayLabel}</span>
                        {col.required && <span className="text-red-500">*</span>}
                        {col.apiDropdown && dropdownLoading[col.apiDropdown] && (
                          <LoadingOutlined className="text-blue-500 text-xs" />
                        )}
                      </div>
                    ),
                    dataIndex: col.name,
                    key: col.name,
                    width: col.type === 'number' ? 120 : undefined,
                    render: (_: any, fieldRecord: any) => {
                      const fieldPath = field.name.split('.');

                      // Handle dependent dropdown (e.g., sub_fuel_type depends on fuel_type)
                      if (hasDependentDropdown) {
                        const rowValues = form.getFieldValue([...fieldPath, fieldRecord.name]);
                        const parentValue = rowValues?.[col.dependsOnField!];
                        const currentValue = rowValues?.[col.name];

                        // Get cached dependent options (fetched when parent was selected)
                        const dependentOptions = getDropdownItems(col.apiDropdown!, col.dependsOnField, parentValue);
                        const isLoadingDependent = parentValue ? dropdownLoading[`${col.apiDropdown}_${parentValue}`] : false;

                        // Check if current value exists in options, if not clear it
                        const isValueValid = !currentValue || dependentOptions.some(opt => opt.id === currentValue);
                        if (!isValueValid && currentValue) {
                          // Clear invalid value asynchronously to avoid render issues
                          setTimeout(() => {
                            form.setFieldValue([...fieldPath, fieldRecord.name, col.name], null);
                            form.setFieldValue([...fieldPath, fieldRecord.name, `${col.name}_name`], null);
                          }, 0);
                        }

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
                              placeholder={parentValue ? col.placeholder : `Select ${col.dependsOnField?.replace('_', ' ')} first`}
                              style={{ minWidth: 120, width: '100%' }}
                              mode={col.mode}
                              disabled={!parentValue}
                              loading={isLoadingDependent}
                              allowClear
                              showSearch={dependentOptions.length > 5}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                              onChange={(value) => {
                                // Store the display name for combining in payload
                                const selectedOption = dependentOptions.find((opt: DropdownItem) => opt.id === value);
                                if (selectedOption) {
                                  form.setFieldValue([...fieldPath, fieldRecord.name, `${col.name}_name`], selectedOption.name);
                                } else {
                                  form.setFieldValue([...fieldPath, fieldRecord.name, `${col.name}_name`], null);
                                }
                              }}
                            >
                              {dependentOptions.map((opt: DropdownItem) => (
                                <Select.Option key={opt.id} value={opt.id}>{opt.name}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        );
                      }

                      // Handle API dropdown that other columns depend on (parent dropdown)
                      if (col.apiDropdown && isDependedOn) {
                        const apiOptions = getDropdownItems(col.apiDropdown);
                        const isLoadingApi = dropdownLoading[col.apiDropdown];

                        // Find dependent column to clear its value when this changes
                        const dependentCol = field.columns?.find(c => c.dependsOnField === col.name);

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
                              loading={isLoadingApi}
                              showSearch={apiOptions.length > 5}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                              onChange={(value) => {
                                // Store the display name for combining in payload
                                const selectedOption = apiOptions.find((opt: DropdownItem) => opt.id === value);
                                if (selectedOption) {
                                  form.setFieldValue([...fieldPath, fieldRecord.name, `${col.name}_name`], selectedOption.name);
                                } else {
                                  form.setFieldValue([...fieldPath, fieldRecord.name, `${col.name}_name`], null);
                                }

                                // Clear dependent column value when parent changes
                                if (dependentCol) {
                                  const dependentFieldPath = [...fieldPath, fieldRecord.name, dependentCol.name];
                                  form.setFieldValue(dependentFieldPath, null);
                                  form.setFieldValue([...fieldPath, fieldRecord.name, `${dependentCol.name}_name`], null);
                                  // Force form to recognize the change
                                  form.setFields([{ name: dependentFieldPath, value: null, errors: [] }]);
                                }
                                // Trigger fetch of dependent options
                                if (dependentCol?.apiDropdown === 'subFuelTypeByFuel') {
                                  fetchDependentDropdown('subFuelTypeByFuel', value);
                                } else if (dependentCol?.apiDropdown === 'energyTypeBySource') {
                                  fetchDependentDropdown('energyTypeBySource', value);
                                }
                              }}
                            >
                              {apiOptions.map((opt: DropdownItem) => (
                                <Select.Option key={opt.id} value={opt.id}>{opt.name}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        );
                      }

                      // Handle BOM Materials dropdown (derived from products_manufactured)
                      if (col.apiDropdown === 'bomMaterials') {
                        // Get products_manufactured data from form
                        const productsManufactured = form.getFieldValue(['product_details', 'products_manufactured']) || [];
                        const bomMaterialOptions: DropdownItem[] = productsManufactured.map((item: any) => ({
                          id: item.material_number || item.mpn || '',
                          name: `${item.material_number || item.mpn || ''} - ${item.product_name || ''}`,
                          bom_id: item.bom_id || '',
                        })).filter((opt: DropdownItem) => opt.id);

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
                              style={{ minWidth: 150, width: '100%' }}
                              showSearch
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                              onChange={(value) => {
                                // Find the selected item to get the bom_id
                                const selectedItem = bomMaterialOptions.find((opt: any) => opt.id === value);
                                if (selectedItem && selectedItem.bom_id) {
                                  // Set the bom_id in the row data
                                  form.setFieldValue([...fieldPath, fieldRecord.name, 'bom_id'], selectedItem.bom_id);
                                }
                              }}
                            >
                              {bomMaterialOptions.map((opt: any) => (
                                <Select.Option key={opt.id} value={opt.id}>{opt.name}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        );
                      }

                      // Handle simple API dropdown (no dependencies)
                      if (col.apiDropdown && !hasDependentDropdown && !isDependedOn) {
                        const apiOptions = getDropdownItems(col.apiDropdown);
                        const isLoadingApi = dropdownLoading[col.apiDropdown];

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
                              loading={isLoadingApi}
                              showSearch={apiOptions.length > 5}
                              filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {apiOptions.map((opt: DropdownItem) => (
                                <Select.Option key={opt.id} value={opt.id}>{opt.name}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        );
                      }

                      // Default rendering for columns without API dropdown
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
