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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ChangePasswordForm } from "@/lib/types";

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center border-b pb-2 last:border-b-0">
    <p className="w-full sm:w-1/3 font-semibold text-gray-500">{label}</p>
    <p className="w-full sm:w-2/3 capitalize break-words">{value}</p>
  </div>
);

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
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue } =
    useForm<UpdateProfileForm>();

  const currentUser = user || initialUser;

  useEffect(() => {
    if (currentUser) {
      setValue("full_name", currentUser.full_name);
      setValue("phone", currentUser.phone || "");
    }
  }, [currentUser, setValue]);

  const onSubmit = async (data: UpdateProfileForm) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const updatedUser = await userService.updateUser(currentUser.id, data);
      updateUser(updatedUser);
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
        <div className="relative group">
            <Avatar className="h-16 w-16">
            <AvatarImage
                src={currentUser.avatar_url || ""}
                alt={currentUser.full_name}
            />
            <AvatarFallback>
                <UserIcon size={32} />
            </AvatarFallback>
            </Avatar>
            <label 
                htmlFor="avatar-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
                <span className="text-white text-xs font-medium">Đổi ảnh</span>
                 <input 
                    id="avatar-upload"
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            try {
                                toast.info("Đang tải lên...");
                                const url = await userService.uploadAvatar(currentUser.id, file);
                                updateUser({ ...currentUser, avatar_url: url });
                                toast.success("Đổi ảnh đại diện thành công!");
                            } catch (error) {
                                toast.error("Lỗi khi tải ảnh lên.");
                            }
                        }
                    }}
                 />
            </label>
        </div>
        
        <div>
          <CardTitle className="text-2xl">{currentUser.full_name}</CardTitle>
          <p className="text-muted-foreground">{currentUser.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
             <Button variant="outline" onClick={() => document.getElementById("change-password-dialog")?.click()}>
                Đổi mật khẩu
             </Button>
             {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                </Button>
            )}
        </div>
       
        <ChangePasswordDialog userId={currentUser.id} />

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

        {currentUser.role === "instructor" && (
          <InstructorProfileSection instructorId={currentUser.id} />
        )}
      </CardContent>
    </Card>
  );
}

function ChangePasswordDialog({ userId }: { userId: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordForm>();

    const onSubmit = async (data: ChangePasswordForm) => {
        try {
            if (data.new_password !== data.confirm_new_password) {
                toast.error("Mật khẩu xác nhận không khớp.");
                return;
            }
            await userService.changePassword(userId, data);
            toast.success("Đổi mật khẩu thành công!");
            setIsOpen(false);
            reset();
        } catch (error) {
             toast.error(error instanceof Error ? error.message : "Thất bại.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <button id="change-password-dialog" className="hidden"></button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Đổi mật khẩu</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                     <div className="space-y-2">
                        <Label>Mật khẩu hiện tại</Label>
                        <Input type="password" {...register("current_password", { required: true })} />
                    </div>
                     <div className="space-y-2">
                        <Label>Mật khẩu mới</Label>
                        <Input type="password" {...register("new_password", { required: true, minLength: 6 })} />
                         {errors.new_password && <span className="text-xs text-red-500">Tối thiểu 6 ký tự</span>}
                    </div>
                     <div className="space-y-2">
                        <Label>Xác nhận mật khẩu mới</Label>
                        <Input type="password" {...register("confirm_new_password", { required: true })} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

const InstructorProfileSection = ({
  instructorId,
}: {
  instructorId: number;
}) => {
  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Hồ sơ giảng viên</h3>
      <p className="text-muted-foreground">
        (Đây là khu vực để hiển thị và chỉnh sửa bio, kinh nghiệm, học vấn...)
      </p>
    </div>
  );
};
