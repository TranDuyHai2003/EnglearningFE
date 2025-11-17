"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { instructorService } from "@/lib/api/instructorService";
import { InstructorProfile } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthData } from "@/lib/auth/utils";

// --- Component con cho màn hình chờ duyệt / yêu cầu nộp hồ sơ ---
// Định nghĩa kiểu cho prop `status` một cách chặt chẽ
type PromptStatus = "pending" | "rejected" | "no_profile";

const ApplicationPrompt = ({
  status,
  reason,
}: {
  status: PromptStatus;
  reason?: string | null;
}) => {
  const handleLogoutAndRedirectHome = () => {
    clearAuthData();
    window.location.href = "/";
  };

  const getStatusMessage = () => {
    switch (status) {
      case "pending":
        return {
          title: "Hồ sơ của bạn đang chờ duyệt",
          description:
            "Chúng tôi đang xem xét hồ sơ của bạn. Vui lòng quay lại sau. Bạn có thể chỉnh sửa hồ sơ nếu cần.",
        };
      case "rejected":
        return {
          title: "Hồ sơ của bạn đã bị từ chối",
          description: `Lý do: ${
            reason || "Không có lý do cụ thể"
          }. Vui lòng cập nhật lại hồ sơ và gửi lại để chúng tôi xem xét.`,
        };
      default: // 'no_profile'
        return {
          title: "Hoàn thành hồ sơ của bạn",
          description:
            "Để bắt đầu giảng dạy, bạn cần tạo và gửi hồ sơ để chúng tôi xem xét. Sau khi được phê duyệt, bạn sẽ có quyền truy cập đầy đủ vào các công cụ dành cho giảng viên.",
        };
    }
  };

  const { title, description } = getStatusMessage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/instructor/profile">
          <Button>Đến trang hồ sơ</Button>
        </Link>
        <Button variant="outline" onClick={handleLogoutAndRedirectHome}>
          Đăng xuất & Về trang chủ
        </Button>
      </div>
    </div>
  );
};

// --- Component Layout chính ---
export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading || !user) return;
    if (user.role !== "instructor") {
      router.replace(`/${user.role}/dashboard`);
      return;
    }
    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        const myProfile = await instructorService.getMyProfile();
        setProfile(myProfile);
      } catch (error) {
        console.error("Failed to fetch instructor profile:", error);
        setProfile(null);
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user, isAuthLoading, router]);

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  const isLoading = isAuthLoading || isProfileLoading;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">
          Đang tải dữ liệu giảng viên...
        </p>
      </div>
    );
  }

  // --- RENDER LOGIC (ĐÃ SỬA) ---
  const approvalStatus = profile?.approval_status;

  // Trường hợp 1: Instructor đã được duyệt
  if (approvalStatus === "approved") {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav /* ... JSX navbar đầy đủ ... */>
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="text-2xl">👨‍🏫</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">E-Learning</h1>
                <p className="text-xs text-gray-600">Giảng viên</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/instructor/dashboard"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/instructor/my-courses"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Khóa học của tôi
              </Link>
              <Link
                href="/instructor/create-course"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Tạo khóa học
              </Link>
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <Link
                  href="/instructor/profile"
                  className="flex items-center gap-2"
                >
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.full_name}
                  </span>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        <footer className="bg-gray-900 text-gray-400 mt-12 py-8 text-center text-sm">
          <p>&copy; 2025 E-Learning Platform. Developed by Team.</p>
        </footer>
      </div>
    );
  }

  // Trường hợp 2: Instructor chưa được duyệt VÀ đang ở trang profile
  if (pathname === "/instructor/profile") {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // Trường hợp 3: Instructor chưa được duyệt VÀ đang ở các trang khác
  // Ở đây, chúng ta biết chắc chắn `approvalStatus` không phải là 'approved'
  return (
    <ApplicationPrompt
      status={approvalStatus || "no_profile"}
      reason={profile?.rejection_reason}
    />
  );
}
