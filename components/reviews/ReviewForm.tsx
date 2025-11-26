"use client";

import { useState, useEffect } from "react";
import { reviewService } from "@/lib/api/reviewService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { toast } from "sonner";

interface ReviewFormProps {
  courseId: number;
  existingReview?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  courseId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.upsertReview(courseId, {
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success(
        existingReview
          ? "Đã cập nhật đánh giá"
          : "Đã gửi đánh giá thành công"
      );
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Đánh giá của bạn *</Label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Nhận xét (tùy chọn)</Label>
            <Textarea
              id="comment"
              placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Đang gửi..."
                : existingReview
                ? "Cập nhật"
                : "Gửi đánh giá"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Hủy
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
