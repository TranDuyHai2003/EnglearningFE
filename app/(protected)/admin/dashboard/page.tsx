"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // Thêm Link
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  BookOpen,
  CreditCard,
  UserCheck,
  FileClock,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { adminService } from "@/lib/api/adminService";

interface DashboardSummary {
  total_users: number;
  total_courses: number;
  pending_courses: number;
  pending_instructors: number;
  total_enrollments: number;
  total_revenue: number;
}

// Sửa lại StatCard để nhận href
const StatCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
  formatAsCurrency = false,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading: boolean;
  formatAsCurrency?: boolean;
  href?: string; // Thêm prop href
}) => {
  const displayValue =
    formatAsCurrency && typeof value === "number"
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value)
      : value;

  const CardContentComponent = (
    <Card className="transition-all hover:shadow-md hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className="text-2xl font-bold">{displayValue}</div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{CardContentComponent}</Link>;
  }

  return CardContentComponent;
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ... logic fetch data giữ nguyên
    const fetchSummary = async () => {
      try {
        const data = await adminService.getDashboardSummary();
        setSummary(data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chào mừng, {user?.full_name || "Admin"}! 👋
        </h1>
        <p className="text-gray-600">
          Đây là trang tổng quan quản lý hệ thống EngBreaking.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Tổng Doanh thu"
          value={summary?.total_revenue || 0}
          icon={CreditCard}
          isLoading={isLoading}
          formatAsCurrency={true}
          href="/admin/transactions" // Thêm href
        />
        <StatCard
          title="Tổng Người dùng"
          value={summary?.total_users || 0}
          icon={Users}
          isLoading={isLoading}
          href="/admin/users" // Thêm href
        />
        <StatCard
          title="Tổng Khóa học"
          value={summary?.total_courses || 0}
          icon={BookOpen}
          isLoading={isLoading}
          href="/admin/courses" // Thêm href
        />
        <StatCard
          title="Tổng Lượt ghi danh"
          value={summary?.total_enrollments || 0}
          icon={BarChart3}
          isLoading={isLoading}
        />
        <StatCard
          title="GV Chờ duyệt"
          value={summary?.pending_instructors || 0}
          icon={UserCheck}
          isLoading={isLoading}
          href="/admin/instructors" // Thêm href
        />
        <StatCard
          title="Khóa học Chờ duyệt"
          value={summary?.pending_courses || 0}
          icon={FileClock}
          isLoading={isLoading}
          href="/admin/courses" // Thêm href
        />
      </div>
    </div>
  );
}
