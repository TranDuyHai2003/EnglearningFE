import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/lib/types";
import { Users, Star, DollarSign, BookOpen } from "lucide-react";

interface OverviewTabProps {
  course: Course;
}

export function OverviewTab({ course }: OverviewTabProps) {
  const stats = [
    {
      title: "Tổng học viên",
      value: course.total_students || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Đánh giá trung bình",
      value: course.average_rating || 0,
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      title: "Doanh thu ước tính",
      value: `${(course.price * (course.total_students || 0)).toLocaleString()} đ`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Tổng số bài học",
      value: course.sections?.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0) || 0,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mô tả khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              {course.description || "Chưa có mô tả."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Trạng thái:</span>
              <span className="font-medium capitalize">{course.status}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Giá:</span>
              <span className="font-medium">
                {course.price.toLocaleString()} đ
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Cấp độ:</span>
              <span className="font-medium capitalize">{course.level}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Ngôn ngữ:</span>
              <span className="font-medium">{course.language}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
