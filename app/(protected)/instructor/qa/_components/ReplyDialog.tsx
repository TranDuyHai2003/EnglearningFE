"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { instructorService } from "@/lib/api/instructorService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReplyDialogProps {
  discussionId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentName?: string;
  questionText?: string;
}

export function ReplyDialog({
  discussionId,
  isOpen,
  onClose,
  onSuccess,
  studentName,
  questionText,
}: ReplyDialogProps) {
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!discussionId || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await instructorService.replyToDiscussion(discussionId, replyText);
      toast.success("Đã gửi câu trả lời thành công!");
      setReplyText("");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gửi câu trả lời thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Trả lời câu hỏi</DialogTitle>
          <DialogDescription>
            Trả lời câu hỏi của học viên <strong>{studentName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-slate-50 p-3 rounded-md mb-4 text-sm text-slate-700 italic border">
            "{questionText}"
          </div>
          <Textarea
            placeholder="Nhập câu trả lời của bạn..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={5}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !replyText.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gửi trả lời
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
