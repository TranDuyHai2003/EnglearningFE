import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Course } from "@/lib/types";
import { adminService } from "@/lib/api/adminService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

export function PendingCoursesTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getPendingCourses();
      setCourses(res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (isLoading) return <div>Đang tải...</div>;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Khóa học</TableHead>
            <TableHead>Giảng viên</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Không có khóa học nào đang chờ duyệt
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow key={course.course_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {course.thumbnail_url && (
                        <div className="relative w-16 h-9 rounded overflow-hidden">
                            <Image src={getImageUrl(course.thumbnail_url)} alt={course.title} fill className="object-cover" unoptimized={true} />
                        </div>
                    )}
                    <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.level}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {course.instructor?.avatar_url && (
                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                            <Image src={getImageUrl(course.instructor.avatar_url)} alt={course.instructor.full_name} fill className="object-cover" unoptimized={true} />
                        </div>
                    )}
                    <span>{course.instructor?.full_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(course.created_at).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/admin/courses/${course.course_id}`)}>
                    <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
