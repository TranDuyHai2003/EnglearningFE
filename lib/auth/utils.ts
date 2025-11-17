import { AuthenticatedUser } from "../types";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

/**
 * Lưu token và thông tin người dùng vào localStorage.
 */
export const setAuthData = (token: string, user: AuthenticatedUser): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Lấy token xác thực từ localStorage.
 */
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Lấy thông tin người dùng đã lưu từ localStorage.
 */
export const getStoredUser = (): AuthenticatedUser | null => {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as AuthenticatedUser;
  } catch (error) {
    console.error("Failed to parse user data from localStorage", error);
    clearAuthData();
    return null;
  }
};

/**
 * Xóa toàn bộ dữ liệu xác thực khỏi localStorage.
 */
export const clearAuthData = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
