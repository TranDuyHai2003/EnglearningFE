"use client";

import { useForm } from "react-hook-form";
import { Section, SectionForm } from "@/lib/types";
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

interface SectionFormProps {
  courseId: number;
  section?: Section | null; // Dùng để chỉnh sửa
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSection: Section) => void;
}

export function SectionFormDialog({
  courseId,
  section,
  isOpen,
  onClose,
  onSuccess,
}: SectionFormProps) {
  const form = useForm<SectionForm>({
    defaultValues: {
      title: section?.title || "",
      description: section?.description || "",
    },
  });

  const onSubmit = async (data: SectionForm) => {
    try {
      let result;
      if (section) {
        // Chức năng cập nhật
        result = await courseService.updateSection(
          courseId,
          section.section_id,
          data
        );
      } else {
        // Chức năng tạo mới
        result = await courseService.createSection(courseId, data);
      }
      toast.success(`Chương học đã được ${section ? "cập nhật" : "tạo"}!`);
      onSuccess(result);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {section ? "Chỉnh sửa chương học" : "Tạo chương học mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="title"
              control={form.control}
              rules={{ required: "Tiêu đề là bắt buộc" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề chương</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Chương 1 - Giới thiệu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn về nội dung chương..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
