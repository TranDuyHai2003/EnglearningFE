"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/lib/api/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ChangePasswordForm } from "@/lib/types";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ChangePasswordForm) => {
    if (!token) {
        toast.error("Token không hợp lệ.");
        return;
    }
    if (data.new_password !== data.confirm_new_password) {
        toast.error("Mật khẩu xác nhận không khớp.");
        return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, data.new_password);
      toast.success("Đặt lại mật khẩu thành công!");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
      return (
          <div className="text-center text-red-500 p-4">
              Không tìm thấy token đặt lại mật khẩu. Vui lòng kiểm tra lại link.
          </div>
      )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Mật khẩu mới</label>
        <Input
          type="password"
          {...register("new_password", { required: "Bắt buộc", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } })}
        />
        {errors.new_password && (
          <p className="text-xs text-red-500">{errors.new_password.message}</p>
        )}
      </div>
      <div className="space-y-2">
         <label className="text-sm font-medium">Xác nhận mật khẩu</label>
         <Input
           type="password"
           {...register("confirm_new_password", { required: "Bắt buộc" })}
         />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Đặt lại mật khẩu
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
    return (
        <div className="w-full h-full p-4 flex flex-col justify-center">
             <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Nhập mật khẩu mới của bạn.
                </p>
            </div>
            
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
                <ResetPasswordForm />
            </Suspense>
            <div className="text-center text-sm mt-4">
                <Link href="/login" className="text-primary hover:underline">
                Quay lại đăng nhập
                </Link>
            </div>
        </div>
    )
}
