// app/(student)/learn/courses/_components/LessonContent.tsx
"use client";

// Đảm bảo bạn đã import các type này
import { Lesson, LessonResource } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Download,
  FileText,
  Info,
  MessageSquare,
  Notebook,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// THÊM ĐỊNH NGHĨA NÀY VÀO
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
  const getEmbedUrl = (url: string) => {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = new URL(url).searchParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      videoId = new URL(url).pathname.slice(1);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  const embedUrl = lesson.video_url ? getEmbedUrl(lesson.video_url) : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {lesson.lesson_type === "video" && embedUrl && (
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6">
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {lesson.title}
          </h1>
          <Button
            size="lg"
            onClick={() => onMarkComplete(lesson.lesson_id)}
            disabled={isCompleted}
            className="shrink-0"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            {isCompleted ? "Đã hoàn thành" : "Đánh dấu đã hoàn thành"}
          </Button>
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
              <div className="text-center p-8 border-2 border-dashed rounded-lg bg-blue-50">
                <p className="text-xl font-semibold">
                  Bài kiểm tra: {lesson.title}
                </p>
                <Button className="mt-6" size="lg">
                  Bắt đầu làm bài
                </Button>
              </div>
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
