import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getImageUrl } from "@/lib/utils";
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
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsTabProps {
  course: Course;
  onUpdate: () => void;
}

export function SettingsTab({ course, onUpdate }: SettingsTabProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
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
    <div className="space-y-6">
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
                    src={getImageUrl(course.thumbnail_url)}
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

      {course.approval_status !== "approved" && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Xóa khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Hành động này không thể hoàn tác. Khóa học sẽ bị xóa vĩnh viễn khỏi hệ thống.
              Bạn chỉ có thể hủy các khóa học chưa được duyệt.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? "Đang xóa..." : "Xóa khóa học này"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Khóa học <strong className="text-foreground">{course.title}</strong> sẽ bị xóa vĩnh viễn cùng với toàn bộ bài học và tài liệu liên quan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                    onClick={async (e) => {
                      e.preventDefault(); // Prevent auto-close to handle async
                      setIsDeleting(true);
                       try {
                        await courseService.deleteCourse(course.course_id);
                        toast.success("Đã xóa khóa học thành công.");
                        router.push("/instructor/my-courses");
                      } catch (error: any) {
                        toast.error(error.message || "Xóa khóa học thất bại.");
                        setIsDeleting(false);
                      }
                    }}
                  >
                    Xóa ngay
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
