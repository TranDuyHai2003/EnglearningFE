"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { paymentService } from "@/lib/api/paymentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSessionStatus();
    }
  }, [sessionId]);

  const fetchSessionStatus = async () => {
    try {
      const response = await paymentService.getSessionStatus(sessionId!);
      setTransaction(response.transaction);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Thanh toán thành công!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Bạn đã được ghi danh vào khóa học. Bắt đầu học ngay!
          </p>

          {transaction && (
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã giao dịch:</span>
                <span className="font-mono">{transaction.transaction_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tiền:</span>
                <span className="font-semibold">${transaction.final_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Khóa học:</span>
                <span>{transaction.details[0]?.course?.title}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => router.push("/student/my-courses")}
            >
              Khóa học của tôi
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/courses")}
            >
              Khám phá thêm
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
