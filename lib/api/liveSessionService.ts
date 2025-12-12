import apiClient from "./apiClient";
import { ApiResponse, LiveSession, SessionRegistration } from "@/lib/types";

interface ListSessionsParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  instructor_id?: number;
  course_id?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface CreateSessionPayload {
  course_id?: number;
  instructor_id?: number;
  session_type?: string;
  title: string;
  description?: string;
  scheduled_start: string;
  scheduled_end: string;
  capacity?: number;
  meeting_provider?: string;
  meeting_link?: string;
}

const liveSessionService = {
  async listSessions(
    params: ListSessionsParams = {}
  ): Promise<PaginatedResponse<LiveSession>> {
    const response = await apiClient.get<ApiResponse<LiveSession[]>>(
      "/live-sessions",
      { params }
    );
    if (response.data.success) {
      return {
        data: response.data.data || [],
        meta: response.data.meta || {
          total: 0,
          page: params.page || 1,
          limit: params.limit || 20,
          total_pages: 0,
        },
      };
    }
    throw new Error(response.data.message || "Không thể tải lịch học trực tiếp");
  },

  async getSession(id: number): Promise<LiveSession> {
    const response = await apiClient.get<ApiResponse<LiveSession>>(
      `/live-sessions/${id}`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể tải buổi học");
  },

  async createSession(payload: CreateSessionPayload): Promise<LiveSession> {
    const response = await apiClient.post<ApiResponse<LiveSession>>(
      "/live-sessions",
      payload
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể tạo buổi học");
  },

  async updateSession(
    id: number,
    payload: Partial<CreateSessionPayload>
  ): Promise<LiveSession> {
    const response = await apiClient.put<ApiResponse<LiveSession>>(
      `/live-sessions/${id}`,
      payload
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể cập nhật buổi học");
  },

  async cancelSession(id: number): Promise<LiveSession> {
    const response = await apiClient.post<ApiResponse<LiveSession>>(
      `/live-sessions/${id}/cancel`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể hủy buổi học");
  },

  async register(id: number): Promise<SessionRegistration> {
    const response = await apiClient.post<ApiResponse<SessionRegistration>>(
      `/live-sessions/${id}/register`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể đặt chỗ");
  },

  async markAttendance(
    registrationId: number,
    payload: Partial<SessionRegistration>
  ): Promise<SessionRegistration> {
    const response = await apiClient.post<ApiResponse<SessionRegistration>>(
      `/live-sessions/registrations/${registrationId}/attendance`,
      payload
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể cập nhật điểm danh");
  },
};

export { liveSessionService };
