import api from "@/lib/api"; // ✅ Giờ sẽ tìm thấy
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types";

/**
 * Gọi API login
 */
export async function loginAPI(
  credentials: LoginRequest
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", credentials);
  return response.data;
}

/**
 * Gọi API register
 */
export async function registerAPI(
  data: RegisterRequest
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", data);
  return response.data;
}

/**
 * Gọi API logout
 */
export async function logoutAPI(): Promise<void> {
  await api.post("/auth/logout");
}

/**
 * Lấy profile người dùng hiện tại
 */
export async function getMeAPI() {
  const response = await api.get("/auth/me");
  return response.data;
}
