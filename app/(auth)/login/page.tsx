"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
// ❌ Không cần import Zod
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
import { LogIn, Loader2 } from "lucide-react";
import { LoginRequest } from "@/lib/types";

type LoginFormData = LoginRequest;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

      const { role } = authData.user;
      if (role === "student") {
        router.replace("/student/dashboard");
      } else if (role === "instructor") {
        router.replace("/instructor/dashboard");
      } else {
        router.replace("/admin/dashboard");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
        Đăng nhập
      </h2>

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-700">
          <p className="font-medium mb-2">Sử dụng các tài khoản sau:</p>
          <p>👨‍🎓 Student: student@gmail.com / password</p>
          <p>👨‍🏫 Instructor: teacher@gmail.com / password</p>
          <p>⚙️ SysAdmin: sysadmin@englearning.test / Password123!</p>
          <p>⚙️ SupAdmin: support@englearning.test / Password123!</p>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            // ✅ Thêm rules validation
            rules={{
              required: "Email không được để trống.",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Email không hợp lệ.",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your@email.com"
                    type="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            rules={{
              required: "Mật khẩu không được để trống.",
              minLength: { value: 1, message: "Vui lòng nhập mật khẩu." },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
              </>
            )}
          </Button>
        </form>
      </Form>

      <p className="text-center mt-6 text-sm text-gray-600">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="text-blue-600 hover:underline font-medium"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
