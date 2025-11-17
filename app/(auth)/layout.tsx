"use client";

import { ReactNode } from "react";
import { useEffect } from "react";

import { getStoredUser } from "@/lib/auth/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(`/${user.role}/dashboard`);
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-12">
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
