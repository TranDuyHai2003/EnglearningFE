import apiClient from "./apiClient";
import { ApiResponse, Transaction } from "@/lib/types";

interface CheckoutPayload {
  transaction_id: number;
  payment_method: "bank_card" | "e_wallet" | "bank_transfer";
  payment_gateway: string;
}

class PaymentService {
  // Bước 1: Tạo giao dịch "pending" (giống như tạo giỏ hàng cho 1 sản phẩm)
  async createTransaction(courseIds: number[]): Promise<Transaction> {
    const response = await apiClient.post<
      ApiResponse<{ transaction: Transaction }>
    >("/payments/cart", { course_ids: courseIds });
    if (response.data.success) {
      return response.data.data.transaction;
    }
    throw new Error(response.data.message || "Không thể tạo giao dịch.");
  }

  // Bước 2: Xác nhận thanh toán
  async checkout(payload: CheckoutPayload): Promise<Transaction> {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      "/payments/checkout",
      payload
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Thanh toán thất bại.");
  }
}

export const paymentService = new PaymentService();
