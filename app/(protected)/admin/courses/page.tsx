"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { courseService } from "@/lib/api/courseService";
import { Course, CourseStatus } from "@/lib/types";
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
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

const CourseReviewSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function AdminCoursesReviewPage() {
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState<number | null>(null);

  const fetchPendingCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await courseService.listCourses({
        approval_status: "pending",
      });
      setPendingCourses(response.data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Lỗi khi tải danh sách khóa học."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingCourses();
  }, [fetchPendingCourses]);

  const handleReview = async (courseId: number, isApproved: boolean) => {
    setIsMutating(courseId);
    let rejectionReason: string | null = null;

    if (!isApproved) {
      rejectionReason = prompt("Vui lòng nhập lý do từ chối:");
      if (!rejectionReason) {
        toast.info("Hành động đã được hủy.");
        setIsMutating(null);
        return;
      }
    }

    try {
      await courseService.changeCourseStatus(courseId, {
        status: isApproved ? "published" : "rejected",
        approval_status: isApproved ? "approved" : "rejected",
        rejection_reason: rejectionReason || undefined,
      });
      toast.success(
        `Đã ${isApproved ? "phê duyệt" : "từ chối"} khóa học thành công!`
      );
      fetchPendingCourses(); // Tải lại danh sách
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Thao tác thất bại."
      );
    } finally {
      setIsMutating(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Duyệt nội dung khóa học</h1>
      <p className="text-muted-foreground mb-8">
        Các khóa học đang chờ được xem xét và xuất bản.
      </p>

      {isLoading ? (
        <CourseReviewSkeleton />
      ) : pendingCourses.length > 0 ? (
        <div className="space-y-6">
          {pendingCourses.map((course) => (
            <Card key={course.course_id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription>
                      Bởi {course.instructor?.full_name} -
                      <Link
                        href={`/instructor/courses/${course.course_id}`}
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        Xem chi tiết
                      </Link>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{course.approval_status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button
                  size="sm"
                  onClick={() => handleReview(course.course_id, true)}
                  disabled={isMutating === course.course_id}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Phê duyệt & Xuất bản
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReview(course.course_id, false)}
                  disabled={isMutating === course.course_id}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Từ chối
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold">
            Không có khóa học nào chờ duyệt
          </h3>
          <p className="text-muted-foreground mt-2">
            Mọi thứ đều đã được xử lý!
          </p>
        </div>
      )}
    </div>
  );
}
