"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { instructorService } from "@/lib/api/instructorService";
import { InstructorProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Eye,
  XCircle,
  Phone,
  Video,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// === DIALOG COMPONENTS ===
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Skeleton loading
const InstructorSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function AdminInstructorsPage() {
  const [profiles, setProfiles] = useState<InstructorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<"pending" | "interviewing">(
    "pending"
  );

  // Modal State
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    profileId: number | null;
    type: "interviewing" | "rejected" | null;
  }>({
    isOpen: false,
    profileId: null,
    type: null,
  });
  const [reviewNote, setReviewNote] = useState("");
  const [reviewLink, setReviewLink] = useState(""); // For meeting link

  // Fetch API
  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await instructorService.listProfiles({
        page,
        limit: 5,
        status: statusFilter,
      });

      setProfiles(response.data);
      setTotal(response.meta.total || 0);
      setTotalPages(response.meta.total_pages || 1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải danh sách.";
      setError(errorMessage);
      toast.error(errorMessage);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // === 1. OPEN MODAL ===
  const openReviewModal = (
    profileId: number,
    type: "interviewing" | "rejected"
  ) => {
    setReviewModal({ isOpen: true, profileId, type });
    setReviewNote("");
    setReviewLink("");
  };

  // === 2. SUBMIT FROM MODAL ===
  const handleSubmitReview = async () => {
    if (!reviewModal.profileId || !reviewModal.type) return;

    // Basic validation
    if (reviewModal.type === "rejected" && !reviewNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    // If interviewing, combine note and link (or send separately if backend supports it)
    // Assuming backend supports 'meeting_link' as discussed previously, otherwise append to note.
    // Here I assume backend supports 'meeting_link' from previous steps. If not, append to note.

    setIsMutating(true);
    try {
      await instructorService.reviewProfile(
        reviewModal.profileId,
        reviewModal.type === "interviewing" ? "interviewing" : "rejected",
        reviewModal.type === "rejected" ? reviewNote : undefined, // reason
        reviewModal.type === "interviewing" ? reviewNote : undefined // interview_notes
        // reviewLink // Pass this if you updated the service to accept a 5th argument
      );

      toast.success(
        reviewModal.type === "interviewing"
          ? "Đã gửi lời mời phỏng vấn!"
          : "Đã từ chối hồ sơ."
      );

      setReviewModal({ isOpen: false, profileId: null, type: null });
      fetchProfiles();
    } catch (err) {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setIsMutating(false);
    }
  };

  // === 3. DIRECT APPROVE ===
  const handleApprove = async (profileId: number) => {
    if (statusFilter === "pending") {
      if (
        !confirm(
          "CẢNH BÁO: Bạn đang duyệt hồ sơ này mà KHÔNG qua phỏng vấn. Tiếp tục?"
        )
      )
        return;
    }

    setIsMutating(true);
    try {
      await instructorService.reviewProfile(profileId, "approved");
      toast.success("Hồ sơ đã được chấp thuận!");
      fetchProfiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsMutating(false);
    }
  };

  // Render Content
  const renderContent = () => {
    if (isLoading) return <InstructorSkeleton />;
    if (error)
      return (
        <div className="text-red-600 text-center py-10 bg-red-50 rounded-md">
          {error}
        </div>
      );

    if (!profiles || profiles.length === 0) {
      return (
        <div className="text-center py-16 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold">Không có hồ sơ nào</h3>
          <p className="text-muted-foreground mt-2">
            {statusFilter === "pending"
              ? "Không có yêu cầu mới nào."
              : "Không có ai đang trong quá trình phỏng vấn."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {profiles.map((profile) => (
          <Card
            key={profile.profile_id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {profile.user?.full_name}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    {profile.user?.email}
                    {profile.intro_video_url && (
                      <a
                        href={profile.intro_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 ml-2"
                      >
                        <Video className="h-3 w-3" /> Video Demo
                      </a>
                    )}
                  </CardDescription>
                </div>
                <Badge
                  className={
                    profile.approval_status === "interviewing"
                      ? "bg-blue-600"
                      : "bg-secondary"
                  }
                >
                  {profile.approval_status === "interviewing"
                    ? "Đang Phỏng vấn"
                    : "Chờ duyệt"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-semibold">Kinh nghiệm:</span>{" "}
                  <p className="text-muted-foreground line-clamp-2">
                    {profile.experience || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">Chứng chỉ:</span>{" "}
                  <p className="text-muted-foreground line-clamp-2">
                    {profile.certificates || "N/A"}
                  </p>
                </div>
              </div>

              {statusFilter === "interviewing" && profile.interview_notes && (
                <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
                  <strong>Ghi chú PV:</strong> {profile.interview_notes}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {/* Show Interview Button only in Pending tab */}
                {statusFilter === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() =>
                      openReviewModal(profile.profile_id, "interviewing")
                    }
                    disabled={isMutating}
                  >
                    <Phone className="mr-2 h-4 w-4" /> Mời Phỏng vấn
                  </Button>
                )}

                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(profile.profile_id)}
                  disabled={isMutating}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {statusFilter === "interviewing"
                    ? "Phê duyệt (Đạt)"
                    : "Duyệt Thẳng"}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    openReviewModal(profile.profile_id, "rejected")
                  }
                  disabled={isMutating}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Từ chối
                </Button>

                <Link href={`/admin/instructors/${profile.profile_id}`}>
                  <Button variant="secondary" size="sm">
                    <Eye className="mr-2 h-4 w-4" /> Chi tiết
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý Giảng viên
          </h1>
          <p className="text-muted-foreground">
            Xem xét hồ sơ đăng ký và phỏng vấn.
          </p>
        </div>

        {/* FILTER TABS */}
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <Button
            variant={statusFilter === "pending" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setStatusFilter("pending");
              setPage(1);
            }}
            className="rounded-md"
          >
            Hồ sơ mới
          </Button>
          <Button
            variant={statusFilter === "interviewing" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setStatusFilter("interviewing");
              setPage(1);
            }}
            className="rounded-md"
          >
            Đang phỏng vấn
          </Button>
        </div>
      </div>

      {renderContent()}

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between py-6 mt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Tổng: {total} hồ sơ
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* === MODAL === */}
      <Dialog
        open={reviewModal.isOpen}
        onOpenChange={(open) =>
          !open && setReviewModal((prev) => ({ ...prev, isOpen: false }))
        }
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {reviewModal.type === "interviewing"
                ? "Gửi lời mời Phỏng vấn"
                : "Từ chối Hồ sơ"}
            </DialogTitle>
            <DialogDescription>
              {reviewModal.type === "interviewing"
                ? "Nhập thông tin lịch hẹn, link họp online hoặc hướng dẫn tiếp theo."
                : "Vui lòng nhập lý do từ chối để giảng viên có thể cải thiện hồ sơ."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Only show Link input for Interviewing */}
            {reviewModal.type === "interviewing" && (
              <div className="grid gap-2">
                <Label htmlFor="link">Link cuộc họp (Google Meet / Zoom)</Label>
                <Input
                  id="link"
                  value={reviewLink}
                  onChange={(e) => setReviewLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="note">
                {reviewModal.type === "interviewing"
                  ? "Ghi chú / Lịch hẹn"
                  : "Lý do từ chối"}
              </Label>
              <Textarea
                id="note"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={
                  reviewModal.type === "interviewing"
                    ? "VD: Phỏng vấn lúc 10:00 AM ngày..."
                    : "VD: Thiếu chứng chỉ sư phạm..."
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setReviewModal((prev) => ({ ...prev, isOpen: false }))
              }
            >
              Hủy bỏ
            </Button>
            <Button
              variant={
                reviewModal.type === "rejected" ? "destructive" : "default"
              }
              onClick={handleSubmitReview}
              disabled={isMutating}
            >
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reviewModal.type === "interviewing"
                ? "Gửi lời mời"
                : "Xác nhận Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
