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
  Video,
  BookMarked,
  BookOpenCheck,
  History,
  Award,
  ChevronDown,
  LifeBuoy,
  Menu,
  Book,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";

// Primary items shown on the left
const primaryNavItems = [
  { href: "/student/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/student/my-courses", icon: BookMarked, label: "Khóa học của tôi" },
  { href: "/courses", icon: BookOpenCheck, label: "Khám phá" },
];

// Secondary items shown on the right (after Resources)
const secondaryNavItems = [
  { href: "/student/certificates", icon: Award, label: "Chứng chỉ" },
  { href: "/student/transactions", icon: History, label: "Lịch sử giao dịch" },
  { href: "/student/support", icon: LifeBuoy, label: "Hỗ trợ" },
];

// Items moved to User Dropdown on Desktop
const userDropdownItems: { href: string; icon: any; label: string }[] = [];

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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    clearAuthData();
    router.push("/");
  };

  const NavLink = ({ item, mobile = false }: { item: any; mobile?: boolean }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/" && pathname?.startsWith(item.href));
      
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors ${
          mobile ? "w-full text-base" : "text-sm lg:text-base"
        } ${
          isActive
            ? "text-gray-900 font-bold bg-gray-200"
            : "text-gray-600 hover:text-primary hover:bg-gray-50"
        }`}
      >
        <item.icon className={mobile ? "h-5 w-5" : "h-4 w-4 lg:h-5 lg:w-5"} />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white sticky top-0 z-50 border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />

            {/* Desktop Main Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {primaryNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
              
              {/* Resources Dropdown in Main Nav */}
               <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 rounded-md text-sm lg:text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors focus:outline-none">
                  <Book className="h-4 w-4 lg:h-5 lg:w-5" />
                  Học liệu
                  <ChevronDown className="h-3 w-3 ml-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem asChild>
                    <Link href="/flashcards" className="cursor-pointer">Flashcards</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/flashcards/dictionary" className="cursor-pointer">Từ điển</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {secondaryNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Nav Trigger */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                 <DropdownMenuLabel>Menu</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {primaryNavItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                 ))}
                 
                 <DropdownMenuSeparator />
                 <DropdownMenuLabel>Học liệu</DropdownMenuLabel>
                 <DropdownMenuItem asChild>
                    <Link href="/flashcards" className="flex items-center gap-2 cursor-pointer">
                       <Book className="h-4 w-4" /> Flashcards
                    </Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/flashcards/dictionary" className="flex items-center gap-2 cursor-pointer">
                       <Book className="h-4 w-4" /> Từ điển
                    </Link>
                 </DropdownMenuItem>
                 
                 <DropdownMenuSeparator />
                 <DropdownMenuLabel>Khác</DropdownMenuLabel>
                 {secondaryNavItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                 ))}

                 {/* Desktop: Show secondary items in User Dropdown */}
                 {userDropdownItems.length > 0 && (
                   <>
                     <DropdownMenuSeparator />
                     <DropdownMenuLabel>Cá nhân</DropdownMenuLabel>
                     {userDropdownItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                     ))}
                   </>
                 )}
                 
                 <DropdownMenuSeparator />
                 <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600" onClick={handleLogout}>
                   <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            <div className="flex items-center gap-2">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-gray-200 hover:border-primary">
                   {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                   ) : (
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.full_name.charAt(0)}
                      </div>
                   )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/student/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Hồ sơ cá nhân
                  </Link>
                </DropdownMenuItem>
                
                {/* Desktop: Show secondary items in User Dropdown (if any remain) */}
                {userDropdownItems.length > 0 && (
                  <div className="hidden md:block">
                    <DropdownMenuSeparator />
                    {userDropdownItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="cursor-pointer">
                          <item.icon className="mr-2 h-4 w-4" /> {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 lg:px-8">
        {children}
      </main>
    </div>
  );
}
