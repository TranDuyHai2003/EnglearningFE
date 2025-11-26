"use client";

import { useState, useEffect } from "react";
import { paymentService } from "@/lib/api/paymentService";
import { Transaction } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Search, RefreshCcw, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefunding, setIsRefunding] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await paymentService.getAllTransactions(
        page,
        20,
        statusFilter === "all" ? undefined : statusFilter
      );
      setTransactions(response.data);
      // @ts-ignore - meta is not in the return type yet but API returns it
      setTotalPages(response.meta?.total_pages || 1);
    } catch (error) {
      toast.error("Không thể tải danh sách giao dịch");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const handleRefund = async () => {
    if (!selectedTransaction) return;

    setIsRefunding(true);
    try {
      await paymentService.requestRefund(selectedTransaction.transaction_id);
      toast.success("Hoàn tiền thành công!");
      fetchTransactions();
      setSelectedTransaction(null);
    } catch (error: any) {
      toast.error(error.message || "Hoàn tiền thất bại");
    } finally {
      setIsRefunding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Thành công</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Đang chờ</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Thất bại</Badge>;
      case "refunded":
        return <Badge className="bg-gray-500">Đã hoàn tiền</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND", // Or USD based on your system
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Giao dịch</h1>
          <p className="text-muted-foreground">
            Xem lịch sử thanh toán và xử lý hoàn tiền.
          </p>
        </div>
        <Button variant="outline" onClick={fetchTransactions}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm mã giao dịch..."
            className="pl-8"
            disabled // Search implementation pending backend support
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="completed">Thành công</SelectItem>
            <SelectItem value="pending">Đang chờ</SelectItem>
            <SelectItem value="failed">Thất bại</SelectItem>
            <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã giao dịch</TableHead>
              <TableHead>Học viên</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không có giao dịch nào.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((txn) => (
                <TableRow key={txn.transaction_id}>
                  <TableCell className="font-mono">
                    {txn.transaction_code}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {txn.student?.full_name || "N/A"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {txn.student?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {txn.details?.[0]?.course?.title || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(txn.final_amount)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(txn.created_at), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(txn.status)}</TableCell>
                  <TableCell className="text-right">
                    {txn.status === "completed" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setSelectedTransaction(txn)}
                          >
                            Hoàn tiền
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Xác nhận hoàn tiền</DialogTitle>
                            <DialogDescription>
                              Bạn có chắc chắn muốn hoàn tiền cho giao dịch{" "}
                              <span className="font-mono font-bold">
                                {txn.transaction_code}
                              </span>
                              ? Hành động này sẽ hủy quyền truy cập khóa học của
                              học viên và không thể hoàn tác.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex gap-3 items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                              <p className="font-semibold">Lưu ý:</p>
                              <p>
                                Nếu thanh toán qua Stripe, tiền sẽ được hoàn trả
                                vào thẻ của khách hàng (mất 5-10 ngày).
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedTransaction(null)}
                            >
                              Hủy
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleRefund}
                              disabled={isRefunding}
                            >
                              {isRefunding && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Xác nhận hoàn tiền
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls could go here */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
