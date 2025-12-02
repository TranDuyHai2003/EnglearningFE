"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { interactionService } from "@/lib/api/interactionService";
import { Review } from "@/lib/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Props {
  courseId: number;
}

export const ReviewTab = ({ courseId }: Props) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const data = await interactionService.getReviews({
          course_id: courseId,
          status: "approved",
        });
        setReviews(data);

        if (user) {
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [courseId, user]);

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    setIsSubmitting(true);
    try {
      const newReview = await interactionService.createReview(
        courseId,
        rating,
        comment
      );
      setUserReview(newReview);
      toast.success("Đã gửi đánh giá! Vui lòng chờ duyệt.");
      setComment("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gửi đánh giá thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {!userReview && (
        <div className="bg-slate-50 p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Viết đánh giá của bạn</h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Chọn mức độ hài lòng:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Bạn cảm thấy khóa học này thế nào?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-4 bg-white"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </div>
      )}

      {userReview && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-blue-800">
          <p className="font-medium">Cảm ơn bạn đã đánh giá!</p>
          <p className="text-sm">
            Đánh giá của bạn đang được xét duyệt và sẽ hiển thị sớm.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="font-semibold text-lg">Đánh giá từ học viên</h3>
        {isLoading ? (
          <p className="text-center text-muted-foreground">Đang tải...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Chưa có đánh giá nào.
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.review_id} className="border rounded-lg p-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">Học viên</p>
                      <div className="flex items-center gap-1 my-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  </div>
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
