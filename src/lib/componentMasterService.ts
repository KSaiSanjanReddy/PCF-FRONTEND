const API_BASE_URL = "https://enviguide.nextechltd.in";

export interface ComponentItem {
  id: string;
  code: string;
  componentCode?: string;
  componentName?: string;
  lifecycleStage?: string;
  location?: string;
  materialType?: string;
  weight?: string;
  recyclability?: string;
  certificateStatus?: string;
  status?: string;
  // Additional fields from API response
  request_title?: string;
  priority?: string;
  request_organization?: string;
  due_date?: string;
  request_description?: string;
  product_code?: string;
  model_version?: string;
  product_category?: {
    id: string;
    code: string;
    name: string;
  };
  component_category?: {
    id: string;
    code: string;
    name: string;
  };
  component_type?: {
    id: string;
    code: string;
    name: string;
  };
  manufacturer?: {
    id: string;
    code: string;
    name: string;
  };
  createdby?: {
    user_id: string;
    user_name: string;
  };
  created_by?: string;
  updated_by?: string | null;
  update_date?: string;
  created_date?: string;
  bom_details?: any[];
}

export interface ComponentListResponse {
  success: boolean;
  message: string;
  data?: {
    page: number;
    pageSize: number;
    data: ComponentItem[];
    totalCount?: number;
  };
}

export interface ComponentResponse {
  success: boolean;
  message: string;
  data?: ComponentItem;
}

class ComponentMasterService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token || "",
    };
  }

  /**
   * Get list of components
   */
  async getComponentList(params?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
    productCategoryCode?: string;
    componentCategoryCode?: string;
    componentTypeCode?: string;
    manufacturerCode?: string;
    createdBy?: string;
    pcfCode?: string;
    productCode?: string;
    requestTitle?: string;
    productCategoryName?: string;
    componentCategoryName?: string;
    componentTypeName?: string;
    manufacturerName?: string;
    pcfStatus?: string;
  }): Promise<ComponentListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.pageNumber) {
        queryParams.append("pageNumber", params.pageNumber.toString());
      }
      if (params?.pageSize) {
        queryParams.append("pageSize", params.pageSize.toString());
      }
      if (params?.search) {
        queryParams.append("search", params.search);
      }
      if (params?.fromDate) {
        queryParams.append("fromDate", params.fromDate);
      }
      if (params?.toDate) {
        queryParams.append("toDate", params.toDate);
      }
      if (params?.productCategoryCode) {
        queryParams.append("productCategoryCode", params.productCategoryCode);
      }
      if (params?.componentCategoryCode) {
        queryParams.append("componentCategoryCode", params.componentCategoryCode);
      }
      if (params?.componentTypeCode) {
        queryParams.append("componentTypeCode", params.componentTypeCode);
      }
      if (params?.manufacturerCode) {
        queryParams.append("manufacturerCode", params.manufacturerCode);
      }
      if (params?.createdBy) {
        queryParams.append("createdBy", params.createdBy);
      }
      if (params?.pcfCode) {
        queryParams.append("pcfCode", params.pcfCode);
      }
      if (params?.productCode) {
        queryParams.append("productCode", params.productCode);
      }
      if (params?.requestTitle) {
        queryParams.append("requestTitle", params.requestTitle);
      }
      if (params?.productCategoryName) {
        queryParams.append("productCategoryName", params.productCategoryName);
      }
      if (params?.componentCategoryName) {
        queryParams.append("componentCategoryName", params.componentCategoryName);
      }
      if (params?.componentTypeName) {
        queryParams.append("componentTypeName", params.componentTypeName);
      }
      if (params?.manufacturerName) {
        queryParams.append("manufacturerName", params.manufacturerName);
      }
      if (params?.pcfStatus) {
        queryParams.append("pcf_status", params.pcfStatus);
      }

      const url = `${API_BASE_URL}/api/component-master/list?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      const result: any = await response.json();

      if (result.status || result.success) {
        // Return API data with minimal transformation
        const transformedData = result.data?.data?.map((item: any) => ({
          ...item,
          // Normalize status to lowercase for consistent handling
          status: item.status || "draft",
        })) || [];

        return {
          success: true,
          message: result.message || "Components fetched successfully",
          data: {
            page: result.data?.page || 1,
            pageSize: result.data?.pageSize || 20,
            data: transformedData,
            totalCount: result.data?.totalCount || transformedData.length,
          },
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch components",
        };
      }
    } catch (error) {
      console.error("Error fetching components:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get component by ID
   * Uses the list endpoint with id parameter (List and GetById AllinOne)
   * Falls back to get-by-id endpoint if list doesn't support id parameter
   */
  async getComponentById(id: string): Promise<ComponentResponse> {
    try {
      if (!id || id.trim() === "") {
        return {
          success: false,
          message: "Component ID is required",
        };
      }

      // Try list endpoint with id parameter first (as per "List and GetById AllinOne")
      const queryParams = new URLSearchParams();
      queryParams.append("id", id);
      queryParams.append("pageNumber", "1");
      queryParams.append("pageSize", "1");

      let response = await fetch(
        `${API_BASE_URL}/api/component-master/list?${queryParams.toString()}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      let result: any = await response.json();

      // If list endpoint doesn't work with id, try get-by-id endpoint
      if ((!result.status && !result.success) || response.status === 404) {
        response = await fetch(
          `${API_BASE_URL}/api/component-master/get-by-id?id=${encodeURIComponent(id)}`,
          {
            method: "GET",
            headers: this.getHeaders(),
          }
        );
        result = await response.json();
      }

      if (result.status || result.success) {
        // Handle both array and single object responses
        let item;
        if (result.data?.data && Array.isArray(result.data.data)) {
          item = result.data.data.length > 0 ? result.data.data[0] : null;
        } else if (Array.isArray(result.data)) {
          item = result.data.length > 0 ? result.data[0] : null;
        } else {
          item = result.data;
        }

        if (!item) {
          return {
            success: false,
            message: "Component not found",
          };
        }

        // Return data with minimal transformation
        const transformedData: ComponentItem = {
          ...item,
          status: item.status || "draft",
        };

        return {
          success: true,
          message: result.message || "Component fetched successfully",
          data: transformedData,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch component",
        };
      }
    } catch (error) {
      console.error("Error fetching component:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get component by PCF Code
   * Uses the list endpoint with pcfCode parameter
   */
  async getComponentByCode(code: string): Promise<ComponentResponse> {
    try {
      if (!code || code.trim() === "") {
        return {
          success: false,
          message: "Component code is required",
        };
      }

      const queryParams = new URLSearchParams();
      queryParams.append("pcfCode", code);
      queryParams.append("pageNumber", "1");
      queryParams.append("pageSize", "1");

      const response = await fetch(
        `${API_BASE_URL}/api/component-master/list?${queryParams.toString()}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const result: any = await response.json();

      if (result.status || result.success) {
        // Handle both array and single object responses
        let item;
        if (result.data?.data && Array.isArray(result.data.data)) {
          item = result.data.data.length > 0 ? result.data.data[0] : null;
        } else if (Array.isArray(result.data)) {
          item = result.data.length > 0 ? result.data[0] : null;
        } else {
          item = result.data;
        }

        if (!item) {
          return {
            success: false,
            message: "Component not found",
          };
        }

        // Return data with minimal transformation
        const transformedData: ComponentItem = {
          ...item,
          status: item.status || "draft",
        };

        return {
          success: true,
          message: result.message || "Component fetched successfully",
          data: transformedData,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch component",
        };
      }
    } catch (error) {
      console.error("Error fetching component by code:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }
}

const componentMasterService = new ComponentMasterService();
export default componentMasterService;
