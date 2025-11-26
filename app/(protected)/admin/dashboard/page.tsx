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

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ... (keep existing StatCard component)

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Chart state
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartMetric, setChartMetric] = useState("revenue");
  const [chartPeriod, setChartPeriod] = useState("month");
  const [isChartLoading, setIsChartLoading] = useState(true);

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

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsChartLoading(true);
        const data = await adminService.getMetricsTimeseries(chartMetric, chartPeriod);
        setChartData(data.timeseries);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setIsChartLoading(false);
      }
    };
    fetchChartData();
  }, [chartMetric, chartPeriod]);

  const formatYAxis = (value: number) => {
    if (chartMetric === "revenue") {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return String(value);
    }
    return String(value);
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Biểu đồ Tăng trưởng</CardTitle>
                <CardDescription>Theo dõi các chỉ số quan trọng theo thời gian</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={chartMetric} onValueChange={setChartMetric}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Chỉ số" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Doanh thu</SelectItem>
                    <SelectItem value="users">Người dùng</SelectItem>
                    <SelectItem value="enrollments">Ghi danh</SelectItem>
                    <SelectItem value="courses">Khóa học</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={chartPeriod} onValueChange={setChartPeriod}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Theo Tuần</SelectItem>
                    <SelectItem value="month">Theo Tháng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              {isChartLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.split('-').slice(1).join('/')}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatYAxis}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        chartMetric === 'revenue' 
                          ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
                          : value,
                        chartMetric === 'revenue' ? 'Doanh thu' : 'Số lượng'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0ea5e9"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Chưa có dữ liệu cho khoảng thời gian này.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
