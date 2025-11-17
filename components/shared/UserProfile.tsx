"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { userService } from "@/lib/api/userService";
import { useAuth } from "@/lib/hooks/useAuth";
import { AuthenticatedUser, UpdateProfileForm } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center border-b pb-2 last:border-b-0">
    <p className="w-full sm:w-1/3 font-semibold text-gray-500">{label}</p>
    <p className="w-full sm:w-2/3 capitalize break-words">{value}</p>
  </div>
);

// Component phụ cho Skeleton UI
const ProfileSkeleton = () => (
  <div className="max-w-2xl mx-auto p-4 md:p-6">
    <div className="bg-white rounded-lg shadow-md border p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    </div>
  </div>
);

interface UserProfileProps {
  user: AuthenticatedUser;
}

export function UserProfile({ user: initialUser }: UserProfileProps) {
  const { user, updateUser } = useAuth(); // Dùng user từ useAuth để luôn cập nhật
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue } =
    useForm<UpdateProfileForm>();

  // Dùng user từ useAuth vì nó là nguồn dữ liệu mới nhất
  const currentUser = user || initialUser;

  useEffect(() => {
    if (currentUser) {
      setValue("full_name", currentUser.full_name);
      setValue("phone", currentUser.phone || "");
      // Thêm avatar_url nếu bạn muốn cho phép sửa link ảnh
      // setValue("avatar_url", currentUser.avatar_url || "");
    }
  }, [currentUser, setValue]);

  const onSubmit = async (data: UpdateProfileForm) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const updatedUser = await userService.updateUser(currentUser.id, data);
      updateUser(updatedUser); // Cập nhật state toàn cục
      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Cập nhật thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={currentUser.avatar_url || ""}
            alt={currentUser.full_name}
          />
          <AvatarFallback>
            <UserIcon size={32} />
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-2xl">{currentUser.full_name}</CardTitle>
          <p className="text-muted-foreground">{currentUser.email}</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="ml-auto">
            Chỉnh sửa
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <Input {...register("full_name")} disabled={isSubmitting} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <Input {...register("phone")} disabled={isSubmitting} />
            </div>
            {/* Thêm input cho avatar_url nếu cần */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Hủy
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-gray-700 border-t pt-4">
            <InfoRow label="Vai trò" value={currentUser.role} />
            <InfoRow label="Trạng thái" value={currentUser.status} />
            <InfoRow
              label="Số điện thoại"
              value={currentUser.phone || "Chưa cập nhật"}
            />
          </div>
        )}

        {/* ========================================================== */}
        {/* PHẦN HIỂN THỊ CÓ ĐIỀU KIỆN DỰA TRÊN VAI TRÒ */}
        {/* ========================================================== */}
        {currentUser.role === "instructor" && (
          <InstructorProfileSection instructorId={currentUser.id} />
        )}

        {/* Bạn có thể thêm các section khác cho student, admin nếu cần */}
      </CardContent>
    </Card>
  );
}

// Component con riêng cho phần profile của giảng viên
const InstructorProfileSection = ({
  instructorId,
}: {
  instructorId: number;
}) => {
  // TODO: Fetch và hiển thị thông tin profile giảng viên (bio, education, etc.)
  // Bạn có thể dùng một hook riêng (ví dụ: useInstructorProfile) để lấy dữ liệu này
  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Hồ sơ giảng viên</h3>
      <p className="text-muted-foreground">
        (Đây là khu vực để hiển thị và chỉnh sửa bio, kinh nghiệm, học vấn...)
      </p>
      {/* Form chỉnh sửa hồ sơ giảng viên có thể đặt ở đây */}
    </div>
  );
};
