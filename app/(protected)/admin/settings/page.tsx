"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/lib/api/adminService";
import { SystemSetting } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Settings } from "lucide-react";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(
    null
  );

  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
  });

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.listSettings();
      setSettings(data);
    } catch (error) {
      toast.error("Không thể tải cài đặt hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleOpenDialog = (setting?: SystemSetting) => {
    if (setting) {
      setEditingSetting(setting);
      setFormData({
        key: setting.setting_key,
        value: setting.setting_value || "",
        description: setting.description || "",
      });
    } else {
      setEditingSetting(null);
      setFormData({ key: "", value: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.key) {
      toast.error("Vui lòng nhập Key.");
      return;
    }

    setIsSaving(true);
    try {
      await adminService.upsertSetting(
        formData.key,
        formData.value,
        formData.description
      );
      toast.success(
        editingSetting ? "Cập nhật thành công!" : "Thêm mới thành công!"
      );
      setIsDialogOpen(false);
      fetchSettings();
    } catch (error: any) {
      toast.error(error.message || "Lưu thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa cài đặt này?")) return;
    try {
      await adminService.deleteSetting(key);
      toast.success("Xóa thành công!");
      fetchSettings();
    } catch (error: any) {
      toast.error(error.message || "Xóa thất bại.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Cấu hình Hệ thống
          </h1>
          <p className="text-muted-foreground">
            Quản lý các tham số hệ thống (Email, Thanh toán, v.v.).
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm cấu hình
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Key</TableHead>
              <TableHead className="w-[300px]">Value</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-[100px] text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : settings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Chưa có cấu hình nào.
                </TableCell>
              </TableRow>
            ) : (
              settings.map((setting) => (
                <TableRow key={setting.setting_key}>
                  <TableCell className="font-mono font-medium">
                    {setting.setting_key}
                  </TableCell>
                  <TableCell
                    className="truncate max-w-[300px]"
                    title={setting.setting_value || ""}
                  >
                    {setting.setting_value}
                  </TableCell>
                  <TableCell>{setting.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(setting)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(setting.setting_key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSetting ? "Cập nhật Cấu hình" : "Thêm Cấu hình Mới"}
            </DialogTitle>
            <DialogDescription>
              Lưu ý: Thay đổi cấu hình có thể ảnh hưởng đến hoạt động của hệ
              thống.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Key (Mã tham số)</label>
              <Input
                placeholder="VD: STRIPE_PUBLIC_KEY"
                value={formData.key}
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value })
                }
                disabled={!!editingSetting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Value (Giá trị)</label>
              <Textarea
                placeholder="Nhập giá trị..."
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Input
                placeholder="Mô tả ý nghĩa của tham số này"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
