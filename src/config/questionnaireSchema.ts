import { QUESTIONNAIRE_OPTIONS } from './questionnaireConfig';

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'checkbox' 
  | 'textarea' 
  | 'date' 
  | 'file' 
  | 'table' 
  | 'group'
  | 'info'; // For static text/info blocks

export interface QuestionnaireOption {
  label: string;
  value: string | number;
}

export interface QuestionnaireField {
  name: string; // Data key (path in the data object)
  label?: string; // Display label
  type: FieldType;
  options?: string[] | QuestionnaireOption[]; // For select
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  dependency?: {
    field: string;
    value: any;
    operator?: 'eq' | 'neq' | 'contains'; // default eq
  };
  // For tables
  columns?: QuestionnaireField[];
  addButtonLabel?: string;
  // For groups
  fields?: QuestionnaireField[];
  // For numbers
  min?: number;
  max?: number;
  // For text
  maxLength?: number;
  // For info
  content?: React.ReactNode;
  className?: string;
  mode?: 'multiple' | 'tags';
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description?: string;
  fields: QuestionnaireField[];
}

export const QUESTIONNAIRE_SCHEMA: QuestionnaireSection[] = [
  {
    id: 'general_information',
    title: 'General Information',
    fields: [
      {
        name: 'gdpr_notice',
        type: 'info',
        content: 'All information provided is confidential and used only for corporate and product-level sustainability assessment.',
        label: 'GDPR Notice',
        className: 'bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700'
      },
      {
        name: 're_technologies_info',
        type: 'info',
        label: 'Eligible Renewable Electricity (RE) Technologies',
        content: 'Please read and acknowledge the following eligible technologies considered as renewable electricity: Wind, Hydro, Solar power, Geothermal, Biomass, Ocean-based energy. Excluded: Nuclear, Waste combustion.',
        className: 'bg-white p-6 rounded-lg border border-gray-200 mb-4'
      },
      {
        name: 'general_information.re_technologies_acknowledgement',
        label: 'I acknowledge that I have read and understood the eligible technologies considered as renewable electricity (RE).',
        type: 'checkbox',
      },
      {
        name: 're_procurement_info',
        type: 'info',
        label: 'Renewable Electricity Procurement Mechanisms',
        content: 'Electricity is regarded as renewable if provided using one of the mechanisms below (PPA, EAC, iREC, GOO).',
        className: 'bg-white p-6 rounded-lg border border-gray-200 mb-4'
      },
      {
        name: 'general_information.re_procurement_acknowledgement',
        label: 'I acknowledge that I have read and understood the procurement mechanisms mentioned above.',
        type: 'checkbox',
      },
      {
        name: 'double_counting_info',
        type: 'info',
        label: 'Double Counting',
        content: 'Please acknowledge that the mechanism used does not fall under double counting.',
        className: 'bg-white p-6 rounded-lg border border-gray-200 mb-4'
      },
      {
        name: 'general_information.double_counting_acknowledgement',
        label: 'I acknowledge my mechanisms do not fall under double counting.',
        type: 'checkbox',
      }
    ]
  },
  {
    id: 'organization_details',
    title: 'Organization Details',
    fields: [
      {
        name: 'organization_details.organization_name',
        label: 'Organization Name',
        type: 'text',
        required: true,
        placeholder: 'Enter organization name',
      },
      {
        name: 'organization_details.core_business_activities',
        label: 'Core Business Activities',
        type: 'select',
        options: QUESTIONNAIRE_OPTIONS.CORE_BUSINESS_ACTIVITIES,
        required: true,
        placeholder: 'Select activity',
      },
      {
        name: 'organization_details.core_business_activities_other',
        label: 'Specify Other Activity',
        type: 'text',
        placeholder: 'Specify other activity',
        dependency: {
          field: 'organization_details.core_business_activities',
          value: 'Others'
        }
      },
      {
        name: 'organization_details.designation',
        label: 'Designation / Role / Title',
        type: 'text',
        required: true,
        placeholder: 'Enter designation',
      },
      {
        name: 'organization_details.email_address',
        label: 'Email Address',
        type: 'text', // Could be email type if supported
        required: true,
        placeholder: 'Enter email address',
      },
      {
        name: 'organization_details.number_of_employees',
        label: 'Number of Employees',
        type: 'select',
        options: QUESTIONNAIRE_OPTIONS.NUMBER_OF_EMPLOYEES,
        required: true,
        placeholder: 'Select range',
      },
      {
        name: 'organization_details.annual_revenue',
        label: 'Annual Revenue',
        type: 'select',
        options: QUESTIONNAIRE_OPTIONS.ANNUAL_REVENUE,
        required: true,
        placeholder: 'Select revenue range',
      },
      {
        name: 'organization_details.annual_reporting_period',
        label: 'Annual Reporting Period',
        type: 'select',
        options: QUESTIONNAIRE_OPTIONS.ANNUAL_REPORTING_PERIOD,
        required: true,
        placeholder: 'Select reporting period',
      },
      {
        name: 'organization_details.availability_of_emissions_data',
        label: 'Availability of Scope 1, 2, 3 Emissions Data',
        type: 'checkbox',
      },
      {
        name: 'organization_details.emission_data',
        label: 'Emission Data',
        type: 'table',
        addButtonLabel: 'Add Row',
        dependency: {
          field: 'organization_details.availability_of_emissions_data',
          value: true
        },
        columns: [
          {
            name: 'country',
            label: 'Country (ISO3)',
            type: 'text',
            placeholder: 'ISO3 Code'
          },
          {
            name: 'scope_1',
            label: 'Scope 1',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'scope_2',
            label: 'Scope 2',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'scope_3',
            label: 'Scope 3',
            type: 'number',
            placeholder: '0.00'
          }
        ]
      }
    ]
  },
  {
    id: 'product_details',
    title: 'Product Details',
    fields: [
      {
        name: 'product_details.existing_pcf_report',
        label: 'Do you have an existing PCF Report (within last 12 months)?',
        type: 'checkbox',
      },
      {
        name: 'product_details.pcf_methodology',
        label: 'PCF Methodology Used',
        type: 'text',
        placeholder: 'e.g., ISO 14067, GHG Protocol',
        dependency: {
          field: 'product_details.existing_pcf_report',
          value: true
        }
      },
      {
        name: 'product_details.pcf_report_file', // Placeholder for file
        label: 'Upload PCF Report',
        type: 'file',
        dependency: {
          field: 'product_details.existing_pcf_report',
          value: true
        }
      },
      {
        name: 'product_details.production_site_details',
        label: 'Production Site Details',
        type: 'table',
        addButtonLabel: 'Add Site',
        columns: [
          {
            name: 'component_name',
            label: 'Component / Product Name',
            type: 'text',
            placeholder: 'Enter name'
          },
          {
            name: 'location',
            label: 'Location',
            type: 'text',
            placeholder: 'Enter location'
          }
        ]
      },
      {
        name: 'product_details.required_environmental_impact_methods',
        label: 'Required Environmental Impact Methods',
        type: 'checkbox', // This needs to be a multi-select checkbox group
        options: QUESTIONNAIRE_OPTIONS.REQUIRED_ENVIRONMENTAL_IMPACT_METHODS,
        // Special handling might be needed for multi-checkbox
      },
      {
        name: 'product_details.products_manufactured',
        label: 'Products / Components Manufactured',
        type: 'table',
        addButtonLabel: 'Add Product',
        columns: [
          {
            name: 'product_name',
            label: 'Product / Component',
            type: 'text',
            placeholder: 'Enter name'
          },
          {
            name: 'production_period',
            label: 'Production Period',
            type: 'select',
            options: ['Monthly', 'Annual'],
            placeholder: 'Select period'
          },
          {
            name: 'weight_per_unit',
            label: 'Weight per Unit',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'select',
            options: ['kg', 'tons'],
            placeholder: 'Select unit'
          },
          {
            name: 'price',
            label: 'Price',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            placeholder: '0'
          }
        ]
      }
    ]
  },
  {
    id: 'scope_1',
    title: 'Scope 1 Emissions',
    fields: [
      {
        name: 'scope_1.stationary_combustion',
        label: '3.1 Stationary Combustion (On-site Energy Use)',
        type: 'table',
        addButtonLabel: 'Add Fuel',
        columns: [
          {
            name: 'fuel_type',
            label: 'Fuel Category',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.FUEL_TYPES,
            placeholder: 'Select fuel category'
          },
          {
            name: 'sub_fuel_type',
            label: 'Sub-fuel Type',
            type: 'select',
            // This needs dynamic options based on fuel_type row value. 
            // Complex dependency handling might be needed in the form component.
            options: ["Petrol", "Diesel", "Kerosene", "Coal", "Wood", "Other"], // Placeholder, handled in component
            placeholder: 'Select sub-fuel type',
            mode: 'multiple'
          },
          {
            name: 'quantity',
            label: 'Consumption Quantity',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'select',
            options: ['liters', 'kg', 'm3', 'kWh'],
            placeholder: 'Select unit'
          }
        ]
      },
      {
        name: 'scope_1.mobile_combustion',
        label: '3.2 Mobile Combustion (Company-owned Vehicles)',
        type: 'table',
        addButtonLabel: 'Add Vehicle Fuel',
        columns: [
          {
            name: 'fuel_type',
            label: 'Fuel Type',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.VEHICLE_FUEL_TYPES,
            placeholder: 'Select fuel type'
          },
          {
            name: 'quantity',
            label: 'Annual Consumption',
            type: 'number',
            placeholder: 'Quantity'
          }
        ]
      },
      {
        name: 'scope_1.fugitive_emissions.refrigerant_top_ups',
        label: 'Refrigerant Top-ups Performed?',
        type: 'checkbox',
      },
      {
        name: 'scope_1.fugitive_emissions.refrigerants',
        label: 'Refrigerants',
        type: 'table',
        addButtonLabel: 'Add Refrigerant',
        dependency: {
          field: 'scope_1.fugitive_emissions.refrigerant_top_ups',
          value: true
        },
        columns: [
          {
            name: 'type',
            label: 'Refrigerant Type',
            type: 'text',
            placeholder: 'Enter type'
          },
          {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'text',
            placeholder: 'Enter unit'
          }
        ]
      },
      {
        name: 'scope_1.process_emissions.present',
        label: 'Industrial Process Emissions Present?',
        type: 'checkbox',
      },
      {
        name: 'scope_1.process_emissions.sources',
        label: 'Process Emissions Sources',
        type: 'table',
        addButtonLabel: 'Add Source',
        dependency: {
          field: 'scope_1.process_emissions.present',
          value: true
        },
        columns: [
          {
            name: 'source',
            label: 'Source',
            type: 'text',
            placeholder: 'Enter source'
          },
          {
            name: 'gas_type',
            label: 'Gas Type',
            type: 'select',
            options: ['CO2', 'CH4', 'N2O'],
            placeholder: 'Select gas'
          },
          {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'text',
            placeholder: 'Enter unit'
          }
        ]
      }
    ]
  },
  {
    id: 'scope_2',
    title: 'Scope 2 Emissions',
    fields: [
      {
        name: 'scope_2.purchased_energy',
        label: 'Section 4: Scope 2 – Indirect Emissions from Purchased Energy',
        type: 'table',
        addButtonLabel: 'Add Energy',
        columns: [
          {
            name: 'energy_source',
            label: 'Energy Source',
            type: 'select',
            options: ['Electricity', 'Heating', 'Cooling', 'Steam'],
            placeholder: 'Select source'
          },
          {
            name: 'energy_type',
            label: 'Energy Type',
            type: 'select',
            options: ['Grid', 'Renewable'],
            placeholder: 'Select type'
          },
          {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'text',
            placeholder: 'e.g. MWh'
          }
        ]
      },
      {
        name: 'scope_2.standardized_re_certificates',
        label: 'Standardized RE Certificates Acquired?',
        type: 'checkbox',
      },
      {
        name: 'scope_2.certificates',
        label: 'Certificates',
        type: 'table',
        addButtonLabel: 'Add Certificate',
        dependency: {
          field: 'scope_2.standardized_re_certificates',
          value: true
        },
        columns: [
          {
            name: 'name',
            label: 'Certificate Name',
            type: 'text',
            placeholder: 'Enter name'
          },
          {
            name: 'procurement_mechanism',
            label: 'Mechanism',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.RE_PROCUREMENT_MECHANISMS,
            placeholder: 'Select mechanism'
          },
          {
            name: 'serial_id',
            label: 'Serial ID',
            type: 'text',
            placeholder: 'Enter ID'
          },
          {
            name: 'generator_id',
            label: 'Generator ID',
            type: 'text',
            placeholder: 'Enter Generator ID'
          },
          {
            name: 'generator_name',
            label: 'Generator Name',
            type: 'text',
            placeholder: 'Enter Generator Name'
          },
          {
            name: 'generator_location',
            label: 'Generator Location',
            type: 'text',
            placeholder: 'Enter Location'
          },
          {
            name: 'date_of_generation',
            label: 'Date of Generation',
            type: 'text',
            placeholder: 'YYYY-MM-DD'
          },
          {
            name: 'issuance_date',
            label: 'Issuance Date',
            type: 'text',
            placeholder: 'YYYY-MM-DD'
          }
        ]
      },
      // 4.1 Manufacturing Process-specific energy
      {
        name: 'scope_2.manufacturing_process_header',
        type: 'info',
        label: '4.1 Manufacturing Process-specific energy',
        className: 'text-lg font-semibold text-gray-900 mt-6 mb-4'
      },
      {
        name: 'scope_2.manufacturing_process_specific_energy.allocation_methodology',
        label: 'Do you have any device or methodology to calculate from factory level to product level energy?',
        type: 'checkbox',
      },
      {
        name: 'scope_2.manufacturing_process_specific_energy.methodology_document',
        label: 'Provide detailed Methodology (Link or document)',
        type: 'text',
        placeholder: 'https://...',
        dependency: {
          field: 'scope_2.manufacturing_process_specific_energy.allocation_methodology',
          value: true
        }
      },
      {
        name: 'scope_2.manufacturing_process_specific_energy.energy_intensity',
        label: 'Energy intensity of production estimated kWh or MJ per unit of product',
        type: 'table',
        addButtonLabel: 'Add Product',
        columns: [
          {
            name: 'product_name',
            label: 'Product/Component Name',
            type: 'text',
            placeholder: 'Name'
          },
          {
            name: 'energy_intensity',
            label: 'Energy intensity',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.ENERGY_UNITS,
            placeholder: 'Select unit'
          }
        ]
      },
      {
        name: 'scope_2.manufacturing_process_specific_energy.process_energy_usage',
        label: 'Process-specific energy usage',
        type: 'table',
        addButtonLabel: 'Add Process',
        columns: [
          {
            name: 'process_type',
            label: 'Process-specific energy type',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.PROCESS_SPECIFIC_ENERGY_USAGE,
            placeholder: 'Select type'
          },
          {
            name: 'quantity',
            label: 'Quantity Consumed per product',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.ENERGY_UNITS,
            placeholder: 'Select unit'
          }
        ]
      },
      {
        name: 'scope_2.manufacturing_process_specific_energy.abatement_systems',
        label: 'Do you use any abatement systems (VOC treatment, heat recovery)?',
        type: 'checkbox',
      },
      {
        name: 'scope_2.manufacturing_process_specific_energy.abatement_energy_consumption',
        label: 'Abatement source energy consumption',
        type: 'table',
        addButtonLabel: 'Add System',
        dependency: {
          field: 'scope_2.manufacturing_process_specific_energy.abatement_systems',
          value: true
        },
        columns: [
          {
            name: 'source',
            label: 'Abatement system source',
            type: 'text',
            placeholder: 'Source'
          },
          {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.ENERGY_UNITS,
            placeholder: 'Select unit'
          }
        ]
      },
      {
        name: 'scope_2.water_consumption',
        label: 'Provide Water consumption and treatment details (if significant for your product)',
        type: 'textarea',
        placeholder: 'Enter details...',
      },
      // 4.2 Quality control in production
      {
        name: 'scope_2.quality_control_header',
        type: 'info',
        label: '4.2 Quality control in production',
        className: 'text-lg font-semibold text-gray-900 mt-6 mb-4'
      },
      {
        name: 'scope_2.quality_control.equipment',
        label: 'What types of quality control/testing equipment do you use?',
        type: 'table',
        addButtonLabel: 'Add Equipment',
        columns: [
          {
            name: 'equipment_name',
            label: 'Equipment Name',
            type: 'text',
            placeholder: 'Name'
          },
          {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            placeholder: '0'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'text',
            placeholder: 'Unit'
          },
          {
            name: 'operating_hours',
            label: 'Avg. Operating Hours per Month',
            type: 'number',
            placeholder: '0'
          }
        ]
      },
      {
        name: 'scope_2.quality_control.electricity_consumption',
        label: 'How much electricity is consumed for quality control activities?',
        type: 'table',
        addButtonLabel: 'Add Consumption',
        columns: [
          {
            name: 'energy_type',
            label: 'Energy Type',
            type: 'text',
            placeholder: 'Type'
          },
          {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.ENERGY_UNITS,
            placeholder: 'Select unit'
          },
          {
            name: 'period',
            label: 'Period',
            type: 'select',
            options: ['Monthly', 'Annually'],
            placeholder: 'Select period'
          }
        ]
      },
      {
        name: 'scope_2.quality_control.compressed_air',
        label: 'Do your quality control processes use compressed air, nitrogen, or other utilities?',
        type: 'table',
        addButtonLabel: 'Add Utility',
        columns: [
          {
            name: 'process_name',
            label: 'Process Name',
            type: 'text',
            placeholder: 'Name'
          },
          {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.ENERGY_UNITS,
            placeholder: 'Select unit'
          },
          {
            name: 'period',
            label: 'Period',
            type: 'select',
            options: ['Monthly', 'Annually'],
            placeholder: 'Select period'
          }
        ]
      },
      {
        name: 'scope_2.quality_control.consumables',
        label: 'Do quality control activities use any consumables?',
        type: 'table',
        addButtonLabel: 'Add Consumable',
        columns: [
          {
            name: 'consumable_name',
            label: 'Consumable Name',
            type: 'text',
            placeholder: 'Name'
          },
          {
            name: 'mass',
            label: 'Mass of Consumables',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'text',
            placeholder: 'kg'
          },
          {
            name: 'period',
            label: 'Period',
            type: 'select',
            options: ['Monthly', 'Annually'],
            placeholder: 'Select period'
          }
        ]
      },
      {
        name: 'scope_2.quality_control.destructive_testing',
        label: 'Do you perform destructive testing?',
        type: 'checkbox',
      },
      {
        name: 'scope_2.quality_control.destructive_testing_details',
        label: 'Weight of samples destroyed',
        type: 'table',
        addButtonLabel: 'Add Sample',
        dependency: {
          field: 'scope_2.quality_control.destructive_testing',
          value: true
        },
        columns: [
          {
            name: 'component_name',
            label: 'Component Name',
            type: 'text',
            placeholder: 'Name'
          },
          {
            name: 'weight',
            label: 'Weight',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'text',
            placeholder: 'kg'
          },
          {
            name: 'period',
            label: 'Period',
            type: 'select',
            options: ['Monthly', 'Annually'],
            placeholder: 'Select period'
          }
        ]
      },
      {
        name: 'scope_2.quality_control.defect_rate',
        label: 'What is the defect or rejection rate identified by quality control inspections?',
        type: 'table',
        addButtonLabel: 'Add Rate',
        columns: [
          {
            name: 'component_name',
            label: 'Component Name',
            type: 'text',
            placeholder: 'Name'
          },
          {
            name: 'percentage',
            label: 'Percentage (%) per product/component',
            type: 'number',
            placeholder: '0-100'
          }
        ]
      },
      {
        name: 'scope_2.quality_control.rework_rate',
        label: 'What is the rework rate due to quality control findings?',
        type: 'table',
        addButtonLabel: 'Add Rate',
        columns: [
          {
            name: 'component_name',
            label: 'Component Name',
            type: 'text',
            placeholder: 'Name'
          },
          {
            name: 'processes_involved',
            label: 'Processes involved',
            type: 'text',
            placeholder: 'Processes'
          },
          {
            name: 'percentage',
            label: 'Percentage (%) per product/component',
            type: 'number',
            placeholder: '0-100'
          }
        ]
      },
      {
        name: 'scope_2.quality_control.waste',
        label: 'What are the types and weight of Quality control waste generated and treated?',
        type: 'table',
        addButtonLabel: 'Add Waste',
        columns: [
          {
            name: 'waste_type',
            label: 'Waste Type',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.WASTE_TYPES,
            placeholder: 'Select type'
          },
          {
            name: 'weight',
            label: 'Waste Weight',
            type: 'number',
            placeholder: '0.00'
          },
          {
            name: 'unit',
            label: 'Unit',
            type: 'text',
            placeholder: 'kg'
          },
          {
            name: 'treatment_type',
            label: 'Treatment type',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.WASTE_TREATMENT_TYPES,
            placeholder: 'Select treatment'
          }
        ]
      },
      // 4.3 IT for process and manufacturing control
      {
        name: 'scope_2.it_header',
        type: 'info',
        label: '4.3 Information Technology (IT) for process and manufacturing control',
        className: 'text-lg font-semibold text-gray-900 mt-6 mb-4'
      },
      {
        name: 'scope_2.it_for_production.systems_used',
        label: 'What IT systems do you use for production control?',
        type: 'checkbox', // Multi-select
        options: QUESTIONNAIRE_OPTIONS.IT_SYSTEMS
      },
      {
        name: 'scope_2.it_for_production.hardware_energy_consumption_tracked',
        label: 'What is the total energy consumption of IT hardware or on-site servers or data centres related to production?',
        type: 'checkbox', // Yes/No
      },
      {
        name: 'scope_2.it_for_production.hardware_energy_included',
        label: 'Is this Energy consumption included in the total energy purchased section-2?',
        type: 'checkbox',
        dependency: {
            field: 'scope_2.it_for_production.hardware_energy_consumption_tracked',
            value: true
        }
      },
      {
        name: 'scope_2.it_for_production.hardware_energy_consumption',
        label: 'Please write the energy consumption',
        type: 'table',
        addButtonLabel: 'Add Consumption',
        dependency: {
            field: 'scope_2.it_for_production.hardware_energy_included',
            value: false // "If NO in Q43"
        },
        columns: [
            {
                name: 'energy_source',
                label: 'Energy Source',
                type: 'select',
                options: ['Electricity', 'Heating', 'Cooling', 'Steam'],
                placeholder: 'Select source'
            },
            {
                name: 'energy_type',
                label: 'Energy Type',
                type: 'select',
                options: ['Grid', 'Renewable'],
                placeholder: 'Select type'
            },
            {
                name: 'quantity',
                label: 'Quantity',
                type: 'number',
                placeholder: '0.00'
            },
            {
                name: 'unit',
                label: 'Unit',
                type: 'select',
                options: QUESTIONNAIRE_OPTIONS.ENERGY_UNITS,
                placeholder: 'Select unit'
            }
        ]
      },
      {
        name: 'scope_2.it_for_production.cloud_systems',
        label: 'Do you use cloud-based systems for production or Quality control?',
        type: 'checkbox',
      },
      {
        name: 'scope_2.it_for_production.cloud_usage',
        label: 'Cloud provider name and approximate monthly compute usage',
        type: 'table',
        addButtonLabel: 'Add Provider',
        dependency: {
            field: 'scope_2.it_for_production.cloud_systems',
            value: true
        },
        columns: [
            {
                name: 'provider_name',
                label: 'Cloud provider name',
                type: 'text',
                placeholder: 'AWS, Azure, etc.'
            },
            {
                name: 'virtual_machines',
                label: 'Virtual machines (CPU hours/month)',
                type: 'number',
                placeholder: '0'
            },
            {
                name: 'data_storage',
                label: 'Data storage (GB/month)',
                type: 'number',
                placeholder: '0'
            },
            {
                name: 'data_transfer',
                label: 'Data transfer (GB/month)',
                type: 'number',
                placeholder: '0'
            }
        ]
      },
      {
        name: 'scope_2.it_for_production.sensors',
        label: 'Are any dedicated monitoring sensors used for energy, temperature, pressure, or vibration?',
        type: 'table',
        addButtonLabel: 'Add Sensor',
        columns: [
            {
                name: 'type',
                label: 'Type of sensor',
                type: 'text',
                placeholder: 'Type'
            },
            {
                name: 'quantity',
                label: 'Sensor Quantity',
                type: 'number',
                placeholder: '0'
            },
            {
                name: 'energy_consumption',
                label: 'Energy Consumption',
                type: 'number',
                placeholder: '0.00'
            },
            {
                name: 'unit',
                label: 'Unit',
                type: 'select',
                options: QUESTIONNAIRE_OPTIONS.ENERGY_UNITS,
                placeholder: 'Select unit'
            }
        ]
      },
      {
        name: 'scope_2.it_for_production.sensor_replacement',
        label: 'What is the annual replacement rate for sensors or IT consumables?',
        type: 'table',
        addButtonLabel: 'Add Item',
        columns: [
            {
                name: 'consumable_name',
                label: 'Consumable Name',
                type: 'text',
                placeholder: 'Name'
            },
            {
                name: 'quantity',
                label: 'Quantity',
                type: 'number',
                placeholder: '0'
            },
            {
                name: 'unit',
                label: 'Unit',
                type: 'text',
                placeholder: 'Unit'
            }
        ]
      },
      {
        name: 'scope_2.it_for_production.cooling_systems',
        label: 'Do you use any cooling systems for server rooms?',
        type: 'checkbox',
      },
      {
        name: 'scope_2.it_for_production.cooling_energy_included',
        label: 'Is this Energy consumption included in the total energy purchased section-2?',
        type: 'checkbox',
        dependency: {
            field: 'scope_2.it_for_production.cooling_systems',
            value: true
        }
      },
      {
        name: 'scope_2.it_for_production.cooling_energy_consumption',
        label: 'Please write the energy consumption',
        type: 'table',
        addButtonLabel: 'Add Consumption',
        dependency: {
            field: 'scope_2.it_for_production.cooling_energy_included',
            value: false // "If NO in 50"
        },
        columns: [
            {
                name: 'energy_source',
                label: 'Energy Source',
                type: 'select',
                options: ['Electricity', 'Heating', 'Cooling', 'Steam'],
                placeholder: 'Select source'
            },
            {
                name: 'energy_type',
                label: 'Energy Type',
                type: 'select',
                options: ['Grid', 'Renewable'],
                placeholder: 'Select type'
            },
            {
                name: 'quantity',
                label: 'Quantity',
                type: 'number',
                placeholder: '0.00'
            },
            {
                name: 'unit',
                label: 'Unit',
                type: 'select',
                options: QUESTIONNAIRE_OPTIONS.ENERGY_UNITS,
                placeholder: 'Select unit'
            }
        ]
      }
    ]
  },
  {
    id: 'scope_3',
    title: 'Scope 3 Emissions',
    fields: [
      {
        name: 'scope_3.materials.raw_materials',
        label: 'Raw Materials Used in Component Manufacturing',
        type: 'table',
        addButtonLabel: 'Add Material',
        columns: [
          {
            name: 'material',
            label: 'Material',
            type: 'select',
            options: QUESTIONNAIRE_OPTIONS.RAW_MATERIALS,
            placeholder: 'Select material'
          },
          {
            name: 'composition_percent',
            label: '% Composition',
            type: 'number',
            placeholder: '0-100'
          }
        ]
      },
      {
        name: 'scope_3.materials.metal_grade',
        label: 'Grade of Metal Used',
        type: 'text',
        placeholder: 'Enter grade',
      },
      {
        name: 'scope_3.materials.msds',
        label: 'MSDS Link',
        type: 'text',
        placeholder: 'https://...'
      },
      {
        name: 'scope_3.materials.recycled_materials_used',
        label: 'Use of Recycled / Secondary Materials?',
        type: 'checkbox',
      },
      {
        name: 'scope_3.packaging.recycled_content_used',
        label: 'Use of Recycled Material in Packaging?',
        type: 'checkbox',
      },
      {
        name: 'scope_3.packaging.recycled_percent',
        label: 'Percentage of Recycled Content',
        type: 'number',
        dependency: {
          field: 'scope_3.packaging.recycled_content_used',
          value: true
        }
      },
      {
        name: 'scope_3.waste_disposal.recycled_percent',
        label: 'Percentage of Waste Recycled (Internal / External)',
        type: 'number',
        placeholder: '0-100',
      },
      {
        name: 'scope_3.logistics.emissions_tracked',
        label: 'Emissions Tracked for Raw Material Transport?',
        type: 'checkbox',
      },
      {
        name: 'scope_3.certifications.iso_certified',
        label: 'ISO 14001 or ISO 50001 Certified?',
        type: 'checkbox',
      },
      {
        name: 'scope_3.certifications.standards_followed',
        label: 'Standards Followed (ISO 14067, GHG Protocol, Catena-X, etc.)?',
        type: 'checkbox',
      },
      {
        name: 'scope_3.certifications.reporting_frameworks',
        label: 'Reporting to CDP / SBTi / Other ESG Frameworks?',
        type: 'checkbox',
      },
      {
        name: 'scope_3.certifications.additional_notes.reduction_measures',
        label: 'Measures to Reduce Carbon Emissions in Production',
        type: 'textarea',
        placeholder: 'Describe measures...',
      },
      {
        name: 'scope_3.certifications.additional_notes.initiatives',
        label: 'Company Sustainability Initiatives & Strategies',
        type: 'textarea',
        placeholder: 'Describe initiatives...',
      }
    ]
  },
  {
    id: 'scope_4',
    title: 'Scope 4 Emissions',
    fields: [
      {
        name: 'scope_4.products_reducing_customer_emissions',
        label: 'Products or Services that Help Reduce Customer Emissions',
        type: 'textarea',
        placeholder: 'Describe products/services...',
      },
      {
        name: 'scope_4.circular_economy_practices',
        label: 'Circular Economy Practices (Reuse, Take-back, EPR, Refurbishment)',
        type: 'textarea',
        placeholder: 'Describe practices...',
      },
      {
        name: 'scope_4.offset_projects',
        label: 'Renewable Energy / Carbon Offset Projects Implemented',
        type: 'textarea',
        placeholder: 'Describe projects...',
      }
    ]
  }
];
