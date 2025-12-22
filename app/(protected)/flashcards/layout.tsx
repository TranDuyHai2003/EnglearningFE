"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { clearAuthData } from "@/lib/auth/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/flashcards", label: "Bộ thẻ" },
  { href: "/flashcards/progress", label: "Tiến độ" },
  { href: "/flashcards/dictionary", label: "Từ điển" },
];

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth({ redirectToLoginIfFail: true });
  const pathname = usePathname();
  const router = useRouter();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const logout = () => {
    clearAuthData();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Xin chào</p>
            <p className="font-semibold text-lg">{user.full_name}</p>
          </div>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium px-3 py-2 rounded-md",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/student/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Về Dashboard
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Đăng xuất
            </Button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
