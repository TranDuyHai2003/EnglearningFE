"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { adminService } from "@/lib/api/adminService";
import { SystemSetting } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";

const SettingsSkeleton = () => (
  // Sửa lại skeleton để khớp với số cột
  <TableBody>
    {[...Array(3)].map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        <TableCell>
          <Skeleton className="h-5 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-48" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-full" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-8 w-8 ml-auto" />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

export default function AdminSettingsPage() {
  const { register, handleSubmit, reset } = useForm<{
    key: string;
    value: string;
    description: string;
  }>();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.listSettings();
      setSettings(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tải cài đặt."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = async (data: {
    key: string;
    value: string;
    description: string;
  }) => {
    setIsMutating(true);
    try {
      await adminService.upsertSetting(data.key, data.value, data.description);
      toast.success("Cài đặt đã được lưu.");
      fetchSettings();
      reset({ key: "", value: "", description: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lưu thất bại.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Bạn có chắc muốn xóa cài đặt "${key}"?`)) return;
    setIsMutating(true);
    try {
      await adminService.deleteSetting(key);
      toast.success("Cài đặt đã được xóa.");
      fetchSettings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Xóa thất bại.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cài đặt hệ thống</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 border rounded-lg bg-card"
      >
        <Input
          {...register("key")}
          placeholder="Key"
          required
          disabled={isMutating}
        />
        <Input
          {...register("value")}
          placeholder="Value"
          disabled={isMutating}
        />
        <Input
          {...register("description")}
          placeholder="Mô tả"
          className="md:col-span-2"
          disabled={isMutating}
        />
        <Button type="submit" disabled={isMutating} className="md:col-start-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          {isMutating ? "Đang lưu..." : "Thêm/Cập nhật"}
        </Button>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          {isLoading ? (
            // ✅ SỬA LỖI Ở ĐÂY: Dùng component Skeleton riêng
            <SettingsSkeleton />
          ) : (
            <TableBody>
              {settings?.length > 0 ? (
                settings.map((setting) => (
                  <TableRow key={setting.setting_id}>
                    <TableCell className="font-mono">
                      {setting.setting_key}
                    </TableCell>
                    <TableCell>{setting.setting_value}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {setting.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(setting.setting_key)}
                        disabled={isMutating}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Không có cài đặt nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}
