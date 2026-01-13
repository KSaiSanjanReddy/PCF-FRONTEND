/**
 * Service for Supplier Questionnaire and Data Quality Rating API Integration
 */

import authService from "./authService";

const API_BASE_URL = "https://enviguide.nextechltd.in";

// Response types
interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  code: number;
  data?: T;
  success?: boolean;
}

// UI Data Structure (CamelCase, Nested)
export interface SupplierQuestionnaireData {
  sgiq_id?: string;
  general_information: {
    gdpr_acknowledgement: boolean;
    re_technologies_acknowledgement: boolean;
    re_procurement_acknowledgement: boolean;
    double_counting_acknowledgement: boolean;
  };
  organization_details: {
    organization_name: string;
    core_business_activities: string;
    core_business_activities_other?: string;
    designation: string;
    email_address: string;
    number_of_employees: string;
    annual_revenue: string;
    annual_reporting_period: string;
    availability_of_emissions_data: boolean;
    emission_data?: {
      country: string;
      scope_1: number;
      scope_2: number;
      scope_3: number;
    }[];
  };
  product_details: {
    existing_pcf_report: boolean;
    pcf_methodology?: string[];
    pcf_report_file?: string[];
    production_site_details: {
      product_name: string; // Added
      location: string;
    }[];
    required_environmental_impact_methods: string[];
    products_manufactured: {
      product_name: string;
      production_period: string;
      weight_per_unit: number;
      unit: string;
      price: number;
      quantity: number;
    }[];
    any_co_product_have_economic_value?: boolean; // Added
    co_products?: { // Added
        product_name: string;
        co_product_name: string;
        weight: number;
        price_per_product: number;
        quantity: number;
    }[];
  };
  scope_1: {
    stationary_combustion: {
      fuel_type: string;
      sub_fuel_type?: { // Changed structure to match UI/API better if needed, but keeping UI structure for now
          sub_fuel_type: string;
          consumption_quantity: number;
          unit: string;
      }[];
    }[];
    mobile_combustion: {
      fuel_type: string;
      quantity: number;
      unit: string; // Added
    }[];
    fugitive_emissions: {
      refrigerant_top_ups: boolean;
      refrigerants?: {
        type: string;
        quantity: number;
        unit: string;
      }[];
    };
    process_emissions: {
      present: boolean;
      sources?: {
        source: string;
        gas_type: string;
        quantity: number;
        unit: string;
      }[];
    };
  };
  scope_2: {
    purchased_energy: {
      energy_source: string;
      energy_type: string;
      quantity: number;
      unit: string;
    }[];
    standardized_re_certificates: boolean;
    certificates?: {
      name: string;
      procurement_mechanism: string;
      serial_id: string;
      generator_id: string;
      generator_name: string;
      location: string;
      generation_date: string;
      issuance_date: string;
    }[];
    manufacturing_process_specific_energy: {
      allocation_methodology: boolean;
      methodology_document?: string[];
      energy_intensity_estimated: boolean; // Added
      energy_intensity: {
        product_name: string;
        intensity: number;
        unit: string;
      }[];
      process_specific_usage_enabled: boolean; // Added
      process_specific_usage: {
        process_type: string;
        quantity: number;
        unit: string;
        support_from_enviguide?: boolean;
      }[];
      abatement_systems: boolean;
      abatement_consumption?: {
        source: string; // Changed from system
        quantity: number;
        unit: string;
      }[];
      water_consumption_details: string;
    };
    quality_control: {
      equipment: {
        name: string;
        quantity: number;
        unit: string;
        operating_hours: string; // Changed to string to match "3h"
      }[];
      electricity_consumption: {
        type: string;
        quantity: number;
        unit: string;
        period: string;
      }[];
      utilities: { // quality_control_process_usage_questions
        name: string;
        quantity: number;
        unit: string;
        period: string;
      }[];
      utilities_pressure_flow: { // quality_control_process_usage_pressure_or_flow_questions
          name: string;
          quantity: number;
          unit: string;
          period: string;
      }[];
      consumables: {
        name: string;
        quantity: number;
        unit: string;
        period: string; // Added
      }[];
      destructive_testing: boolean;
      samples_destroyed?: {
        component_name: string; // Added
        weight: number;
        unit: string;
        period: string; // Added
      }[];
      defect_rate: {
        component_name: string; // Changed from product
        rate: number;
      }[];
      rework_rate: {
        component_name: string; // Changed from product
        processes_involved: string; // Added
        rate: number;
      }[];
      waste_generated: {
        type: string;
        quantity: number;
        unit: string; // Added
        treatment: string;
      }[];
    };
    it_for_production: {
      systems_used: string[];
      energy_consumption_related: boolean;
      included_in_total: boolean;
      consumption_details?: {
        energy_purchased: string; // Added
        energy_type: string; // Changed from type
        quantity: number;
        unit: string;
      }[];
      cloud_based_system: boolean; // Added
      cloud_provider_details?: { // Added
          cloud_provider_name: string;
          virtual_machines: string;
          data_storage: string;
          data_transfer: string;
      }[];
      dedicated_monitoring_sensors?: { // Added
          type_of_sensor: string;
          sensor_quantity: number;
          energy_consumption: string;
          unit: string;
      }[];
      sensor_replacement_rate?: { // Added
          consumable_name: string;
          quantity: number;
          unit: string;
      }[];
      cooling_system: boolean; // Added
      cooling_energy_included: boolean; // Added
      cooling_energy_consumption?: { // Added
          energy_purchased: string;
          energy_type: string;
          quantity: number;
          unit: string;
      }[];
    };
  };
  scope_3: {
    materials: {
      raw_materials: {
        material: string;
        composition_percent: number;
      }[];
      raw_materials_contact_support: boolean; // Added
      metal_grade: string;
      msds: string[];
      recycled_materials_used: boolean;
      recycled_materials?: {
        material: string;
        recycled_percent: number;
      }[];
      material_type_breakdown_available: boolean;
      material_type_percentages?: {
        type: string;
        percentage: string;
      }[];
      pir_pcr_breakdown: {
        material_type: string; // Changed from material
        percentage: string; // Changed structure
      }[];
    };
    packaging: {
      materials: {
        component_name: string; // Added
        type: string;
        size: number; // Changed to number
        unit: string; // Added
      }[];
      weight_per_unit: {
        component_name: string; // Added
        weight: number;
        unit: string;
      }[];
      recycled_content_used: boolean;
      recycled_percent?: string; // Changed to string
      electricity_used: boolean;
      included_in_total: boolean;
      energy_consumption?: {
        energy_purchased: string; // Added
        energy_type: string; // Changed
        quantity: number;
        unit: string;
      }[];
    };
    waste_disposal: {
      waste_details: {
        type: string;
        weight: number;
        unit: string;
        treatment: string;
      }[];
      recycled_percent: string; // Changed
      by_products_generated: boolean;
      by_products?: {
        component_name: string; // Added
        name: string;
        price: number;
        quantity: number;
      }[];
    };
    logistics: {
      emissions_tracked: boolean;
      emissions_data?: {
        material: string;
        // weight: number; // Removed
        mode: string;
        source: string;
        destination: string;
        co2e: string; // Changed to string
      }[];
      transport_modes?: {
        mode: string;
        weight: string; // Changed to string
        source: string;
        drop_point: string; // Changed from destination
        distance: string; // Changed to string
      }[];
      enviguide_support: boolean; // Added
      destination_plant: {
        country: string;
        state: string;
        city: string;
        pin: string;
      }[];
    };
    certifications: {
      iso_certified: boolean;
      standards_followed: boolean;
      reporting_frameworks: boolean;
      additional_notes: {
        reduction_measures: string;
        initiatives: string;
        strategies: string;
      };
    };
  };
  scope_4: {
    products_reducing_customer_emissions: string;
    circular_economy_practices: string;
    offset_projects: string;
  };
}

// API Payload Structure (Snake_case, Flat/Nested as per Postman)
interface SupplierQuestionnaireApiPayload {
    supplier_general_info_questions: {
        // bom_id: string; // These might be injected by backend or context
        // bom_pcf_id: string;
        // sup_id: string;
        ere_acknowledge: boolean;
        repm_acknowledge: boolean;
        dc_acknowledge: boolean;
        organization_name: string;
        core_business_activitiy: string;
        specify_other_activity: string | null;
        designation: string;
        email_address: string;
        no_of_employees: string;
        specify_other_no_of_employees: string | null;
        annual_revenue: string;
        specify_other_annual_revenue: string | null;
        annual_reporting_period: string;
        availability_of_scope_one_two_three_emissions_data: boolean;
        availability_of_scope_one_two_three_emissions_questions: {
            country_iso_three: string;
            scope_one: number;
            scope_two: number;
            scope_three: number;
        }[];
    };
    supplier_product_questions: {
        do_you_have_an_existing_pcf_report: boolean;
        pcf_methodology_used: string[];
        upload_pcf_report: string[];
        production_site_details_questions: {
            product_name: string;
            location: string;
        }[];
        required_environmental_impact_methods: string[];
        product_component_manufactured_questions: {
            product_name: string;
            production_period: string;
            weight_per_unit: number;
            unit: string;
            price: number;
            quantity: number;
        }[];
        any_co_product_have_economic_value: boolean;
        co_product_component_economic_value_questions: {
            product_name: string;
            co_product_name: string;
            weight: number;
            price_per_product: number;
            quantity: number;
        }[];
    };
    scope_one_direct_emissions_questions: {
        stationary_combustion_on_site_energy_use_questions: {
            fuel_type: string;
            scoseu_sub_fuel_type_questions: {
                sub_fuel_type: string;
                consumption_quantity: number;
                unit: string;
            }[];
        }[];
        mobile_combustion_company_owned_vehicles_questions: {
            fuel_type: string;
            quantity: number;
            unit: string;
        }[];
        refrigerant_top_ups_performed: boolean;
        refrigerants_questions: {
            refrigerant_type: string;
            quantity: number;
            unit: string;
        }[];
        industrial_process_emissions_present: boolean;
        process_emissions_sources_questions: {
            source: string;
            gas_type: string;
            quantity: number;
            unit: string;
        }[];
    };
    scope_two_indirect_emissions_questions: {
        scope_two_indirect_emissions_from_purchased_energy_questions: {
            energy_source: string;
            energy_type: string;
            quantity: number;
            unit: string;
        }[];
        do_you_acquired_standardized_re_certificates: boolean;
        scope_two_indirect_emissions_certificates_questions: {
            certificate_name: string;
            mechanism: string;
            serial_id: string;
            generator_id: string;
            generator_name: string;
            generator_location: string;
            date_of_generation: string;
            issuance_date: string;
        }[];
        methodology_to_allocate_factory_energy_to_product_level: boolean;
        methodology_details_document_url: string[];
        energy_intensity_of_production_estimated_kwhor_mj: boolean;
        energy_intensity_of_production_estimated_kwhor_mj_questions: {
            product_name: string;
            energy_intensity: number;
            unit: string;
        }[];
        process_specific_energy_usage: boolean;
        process_specific_energy_usage_questions: {
            process_specific_energy_type: string;
            quantity_consumed: number;
            unit: string;
            support_from_enviguide: boolean;
        }[];
        do_you_use_any_abatement_systems: boolean;
        abatement_systems_used_questions: {
            source: string;
            quantity: number;
            unit: string;
        }[];
        water_consumption_and_treatment_details: string;
        type_of_quality_control_equipment_usage_questions: {
            equipment_name: string;
            quantity: number;
            unit: string;
            avg_operating_hours_per_month: string;
        }[];
        electricity_consumed_for_quality_control_questions: {
            energy_type: string;
            quantity: number;
            unit: string;
            period: string;
        }[];
        quality_control_process_usage_questions: {
            process_name: string;
            quantity: number;
            unit: string;
            period: string;
        }[];
        quality_control_process_usage_pressure_or_flow_questions: {
            flow_name: string;
            quantity: number;
            unit: string;
            period: string;
        }[];
        quality_control_use_any_consumables_questions: {
            consumable_name: string;
            mass_of_consumables: number;
            unit: string;
            period: string;
        }[];
        do_you_perform_destructive_testing: boolean;
        weight_of_samples_destroyed_questions: {
            component_name: string;
            weight: number;
            unit: string;
            period: string;
        }[];
        defect_or_rejection_rate_identified_by_quality_control_questions: {
            component_name: string;
            percentage: number;
        }[];
        rework_rate_due_to_quality_control_questions: {
            component_name: string;
            processes_involved: string;
            percentage: number;
        }[];
        weight_of_quality_control_waste_generated_questions: {
            waste_type: string;
            waste_weight: number;
            unit: string;
            treatment_type: string;
        }[];
        it_system_use_for_production_control: string[];
        total_energy_consumption_of_it_hardware_production: boolean;
        energy_con_included_total_energy_pur_sec_two_qfortythree: boolean;
        energy_consumption_for_qfortyfour_questions: {
            energy_purchased: string;
            energy_type: string;
            quantity: number;
            unit: string;
        }[];
        do_you_use_cloud_based_system_for_production: boolean;
        cloud_provider_details_questions: {
            cloud_provider_name: string;
            virtual_machines: string;
            data_storage: string;
            data_transfer: string;
        }[];
        dedicated_monitoring_sensor_usage_questions: {
            type_of_sensor: string;
            sensor_quantity: number;
            energy_consumption: string;
            unit: string;
        }[];
        annual_replacement_rate_of_sensor_questions: {
            consumable_name: string;
            quantity: number; // Changed to number based on UI usage, though API example showed string "10.3"
            unit: string;
        }[];
        do_you_use_any_cooling_sysytem_for_server: boolean;
        energy_con_included_total_energy_pur_sec_two_qfifty: boolean;
        energy_consumption_for_qfiftyone_questions: {
            energy_purchased: string;
            energy_type: string;
            quantity: number;
            unit: string;
        }[];
    };
    scope_three_other_indirect_emissions_questions: {
        raw_materials_used_in_component_manufacturing_questions: {
            material_name: string;
            percentage: number;
        }[];
        raw_materials_contact_enviguide_support: boolean;
        grade_of_metal_used: string;
        msds_link_or_upload_document: string[];
        use_of_recycled_secondary_materials: boolean;
        recycled_materials_with_percentage_questions: {
            material_name: string;
            percentage: number;
        }[];
        percentage_of_pre_post_consumer_material_used_in_product: boolean;
        pre_post_consumer_reutilization_percentage_questions: {
            material_type: string;
            percentage: string;
        }[];
        pir_pcr_material_percentage_questions: {
            material_type: string;
            percentage: string;
        }[];
        type_of_pack_mat_used_for_delivering_questions: {
            component_name: string;
            packagin_type: string;
            packaging_size: number;
            unit: string;
        }[];
        weight_of_packaging_per_unit_product_questions: {
            component_name: string;
            packagin_weight: number;
            unit: string;
        }[];
        do_you_use_recycle_mat_for_packaging: boolean;
        percentage_of_recycled_content_used_in_packaging: string;
        do_you_use_electricity_for_packaging: boolean;
        energy_con_included_total_energy_pur_sec_two_qsixtysix: boolean;
        energy_consumption_for_qsixtyseven_questions: {
            energy_purchased: string;
            energy_type: string;
            quantity: number;
            unit: string;
        }[];
        weight_of_pro_packaging_waste_questions: {
            waste_type: string;
            waste_weight: number;
            unit: string;
            treatment_type: string;
        }[];
        internal_or_external_waste_material_per_recycling: string;
        any_by_product_generated: boolean;
        type_of_by_product_questions: {
            component_name: string;
            by_product: string;
            price_per_product: number;
            quantity: number;
        }[];
        do_you_track_emission_from_transport: boolean;
        co_two_emission_of_raw_material_questions: {
            raw_material_name: string;
            transport_mode: string;
            source_location: string;
            destination_location: string;
            co_two_emission: string;
        }[];
        mode_of_transport_used_for_transportation: boolean;
        mode_of_transport_used_for_transportation_questions: {
            mode_of_transport: string;
            weight_transported: string;
            source_point: string;
            drop_point: string;
            distance: string;
        }[];
        mode_of_transport_enviguide_support: boolean;
        destination_plant_component_transportation_questions: {
            country: string;
            state: string;
            city: string;
            pincode: string;
        }[];
        iso_14001_or_iso_50001_certified: boolean;
        standards_followed_iso_14067_GHG_catena_etc: boolean;
        do_you_report_to_cdp_sbti_or_other: boolean;
        measures_to_reduce_carbon_emissions_in_production: string;
        renewable_energy_initiatives_or_recycling_programs: string;
        your_company_info: string;
    };
    scope_four_avoided_emissions_questions: {
        products_or_services_that_help_reduce_customer_emissions: string;
        circular_economy_practices_reuse_take_back_epr_refurbishment: string;
        renewable_energy_carbon_offset_projects_implemented: string;
    };
}

class SupplierQuestionnaireService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `${token}` } : {}),
    };
  }

  // Helper to map UI data to API payload
  private mapToApiPayload(data: SupplierQuestionnaireData): SupplierQuestionnaireApiPayload {
      return {
          supplier_general_info_questions: {
              ere_acknowledge: data.general_information.re_technologies_acknowledgement,
              repm_acknowledge: data.general_information.re_procurement_acknowledgement,
              dc_acknowledge: data.general_information.double_counting_acknowledgement,
              organization_name: data.organization_details.organization_name,
              core_business_activitiy: data.organization_details.core_business_activities,
              specify_other_activity: data.organization_details.core_business_activities_other || null,
              designation: data.organization_details.designation,
              email_address: data.organization_details.email_address,
              no_of_employees: data.organization_details.number_of_employees,
              specify_other_no_of_employees: null, // Not in UI
              annual_revenue: data.organization_details.annual_revenue,
              specify_other_annual_revenue: null, // Not in UI
              annual_reporting_period: data.organization_details.annual_reporting_period,
              availability_of_scope_one_two_three_emissions_data: data.organization_details.availability_of_emissions_data,
              availability_of_scope_one_two_three_emissions_questions: (data.organization_details.emission_data || []).map(item => ({
                  country_iso_three: item.country,
                  scope_one: item.scope_1,
                  scope_two: item.scope_2,
                  scope_three: item.scope_3
              })),
          },
          supplier_product_questions: {
              do_you_have_an_existing_pcf_report: data.product_details.existing_pcf_report,
              pcf_methodology_used: data.product_details.pcf_methodology || [],
              upload_pcf_report: data.product_details.pcf_report_file || [],
              production_site_details_questions: (data.product_details.production_site_details || []).map(item => ({
                  product_name: item.product_name,
                  location: item.location
              })),
              required_environmental_impact_methods: data.product_details.required_environmental_impact_methods || [],
              product_component_manufactured_questions: (data.product_details.products_manufactured || []).map(item => ({
                  product_name: item.product_name,
                  production_period: item.production_period,
                  weight_per_unit: item.weight_per_unit,
                  unit: item.unit,
                  price: item.price,
                  quantity: item.quantity
              })),
              any_co_product_have_economic_value: data.product_details.any_co_product_have_economic_value || false,
              co_product_component_economic_value_questions: (data.product_details.co_products || []).map(item => ({
                  product_name: item.product_name,
                  co_product_name: item.co_product_name,
                  weight: item.weight,
                  price_per_product: item.price_per_product,
                  quantity: item.quantity
              })),
          },
          scope_one_direct_emissions_questions: {
              stationary_combustion_on_site_energy_use_questions: (data.scope_1.stationary_combustion || []).map(item => ({
                  fuel_type: item.fuel_type,
                  scoseu_sub_fuel_type_questions: (item.sub_fuel_type || []).map(sub => ({
                      sub_fuel_type: sub.sub_fuel_type,
                      consumption_quantity: sub.consumption_quantity,
                      unit: sub.unit
                  }))
              })),
              mobile_combustion_company_owned_vehicles_questions: (data.scope_1.mobile_combustion || []).map(item => ({
                  fuel_type: item.fuel_type,
                  quantity: item.quantity,
                  unit: item.unit
              })),
              refrigerant_top_ups_performed: data.scope_1.fugitive_emissions.refrigerant_top_ups,
              refrigerants_questions: (data.scope_1.fugitive_emissions.refrigerants || []).map(item => ({
                  refrigerant_type: item.type,
                  quantity: item.quantity,
                  unit: item.unit
              })),
              industrial_process_emissions_present: data.scope_1.process_emissions.present,
              process_emissions_sources_questions: (data.scope_1.process_emissions.sources || []).map(item => ({
                  source: item.source,
                  gas_type: item.gas_type,
                  quantity: item.quantity,
                  unit: item.unit
              })),
          },
          scope_two_indirect_emissions_questions: {
              scope_two_indirect_emissions_from_purchased_energy_questions: (data.scope_2.purchased_energy || []).map(item => ({
                  energy_source: item.energy_source,
                  energy_type: item.energy_type,
                  quantity: item.quantity,
                  unit: item.unit
              })),
              do_you_acquired_standardized_re_certificates: data.scope_2.standardized_re_certificates,
              scope_two_indirect_emissions_certificates_questions: (data.scope_2.certificates || []).map(item => ({
                  certificate_name: item.name,
                  mechanism: item.procurement_mechanism,
                  serial_id: item.serial_id,
                  generator_id: item.generator_id,
                  generator_name: item.generator_name,
                  generator_location: item.location,
                  date_of_generation: item.generation_date,
                  issuance_date: item.issuance_date
              })),
              methodology_to_allocate_factory_energy_to_product_level: data.scope_2.manufacturing_process_specific_energy.allocation_methodology,
              methodology_details_document_url: data.scope_2.manufacturing_process_specific_energy.methodology_document || [],
              energy_intensity_of_production_estimated_kwhor_mj: data.scope_2.manufacturing_process_specific_energy.energy_intensity_estimated,
              energy_intensity_of_production_estimated_kwhor_mj_questions: (data.scope_2.manufacturing_process_specific_energy.energy_intensity || []).map(item => ({
                  product_name: item.product_name,
                  energy_intensity: item.intensity,
                  unit: item.unit
              })),
              process_specific_energy_usage: data.scope_2.manufacturing_process_specific_energy.process_specific_usage_enabled,
              process_specific_energy_usage_questions: (data.scope_2.manufacturing_process_specific_energy.process_specific_usage || []).map(item => ({
                  process_specific_energy_type: item.process_type,
                  quantity_consumed: item.quantity,
                  unit: item.unit,
                  support_from_enviguide: item.support_from_enviguide || false
              })),
              do_you_use_any_abatement_systems: data.scope_2.manufacturing_process_specific_energy.abatement_systems,
              abatement_systems_used_questions: (data.scope_2.manufacturing_process_specific_energy.abatement_consumption || []).map(item => ({
                  source: item.source,
                  quantity: item.quantity,
                  unit: item.unit
              })),
              water_consumption_and_treatment_details: data.scope_2.manufacturing_process_specific_energy.water_consumption_details,
              type_of_quality_control_equipment_usage_questions: (data.scope_2.quality_control.equipment || []).map(item => ({
                  equipment_name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  avg_operating_hours_per_month: item.operating_hours
              })),
              electricity_consumed_for_quality_control_questions: (data.scope_2.quality_control.electricity_consumption || []).map(item => ({
                  energy_type: item.type,
                  quantity: item.quantity,
                  unit: item.unit,
                  period: item.period
              })),
              quality_control_process_usage_questions: (data.scope_2.quality_control.utilities || []).map(item => ({
                  process_name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  period: item.period
              })),
              quality_control_process_usage_pressure_or_flow_questions: (data.scope_2.quality_control.utilities_pressure_flow || []).map(item => ({
                  flow_name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  period: item.period
              })),
              quality_control_use_any_consumables_questions: (data.scope_2.quality_control.consumables || []).map(item => ({
                  consumable_name: item.name,
                  mass_of_consumables: item.quantity,
                  unit: item.unit,
                  period: item.period
              })),
              do_you_perform_destructive_testing: data.scope_2.quality_control.destructive_testing,
              weight_of_samples_destroyed_questions: (data.scope_2.quality_control.samples_destroyed || []).map(item => ({
                  component_name: item.component_name,
                  weight: item.weight,
                  unit: item.unit,
                  period: item.period
              })),
              defect_or_rejection_rate_identified_by_quality_control_questions: (data.scope_2.quality_control.defect_rate || []).map(item => ({
                  component_name: item.component_name,
                  percentage: item.rate
              })),
              rework_rate_due_to_quality_control_questions: (data.scope_2.quality_control.rework_rate || []).map(item => ({
                  component_name: item.component_name,
                  processes_involved: item.processes_involved,
                  percentage: item.rate
              })),
              weight_of_quality_control_waste_generated_questions: (data.scope_2.quality_control.waste_generated || []).map(item => ({
                  waste_type: item.type,
                  waste_weight: item.quantity,
                  unit: item.unit,
                  treatment_type: item.treatment
              })),
              it_system_use_for_production_control: data.scope_2.it_for_production.systems_used,
              total_energy_consumption_of_it_hardware_production: data.scope_2.it_for_production.energy_consumption_related,
              energy_con_included_total_energy_pur_sec_two_qfortythree: data.scope_2.it_for_production.included_in_total,
              energy_consumption_for_qfortyfour_questions: (data.scope_2.it_for_production.consumption_details || []).map(item => ({
                  energy_purchased: item.energy_purchased,
                  energy_type: item.energy_type,
                  quantity: item.quantity,
                  unit: item.unit
              })),
              do_you_use_cloud_based_system_for_production: data.scope_2.it_for_production.cloud_based_system,
              cloud_provider_details_questions: (data.scope_2.it_for_production.cloud_provider_details || []).map(item => ({
                  cloud_provider_name: item.cloud_provider_name,
                  virtual_machines: item.virtual_machines,
                  data_storage: item.data_storage,
                  data_transfer: item.data_transfer
              })),
              dedicated_monitoring_sensor_usage_questions: (data.scope_2.it_for_production.dedicated_monitoring_sensors || []).map(item => ({
                  type_of_sensor: item.type_of_sensor,
                  sensor_quantity: item.sensor_quantity,
                  energy_consumption: item.energy_consumption,
                  unit: item.unit
              })),
              annual_replacement_rate_of_sensor_questions: (data.scope_2.it_for_production.sensor_replacement_rate || []).map(item => ({
                  consumable_name: item.consumable_name,
                  quantity: item.quantity,
                  unit: item.unit
              })),
              do_you_use_any_cooling_sysytem_for_server: data.scope_2.it_for_production.cooling_system,
              energy_con_included_total_energy_pur_sec_two_qfifty: data.scope_2.it_for_production.cooling_energy_included,
              energy_consumption_for_qfiftyone_questions: (data.scope_2.it_for_production.cooling_energy_consumption || []).map(item => ({
                  energy_purchased: item.energy_purchased,
                  energy_type: item.energy_type,
                  quantity: item.quantity,
                  unit: item.unit
              })),
          },
          scope_three_other_indirect_emissions_questions: {
              raw_materials_used_in_component_manufacturing_questions: (data.scope_3.materials.raw_materials || []).map(item => ({
                  material_name: item.material,
                  percentage: item.composition_percent
              })),
              raw_materials_contact_enviguide_support: data.scope_3.materials.raw_materials_contact_support,
              grade_of_metal_used: data.scope_3.materials.metal_grade,
              msds_link_or_upload_document: data.scope_3.materials.msds,
              use_of_recycled_secondary_materials: data.scope_3.materials.recycled_materials_used,
              recycled_materials_with_percentage_questions: (data.scope_3.materials.recycled_materials || []).map(item => ({
                  material_name: item.material,
                  percentage: item.recycled_percent
              })),
              percentage_of_pre_post_consumer_material_used_in_product: data.scope_3.materials.material_type_breakdown_available,
              pre_post_consumer_reutilization_percentage_questions: (data.scope_3.materials.material_type_percentages || []).map(item => ({
                  material_type: item.type,
                  percentage: String(item.percentage)
              })),
              pir_pcr_material_percentage_questions: (data.scope_3.materials.pir_pcr_breakdown || []).map(item => ({
                  material_type: item.material_type,
                  percentage: item.percentage
              })),
              type_of_pack_mat_used_for_delivering_questions: (data.scope_3.packaging.materials || []).map(item => ({
                  component_name: item.component_name,
                  packagin_type: item.type,
                  packaging_size: item.size,
                  unit: item.unit
              })),
              weight_of_packaging_per_unit_product_questions: (data.scope_3.packaging.weight_per_unit || []).map(item => ({
                  component_name: item.component_name,
                  packagin_weight: item.weight,
                  unit: item.unit
              })),
              do_you_use_recycle_mat_for_packaging: data.scope_3.packaging.recycled_content_used,
              percentage_of_recycled_content_used_in_packaging: data.scope_3.packaging.recycled_percent || "",
              do_you_use_electricity_for_packaging: data.scope_3.packaging.electricity_used,
              energy_con_included_total_energy_pur_sec_two_qsixtysix: data.scope_3.packaging.included_in_total,
              energy_consumption_for_qsixtyseven_questions: (data.scope_3.packaging.energy_consumption || []).map(item => ({
                  energy_purchased: item.energy_purchased,
                  energy_type: item.energy_type,
                  quantity: item.quantity,
                  unit: item.unit
              })),
              weight_of_pro_packaging_waste_questions: (data.scope_3.waste_disposal.waste_details || []).map(item => ({
                  waste_type: item.type,
                  waste_weight: item.weight,
                  unit: item.unit,
                  treatment_type: item.treatment
              })),
              internal_or_external_waste_material_per_recycling: data.scope_3.waste_disposal.recycled_percent,
              any_by_product_generated: data.scope_3.waste_disposal.by_products_generated,
              type_of_by_product_questions: (data.scope_3.waste_disposal.by_products || []).map(item => ({
                  component_name: item.component_name,
                  by_product: item.name,
                  price_per_product: item.price,
                  quantity: item.quantity
              })),
              do_you_track_emission_from_transport: data.scope_3.logistics.emissions_tracked,
              co_two_emission_of_raw_material_questions: (data.scope_3.logistics.emissions_data || []).map(item => ({
                  raw_material_name: item.material,
                  transport_mode: item.mode,
                  source_location: item.source,
                  destination_location: item.destination,
                  co_two_emission: item.co2e
              })),
              mode_of_transport_used_for_transportation: !!data.scope_3.logistics.transport_modes?.length,
              mode_of_transport_used_for_transportation_questions: (data.scope_3.logistics.transport_modes || []).map(item => ({
                  mode_of_transport: item.mode,
                  weight_transported: item.weight,
                  source_point: item.source,
                  drop_point: item.drop_point,
                  distance: item.distance
              })),
              mode_of_transport_enviguide_support: data.scope_3.logistics.enviguide_support,
              destination_plant_component_transportation_questions: (data.scope_3.logistics.destination_plant || []).map(item => ({
                  country: item.country,
                  state: item.state,
                  city: item.city,
                  pincode: item.pin
              })),
              iso_14001_or_iso_50001_certified: data.scope_3.certifications.iso_certified,
              standards_followed_iso_14067_GHG_catena_etc: data.scope_3.certifications.standards_followed,
              do_you_report_to_cdp_sbti_or_other: data.scope_3.certifications.reporting_frameworks,
              measures_to_reduce_carbon_emissions_in_production: data.scope_3.certifications.additional_notes.reduction_measures,
              renewable_energy_initiatives_or_recycling_programs: data.scope_3.certifications.additional_notes.initiatives,
              your_company_info: data.scope_3.certifications.additional_notes.strategies,
          },
          scope_four_avoided_emissions_questions: {
              products_or_services_that_help_reduce_customer_emissions: data.scope_4.products_reducing_customer_emissions,
              circular_economy_practices_reuse_take_back_epr_refurbishment: data.scope_4.circular_economy_practices,
              renewable_energy_carbon_offset_projects_implemented: data.scope_4.offset_projects
          }
      };
  }

  // Helper to map API response to UI data
  private mapFromApiResponse(apiData: any): SupplierQuestionnaireData {
      const data = apiData.supplier_general_info_questions ? apiData : { supplier_general_info_questions: apiData }; // Handle potential nesting variations

      const genInfo = data.supplier_general_info_questions || {};
      const prodInfo = data.supplier_product_questions || {};
      const scope1 = data.scope_one_direct_emissions_questions || {};
      const scope2 = data.scope_two_indirect_emissions_questions || {};
      const scope3 = data.scope_three_other_indirect_emissions_questions || {};
      const scope4 = data.scope_four_avoided_emissions_questions || {};

      return {
          sgiq_id: data.sgiq_id || genInfo.sgiq_id,
          general_information: {
              gdpr_acknowledgement: true, // Not in API, assumed true if saved
              re_technologies_acknowledgement: genInfo.ere_acknowledge,
              re_procurement_acknowledgement: genInfo.repm_acknowledge,
              double_counting_acknowledgement: genInfo.dc_acknowledge,
          },
          organization_details: {
              organization_name: genInfo.organization_name,
              core_business_activities: genInfo.core_business_activitiy,
              core_business_activities_other: genInfo.specify_other_activity,
              designation: genInfo.designation,
              email_address: genInfo.email_address,
              number_of_employees: genInfo.no_of_employees,
              annual_revenue: genInfo.annual_revenue,
              annual_reporting_period: genInfo.annual_reporting_period,
              availability_of_emissions_data: genInfo.availability_of_scope_one_two_three_emissions_data,
              emission_data: (genInfo.availability_of_scope_one_two_three_emissions_questions || []).map((item: any) => ({
                  country: item.country_iso_three,
                  scope_1: item.scope_one,
                  scope_2: item.scope_two,
                  scope_3: item.scope_three
              })),
          },
          product_details: {
              existing_pcf_report: prodInfo.do_you_have_an_existing_pcf_report,
              pcf_methodology: prodInfo.pcf_methodology_used,
              pcf_report_file: prodInfo.upload_pcf_report,
              production_site_details: (prodInfo.production_site_details_questions || []).map((item: any) => ({
                  product_name: item.product_name,
                  location: item.location
              })),
              required_environmental_impact_methods: prodInfo.required_environmental_impact_methods,
              products_manufactured: (prodInfo.product_component_manufactured_questions || []).map((item: any) => ({
                  product_name: item.product_name,
                  production_period: item.production_period,
                  weight_per_unit: item.weight_per_unit,
                  unit: item.unit,
                  price: item.price,
                  quantity: item.quantity
              })),
              any_co_product_have_economic_value: prodInfo.any_co_product_have_economic_value,
              co_products: (prodInfo.co_product_component_economic_value_questions || []).map((item: any) => ({
                  product_name: item.product_name,
                  co_product_name: item.co_product_name,
                  weight: item.weight,
                  price_per_product: item.price_per_product,
                  quantity: item.quantity
              })),
          },
          scope_1: {
              stationary_combustion: (scope1.stationary_combustion_on_site_energy_use_questions || []).map((item: any) => ({
                  fuel_type: item.fuel_type,
                  sub_fuel_type: (item.scoseu_sub_fuel_type_questions || []).map((sub: any) => ({
                      sub_fuel_type: sub.sub_fuel_type,
                      consumption_quantity: sub.consumption_quantity,
                      unit: sub.unit
                  }))
              })),
              mobile_combustion: (scope1.mobile_combustion_company_owned_vehicles_questions || []).map((item: any) => ({
                  fuel_type: item.fuel_type,
                  quantity: item.quantity,
                  unit: item.unit
              })),
              fugitive_emissions: {
                  refrigerant_top_ups: scope1.refrigerant_top_ups_performed,
                  refrigerants: (scope1.refrigerants_questions || []).map((item: any) => ({
                      type: item.refrigerant_type,
                      quantity: item.quantity,
                      unit: item.unit
                  })),
              },
              process_emissions: {
                  present: scope1.industrial_process_emissions_present,
                  sources: (scope1.process_emissions_sources_questions || []).map((item: any) => ({
                      source: item.source,
                      gas_type: item.gas_type,
                      quantity: item.quantity,
                      unit: item.unit
                  })),
              },
          },
          scope_2: {
              purchased_energy: (scope2.scope_two_indirect_emissions_from_purchased_energy_questions || []).map((item: any) => ({
                  energy_source: item.energy_source,
                  energy_type: item.energy_type,
                  quantity: item.quantity,
                  unit: item.unit
              })),
              standardized_re_certificates: scope2.do_you_acquired_standardized_re_certificates,
              certificates: (scope2.scope_two_indirect_emissions_certificates_questions || []).map((item: any) => ({
                  name: item.certificate_name,
                  procurement_mechanism: item.mechanism,
                  serial_id: item.serial_id,
                  generator_id: item.generator_id,
                  generator_name: item.generator_name,
                  location: item.generator_location,
                  generation_date: item.date_of_generation,
                  issuance_date: item.issuance_date
              })),
              manufacturing_process_specific_energy: {
                  allocation_methodology: scope2.methodology_to_allocate_factory_energy_to_product_level,
                  methodology_document: scope2.methodology_details_document_url,
                  energy_intensity_estimated: scope2.energy_intensity_of_production_estimated_kwhor_mj,
                  energy_intensity: (scope2.energy_intensity_of_production_estimated_kwhor_mj_questions || []).map((item: any) => ({
                      product_name: item.product_name,
                      intensity: item.energy_intensity,
                      unit: item.unit
                  })),
                  process_specific_usage_enabled: scope2.process_specific_energy_usage,
                  process_specific_usage: (scope2.process_specific_energy_usage_questions || []).map((item: any) => ({
                      process_type: item.process_specific_energy_type,
                      quantity: item.quantity_consumed,
                      unit: item.unit,
                      support_from_enviguide: item.support_from_enviguide
                  })),
                  abatement_systems: scope2.do_you_use_any_abatement_systems,
                  abatement_consumption: (scope2.abatement_systems_used_questions || []).map((item: any) => ({
                      source: item.source,
                      quantity: item.quantity,
                      unit: item.unit
                  })),
                  water_consumption_details: scope2.water_consumption_and_treatment_details,
              },
              quality_control: {
                  equipment: (scope2.type_of_quality_control_equipment_usage_questions || []).map((item: any) => ({
                      name: item.equipment_name,
                      quantity: item.quantity,
                      unit: item.unit,
                      operating_hours: item.avg_operating_hours_per_month
                  })),
                  electricity_consumption: (scope2.electricity_consumed_for_quality_control_questions || []).map((item: any) => ({
                      type: item.energy_type,
                      quantity: item.quantity,
                      unit: item.unit,
                      period: item.period
                  })),
                  utilities: (scope2.quality_control_process_usage_questions || []).map((item: any) => ({
                      name: item.process_name,
                      quantity: item.quantity,
                      unit: item.unit,
                      period: item.period
                  })),
                  utilities_pressure_flow: (scope2.quality_control_process_usage_pressure_or_flow_questions || []).map((item: any) => ({
                      name: item.flow_name,
                      quantity: item.quantity,
                      unit: item.unit,
                      period: item.period
                  })),
                  consumables: (scope2.quality_control_use_any_consumables_questions || []).map((item: any) => ({
                      name: item.consumable_name,
                      quantity: item.mass_of_consumables,
                      unit: item.unit,
                      period: item.period
                  })),
                  destructive_testing: scope2.do_you_perform_destructive_testing,
                  samples_destroyed: (scope2.weight_of_samples_destroyed_questions || []).map((item: any) => ({
                      component_name: item.component_name,
                      weight: item.weight,
                      unit: item.unit,
                      period: item.period
                  })),
                  defect_rate: (scope2.defect_or_rejection_rate_identified_by_quality_control_questions || []).map((item: any) => ({
                      component_name: item.component_name,
                      rate: item.percentage
                  })),
                  rework_rate: (scope2.rework_rate_due_to_quality_control_questions || []).map((item: any) => ({
                      component_name: item.component_name,
                      processes_involved: item.processes_involved,
                      rate: item.percentage
                  })),
                  waste_generated: (scope2.weight_of_quality_control_waste_generated_questions || []).map((item: any) => ({
                      type: item.waste_type,
                      quantity: item.waste_weight,
                      unit: item.unit,
                      treatment: item.treatment_type
                  })),
              },
              it_for_production: {
                  systems_used: scope2.it_system_use_for_production_control,
                  energy_consumption_related: scope2.total_energy_consumption_of_it_hardware_production,
                  included_in_total: scope2.energy_con_included_total_energy_pur_sec_two_qfortythree,
                  consumption_details: (scope2.energy_consumption_for_qfortyfour_questions || []).map((item: any) => ({
                      energy_purchased: item.energy_purchased,
                      energy_type: item.energy_type,
                      quantity: item.quantity,
                      unit: item.unit
                  })),
                  cloud_based_system: scope2.do_you_use_cloud_based_system_for_production,
                  cloud_provider_details: (scope2.cloud_provider_details_questions || []).map((item: any) => ({
                      cloud_provider_name: item.cloud_provider_name,
                      virtual_machines: item.virtual_machines,
                      data_storage: item.data_storage,
                      data_transfer: item.data_transfer
                  })),
                  dedicated_monitoring_sensors: (scope2.dedicated_monitoring_sensor_usage_questions || []).map((item: any) => ({
                      type_of_sensor: item.type_of_sensor,
                      sensor_quantity: item.sensor_quantity,
                      energy_consumption: item.energy_consumption,
                      unit: item.unit
                  })),
                  sensor_replacement_rate: (scope2.annual_replacement_rate_of_sensor_questions || []).map((item: any) => ({
                      consumable_name: item.consumable_name,
                      quantity: item.quantity,
                      unit: item.unit
                  })),
                  cooling_system: scope2.do_you_use_any_cooling_sysytem_for_server,
                  cooling_energy_included: scope2.energy_con_included_total_energy_pur_sec_two_qfifty,
                  cooling_energy_consumption: (scope2.energy_consumption_for_qfiftyone_questions || []).map((item: any) => ({
                      energy_purchased: item.energy_purchased,
                      energy_type: item.energy_type,
                      quantity: item.quantity,
                      unit: item.unit
                  })),
              },
          },
          scope_3: {
              materials: {
                  raw_materials: (scope3.raw_materials_used_in_component_manufacturing_questions || []).map((item: any) => ({
                      material: item.material_name,
                      composition_percent: item.percentage
                  })),
                  raw_materials_contact_support: scope3.raw_materials_contact_enviguide_support,
                  metal_grade: scope3.grade_of_metal_used,
                  msds: scope3.msds_link_or_upload_document,
                  recycled_materials_used: scope3.use_of_recycled_secondary_materials,
                  recycled_materials: (scope3.recycled_materials_with_percentage_questions || []).map((item: any) => ({
                      material: item.material_name,
                      recycled_percent: item.percentage
                  })),
                  material_type_breakdown_available: scope3.percentage_of_pre_post_consumer_material_used_in_product,
                  material_type_percentages: (scope3.pre_post_consumer_reutilization_percentage_questions || []).map((item: any) => ({
                      type: item.material_type,
                      percentage: item.percentage
                  })),
                  pir_pcr_breakdown: (scope3.pir_pcr_material_percentage_questions || []).map((item: any) => ({
                      material_type: item.material_type,
                      percentage: item.percentage
                  })),
              },
              packaging: {
                  materials: (scope3.type_of_pack_mat_used_for_delivering_questions || []).map((item: any) => ({
                      component_name: item.component_name,
                      type: item.packagin_type,
                      size: item.packaging_size,
                      unit: item.unit
                  })),
                  weight_per_unit: (scope3.weight_of_packaging_per_unit_product_questions || []).map((item: any) => ({
                      component_name: item.component_name,
                      weight: item.packagin_weight,
                      unit: item.unit
                  })),
                  recycled_content_used: scope3.do_you_use_recycle_mat_for_packaging,
                  recycled_percent: scope3.percentage_of_recycled_content_used_in_packaging,
                  electricity_used: scope3.do_you_use_electricity_for_packaging,
                  included_in_total: scope3.energy_con_included_total_energy_pur_sec_two_qsixtysix,
                  energy_consumption: (scope3.energy_consumption_for_qsixtyseven_questions || []).map((item: any) => ({
                      energy_purchased: item.energy_purchased,
                      energy_type: item.energy_type,
                      quantity: item.quantity,
                      unit: item.unit
                  })),
              },
              waste_disposal: {
                  waste_details: (scope3.weight_of_pro_packaging_waste_questions || []).map((item: any) => ({
                      type: item.waste_type,
                      weight: item.waste_weight,
                      unit: item.unit,
                      treatment: item.treatment_type
                  })),
                  recycled_percent: scope3.internal_or_external_waste_material_per_recycling,
                  by_products_generated: scope3.any_by_product_generated,
                  by_products: (scope3.type_of_by_product_questions || []).map((item: any) => ({
                      component_name: item.component_name,
                      name: item.by_product,
                      price: item.price_per_product,
                      quantity: item.quantity
                  })),
              },
              logistics: {
                  emissions_tracked: scope3.do_you_track_emission_from_transport,
                  emissions_data: (scope3.co_two_emission_of_raw_material_questions || []).map((item: any) => ({
                      material: item.raw_material_name,
                      mode: item.transport_mode,
                      source: item.source_location,
                      destination: item.destination_location,
                      co2e: item.co_two_emission
                  })),
                  transport_modes: (scope3.mode_of_transport_used_for_transportation_questions || []).map((item: any) => ({
                      mode: item.mode_of_transport,
                      weight: item.weight_transported,
                      source: item.source_point,
                      drop_point: item.drop_point,
                      distance: item.distance
                  })),
                  enviguide_support: scope3.mode_of_transport_enviguide_support,
                  destination_plant: (scope3.destination_plant_component_transportation_questions || []).map((item: any) => ({
                      country: item.country,
                      state: item.state,
                      city: item.city,
                      pin: item.pincode
                  })),
              },
              certifications: {
                  iso_certified: scope3.iso_14001_or_iso_50001_certified,
                  standards_followed: scope3.standards_followed_iso_14067_GHG_catena_etc,
                  reporting_frameworks: scope3.do_you_report_to_cdp_sbti_or_other,
                  additional_notes: {
                      reduction_measures: scope3.measures_to_reduce_carbon_emissions_in_production,
                      initiatives: scope3.renewable_energy_initiatives_or_recycling_programs,
                      strategies: scope3.your_company_info,
                  },
              },
          },
          scope_4: {
              products_reducing_customer_emissions: scope4.products_or_services_that_help_reduce_customer_emissions,
              circular_economy_practices: scope4.circular_economy_practices_reuse_take_back_epr_refurbishment,
              offset_projects: scope4.renewable_energy_carbon_offset_projects_implemented,
          }
      };
  }

  /**
   * Create a new supplier questionnaire
   */
  async createQuestionnaire(
    data: SupplierQuestionnaireData
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const payload = this.mapToApiPayload(data);
      const response = await fetch(
        `${API_BASE_URL}/api/create-supplier-input-questions`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "Questionnaire created successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to create questionnaire",
        };
      }
    } catch (error) {
      console.error("Create questionnaire error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Update an existing supplier questionnaire
   */
  async updateQuestionnaire(
    sgiq_id: string,
    data: SupplierQuestionnaireData
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const payload = this.mapToApiPayload(data);
      const response = await fetch(
        `${API_BASE_URL}/api/update-supplier-input-questions`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ sgiq_id, ...payload }),
        }
      );

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "Questionnaire updated successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to update questionnaire",
        };
      }
    } catch (error) {
      console.error("Update questionnaire error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get questionnaire by ID
   */
  async getQuestionnaireById(
    sgiq_id: string,
    user_id: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Validate parameters
      if (!sgiq_id || sgiq_id.trim() === "") {
        console.error("getQuestionnaireById: sgiq_id is missing or empty");
        return {
          success: false,
          message: "Questionnaire ID (sgiq_id) is required",
        };
      }

      if (!user_id || user_id.trim() === "") {
        console.error("getQuestionnaireById: user_id is missing or empty");
        return {
          success: false,
          message: "User ID (user_id) is required",
        };
      }

      const url = `${API_BASE_URL}/api/supplier-input-questions-get-by-id?sgiq_id=${encodeURIComponent(sgiq_id)}&user_id=${encodeURIComponent(user_id)}`;
      console.log("Fetching questionnaire from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        const mappedData = this.mapFromApiResponse(result.data);
        return {
          success: true,
          message: result.message || "Questionnaire fetched successfully",
          data: mappedData,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch questionnaire",
        };
      }
    } catch (error) {
      console.error("Get questionnaire error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get list of all questionnaires
   */
  async listQuestionnaires(): Promise<{
    success: boolean;
    message: string;
    data?: any[];
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/supplier-input-questions-list`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "Questionnaires fetched successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch questionnaires",
        };
      }
    } catch (error) {
      console.error("List questionnaires error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get DQR details by questionnaire ID
   */
  async getDQRDetailsById(
    sgiq_id: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dqr-rating/get-by-id?sgiq_id=${sgiq_id}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "DQR details fetched successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch DQR details",
        };
      }
    } catch (error) {
      console.error("Get DQR details error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get all DQR ratings
   */
  async listDQRRatings(): Promise<{
    success: boolean;
    message: string;
    data?: any[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dqr-rating/list`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "DQR ratings fetched successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch DQR ratings",
        };
      }
    } catch (error) {
      console.error("List DQR ratings error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Save draft questionnaire (to localStorage)
   */
  saveDraft(data: any, stepIndex: number): void {
    try {
      const draftData = {
        formData: data,
        currentStep: stepIndex,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        "supplier_questionnaire_draft",
        JSON.stringify(draftData)
      );
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  }

  /**
   * Load draft questionnaire (from localStorage)
   */
  loadDraft(): { formData: any; currentStep: number } | null {
    try {
      const draft = localStorage.getItem("supplier_questionnaire_draft");
      if (draft) {
        return JSON.parse(draft);
      }
      return null;
    } catch (error) {
      console.error("Error loading draft:", error);
      return null;
    }
  }

  /**
   * Clear draft questionnaire
   */
  clearDraft(): void {
    try {
      localStorage.removeItem("supplier_questionnaire_draft");
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }

  /**
   * Get list of all supplier questionnaires
   */
  async getQuestionnairesList(
    user_id: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/supplier-input-questions-list?user_id=${user_id}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "Questionnaires list retrieved successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to retrieve questionnaires list",
        };
      }
    } catch (error) {
      console.error("Get questionnaires list error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get list of all DQR ratings
   */
  async getDQRList(
    user_id: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dqr-rating/list?user_id=${user_id}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "DQR list retrieved successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to retrieve DQR list",
        };
      }
    } catch (error) {
      console.error("Get DQR list error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Save DQR rating
   * @param bom_pcf_id - BOM PCF ID
   * @param type - Type of DQR rating (e.g., "dqr_raw_material_product_rating")
   * @param ratings - Array of DQR rating objects
   */
  async saveDQRRating(
    bom_pcf_id: string,
    type: string,
    ratings: any[]
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const payload: any = {
        bom_pcf_id,
        type,
        [type]: ratings,
      };

      const response = await fetch(`${API_BASE_URL}/api/dqr-rating/add`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "DQR rating saved successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to save DQR rating",
        };
      }
    } catch (error) {
      console.error("Save DQR rating error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }
}

export const supplierQuestionnaireService = new SupplierQuestionnaireService();
export default supplierQuestionnaireService;
