"use client";

import { useEffect, useMemo, useState } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { liveSessionService } from "@/lib/api/liveSessionService";
import { LiveSession } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";

const formatHourRange = (session: LiveSession) => {
  const start = new Date(session.scheduled_start);
  const end = new Date(session.scheduled_end);
  return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
};

const LiveSessionsPage = () => {
  const { user, isLoading: authLoading } = useAuth({
    redirectToLoginIfFail: true,
  });
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const from = weekStart.toISOString();
      const to = addDays(weekStart, 6).toISOString();
      const result = await liveSessionService.listSessions({
        from,
        to,
        limit: 200,
      });
      setSessions(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải lịch học trực tiếp");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => addDays(weekStart, idx));
  }, [weekStart]);

  const sessionsByDay = useMemo(() => {
    const groups: Record<string, LiveSession[]> = {};
    sessions.forEach((session) => {
      const key = format(new Date(session.scheduled_start), "yyyy-MM-dd");
      if (!groups[key]) groups[key] = [];
      groups[key].push(session);
    });
    Object.keys(groups).forEach((key) =>
      groups[key].sort(
        (a, b) =>
          new Date(a.scheduled_start).getTime() -
          new Date(b.scheduled_start).getTime()
      )
    );
    return groups;
  }, [sessions]);

  const isSessionFull = (session: LiveSession) => {
    if (!session.capacity || session.capacity <= 0) return false;
    return (
      (session.registrations?.filter(
        (reg) => reg.attendance_status !== "absent"
      ).length || 0) >= session.capacity
    );
  };

  const isAlreadyRegistered = (session: LiveSession, userId?: number) => {
    if (!userId) return false;
    return session.registrations?.some(
      (reg) => reg.student_id === userId
    );
  };

  const handleRegister = async (sessionId: number) => {
    try {
      await liveSessionService.register(sessionId);
      toast.success("Đặt chỗ thành công!");
      await fetchSessions();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Không thể đặt chỗ."
      );
    }
  };

  const headerTitle = `${format(weekStart, "dd/MM/yyyy")} - ${format(
    addDays(weekStart, 6),
    "dd/MM/yyyy"
  )}`;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lịch học trực tiếp</h1>
          <p className="text-muted-foreground">
            Đặt chỗ các buổi học nhóm hoặc 1:1 với giảng viên.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setWeekStart(subWeeks(weekStart, 1))}
          >
            ⟵ Tuần trước
          </Button>
          <Button
            variant="outline"
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
          >
            Tuần sau ⟶
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tuần: {headerTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dailySessions = sessionsByDay[key] || [];
              return (
                <div key={key} className="rounded-lg border bg-card">
                  <div className="border-b px-3 py-2">
                    <p className="text-sm font-semibold">
                      {format(day, "EEE", { locale: undefined })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(day, "dd/MM")}
                    </p>
                  </div>
                  <div className="p-3 space-y-3">
                    {dailySessions.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Không có buổi học
                      </p>
                    )}
                    {dailySessions.map((session) => {
                      const registered = isAlreadyRegistered(
                        session,
                        user?.id || user?.user_id
                      );
                      return (
                        <div
                          key={session.session_id}
                          className="rounded-md border bg-background p-2 space-y-2"
                        >
                          <div>
                            <p className="font-medium text-sm leading-tight">
                              {session.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatHourRange(session)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center text-xs">
                            <Badge variant="secondary">
                              {session.session_type === "one_on_one"
                                ? "1:1 Coaching"
                                : session.session_type === "group"
                                ? "Nhóm nhỏ"
                                : "Webinar"}
                            </Badge>
                            {session.capacity > 0 && (
                              <span className="text-muted-foreground">
                                {session.registrations?.length || 0}/
                                {session.capacity}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" asChild size="sm">
                              <Link
                                href={`/live/sessions/${session.session_id}`}
                              >
                                Chi tiết
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              disabled={
                                registered ||
                                isSessionFull(session) ||
                                authLoading
                              }
                              onClick={() =>
                                handleRegister(session.session_id)
                              }
                            >
                              {registered ? "Đã đặt chỗ" : "Đặt chỗ"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Danh sách buổi học</h2>
          <p className="text-sm text-muted-foreground">
            {sessions.length} buổi học trong tuần này
          </p>
        </div>
        <div className="space-y-4">
          {sessions.map((session) => {
            const registered = isAlreadyRegistered(
              session,
              user?.id || user?.user_id
            );
            return (
              <Card key={session.session_id}>
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium">{session.title}</p>
                      <Badge>
                        {session.session_type === "one_on_one"
                          ? "1:1"
                          : session.session_type === "group"
                          ? "Nhóm"
                          : "Webinar"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.scheduled_start), "dd/MM/yyyy")} •{" "}
                      {formatHourRange(session)}
                    </p>
                    {session.course?.title && (
                      <p className="text-sm text-muted-foreground">
                        Khóa học: {session.course.title}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/live/sessions/${session.session_id}`}>
                        Xem chi tiết
                      </Link>
                    </Button>
                    <Button
                      disabled={registered || isSessionFull(session)}
                      onClick={() => handleRegister(session.session_id)}
                    >
                      {registered
                        ? "Bạn đã đăng ký"
                        : isSessionFull(session)
                        ? "Đã đầy"
                        : "Đặt chỗ"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {sessions.length === 0 && !isLoading && (
            <div className="rounded-lg border p-6 text-center text-muted-foreground">
              Tuần này chưa có buổi học nào.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LiveSessionsPage;
