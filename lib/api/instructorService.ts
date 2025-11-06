import { apiRequest } from "./client";
import {
  ApiResponse,
  InstructorProfile,
  InstructorApplicationForm,
} from "@/lib/types";
import {
  mockInstructorProfiles,
  mockPendingApplications,
} from "@/lib/mock/users.mock";

const USE_MOCK = true;

export const instructorService = {
  async submitApplication(
    data: InstructorApplicationForm
  ): Promise<ApiResponse<InstructorProfile>> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newProfile: InstructorProfile = {
        profile_id: Math.floor(Math.random() * 10000),
        user_id: 1, // Current user
        ...data,
        approval_status: "pending",
      };

      return {
        success: true,
        message: "Application submitted successfully",
        data: newProfile,
      };
    }

    return apiRequest<ApiResponse<InstructorProfile>>({
      method: "POST",
      url: "/instructors/apply",
      data,
    });
  },

  async getApplicationStatus(
    userId: number
  ): Promise<ApiResponse<InstructorProfile>> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const profile = [
        ...mockInstructorProfiles,
        ...mockPendingApplications,
      ].find((p) => p.user_id === userId);

      if (!profile) throw new Error("Application not found");

      return {
        success: true,
        message: "Application status retrieved",
        data: profile,
      };
    }

    return apiRequest<ApiResponse<InstructorProfile>>({
      method: "GET",
      url: `/instructors/application/${userId}`,
    });
  },

  async getPendingApplications(): Promise<ApiResponse<InstructorProfile[]>> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        success: true,
        message: "Pending applications retrieved",
        data: mockPendingApplications,
      };
    }

    return apiRequest<ApiResponse<InstructorProfile[]>>({
      method: "GET",
      url: "/instructors/pending",
    });
  },

  async approveApplication(
    profileId: number
  ): Promise<ApiResponse<InstructorProfile>> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const profile = mockPendingApplications.find(
        (p) => p.profile_id === profileId
      );

      if (!profile) throw new Error("Application not found");

      profile.approval_status = "approved";
      profile.approved_at = new Date().toISOString();

      return {
        success: true,
        message: "Application approved successfully",
        data: profile,
      };
    }

    return apiRequest<ApiResponse<InstructorProfile>>({
      method: "POST",
      url: `/instructors/${profileId}/approve`,
    });
  },

  async rejectApplication(
    profileId: number,
    reason: string
  ): Promise<ApiResponse<InstructorProfile>> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const profile = mockPendingApplications.find(
        (p) => p.profile_id === profileId
      );

      if (!profile) throw new Error("Application not found");

      profile.approval_status = "rejected";
      profile.rejection_reason = reason;

      return {
        success: true,
        message: "Application rejected",
        data: profile,
      };
    }

    return apiRequest<ApiResponse<InstructorProfile>>({
      method: "POST",
      url: `/instructors/${profileId}/reject`,
      data: { reason },
    });
  },
};
