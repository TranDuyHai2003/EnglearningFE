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

  const [user, setUser] = useState<AuthenticatedUser | null>(() =>
    getStoredUser()
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!getAuthToken()
  );

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
      try {
        const freshUserFromServer = await authService.getMe();

        const storedUser = getStoredUser();
        const updatedUser: AuthenticatedUser = {
          ...storedUser,
          ...freshUserFromServer,
        };
        setUser(updatedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth verification failed:", error);
        clearAuthData();
        setIsAuthenticated(false);
        setUser(null);

        if (options.redirectToLoginIfFail) {
          router.replace("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const token = getAuthToken();
    if (token) {
      verifyUserAuthentication();
    } else {
      setIsLoading(false);
      if (options.redirectToLoginIfFail) {
        const redirectUrl = window.location.pathname + window.location.search;
        router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      }
    }
  }, [options.redirectToLoginIfFail]);

  return { user, isAuthenticated, isLoading, updateUser };
}
