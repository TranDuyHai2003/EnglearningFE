"use client";

import { useState } from "react";
import { discussionService } from "@/lib/api/discussionService";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  MessageSquare,
  Trash2,
  ThumbsUp,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ReplyForm } from "./ReplyForm";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface DiscussionItemProps {
  discussion: any;
  onUpdate: () => void;
}

export function DiscussionItem({ discussion, onUpdate }: DiscussionItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id === discussion.student_id;
  const isInstructor = user?.role === "instructor";
  const isAdmin = ["system_admin", "support_admin"].includes(user?.role || "");

  const handleResolve = async () => {
    try {
      await discussionService.resolveDiscussion(discussion.discussion_id);
      toast.success(
        discussion.is_resolved
          ? "Đã mở lại câu hỏi"
          : "Đã đánh dấu đã giải quyết"
      );
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;

    try {
      setDeleting(true);
      await discussionService.deleteDiscussion(discussion.discussion_id);
      toast.success("Đã xóa câu hỏi");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa");
    } finally {
      setDeleting(false);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onUpdate();
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={discussion.student?.avatar_url} />
            <AvatarFallback>
              {discussion.student?.full_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold">{discussion.student?.full_name}</p>
              {discussion.is_resolved && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Đã giải quyết
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(discussion.created_at), {
                addSuffix: true,
                locale: vi,
              })}
            </p>
          </div>
        </div>

        {(isOwner || isInstructor || isAdmin) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(isOwner || isInstructor) && (
                <DropdownMenuItem onClick={handleResolve}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {discussion.is_resolved ? "Mở lại" : "Đánh dấu đã giải quyết"}
                </DropdownMenuItem>
              )}
              {(isOwner || isAdmin) && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa câu hỏi
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-lg mb-2">{discussion.title}</h4>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {discussion.content}
        </p>
      </div>

      {discussion.replies && discussion.replies.length > 0 && (
        <div className="space-y-3 pl-4 border-l-2">
          {discussion.replies.map((reply: any) => (
            <ReplyItem
              key={reply.reply_id}
              reply={reply}
              discussionOwnerId={discussion.student_id}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}

      {showReplyForm ? (
        <ReplyForm
          discussionId={discussion.discussion_id}
          onSuccess={handleReplySuccess}
          onCancel={() => setShowReplyForm(false)}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReplyForm(true)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Trả lời
        </Button>
      )}
    </div>
  );
}

function ReplyItem({
  reply,
  discussionOwnerId,
  onUpdate,
}: {
  reply: any;
  discussionOwnerId: number;
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id === reply.user_id;
  const isQuestionOwner = user?.id === discussionOwnerId;
  const isAdmin = ["system_admin", "support_admin"].includes(user?.role || "");
  const isInstructor = reply.user?.role === "instructor";

  const handleMarkHelpful = async () => {
    try {
      await discussionService.markReplyHelpful(reply.reply_id);
      toast.success(
        reply.is_helpful ? "Đã bỏ đánh dấu hữu ích" : "Đã đánh dấu hữu ích"
      );
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa câu trả lời này?")) return;

    try {
      setDeleting(true);
      await discussionService.deleteReply(reply.reply_id);
      toast.success("Đã xóa câu trả lời");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={reply.user?.avatar_url} />
        <AvatarFallback>{reply.user?.full_name?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm">{reply.user?.full_name}</p>
            {isInstructor && (
              <Badge variant="default" className="text-xs">
                Giảng viên
              </Badge>
            )}
            {reply.is_helpful && (
              <Badge variant="secondary" className="text-xs gap-1">
                <ThumbsUp className="h-3 w-3" />
                Hữu ích
              </Badge>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(reply.created_at), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
          {isQuestionOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={handleMarkHelpful}
            >
              <ThumbsUp className="mr-1 h-3 w-3" />
              {reply.is_helpful ? "Bỏ hữu ích" : "Hữu ích"}
            </Button>
          )}
          {(isOwner || isAdmin) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Xóa
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
