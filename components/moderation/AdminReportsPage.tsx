"use client";

import { useState, useEffect } from "react";
import { moderationService } from "@/lib/api/moderationService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Flag, Trash2, CheckCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    type: string;
    id: number;
  } | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await moderationService.getReports(
        page,
        20,
        statusFilter || undefined,
        typeFilter || undefined
      );
      setReports(response.data);
      setTotalPages(response.meta.total_pages);
    } catch (error: any) {
      toast.error("Không thể tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter, typeFilter]);

  const handleUpdateStatus = async (
    reportId: number,
    status: string,
    note?: string
  ) => {
    try {
      await moderationService.updateReport(reportId, {
        status,
        admin_note: note,
      });
      toast.success("Đã cập nhật trạng thái");
      fetchReports();
      setSelectedReport(null);
      setAdminNote("");
    } catch (error: any) {
      toast.error("Không thể cập nhật");
    }
  };

  const handleDeleteContent = async () => {
    if (!deleteTarget) return;

    try {
      await moderationService.deleteContent(deleteTarget.type, deleteTarget.id);
      toast.success("Đã xóa nội dung vi phạm");
      fetchReports();
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error("Không thể xóa nội dung");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      case "reviewed":
        return <Badge variant="default">Đã xem</Badge>;
      case "resolved":
        return <Badge variant="outline">Đã giải quyết</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      discussion: "Câu hỏi",
      reply: "Trả lời",
      review: "Đánh giá",
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Quản lý báo cáo</h1>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="reviewed">Đã xem</SelectItem>
              <SelectItem value="resolved">Đã giải quyết</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Loại nội dung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="discussion">Câu hỏi</SelectItem>
              <SelectItem value="reply">Trả lời</SelectItem>
              <SelectItem value="review">Đánh giá</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card className="p-12 text-center">
          <Flag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Không có báo cáo nào</p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.report_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(report.content_type)}
                        {getStatusBadge(report.status)}
                      </div>
                      <CardTitle className="text-lg">
                        Báo cáo #{report.report_id}
                      </CardTitle>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(report.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Người báo cáo: {report.reporter?.full_name} (
                      {report.reporter?.email})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Nội dung ID: {report.content_id}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Lý do:</Label>
                    <p className="mt-1">{report.reason}</p>
                  </div>

                  {report.admin_note && (
                    <div>
                      <Label className="text-sm font-semibold">
                        Ghi chú admin:
                      </Label>
                      <p className="mt-1 text-muted-foreground">
                        {report.admin_note}
                      </p>
                    </div>
                  )}

                  {selectedReport?.report_id === report.report_id && (
                    <div className="space-y-3 pt-3 border-t">
                      <div>
                        <Label htmlFor="admin-note">Ghi chú xử lý</Label>
                        <Textarea
                          id="admin-note"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Ghi chú về cách xử lý..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {report.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (
                              selectedReport?.report_id === report.report_id
                            ) {
                              handleUpdateStatus(
                                report.report_id,
                                "reviewed",
                                adminNote
                              );
                            } else {
                              setSelectedReport(report);
                              setAdminNote(report.admin_note || "");
                            }
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {selectedReport?.report_id === report.report_id
                            ? "Lưu & Đánh dấu đã xem"
                            : "Đánh dấu đã xem"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setDeleteTarget({
                              type: report.content_type,
                              id: report.content_id,
                            })
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa nội dung
                        </Button>
                      </>
                    )}
                    {report.status === "reviewed" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(report.report_id, "resolved")
                        }
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Đánh dấu đã giải quyết
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <span className="flex items-center px-4">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nội dung</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa nội dung vi phạm này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContent}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
