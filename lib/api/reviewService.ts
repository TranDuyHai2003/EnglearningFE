import api from "./apiClient";

export const reviewService = {
  // Get reviews for a course
  getCourseReviews: async (
    courseId: number,
    page = 1,
    limit = 20,
    rating?: number
  ) => {
    const response = await api.get(`/courses/${courseId}/reviews`, {
      params: { page, limit, rating },
    });
    return response.data;
  },

  // Get my review for a course
  getMyReview: async (courseId: number) => {
    const response = await api.get(`/courses/${courseId}/reviews/me`);
    return response.data;
  },

  // Create or update review
  upsertReview: async (
    courseId: number,
    data: { rating: number; comment?: string }
  ) => {
    const response = await api.post(`/courses/${courseId}/reviews`, data);
    return response.data;
  },

  // Delete my review
  deleteReview: async (courseId: number) => {
    const response = await api.delete(`/courses/${courseId}/reviews`);
    return response.data;
  },
};
