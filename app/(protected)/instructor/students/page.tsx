"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { instructorService } from "@/lib/api/instructorService";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await instructorService.getDashboardSummary();

        setStudents(data.recent_enrollments || []);
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Danh sách học viên</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tất cả học viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead>Ngày đăng ký</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((enrollment: any) => (
                  <TableRow key={enrollment.enrollment_id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={enrollment.student.avatar_url} />
                        <AvatarFallback>
                          {enrollment.student.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {enrollment.student.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.student.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{enrollment.course.title}</TableCell>
                    <TableCell>
                      {format(new Date(enrollment.enrolled_at), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Chưa có học viên nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
