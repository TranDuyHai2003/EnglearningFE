import { apiRequest } from "./client";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  User,
} from "@/lib/types";
import { mockUsers } from "@/lib/mock/users.mock";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true" || true;

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = mockUsers.find((u) => u.email === data.email);
      if (!user || data.password !== "password") {
        throw new Error("Invalid credentials");
      }

      return {
        success: true,
        message: "Login successful",
        data: {
          user,
          token: "mock_token_" + Date.now(),
        },
      };
    }

    return apiRequest<AuthResponse>({
      method: "POST",
      url: "/auth/login",
      data,
    });
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newUser: User = {
        user_id: Math.floor(Math.random() * 10000),
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        message: "Registration successful",
        data: {
          user: newUser,
          token: "mock_token_" + Date.now(),
        },
      };
    }

    return apiRequest<AuthResponse>({
      method: "POST",
      url: "/auth/register",
      data,
    });
  },

  async getMe(): Promise<ApiResponse<User>> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("Not authenticated");

      return {
        success: true,
        message: "User retrieved",
        data: JSON.parse(storedUser),
      };
    }

    return apiRequest<ApiResponse<User>>({
      method: "GET",
      url: "/auth/me",
    });
  },
};
