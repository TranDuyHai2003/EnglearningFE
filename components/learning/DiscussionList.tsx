"use client";

import { DiscussionItem } from "./DiscussionItem";
import { Skeleton } from "@/components/ui/skeleton";

interface DiscussionListProps {
  discussions: any[];
  loading: boolean;
  onUpdate: () => void;
}

export function DiscussionList({
  discussions,
  loading,
  onUpdate,
}: DiscussionListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (discussions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">
          Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {discussions.map((discussion) => (
        <DiscussionItem
          key={discussion.discussion_id}
          discussion={discussion}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
