"use client";

import { useState } from "react";
import { discussionService } from "@/lib/api/discussionService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AskQuestionDialogProps {
  lessonId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AskQuestionDialog({
  lessonId,
  open,
  onOpenChange,
  onSuccess,
}: AskQuestionDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setSubmitting(true);
      await discussionService.createDiscussion(lessonId, {
        title: title.trim(),
        content: content.trim(),
      });
      toast.success("Đã đặt câu hỏi thành công");
      setTitle("");
      setContent("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể đặt câu hỏi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Đặt câu hỏi</DialogTitle>
            <DialogDescription>
              Đặt câu hỏi về bài học này. Giảng viên sẽ nhận được thông báo và
              trả lời bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề câu hỏi *</Label>
              <Input
                id="title"
                placeholder="Ví dụ: Làm thế nào để..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung chi tiết *</Label>
              <Textarea
                id="content"
                placeholder="Mô tả chi tiết câu hỏi của bạn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Hãy mô tả rõ ràng để nhận được câu trả lời tốt nhất
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Đặt câu hỏi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
