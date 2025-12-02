"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Logo } from "@/app/page";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role.includes("admin")) {
        router.replace(`/admin/dashboard`);
      } else {
        router.replace(`/${user.role}/dashboard`);
      }
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-base text-gray-600 font-medium">
            Đang tải...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-xl max-h-[100vh] bg-white rounded-2xl shadow-xl p-6 overflow-auto border border-gray-100">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        {children}
      </div>
    </div>
  );
}
