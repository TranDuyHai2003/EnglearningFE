"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  Loader2,
  AlertTriangle,
  LayoutDashboard,
  BookCopy,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { instructorService } from "@/lib/api/instructorService";
import { InstructorProfile } from "@/lib/types";
import { clearAuthData } from "@/lib/auth/utils";
import { Logo } from "@/app/page";
import { cn } from "@/lib/utils";

// --- Component ApplicationPrompt (giữ nguyên, không thay đổi) ---
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
      default:
        return {
          title: "Hoàn thành hồ sơ của bạn",
          description:
            "Để bắt đầu giảng dạy, bạn cần tạo và gửi hồ sơ để chúng tôi xem xét. Sau khi được phê duyệt, bạn sẽ có quyền truy cập đầy đủ vào các công cụ dành cho giảng viên.",
        };
    }
  };
  const { title, description } = getStatusMessage();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-background p-6 text-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/instructor/profile">
            <Button>Đến trang hồ sơ</Button>
          </Link>
          <Button variant="outline" onClick={handleLogoutAndRedirectHome}>
            Đăng xuất & Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};
// --- END ---

const navItems = [
  { href: "/instructor/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/instructor/my-courses", icon: BookCopy, label: "Quản lý khóa học" },
  {
    href: "/instructor/create-course",
    icon: PlusCircle,
    label: "Tạo khóa học mới",
  },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: isAuthLoading } = useAuth({
    redirectToLoginIfFail: true,
  });

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

  if (isLoading || !user || (user.role !== "instructor" && !isAuthLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <Loader2 className="h-12 w-12 animate-spin text-brand-green" />
      </div>
    );
  }

  const approvalStatus = profile?.approval_status;

  if (approvalStatus === "approved") {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <header className="bg-white sticky top-0 z-50 border-b ">
          <div className="flex justify-between items-center h-30 w-full max-w-[90%] mx-auto">
            <Logo />

            <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 rounded-full bg-gray-100 p-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 text-sm lg:text-lg xl:text-xl  font-semibold py-2 px-4 rounded-full transition-colors",
                      isActive
                        ? "bg-white shadow-sm text-primary"
                        : "text-gray-600 hover:text-gray-800"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href="/instructor/profile"
                className="flex items-center gap-2 text-sm lg:text-lg xl:text-xl  font-semibold text-gray-700 hover:text-primary"
              >
                <User className="h-5 w-5" />
                <span>{user.full_name}</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:bg-red-50 hover:text-red-600 lg:text-lg xl:text-xl "
              >
                <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
              </Button>
            </div>
          </div>
        </header>
        <main className="w-full max-w-[90%] mx-auto py-10">{children}</main>
      </div>
    );
  }

  if (pathname === "/instructor/profile") {
    return (
      <div className="min-h-screen bg-brand-background py-10">{children}</div>
    );
  }

  return (
    <ApplicationPrompt
      status={approvalStatus || "no_profile"}
      reason={profile?.rejection_reason}
    />
  );
}
