import { User } from "@/lib/types";

const USER_KEY = "user";
const TOKEN_KEY = "token";

// Lấy user từ localStorage
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? (JSON.parse(userStr) as User) : null;
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return null;
  }
}

// Lấy token từ localStorage
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Lưu user và token vào localStorage
export function setAuthData(user: User, token: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

//Xóa auth data
export function clearAuthData(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

// Check nếu đã authenticated
export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

// Get dashboard URL theo role
export function getRoleDashboard(role: string): string {
  const dashboards: Record<string, string> = {
    student: "/student/dashboard",
    instructor: "/instructor/dashboard",
    admin: "/admin/dashboard",
    system_admin: "/admin/dashboard",
  };
  return dashboards[role] || "/login";
}
