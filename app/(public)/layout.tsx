"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";

const PublicHeader = () => {
  const { user, isLoading } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link href="/" className="text-xl font-bold">
          EngBreaking
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Trang chủ
          </Link>
          <Link
            href="/courses"
            className="text-sm font-medium hover:text-primary"
          >
            Khóa học
          </Link>
        </nav>
        <div>
          {/* BƯỚC 4: Logic hiển thị dựa trên trạng thái từ useAuth */}
          {isLoading ? (
            // Hiển thị một skeleton trong khi chờ xác thực
            <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
          ) : user ? (
            // Nếu đã đăng nhập, hiển thị nút Dashboard
            <Link href={`/${user.role}/dashboard`}>
              <Button>Vào Dashboard</Button>
            </Link>
          ) : (
            // Nếu chưa đăng nhập, hiển thị nút Đăng nhập/Đăng ký
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link href="/register">
                <Button>Đăng ký</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const PublicFooter = () => (
  <footer className="bg-gray-800 text-gray-400 py-8">
    <div className="container mx-auto text-center text-sm">
      <p>© 2025 EngBreaking. Nền tảng học tiếng Anh trực tuyến.</p>
    </div>
  </footer>
);

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="grow">{children}</main>{" "}
      {/* Sửa lại className từ 'flex-grow' thành 'grow' cho tailwindcss v4 */}
      <PublicFooter />
    </div>
  );
}
