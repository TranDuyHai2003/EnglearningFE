"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";
import { authService } from "@/lib/api/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
      toast.success("Đã gửi yêu cầu thành công!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full p-4 flex flex-col justify-center">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h2>
        <p className="mt-2 text-sm text-gray-600">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200">
          <p className="font-medium">Đã gửi yêu cầu!</p>
          <p className="text-sm mt-1">
            Vui lòng kiểm tra <strong>Server Console</strong> (vì đây là bản Demo) để lấy link reset mật khẩu.
          </p>
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="name@example.com"
              {...register("email", { required: "Vui lòng nhập email" })}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gửi liên kết
          </Button>
          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
