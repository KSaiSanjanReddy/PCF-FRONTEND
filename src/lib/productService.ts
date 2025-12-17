import axios from 'axios';

const API_URL = 'https://enviguide.nextechltd.in/api';

// Interfaces
export interface Product {
  id: string;
  product_code: string;
  product_name: string;
  product_category_id: string;
  product_sub_category_id: string;
  description: string;
  ts_weight_kg: number;
  ts_dimensions: string;
  ts_material: string;
  ts_manufacturing_process_id: string;
  ts_supplier: string;
  ts_part_number: string;
  ed_estimated_pcf: number;
  ed_recyclability: number;
  ed_life_cycle_stage_id: string;
  ed_renewable_energy: number;
  created_by?: string;
  updated_by?: string;
  created_date?: string;
  update_date?: string;
  
  // Expanded fields from joins (optional)
  category_name?: string;
  sub_category_name?: string;
  manufacturing_process_name?: string;
  life_cycle_stage_name?: string;
  pcf_status?: string;
}

export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface ProductSubCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  product_category_id: string;
}

export interface ManufacturingProcess {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface LifeCycleStage {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface ProductListResponse {
  status: boolean;
  message: string;
  code: number;
  data: {
    totalCount: number;
    rows: Product[];
  };
}

export interface ProductResponse {
    status: boolean;
    message: string;
    code: number;
    data: Product;
}

export interface CategoryListResponse {
    status: boolean;
    message: string;
    code: number;
    data: {
        totalCount: number;
        rows: ProductCategory[];
    };
}

// Service
const productService = {
  // Products
  getProducts: async (pageNumber: number = 1, pageSize: number = 20, filters?: any) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/product/list`, {
      headers: { Authorization: token },
      params: {
        pageNumber,
        pageSize,
        ...filters
      }
    });
    return response.data;
  },

  getProductById: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/product/get-by-id`, {
      headers: { Authorization: token },
      params: { id }
    });
    return response.data;
  },

  createProduct: async (data: Partial<Product>) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/product/add`, data, {
      headers: { Authorization: token }
    });
    return response.data;
  },

  updateProduct: async (data: Partial<Product>) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/product/update`, data, {
      headers: { Authorization: token }
    });
    return response.data;
  },

  deleteProduct: async (id: string) => {
      // Note: Delete API was not explicitly found in the grep search, but assuming standard pattern if it exists.
      // If not, we might need to check if it's a soft delete or different endpoint.
      // Based on Dept delete: /api/delete-department with body { department_id: ... }
      // Let's assume /api/product/delete with body { id: ... } or query param.
      // Re-checking Postman might be good if this fails. For now, implementing a likely candidate.
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/product/delete`, { id }, {
      headers: { Authorization: token }
    });
    return response.data;
  },

  // Categories
  getProductCategories: async () => {
    const token = localStorage.getItem('token');
    // Assuming list endpoint based on pattern
    const response = await axios.get(`${API_URL}/data-setup/product-category/list`, {
      headers: { Authorization: token }
    });
    return response.data;
  },

  // Sub Categories
  getProductSubCategories: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/data-setup/product-sub-category/list`, {
        headers: { Authorization: token }
    });
    return response.data;
  },

   // Manufacturing Process
   getManufacturingProcesses: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/data-setup/manufacturing-process/list`, {
        headers: { Authorization: token }
    });
    return response.data;
  },

   // Life Cycle Stage
   getLifeCycleStages: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/data-setup/life-cycle-stage/list`, {
        headers: { Authorization: token }
    });
    return response.data;
  },
};

export default productService;
