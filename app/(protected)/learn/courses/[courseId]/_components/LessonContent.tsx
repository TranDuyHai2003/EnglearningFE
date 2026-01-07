"use client";

import { Lesson, LessonResource } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Download,
  Info,
  MessageSquare,
  Notebook,
  Star,
  Brain,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { useState, useRef, useEffect } from "react";
import { learningService } from "@/lib/api/learningService";
import { QuizView } from "./QuizView";
import { QATab } from "./QATab";
import { ReviewTab } from "./ReviewTab";
import { FlashcardTab } from "./FlashcardTab";
import { useLessonVideoUrl } from "@/lib/hooks/useLessonVideoUrl";

interface Props {
  lesson: Lesson;
  courseId: number;
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

const DocumentViewer = ({ lessonId }: { lessonId: number }) => {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchUrl = async () => {
            setLoading(true);
            setError(false);
            try {
                const res = await learningService.getLessonDocumentUrl(lessonId);
                setUrl(res.data.url);
            } catch (error) {
                console.error("Failed to fetch doc url", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchUrl();
    }, [lessonId]);

    if (loading) return <div className="text-sm text-muted-foreground">Đang tải tài liệu...</div>;
    if (error) return <div className="text-sm text-red-500">Không thể tải tài liệu. Vui lòng thử lại sau.</div>;
    if (!url) return null;

    return (
        <div className="mt-2 text-sm flex flex-col gap-3">
             <Button variant="outline" className="w-fit" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" /> Tải về / Xem tài liệu
                </a>
            </Button>
            <iframe src={url} className="w-full h-[600px] border rounded bg-slate-50" title="Document Preview" />
        </div>
    );
};

// ... inside TabsContent value="resources" ...



export const LessonContent = ({
  lesson,
  courseId,
  onMarkComplete,
  isCompleted,
}: Props) => {
  const lastProgressUpdate = useRef<number>(0);
  const {
    url: playbackUrl,
    isLoading: isVideoLoading,
    error: videoError,
    refresh: refreshVideoUrl,
  } = useLessonVideoUrl(lesson);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const handleProgress = (progress: any) => {
    if (!progress || !progress.playedSeconds) return;
  };

  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  useEffect(() => {
    setPlayerError(null);
  }, [lesson.lesson_id]);

  const handleVideoError = () => {
    setPlayerError("Không thể phát video bài học. Vui lòng thử lại.");
  };

  const handleVideoLoaded = () => {
    setPlayerError(null);
  };

  const handleRefreshVideo = () => {
    setPlayerError(null);
    refreshVideoUrl();
  };

  const renderedError = playerError || videoError;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Video Section */}
      {(lesson.video_key || lesson.video_url) && (
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6">
          {lesson.video_key ? (
            playbackUrl ? (
              <video
                key={playbackUrl}
                controls
                className="w-full h-full bg-black"
                src={playbackUrl}
                onError={handleVideoError}
                onLoadedData={handleVideoLoaded}
              >
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white gap-2">
                {renderedError ? (
                  <>
                    <p className="text-center max-w-md text-sm">
                      {renderedError}
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleRefreshVideo}
                    >
                      Thử tải lại video
                    </Button>
                  </>
                ) : (
                  <p>
                    {isVideoLoading
                      ? "Đang tạo liên kết phát video..."
                      : "Không thể tải video"}
                  </p>
                )}
              </div>
            )
          ) : (
            (() => {
              const videoId = lesson.video_url
                ?.split("v=")[1]
                ?.split("&")[0];

              return videoId && hasWindow ? (
                <>
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  <div className="absolute bottom-2 right-2 z-10">
                    <a
                      href={`https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/50 hover:text-white bg-black/50 px-2 py-1 rounded"
                    >
                      Mở trong tab mới
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <p>
                    {lesson.video_url
                      ? "Đang tải video..."
                      : "Bài học này chưa có video."}
                  </p>
                </div>
              );
            })()
          )}
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="overview">
            <Info className="w-4 h-4 mr-2" />
            Mô tả
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Download className="w-4 h-4 mr-2" />
            Tài liệu
          </TabsTrigger>
          <TabsTrigger value="flashcards">
             <Brain className="w-4 h-4 mr-2" />
             Flashcards
          </TabsTrigger>
          <TabsTrigger value="qna">
            <MessageSquare className="w-4 h-4 mr-2" />
            Hỏi & Đáp
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="w-4 h-4 mr-2" />
            Đánh giá
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="prose max-w-none p-6 border rounded-lg bg-white space-y-6">
            


            {/* Quiz Section */}
            {lesson.quiz && (
              <div className="not-prose border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Bài tập trắc nghiệm
                  </h3>
                  <QuizView
                    lessonId={lesson.lesson_id}
                    quizId={lesson.quiz.quiz_id}
                    onQuizPassed={() => onMarkComplete(lesson.lesson_id)}
                  />
              </div>
            )}

            {lesson.description && <p className="lead border-t pt-4">{lesson.description}</p>}
            
            {lesson.content && (
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            )}
          </div>
        </TabsContent>
        <TabsContent value="resources">
          <div className="p-6 border rounded-lg bg-white space-y-6">
            <h3 className="text-lg font-semibold mb-4">Tài liệu bài học</h3>
            
            {/* Document Section */}
            {lesson.document_key && (
               <div className="p-4 bg-slate-50 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Notebook className="w-5 h-5 text-blue-600" />
                      Tài liệu đính kèm
                  </h4>
                   <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">Tài liệu chính cho bài học này.</p>
                       <DocumentViewer lessonId={lesson.lesson_id} />
                   </div>
               </div>
            )}

            {lesson.resources && lesson.resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.resources.map((res) => (
                  <ResourceItem key={res.resource_id} resource={res} />
                ))}
              </div>
            ) : !lesson.document_key && (
              <p className="text-muted-foreground">
                Không có tài liệu nào cho bài học này.
              </p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="flashcards">
           <FlashcardTab decks={lesson.flashcardDecks || []} />
        </TabsContent>
        <TabsContent value="qna">
          <div className="p-6 border rounded-lg bg-white">
            <QATab lessonId={lesson.lesson_id} />
          </div>
        </TabsContent>
        <TabsContent value="reviews">
          <div className="p-6 border rounded-lg bg-white">
            <ReviewTab courseId={courseId} />
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
