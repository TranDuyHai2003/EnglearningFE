import apiClient from "./apiClient";
import {
  ApiResponse,
  PaginatedResponse,
  Course,
  CourseForm,
  Category,
  CourseTag,
  CourseStatus,
  ApprovalStatus,
  SectionForm,
  Section,
  LessonForm,
  Lesson,
} from "@/lib/types";

interface ListCoursesParams {
  limit?: number;
  page?: number;
  status?: CourseStatus;
  approval_status?: ApprovalStatus;
  instructor_id?: number;
  category_id?: number;
  search?: string;
}

interface ListCoursesApiResponse {
  success: boolean;
  data: Course[];
  meta: PaginatedResponse<unknown>["meta"];
  message?: string;
}

export const courseService = {
  /**
   * Lấy danh sách khóa học có phân trang và bộ lọc.
   */
  async listCourses(
    params: ListCoursesParams
  ): Promise<PaginatedResponse<Course>> {
    const response = await apiClient.get<ListCoursesApiResponse>("/courses", {
      params,
    });
    const apiData = response.data;

    if (apiData.success && apiData.data && apiData.meta) {
      return {
        data: apiData.data,
        meta: apiData.meta,
      };
    }

    throw new Error(apiData.message || "Không thể tải danh sách khóa học.");
  },

  /**
   * Lấy thông tin chi tiết một khóa học bằng ID.
   */
  async getCourse(id: number): Promise<Course> {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể tìm thấy khóa học.");
  },

  /**
   * Tạo một khóa học mới.
   */
  async createCourse(data: CourseForm): Promise<Course> {
    const response = await apiClient.post<ApiResponse<Course>>(
      "/courses",
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Tạo khóa học thất bại.");
  },

  /**
   * Cập nhật một khóa học.
   */
  async updateCourse(id: number, data: Partial<CourseForm>): Promise<Course> {
    const response = await apiClient.patch<ApiResponse<Course>>(
      `/courses/${id}`,
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Cập nhật khóa học thất bại.");
  },

  /**
   * Lấy danh sách tất cả các danh mục.
   */
  async listCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      "/courses/meta/categories"
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể tải danh mục.");
  },

  /**
   * Lấy danh sách tất cả các tag.
   */
  async listTags(): Promise<CourseTag[]> {
    const response = await apiClient.get<ApiResponse<CourseTag[]>>(
      "/courses/meta/tags"
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể tải danh sách tag.");
  },
  async createSection(courseId: number, data: SectionForm): Promise<Section> {
    const response = await apiClient.post<ApiResponse<Section>>(
      `/courses/${courseId}/sections`,
      data
    );
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.message || "Tạo chương học thất bại.");
  },

  async updateSection(
    courseId: number,
    sectionId: number,
    data: Partial<SectionForm>
  ): Promise<Section> {
    const response = await apiClient.patch<ApiResponse<Section>>(
      `/courses/${courseId}/sections/${sectionId}`,
      data
    );
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.message || "Cập nhật chương học thất bại.");
  },

  async deleteSection(courseId: number, sectionId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/courses/${courseId}/sections/${sectionId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Xóa chương học thất bại.");
    }
  },

  async createLesson(sectionId: number, data: LessonForm): Promise<Lesson> {
    const response = await apiClient.post<ApiResponse<Lesson>>(
      `/courses/sections/${sectionId}/lessons`,
      data
    );
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.message || "Tạo bài học thất bại.");
  },

  /**
   * ✅ HÀM MỚI: Cập nhật một bài học.
   */
  async updateLesson(
    sectionId: number,
    lessonId: number,
    data: Partial<LessonForm>
  ): Promise<Lesson> {
    const response = await apiClient.patch<ApiResponse<Lesson>>(
      `/courses/sections/${sectionId}/lessons/${lessonId}`,
      data
    );
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.message || "Cập nhật bài học thất bại.");
  },

  /**
   * ✅ HÀM MỚI: Xóa một bài học.
   */
  async deleteLesson(sectionId: number, lessonId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/courses/sections/${sectionId}/lessons/${lessonId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Xóa bài học thất bại.");
    }
  },

  async changeCourseStatus(
    id: number,
    data: {
      status?: CourseStatus;
      approval_status?: ApprovalStatus;
      rejection_reason?: string;
    }
  ): Promise<Course> {
    const response = await apiClient.patch<ApiResponse<Course>>(
      `/courses/${id}/status`,
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(
      response.data.message || "Không thể thay đổi trạng thái khóa học."
    );
  },

  async getQuiz(quizId: number): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/learning/quizzes/${quizId}`
    );
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || "Không thể tải thông tin quiz.");
  },

  async upsertQuiz(data: any): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/learning/quizzes",
      data
    );
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || "Lưu quiz thất bại.");
  },

  async upsertQuestion(quizId: number, data: any): Promise<any> {
    const url = data.question_id
      ? `/learning/quizzes/${quizId}/questions/${data.question_id}`
      : `/learning/quizzes/${quizId}/questions`;

    const method = data.question_id ? "put" : "post";

    const response = await apiClient[method]<ApiResponse<any>>(url, data);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || "Lưu câu hỏi thất bại.");
  },

  async deleteQuestion(quizId: number, questionId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/learning/quizzes/${quizId}/questions/${questionId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Xóa câu hỏi thất bại.");
    }
  },

  async getCourseStudents(courseId: number): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/learning/enrollments?course_id=${courseId}&role=instructor`
    );
    if (response.data.success && response.data.data) return response.data.data;
    return [];
  },

  async getCourseReviews(courseId: number): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/interaction/reviews?course_id=${courseId}`
    );
    if (response.data.success && response.data.data) return response.data.data;
    return [];
  },

  async reorderSections(
    courseId: number,
    sections: { section_id: number; display_order: number }[]
  ): Promise<void> {
    const response = await apiClient.patch<ApiResponse<null>>(
      `/courses/${courseId}/sections/reorder`,
      { sections }
    );
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Cập nhật thứ tự chương học thất bại."
      );
    }
  },
};
