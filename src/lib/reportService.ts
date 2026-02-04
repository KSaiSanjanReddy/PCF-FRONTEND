import authService from "./authService";

const API_BASE_URL = "https://enviguide.nextechltd.in";

interface ApiResponse<T = any> {
    status: boolean;
    message: string;
    code: number;
    data?: T;
    success?: boolean;
}

export interface ReportListResponse {
    success: boolean;
    message: string;
    data: any[];
    current_page: number;
    total_pages: number;
    total_count: number;
}

class ReportService {
    private getHeaders() {
        const token = authService.getToken();
        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `${token}` } : {}),
        };
    }

    private async fetchReport(endpoint: string, pageNumber: number, pageSize: number): Promise<ReportListResponse> {
        try {
            const response = await fetch(
                `${API_BASE_URL}${endpoint}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
                {
                    method: "GET",
                    headers: this.getHeaders(),
                }
            );

            const result: any = await response.json();

            if (result.status || result.success) {
                let dataArray: any[] = [];
                let pageInfo: any = {};

                if (result.data) {
                    if (result.data.data && Array.isArray(result.data.data)) {
                        dataArray = result.data.data;
                        pageInfo = result.data;
                    } else if (Array.isArray(result.data)) {
                        dataArray = result.data;
                    } else if (result.data && typeof result.data === 'object') {
                        pageInfo = result.data;
                        if (Array.isArray(result.data.data)) {
                            dataArray = result.data.data;
                        }
                    }
                }

                return {
                    success: true,
                    message: result.message || "Report fetched successfully",
                    data: dataArray,
                    current_page: pageInfo.page || result.current_page || 1,
                    total_pages: pageInfo.total_pages || result.total_pages || 1,
                    total_count: pageInfo.total_count || result.total_count || dataArray.length,
                };
            } else {
                return {
                    success: false,
                    message: result.message || "Failed to fetch report",
                    data: [],
                    current_page: 1,
                    total_pages: 1,
                    total_count: 0,
                };
            }
        } catch (error) {
            console.error(`Report fetch error (${endpoint}):`, error);
            return {
                success: false,
                message: "Network error occurred",
                data: [],
                current_page: 1,
                total_pages: 1,
                total_count: 0,
            };
        }
    }

    async getProductFootprintList(pageNumber: number = 1, pageSize: number = 20) {
        return this.fetchReport("/api/report/product-foot-print-list", pageNumber, pageSize);
    }

    async getSupplierFootprintList(pageNumber: number = 1, pageSize: number = 20) {
        return this.fetchReport("/api/report/supplier-foot-print-list", pageNumber, pageSize);
    }

    async getPackagingFootprintList(pageNumber: number = 1, pageSize: number = 20) {
        return this.fetchReport("/api/report/packaging-foot-print-list", pageNumber, pageSize);
    }
}

export const reportService = new ReportService();
export default reportService;
