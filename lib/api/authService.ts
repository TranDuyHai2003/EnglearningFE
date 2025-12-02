import apiClient from "./apiClient";
import {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  User,
  AuthenticatedUser,
} from "../types";
import { AxiosError } from "axios";

interface AuthResponseData {
  token: string;
  user: AuthenticatedUser;
}

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * Gửi yêu cầu đăng nhập đến server.
 * @throws {Error} Nếu đăng nhập thất bại.
 */
const login = async (credentials: LoginRequest): Promise<AuthResponseData> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      credentials
    );
    const apiResponse = response.data;
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    } else {
      throw new Error(apiResponse.message || "Email hoặc mật khẩu không đúng.");
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Đã xảy ra lỗi kết nối."));
  }
};

/**
 * Gửi yêu cầu đăng ký đến server.
 * @throws {Error} Nếu đăng ký thất bại.
 */
const register = async (data: RegisterRequest): Promise<AuthResponseData> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      "/auth/register",
      data
    );
    const apiResponse = response.data;
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    } else {
      throw new Error(apiResponse.message || "Đăng ký thất bại.");
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Lỗi đăng ký."));
  }
};

/**
 * Lấy thông tin người dùng hiện tại từ server.
 * @throws {Error} Nếu token không hợp lệ.
 */
const getMe = async (): Promise<AuthenticatedUser> => {
  try {
    const response = await apiClient.get<ApiResponse<AuthenticatedUser>>(
      "/auth/me"
    );
    const apiResponse = response.data;
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    } else {
      throw new Error(apiResponse.message || "Phiên đăng nhập không hợp lệ.");
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Không thể xác thực người dùng."));
  }
};

export const authService = {
  login,
  register,
  getMe,
};
