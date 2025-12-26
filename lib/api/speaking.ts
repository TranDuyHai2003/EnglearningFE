import apiClient from "./apiClient";

export const speakingApi = {
  getPackages: async () => {
    const response = await apiClient.get("/speaking/packages");
    return response.data;
  },

  buyPackage: async (packageId: number) => {
    const response = await apiClient.post("/speaking/buy", { packageId });
    return response.data;
  },

  getMyCredit: async () => {
    const response = await apiClient.get("/speaking/credit");
    return response.data;
  },

  getCurriculum: async () => {
    const response = await apiClient.get("/speaking/curriculum");
    return response.data;
  },

  getSchedule: async (topicId: number) => {
    const response = await apiClient.get("/speaking/schedule", { params: { topicId } });
    return response.data;
  },

  bookSlot: async (sessionId: number) => {
    const response = await apiClient.post("/speaking/book", { sessionId });
    return response.data;
  }
};
