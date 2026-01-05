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

// Questionnaire data structure
// Questionnaire data structure
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
    pcf_methodology?: string;
    pcf_report_file?: string;
    production_site_details: {
      component_name: string;
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
  };
  scope_1: {
    stationary_combustion: {
      fuel_type: string;
      sub_fuel_type: string;
      quantity: number;
      unit: string;
    }[];
    mobile_combustion: {
      fuel_type: string;
      quantity: number;
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
      methodology_document?: string;
      energy_intensity: {
        product_name: string;
        intensity: number;
        unit: string;
      }[];
      process_specific_usage: {
        process_type: string;
        quantity: number;
        unit: string;
      }[];
      abatement_systems: boolean;
      abatement_consumption?: {
        system: string;
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
        operating_hours: number;
      }[];
      electricity_consumption: {
        type: string;
        quantity: number;
        unit: string;
        period: string;
      }[];
      utilities: {
        name: string;
        quantity: number;
        unit: string;
      }[];
      consumables: {
        name: string;
        quantity: number;
        unit: string;
      }[];
      destructive_testing: boolean;
      samples_destroyed?: {
        weight: number;
        unit: string;
      }[];
      defect_rate: {
        product: string;
        rate: number;
      }[];
      rework_rate: {
        product: string;
        rate: number;
      }[];
      waste_generated: {
        type: string;
        quantity: number;
        treatment: string;
      }[];
    };
    it_for_production: {
      systems_used: string[];
      energy_consumption_related: boolean;
      included_in_total: boolean;
      consumption_details?: {
        source: string;
        type: string;
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
      metal_grade: string;
      msds: string;
      recycled_materials_used: boolean;
      recycled_materials?: {
        material: string;
        recycled_percent: number;
      }[];
      material_type_breakdown_available: boolean;
      material_type_percentages?: {
        pre_consumer: number;
        post_consumer: number;
        reutilization: number;
      };
      pir_pcr_breakdown: {
        material: string;
        pir_percent: number;
        pcr_percent: number;
      }[];
    };
    packaging: {
      materials: {
        component: string;
        type: string;
        size: string;
      }[];
      weight_per_unit: {
        component: string;
        weight: number;
        unit: string;
      }[];
      recycled_content_used: boolean;
      recycled_percent?: number;
      electricity_used: boolean;
      included_in_total: boolean;
      energy_consumption?: {
        source: string;
        type: string;
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
      recycled_percent: number;
      by_products_generated: boolean;
      by_products?: {
        component: string;
        name: string;
        price: number;
        quantity: number;
      }[];
    };
    logistics: {
      emissions_tracked: boolean;
      emissions_data?: {
        material: string;
        weight: number;
        mode: string;
        source: string;
        destination: string;
        co2e: number;
      }[];
      transport_modes?: {
        mode: string;
        weight: number;
        source: string;
        destination: string;
        distance: number;
      }[];
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

// DQR Rating data structure
export interface DQRRatingData {
  sgiq_id: string;
  data: string;
  ter_tag_type?: string;
  ter_tag_value?: string;
  ter_data_point?: string;
  tir_tag_type?: string;
  tir_tag_value?: string;
  tir_data_point?: string;
  gr_tag_type?: string;
  gr_tag_value?: string;
  gr_data_point?: string;
  c_tag_type?: string;
  c_tag_value?: string;
  c_data_point?: string;
  pds_tag_type?: string;
  pds_tag_value?: string;
  pds_data_point?: string;
}

class SupplierQuestionnaireService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `${token}` } : {}),
    };
  }

  /**
   * Create a new supplier questionnaire
   */
  async createQuestionnaire(
    data: SupplierQuestionnaireData
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/create-supplier-input-questions`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(data),
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
      const response = await fetch(
        `${API_BASE_URL}/api/update-supplier-input-questions`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ sgiq_id, ...data }),
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

      const url = `${API_BASE_URL}/api/get-by-id-supplier-input-questions?sgiq_id=${encodeURIComponent(sgiq_id)}&user_id=${encodeURIComponent(user_id)}`;
      console.log("Fetching questionnaire from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "Questionnaire fetched successfully",
          data: result.data,
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
   * Get all questionnaires
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
