"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageSquare,
  Star,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  onUpdate?: () => void;
  onClose?: () => void;
}

export function NotificationDropdown({
  onUpdate,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications", {
        params: { limit: 10 },
      });
      setNotifications(response.data.data || []);
    } catch (error: any) {
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      fetchNotifications();
      onUpdate?.();
    } catch (error: any) {
      toast.error("Không thể đánh dấu đã đọc");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      toast.success("Đã đánh dấu tất cả là đã đọc");
      fetchNotifications();
      onUpdate?.();
    } catch (error: any) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      toast.success("Đã xóa thông báo");
      fetchNotifications();
      onUpdate?.();
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
      onClose?.();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "discussion":
      case "reply":
        return <MessageSquare className="h-4 w-4" />;
      case "review":
        return <Star className="h-4 w-4" />;
      case "lesson_approved":
      case "lesson_rejected":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Thông báo</h3>
        {notifications.some((n) => !n.is_read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="mr-1 h-3 w-3" />
            Đánh dấu tất cả
          </Button>
        )}
      </div>

      {/* Notifications */}
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Không có thông báo mới</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.notification_id}
                className={cn(
                  "p-4 hover:bg-muted/50 transition-colors cursor-pointer group",
                  !notification.is_read && "bg-blue-50/50 dark:bg-blue-950/20"
                )}
                onClick={() => handleClick(notification)}
              >
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                      !notification.is_read
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-1">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  </div>
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
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              router.push("/notifications");
              onClose?.();
            }}
          >
            Xem tất cả thông báo
          </Button>
        </div>
      )}
    </div>
  );
}
