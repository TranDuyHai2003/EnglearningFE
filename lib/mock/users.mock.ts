import { InstructorProfile, User } from "@/lib/types";

export const mockUsers: User[] = [
  {
    user_id: 1,
    email: "student@test.com",
    full_name: "Nguyễn Văn Sinh Viên",
    role: "student",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    user_id: 2,
    email: "instructor@test.com",
    full_name: "Trần Thị Giảng Viên",
    role: "instructor",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    user_id: 3,
    email: "admin@test.com",
    full_name: "Lê Văn Admin",
    role: "support_admin",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
];

export const mockInstructorProfiles: InstructorProfile[] = [
  {
    profile_id: 1,
    user_id: 2,
    bio: "Giảng viên tiếng Anh 10 năm kinh nghiệm",
    education: "Thạc sĩ Ngôn ngữ Anh, ĐH Ngoại ngữ",
    experience: "10 năm giảng dạy IELTS",
    certificates: "IELTS 8.5, TESOL Certificate",
    approval_status: "approved",
    approved_at: "2025-01-05T00:00:00Z",
  },
];

export const mockPendingApplications: InstructorProfile[] = [
  {
    profile_id: 2,
    user_id: 4,
    bio: "Giảng viên TOEIC 5 năm kinh nghiệm",
    education: "Cử nhân Sư phạm Anh, ĐH Sư phạm TP.HCM",
    experience: "5 năm giảng dạy TOEIC",
    certificates: "TOEIC 950",
    approval_status: "pending",
  },
];
