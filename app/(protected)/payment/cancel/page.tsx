"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="container max-w-2xl py-16">
      <Card>
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
