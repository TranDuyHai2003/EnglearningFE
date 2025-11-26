"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { courseService } from "@/lib/api/courseService";
import { Course, Section, Lesson } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GripVertical,
  PlusCircle,
  Pencil,
  Trash2,
  PlayCircle,
} from "lucide-react";
import { SectionFormDialog } from "./_components/SectionForm";
import { LessonFormDialog } from "./_components/LessonFormDialog";
import { QuizEditorDialog } from "./_components/QuizEditorDialog";

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

  // State cho dialog Section
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State cho dialog Lesson
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
  
  // State cho Quiz Editor
  const [quizEditorState, setQuizEditorState] = useState<{
    isOpen: boolean;
    lessonId: number | null;
  }>({ isOpen: false, lessonId: null });

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
      setCourse(updatedCourse); // Cập nhật lại state của course trên UI
      toast.success("Đã gửi yêu cầu xét duyệt thành công!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gửi yêu cầu thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
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

  // === SECTION HANDLERS ===
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

  // === LESSON HANDLERS ===
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
        <header className="mb-8">
          <p className="text-sm text-muted-foreground">Quản lý khóa học</p>
          <h1 className="text-4xl font-bold">{course.title}</h1>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Chương trình giảng dạy</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => handleOpenSectionForm()}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Thêm chương
                </Button>
              </CardHeader>
              <CardContent>
                {course.sections && course.sections.length > 0 ? (
                  <div className="space-y-4">
                    {course.sections.map((section) => (
                      <div
                        key={section.section_id}
                        className="p-4 border rounded-md bg-slate-50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold flex items-center gap-2">
                            <GripVertical className="cursor-move text-muted-foreground" />
                            {section.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenSectionForm(section)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteSection(section.section_id)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="pl-6 space-y-2 border-l-2 ml-2 pt-2">
                          {section.lessons && section.lessons.length > 0 ? (
                            section.lessons.map((lesson) => (
                              <div
                                key={lesson.lesson_id}
                                className="flex justify-between items-center p-2 rounded-md hover:bg-slate-100 group"
                              >
                                <p className="text-sm flex items-center gap-2">
                                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                  {lesson.title}
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      lesson.approval_status === "approved"
                                        ? "bg-green-100 text-green-700"
                                        : lesson.approval_status === "rejected"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {lesson.approval_status === "approved"
                                      ? "Đã duyệt"
                                      : lesson.approval_status === "rejected"
                                      ? "Từ chối"
                                      : "Chờ duyệt"}
                                  </span>
                                </p>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleOpenLessonForm(
                                        section.section_id,
                                        lesson
                                      )
                                    }
                                  >
                                    Sửa
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() =>
                                      handleDeleteLesson(
                                        section.section_id,
                                        lesson.lesson_id
                                      )
                                    }
                                  >
                                    Xóa
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground italic p-2">
                              Chưa có bài học
                            </p>
                          )}
                          <Button
                            variant="link"
                            size="sm"
                            className="w-full justify-start h-8"
                            onClick={() =>
                              handleOpenLessonForm(section.section_id)
                            }
                          >
                            <PlusCircle className="mr-2 h-4 w-4" /> Thêm bài học
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Khóa học này chưa có nội dung. Hãy bắt đầu bằng cách thêm
                    chương mới.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          <aside className="space-y-6 self-start sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin khóa học</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Chỉnh sửa thông tin</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Hành động</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSubmitForReview}
                  disabled={
                    isSubmitting ||
                    course.status === "pending" ||
                    course.status === "published"
                  }
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu xét duyệt"}
                </Button>
                <Button variant="destructive" className="w-full">
                  Xóa khóa học
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
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
             setIsLessonFormOpen(false); // Close lesson form when opening quiz editor
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
