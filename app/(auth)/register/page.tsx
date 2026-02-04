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
import { UserPlus, Loader2, Mail, Lock, User, Briefcase } from "lucide-react";
import { RegisterRequest } from "@/lib/types";

type RegisterFormData = RegisterRequest;

import { Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role: "student",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const authData = await authService.register(data);
      setAuthData(authData.token, authData.user);
      toast.success(`Đăng ký thành công! Chào ${authData.user.full_name}`);

      const redirectUrl = searchParams.get("redirect");

      if (redirectUrl) {
        router.replace(redirectUrl);
      } else {
        router.replace(`/${authData.user.role}/dashboard`);
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const redirectQuery = searchParams.get("redirect");

  return (
    <div className="w-full h-full overflow-auto p-4 flex flex-col justify-center">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Bắt đầu hành trình</h2>
        <p className="mt-1 text-base text-gray-600">
          Tạo tài khoản để bắt đầu học tập
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            rules={{
              required: "Họ tên không được để trống.",
              minLength: {
                value: 3,
                message: "Họ tên phải có ít nhất 3 ký tự.",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Họ và tên
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Nguyễn Văn A"
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

          <FormField
            control={form.control}
            name="email"
            rules={{
              required: "Email không được để trống.",
              pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ." },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="example@gmail.com"
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
                <FormLabel className="text-sm font-semibold">
                  Mật khẩu
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
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

          <FormField
            control={form.control}
            name="role"
            rules={{ required: "Vui lòng chọn vai trò." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Vai trò</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <SelectTrigger className="pl-10 h-10">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </div>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="student">👨‍🎓 Tôi là học viên</SelectItem>
                    <SelectItem value="instructor">
                      👨‍🏫 Tôi là giảng viên
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng ký...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Đăng ký
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="my-4 text-center text-sm text-gray-500">
        Đã có tài khoản?
      </div>

      <Link
        href={`/login${redirectQuery ? `?redirect=${redirectQuery}` : ""}`}
        className="block w-full text-center py-2 rounded-lg border border-blue-300 bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100"
      >
        Đăng nhập ngay
      </Link>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
