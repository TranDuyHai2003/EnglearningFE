// User types
export type UserRole = "student" | "instructor" | "admin" | "system_admin";
export type UserStatus = "active" | "inactive" | "pending";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: "student" | "instructor";
}

// API Error types
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
}
