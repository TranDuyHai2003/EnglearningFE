"use client";

import { useState } from "react";
import { reviewService } from "@/lib/api/reviewService";
import { useAuth } from "@/lib/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ReviewItemProps {
  review: any;
  onUpdate?: () => void;
  onEdit?: (review: any) => void;
}

export function ReviewItem({ review, onUpdate, onEdit }: ReviewItemProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id === review.student_id;

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      setDeleting(true);
      await reviewService.deleteReview(review.course_id);
      toast.success("Đã xóa đánh giá");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.student?.avatar_url} />
            <AvatarFallback>
              {review.student?.full_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{review.student?.full_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} readonly size="sm" />
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(review)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {review.comment && (
        <p className="text-muted-foreground whitespace-pre-wrap">
          {review.comment}
        </p>
      )}
    </div>
  );
}
