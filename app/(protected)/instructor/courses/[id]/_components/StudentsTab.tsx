import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { courseService } from "@/lib/api/courseService";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface StudentsTabProps {
  courseId: number;
}

export function StudentsTab({ courseId }: StudentsTabProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await courseService.getCourseStudents(courseId);
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [courseId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách học viên ({students.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {students.length > 0 ? (
          <div className="space-y-4">
            {students.map((enrollment) => (
              <div
                key={enrollment.enrollment_id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={enrollment.student?.avatar_url} />
                    <AvatarFallback>
                      {enrollment.student?.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{enrollment.student?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.student?.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Tiến độ: {enrollment.completion_percentage}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Đăng ký:{" "}
                    {format(new Date(enrollment.enrolled_at), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Chưa có học viên nào đăng ký khóa học này.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
