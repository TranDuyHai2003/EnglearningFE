"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { instructorService } from "@/lib/api/instructorService";
import { Loader2, Star } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function InstructorReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await instructorService.getActionItems();
        setReviews(data.recent_reviews || []);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Đánh giá từ học viên</h1>
      <div className="grid gap-6">
        {reviews.length > 0 ? (
          reviews.map((review: any) => (
            <Card key={review.review_id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={review.student.avatar_url} />
                      <AvatarFallback>
                        {review.student.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {review.student.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {review.course.title}
                      </p>
                      <div className="flex items-center gap-1 mb-2">
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
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">
            Chưa có đánh giá nào.
          </p>
        )}
      </div>
    </div>
  );
}
