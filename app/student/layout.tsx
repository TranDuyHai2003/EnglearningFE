"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";
import { getStoredUser, clearAuthData } from "@/lib/auth";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const user = getStoredUser();

  if (!user) {
    router.push("/login");
    return null;
  }

  if (user.role !== "student") {
    router.push(`/${user.role}/dashboard`);
    return null;
  }

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">📚</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">E-Learning</h1>
              <p className="text-xs text-gray-600">Học viên</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/student/dashboard"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/student/my-courses"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Khóa học
            </Link>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user.full_name}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-12 py-8 text-center text-sm">
        <p>&copy; 2025 E-Learning Platform. Developed by Team.</p>
      </footer>
    </div>
  );
}
