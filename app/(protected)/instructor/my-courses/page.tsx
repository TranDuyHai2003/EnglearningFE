"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { courseService } from "@/lib/api/courseService";
import { Course } from "@/lib/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

const CourseCardSkeleton = () => (
  <Card>
    <div className="flex flex-col space-y-3 p-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  </Card>
);

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyCourses = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await courseService.listCourses({
        instructor_id: user.id,
      });

      setCourses(response.data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách khóa học."
      );
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Khóa học của tôi</h1>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Khóa học của tôi</h1>
        <Link href="/instructor/create-course">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tạo khóa học mới
          </Button>
        </Link>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              href={`/instructor/courses/${course.course_id}`}
              key={course.course_id}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <Image
                    src={getImageUrl(course.thumbnail_url)}
                    alt={course.title}
                    width={400}
                    height={200}
                    className="rounded-t-lg w-full object-cover aspect-[16/9]"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="line-clamp-2 mb-2">
                    {course.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {course.status}
                    </Badge>
                    <Badge
                      variant={
                        course.approval_status === "approved"
                          ? "default"
                          : course.approval_status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {course.approval_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Bạn chưa có khóa học nào</h2>
          <p className="text-muted-foreground mt-2 mb-4">
            Hãy bắt đầu chia sẻ kiến thức của bạn ngay hôm nay!
          </p>
          <Link href="/instructor/create-course">
            <Button>Tạo khóa học đầu tiên</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
