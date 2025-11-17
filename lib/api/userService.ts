import apiClient from "./apiClient";
import {
  AuthenticatedUser,
  UpdateProfileForm,
  ApiResponse,
  ChangePasswordForm,
  UserRole,
  UserStatus,
} from "@/lib/types";

// Kiểu dữ liệu cho các tham số lọc/phân trang
interface ListUsersParams {
  limit?: number;
  page?: number;
  role?: UserRole;
  status?: UserStatus;
  keyword?: string;
}

interface ListUsersResponse {
  success: boolean;
  data: AuthenticatedUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  message?: string;
}

export const userService = {
  async listUsers(params: ListUsersParams): Promise<ListUsersResponse> {
    const response = await apiClient.get<ListUsersResponse>("/users", {
      params,
    });
    return response.data;
  },
  async getUser(userId: number): Promise<AuthenticatedUser> {
    const response = await apiClient.get<ApiResponse<AuthenticatedUser>>(
      `/users/${userId}`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(
      response.data.message || "Không thể tải thông tin người dùng."
    );
  },

  /**
   * Cập nhật thông tin profile (cho cả user tự cập nhật và admin cập nhật).
   * Backend dùng PATCH, nên đây cũng là PATCH.
   */
  async updateUser(
    userId: number,
    data: UpdateProfileForm
  ): Promise<AuthenticatedUser> {
    const response = await apiClient.patch<ApiResponse<AuthenticatedUser>>(
      `/users/${userId}`,
      data
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Cập nhật thông tin thất bại.");
  },

  /**
   * Cập nhật vai trò của người dùng (cho Admin).
   */
  async updateUserRole(
    userId: number,
    role: UserRole
  ): Promise<AuthenticatedUser> {
    const response = await apiClient.patch<ApiResponse<AuthenticatedUser>>(
      `/users/${userId}/role`,
      { role }
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Cập nhật vai trò thất bại.");
  },

  /**
   * Thay đổi mật khẩu.
   */
  async changePassword(
    userId: number,
    data: ChangePasswordForm
  ): Promise<void> {
    const response = await apiClient.patch<ApiResponse<null>>(
      `/users/${userId}/password`,
      data
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Đổi mật khẩu thất bại.");
    }
  },
};
