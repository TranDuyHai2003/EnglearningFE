"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import api from "@/lib/api/apiClient";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { NotificationItem } from "./NotificationItem";

interface NotificationDropdownProps {
  onUpdate?: () => void;
  onClose?: () => void;
}

export function NotificationDropdown({
  onUpdate,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();
  const { user } = useAuth();
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

      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Không có thông báo mới</p>
          </div>
        ) : (
          <div className="divide-y max-h-[400px]">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.notification_id}
                notification={notification}
                onMarkRead={handleMarkAsRead}
                onDelete={handleDelete}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {notifications.length > 0 && (
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              const targetPath =
                user?.role === "instructor"
                  ? "/instructor/notifications"
                  : "/student/notifications";
              router.push(targetPath);
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
