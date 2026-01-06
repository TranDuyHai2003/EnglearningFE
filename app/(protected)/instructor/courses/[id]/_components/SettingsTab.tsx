import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Course } from "@/lib/types";
import { courseService } from "@/lib/api/courseService";
import { toast } from "sonner";

interface SettingsTabProps {
  course: Course;
  onUpdate: () => void;
}

export function SettingsTab({ course, onUpdate }: SettingsTabProps) {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description || "",
    price: course.price,
    level: course.level,
    language: course.language,
  });
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    setUploading(true);
    try {
      import("@/lib/api/instructorService").then(async (mod) => {
          await mod.instructorService.uploadCourseThumbnail(course.course_id, file);
          toast.success("Tải ảnh bìa thành công!");
          onUpdate();
      });
    } catch (error) {
      toast.error("Tải ảnh bìa thất bại.");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await courseService.updateCourse(course.course_id, {
        ...formData,
        price: Number(formData.price),
      });
      toast.success("Cập nhật khóa học thành công!");
      onUpdate();
    } catch (error) {
      toast.error("Cập nhật thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cài đặt khóa học</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Ảnh bìa khóa học</Label>
            <div className="flex flex-col gap-4">
               {course.thumbnail_url && (
                <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnail_url.startsWith("http") ? course.thumbnail_url : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${course.thumbnail_url.startsWith("/") ? "" : "/"}${course.thumbnail_url}`}
                    alt="Course thumbnail"
                    className="object-cover w-full h-full"
                  />
                </div>
               )}
               <div className="flex items-center gap-2">
                 <Input
                   type="file"
                   accept="image/*"
                   onChange={handleThumbnailUpload}
                   disabled={uploading}
                   className="w-full max-w-sm"
                 />
                 {uploading && <span className="text-sm text-muted-foreground">Đang tải lên...</span>}
               </div>
               <p className="text-xs text-muted-foreground">
                 Định dạng hỗ trợ: JPG, PNG. Kích thước khuyến nghị: 1280x720.
               </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tên khóa học</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VND)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Cấp độ</Label>
                <Select
                  value={formData.level}
                  onValueChange={(val) => handleSelectChange("level", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Cơ bản</SelectItem>
                    <SelectItem value="intermediate">Trung bình</SelectItem>
                    <SelectItem value="advanced">Nâng cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Ngôn ngữ</Label>
                <Select
                  value={formData.language}
                  onValueChange={(val) => handleSelectChange("language", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngôn ngữ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">Tiếng Anh</SelectItem>
                    <SelectItem value="Vietnamese">Tiếng Việt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
