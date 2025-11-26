"use client";

import { useState } from "react";
import { moderationService } from "@/lib/api/moderationService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ReportDialogProps {
  contentType: "discussion" | "reply" | "review";
  contentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam hoặc quảng cáo" },
  { value: "harassment", label: "Quấy rối hoặc bắt nạt" },
  { value: "hate_speech", label: "Ngôn từ gây thù ghét" },
  { value: "misinformation", label: "Thông tin sai lệch" },
  { value: "inappropriate", label: "Nội dung không phù hợp" },
  { value: "other", label: "Lý do khác" },
];

export function ReportDialog({
  contentType,
  contentId,
  open,
  onOpenChange,
}: ReportDialogProps) {
  const [reasonType, setReasonType] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reasonType) {
      toast.error("Vui lòng chọn lý do báo cáo");
      return;
    }

    const reason =
      REPORT_REASONS.find((r) => r.value === reasonType)?.label || reasonType;
    const fullReason = details.trim()
      ? `${reason}: ${details.trim()}`
      : reason;

    try {
      setSubmitting(true);
      await moderationService.reportContent({
        content_type: contentType,
        content_id: contentId,
        reason: fullReason,
      });
      toast.success("Đã gửi báo cáo. Cảm ơn bạn đã giúp cải thiện cộng đồng!");
      setReasonType("");
      setDetails("");
      onOpenChange(false);
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error("Bạn đã báo cáo nội dung này rồi");
      } else {
        toast.error(error.response?.data?.message || "Không thể gửi báo cáo");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Báo cáo nội dung vi phạm</DialogTitle>
            <DialogDescription>
              Vui lòng cho chúng tôi biết vấn đề với nội dung này. Chúng tôi sẽ
              xem xét và xử lý trong thời gian sớm nhất.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do báo cáo *</Label>
              <Select value={reasonType} onValueChange={setReasonType} required>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Chọn lý do..." />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Chi tiết (tùy chọn)</Label>
              <Textarea
                id="details"
                placeholder="Mô tả thêm về vấn đề..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
              />
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
              {submitting ? "Đang gửi..." : "Gửi báo cáo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
