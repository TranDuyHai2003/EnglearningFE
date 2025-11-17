import apiClient from "./apiClient";
import {
  ApiResponse,
  PaginatedResponse,
  SystemSetting,
  SupportTicket,
} from "@/lib/types";

// Kiểu dữ liệu cho response của dashboard summary
interface DashboardSummary {
  total_users: number;
  total_courses: number;
  pending_courses: number;
  pending_instructors: number;
  total_enrollments: number;
  total_revenue: number;
}

export const adminService = {
  /**
   * Lấy dữ liệu thống kê cho Dashboard.
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>(
      "/admin/dashboard/summary"
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(
      response.data.message || "Không thể tải dữ liệu dashboard."
    );
  },

  /**
   * Lấy danh sách tất cả cài đặt hệ thống.
   */
  async listSettings(): Promise<SystemSetting[]> {
    const response = await apiClient.get<ApiResponse<SystemSetting[]>>(
      "/admin/settings"
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể tải cài đặt hệ thống.");
  },

  /**
   * Thêm hoặc cập nhật một cài đặt.
   */
  async upsertSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<SystemSetting> {
    const response = await apiClient.post<ApiResponse<SystemSetting>>(
      "/admin/settings",
      { key, value, description }
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Lưu cài đặt thất bại.");
  },

  /**
   * Xóa một cài đặt.
   */
  async deleteSetting(key: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/settings/${key}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Xóa cài đặt thất bại.");
    }
  },

  /**
   * Lấy danh sách các ticket hỗ trợ.
   */
  async listSupportTickets(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<SupportTicket>> {
    const response = await apiClient.get<PaginatedResponse<SupportTicket>>(
      "/admin/support/tickets",
      { params: { page, limit } }
    );

    // Trả luôn response.data vì nó đã có dạng { data, meta }
    return response.data;
  },
};
