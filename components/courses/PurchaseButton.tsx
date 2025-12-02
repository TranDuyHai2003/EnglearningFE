"use client";

import { useState } from "react";
import { paymentService } from "@/lib/api/paymentService";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PurchaseButtonProps {
  courseId: number;
  price: number;
  discountPrice?: number;
  isEnrolled?: boolean;
}

export function PurchaseButton({
  courseId,
  price,
  discountPrice,
  isEnrolled,
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const response = await paymentService.createCheckout(courseId);

      window.location.href = response.url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo thanh toán");
    } finally {
      setLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <Button
        className="w-full"
        onClick={() => (window.location.href = `/learn/courses/${courseId}`)}
      >
        Vào học
      </Button>
    );
  }

  const displayPrice = discountPrice || price;

  return (
    <Button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang xử lý...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Mua khóa học - ${displayPrice}
        </>
      )}
    </Button>
  );
}
