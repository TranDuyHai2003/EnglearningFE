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

  useEffect(() => {
    setActiveLesson(lesson || null);
  }, [lesson]);

  const form = useForm<LessonForm>({
    defaultValues: {
      title: lesson?.title || "",
      description: lesson?.description || "",
      lesson_type: lesson?.lesson_type || "video",
      video_url: lesson?.video_url || "",
      content: lesson?.content || "",
      allow_preview: lesson?.allow_preview || false,
    },
  });

  const onSubmit = async (data: LessonForm, shouldOpenQuizEditor = false) => {
    try {
      let result;
      const payload = {
        ...data,
        video_duration: data.video_duration ? Number(data.video_duration) : 0,
      };

      if (activeLesson) {
        result = await courseService.updateLesson(
          sectionId,
          activeLesson.lesson_id,
          payload
        );
      } else {
        result = await courseService.createLesson(sectionId, payload);
      }

      toast.success(`Bài học đã được ${activeLesson ? "cập nhật" : "tạo"}!`);

      setActiveLesson(result);
      onSuccess(result);

      if (shouldOpenQuizEditor && result.lesson_id) {
        onOpenQuizEditor(result.lesson_id);
      } else {
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi.");
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
                >
                  Lưu & Soạn câu hỏi
                </Button>
              )}

              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
