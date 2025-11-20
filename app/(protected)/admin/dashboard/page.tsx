"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

interface DashboardSummary {
  total_users: number;
  total_courses: number;
  pending_courses: number;
  pending_instructors: number;
  total_enrollments: number;
  total_revenue: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
  formatAsCurrency = false,
  href,
  colorClass,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading: boolean;
  formatAsCurrency?: boolean;
  href?: string;
  colorClass?: string;
}) => {
  const displayValue =
    formatAsCurrency && typeof value === "number"
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value)
      : value.toLocaleString("vi-VN");

  const CardContentComponent = (
    <Card
      className={cn(
        "transition-all hover:shadow-lg hover:-translate-y-1",
        colorClass
      )}
    >
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

  return href ? (
    <Link href={href}>{CardContentComponent}</Link>
  ) : (
    CardContentComponent
  );
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
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
    <div className="space-y-8">
      <div className="bg-white rounded-lg border p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chào mừng, {user?.full_name || "Admin"}! 👑
        </h1>
        <p className="text-gray-600">
          Tổng quan tình hình hoạt động của nền tảng EngBreaking.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Tổng Doanh thu"
          value={summary?.total_revenue || 0}
          icon={CreditCard}
          isLoading={isLoading}
          formatAsCurrency={true}
          href="/admin/transactions"
        />
        <StatCard
          title="Tổng Người dùng"
          value={summary?.total_users || 0}
          icon={Users}
          isLoading={isLoading}
          href="/admin/users"
        />
        <StatCard
          title="Tổng Khóa học"
          value={summary?.total_courses || 0}
          icon={BookOpen}
          isLoading={isLoading}
          href="/admin/courses"
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
          href="/admin/instructors"
          colorClass="bg-yellow-100 border-yellow-300 ring-2 ring-yellow-400"
        />
        <StatCard
          title="Khóa học Chờ duyệt"
          value={summary?.pending_courses || 0}
          icon={FileClock}
          isLoading={isLoading}
          href="/admin/courses"
          colorClass="bg-yellow-100 border-yellow-300 ring-2 ring-yellow-400"
        />
      </div>

      {/* Thêm các section mới */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ Tăng trưởng Doanh thu</CardTitle>
            <CardDescription>Dữ liệu giả lập 6 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">
                [Biểu đồ sẽ được hiển thị ở đây]
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các sự kiện mới nhất trên hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-gray-700">
                  Người dùng mới
                  <span className="font-semibold">Trần Văn An</span> vừa đăng
                  ký.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-gray-700">
                  Khóa học
                  <span className="font-semibold">IELTS Speaking Master</span>
                  vừa có 1 lượt ghi danh mới.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <UserCheck className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-gray-700">
                  Giảng viên <span className="font-semibold">Lê Thị Bích</span>
                  vừa nộp hồ sơ chờ duyệt.
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
