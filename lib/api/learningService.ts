import apiClient from "./apiClient";
import {
  PaginatedResponse,
  Enrollment,
  ProgressStatus,
  ApiResponse,
} from "@/lib/types";

class LearningService {
  /**
   * Lấy danh sách các khóa học mà học viên đã ghi danh.
   */
  async getMyEnrollments(): Promise<PaginatedResponse<Enrollment>> {
    const response = await apiClient.get<PaginatedResponse<Enrollment>>(
      "/learning/enrollments"
    );
    return response.data;
  }

  /**
   * Lấy toàn bộ nội dung của một khóa học (chương, bài học) và tiến độ của học viên.
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
      {
        lesson_id: lessonId,
        status: status,
        video_progress: videoProgress,
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể cập nhật tiến độ.");
    }
  }
}

export const learningService = new LearningService();
