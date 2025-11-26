"use client";

import { useState } from "react";
import { discussionService } from "@/lib/api/discussionService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ReplyFormProps {
  discussionId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReplyForm({
  discussionId,
  onSuccess,
  onCancel,
}: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      setSubmitting(true);
      await discussionService.createReply(discussionId, content.trim());
      toast.success("Đã gửi câu trả lời");
      setContent("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi trả lời");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Viết câu trả lời của bạn..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        required
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Đang gửi..." : "Gửi trả lời"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={submitting}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
