"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { learningService } from "@/lib/api/learningService";
import { Enrollment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { getImageUrl } from "@/lib/utils";

const MyCoursesSkeleton = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <Skeleton className="h-64 w-full" />
      </Card>
    ))}
  </div>
);

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setIsLoading(true);
      try {
        const response = await learningService.getMyEnrollments();

        setEnrollments(response.data);
      } catch (error) {
        toast.error("Không thể tải các khóa học của bạn.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (isLoading) {
    return <MyCoursesSkeleton />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Khóa học của tôi</h1>
      {enrollments && enrollments.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.enrollment_id} className="flex flex-col">
              <CardHeader className="p-0">
                <Image
                  src={getImageUrl(enrollment.course.thumbnail_url)}
                  alt={enrollment.course.title}
                  width={400}
                  height={200}
                  className="rounded-t-lg w-full object-cover"
                  unoptimized={true}
                />
              </CardHeader>
              <CardContent className="p-4 flex flex-col grow">
                <h3 className="font-semibold text-lg line-clamp-2 grow">
                  {enrollment.course.title}
                </h3>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Tiến độ</span>
                    <span>{enrollment.completion_percentage}%</span>
                  </div>
                  <Progress value={enrollment.completion_percentage} />
                </div>
                <Link
                  href={`/learn/courses/${enrollment.course_id}`}
                  className="mt-4"
                >
                  <Button className="w-full">Vào học</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">
            Bạn chưa tham gia khóa học nào
          </h2>
          <Link href="/courses" className="mt-4 inline-block">
            <Button>Khám phá khóa học</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
