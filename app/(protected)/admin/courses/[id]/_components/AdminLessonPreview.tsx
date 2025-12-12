"use client";

import { useState } from "react";
import { Lesson } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, PlayCircle, FileText, HelpCircle, AlertCircle } from "lucide-react";
import { adminService } from "@/lib/api/adminService";
import { toast } from "sonner";
import { ReviewDialog } from "../../../approvals/_components/ReviewDialog";
import { useLessonVideoUrl } from "@/lib/hooks/useLessonVideoUrl";

interface AdminLessonPreviewProps {
  lesson: Lesson;
  onUpdate: () => void;
}

export function AdminLessonPreview({ lesson, onUpdate }: AdminLessonPreviewProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { url: playbackUrl, isLoading, error, refresh } = useLessonVideoUrl(lesson);

  const handleApprove = async () => {
    try {
      await adminService.approveLesson(lesson.lesson_id);
      toast.success("Đã duyệt bài học");
      onUpdate();
    } catch (error) {
      toast.error("Lỗi khi duyệt bài học");
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await adminService.rejectLesson(lesson.lesson_id, reason);
      toast.success("Đã từ chối bài học");
      onUpdate();
    } catch (error) {
      toast.error("Lỗi khi từ chối bài học");
    }
  };

  const getVideoId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {lesson.lesson_type === "video" && <PlayCircle className="text-blue-500" />}
            {lesson.lesson_type === "document" && <FileText className="text-orange-500" />}
            {lesson.lesson_type === "quiz" && <HelpCircle className="text-purple-500" />}
            {lesson.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant={
                lesson.approval_status === "approved"
                  ? "default"
                  : lesson.approval_status === "rejected"
                  ? "destructive"
                  : "secondary"
              }
            >
              {lesson.approval_status === "approved"
                ? "Đã duyệt"
                : lesson.approval_status === "rejected"
                ? "Đã từ chối"
                : "Chờ duyệt"}
            </Badge>
            {lesson.rejection_reason && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Lý do: {lesson.rejection_reason}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {lesson.approval_status !== "approved" && (
            <Button variant="default" onClick={() => handleApprove()} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" /> Duyệt bài này
            </Button>
          )}
          {lesson.approval_status !== "rejected" && (
            <Button variant="destructive" onClick={() => setIsReviewOpen(true)}>
              <XCircle className="mr-2 h-4 w-4" /> Từ chối
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto">
        {lesson.lesson_type === "video" && (
          <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            {lesson.video_key ? (
              playbackUrl ? (
                <video controls className="w-full h-full bg-black" src={playbackUrl}>
                  Trình duyệt không hỗ trợ video.
                </video>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white gap-2 text-sm px-4 text-center">
                  {error ? (
                    <>
                      <p>{error}</p>
                      <Button size="sm" variant="secondary" onClick={refresh}>
                        Thử tải lại video
                      </Button>
                    </>
                  ) : (
                    <p>{isLoading ? "Đang tạo liên kết phát..." : "Không thể phát video"}</p>
                  )}
                </div>
              )
            ) : lesson.video_url ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${getVideoId(lesson.video_url)}`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white text-sm">
                Chưa có video cho bài học này.
              </div>
            )}
          </div>
        )}

        {lesson.lesson_type === "document" && lesson.content && (
          <Card>
            <CardContent className="p-6 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </CardContent>
          </Card>
        )}

        {lesson.lesson_type === "quiz" && lesson.quiz && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin bài kiểm tra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Tiêu đề:</span>
                    <span className="font-medium">{lesson.quiz.title}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Điểm đạt:</span>
                    <span className="font-medium">{lesson.quiz.passing_score}%</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium">
                      {lesson.quiz.time_limit ? `${lesson.quiz.time_limit} phút` : "Không giới hạn"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Số lần làm lại:</span>
                    <span className="font-medium">
                      {lesson.quiz.max_attempts === 0 ? "Vô hạn" : lesson.quiz.max_attempts}
                    </span>
                  </div>
                </div>
                {lesson.quiz.description && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm">Mô tả:</h4>
                    <p className="text-sm text-muted-foreground">{lesson.quiz.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Danh sách câu hỏi ({lesson.quiz.questions?.length || 0})</h3>
              {lesson.quiz.questions?.map((question, index) => (
                <Card key={question.question_id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          Câu hỏi {index + 1} ({question.points} điểm)
                        </span>
                        <p className="font-medium">{question.question_text}</p>
                      </div>
                      <Badge variant="outline">{question.question_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mt-2">
                      {question.options?.map((option) => (
                        <div
                          key={option.option_id}
                          className={`p-3 rounded-md border flex items-center justify-between ${
                            option.is_correct
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <span className="text-sm">{option.option_text}</span>
                          {option.is_correct && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                        <span className="font-semibold">Giải thích: </span>
                        {question.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {lesson.lesson_type === "quiz" && !lesson.quiz && (
             <Card>
                 <CardContent className="p-6 text-center text-muted-foreground">
                     Chưa có nội dung bài kiểm tra
                 </CardContent>
             </Card>
        )}

        <div className="mt-6">
            <h3 className="font-semibold mb-2">Mô tả bài học</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{lesson.description || "Không có mô tả."}</p>
        </div>
      </div>

      <ReviewDialog
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        title={`Từ chối bài học: ${lesson.title}`}
        hideApprove={true}
      />
    </div>
  );
}
