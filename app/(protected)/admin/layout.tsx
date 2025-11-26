// admin/layout.tsx
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
  User,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { clearAuthData } from "@/lib/auth/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/app/page";
import { useEffect } from "react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/admin/users", icon: Users, label: "Người dùng" },
  { href: "/admin/courses", icon: BookCopy, label: "Khóa học" },
  { href: "/admin/approvals", icon: CheckCircle, label: "Phê duyệt" },
  { href: "/admin/instructors", icon: UserCheck, label: "Giảng viên" },
  { href: "/admin/transactions", icon: CreditCard, label: "Giao dịch" },
  { href: "/admin/support", icon: LifeBuoy, label: "Hỗ trợ" },
  { href: "/admin/settings", icon: Settings, label: "Cài đặt" },
];

const NavLink = ({ item }: { item: (typeof navItems)[0] }) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-200",
        isActive && "bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
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
  const { user, isLoading } = useAuth({ redirectToLoginIfFail: true });
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !user.role.includes("admin")) {
      router.replace(`/${user.role}/dashboard`);
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-white lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-20 items-center border-b px-6">
            <Logo />
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
        <header className="flex h-20 items-center gap-4 border-b bg-white px-6">
          <div className="flex-1">
            <h1 className="font-semibold text-lg text-gray-800">
              Admin Control Panel
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <User className="h-5 w-5 text-gray-700" />
            <span>{user.full_name}</span>
          </div>
          <Button
            onClick={() => {
              clearAuthData();
              router.push("/");
            }}
            variant="destructive"
            size="sm"
          >
            <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
          </Button>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-brand-background">
          {children}
        </main>
      </div>
    </div>
  );
}
