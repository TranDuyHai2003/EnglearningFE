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
  // Resume payment
  async resumePayment(transactionId: number): Promise<{ url: string }> {
    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      `/payments/transactions/${transactionId}/resume`
    );
    throw new Error(response.data.message || "Không thể tiếp tục thanh toán");
  }

  // Cancel transaction
  async cancelTransaction(transactionId: number): Promise<void> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/payments/transactions/${transactionId}/cancel`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể hủy giao dịch");
    }
  }
}

export const paymentService = new PaymentService();
