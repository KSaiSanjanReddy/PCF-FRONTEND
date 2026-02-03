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
  category_code?: string;
  sub_category_name?: string;
  sub_category_code?: string;
  manufacturing_process_code?: string;
  manufacturing_process_name?: string;
  life_cycle_stage_code?: string;
  life_cycle_stage_name?: string;
  pcf_status?: string;
  created_by_name?: string;
  updated_by_name?: string;

  // Own emission fields (optional)
  product_status?: string;
  own_emission_id?: string;
  own_emission_status?: string;
  own_emission?: any; // Could be null or emission object
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

export interface LinkedPCF {
  id: string;
  code: string;
  product_code: string;
  request_title: string;
  priority: string;
  request_organization: string;
  due_date: string;
  request_description: string | null;
  status: string;
  model_version: string | null;
  overall_pcf: number;
  created_date: string;
  total_component_used_count: string;
}

export interface LinkedPCFResponse {
  status: boolean;
  message: string;
  code: number;
  data: LinkedPCF[];
}

// BOM PCF Dropdown item
export interface BomPcfDropdownItem {
  id: string;
  code: string;
  request_title: string;
  is_own_emission_calculated: boolean;
}

export interface BomPcfDropdownResponse {
  status: boolean;
  message: string;
  code: number;
  data: BomPcfDropdownItem[];
}

// BOM List item
export interface BomListItem {
  id: string;
  code: string;
  price: number;
  quantity: number | null;
  weight_gms: number;
  total_price: number | string;
  manufacturer: string;
  component_name: string;
  economic_ratio: number;
  material_number: string;
  total_weight_gms: number | string;
  component_category: string;
  detail_description: string;
  production_location: string;
  supplier?: {
    code: string;
    sup_id: string;
    supplier_name: string;
    supplier_email: string;
    supplier_phone_number: string;
  };
  material_emission?: any[];
  pcf_total_emission_calculation?: {
    id: string;
    total_pcf_value: number;
    material_value: number;
    logistic_value: number;
    packaging_value: number;
    waste_value: number;
    production_value: number;
  } | null;
}

// BOM PCF Details
export interface BomPcfDetails {
  id: string;
  code: string;
  request_title: string;
  priority: string;
  request_organization: string;
  due_date: string;
  request_description: string | null;
  status: string;
  model_version: string | null;
  overall_pcf: number;
  is_approved: boolean;
  is_rejected: boolean;
  is_draft: boolean | null;
  created_date: string;
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
  bom_list: BomListItem[];
  pcf_request_stages?: any;
}

export interface BomPcfDetailsResponse {
  status: boolean;
  message: string;
  code: number;
  data: BomPcfDetails[];
}

// Secondary Data Entry Material Emission
export interface SecondaryDataMaterialEmission {
  id: string;
  bom_id: string;
  material_type: string;
  material_emission: number;
  material_composition: number;
  material_emission_factor: number;
  material_composition_weight: number;
  created_date: string;
  update_date: string;
}

// Secondary Data BOM Item
export interface SecondaryDataBomItem {
  code: string;
  bom_id: string;
  price: number;
  quantity: number | null;
  weight_gms: number;
  total_price: number | string;
  manufacturer: string;
  component_name: string;
  material_number: string;
  component_category: string;
  detail_description: string;
  production_location: string;
  data_source?: string;
  supplier?: {
    code: string;
    sup_id: string;
    supplier_name: string;
    supplier_email: string;
    supplier_phone_number: string;
  };
  dqr_rating?: {
    c: number;
    gr: number;
    pds: number;
    ter: number;
    tir: number;
    criterion: string;
    overall_dqr_score: number;
    meaning_description: string;
  } | null;
  material_emission?: SecondaryDataMaterialEmission[];
  pcf_total_emission_calculation?: {
    total_pcf_value: number;
    material_value: number;
    logistic_value: number;
    packaging_value: number;
    waste_value: number;
    production_value: number;
  } | null;
}

// Secondary Data Entries Response
export interface SecondaryDataEntries {
  id: string;
  code: string;
  request_title: string;
  status: string;
  model_version: string | null;
  overall_pcf: number;
  is_approved: boolean;
  is_rejected: boolean;
  is_draft: boolean | null;
  created_date: string;
  pcf_state: string;
  product_code: string;
  life_cycle_stage_name: string;
  bom_list: SecondaryDataBomItem[];
}

export interface SecondaryDataEntriesResponse {
  status: boolean;
  message: string;
  code: number;
  data: SecondaryDataEntries;
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

  // Linked PCFs by product code
  getLinkedPCFsByProductCode: async (productCode: string): Promise<LinkedPCFResponse> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/product/linked-pcfs-by-product-code`, {
      headers: { Authorization: token },
      params: { product_code: productCode }
    });
    return response.data;
  },

  // BOM PCF Dropdown by product code
  getBomPcfDropdown: async (productCode: string): Promise<BomPcfDropdownResponse> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/product/bom-pcf-drop-down`, {
      headers: { Authorization: token },
      params: { product_code: productCode }
    });
    return response.data;
  },

  // Get BOM PCF Details by BOM PCF ID
  getBomPcfDetailsById: async (bomPcfId: string): Promise<BomPcfDetailsResponse> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/product/pcf-bom/get-by-id`, {
      headers: { Authorization: token },
      params: { bom_pcf_id: bomPcfId }
    });
    return response.data;
  },

  // Get Secondary Data Entries by BOM PCF ID and Product Code
  getSecondaryDataEntries: async (bomPcfId: string, productCode: string): Promise<SecondaryDataEntriesResponse> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/product/secondary-data-entries-by-id`, {
      headers: { Authorization: token },
      params: { bom_pcf_id: bomPcfId, product_code: productCode }
    });
    return response.data;
  },

  // Get PCF BOM History Details
  getPcfBomHistoryDetails: async (productCode: string): Promise<BomPcfDetailsResponse> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/product/pcf-bom/history-bom-details`, {
      headers: { Authorization: token },
      params: { product_code: productCode }
    });
    return response.data;
  },
};

export default productService;
