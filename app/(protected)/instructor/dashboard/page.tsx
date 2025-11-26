"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  HelpCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideProps } from "lucide-react";
import { toast } from "sonner";
import { InstructorSummary, ActionItems } from "@/lib/types/index"; // Import the new service and types
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { instructorService } from "@/lib/api/instructorService";

// Stat Card Component (No changes needed, but I'll fix the 'any' type for icon)
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  isLoading: boolean;
  formatAsCurrency?: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
  formatAsCurrency = false,
}: StatCardProps) => {
  const displayValue =
    formatAsCurrency && typeof value === "number"
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value)
      : typeof value === "number"
      ? value.toLocaleString("vi-VN")
      : value;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-gray-500">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-gray-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-3/4" />
        ) : (
          <div className="text-3xl font-bold">{displayValue}</div>
        )}
      </CardContent>
    </Card>
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
  BarChart,
  Bar,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ... (keep existing StatCard component)

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<InstructorSummary | null>(null);
  const [actionItems, setActionItems] = useState<ActionItems | null>(null);
  const [chartMetric, setChartMetric] = useState<"revenue" | "enrollments">("revenue");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [summaryData, actionItemsData] = await Promise.all([
          instructorService.getDashboardSummary(),
          instructorService.getActionItems(),
        ]);
        setSummary(summaryData);
        setActionItems(actionItemsData);
      } catch (error) {
        toast.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const chartData = chartMetric === "revenue" 
    ? summary?.revenue_over_time?.map(item => ({
        period: item.month,
        value: Number(item.revenue)
      }))
    : summary?.enrollments_over_time?.map(item => ({
        period: item.month,
        value: Number(item.enrollments)
      }));

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
      <div className="bg-light-green border border-green-200 text-green-900 rounded-xl p-6">
        <h1 className="text-2xl xl:text-3xl font-bold">
          Chào mừng, {user?.full_name}! 🚀
        </h1>
        <p className="text-green-800 text-base xl:text-lg">
          Đây là trung tâm điều hành các khóa học của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={summary?.total_revenue ?? 0}
          icon={DollarSign}
          isLoading={isLoading}
          formatAsCurrency
        />
        <StatCard
          title="Tổng học viên"
          value={summary?.total_students ?? 0}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Đánh giá trung bình"
          value={summary?.average_rating?.toFixed(1) ?? "N/A"}
          icon={Star}
          isLoading={isLoading}
        />
        <StatCard
          title="Câu hỏi chờ trả lời"
          value={summary?.pending_questions_count ?? 0}
          icon={HelpCircle}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl xl:text-xl">
                  Thống kê {chartMetric === "revenue" ? "Doanh thu" : "Học viên mới"}
                </CardTitle>
                <CardDescription className="text-base">
                  Dữ liệu được tổng hợp theo tháng.
                </CardDescription>
              </div>
              <Select 
                value={chartMetric} 
                onValueChange={(v) => setChartMetric(v as "revenue" | "enrollments")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn chỉ số" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Doanh thu</SelectItem>
                  <SelectItem value="enrollments">Học viên mới</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMetric === "revenue" ? (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="period" 
                        tickFormatter={(val) => new Date(val).toLocaleDateString('vi-VN', { month: '2-digit', year: '2-digit' })}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number) => [
                          new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
                          'Doanh thu'
                        ]}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="period" 
                        tickFormatter={(val) => new Date(val).toLocaleDateString('vi-VN', { month: '2-digit', year: '2-digit' })}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number) => [value, 'Học viên']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Chưa có dữ liệu thống kê.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl xl:text-xl">Cần bạn xử lý</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-700">
                      Câu hỏi chưa trả lời
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {actionItems?.pending_questions?.length ?? 0}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Xem ngay
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-700">Đánh giá mới</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {actionItems?.recent_reviews?.length ?? 0}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Xem đánh giá
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
