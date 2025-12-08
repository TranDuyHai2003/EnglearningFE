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

        if (role.includes("admin")) {
          router.replace("/admin/dashboard");
        } else {
          router.replace(`/${role}/dashboard`);
        }
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
    <div className="w-full p-2 flex flex-col justify-center">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-900">Chào mừng trở lại</h2>
        <p className="mt-1 text-sm text-gray-600">
          Đăng nhập để tiếp tục học tập
        </p>
      </div>

      <Alert className="mb-3 p-2 text-xs border-blue-200 bg-blue-50">
        <AlertDescription className="text-gray-700">
          <p className="font-semibold mb-1 text-gray-900">Tài khoản demo:</p>
          <ul className="space-y-0.5">
            <li>👨‍🎓 student@gmail.com / password</li>
            <li>👨‍🏫 teacher@gmail.com / password</li>
            <li>⚙️ sysadmin@englearning.test / Password123!</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-semibold">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="example@gmail.com"
                      type="email"
                      className="pl-9 h-9 text-sm"
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            rules={{ required: "Mật khẩu không được để trống." }}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-semibold">
                  Mật khẩu
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="••••••••"
                      type="password"
                      className="pl-9 h-9 text-sm"
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-500"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
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

      <div className="my-2 text-center text-xs text-gray-500">
        Chưa có tài khoản?
      </div>

      <Link
        href={`/register${redirectQuery ? `?redirect=${redirectQuery}` : ""}`}
        className="block w-full text-center py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100"
      >
        Đăng ký tài khoản mới
      </Link>
    </div>
  );
}
