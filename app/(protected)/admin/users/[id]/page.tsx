"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  User as UserIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthenticatedUser, UserStatus } from "@/lib/types";
import { userService } from "@/lib/api/userService";
import { formatDate } from "@/lib/utils";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const userData = await userService.getUser(userId);
      setUser(userData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tải thông tin người dùng.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleStatusChange = async (newStatus: UserStatus) => {
    if (!user) return;
    try {
      const updatedUser = await userService.updateUser(user.id, {
        status: newStatus,
      });
      setUser(updatedUser);
      toast.success("Cập nhật trạng thái thành công");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="ghost" className="mb-6" disabled>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {error || "Người dùng không tồn tại"}
        </h2>
        <Button onClick={() => router.back()}>Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/admin/users")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url || ""} alt={user.full_name} />
                <AvatarFallback className="text-2xl">
                  {user.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user.full_name}</CardTitle>
            <div className="mt-2 flex flex-col items-center gap-2">
              <Badge
                variant={
                  user.role.includes("admin") ? "destructive" : "secondary"
                }
              >
                {user.role}
              </Badge>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">
                  Trạng thái:
                </span>
                <Select
                  value={user.status}
                  onValueChange={(value) =>
                    handleStatusChange(value as UserStatus)
                  }
                >
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Tham gia: {formatDate(user.created_at)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>ID: {user.id}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {user.instructor_profile && (
                <>
                  <div>
                    <h3 className="font-medium mb-2">Giới thiệu (Bio)</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.instructor_profile.bio ||
                        "Chưa có thông tin giới thiệu."}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Kinh nghiệm</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.instructor_profile.experience || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Học vấn</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.instructor_profile.education || "Chưa cập nhật"}
                    </p>
                  </div>
                </>
              )}
              {!user.instructor_profile && (
                <p className="text-sm text-muted-foreground">
                  Người dùng này không phải là giảng viên nên không có thông tin
                  hồ sơ chi tiết.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
