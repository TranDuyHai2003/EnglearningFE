import api from "./apiClient";

export const moderationService = {
  // Report content
  reportContent: async (data: {
    content_type: "discussion" | "reply" | "review";
    content_id: number;
    reason: string;
  }) => {
    const response = await api.post("/reports", data);
    return response.data;
  },

  // Get all reports (Admin only)
  getReports: async (
    page = 1,
    limit = 20,
    status?: string,
    content_type?: string
  ) => {
    const response = await api.get("/admin/reports", {
      params: { page, limit, status, content_type },
    });
    return response.data;
  },

  // Update report status (Admin only)
  updateReport: async (
    reportId: number,
    data: { status?: string; admin_note?: string }
  ) => {
    const response = await api.patch(`/admin/reports/${reportId}`, data);
    return response.data;
  },

  // Delete reported content (Admin only)
  deleteContent: async (type: string, id: number) => {
    const response = await api.delete(`/admin/content/${type}/${id}`);
    return response.data;
  },
};
