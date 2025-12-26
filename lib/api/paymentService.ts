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

  async createPackageCheckout(packageId: number): Promise<CreateCheckoutResponse> {
    const response = await apiClient.post<ApiResponse<CreateCheckoutResponse>>(
      "/payments/create-checkout",
      { packageId }
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Không thể tạo thanh toán gói");
  }

  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    const response = await apiClient.get<ApiResponse<SessionStatusResponse>>(
      `/payments/session/${sessionId}`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(
      response.data.message || "Không thể lấy trạng thái thanh toán"
    );
  }

  async getTransactions(page = 1, limit = 20) {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      "/payments/transactions",
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  async getAllTransactions(page = 1, limit = 20, status?: string) {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      "/payments/transactions",
      {
        params: { page, limit, status },
      }
    );
    return response.data;
  }

  async requestRefund(transactionId: number) {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `/payments/transactions/${transactionId}/refund`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Hoàn tiền thất bại");
  }

  async resumePayment(transactionId: number): Promise<{ url: string }> {
    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      `/payments/transactions/${transactionId}/resume`
    );
    throw new Error(response.data.message || "Không thể tiếp tục thanh toán");
  }

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
