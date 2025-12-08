"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageSquare,
  Star,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications", {
        params: {
          page,
          limit: 20,
          is_read: filter === "unread" ? false : undefined,
        },
      });
      setNotifications(response.data.data || []);
      setTotalPages(response.data.meta?.total_pages || 1);
    } catch (error: any) {
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error: any) {
      toast.error("Không thể đánh dấu đã đọc");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      toast.success("Đã đánh dấu tất cả là đã đọc");
      fetchNotifications();
    } catch (error: any) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      toast.success("Đã xóa thông báo");
      fetchNotifications();
    } catch (error: any) {
      toast.error("Không thể xóa");
    }
  };

  const handleClick = async (notification: any) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.notification_id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "discussion":
      case "reply":
        return <MessageSquare className="h-5 w-5" />;
      case "review":
        return <Star className="h-5 w-5" />;
      case "lesson_approved":
      case "lesson_rejected":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Thông báo</h1>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            Tất cả
            {notifications.length > 0 && ` (${notifications.length})`}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Chưa đọc
            {unreadCount > 0 && ` (${unreadCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "Không có thông báo chưa đọc"
                  : "Không có thông báo"}
              </p>
            </Card>
          ) : (
            <>
              {notifications.map((notification) => (
                <Card
                  key={notification.notification_id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors cursor-pointer group",
                    !notification.is_read &&
                      "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                  )}
                  onClick={() => handleClick(notification)}
                >
                  <div className="flex gap-4">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0",
                        !notification.is_read
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.notification_id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          {
                            addSuffix: true,
                            locale: vi,
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Trước
                  </Button>
                  <span className="flex items-center px-4">
                    Trang {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
