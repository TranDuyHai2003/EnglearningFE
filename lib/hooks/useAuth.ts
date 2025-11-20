"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedUser } from "../types";
import {
  getAuthToken,
  clearAuthData,
  getStoredUser,
  setAuthData,
} from "../auth/utils";
import { authService } from "../api/authService";

interface UseAuthOptions {
  redirectToLoginIfFail?: boolean;
}

interface UseAuthReturn {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (newUser: AuthenticatedUser) => void;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const router = useRouter();

  // THAY ĐỔI 1: Chỉ lấy state ban đầu từ localStorage. Không tin tưởng nó 100%.
  const [user, setUser] = useState<AuthenticatedUser | null>(() =>
    getStoredUser()
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!getAuthToken()
  );

  // THAY ĐỔI 2: isLoading ban đầu sẽ là `true` CHỈ KHI có token cần xác thực.
  const [isLoading, setIsLoading] = useState<boolean>(() => !!getAuthToken());

  const updateUser = (newUser: AuthenticatedUser) => {
    const token = getAuthToken();
    if (token) {
      setUser(newUser);
      setAuthData(token, newUser);
    }
  };

  useEffect(() => {
    const verifyUserAuthentication = async () => {
      // Logic xác thực chỉ chạy nếu có token
      try {
        const freshUserFromServer = await authService.getMe();
        // Nếu thành công, cập nhật lại state cho chính xác
        const storedUser = getStoredUser();
        const updatedUser: AuthenticatedUser = {
          ...storedUser,
          ...freshUserFromServer,
        };
        setUser(updatedUser);
        setIsAuthenticated(true);
        // Không cần setAuthData ở đây vì token không đổi
      } catch (error) {
        // Nếu token không hợp lệ (lỗi 401, etc.)
        console.error("Auth verification failed:", error);
        clearAuthData();
        setIsAuthenticated(false);
        setUser(null);
        // Chỉ chuyển hướng NẾU được yêu cầu
        if (options.redirectToLoginIfFail) {
          router.replace("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // THAY ĐỔI 3: Logic chính nằm ở đây
    const token = getAuthToken();
    if (token) {
      // Nếu có token, chúng ta mới cần xác thực nó qua API
      verifyUserAuthentication();
    } else {
      // Nếu không có token, chúng ta không cần làm gì cả.
      // Chỉ chuyển hướng nếu được yêu cầu rõ ràng.
      setIsLoading(false); // Kết thúc loading ngay lập tức
      if (options.redirectToLoginIfFail) {
        const redirectUrl = window.location.pathname + window.location.search;
        router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.redirectToLoginIfFail]); // THAY ĐỔI 4: Chỉ chạy lại khi option chuyển hướng thay đổi

  return { user, isAuthenticated, isLoading, updateUser };
}
