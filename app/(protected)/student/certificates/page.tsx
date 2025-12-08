"use client";

import { useEffect, useState } from "react";
import { learningService } from "@/lib/api/learningService";
import { Enrollment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Calendar, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

export default function CertificatesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await learningService.getMyEnrollments({
          status: "completed",
          limit: 100,
        });
        setEnrollments(response.data);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleDownload = async (courseId: number, courseTitle: string) => {
    try {
      const blob = await learningService.downloadCertificate(courseId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate-${courseTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Đang tải chứng chỉ...");
    } catch (error) {
      toast.error("Không thể tải chứng chỉ. Vui lòng thử lại sau.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-yellow-100 rounded-lg">
          <Award className="h-8 w-8 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chứng chỉ của tôi</h1>
          <p className="text-muted-foreground">
            Quản lý và tải xuống các chứng chỉ đã đạt được
          </p>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Award className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">Chưa có chứng chỉ nào</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Hoàn thành các khóa học để nhận chứng chỉ xác nhận kiến thức của bạn.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.enrollment_id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight min-h-[3rem]">
                  {enrollment.course.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    Đã cấp:{" "}
                    {enrollment.completed_at
                      ? format(new Date(enrollment.completed_at), "dd 'thg' MM, yyyy", {
                          locale: vi,
                        })
                      : "N/A"}
                  </span>
                </div>
                
                {/* @ts-ignore - certificate might not be in type definition yet */}
                {enrollment.certificate?.certificate_code && (
                  <div className="text-xs bg-muted p-2 rounded text-center font-mono text-muted-foreground">
                     {/* @ts-ignore */}
                    Mã: {enrollment.certificate.certificate_code}
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={() => handleDownload(enrollment.course_id, enrollment.course.title)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Tải chứng chỉ
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
