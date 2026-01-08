import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare, Star, BookOpen, Bell, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: any;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClose?: () => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onClose,
}: NotificationItemProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div
      className={cn(
        "p-4 hover:bg-muted/50 transition-colors cursor-pointer group relative",
        !notification.is_read && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
      onClick={() => {
        if (!notification.is_read) {
          onMarkRead(notification.notification_id);
        }
        setIsExpanded(!isExpanded);
      }}
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
          <p className="font-medium text-sm mb-1">{notification.title}</p>
          <p
            className={cn(
              "text-sm text-muted-foreground whitespace-pre-line",
              !isExpanded && "line-clamp-2"
            )}
          >
            {notification.content || notification.message}
          </p>
          
          <div className="flex justify-between items-center mt-2">
             <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: vi,
                })}
            </p>
            {notification.link && isExpanded && (
                <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 text-xs text-blue-600 hover:text-blue-800 p-0 hover:bg-transparent"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(notification.link);
                        onClose?.();
                    }}
                >
                    Xem chi tiết <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.notification_id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
