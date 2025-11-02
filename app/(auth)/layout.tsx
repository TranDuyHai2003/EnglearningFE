"use client";

import { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Nếu đã login, redirect to dashboard
    const user = getStoredUser();
    if (user) {
      router.push(`/${user.role}/dashboard`);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600 text-white rounded-lg p-3 mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">E-Learning</h1>
          <p className="text-gray-600 mt-2">Trung tâm Anh Ngữ</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">{children}</div>
      </div>
    </div>
  );
}
