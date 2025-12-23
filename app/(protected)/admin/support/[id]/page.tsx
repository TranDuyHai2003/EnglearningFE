"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminService } from "@/lib/api/adminService";
import { SupportTicket, User } from "@/lib/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

const statusMap: Record<string, { label: string; color: string }> = {
  open: { label: "Đang mở", color: "bg-blue-100 text-blue-800" },
  in_progress: { label: "Đang xử lý", color: "bg-yellow-100 text-yellow-800" },
  resolved: { label: "Đã giải quyết", color: "bg-green-100 text-green-800" },
  closed: { label: "Đã đóng", color: "bg-gray-100 text-gray-800" },
};

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await adminService.getSupportTicketDetails(unwrappedParams.id);
      if (res.success) {
        setTicket(res.data);
      }
    } catch (error) {
      toast.error("Không thể tải thông tin ticket");
      router.push("/admin/support");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [unwrappedParams.id]);

  const handleReply = async () => {
    if (!replyText.trim()) return;

    setSendingReply(true);
    try {
      await adminService.replySupportTicket(unwrappedParams.id, replyText);
      toast.success("Đã gửi phản hồi");
      setReplyText("");
      fetchTicket();
    } catch (error) {
      toast.error("Gửi phản hồi thất bại");
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await adminService.updateSupportTicket(unwrappedParams.id, {
        status: newStatus,
      });
      toast.success("Đã cập nhật trạng thái");
      fetchTicket();
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {ticket.subject}
              </h1>
              <Badge className={statusMap[ticket.status].color} variant="secondary">
                {statusMap[ticket.status].label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Ticket #{ticket.ticket_id} • Tạo bởi{" "}
              <span className="font-medium text-foreground">
                {ticket.user?.full_name}
              </span>{" "}
              lúc {format(new Date(ticket.created_at), "HH:mm dd/MM/yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            disabled={updatingStatus}
            value={ticket.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Đang mở</SelectItem>
              <SelectItem value="in_progress">Đang xử lý</SelectItem>
              <SelectItem value="resolved">Đã giải quyết</SelectItem>
              <SelectItem value="closed">Đã đóng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Main Content: Conversation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung trao đổi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Original Request */}
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={ticket.user?.avatar_url || undefined} />
                  <AvatarFallback>
                    {ticket.user?.full_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{ticket.user?.full_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(ticket.created_at), "HH:mm dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed p-3 bg-muted/50 rounded-lg">
                    {ticket.description}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {ticket.replies?.map((reply) => (
                <div key={reply.reply_id} className="flex gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={reply.user?.avatar_url || undefined} />
                    <AvatarFallback>
                      {reply.user?.full_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center gap-2">
                       <span className="font-semibold">
                        {reply.user?.full_name}{" "}
                        {["system_admin", "support_admin"].includes(
                          reply.user?.role || ""
                        ) && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Admin
                          </Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(reply.created_at), "HH:mm dd/MM/yyyy")}
                      </span>
                    </div>
                     <div className={`text-sm leading-relaxed p-3 rounded-lg ${
                         ["system_admin", "support_admin"].includes(reply.user?.role || "") 
                         ? "bg-blue-50 border border-blue-100" 
                         : "bg-muted/50"
                     }`}>
                      {reply.reply_text}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reply Input */}
          <Card>
            <CardHeader>
              <CardTitle>Phản hồi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Nhập nội dung phản hồi..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleReply}
                  disabled={!replyText.trim() || sendingReply}
                >
                  {sendingReply ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Gửi phản hồi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Danh mục
                </span>
                <p className="font-medium capitalize mt-1 text-foreground">
                  {ticket.category}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Mức độ ưu tiên
                </span>
                <div className="mt-1">
                   <Badge variant="outline" className="capitalize">
                      {ticket.priority}
                   </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Email liên hệ
                </span>
                <p className="text-sm mt-1 break-all">{ticket.user?.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
