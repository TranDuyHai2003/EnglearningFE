"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { clearAuthData } from "@/lib/auth/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/app/page";
import {
  User,
  LogOut,
  Loader2,
  LayoutDashboard,
  BookMarked,
  BookOpenCheck,
  History,
  Award,
  LifeBuoy,
} from "lucide-react";
import { useEffect } from "react";

const navItems = [
  { href: "/student/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/student/my-courses", icon: BookMarked, label: "Khóa học của tôi" },
  { href: "/student/certificates", icon: Award, label: "Chứng chỉ" },
  { href: "/courses", icon: BookOpenCheck, label: "Tìm khóa học" },
  { href: "/student/transactions", icon: History, label: "Lịch sử giao dịch" },
  { href: "/student/support", icon: LifeBuoy, label: "Hỗ trợ" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth({ redirectToLoginIfFail: true });

  useEffect(() => {
    if (!isLoading && user && user.role !== "student") {
      router.replace(`/${user.role}/dashboard`);
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-brand-blue" />
      </div>
    );
  }

  const handleLogout = () => {
    clearAuthData();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-brand-background">
      <header className="bg-white sticky top-0 z-50 border-b">
        <div className="flex justify-between items-center h-15 w-full px-4 md:px-8 lg:px-12 py-5">
          <Logo />
          <nav className="hidden md:flex items-center gap-2 lg:gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-base lg:text-lg font-medium transition-colors ${
                    isActive 
                      ? "text-indigo-600 font-bold" 
                      : "text-gray hover:text-primary hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/student/profile"
              className="flex items-center gap-2 text-sm lg:text-lg font-semibold text-gray-700 hover:text-primary"
            >
              <User className="h-5 w-5" />
              <span>{user.full_name}</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:bg-red-50 hover:text-red-600 lg:text-lg"
            >
              <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 lg:py-12 px-4 lg:px-6">
        {children}
      </main>
    </div>
  );
}
