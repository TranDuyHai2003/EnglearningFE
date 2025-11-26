import api from "./apiClient";

export const discussionService = {
  // Get discussions for a lesson
  getDiscussions: async (lessonId: number, page = 1, limit = 20) => {
    const response = await api.get(
      `/learning/lessons/${lessonId}/discussions`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  // Create a new discussion
  createDiscussion: async (
    lessonId: number,
    data: { title: string; content: string }
  ) => {
    const response = await api.post(
      `/learning/lessons/${lessonId}/discussions`,
      data
    );
    return response.data;
  },

  // Create a reply
  createReply: async (discussionId: number, content: string) => {
    const response = await api.post(
      `/learning/discussions/${discussionId}/replies`,
      { content }
    );
    return response.data;
  },

  // Mark reply as helpful
  markReplyHelpful: async (replyId: number) => {
    const response = await api.patch(`/learning/replies/${replyId}/helpful`);
    return response.data;
  },

  // Resolve discussion
  resolveDiscussion: async (discussionId: number) => {
    const response = await api.patch(
      `/learning/discussions/${discussionId}/resolve`
    );
    return response.data;
  },

  // Delete discussion
  deleteDiscussion: async (discussionId: number) => {
    const response = await api.delete(`/learning/discussions/${discussionId}`);
    return response.data;
  },

  // Delete reply
  deleteReply: async (replyId: number) => {
    const response = await api.delete(`/learning/replies/${replyId}`);
    return response.data;
  },
};
