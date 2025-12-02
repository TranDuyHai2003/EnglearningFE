"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { learningService } from "@/lib/api/learningService";
import { toast } from "sonner";

export default function CourseLearnRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.courseId);

  useEffect(() => {
    if (!courseId) return;

    const findFirstLesson = async () => {
      try {
        const enrollment = await learningService.getMyCourseContent(courseId);
        const allLessons =
          enrollment.course.sections?.flatMap((s) => s.lessons || []) || [];

        if (allLessons.length === 0) {
          toast.error("Khóa học này chưa có nội dung.");
          router.replace("/student/my-courses");
          return;
        }

        const completedLessonIds = new Set(
          enrollment.lessonProgress
            .filter((p) => p.status === "completed")
            .map((p) => p.lesson_id)
        );
        const firstUncompletedLesson = allLessons.find(
          (l) => !completedLessonIds.has(l.lesson_id)
        );

        const targetLesson = firstUncompletedLesson || allLessons[0];

        router.replace(
          `/learn/courses/${courseId}/lessons/${targetLesson.lesson_id}`
        );
      } catch (error) {
        console.error("Failed to find first lesson:", error);

        router.replace("/student/my-courses");
        toast.error("Lỗi khi tìm bài học để bắt đầu.");
        router.replace("/student/my-courses");
      }
    };

    findFirstLesson();
  }, [courseId, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Đang tải khóa học...</p>
    </div>
  );
}
