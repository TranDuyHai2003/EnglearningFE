"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { courseService } from "@/lib/api/courseService";
import { Course, Section, Lesson } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionFormDialog } from "./_components/SectionForm";
import { LessonFormDialog } from "./_components/LessonFormDialog";
import { QuizEditorDialog } from "./_components/QuizEditorDialog";
import { OverviewTab } from "./_components/OverviewTab";
import { CurriculumTab } from "./_components/CurriculumTab";
import { StudentsTab } from "./_components/StudentsTab";
import { ReviewsTab } from "./_components/ReviewsTab";
import { SettingsTab } from "./_components/SettingsTab";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CourseManageSkeleton = () => (
  <div className="container mx-auto py-8">
    <Skeleton className="h-9 w-3/4 mb-4" />
    <Skeleton className="h-5 w-1/2 mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

export default function ManageCoursePage() {
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);

  const [quizEditorState, setQuizEditorState] = useState<{
    isOpen: boolean;
    lessonId: number | null;
  }>({ isOpen: false, lessonId: null });

  const fetchCourseDetails = useCallback(async () => {
    if (!courseId) return;
    try {
      const courseData = await courseService.getCourse(courseId);
      setCourse(courseData);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải chi tiết khóa học."
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    setIsLoading(true);
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleSubmitForReview = async () => {
    if (
      !course ||
      !confirm("Bạn có chắc muốn gửi khóa học này để xét duyệt không?")
    )
      return;

    setIsSubmitting(true);
    try {
      const updatedCourse = await courseService.changeCourseStatus(
        course.course_id,
        {
          status: "pending",
          approval_status: "pending",
        }
      );
      setCourse(updatedCourse);
      toast.success("Đã gửi yêu cầu xét duyệt thành công!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gửi yêu cầu thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenSectionForm = (section: Section | null = null) => {
    setEditingSection(section);
    setIsSectionFormOpen(true);
  };
  const handleDeleteSection = async (sectionId: number) => {
    if (
      !confirm(
        "Bạn có chắc muốn xóa chương này? Tất cả bài học bên trong cũng sẽ bị xóa."
      )
    )
      return;
    try {
      await courseService.deleteSection(courseId, sectionId);
      toast.success("Đã xóa chương học.");
      fetchCourseDetails();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Xóa thất bại.");
    }
  };

  const handleOpenLessonForm = (
    sectionId: number,
    lesson: Lesson | null = null
  ) => {
    setCurrentSectionId(sectionId);
    setEditingLesson(lesson);
    setIsLessonFormOpen(true);
  };
  const handleDeleteLesson = async (sectionId: number, lessonId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài học này?")) return;
    try {
      await courseService.deleteLesson(sectionId, lessonId);
      toast.success("Đã xóa bài học.");
      fetchCourseDetails();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Xóa thất bại.");
    }
  };

  const handleReorderSections = async (newSections: Section[]) => {
    // Optimistic update
    if (course) {
      setCourse({ ...course, sections: newSections });
    }

    try {
      const reorderPayload = newSections.map((section, index) => ({
        section_id: section.section_id,
        display_order: index + 1,
      }));
      await courseService.reorderSections(courseId, reorderPayload);
      // Optional: No toast to keep it smooth, or use a subtle one
    } catch (error) {
       toast.error("Cập nhật thứ tự thất bại.");
       fetchCourseDetails(); // Revert
    }
  };

  if (isLoading) return <CourseManageSkeleton />;
  if (!course)
    return (
      <div className="text-center py-20">
        <h1>Không tìm thấy khóa học</h1>
      </div>
    );

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link
            href="/instructor/my-courses"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground mt-1">
                Quản lý nội dung và cài đặt khóa học
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSubmitForReview}
                disabled={
                  isSubmitting ||
                  course.status === "pending" ||
                  course.status === "published"
                }
              >
                {course.status === "published"
                  ? "Đã xuất bản"
                  : course.status === "pending"
                  ? "Đang chờ duyệt"
                  : "Gửi xét duyệt"}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="curriculum" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="curriculum">Chương trình học</TabsTrigger>
            <TabsTrigger value="students">Học viên</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab course={course} />
          </TabsContent>

          <TabsContent value="curriculum">
            <CurriculumTab
              course={course}
              onOpenSectionForm={handleOpenSectionForm}
              onDeleteSection={handleDeleteSection}
              onOpenLessonForm={handleOpenLessonForm}
              onDeleteLesson={handleDeleteLesson}
              onReorderSections={handleReorderSections}
            />
          </TabsContent>

          <TabsContent value="students">
            <StudentsTab courseId={courseId} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsTab courseId={courseId} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab course={course} onUpdate={fetchCourseDetails} />
          </TabsContent>
        </Tabs>
      </div>

      {isSectionFormOpen && (
        <SectionFormDialog
          courseId={courseId}
          section={editingSection}
          isOpen={isSectionFormOpen}
          onClose={() => setIsSectionFormOpen(false)}
          onSuccess={fetchCourseDetails}
        />
      )}
      {isLessonFormOpen && currentSectionId && (
        <LessonFormDialog
          sectionId={currentSectionId}
          lesson={editingLesson}
          isOpen={isLessonFormOpen}
          onClose={() => setIsLessonFormOpen(false)}
          onSuccess={fetchCourseDetails}
          onOpenQuizEditor={(lessonId) => {
            setQuizEditorState({ isOpen: true, lessonId });
            setIsLessonFormOpen(false);
          }}
        />
      )}

      {quizEditorState.isOpen && quizEditorState.lessonId && (
        <QuizEditorDialog
          lessonId={quizEditorState.lessonId}
          isOpen={quizEditorState.isOpen}
          onClose={() => setQuizEditorState({ isOpen: false, lessonId: null })}
        />
      )}
    </>
  );
}
