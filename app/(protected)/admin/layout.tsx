"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookCopy,
  UserCheck,
  CreditCard,
  Settings,
  LogOut,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { clearAuthData } from "@/lib/auth/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/admin/users", icon: Users, label: "Người dùng" },
  { href: "/admin/courses", icon: BookCopy, label: "Khóa học" },
  { href: "/admin/instructors", icon: UserCheck, label: "Giảng viên" },
  { href: "/admin/transactions", icon: CreditCard, label: "Giao dịch" },
  { href: "/admin/support", icon: LifeBuoy, label: "Hỗ trợ" },
  { href: "/admin/settings", icon: Settings, label: "Cài đặt" },
];

const NavLink = ({ item }: { item: (typeof navItems)[0] }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
        isActive && "bg-gray-100 text-gray-900"
      )}
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-gray-100/40 lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <span className="text-lg">Admin Panel</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6">
          {/* Mobile Nav Trigger có thể thêm ở đây */}
          <div className="flex-1">
            <h1 className="font-semibold text-lg">{user?.full_name}</h1>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
          </Button>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
