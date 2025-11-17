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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { authService } from "@/lib/api/authService";
import { setAuthData } from "@/lib/auth/utils";
import { UserPlus, Loader2 } from "lucide-react";
import { RegisterRequest } from "@/lib/types"; // ✅ Sử dụng RegisterRequest từ types

// ✅ Định nghĩa lại kiểu dữ liệu cho form (thay thế z.infer)
type RegisterFormData = RegisterRequest;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    // ❌ Bỏ zodResolver
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role: "student", // Mặc định là student
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const authData = await authService.register(data);
      setAuthData(authData.token, authData.user);
      toast.success(`Đăng ký thành công! Chào ${authData.user.full_name}`);

      const { role } = authData.user;
      if (role === "student") {
        router.replace("/student/dashboard");
      } else if (role === "instructor") {
        router.replace("/instructor/dashboard");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
        Đăng ký tài khoản
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            // ✅ Thêm rules validation
            rules={{
              required: "Họ tên không được để trống.",
              minLength: {
                value: 3,
                message: "Họ tên phải có ít nhất 3 ký tự.",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nguyễn Văn A"
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
              minLength: {
                value: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự.",
              },
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

          <FormField
            control={form.control}
            name="role"
            rules={{ required: "Vui lòng chọn vai trò." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bạn là?</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="student">👨‍🎓 Tôi là học viên</SelectItem>
                    <SelectItem value="instructor">
                      👨‍🏫 Tôi là giảng viên
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                Đang đăng ký...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" /> Đăng ký
              </>
            )}
          </Button>
        </form>
      </Form>

      <p className="text-center mt-6 text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="text-blue-600 hover:underline font-medium"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
