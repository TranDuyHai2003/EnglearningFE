import apiClient from "./apiClient";
import {
  InstructorProfile,
  ApiResponse,
  InstructorApplicationForm,
  ApprovalStatus,
  PaginatedResponse,
  InstructorSummary,
  ActionItems,
} from "@/lib/types";
import { AxiosError } from "axios";

interface ListProfilesParams {
  limit?: number;
  page?: number;
  status?: ApprovalStatus;
}
interface ListProfilesApiResponse {
  success: boolean;
  data: InstructorProfile[];
  meta: PaginatedResponse<unknown>["meta"];
  message?: string;
}
export const instructorService = {
  /**
   * Lấy hồ sơ của giảng viên đang đăng nhập.
   */
  async getMyProfile(): Promise<InstructorProfile | null> {
    try {
      const response = await apiClient.get<ApiResponse<InstructorProfile>>(
        "/instructors/profiles/my-profile"
      );
      console.log(response, "rés");
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null; // Trả về null nếu chưa có hồ sơ (404 Not Found)
      }
      throw error; // Ném các lỗi khác
    }
  },

  /**
   * Nộp hồ sơ ứng tuyển (chỉ tạo mới).
   */
  async createProfile(
    data: InstructorApplicationForm
  ): Promise<InstructorProfile> {
    const response = await apiClient.post<ApiResponse<InstructorProfile>>(
      "/instructors/profiles",
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Nộp hồ sơ thất bại.");
  },

  /**
   * Cập nhật hồ sơ ứng tuyển đã có.
   */
  async updateProfile(
    data: InstructorApplicationForm
  ): Promise<InstructorProfile> {
    const response = await apiClient.patch<ApiResponse<InstructorProfile>>(
      "/instructors/profiles",
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Cập nhật hồ sơ thất bại.");
  },

  /**
   * Lấy danh sách hồ sơ giảng viên (cho Admin).
   */
  async listProfiles(
    params: ListProfilesParams
  ): Promise<PaginatedResponse<InstructorProfile>> {
    // ✅ SỬA LỖI Ở ĐÂY:
    const response = await apiClient.get<ListProfilesApiResponse>(
      "/instructors/profiles",
      { params }
    );
    const apiData = response.data;

    if (apiData.success && apiData.data && apiData.meta) {
      return {
        data: apiData.data,
        meta: apiData.meta,
      };
    }
    throw new Error(response.data.message || "Không thể tải danh sách hồ sơ.");
  },
  /**
   * Duyệt một hồ sơ giảng viên (cho Admin).
   */
  async reviewProfile(
    profileId: number,
    status: "approved" | "rejected" | "interviewing",
    reason?: string,
    interview_notes?: string
  ): Promise<InstructorProfile> {
    const response = await apiClient.patch<ApiResponse<InstructorProfile>>(
      `/instructors/profiles/${profileId}/review`,
      { status, reason, interview_notes }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Duyệt hồ sơ thất bại.");
  },

  async getDashboardSummary(): Promise<InstructorSummary> {
    const response = await apiClient.get<ApiResponse<InstructorSummary>>(
      "/instructors/dashboard/summary"
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(
      response.data.message || "Không thể tải dữ liệu tổng quan."
    );
  },

  /**
   * Lấy các mục cần hành động (câu hỏi, đánh giá mới).
   */
  async getActionItems(): Promise<ActionItems> {
    const response = await apiClient.get<ApiResponse<ActionItems>>(
      "/instructors/dashboard/action-items"
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(
      response.data.message || "Không thể tải các mục cần xử lý."
    );
  },

  async getProfileById(profileId: number): Promise<InstructorProfile> {
    const response = await apiClient.get<ApiResponse<InstructorProfile>>(
      `/instructors/profiles/${profileId}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể tải hồ sơ giảng viên.");
  },

  /**
   * Tải lên file CV cho giảng viên hiện tại.
   */
  async uploadCv(file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append("cv", file);

    const response = await apiClient.post("/instructors/upload-cv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Tải lên CV thất bại.");
  },

  /**
   * Tải lên các file chứng chỉ cho giảng viên hiện tại.
   */
  async uploadCertificates(files: File[]): Promise<unknown> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("certificates", file);
    });

    const response = await apiClient.post(
      "/instructors/upload-certificates",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Tải lên chứng chỉ thất bại.");
  },
  async replyToDiscussion(
    discussionId: number,
    replyText: string
  ): Promise<void> {
    const response = await apiClient.post(
      `/interaction/discussions/${discussionId}/replies`,
      { content: replyText }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Trả lời thất bại.");
    }
  },
};
