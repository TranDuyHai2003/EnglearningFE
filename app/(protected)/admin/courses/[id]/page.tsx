"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/lib/api/courseService";
import { adminService } from "@/lib/api/adminService";
import { Course, Section, Lesson } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  PlayCircle,
  FileText,
  HelpCircle,
  Clock,
  Users,
  Star,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { ReviewDialog } from "../../approvals/_components/ReviewDialog";
import { AdminLessonPreview } from "./_components/AdminLessonPreview";
import { cn, getImageUrl } from "@/lib/utils";

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const fetchCourse = async () => {
    try {
      const data = await courseService.getCourse(courseId);
      setCourse(data);

      if (selectedLesson) {
        const updatedLesson = data.sections
          ?.flatMap((s) => s.lessons || [])
          .find((l) => l.lesson_id === selectedLesson.lesson_id);
        if (updatedLesson) setSelectedLesson(updatedLesson);
      }
    } catch (error) {
      toast.error("Không thể tải thông tin khóa học");
      router.push("/admin/approvals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!courseId) return;
    fetchCourse();
  }, [courseId, router]);

  const handleApproveCourse = async () => {
    if (!course) return;
    try {
      await adminService.approveCourse(course.course_id);
      toast.success("Đã phê duyệt khóa học");
      router.push("/admin/approvals");
    } catch (error) {
      toast.error("Phê duyệt thất bại");
    }
  };

  const handleRejectCourse = async (reason: string) => {
    if (!course) return;
    try {
      await adminService.rejectCourse(course.course_id, reason);
      toast.success("Đã từ chối khóa học");
      router.push("/admin/approvals");
    } catch (error) {
      toast.error("Từ chối thất bại");
    }
  };

  if (isLoading) return <div className="p-8 text-center">Đang tải...</div>;
  if (!course)
    return <div className="p-8 text-center">Không tìm thấy khóa học</div>;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="border-b p-4 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              {course.title}
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
            </h1>
            <p className="text-sm text-muted-foreground">
              Giảng viên: {course.instructor?.full_name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {course.approval_status !== "approved" && (
            <Button
              onClick={() => handleApproveCourse()}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Phê duyệt khóa học
            </Button>
          )}
          {course.approval_status !== "rejected" && (
            <Button variant="destructive" onClick={() => setIsReviewOpen(true)}>
              <XCircle className="mr-2 h-4 w-4" /> Từ chối khóa học
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r bg-slate-50 flex flex-col shrink-0">
          <div className="p-4 border-b bg-white">
            <h3 className="font-semibold mb-2">Nội dung khóa học</h3>
            <div className="text-xs text-muted-foreground flex gap-2">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" /> Đã duyệt
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-600" /> Từ chối
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-500" /> Chờ duyệt
              </span>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <button
                onClick={() => setSelectedLesson(null)}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-md text-sm font-medium transition-colors",
                  !selectedLesson
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-slate-200"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Tổng quan khóa học
              </button>

              {course.sections?.map((section) => (
                <div key={section.section_id} className="space-y-1">
                  <div className="font-medium text-sm px-2 py-1 text-slate-900">
                    {section.title}
                  </div>
                  <div className="pl-2 space-y-1">
                    {section.lessons?.map((lesson) => (
                      <button
                        key={lesson.lesson_id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={cn(
                          "w-full flex items-center justify-between p-2 rounded-md text-sm text-left transition-colors group",
                          selectedLesson?.lesson_id === lesson.lesson_id
                            ? "bg-white shadow-sm border border-primary/20"
                            : "hover:bg-slate-200 text-slate-600"
                        )}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {lesson.lesson_type === "video" && (
                            <PlayCircle className="h-3 w-3 shrink-0" />
                          )}
                          {lesson.lesson_type === "document" && (
                            <FileText className="h-3 w-3 shrink-0" />
                          )}
                          {lesson.lesson_type === "quiz" && (
                            <HelpCircle className="h-3 w-3 shrink-0" />
                          )}
                          <span>{lesson.title}</span>
                        </div>
                        <div className="shrink-0">
                          {lesson.approval_status === "approved" && (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                          {lesson.approval_status === "rejected" && (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          {lesson.approval_status === "pending" && (
                            <div className="h-2 w-2 rounded-full bg-orange-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-6">
          {selectedLesson ? (
            <AdminLessonPreview
              lesson={selectedLesson}
              onUpdate={fetchCourse}
            />
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-slate-100 shadow-sm">
                {course.thumbnail_url ? (
                  <Image
                    src={getImageUrl(course.thumbnail_url)}
                    alt={course.title}
                    fill
                    className="object-cover"
                    priority
                    unoptimized={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Không có ảnh bìa
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Mô tả khóa học</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Thông tin chi tiết
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Giá:</span>
                        <span className="font-medium">
                          {course.price.toLocaleString()} đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Giảm giá:</span>
                        <span className="font-medium">
                          {course.discount_price?.toLocaleString() || 0} đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trình độ:</span>
                        <span className="font-medium capitalize">
                          {course.level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ngôn ngữ:</span>
                        <span className="font-medium">{course.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Thời lượng:
                        </span>
                        <span className="font-medium">
                          {course.duration_hours} giờ
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReviewDialog
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onApprove={handleApproveCourse}
        onReject={handleRejectCourse}
        title={`Duyệt khóa học: ${course.title}`}
        hideApprove={true}
      />
    </div>
  );
}
