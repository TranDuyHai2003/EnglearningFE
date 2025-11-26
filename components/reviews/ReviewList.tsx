"use client";

import { ReviewItem } from "./ReviewItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewListProps {
  reviews: any[];
  loading: boolean;
  page: number;
  totalPages: number;
  ratingFilter?: number;
  onPageChange: (page: number) => void;
  onRatingFilterChange?: (rating?: number) => void;
  onUpdate?: () => void;
  onEdit?: (review: any) => void;
}

export function ReviewList({
  reviews,
  loading,
  page,
  totalPages,
  ratingFilter,
  onPageChange,
  onRatingFilterChange,
  onUpdate,
  onEdit,
}: ReviewListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      {onRatingFilterChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Lọc theo:</span>
          <Select
            value={ratingFilter?.toString() || "all"}
            onValueChange={(value) =>
              onRatingFilterChange(value === "all" ? undefined : parseInt(value))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả đánh giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đánh giá</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">
            {ratingFilter
              ? `Chưa có đánh giá ${ratingFilter} sao`
              : "Chưa có đánh giá nào"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review.review_id}
              review={review}
              onUpdate={onUpdate}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Trước
          </Button>
          <span className="flex items-center px-4">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
