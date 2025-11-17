import apiClient from "./apiClient";
import {
  InstructorProfile,
  ApiResponse,
  InstructorApplicationForm,
  ApprovalStatus,
  PaginatedResponse,
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
    status: "approved" | "rejected",
    reason?: string
  ): Promise<InstructorProfile> {
    const response = await apiClient.patch<ApiResponse<InstructorProfile>>(
      `/instructors/profiles/${profileId}/review`,
      { status, reason }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Duyệt hồ sơ thất bại.");
  },
};
