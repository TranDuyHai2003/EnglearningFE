"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
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
import { LoginRequest, ApiErrorResponse, User } from "@/lib/types";
import { setAuthData, getRoleDashboard } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log("Login form data:", data);

      // ✅ Test accounts
      let mockUser: User | null = null;

      if (data.email === "student@test.com" && data.password === "password") {
        mockUser = {
          id: 1,
          email: "student@test.com",
          full_name: "Sinh Viên",
          role: "student",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else if (
        data.email === "instructor@test.com" &&
        data.password === "password"
      ) {
        mockUser = {
          id: 2,
          email: "instructor@test.com",
          full_name: "Giảng Viên",
          role: "instructor",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else if (
        data.email === "admin@test.com" &&
        data.password === "password"
      ) {
        mockUser = {
          id: 3,
          email: "admin@test.com",
          full_name: "Admin",
          role: "admin",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      if (!mockUser) {
        toast.error("Email hoặc mật khẩu không đúng");
        return;
      }

      const mockToken = "mock_jwt_token_" + Date.now();
      setAuthData(mockUser, mockToken);

      toast.success(`Đăng nhập thành công! Chào ${mockUser.full_name}`);
      router.push(getRoleDashboard(mockUser.role));
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || "Đăng nhập thất bại";
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Đăng nhập thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
        Đăng nhập
      </h2>

      {/* ✅ Test accounts info */}
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-700">
          <p className="font-medium mb-2">Test accounts:</p>
          <p>👨‍🎓 Student: student@test.com / password</p>
          <p>👨‍🏫 Instructor: instructor@test.com / password</p>
          <p>⚙️ Admin: admin@test.com / password</p>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
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
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
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
