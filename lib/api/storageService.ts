import apiClient from "./apiClient";
import { ApiResponse, LessonUploadResponse } from "@/lib/types";

export const storageService = {
  async uploadLessonVideo(
    lessonId: number,
    file: File
  ): Promise<LessonUploadResponse> {
    const formData = new FormData();
    formData.append("lessonId", String(lessonId));
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<LessonUploadResponse>>(
      "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.message || "Không thể tải lên video. Vui lòng thử lại."
    );
  },

  async getLecturePlaybackUrl(key: string): Promise<string> {
    const response = await apiClient.get<
      ApiResponse<{ url: string; expires_in: number }>
    >("/lecture/url", {
      params: { key },
    });

    if (response.data.success && response.data.data?.url) {
      return response.data.data.url;
    }

    throw new Error(
      response.data.message ||
        "Không thể lấy liên kết phát video. Vui lòng thử lại."
    );
  },
};
