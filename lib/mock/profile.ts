import { InstructorProfile } from "@/lib/types";

// Một biến để giả lập trạng thái của hồ sơ
// Bạn có thể thay đổi giá trị này để test các kịch bản khác nhau:
// 'pending', 'approved', 'rejected', hoặc null (chưa có hồ sơ)
let mockProfileStatus: "pending" | "approved" | "rejected" | null = null;

const baseProfile: Omit<InstructorProfile, "approval_status"> = {
  profile_id: 101,
  user_id: 2, // Giả sử user ID của giảng viên là 2
  bio: "Tôi là một giảng viên có 5 năm kinh nghiệm giảng dạy tiếng Anh giao tiếp và luyện thi IELTS. Tôi đam mê giúp đỡ học viên vượt qua rào cản ngôn ngữ.",
  education:
    "Cử nhân Ngôn ngữ Anh - Đại học Khoa học Xã hội và Nhân văn TP.HCM",
  experience: "5 năm tại Trung tâm Anh ngữ ABC, 2 năm dạy online.",
  certificates: "IELTS 8.5, TESOL",
  rejection_reason:
    "Hồ sơ chưa cung cấp đủ minh chứng về kinh nghiệm giảng dạy.",
};

// Hàm để lấy dữ liệu giả
export const getMockInstructorProfile = (): InstructorProfile | null => {
  if (mockProfileStatus === null) {
    return null; // Giả lập trường hợp chưa có hồ sơ
  }
  return {
    ...baseProfile,
    approval_status: mockProfileStatus,
  };
};

// Hàm để cập nhật dữ liệu giả (giả lập việc submit form)
export const updateMockInstructorProfile = (
  newData: Partial<InstructorProfile>
): InstructorProfile => {
  mockProfileStatus = "pending"; // Sau khi cập nhật, trạng thái luôn là pending
  Object.assign(baseProfile, newData);
  return {
    ...baseProfile,
    approval_status: "pending",
  };
};

// Hàm để thay đổi trạng thái để test
export const setMockProfileStatus = (
  status: "pending" | "approved" | "rejected" | null
) => {
  mockProfileStatus = status;
};

// Ví dụ: gọi setMockProfileStatus('pending') trong console của trình duyệt để test
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).setMockProfileStatus = setMockProfileStatus;
}
