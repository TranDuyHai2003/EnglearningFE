import axios from "axios";
import { clearAuthData, getAuthToken } from "@/lib/auth/utils";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor để tự động thêm token vào mỗi request.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Chỉ thực thi ở phía client
    if (typeof window !== "undefined") {
      const token = getAuthToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor để xử lý lỗi response, đặc biệt là lỗi 401 (Unauthorized).
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ thực thi ở phía client
    if (typeof window !== "undefined" && error.response?.status === 401) {
      console.error("Unauthorized! Token might be expired. Logging out.");
      clearAuthData();
      // Redirect về trang login để người dùng đăng nhập lại
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
