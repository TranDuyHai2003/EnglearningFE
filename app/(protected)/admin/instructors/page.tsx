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
import { CheckCircle2, XCircle } from "lucide-react";

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

  // ✅ Thêm state phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ✅ Fetch API
  const fetchPendingProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await instructorService.listProfiles({
        page,
        limit: 5, // giới hạn mỗi trang 5 hồ sơ
        status: "pending",
      });

      // ✅ Dữ liệu lấy từ API đã sửa trong instructorService
      setProfiles(response.data);
      setTotal(response.meta.total || 0);
      setTotalPages(response.meta.total_pages || 1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải danh sách.";
      setError(errorMessage);
      toast.error(errorMessage);
      setProfiles([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPendingProfiles();
  }, [fetchPendingProfiles]);

  // ✅ Duyệt và từ chối
  const handleApprove = async (profileId: number) => {
    setIsMutating(true);
    try {
      await instructorService.reviewProfile(profileId, "approved");
      toast.success("Hồ sơ đã được chấp thuận!");
      fetchPendingProfiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleReject = async (profileId: number) => {
    const reason = prompt("Vui lòng nhập lý do từ chối:");
    if (!reason) {
      toast.info("Hành động đã được hủy.");
      return;
    }
    setIsMutating(true);
    try {
      await instructorService.reviewProfile(profileId, "rejected", reason);
      toast.success("Hồ sơ đã bị từ chối.");
      fetchPendingProfiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsMutating(false);
    }
  };

  // ✅ Render danh sách
  const renderContent = () => {
    if (isLoading && profiles.length === 0) {
      return <InstructorSkeleton />;
    }

    if (error) {
      return (
        <div className="text-red-600 text-center py-10 bg-red-50 rounded-md">
          {error}
        </div>
      );
    }

    if (!profiles || profiles.length === 0) {
      return (
        <div className="text-center py-16 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold">
            Không có hồ sơ nào chờ duyệt
          </h3>
          <p className="text-muted-foreground mt-2">
            Mọi thứ đều đã được xử lý!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {profiles.map((profile) => (
          <Card key={profile.profile_id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {profile.user?.full_name}
                  </CardTitle>
                  <CardDescription>{profile.user?.email}</CardDescription>
                </div>
                <Badge variant="secondary">{profile.approval_status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm">Bio</h4>
                  <p className="text-sm text-muted-foreground">
                    {profile.bio || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Học vấn</h4>
                  <p className="text-sm text-muted-foreground">
                    {profile.education || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Kinh nghiệm</h4>
                  <p className="text-sm text-muted-foreground">
                    {profile.experience || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6 pt-4 border-t">
                <Button
                  size="sm"
                  onClick={() => handleApprove(profile.profile_id)}
                  disabled={isMutating}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Chấp thuận
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReject(profile.profile_id)}
                  disabled={isMutating}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Từ chối
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Duyệt hồ sơ Giảng viên</h1>
      <p className="text-muted-foreground mb-6">
        Các hồ sơ đang chờ được xem xét.
      </p>

      {renderContent()}

      {/* ✅ Phân trang */}
      {!isLoading && (
        <div className="flex items-center justify-between py-6 mt-8 border-t">
          <span className="text-sm text-muted-foreground">
            Tổng cộng: {total} hồ sơ
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Trang {page} / {totalPages}
            </span>
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
    </div>
  );
}
