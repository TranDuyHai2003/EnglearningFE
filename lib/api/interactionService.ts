import apiClient from "./apiClient";
import { ApiResponse, QaDiscussion, QaReply, Review } from "@/lib/types";

export const interactionService = {
  // === Q&A ===
  getDiscussions: async (params: {
    lesson_id?: number;
    course_id?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<QaDiscussion[]>>(
      "/interaction/discussions",
      { params }
    );
    return response.data.data;
  },

  createDiscussion: async (lesson_id: number, question: string) => {
    const response = await apiClient.post<ApiResponse<QaDiscussion>>(
      "/interaction/discussions",
      { lesson_id, question }
    );
    return response.data.data;
  },

  replyDiscussion: async (discussion_id: number, reply_text: string) => {
    const response = await apiClient.post<ApiResponse<QaReply>>(
      `/interaction/discussions/${discussion_id}/replies`,
      { reply_text }
    );
    return response.data.data;
  },

  deleteDiscussion: async (discussion_id: number) => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/interaction/discussions/${discussion_id}`
    );
    return response.data;
  },

  deleteReply: async (discussion_id: number, reply_id: number) => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/interaction/discussions/${discussion_id}/replies/${reply_id}`
    );
    return response.data;
  },

  // === REVIEWS ===
  getReviews: async (params: {
    course_id?: number;
    status?: string;
    limit?: number;
    page?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<Review[]>>(
      "/interaction/reviews",
      { params }
    );
    return response.data.data;
  },

  createReview: async (course_id: number, rating: number, comment: string) => {
    const response = await apiClient.post<ApiResponse<Review>>(
      "/interaction/reviews",
      { course_id, rating, comment }
    );
    return response.data.data;
  },
};
