"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { learningService } from "@/lib/api/learningService";
import { Enrollment, Lesson, LessonProgress } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseSidebar } from "../../_components/CourseSideBar";
import { LessonContent } from "../../_components/LessonContent";
import { CoursePlayerHeader } from "../../_components/CoursePlayerHeader";
import { cn } from "@/lib/utils";

const PlayerSkeleton = () => (
  <div className="flex h-[calc(100vh-4rem)]">
    <div className="flex-1 p-6 lg:p-8">
      <Skeleton className="h-full w-full" />
    </div>
    <div className="w-80 border-l p-4 space-y-4 hidden lg:block">
      <Skeleton className="h-full w-full" />
    </div>
  </div>
);

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.courseId);
  const lessonId = Number(params.lessonId);

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const data = await learningService.getMyCourseContent(courseId);
        setEnrollment(data);
      } catch (error) {
        toast.error("Bạn không có quyền truy cập khóa học này.");
        router.replace("/student/my-courses");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [courseId, router]);

  const { currentLesson, totalLessons, completedLessons } = useMemo(() => {
    if (!enrollment?.course?.sections) {
      return { currentLesson: null, totalLessons: 0, completedLessons: 0 };
    }
    let foundLesson: Lesson | null = null;
    const allLessons: Lesson[] = [];
    for (const section of enrollment.course.sections) {
      if (section.lessons) {
        allLessons.push(...section.lessons);
        if (!foundLesson) {
          const lesson = section.lessons.find((l) => l.lesson_id === lessonId);
          if (lesson) foundLesson = lesson;
        }
      }
    }
    const completedCount = enrollment.lessonProgress.filter(
      (p) => p.status === "completed"
    ).length;

    return {
      currentLesson: foundLesson,
      totalLessons: allLessons.length,
      completedLessons: completedCount,
    };
  }, [enrollment, lessonId]);

  const handleMarkComplete = async (completedLessonId: number) => {
    const alreadyCompleted = enrollment?.lessonProgress.some(
      (p) => p.lesson_id === completedLessonId && p.status === "completed"
    );
    if (alreadyCompleted) return;

    try {
      await learningService.recordProgress(completedLessonId, "completed");
      toast.success("Đã cập nhật tiến độ!");

      setEnrollment((prev) => {
        if (!prev) return null;
        const newProgress = [...prev.lessonProgress];
        const progressIndex = newProgress.findIndex(
          (p) => p.lesson_id === completedLessonId
        );
        if (progressIndex > -1) {
          newProgress[progressIndex].status = "completed";
        } else {
          newProgress.push({
            progress_id: Date.now(),
            enrollment_id: prev.enrollment_id,
            lesson_id: completedLessonId,
            status: "completed",
            video_progress: 100,
          } as LessonProgress);
        }
        return { ...prev, lessonProgress: newProgress };
      });

      const allLessons =
        enrollment?.course.sections?.flatMap((s) => s.lessons || []) || [];
      const currentIndex = allLessons.findIndex(
        (l) => l.lesson_id === completedLessonId
      );
      if (currentIndex > -1 && currentIndex < allLessons.length - 1) {
        const nextLesson = allLessons[currentIndex + 1];
        toast.info(`Chuyển đến bài học: ${nextLesson.title}`);
        router.push(
          `/learn/courses/${courseId}/lessons/${nextLesson.lesson_id}`
        );
      } else {
        toast.success("Chúc mừng bạn đã hoàn thành khóa học!");
      }
    } catch (error) {
      toast.error("Không thể cập nhật tiến độ.");
    }
  };

  const handleDownloadCertificate = async () => {
    if (!courseId) return;
    try {
      const blob = await learningService.downloadCertificate(courseId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate-${enrollment?.course?.title || "Course"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Không thể tải chứng chỉ. Vui lòng thử lại sau.");
    }
  };

  if (isLoading) return <PlayerSkeleton />;

  if (!enrollment || !enrollment.course || !currentLesson) {
    return (
      <div className="flex-1 text-center py-20">
        Không tìm thấy nội dung bài học.
      </div>
    );
  }

  const isCompleted = enrollment.lessonProgress.some(
    (p) => p.lesson_id === lessonId && p.status === "completed"
  );

  return (
    <div className="flex flex-col h-full w-full">
      <CoursePlayerHeader
        courseTitle={enrollment.course.title}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isCompleted={enrollment.status === "completed"}
        onDownloadCertificate={handleDownloadCertificate}
      />
      <div className="flex flex-1 overflow-hidden">
        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            isSidebarOpen ? "lg:mr-[350px]" : "mr-0"
          )}
        >
          <LessonContent
            lesson={currentLesson}
            courseId={courseId}
            onMarkComplete={handleMarkComplete}
            isCompleted={isCompleted}
          />
        </main>
        <div
          className={cn(
            "fixed top-16 right-0 h-[calc(100vh-4rem)] w-[350px] bg-white border-l transition-transform duration-300 ease-in-out z-40",
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <CourseSidebar
            courseId={courseId}
            courseTitle={enrollment.course.title}
            sections={enrollment.course.sections || []}
            lessonProgress={enrollment.lessonProgress || []}
            currentLessonId={lessonId}
          />
        </div>
      </div>
    </div>
  );
}
