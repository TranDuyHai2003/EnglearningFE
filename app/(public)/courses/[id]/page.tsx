"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { courseService } from "@/lib/api/courseService";
import { Course } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, BarChart, Users, PlayCircle, Lock, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PurchaseButton } from "@/components/courses/PurchaseButton";

const CourseDetailSkeleton = () => (
  <div className="container mx-auto py-12">
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-8 w-1/3 mt-4" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  </div>
);

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = Number(params.id);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const data = await courseService.getCourse(courseId);
        setCourse(data);
      } catch (error) {
        toast.error("Không thể tải thông tin khóa học.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Không tìm thấy khóa học</h2>
        <p className="text-muted-foreground mt-2">
          Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
      </div>
    );
  }

  const displayPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(course.price);

  return (
    <div className="bg-slate-50">
      <header className="bg-gray-800 text-white py-12">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
          <p className="text-lg text-gray-300 mb-4">
            {course.description?.substring(0, 150)}...
          </p>
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <BarChart size={16} /> {course.level}
            </span>
            <span className="flex items-center gap-2">
              <Users size={16} /> {course.total_students} học viên
            </span>
            <span className="flex items-center gap-2">
              <Star size={16} /> {Number(course.average_rating ?? 0).toFixed(1)}{" "}
              ({course.reviewed_by || 0} đánh giá)
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Nội dung khóa học</h2>
            <div className="space-y-4">
              {course.sections?.map((section) => (
                <div
                  key={section.section_id}
                  className="border rounded-lg bg-white"
                >
                  <h3 className="font-semibold p-4 bg-gray-50 rounded-t-lg border-b">
                    {section.title}
                  </h3>
                  <ul className="divide-y">
                    {section.lessons?.map((lesson) => (
                      <li
                        key={lesson.lesson_id}
                        className="flex justify-between items-center p-3"
                      >
                        <span className="flex items-center gap-3">
                          {lesson.allow_preview ? (
                            <PlayCircle className="text-blue-500" size={20} />
                          ) : (
                            <Lock className="text-gray-400" size={20} />
                          )}
                          {lesson.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          {lesson.allow_preview ? "Xem trước" : "5 phút"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <aside className="sticky top-24 self-start">
            <Card>
              <CardHeader className="p-0">
                <Image
                  src={course.thumbnail_url || "/placeholder.png"}
                  alt={course.title}
                  width={400}
                  height={200}
                  className="rounded-t-lg w-full object-cover"
                />
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-3xl font-bold mb-4">{displayPrice}</p>
                <PurchaseButton
                  courseId={course.course_id}
                  price={course.price}
                  discountPrice={course.discount_price ?? undefined}
                  isEnrolled={course.is_enrolled || false}
                />
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-3">
                    <Clock size={16} /> Thời lượng: {course.duration_hours} giờ
                  </li>
                  <li className="flex items-center gap-3">
                    <BarChart size={16} /> Trình độ: {course.level}
                  </li>
                  <li className="flex items-center gap-3">
                    <Users size={16} /> {course.total_students} học viên đã tham
                    gia
                  </li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
