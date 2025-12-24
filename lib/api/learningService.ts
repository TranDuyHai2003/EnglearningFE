import apiClient from "./apiClient";
import {
  ApiResponse,
  PaginatedResponse,
  Enrollment,
  ProgressStatus,
  StudentStats,
  RecentActivity,
} from "@/lib/types";

export interface ListEnrollmentsParams {
  limit?: number;
  page?: number;
  status?: "active" | "completed" | "dropped";
}

class LearningService {
  /**
   * Lấy danh sách các khóa học mà học viên đã ghi danh.
   * @param params - Các tùy chọn filter như limit, page, status.
   */
  async getMyEnrollments(
    params: ListEnrollmentsParams = {}
  ): Promise<PaginatedResponse<Enrollment>> {
    const response = await apiClient.get<PaginatedResponse<Enrollment>>(
      "/learning/enrollments",
      { params }
    );
    return response.data;
  }

  /**
   * Lấy toàn bộ nội dung của một khóa học và tiến độ của học viên.
   */
  async getMyCourseContent(courseId: number): Promise<Enrollment> {
    const response = await apiClient.get<ApiResponse<Enrollment>>(
      `/learning/courses/${courseId}/content`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(
      response.data.message || "Không thể tải nội dung khóa học."
    );
  }

  /**
   * Ghi nhận tiến độ học của một bài học.
   */
  async recordProgress(
    lessonId: number,
    status: ProgressStatus,
    videoProgress?: number
  ): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/learning/progress",
      { lesson_id: lessonId, status: status, video_progress: videoProgress }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể cập nhật tiến độ.");
    }
  }

  /**
   * Lấy thống kê tổng quan của học viên.
   */
async getMyStats(): Promise<StudentStats> {
  try {
    const response = await apiClient.get<ApiResponse<StudentStats>>(
      "/learning/my-stats"
    );
    
    // Debug: log response để xem backend trả về gì
    console.log("Stats API Response:", response.data);

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data?.message || "Dữ liệu thống kê không hợp lệ");
  } catch (error: any) {
    // Nếu lỗi do backend trả về 401, 404, 500 nó sẽ rơi vào đây
    console.error("API Error in getMyStats:", error.response?.data || error.message);
    throw error;
  }
}
  /**
   * Lấy hoạt động gần đây của học viên.
   */
  async getActivityFeed(limit: number = 5): Promise<RecentActivity[]> {
    const response = await apiClient.get<ApiResponse<RecentActivity[]>>(
      "/learning/my-activity-feed",
      { params: { limit } }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(
      response.data.message || "Không thể tải hoạt động gần đây."
    );
  }

  /**
   * Lấy chi tiết bài quiz (bao gồm câu hỏi).
   */
  async getQuiz(quizId: number): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/learning/quizzes/${quizId}`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể tải bài quiz.");
  }

  /**
   * Bắt đầu một lượt làm bài quiz mới.
   */
  async startQuizAttempt(quizId: number): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/learning/quizzes/${quizId}/attempts`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể bắt đầu làm bài.");
  }

  /**
   * Nộp bài làm quiz.
   */
  async submitQuizAttempt(
    attemptId: number,
    answers: { question_id: number; selected_option_id: number }[]
  ): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/learning/attempts/${attemptId}/submit`,
      { answers }
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Nộp bài thất bại.");
  }
  /**
   * Tải chứng chỉ khóa học.
   */
  async downloadCertificate(courseId: number): Promise<Blob> {
    const response = await apiClient.get(
      `/learning/certificates/${courseId}/download`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  /**
   * Lấy lịch sử làm bài quiz.
   */
  async getQuizAttempts(quizId: number): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/learning/quizzes/${quizId}/attempts`
    );
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  }
}

export const learningService = new LearningService();
