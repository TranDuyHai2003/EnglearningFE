"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut, Menu, X, Loader2 } from "lucide-react";
import { clearAuthData } from "@/lib/auth/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 2. Di chuyển logic chuyển hướng vào useEffect
  useEffect(() => {
    // Chỉ thực hiện kiểm tra khi đã hết loading và đã có thông tin user
    if (!isLoading && user) {
      if (user.role !== "student") {
        router.replace(`/${user.role}/dashboard`);
      }
    }
    // Nếu không có user sau khi loading xong, chuyển về trang login
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]); // Dependency array: chạy lại khi các giá trị này thay đổi

  // 3. Hiển thị loading trong khi chờ xác thực hoặc trong lúc chuyển hướng
  // Điều này ngăn việc layout bị "nháy" lên màn hình nếu user có vai trò không hợp lệ
  if (isLoading || !user || user.role !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📚</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EngBreaking</h1>
                <p className="text-xs text-gray-600">Nền tảng học tiếng Anh</p>
              </div>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/student/dashboard"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/student/my-courses"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                📚 Khóa học của tôi
              </Link>
              <Link
                href="/student/transactions"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                💰 Giao dịch
              </Link>

              {/* User Menu */}
              <div className="flex items-center gap-4 pl-8 border-l border-gray-200">
                <Link
                  href="/student/profile"
                  className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
                >
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                    {user.full_name}
                  </span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </Button>
              </div>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-2 pb-4">
              <Link
                href="/student/dashboard"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/student/my-courses"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                📚 Khóa học của tôi
              </Link>
              <Link
                href="/student/transactions"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                💰 Giao dịch
              </Link>
              <Link
                href="/student/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                👤 {user.full_name}
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 justify-center mt-2"
              >
                <LogOut size={16} />
                Đăng xuất
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2025 EngBreaking. Nền tảng học tiếng Anh trực tuyến.</p>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <Link href="#" className="hover:text-white">
              Về chúng tôi
            </Link>
            <Link href="#" className="hover:text-white">
              Liên hệ
            </Link>
            <Link href="#" className="hover:text-white">
              Điều khoản
            </Link>
            <Link href="#" className="hover:text-white">
              Bảo mật
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
