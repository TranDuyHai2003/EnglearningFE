"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { instructorService } from "@/lib/api/instructorService";
import { Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

import { ReplyDialog } from "./_components/ReplyDialog";
import { ExternalLink, MessageCircle } from "lucide-react";

export default function InstructorQAPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyDialogState, setReplyDialogState] = useState<{
    isOpen: boolean;
    discussionId: number | null;
    studentName?: string;
    questionText?: string;
  }>({
    isOpen: false,
    discussionId: null,
  });

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await instructorService.getActionItems();
      setQuestions(data.pending_questions || []);
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Hỏi đáp & Thảo luận</h1>
      <div className="grid gap-6">
        {questions.length > 0 ? (
          questions.map((q: any) => (
            <Card key={q.discussion_id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 w-full">
                    <Avatar>
                      <AvatarImage src={q.student.avatar_url} />
                      <AvatarFallback>{q.student.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{q.student.full_name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {q.lesson.section.course.title} - {q.lesson.title}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(q.created_at), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </span>
                      </div>
                      
                      <p className="text-gray-800 font-medium mb-4 bg-slate-50 p-3 rounded-md border">
                        {q.content}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => setReplyDialogState({
                            isOpen: true,
                            discussionId: q.discussion_id,
                            studentName: q.student.full_name,
                            questionText: q.content
                          })}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Trả lời ngay
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link 
                            href={`/learn/courses/${q.lesson.section.course.course_id}/lessons/${q.lesson.lesson_id}`}
                            target="_blank"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Xem bài giảng
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">Không có câu hỏi nào cần trả lời.</p>
          </div>
        )}
      </div>

      <ReplyDialog
        isOpen={replyDialogState.isOpen}
        discussionId={replyDialogState.discussionId}
        studentName={replyDialogState.studentName}
        questionText={replyDialogState.questionText}
        onClose={() => setReplyDialogState(prev => ({ ...prev, isOpen: false }))}
        onSuccess={fetchQuestions}
      />
    </div>
  );
}
