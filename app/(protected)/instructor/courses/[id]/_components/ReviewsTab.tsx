import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { courseService } from "@/lib/api/courseService";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ReviewsTabProps {
  courseId: number;
}

export function ReviewsTab({ courseId }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await courseService.getCourseReviews(courseId);
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [courseId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá từ học viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đánh giá từ học viên ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.review_id}
                className="border-b pb-6 last:border-0 last:pb-0"
              >
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={review.student?.avatar_url} />
                    <AvatarFallback>
                      {review.student?.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        {review.student?.full_name}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 mt-2">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Chưa có đánh giá nào cho khóa học này.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
