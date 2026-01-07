"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Lesson, LessonForm } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { courseService } from "@/lib/api/courseService";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { storageService } from "@/lib/api/storageService";
import { FileText, Video, HelpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LessonFormProps {
  sectionId: number;
  lesson?: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLesson: Lesson) => void;
}

export function LessonFormDialog({
  sectionId,
  lesson,
  isOpen,
  onClose,
  onSuccess,
  onOpenQuizEditor,
}: LessonFormProps & { onOpenQuizEditor: (lessonId: number) => void }) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    lesson || null
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  useEffect(() => {
    setActiveLesson(lesson || null);
  }, [lesson]);

  useEffect(() => {
    if (!isOpen) {
      setVideoFile(null);
      setDocumentFile(null);
      setIsSaving(false);
      setIsUploadingVideo(false);
    }
  }, [isOpen]);

  const form = useForm<LessonForm>({
    defaultValues: {
      title: lesson?.title || "",
      description: lesson?.description || "",
      lesson_type: "video", // Validate logic might need this, but we treat it as generic container
      video_url: lesson?.video_url || "",
      video_bucket: lesson?.video_bucket || "",
      video_key: lesson?.video_key || "",
      video_uploaded_at: lesson?.video_uploaded_at || "",
      content: lesson?.content || "",
      allow_preview: lesson?.allow_preview || false,
      display_order: lesson?.display_order || 0,
    },
  });

  // Update default values when lesson changes
  useEffect(() => {
      if (lesson) {
          form.reset({
              title: lesson.title,
              description: lesson.description || "",
              lesson_type: "video", // Always default to video/generic
              video_url: lesson.video_url || "",
              video_bucket: lesson.video_bucket || "",
              video_key: lesson.video_key || "",
              video_uploaded_at: lesson.video_uploaded_at || "",
              content: lesson.content || "",
              allow_preview: lesson.allow_preview || false,
              display_order: lesson.display_order || 0,
          });
      } else {
          form.reset({
              title: "",
              description: "",
              lesson_type: "video",
              video_url: "",
              allow_preview: false,
              display_order: 0,
          });
      }
  }, [lesson, form]);

  const onSubmit = async (data: LessonForm, shouldOpenQuizEditor = false) => {
    setIsSaving(true);
    try {
      let result: Lesson;
      // Force type to video as unified type
      const payload = {
        ...data,
        lesson_type: "video" as const, 
        video_duration: data.video_duration ? Number(data.video_duration) : 0,
      };

      const isEditingExisting = Boolean(activeLesson?.lesson_id);

      if (activeLesson) {
        result = await courseService.updateLesson(
          sectionId,
          activeLesson.lesson_id,
          payload
        );
      } else {
        result = await courseService.createLesson(sectionId, payload);
      }

      if (!result?.lesson_id) {
        throw new Error("Không nhận được ID bài học sau khi lưu.");
      }

      if (videoFile) {
        setIsUploadingVideo(true);
        try {
          const uploadResult = await storageService.uploadLessonVideo(
            result.lesson_id,
            videoFile
          );
          toast.success("Đã tải video bài giảng lên SeaweedFS!");
          result = {
            ...result,
            video_bucket: uploadResult.bucket,
            video_key: uploadResult.key,
            video_url: uploadResult.key,
            video_uploaded_at: uploadResult.uploaded_at,
          };
          setVideoFile(null);
        } finally {
          setIsUploadingVideo(false);
        }
      }

      if (documentFile) {
        setIsUploadingVideo(true);
        try {
          const uploadResult = await storageService.uploadLessonDocument(
            result.lesson_id,
            documentFile
          );
          toast.success("Đã tải tài liệu lên!");
          result = {
            ...result,
            document_bucket: uploadResult.bucket,
            document_key: uploadResult.key,
            document_url: uploadResult.key,
            document_uploaded_at: uploadResult.uploaded_at,
          };
          setDocumentFile(null);
        } finally {
          setIsUploadingVideo(false);
        }
      }

      toast.success(`Bài học đã được ${isEditingExisting ? "cập nhật" : "tạo"}!`);

      setActiveLesson(result);
      onSuccess(result);

      if (shouldOpenQuizEditor && result.lesson_id) {
        onOpenQuizEditor(result.lesson_id);
      } else {
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activeLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => onSubmit(data, false))}
            className="space-y-6"
          >
            <FormField
              name="title"
              control={form.control}
              rules={{ required: "Tiêu đề là bắt buộc" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề bài học</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Bài 1 - Bảng chữ cái"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs defaultValue="video" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="video" className="flex items-center gap-2">
                         <Video className="w-4 h-4" /> Video bài giảng
                    </TabsTrigger>
                    <TabsTrigger value="document" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Tài liệu đính kèm
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" /> Bài tập Quiz
                    </TabsTrigger>
                </TabsList>
                
                {/* VIDEO TAB */}
                <TabsContent value="video" className="p-4 border rounded-lg mt-2 space-y-4 bg-slate-50">
                    <div className="space-y-3">
                        <div>
                            <p className="text-base font-semibold">Tải lên video bài giảng</p>
                            <p className="text-sm text-muted-foreground">
                            Hỗ trợ file MP4/AVI/MOV. Nếu bạn nhập link YouTube, phần upload sẽ bị bỏ qua.
                            </p>
                        </div>
                        
                         <FormField
                            name="video_url"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Link Video (YouTube/Vimeo)</FormLabel>
                                <FormControl>
                                <Input placeholder="https://youtube.com/..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                             <p className="text-sm font-medium">Hoặc tải lên file</p>
                             <Input
                                type="file"
                                accept="video/*"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    setVideoFile(file || null);
                                }}
                                disabled={isSaving}
                                />
                                {videoFile && (
                                <p className="text-sm">
                                    Đã chọn: <span className="font-medium">{videoFile.name}</span> ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </p>
                                )}
                                {activeLesson?.video_uploaded_at && !videoFile && (
                                <p className="text-sm text-muted-foreground">
                                    Video đã lưu: {new Date(activeLesson.video_uploaded_at).toLocaleString()}
                                </p>
                                )}
                        </div>
                    </div>
                </TabsContent>

                {/* DOCUMENT TAB */}
                <TabsContent value="document" className="p-4 border rounded-lg mt-2 space-y-4 bg-slate-50">
                     <div className="space-y-3">
                         <p className="text-base font-semibold">Tài liệu học tập</p>
                         <p className="text-sm text-muted-foreground">
                             Tải lên tài liệu PDF, DOCX để học viên tải về hoặc xem trực tiếp.
                         </p>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                setDocumentFile(file || null);
                            }}
                            disabled={isSaving}
                            />
                            {documentFile && (
                            <p className="text-sm">
                                Đã chọn: <span className="font-medium">{documentFile.name}</span> ({(documentFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </p>
                            )}
                            {activeLesson?.document_key && !documentFile && (
                                <div className="text-sm text-muted-foreground">
                                    <p>Tài liệu hiện tại đã được tải lên.</p>
                                    <Button variant="link" className="p-0 h-auto" onClick={async () => {
                                         // Fetch document URL and open
                                         try {
                                             // We can use the adminService or just use the API endpoint directly if we have a token.
                                             // Since we are instructor, we should use courseService or storageService.
                                             // Let's assume we can use storageService if we add the method, BUT 
                                             // easiest way is to use axios directly here or add to proper service.
                                             // Let's use the `api/storage/document/url` endpoint which we know exists.
                                             // We need to import `apiClient` or similar? No, let's just use `fetch` with credential is hard because of HttpOnly cookie?
                                             // Actually, `courseService` imports `api` which is an axios instance.
                                             // Let's add `getLessonDocumentUrl` to `courseService` or `storageService`.
                                             // I'll add it to `storageService` in a separate step or inline the fetch using `storageService.client` if exposed? No.
                                             // I will use `courseService.getLessonDocumentUrl` (need to add it) OR just `video_url` logic?
                                             // Getting messy. Let's look at `storageService`.
                                             // I'll add `getLessonDocumentUrl` to `storageService` file since "storage" controller handles it.
                                             const res = await storageService.getLessonDocUrl(activeLesson!.lesson_id!);
                                             if (res.url) {
                                                window.open(res.url, "_blank");
                                             }
                                         } catch (e) {
                                             toast.error("Không thể mở tài liệu.");
                                         }
                                    }}>
                                        Đã có tài liệu (Nhấn để xem)
                                    </Button>
                                </div>
                            )}
                    </div>
                </TabsContent>

                {/* QUIZ TAB */}
                <TabsContent value="quiz" className="p-4 border rounded-lg mt-2 space-y-4 bg-slate-50">
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <HelpCircle className="w-12 h-12 text-slate-300" />
                        <div>
                            <p className="font-semibold text-lg">Bài tập trắc nghiệm</p>
                            <p className="text-muted-foreground max-w-sm">
                                Tạo các câu hỏi trắc nghiệm để kiểm tra kiến thức của học viên sau bài học này.
                            </p>
                        </div>
                        {activeLesson?.lesson_id ? (
                             <Button
                                type="button"
                                onClick={() => onOpenQuizEditor(activeLesson.lesson_id)}
                            >
                                Quản lý câu hỏi Quiz
                            </Button>
                        ) : (
                            <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded">
                                Vui lòng lưu bài học trước khi thêm câu hỏi Quiz.
                            </p>
                        )}
                       
                    </div>
                </TabsContent>
            </Tabs>

            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn về nội dung bài học..."
                      {...field}
                      className="h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="content"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung chi tiết (Văn bản)</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="allow_preview"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Cho phép xem trước (Học thử)</FormLabel>
                    <p className="text-xs text-muted-foreground pt-1">Học viên chưa mua khóa học có thể xem bài này.</p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between sm:justify-between sticky bottom-0 bg-background pt-2 border-t mt-4">
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSaving || isUploadingVideo}
                >
                  Hủy
                </Button>
                 {!activeLesson && (
                    <Button
                    type="button"
                    variant="outline"
                    onClick={form.handleSubmit((data) => onSubmit(data, true))}
                    disabled={isSaving || isUploadingVideo}
                    >
                    Lưu & Thêm Quiz
                    </Button>
                 )}
                <Button
                  type="submit"
                  disabled={isSaving || isUploadingVideo}
                >
                  {isSaving || isUploadingVideo ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
