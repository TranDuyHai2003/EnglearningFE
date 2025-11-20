"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { authService } from "@/lib/api/authService";
import { setAuthData } from "@/lib/auth/utils";
import { LogIn, Loader2, Mail, Lock } from "lucide-react";
import { LoginRequest } from "@/lib/types";

type LoginFormData = LoginRequest;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const authData = await authService.login(data);
      setAuthData(authData.token, authData.user);
      toast.success(`Đăng nhập thành công! Chào ${authData.user.full_name}`);

      const redirectUrl = searchParams.get("redirect");

      if (redirectUrl) {
        router.replace(redirectUrl);
      } else {
        const { role } = authData.user;
        // ===== THAY ĐỔI LOGIC Ở ĐÂY =====
        if (role.includes("admin")) {
          router.replace("/admin/dashboard");
        } else {
          // Điều hướng cho student, instructor như cũ
          router.replace(`/${role}/dashboard`);
        }
        // ===== KẾT THÚC THAY ĐỔI =====
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectQuery = searchParams.get("redirect");

  return (
    <div className="w-full h-full overflow-auto p-4 flex flex-col justify-center">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Chào mừng trở lại</h2>
        <p className="mt-1 text-base text-gray-600">
          Đăng nhập để tiếp tục học tập
        </p>
      </div>

      {/* Demo Accounts */}
      <Alert className="mb-4 p-3 text-sm border-blue-200 bg-blue-50">
        <AlertDescription className="text-gray-700">
          <p className="font-semibold mb-2 text-gray-900">Tài khoản demo:</p>
          <ul className="space-y-1">
            <li>👨‍🎓 student@gmail.com / password</li>
            <li>👨‍🏫 teacher@gmail.com / password</li>
            <li>⚙️ sysadmin@englearning.test / Password123!</li>
            <li>⚙️ support@englearning.test / Password123!</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: "Email không được để trống.",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Email không hợp lệ.",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="example@gmail.com"
                      type="email"
                      className="pl-10 h-10"
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            rules={{ required: "Mật khẩu không được để trống." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Mật khẩu
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="••••••••"
                      type="password"
                      className="pl-10 h-10"
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Đăng nhập
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="my-4 text-center text-sm text-gray-500">
        Chưa có tài khoản?
      </div>

      {/* Link */}
      <Link
        href={`/register${redirectQuery ? `?redirect=${redirectQuery}` : ""}`}
        className="block w-full text-center py-2 rounded-lg border border-blue-300 bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100"
      >
        Đăng ký tài khoản mới
      </Link>
    </div>
  );
}
