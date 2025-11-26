"use client";

import { useState, useEffect } from "react";
import { discussionService } from "@/lib/api/discussionService";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { DiscussionList } from "./DiscussionList";
import { AskQuestionDialog } from "./AskQuestionDialog";

interface LessonDiscussionTabProps {
  lessonId: number;
}

export function LessonDiscussionTab({ lessonId }: LessonDiscussionTabProps) {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAskDialog, setShowAskDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await discussionService.getDiscussions(lessonId, page);
      setDiscussions(response.data);
      setTotalPages(response.meta.total_pages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [lessonId, page]);

  const handleQuestionCreated = () => {
    setShowAskDialog(false);
    setPage(1);
    fetchDiscussions();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Hỏi & Đáp</h3>
        <Button onClick={() => setShowAskDialog(true)}>
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          Đặt câu hỏi
        </Button>
      </div>

      <DiscussionList
        discussions={discussions}
        loading={loading}
        onUpdate={fetchDiscussions}
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
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

      <AskQuestionDialog
        lessonId={lessonId}
        open={showAskDialog}
        onOpenChange={setShowAskDialog}
        onSuccess={handleQuestionCreated}
      />
    </div>
  );
}
