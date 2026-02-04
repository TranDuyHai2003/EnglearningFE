"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { paymentService } from "@/lib/api/paymentService";
import { toast } from "sonner";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    if (transactionId) {
      const cancelTransaction = async () => {
        try {
          await paymentService.cancelTransaction(Number(transactionId));
        } catch (error) {
          console.error("Failed to cancel transaction:", error);
        }
      };
      cancelTransaction();
    }
  }, [transactionId]);

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Thanh toán đã hủy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Bạn đã hủy thanh toán. Không có khoản phí nào được tính.
          </p>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => router.back()}
            >
              Quay lại
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/courses")}
            >
              Khám phá khóa học
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-16"><Loader2 className="animate-spin h-8 w-8 text-red-600" /></div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
