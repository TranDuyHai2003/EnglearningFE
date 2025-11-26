"use client";

import { useState, useEffect } from "react";
import { reviewService } from "@/lib/api/reviewService";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface CourseReviewSectionProps {
  courseId: number;
  averageRating?: number;
  totalReviews?: number;
  isEnrolled?: boolean;
}

export function CourseReviewSection({
  courseId,
  averageRating = 0,
  totalReviews = 0,
  isEnrolled = false,
}: CourseReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [myReview, setMyReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getCourseReviews(
        courseId,
        page,
        10,
        ratingFilter
      );
      setReviews(response.data);
      setTotalPages(response.meta.total_pages);
    } catch (error: any) {
      toast.error("Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReview = async () => {
    if (!user || !isEnrolled) return;

    try {
      const response = await reviewService.getMyReview(courseId);
      setMyReview(response.data);
    } catch (error: any) {
      // No review yet
      setMyReview(null);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [courseId, page, ratingFilter]);

  useEffect(() => {
    fetchMyReview();
  }, [courseId, user, isEnrolled]);

  const handleReviewSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchMyReview();
    fetchReviews();
  };

  const handleEdit = (review: any) => {
    setEditingReview(review);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={averageRating} readonly size="lg" />
              <p className="text-sm text-muted-foreground mt-2">
                {totalReviews} đánh giá
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Review / Write Review */}
      {user && isEnrolled && (
        <div>
          {myReview && !showForm ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Đánh giá của bạn</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(myReview)}
                  >
                    Chỉnh sửa
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <StarRating rating={myReview.rating} readonly />
                  {myReview.comment && (
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {myReview.comment}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : showForm ? (
            <ReviewForm
              courseId={courseId}
              existingReview={editingReview}
              onSuccess={handleReviewSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingReview(null);
              }}
            />
          ) : (
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Star className="mr-2 h-4 w-4" />
              Viết đánh giá
            </Button>
          )}
        </div>
      )}

      {/* All Reviews */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Tất cả đánh giá ({totalReviews})
        </h3>
        <ReviewList
          reviews={reviews}
          loading={loading}
          page={page}
          totalPages={totalPages}
          ratingFilter={ratingFilter}
          onPageChange={setPage}
          onRatingFilterChange={setRatingFilter}
          onUpdate={() => {
            fetchReviews();
            fetchMyReview();
          }}
          onEdit={user && isEnrolled ? handleEdit : undefined}
        />
      </div>
    </div>
  );
}
