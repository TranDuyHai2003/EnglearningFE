// app/(protected)/learn/courses/[courseId]/_components/LessonContent.tsx
"use client";

import dynamic from "next/dynamic"; // <-- THÊM DÒNG NÀY
import { Lesson, LessonResource } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Download,
  Info,
  MessageSquare,
  Notebook,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { useThrottle } from "use-throttle";
import { learningService } from "@/lib/api/learningService";
import { QuizView } from "./QuizView";

const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-slate-800 flex items-center justify-center text-white">
      Đang tải video...
    </div>
  ),
});

interface Props {
  lesson: Lesson;
  onMarkComplete: (lessonId: number) => void;
  isCompleted: boolean;
}

const ResourceItem = ({ resource }: { resource: LessonResource }) => (
  <a
    href={resource.file_url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 p-3 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
  >
    <Download className="h-5 w-5 text-primary" />
    <div className="flex-1">
      <p className="font-medium text-sm">{resource.title}</p>
      {resource.file_size && (
        <p className="text-xs text-muted-foreground">
          ({(resource.file_size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>
  </a>
);

export const LessonContent = ({
  lesson,
  onMarkComplete,
  isCompleted,
}: Props) => {
  const throttledRecordProgress = useThrottle(
    (progress: { playedSeconds: number }) => {
      if (!isCompleted && lesson.video_duration) {
        const percentage =
          (progress.playedSeconds / lesson.video_duration) * 100;
        learningService.recordProgress(
          lesson.lesson_id,
          "in_progress",
          Math.round(percentage)
        );
      }
    },
    5000 // Ghi nhận tiến độ mỗi 5 giây
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {lesson.lesson_type === "video" && lesson.video_url && (
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6">
          <ReactPlayer
            url={lesson.video_url}
            width="100%"
            height="100%"
            controls
            playing
            onProgress={throttledRecordProgress}
            onEnded={() => onMarkComplete(lesson.lesson_id)}
          />
        </div>
      )}

      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {lesson.title}
          </h1>
          {lesson.lesson_type !== "video" && (
            <Button
              size="lg"
              onClick={() => onMarkComplete(lesson.lesson_id)}
              disabled={isCompleted}
              className="shrink-0"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              {isCompleted ? "Đã hoàn thành" : "Đánh dấu đã hoàn thành"}
            </Button>
          )}
        </div>
      </header>

      <Separator className="mb-6" />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="overview">
            <Info className="w-4 h-4 mr-2" />
            Mô tả
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Download className="w-4 h-4 mr-2" />
            Tài liệu
          </TabsTrigger>
          <TabsTrigger value="qna">
            <MessageSquare className="w-4 h-4 mr-2" />
            Hỏi & Đáp
          </TabsTrigger>
          <TabsTrigger value="notes">
            <Notebook className="w-4 h-4 mr-2" />
            Ghi chú
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="prose max-w-none p-6 border rounded-lg bg-white">
            {lesson.description && <p className="lead">{lesson.description}</p>}
            {lesson.lesson_type === "document" && lesson.content && (
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            )}
            {lesson.lesson_type === "quiz" && (
              <QuizView
                lessonId={lesson.lesson_id}
                onQuizPassed={() => onMarkComplete(lesson.lesson_id)}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="resources">
          <div className="p-6 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold mb-4">Tài liệu bài học</h3>
            {lesson.resources && lesson.resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.resources.map((res) => (
                  <ResourceItem key={res.resource_id} resource={res} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Không có tài liệu nào cho bài học này.
              </p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="qna">
          <div className="p-6 border rounded-lg bg-white text-center">
            <h3 className="text-lg font-semibold mb-2">Hỏi & Đáp</h3>
            <p className="text-muted-foreground">
              Tính năng này đang được phát triển.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="notes">
          <div className="p-6 border rounded-lg bg-white text-center">
            <h3 className="text-lg font-semibold mb-2">Ghi chú cá nhân</h3>
            <p className="text-muted-foreground">
              Tính năng này đang được phát triển.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
