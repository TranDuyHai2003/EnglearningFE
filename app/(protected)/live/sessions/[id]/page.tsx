"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { liveSessionService } from "@/lib/api/liveSessionService";
import { LiveSession } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";

const SessionDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth({ redirectToLoginIfFail: true });
  const sessionId = Number(params.id);

  const [session, setSession] = useState<LiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchSession = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const detail = await liveSessionService.getSession(sessionId);
      setSession(detail);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông tin buổi học");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const isRegistered = session?.registrations?.some(
    (reg) => reg.student_id === (user?.id || user?.user_id)
  );

  const handleRegister = async () => {
    if (!session) return;
    setIsRegistering(true);
    try {
      await liveSessionService.register(session.session_id);
      toast.success("Đăng ký thành công!");
      await fetchSession();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Không thể đăng ký");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleJoin = () => {
    if (!session?.meeting_link) {
      toast.error("Buổi học chưa có phòng trực tuyến.");
      return;
    }
    router.push(session.meeting_link);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Không tìm thấy buổi học
          </CardContent>
        </Card>
      </div>
    );
  }

  const start = new Date(session.scheduled_start);
  const end = new Date(session.scheduled_end);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CardTitle>{session.title}</CardTitle>
              <Badge variant="secondary">
                {session.session_type === "one_on_one"
                  ? "1:1 Coaching"
                  : session.session_type === "group"
                  ? "Nhóm nhỏ"
                  : "Webinar"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(start, "EEEE, dd/MM/yyyy")} •{" "}
              {format(start, "HH:mm")} - {format(end, "HH:mm")}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {session.description && (
            <div>
              <p className="font-semibold mb-1">Giới thiệu</p>
              <p className="text-sm text-muted-foreground">
                {session.description}
              </p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Giảng viên</p>
              <p className="font-medium">
                {session.instructor?.full_name || "Chưa cập nhật"}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Sức chứa</p>
              <p className="font-medium">
                {session.capacity > 0
                  ? `${session.registrations?.length || 0}/${session.capacity}`
                  : "Không giới hạn"}
              </p>
            </div>
          </div>
          {session.course?.title && (
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Khóa học</p>
              <p className="font-medium">{session.course.title}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={isRegistered}
              onClick={handleRegister}
              variant={isRegistered ? "secondary" : "default"}
            >
              {isRegistered ? "Bạn đã đăng ký" : "Đăng ký tham gia"}
            </Button>
            <Button onClick={handleJoin} variant="outline">
              Vào phòng trực tuyến
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {session.registrations?.length ? (
              session.registrations.map((registration) => (
                <div
                  key={registration.registration_id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {registration.student?.full_name || "Học viên"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Trạng thái: {registration.attendance_status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có học viên nào đăng ký.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionDetailPage;
