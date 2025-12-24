"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/app/page";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, LayoutDashboard, Sparkles, ChevronDown } from "lucide-react";
import { clearAuthData } from "@/lib/auth/utils";

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth({ redirectToLoginIfFail: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    router.push("/");
    router.refresh();
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role.includes("admin")) return "/admin/dashboard";
    return `/${user.role}/dashboard`;
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
      <div className="flex justify-between items-center h-16 w-full px-4 md:px-8 lg:px-12">
        <Logo />

        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link
            href="/"
            className={`text-lg font-medium transition-colors ${
              pathname === "/"
                ? "text-primary font-bold"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Trang chủ
          </Link>
          <Link
            href="/courses"
            className={`text-lg font-medium transition-colors ${
              pathname === "/courses"
                ? "text-primary font-bold"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Khóa học
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-lg font-medium text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1 focus:outline-none">
              Học liệu
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/flashcards">Flashcards</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/flashcards/dictionary">Từ điển</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href="/#features"
            className="text-lg font-medium text-gray-600 hover:text-primary transition-colors"
          >
            Về chúng tôi
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {!mounted ? (
            // Server-side and initial client render: Show Guest View
            <>
              <Link href="/login">
                <Button className="rounded-full text-base font-semibold px-6 bg-green-500 hover:bg-green-600 text-white border-none">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full text-base font-semibold px-6 bg-blue-600 hover:bg-blue-700 text-white border-none">
                  Đăng ký
                </Button>
              </Link>
            </>
          ) : isLoading ? (
            <div className="h-10 w-20 bg-gray-100 animate-pulse rounded-full" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link href={getDashboardLink()}>
                <Button variant="ghost" className="hidden md:flex items-center gap-2 font-medium text-gray-700 hover:text-primary hover:bg-gray-100">
                  <LayoutDashboard className="h-4 w-4" />
                  Vào Dashboard
                </Button>
              </Link>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage
                      src={user.avatar_url || ""}
                      alt={user.full_name}
                    />
                    <AvatarFallback>
                      {user.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.full_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/flashcards">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Flashcards &amp; Từ điển
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${user.role}/profile`}>
                    <User className="mr-2 h-4 w-4" />
                    Hồ sơ cá nhân
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button className="rounded-full text-base font-semibold px-6 bg-green-500 hover:bg-green-600 text-white border-none">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full text-base font-semibold px-6 bg-blue-600 hover:bg-blue-700 text-white border-none">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
