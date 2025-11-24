/**
 * Service for Task Management API Integration
 */

import authService from "./authService";

const API_BASE_URL = "https://enviguide.nextechltd.in";

// Assigned Entity structure
export interface AssignedEntity {
  id: string;
  name: string;
  type: "user" | "supplier";
  email?: string | null;
  phone_number?: string | null;
}

// Task Item structure (matches API response)
export interface TaskItem {
  id: string;
  code: string;
  task_title: string;
  category_id: string;
  category_name: string | null;
  priority: "High" | "Medium" | "Low";
  assign_to: string[];
  assigned_entities: AssignedEntity[];
  due_date: string;
  description?: string;
  related_product?: string;
  estimated_hour?: number;
  tags?: string[];
  attachments?: string;
  progress: number | null;
  status: "To Do" | "In Progress" | "Under Review" | "Completed";
  created_by: string;
  updated_by?: string | null;
  update_date?: string;
  created_date: string;
  bom_id?: string | null;
  created_by_name: string;
  updated_by_name?: string | null;
  pcf_id?: string | null;
}

// Task List Response
export interface TaskListResponse {
  status: boolean;
  success?: boolean;
  message: string;
  code: number;
  data: {
    data: TaskItem[];
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

class TaskService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `${token}` } : {}),
    };
  }

  /**
   * Get list of tasks
   */
  async getTaskList(
    pageNumber: number = 1,
    pageSize: number = 10,
    filters?: {
      priority?: string;
      assignee?: string;
      category?: string;
      status?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    data?: TaskItem[];
    current_page?: number;
    total_pages?: number;
    total_count?: number;
  }> {
    try {
      let url = `${API_BASE_URL}/api/task-management/list?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      
      if (filters) {
        const params = new URLSearchParams();
        if (filters.priority && filters.priority !== "all") {
          // Convert lowercase to capitalized format
          const priorityMap: Record<string, string> = {
            low: "Low",
            medium: "Medium",
            high: "High",
          };
          params.append("priority", priorityMap[filters.priority.toLowerCase()] || filters.priority);
        }
        if (filters.assignee && filters.assignee !== "all") {
          params.append("assigned_user_name", filters.assignee);
        }
        if (filters.category && filters.category !== "all") {
          params.append("category_name", filters.category);
        }
        const queryString = params.toString();
        if (queryString) {
          url += `&${queryString}`;
        }
      }

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      const result: TaskListResponse = await response.json();

      if (result.status || result.success) {
        // API returns nested data structure: result.data.data
        const dataArray = Array.isArray(result.data?.data) ? result.data.data : [];
        
        return {
          success: true,
          message: result.message || "Task list fetched successfully",
          data: dataArray as TaskItem[],
          current_page: result.data?.current_page || 1,
          total_pages: result.data?.total_pages || 1,
          total_count: result.data?.total_count || dataArray.length,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch task list",
        };
      }
    } catch (error) {
      console.error("Get task list error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: {
    task_title: string;
    category_id: string;
    priority: "High" | "Medium" | "Low";
    assign_to: string[];
    due_date: string;
    description: string;
    pcf_id?: string;
    bom_id?: string;
    related_product?: string;
    estimated_hour?: number;
    tags?: string[];
    attachments?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/task-management/add`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(taskData),
      });

      const result: any = await response.json();

      if (result.success || result.status) {
        return {
          success: true,
          message: result.message || "Task created successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to create task",
        };
      }
    } catch (error) {
      console.error("Create task error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(
    taskId: string,
    taskData: {
      task_title?: string;
      category_id?: string;
      priority?: "High" | "Medium" | "Low";
      assign_to?: string[];
      due_date?: string;
      description?: string;
      pcf_id?: string;
      bom_id?: string;
      related_product?: string;
      estimated_hour?: number;
      tags?: string[];
      attachments?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/task-management/update`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ id: taskId, ...taskData }),
      });

      const result: any = await response.json();

      if (result.success || result.status) {
        return {
          success: true,
          message: result.message || "Task updated successfully",
          data: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to update task",
        };
      }
    } catch (error) {
      console.error("Update task error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<{
    success: boolean;
    message: string;
    data?: TaskItem;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/task-management/get-by-id?id=${taskId}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const result: any = await response.json();

      if (result.success || result.status) {
        return {
          success: true,
          message: result.message || "Task fetched successfully",
          data: result.data as TaskItem,
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch task",
        };
      }
    } catch (error) {
      console.error("Get task by ID error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/task-management/delete`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ id: taskId }),
        }
      );

      const result: any = await response.json();

      if (result.success || result.status) {
        return {
          success: true,
          message: result.message || "Task deleted successfully",
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to delete task",
        };
      }
    } catch (error) {
      console.error("Delete task error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get PCF dropdown list
   */
  async getPCFDropdown(): Promise<{
    success: boolean;
    message: string;
    data?: Array<{
      pcf_id: string;
      pcf_code: string;
      request_title: string | null;
      priority: string | null;
      request_organization: string | null;
      bom_id: string;
      bom_code: string;
      component_name: string;
      material_number: string;
    }>;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/task-management/get-pcf-dropdown`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const result: any = await response.json();

      if (result.success || result.status) {
        return {
          success: true,
          message: result.message || "PCF dropdown fetched successfully",
          data: Array.isArray(result.data) ? result.data : [],
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch PCF dropdown",
        };
      }
    } catch (error) {
      console.error("Get PCF dropdown error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get BOM supplier list dropdown
   */
  async getBOMSupplierDropdown(bomId: string): Promise<{
    success: boolean;
    message: string;
    data?: Array<{
      id: string;
      name: string;
      type: "user" | "supplier";
      email?: string | null;
      phone_number?: string | null;
    }>;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/task-management/get-bom-suppier-list-dropdown?bom_id=${bomId}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const result: any = await response.json();

      if (result.success || result.status) {
        return {
          success: true,
          message: result.message || "BOM supplier dropdown fetched successfully",
          data: Array.isArray(result.data) ? result.data : [],
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch BOM supplier dropdown",
        };
      }
    } catch (error) {
      console.error("Get BOM supplier dropdown error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Get users list for assignee dropdown
   */
  async getUsersList(): Promise<{
    success: boolean;
    message: string;
    data?: Array<{
      user_id: string;
      user_name: string;
      user_email: string;
      user_role: string;
    }>;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/getUsers`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      const result: any = await response.json();

      if (result.success || result.status) {
        const userList = result.data?.userList || result.data || [];
        return {
          success: true,
          message: result.message || "Users fetched successfully",
          data: Array.isArray(userList) ? userList : [],
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to fetch users",
        };
      }
    } catch (error) {
      console.error("Get users list error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }
}

export const taskService = new TaskService();
export default taskService;

