"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { liveSessionService } from "@/lib/api/liveSessionService";
import { LiveSession } from "@/lib/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { format } from "date-fns";

interface SessionFormValues {
  title: string;
  description?: string;
  course_id?: string;
  session_type: string;
  scheduled_start: string;
  scheduled_end: string;
  capacity?: number;
}

const InstructorLiveSessionsPage = () => {
  const { user, isLoading: authLoading } = useAuth({
    redirectToLoginIfFail: true,
  });
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SessionFormValues>({
    defaultValues: {
      title: "",
      description: "",
      course_id: "",
      session_type: "group",
      scheduled_start: "",
      scheduled_end: "",
      capacity: 10,
    },
  });

  const fetchSessions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await liveSessionService.listSessions({
        instructor_id: user.id || user.user_id,
        limit: 100,
      });
      setSessions(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách buổi học.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = async (values: SessionFormValues) => {
    if (!values.scheduled_start || !values.scheduled_end) {
      toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc.");
      return;
    }

    const startISO = new Date(values.scheduled_start).toISOString();
    const endISO = new Date(values.scheduled_end).toISOString();

    setIsSubmitting(true);
    try {
      await liveSessionService.createSession({
        title: values.title,
        description: values.description,
        course_id: values.course_id ? Number(values.course_id) : undefined,
        session_type: values.session_type,
        scheduled_start: startISO,
        scheduled_end: endISO,
        capacity: values.capacity ? Number(values.capacity) : undefined,
      });
      toast.success("Tạo buổi học thành công!");
      form.reset({
        title: "",
        description: "",
        course_id: "",
        session_type: values.session_type,
        scheduled_start: "",
        scheduled_end: "",
        capacity: values.capacity ?? 10,
      });
      fetchSessions();
    } catch (error) {
      console.error(error);
      toast.error("Không thể tạo buổi học.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const upcomingSessions = useMemo(() => {
    return sessions
      .slice()
      .sort(
        (a, b) =>
          new Date(a.scheduled_start).getTime() -
          new Date(b.scheduled_start).getTime()
      );
  }, [sessions]);

  const isInstructor =
    user?.role === "instructor" || user?.role === "system_admin";

  if (!authLoading && !isInstructor) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Bạn không có quyền truy cập trang này.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Quản lý buổi học trực tiếp</h1>
        <p className="text-muted-foreground">
          Tạo và quản lý các buổi coaching nhóm hoặc 1:1 cho học viên.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tạo buổi học mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input
                placeholder="VD: Luyện nói chủ đề du lịch"
                {...form.register("title", { required: true })}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea
                rows={3}
                placeholder="Nội dung chính của buổi học..."
                {...form.register("description")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Khóa học liên quan</label>
              <Input
                type="number"
                placeholder="Nhập ID khóa học (nếu có)"
                {...form.register("course_id")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại buổi học</label>
              <Select
                value={form.watch("session_type")}
                onValueChange={(value) =>
                  form.setValue("session_type", value, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">Nhóm nhỏ</SelectItem>
                  <SelectItem value="one_on_one">1:1 Coaching</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bắt đầu</label>
              <Input
                type="datetime-local"
                {...form.register("scheduled_start", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kết thúc</label>
              <Input
                type="datetime-local"
                {...form.register("scheduled_end", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sức chứa</label>
              <Input
                type="number"
                min={1}
                placeholder="10"
                {...form.register("capacity", { valueAsNumber: true })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo..." : "Tạo buổi học"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Buổi học của tôi</h2>
          <p className="text-sm text-muted-foreground">
            {upcomingSessions.length} buổi học sắp tới
          </p>
        </div>
        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Đang tải...
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <Card key={session.session_id}>
                <CardContent className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{session.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.scheduled_start), "dd/MM/yyyy HH:mm")}{" "}
                      - {format(new Date(session.scheduled_end), "HH:mm")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.session_type === "one_on_one"
                        ? "1:1"
                        : session.session_type === "group"
                        ? "Nhóm"
                        : "Webinar"}
                      {" • "}
                      {session.capacity > 0
                        ? `${session.registrations?.length || 0}/${session.capacity} học viên`
                        : "Không giới hạn"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        toast.info(
                          session.meeting_link
                            ? `Link phòng: ${session.meeting_link}`
                            : "Buổi học chưa có link."
                        )
                      }
                    >
                      Copy link phòng
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!upcomingSessions.length && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Chưa có buổi học nào.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default InstructorLiveSessionsPage;
