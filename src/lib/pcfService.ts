/**
 * Service for PCF BOM API Integration
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

// PCF BOM List Response
export interface PCFBOMListResponse {
  success: boolean;
  message: string;
  data: PCFBOMItem[];
  current_page: number;
  total_pages: number;
  total_count: number;
}

// PCF BOM Item structure
export interface PCFBOMItem {
  id: string;
  code: string;
  product_category_id: string;
  component_category_id: string;
  component_type_id: string;
  product_code: string;
  manufacturer_id: string | null;
  model_version: string;
  update_date: string;
  created_date: string;
  created_by: string;
  updated_by: string | null;
  product_category_code: string;
  product_category_name: string;
  component_category_code: string;
  component_category_name: string;
  component_type_code: string;
  component_type_name: string;
  manufacturer_code: string | null;
  manufacturer_name: string | null;
  manufacturer_address: string | null;
  manufacturer_lat: number | null;
  manufacturer_long: number | null;
  created_by_name: string;
  updated_by_name: string | null;
  boms?: any[];
}

class PCFService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `${token}` } : {}),
    };
  }

  /**
   * Get list of PCF BOM requests
   */
  async getPCFBOMList(
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<{
    success: boolean;
    message: string;
    data?: PCFBOMItem[];
    current_page?: number;
    total_pages?: number;
    total_count?: number;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pcf-bom/list?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const result: any = await response.json();

      // Debug logging
      console.log("PCF Service Response:", result);

      if (result.status || result.success) {
        // Response format: { status: true, message: "...", data: { success: true, page: 1, pageSize: 10, data: [...] } }
        // The actual data array is nested at result.data.data
        let dataArray: any[] = [];
        let pageInfo: any = {};

        if (result.data) {
          // Check if data.data exists (nested structure)
          if (result.data.data && Array.isArray(result.data.data)) {
            dataArray = result.data.data;
            pageInfo = result.data;
          } 
          // Check if data is directly an array
          else if (Array.isArray(result.data)) {
            dataArray = result.data;
          }
          // Check if data is an object with a data property
          else if (result.data && typeof result.data === 'object') {
            pageInfo = result.data;
            if (Array.isArray(result.data.data)) {
              dataArray = result.data.data;
            }
          }
        }
        
        console.log("Extracted data:", {
          dataArrayLength: dataArray.length,
          pageInfo,
        });
        
        return {
          success: true,
          message: result.message || "PCF BOM list fetched successfully",
          data: dataArray as PCFBOMItem[],
          current_page: pageInfo.page || result.current_page || 1,
          total_pages: pageInfo.total_pages || result.total_pages || 1,
          total_count: pageInfo.total_count || result.total_count || dataArray.length,
        };
      } else {
        console.error("PCF Service Error:", result);
        return {
          success: false,
          message: result.message || "Failed to fetch PCF BOM list",
        };
      }
    } catch (error) {
      console.error("Get PCF BOM list error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Create a new PCF BOM request
   */
  async createPCFRequest(payload: any): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pcf-bom/create`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "PCF request created successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to create PCF request",
        };
      }
    } catch (error) {
      console.error("Create PCF request error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Update an existing PCF BOM request
   */
  async updatePCFRequest(payload: any): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pcf-bom/update`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "PCF request updated successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to update PCF request",
        };
      }
    } catch (error) {
      console.error("Update PCF request error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get PCF BOM request by ID
   */
  async getPCFBOMById(
    pcf_id: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pcf-bom/get-by-id?pcf_id=${pcf_id}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const result: ApiResponse = await response.json();

      if (result.status || result.success) {
        return {
          success: true,
          message: result.message || "PCF BOM fetched successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch PCF BOM",
        };
      }
    } catch (error) {
      console.error("Get PCF BOM by ID error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }
}

export const pcfService = new PCFService();
export default pcfService;

