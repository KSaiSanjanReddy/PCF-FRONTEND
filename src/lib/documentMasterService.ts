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
  category_details: {
    id: string;
    code: string;
    name: string;
  } | null;
  tag_details: {
    id: string;
    code: string;
    name: string;
  }[];
}

export interface DocumentStats {
  totalDocuments: number;
  pendingDocuments: number;
  pcfDocuments: number;
  daily: {
    current: number;
    previous: number;
    progress: number;
  };
  weekly: {
    current: number;
    previous: number;
    progress: number;
  };
  monthly: {
    current: number;
    previous: number;
    progress: number;
  };
  yearly: {
    current: number;
    previous: number;
    progress: number;
  };
}

export interface RecentActivity {
  id: string;
  document_title: string;
  code: string;
  status: string;
  created_by: string;
  created_date: string;
}

export interface DocumentListResponse {
  message: string;
  currentPage: number;
  totalRecords: number;
  totalPages: number;
  recentActivity: RecentActivity[];
  stats: DocumentStats;
  data: DocumentItem[];
  success?: boolean; // Keeping optional for backward compatibility if needed
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
      Authorization: `${token}`,
    };
  }

  async getDocumentList(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<DocumentListResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/document-master/list?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching document list:", error);
      return {
        message: "Failed to fetch document list",
        currentPage: 1,
        totalRecords: 0,
        totalPages: 0,
        recentActivity: [],
        stats: {
          totalDocuments: 0,
          pendingDocuments: 0,
          pcfDocuments: 0,
          daily: { current: 0, previous: 0, progress: 0 },
          weekly: { current: 0, previous: 0, progress: 0 },
          monthly: { current: 0, previous: 0, progress: 0 },
          yearly: { current: 0, previous: 0, progress: 0 },
        },
        data: [],
        success: false,
      };
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

  async updateDocument(
    data: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/document-master/update`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        }
      );
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

  async deleteDocument(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/document-master/delete`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ id }),
        }
      );
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
      const response = await fetch(
        `${API_BASE_URL}/api/data-setup/category/list`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );
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
