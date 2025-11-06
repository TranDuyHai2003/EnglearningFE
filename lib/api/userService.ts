import { apiRequest } from "./client";
import {
  ApiResponse,
  User,
  UpdateProfileForm,
  ChangePasswordForm,
} from "@/lib/types";
import { mockUsers } from "@/lib/mock/users.mock";

const USE_MOCK = true;

export const userService = {
  async getProfile(userId: number): Promise<ApiResponse<User>> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const user = mockUsers.find((u) => u.user_id === userId);

      if (!user) throw new Error("User not found");

      return {
        success: true,
        message: "Profile retrieved",
        data: user,
      };
    }

    return apiRequest<ApiResponse<User>>({
      method: "GET",
      url: `/users/${userId}`,
    });
  },

  async updateProfile(
    userId: number,
    data: UpdateProfileForm
  ): Promise<ApiResponse<User>> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = mockUsers.find((u) => u.user_id === userId);
      if (!user) throw new Error("User not found");

      const updatedUser = { ...user, ...data };

      return {
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      };
    }

    return apiRequest<ApiResponse<User>>({
      method: "PUT",
      url: `/users/${userId}`,
      data,
    });
  },

  async changePassword(data: ChangePasswordForm): Promise<ApiResponse<void>> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (data.current_password !== "password") {
        throw new Error("Current password is incorrect");
      }

      if (data.new_password !== data.confirm_password) {
        throw new Error("Passwords do not match");
      }

      return {
        success: true,
        message: "Password changed successfully",
      };
    }

    return apiRequest<ApiResponse<void>>({
      method: "POST",
      url: "/users/change-password",
      data,
    });
  },

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        success: true,
        message: "Users retrieved",
        data: mockUsers,
      };
    }

    return apiRequest<ApiResponse<User[]>>({
      method: "GET",
      url: "/users",
    });
  },

  async toggleUserStatus(
    userId: number,
    status: "active" | "locked"
  ): Promise<ApiResponse<User>> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = mockUsers.find((u) => u.user_id === userId);
      if (!user) throw new Error("User not found");

      user.status = status;

      return {
        success: true,
        message: `User ${status === "active" ? "activated" : "locked"}`,
        data: user,
      };
    }

    return apiRequest<ApiResponse<User>>({
      method: "PATCH",
      url: `/users/${userId}/status`,
      data: { status },
    });
  },
};
