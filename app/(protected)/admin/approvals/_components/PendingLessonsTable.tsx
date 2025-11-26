import { useState, useEffect } from "react";
import { Lesson } from "@/lib/types";
import { adminService } from "@/lib/api/adminService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Video, FileText, HelpCircle } from "lucide-react";
import { ReviewDialog } from "./ReviewDialog";
import { toast } from "sonner";

export function PendingLessonsTable() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getPendingLessons();
      setLessons(res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách bài học");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleApprove = async () => {
    if (!selectedLesson) return;
    try {
      await adminService.approveLesson(selectedLesson.lesson_id);
      toast.success("Đã phê duyệt bài học");
      fetchLessons();
    } catch (error) {
      toast.error("Phê duyệt thất bại");
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedLesson) return;
    try {
      await adminService.rejectLesson(selectedLesson.lesson_id, reason);
      toast.success("Đã từ chối bài học");
      fetchLessons();
    } catch (error) {
      toast.error("Từ chối thất bại");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
        case "video": return <Video className="h-4 w-4" />;
        case "document": return <FileText className="h-4 w-4" />;
        case "quiz": return <HelpCircle className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) return <div>Đang tải...</div>;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bài học</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Khóa học</TableHead>
            <TableHead>Giảng viên</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Không có bài học nào đang chờ duyệt
              </TableCell>
            </TableRow>
          ) : (
            lessons.map((lesson: any) => (
              <TableRow key={lesson.lesson_id}>
                <TableCell className="font-medium">{lesson.title}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2 capitalize">
                        {getIcon(lesson.lesson_type)}
                        {lesson.lesson_type}
                    </div>
                </TableCell>
                <TableCell>{lesson.section?.course?.title}</TableCell>
                <TableCell>{lesson.section?.course?.instructor?.full_name}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => setSelectedLesson(lesson)}>
                    <Eye className="mr-2 h-4 w-4" /> Xem & Duyệt
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedLesson && (
        <ReviewDialog
          isOpen={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          title={`Duyệt bài học: ${selectedLesson.title}`}
        >
          <div className="space-y-4">
            {selectedLesson.lesson_type === "video" && selectedLesson.video_url && (
                <div className="aspect-video bg-black rounded overflow-hidden">
                    <iframe 
                        src={`https://www.youtube.com/embed/${selectedLesson.video_url.split("v=")[1]?.split("&")[0]}`} 
                        className="w-full h-full" 
                        allowFullScreen 
                    />
                </div>
            )}
            {selectedLesson.lesson_type === "document" && (
                <div className="p-4 bg-slate-50 rounded border max-h-60 overflow-y-auto" dangerouslySetInnerHTML={{ __html: selectedLesson.content || "" }} />
            )}
             {selectedLesson.lesson_type === "quiz" && (
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded border">
                        <h4 className="font-semibold mb-2 text-sm">Thông tin bài kiểm tra</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Tiêu đề:</span>{" "}
                                <span className="font-medium">{selectedLesson.quiz?.title}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Điểm đạt:</span>{" "}
                                <span className="font-medium">{selectedLesson.quiz?.passing_score}%</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Thời gian:</span>{" "}
                                <span className="font-medium">
                                    {selectedLesson.quiz?.time_limit ? `${selectedLesson.quiz.time_limit} phút` : "Không giới hạn"}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Số câu hỏi:</span>{" "}
                                <span className="font-medium">{selectedLesson.quiz?.questions?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                    
                    {selectedLesson.quiz?.questions && selectedLesson.quiz.questions.length > 0 && (
                        <div className="space-y-2">
                             <h4 className="font-semibold text-sm">Danh sách câu hỏi</h4>
                             <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                {selectedLesson.quiz.questions.map((q, idx) => (
                                    <div key={q.question_id} className="p-3 border rounded text-sm bg-white">
                                        <div className="font-medium mb-1">Câu {idx + 1}: {q.question_text}</div>
                                        <div className="pl-4 text-xs text-muted-foreground space-y-1">
                                            {q.options?.map(opt => (
                                                <div key={opt.option_id} className={opt.is_correct ? "text-green-600 font-medium" : ""}>
                                                    - {opt.option_text} {opt.is_correct && "(Đúng)"}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            )}
            <div>
                <h4 className="font-semibold mb-1">Mô tả:</h4>
                <p className="text-sm text-muted-foreground">{selectedLesson.description || "Không có mô tả"}</p>
            </div>
          </div>
        </ReviewDialog>
      )}
    </div>
  );
}
