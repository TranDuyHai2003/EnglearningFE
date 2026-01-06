"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Lesson, LessonForm, LessonType } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courseService } from "@/lib/api/courseService";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { storageService } from "@/lib/api/storageService";

interface LessonFormProps {
  sectionId: number;
  lesson?: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLesson: Lesson) => void;
}

const lessonTypes: LessonType[] = ["video", "document", "quiz"];

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
      if (!isOpen) {
      setVideoFile(null);
      setDocumentFile(null);
      setIsSaving(false);
      setIsUploadingVideo(false);
    }
      setIsSaving(false);
      setIsUploadingVideo(false);
    }
  }, [isOpen]);

  const form = useForm<LessonForm>({
    defaultValues: {
      title: lesson?.title || "",
      description: lesson?.description || "",
      lesson_type: lesson?.lesson_type || "video",
      video_url: lesson?.video_url || "",
      video_bucket: lesson?.video_bucket || "",
      video_key: lesson?.video_key || "",
      video_uploaded_at: lesson?.video_uploaded_at || "",
      content: lesson?.content || "",
      allow_preview: lesson?.allow_preview || false,
      display_order: lesson?.display_order || 0,
    },
  });

  const onSubmit = async (data: LessonForm, shouldOpenQuizEditor = false) => {
    setIsSaving(true);
    try {
      let result: Lesson;
      const payload = {
        ...data,
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
        setIsUploadingVideo(true); // Re-use loading state or create new one
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activeLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => onSubmit(data, false))}
            className="space-y-4"
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="lesson_type"
                control={form.control}
                rules={{ required: "Vui lòng chọn loại bài học" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại bài học</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lessonTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="video_url"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Video (tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch("lesson_type") === "video" && (
              <div className="p-4 border rounded-lg space-y-3 bg-slate-50">
                <p className="text-base font-semibold">
                  Upload video bài giảng
                </p>
                <p className="text-sm text-muted-foreground">
                  Hỗ trợ file MP4/AVI/MOV dung lượng tối đa 1GB. Nếu bạn nhập
                  link YouTube, phần upload có thể bỏ qua.
                </p>
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
                    Đã chọn:{" "}
                    <span className="font-medium">{videoFile.name}</span>{" "}
                    ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
                {activeLesson?.video_uploaded_at && !videoFile && (
                  <p className="text-sm text-muted-foreground">
                    Video hiện tại đã tải lên lúc{" "}
                    {new Date(activeLesson.video_uploaded_at).toLocaleString()}
                  </p>
                )}
                {(isUploadingVideo || isSaving) && videoFile && (
                  <p className="text-sm text-blue-600">
                    Đang tải video lên, vui lòng không đóng cửa sổ này...
                  </p>
                )}
              </div>
            )}

            {form.watch("lesson_type") === "document" && (
              <div className="p-4 border rounded-lg space-y-3 bg-slate-50">
                <p className="text-base font-semibold">
                  Tải lên tài liệu (PDF, DOC, DOCX)
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
                    Đã chọn:{" "}
                    <span className="font-medium">{documentFile.name}</span>{" "}
                    ({(documentFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
                {activeLesson?.document_url && !documentFile && (
                   <div className="text-sm text-muted-foreground">
                    <p>Tài liệu hiện tại: <a href={`/api/courses/${sectionId}/thumbnails/${activeLesson.document_url}`} target="_blank" className="text-blue-600 hover:underline">Xem tài liệu</a></p>
                    <p>Đã tải lên lúc {activeLesson.document_uploaded_at ? new Date(activeLesson.document_uploaded_at).toLocaleString() : 'N/A'}</p>
                   </div>
                )}
              </div>
            )}

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
                  <FormLabel>Nội dung chi tiết</FormLabel>
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
                    <FormLabel>Cho phép xem trước</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="flex justify-between sm:justify-between sticky bottom-0 bg-background pt-2">
              {activeLesson && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenQuizEditor(activeLesson.lesson_id)}
                >
                  {form.watch("lesson_type") === "quiz"
                    ? "Quản lý câu hỏi Quiz"
                    : "Thêm/Sửa Quiz đính kèm"}
                </Button>
              )}

              {form.watch("lesson_type") === "document" && (
                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const content = form.getValues("content");
                      const title = form.getValues("title");
                      const previewWindow = window.open("", "_blank");
                      if (previewWindow) {
                        previewWindow.document.write(`
                          <html>
                            <head>
                              <title>Preview: ${title}</title>
                              <script src="https://cdn.tailwindcss.com"></script>
                            </head>
                            <body class="p-8 max-w-3xl mx-auto prose">
                              <h1 class="text-3xl font-bold mb-4">${title}</h1>
                              <div>${content}</div>
                            </body>
                          </html>
                        `);
                        previewWindow.document.close();
                      }
                    }}
                  >
                    Xem trước
                  </Button>
              )}

              {!activeLesson && form.watch("lesson_type") === "quiz" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={form.handleSubmit((data) => onSubmit(data, true))}
                  disabled={isSaving || isUploadingVideo}
                >
                  Lưu & Soạn câu hỏi
                </Button>
              )}

              {!activeLesson && form.watch("lesson_type") !== "quiz" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={form.handleSubmit((data) => onSubmit(data, true))}
                  disabled={isSaving || isUploadingVideo}
                >
                  Lưu & Thêm Quiz
                </Button>
              )}



              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSaving || isUploadingVideo}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || isUploadingVideo}
                >
                  {isSaving || isUploadingVideo ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
