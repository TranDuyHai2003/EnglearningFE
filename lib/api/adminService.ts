import apiClient from "./apiClient";
import {
  ApiResponse,
  PaginatedResponse,
  SystemSetting,
  SupportTicket,
} from "@/lib/types";

interface DashboardSummary {
  total_users: number;
  total_courses: number;
  pending_courses: number;
  pending_instructors: number;
  interviewing_instructors: number;
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

  async getMetricsTimeseries(metric: string, period: string) {
    const response = await apiClient.get<
      ApiResponse<{
        metric: string;
        period: string;
        timeseries: { period: string; value: number }[];
      }>
    >("/admin/dashboard/metrics", {
      params: { metric, period },
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể tải dữ liệu biểu đồ.");
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

    return response.data;
  },

  async getPendingCourses(page = 1, limit = 10) {
    const response = await apiClient.get("/admin/approvals/courses", {
      params: { page, limit },
    });
    return response.data;
  },

  async getPendingLessons(page = 1, limit = 10) {
    const response = await apiClient.get("/admin/approvals/lessons", {
      params: { page, limit },
    });
    return response.data;
  },

  async approveCourse(courseId: number) {
    const response = await apiClient.post(
      `/admin/approvals/courses/${courseId}/approve`
    );
    return response.data;
  },

  async rejectCourse(courseId: number, reason: string) {
    const response = await apiClient.post(
      `/admin/approvals/courses/${courseId}/reject`,
      { reason }
    );
    return response.data;
  },

  async approveLesson(lessonId: number) {
    const response = await apiClient.post(
      `/admin/approvals/lessons/${lessonId}/approve`
    );
    return response.data;
  },

  async rejectLesson(lessonId: number, reason: string) {
    const response = await apiClient.post(
      `/admin/approvals/lessons/${lessonId}/reject`,
      { reason }
    );
    return response.data;
  },
};
