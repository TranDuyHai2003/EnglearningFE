import apiClient from "./apiClient";
import { ApiResponse, Transaction } from "@/lib/types";

interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
}

interface SessionStatusResponse {
  status: string;
  transaction: Transaction;
}

class PaymentService {
  // Create Stripe checkout session
  async createCheckout(courseId: number): Promise<CreateCheckoutResponse> {
    const response = await apiClient.post<ApiResponse<CreateCheckoutResponse>>(
      "/payments/create-checkout",
      { courseId }
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể tạo thanh toán");
  }

  // Get session status
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    const response = await apiClient.get<ApiResponse<SessionStatusResponse>>(
      `/payments/session/${sessionId}`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể lấy trạng thái thanh toán");
  }

  // Get user transactions
  async getTransactions(page = 1, limit = 20) {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      "/payments/transactions",
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  // Admin: Get all transactions
  async getAllTransactions(page = 1, limit = 20, status?: string) {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      "/payments/transactions",
      {
        params: { page, limit, status },
      }
    );
    return response.data;
  }

  // Admin: Request refund
  async requestRefund(transactionId: number) {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `/payments/transactions/${transactionId}/refund`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Hoàn tiền thất bại");
  }
}

export const paymentService = new PaymentService();
