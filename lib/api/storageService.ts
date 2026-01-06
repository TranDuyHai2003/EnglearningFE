import apiClient from "./apiClient";
import { ApiResponse, LessonUploadResponse, DocumentUploadResponse } from "@/lib/types";

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

  async uploadLessonDocument(
    lessonId: number,
    file: File
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append("lessonId", String(lessonId));
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<DocumentUploadResponse>>(
      "/upload/document",
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
      response.data.message || "Không thể tải lên tài liệu. Vui lòng thử lại."
    );
  },
};
