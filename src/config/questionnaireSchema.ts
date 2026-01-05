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
            options: [], // Placeholder, handled in component
            placeholder: 'Select sub-fuel type'
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
          }
        ]
      },
      {
        name: 'scope_2.manufacturing_process_specific_energy.allocation_methodology',
        label: 'Methodology to Allocate Factory Energy to Product Level?',
        type: 'checkbox',
      },
      {
        name: 'scope_2.manufacturing_process_specific_energy.methodology_document',
        label: 'Methodology Details (Document URL)',
        type: 'text',
        placeholder: 'https://...',
        dependency: {
          field: 'scope_2.manufacturing_process_specific_energy.allocation_methodology',
          value: true
        }
      },
      {
        name: 'scope_2.manufacturing_process_specific_energy.abatement_systems',
        label: 'Abatement Systems Used (VOC treatment, heat recovery)?',
        type: 'checkbox',
      },
      {
        name: 'scope_2.it_for_production.systems_used',
        label: 'IT Systems Used',
        type: 'checkbox', // Multi-select checkbox
        options: QUESTIONNAIRE_OPTIONS.IT_SYSTEMS
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
