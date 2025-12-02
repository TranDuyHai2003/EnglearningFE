"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { interactionService } from "@/lib/api/interactionService";
import { QaDiscussion, QaReply } from "@/lib/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageSquare, Send, Reply, Trash2 } from "lucide-react";

interface Props {
  lessonId: number;
}

export const QATab = ({ lessonId }: Props) => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<QaDiscussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [questionText, setQuestionText] = useState("");
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setIsLoading(true);
        const data = await interactionService.getDiscussions({
          lesson_id: lessonId,
        });
        setDiscussions(data);
      } catch (error) {
        console.error("Failed to fetch discussions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiscussions();
  }, [lessonId]);

  const handlePostQuestion = async () => {
    if (!questionText.trim()) return;
    try {
      const newDiscussion = await interactionService.createDiscussion(
        lessonId,
        questionText
      );

      const discussionWithUser: QaDiscussion = {
        ...newDiscussion,
        student: user ? { ...user, id: user.id } : undefined,
        replies: [],
      };
      setDiscussions([discussionWithUser, ...discussions]);
      setQuestionText("");
      toast.success("Đã gửi câu hỏi!");
    } catch (error) {
      toast.error("Gửi câu hỏi thất bại.");
    }
  };

  const handlePostReply = async (discussionId: number) => {
    const text = replyText[discussionId];
    if (!text?.trim()) return;

    try {
      const newReply = await interactionService.replyDiscussion(
        discussionId,
        text
      );

      setDiscussions((prev) =>
        prev.map((d) => {
          if (d.discussion_id === discussionId) {
            return {
              ...d,
              replies: [
                ...(d.replies || []),
                {
                  ...newReply,
                  user: user ? { ...user, id: user.id } : undefined,
                },
              ],
            };
          }
          return d;
        })
      );
      setReplyText((prev) => ({ ...prev, [discussionId]: "" }));
      setReplyingTo(null);
      toast.success("Đã gửi câu trả lời!");
    } catch (error) {
      toast.error("Gửi câu trả lời thất bại.");
    }
  };

  const handleDeleteDiscussion = async (discussionId: number) => {
    if (!confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    try {
      await interactionService.deleteDiscussion(discussionId);
      setDiscussions((prev) =>
        prev.filter((d) => d.discussion_id !== discussionId)
      );
      toast.success("Đã xóa câu hỏi.");
    } catch (error) {
      toast.error("Xóa thất bại.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-50 p-4 rounded-lg border">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Đặt câu hỏi mới
        </h3>
        <Textarea
          placeholder="Bạn thắc mắc điều gì về bài học này?"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="mb-2 bg-white"
        />
        <div className="flex justify-end">
          <Button onClick={handlePostQuestion} disabled={!questionText.trim()}>
            <Send className="w-4 h-4 mr-2" /> Gửi câu hỏi
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Đang tải...</p>
        ) : discussions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!
          </p>
        ) : (
          discussions.map((discussion) => (
            <div
              key={discussion.discussion_id}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={discussion.student?.avatar_url || ""} />
                  <AvatarFallback>
                    {discussion.student?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">
                        {discussion.student?.full_name || "Người dùng ẩn danh"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(discussion.created_at), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                    {(user?.role === "system_admin" ||
                      user?.user_id === discussion.student_id) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          handleDeleteDiscussion(discussion.discussion_id)
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-gray-800">{discussion.content}</p>
                </div>
              </div>

              {discussion.replies && discussion.replies.length > 0 && (
                <div className="pl-12 space-y-3">
                  {discussion.replies.map((reply) => (
                    <div
                      key={reply.reply_id}
                      className="bg-slate-50 p-3 rounded-md flex gap-3"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={reply.user?.avatar_url || ""} />
                        <AvatarFallback>
                          {reply.user?.full_name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs">
                            {reply.user?.full_name}
                          </p>
                          {reply.user?.role === "instructor" && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                              Giảng viên
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pl-12">
                {replyingTo === discussion.discussion_id ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Viết câu trả lời..."
                      value={replyText[discussion.discussion_id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [discussion.discussion_id]: e.target.value,
                        })
                      }
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handlePostReply(discussion.discussion_id)
                        }
                      >
                        Trả lời
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyingTo(null)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setReplyingTo(discussion.discussion_id)}
                  >
                    <Reply className="w-4 h-4 mr-2" /> Trả lời
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
