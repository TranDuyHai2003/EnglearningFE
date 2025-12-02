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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      if (window.location.pathname !== "/login") {
        console.error("Unauthorized! Redirecting to login.");
        clearAuthData();

        const redirectUrl = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(
          redirectUrl
        )}`;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
