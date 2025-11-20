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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Trophy,
  Clock,
  PlayCircle,
  ArrowRight,
  Activity,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { learningService } from "@/lib/api/learningService";
import { Enrollment, RecentActivity, StudentStats } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// StatCard (giữ nguyên, không thay đổi)
interface StatCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  isLoading: boolean;
}
const StatCard = ({
  title,
  value,
  unit,
  icon: Icon,
  isLoading,
}: StatCardProps) => (
  <Card className="shadow-sm hover:shadow-lg transition-shadow bg-white">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      <CardTitle className="text-base xl:text-lg font-medium text-gray-500">
        {title}
      </CardTitle>
      <Icon className="h-6 w-6 text-gray-400" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-10 xl:h-12 w-1/2 mt-2" />
      ) : (
        <>
          <span className="text-3xl xl:text-4xl font-bold text-gray-900">
            {value.toLocaleString("vi-VN")}
          </span>
          <span className="text-base xl:text-lg text-muted-foreground ml-2">
            {unit}
          </span>
        </>
      )}
    </CardContent>
  </Card>
);

const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case "lesson_completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "quiz_submitted":
        return <HelpCircle className="h-5 w-5 text-blue-600" />;
      case "course_enrolled":
        return <BookOpen className="h-5 w-5 text-purple-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg">
      <div className="pt-1">{getIcon()}</div>
      <div>
        <p className="font-medium text-base xl:text-lg text-gray-800">
          {activity.title}
        </p>
        <p className="text-sm xl:text-base text-gray-500">
          {activity.course_title}
        </p>
        <p className="text-xs xl:text-sm text-gray-400 mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), {
            addSuffix: true,
            locale: vi,
          })}
        </p>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Gọi 3 API song song để tối ưu tốc độ tải
        const [enrollmentsResponse, statsResponse, activitiesResponse] =
          await Promise.all([
            learningService.getMyEnrollments({ limit: 3 }), // Chỉ lấy 3 khóa gần nhất
            learningService.getMyStats(),
            learningService.getActivityFeed(5), // Lấy 5 hoạt động gần nhất
          ]);

        setEnrollments(enrollmentsResponse.data);
        setStats(statsResponse);
        setActivities(activitiesResponse);
      } catch (error) {
        toast.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const coursesInProgress =
    enrollments?.filter((e) => e.status === "active") || [];

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg p-8 lg:p-10">
        <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold mb-2">
          Chào mừng trở lại, {user?.full_name}! 👋
        </h1>
        <p className="text-indigo-100 text-base xl:text-lg">
          Hãy tiếp tục hành trình chinh phục tiếng Anh của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Khóa học đã đăng ký"
          value={stats?.total_courses_enrolled ?? 0}
          icon={BookOpen}
          unit="khóa"
          isLoading={isLoading}
        />
        <StatCard
          title="Khóa học hoàn thành"
          value={stats?.total_courses_completed ?? 0}
          icon={Trophy}
          unit="khóa"
          isLoading={isLoading}
        />
        <StatCard
          title="Giờ học tích lũy"
          value={Math.round(stats?.total_hours_learned ?? 0)}
          icon={Clock}
          unit="giờ"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-white shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center pb-6">
            <div>
              <CardTitle className="text-xl xl:text-xl mb-1">
                Các khóa học đang tham gia
              </CardTitle>
              <CardDescription className="text-base xl:text-lg">
                Tiếp tục từ nơi bạn đã dừng lại.
              </CardDescription>
            </div>
            <Link href="/student/my-courses">
              <Button variant="ghost" className="text-base xl:text-lg">
                Xem tất cả <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : coursesInProgress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coursesInProgress.map((enrollment) => (
                  <Card
                    key={enrollment.enrollment_id}
                    className="flex flex-col border hover:border-primary transition-colors hover:shadow-md"
                  >
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-lg xl:text-xl h-14">
                        {enrollment.course.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {enrollment.course.instructor?.full_name || "Admin"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-end mt-4">
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>Tiến độ</span>
                          <span className="font-semibold">
                            {enrollment.completion_percentage}%
                          </span>
                        </div>
                        <Progress
                          value={enrollment.completion_percentage}
                          className="h-2"
                        />
                      </div>
                      <Link href={`/learn/courses/${enrollment.course_id}`}>
                        <Button className="w-full text-base py-6">
                          <PlayCircle className="mr-2 h-5 w-5" /> Tiếp tục học
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg bg-gray-50">
                <h3 className="text-xl xl:text-xl font-semibold text-gray-800 mb-3">
                  Bạn chưa tham gia khóa học nào
                </h3>
                <p className="text-muted-foreground mt-2 mb-6 text-base xl:text-lg">
                  Hãy khám phá và bắt đầu hành trình của bạn ngay!
                </p>
                <Link href="/courses">
                  <Button className="text-base py-6 px-8">
                    Khám phá khóa học
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl xl:text-xl flex items-center gap-2">
              <Activity /> Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">
                Không có hoạt động nào gần đây.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
