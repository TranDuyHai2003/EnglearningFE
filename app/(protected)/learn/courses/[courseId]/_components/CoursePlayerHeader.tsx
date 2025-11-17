// app/(student)/learn/courses/_components/CoursePlayerHeader.tsx
"use client";

import { ArrowLeft, PanelRightOpen, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface Props {
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  onToggleSidebar: () => void;
}

export const CoursePlayerHeader = ({
  courseTitle,
  completedLessons,
  totalLessons,
  onToggleSidebar,
}: Props) => {
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <Link href="/student/my-courses">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Button>
        </Link>
        <h1 className="text-lg font-semibold hidden md:block">{courseTitle}</h1>
      </div>
      <div className="flex items-center gap-4 w-full max-w-xs">
        <div className="w-full">
          <Progress value={progressPercentage} className="w-full h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            Hoàn thành {completedLessons}/{totalLessons} bài
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Nút này sẽ hiện ở màn hình lớn để đóng/mở sidebar */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSidebar}
          className="h-8 w-8"
        >
          <PanelRightOpen className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
    </header>
  );
};
