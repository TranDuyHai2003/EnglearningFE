"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getStoredUser } from "@/lib/auth/utils";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      router.push(`/${user.role}/dashboard`);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          📚 E-Learning Platform
        </h1>
        <p className="text-xl text-gray-600 mb-2">Trung tâm Anh Ngữ</p>
        <p className="text-gray-600 mb-8">
          Nền tảng học tập trực tuyến chuyên nghiệp
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Đăng nhập</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Đăng ký
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
