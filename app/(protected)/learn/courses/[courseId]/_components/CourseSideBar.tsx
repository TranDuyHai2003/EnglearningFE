// app/(student)/learn/courses/_components/CourseSideBar.tsx
"use client";

import Link from "next/link";
// Đảm bảo bạn đã import các type này
import { Section, LessonProgress } from "@/lib/types";
import { CheckCircle, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMemo } from "react";

// THÊM ĐỊNH NGHĨA NÀY VÀO
interface Props {
  courseId: number;
  courseTitle: string;
  sections: Section[];
  lessonProgress: LessonProgress[];
  currentLessonId: number;
}

export const CourseSidebar = ({
  courseId,
  courseTitle,
  sections,
  lessonProgress,
  currentLessonId,
}: Props) => {
  const progressMap = new Map(
    lessonProgress.map((p) => [p.lesson_id, p.status])
  );

  const activeSectionValue = useMemo(() => {
    const activeSection = sections.find((section) =>
      section.lessons?.some((lesson) => lesson.lesson_id === currentLessonId)
    );
    return activeSection ? `section-${activeSection.section_id}` : undefined;
  }, [sections, currentLessonId]);

  return (
    <aside className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold line-clamp-2">Nội dung khóa học</h2>
        <p className="text-sm text-muted-foreground">{courseTitle}</p>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue={activeSectionValue}
        >
          {sections.map((section, sectionIndex) => (
            <AccordionItem
              value={`section-${section.section_id}`}
              key={section.section_id}
            >
              <AccordionTrigger className="px-4 py-3 text-left hover:no-underline hover:bg-slate-50">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">
                    Phần {sectionIndex + 1}: {section.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <ul className="space-y-0">
                  {section.lessons?.map((lesson) => {
                    const isCompleted =
                      progressMap.get(lesson.lesson_id) === "completed";
                    const isActive = lesson.lesson_id === currentLessonId;

                    return (
                      <li key={lesson.lesson_id}>
                        <Link
                          href={`/learn/courses/${courseId}/lessons/${lesson.lesson_id}`}
                          className={cn(
                            "flex items-start gap-3 p-4 text-sm transition-colors border-b border-b-slate-100",
                            isActive
                              ? "bg-blue-50 text-primary font-medium"
                              : "text-gray-700 hover:bg-slate-50"
                          )}
                        >
                          {isActive ? (
                            <PlayCircle className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                          ) : isCompleted ? (
                            <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 mt-0.5 text-gray-300 flex-shrink-0" />
                          )}
                          <span className="flex-1">{lesson.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </nav>
    </aside>
  );
};
