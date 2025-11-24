const API_BASE_URL = "https://enviguide.nextechltd.in";

export interface DocumentItem {
  id: string;
  code: string;
  document_type: string;
  category: string;
  product_code: string;
  version: string;
  document_title: string;
  description: string;
  tags: string[];
  access_level: string;
  document: string[];
  status: string;
  created_by: string;
  updated_by: string | null;
  file_size: string;
  update_date: string;
  created_date: string;
  categoryDetails?: {
    id: string;
    code: string;
    name: string;
  };
  tagDetails?: {
    id: string;
    code: string;
    name: string;
  }[];
  createdBy?: {
    user_id: string;
    user_name: string;
  };
  updatedBy?: {
    user_id: string;
    user_name: string;
  };
}

export interface DocumentListResponse {
  success: boolean;
  message: string;
  data: DocumentItem[];
  total_count?: number;
}

export interface DocumentResponse {
  success: boolean;
  message: string;
  data: DocumentItem;
}

export interface CategoryItem {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface TagItem {
  id: string;
  code: string;
  name: string;
  description: string;
}

class DocumentMasterService {
  private getHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getDocumentList(pageNumber: number = 1, pageSize: number = 10): Promise<DocumentListResponse> {
    try {
      // Assuming the list API follows this pattern based on other modules
      const response = await fetch(
        `${API_BASE_URL}/api/document-master/list?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      const result = await response.json();
      return {
        success: result.status,
        message: result.message,
        data: result.data?.data || [], // Adjusting based on likely pagination structure
        total_count: result.data?.total_count || 0,
      };
    } catch (error) {
      console.error("Error fetching document list:", error);
      return { success: false, message: "Failed to fetch document list", data: [] };
    }
  }

  async getDocumentById(id: string): Promise<DocumentResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/document-master/get-by-id?id=${id}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      const result = await response.json();
      return {
        success: result.status,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      console.error("Error fetching document:", error);
      return {
        success: false,
        message: "Failed to fetch document",
        data: {} as DocumentItem,
      };
    }
  }

  async addDocument(data: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/document-master/add`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return {
        success: result.status,
        message: result.message,
      };
    } catch (error) {
      console.error("Error adding document:", error);
      return { success: false, message: "Failed to add document" };
    }
  }

  async updateDocument(data: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/document-master/update`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return {
        success: result.status,
        message: result.message,
      };
    } catch (error) {
      console.error("Error updating document:", error);
      return { success: false, message: "Failed to update document" };
    }
  }

  async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/document-master/delete`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      return {
        success: result.status,
        message: result.message,
      };
    } catch (error) {
      console.error("Error deleting document:", error);
      return { success: false, message: "Failed to delete document" };
    }
  }

  async getCategoryList(): Promise<CategoryItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/data-setup/category/list`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  async getTagList(): Promise<TagItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/data-setup/tag/list`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  }
}

export const documentMasterService = new DocumentMasterService();
