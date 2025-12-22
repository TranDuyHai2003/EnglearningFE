import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course, Section, Lesson } from "@/lib/types";
import {
  GripVertical,
  PlusCircle,
  Pencil,
  Trash2,
  PlayCircle,
} from "lucide-react";
import { LessonVocabularyDialog } from "./LessonVocabularyDialog";

interface CurriculumTabProps {
  course: Course;
  onOpenSectionForm: (section?: Section | null) => void;
  onDeleteSection: (sectionId: number) => void;
  onOpenLessonForm: (sectionId: number, lesson?: Lesson | null) => void;
  onDeleteLesson: (sectionId: number, lessonId: number) => void;
  onReorderSections: (newSections: Section[]) => void;
}

interface SortableSectionProps {
  section: Section;
  onOpenSectionForm: (section: Section) => void;
  onDeleteSection: (sectionId: number) => void;
  onOpenLessonForm: (sectionId: number, lesson?: Lesson | null) => void;
  onDeleteLesson: (sectionId: number, lessonId: number) => void;
  onOpenVocabulary: (lesson: Lesson) => void;
}

function SortableSection({
  section,
  onOpenSectionForm,
  onDeleteSection,
  onOpenLessonForm,
  onDeleteLesson,
  onOpenVocabulary,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.section_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-md bg-slate-50 mb-4"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-move">
            <GripVertical className="text-muted-foreground" />
          </div>
          {section.title}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenSectionForm(section)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteSection(section.section_id)}
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
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenLessonForm(section.section_id, lesson)}
                >
                  Sửa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenVocabulary(lesson)}
                >
                  Flashcards
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() =>
                    onDeleteLesson(section.section_id, lesson.lesson_id)
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
          onClick={() => onOpenLessonForm(section.section_id)}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm bài học
        </Button>
      </div>
    </div>
  );
}

export function CurriculumTab({
  course,
  onOpenSectionForm,
  onDeleteSection,
  onOpenLessonForm,
  onDeleteLesson,
  onReorderSections,
}: CurriculumTabProps) {
  const [lessonForVocab, setLessonForVocab] = useState<Lesson | null>(null);
  const openVocabulary = (lesson: Lesson) => setLessonForVocab(lesson);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (course.sections) {
        const oldIndex = course.sections.findIndex(
          (s) => s.section_id === active.id
        );
        const newIndex = course.sections.findIndex(
          (s) => s.section_id === over.id
        );

        const newSections = arrayMove(course.sections, oldIndex, newIndex);
        onReorderSections(newSections);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Chương trình giảng dạy</CardTitle>
          <Button variant="outline" onClick={() => onOpenSectionForm()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm chương
          </Button>
      </CardHeader>
      <CardContent>
        {course.sections && course.sections.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={course.sections.map((s) => s.section_id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {course.sections.map((section) => (
                  <SortableSection
                    key={section.section_id}
                    section={section}
                    onOpenSectionForm={onOpenSectionForm}
                    onDeleteSection={onDeleteSection}
                    onOpenLessonForm={onOpenLessonForm}
                    onDeleteLesson={onDeleteLesson}
                    onOpenVocabulary={openVocabulary}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Khóa học này chưa có nội dung. Hãy bắt đầu bằng cách thêm chương
            mới.
          </p>
        )}
      </CardContent>
      </Card>
      <LessonVocabularyDialog
        lesson={lessonForVocab}
        open={Boolean(lessonForVocab)}
        onClose={() => setLessonForVocab(null)}
      />
    </>
  );
}
