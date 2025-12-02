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
  CalendarClock,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { instructorService } from "@/lib/api/instructorService";
import { InstructorProfile } from "@/lib/types";
import { clearAuthData } from "@/lib/auth/utils";
import { Logo } from "@/app/page";
import { cn } from "@/lib/utils";

type PromptStatus = "pending" | "rejected" | "interviewing" | "no_profile";
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
      case "interviewing":
        return {
          icon: (
            <CalendarClock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          ),
          title: "Mời Phỏng vấn & Dạy thử",
          description:
            "Hồ sơ của bạn đã qua vòng sơ loại. Vui lòng vào trang Hồ sơ để xem lịch hẹn phỏng vấn hoặc hướng dẫn từ Admin.",
          buttonText: "Xem lịch hẹn",
        };
      case "pending":
        return {
          icon: (
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          ),
          title: "Hồ sơ đang chờ duyệt",
          description:
            "Chúng tôi đang xem xét hồ sơ của bạn. Quá trình này có thể mất 1-2 ngày làm việc.",
          buttonText: "Xem hồ sơ",
        };
      case "rejected":
        return {
          icon: (
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          ),
          title: "Hồ sơ cần bổ sung",
          description: `Lý do: ${
            reason || "Chưa đạt yêu cầu"
          }. Vui lòng cập nhật lại hồ sơ.`,
          buttonText: "Cập nhật hồ sơ",
        };
      default:
        return {
          icon: (
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          ),
          title: "Hoàn thành hồ sơ giảng viên",
          description:
            "Để bắt đầu giảng dạy, bạn cần nộp hồ sơ năng lực bao gồm CV và Video dạy thử.",
          buttonText: "Nộp hồ sơ ngay",
        };
    }
  };

  const { title, description, icon, buttonText } = getStatusMessage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-background p-6 text-center">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-lg w-full border">
        {icon}
        <h1 className="text-2xl font-bold mb-3 text-gray-900">{title}</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>

        <div className="flex flex-col gap-3">
          <Link href="/instructor/profile" className="w-full">
            <Button className="w-full text-base py-5">{buttonText}</Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleLogoutAndRedirectHome}
            className="w-full"
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
};

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
      if (user.role === "student") {
        router.replace("/student/dashboard");
      } else if (user.role.includes("admin")) {
        router.replace("/admin/dashboard");
      }
      return;
    }

    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        const myProfile = await instructorService.getMyProfile();
        setProfile(myProfile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <Loader2 className="h-12 w-12 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!user) return null;

  const approvalStatus = profile?.approval_status;

  if (approvalStatus === "approved") {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <header className="bg-white sticky top-0 z-50 border-b shadow-sm">
          <div className="flex justify-between items-center h-20 w-full max-w-[95%] mx-auto px-4">
            <Logo />

            <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-full border">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-full transition-all duration-200",
                      isActive
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
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
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline">{user.full_name}</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="w-full max-w-[95%] mx-auto py-8 px-4">{children}</main>
      </div>
    );
  }

  if (pathname === "/instructor/profile" || pathname === "/instructor/apply") {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Logo />
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.full_name} ({user.role})
              </span>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
              </Button>
            </div>
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <ApplicationPrompt
      status={approvalStatus || "no_profile"}
      reason={profile?.rejection_reason}
    />
  );
}
