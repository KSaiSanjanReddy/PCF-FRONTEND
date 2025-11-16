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
export interface SupplierQuestionnaireData {
  bom_pcf_id?: string;
  general_info: {
    name_of_organization: string;
    core_business_activities: string[];
    company_site_address: string;
    designation: string;
    email_address: string;
    type_of_product_manufacture?: string[];
    annul_or_monthly_product_volume_of_product?: string[];
    weight_of_product?: string;
    where_production_site_product_manufactured?: string;
    price_of_product?: string;
    organization_annual_revenue: string;
    organization_annual_reporting_period?: string;
  };
  material_composition: {
    main_raw_materials_used: string[];
    contact_enviguide_support: boolean;
    has_recycled_material_usage: boolean;
    percentage_recycled_material?: number;
    knows_material_breakdown?: boolean;
    percentage_pre_consumer?: number;
    percentage_post_consumer?: number;
    percentage_reutilization?: number;
    has_recycled_copper?: boolean;
    percentage_recycled_copper?: number;
    has_recycled_aluminum?: boolean;
    percentage_recycled_aluminum?: number;
    has_recycled_steel?: boolean;
    percentage_recycled_steel?: number;
    has_recycled_plastics?: boolean;
    percentage_total_recycled_plastics?: number;
    percentage_recycled_thermoplastics?: number;
    percentage_recycled_plastic_fillers?: number;
    percentage_recycled_fibers?: number;
    has_recycling_process: boolean;
    has_future_recycling_strategy?: boolean;
    planned_recycling_year?: number;
    track_transport_emissions?: boolean;
    estimated_transport_emissions?: string;
    need_support_for_emissions_calc: boolean;
    emission_calc_requirement?: string;
    percentage_pcr?: number;
    percentage_pir?: number;
    use_bio_based_materials: boolean;
    bio_based_material_details?: string;
    msds_or_composition_link?: string;
    main_alloy_metals?: string;
    metal_grade?: string;
  };
  energy_manufacturing: {
    energy_sources_used: string[];
    electricity_consumption_per_year: string;
    purchases_renewable_electricity: boolean;
    renewable_electricity_percentage?: number;
    has_energy_calculation_method: boolean;
    energy_calculation_method_details?: string;
    energy_intensity_per_unit?: string;
    process_specific_energy_usage: string[];
    enviguide_support: boolean;
    uses_abatement_systems: boolean;
    abatement_system_energy_consumption?: string;
    water_consumption_and_treatment_details?: string;
  };
  packaging: {
    packaging_materials_used: string[];
    enviguide_support: boolean;
    packaging_weight_per_unit?: string;
    packaging_size?: string[];
    uses_recycled_packaging: boolean;
    recycled_packaging_percentage?: string[];
  };
  transportation_logistics: {
    transport_modes_used: string[];
    enviguide_support: boolean;
    uses_certified_logistics_provider: boolean;
    logistics_provider_details?: string[];
  };
  waste_by_products: {
    waste_types_generated: string[];
    waste_treatment_methods: string[];
    recycling_percentage?: number;
    has_byproducts: boolean;
    byproduct_types?: string[];
    byproduct_quantity?: string;
    byproduct_price?: string[];
  };
  end_of_life_circularity: {
    product_designed_for_recycling: boolean;
    product_recycling_details?: string[];
    has_takeback_program: boolean;
    takeback_program_details?: string[];
  };
  emission_factors: {
    reports_product_carbon_footprint: boolean;
    pcf_methodologies_used?: string[];
    has_scope_emission_data: boolean;
    emission_data_details?: string[];
    required_environmental_impact_methods?: string[];
  };
  certification_standards: {
    certified_iso_environmental_or_energy: boolean;
    follows_recognized_standards: boolean;
    reports_to_esg_frameworks: boolean;
    previous_reports?: string[];
  };
  additional_notes: {
    carbon_reduction_measures?: string;
    renewable_energy_or_recycling_programs?: string;
    willing_to_provide_primary_data: boolean;
    primary_data_details?: string[];
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
