"use client";

import { useState, useEffect } from "react";
import { learningService } from "@/lib/api/learningService";
import { Quiz, QuizAttempt, Question, AnswerOption } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";

interface QuizViewProps {
  lessonId: number;
  onQuizPassed: () => void;
}

export function QuizView({
  lessonId,
  quizId,
  onQuizPassed,
}: {
  lessonId: number;
  quizId?: number;
  onQuizPassed: () => void;
}) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initializeQuiz = async () => {
      if (!quizId) return;
      setIsLoading(true);
      try {
        const quizData = await learningService.getQuiz(quizId);
        setQuiz(quizData);

        const newAttempt = await learningService.startQuizAttempt(quizId);
        setAttempt(newAttempt);
      } catch (e: any) {
        toast.error(e.message || "Không thể tải bài quiz.");
      } finally {
        setIsLoading(false);
      }
    };
    initializeQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!attempt || !quiz) return;
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions < (quiz.questions?.length || 0)) {
      toast.warning("Vui lòng trả lời hết các câu hỏi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([qid, oid]) => ({
        question_id: Number(qid),
        selected_option_id: oid,
      }));

      const result = await learningService.submitQuizAttempt(
        attempt.attempt_id,
        answersPayload
      );

      setAttempt(result);
      toast.success(`Bạn đã đạt ${result.score}%!`);

      if (result.passed) {
        onQuizPassed();
      }
    } catch (error: any) {
      toast.error(error.message || "Nộp bài thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!quiz)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Không có bài quiz cho bài học này.
      </div>
    );

  if (attempt?.submitted_at) {
    return (
      <Card className="bg-slate-50">
        <CardHeader className="items-center text-center">
          {attempt.passed ? (
            <ShieldCheck className="w-16 h-16 text-green-500 mb-2" />
          ) : (
            <ShieldX className="w-16 h-16 text-red-500 mb-2" />
          )}
          <CardTitle className="text-2xl">Kết quả Quiz</CardTitle>
          <CardDescription>
            Điểm số của bạn:{" "}
            <span className="font-bold text-2xl text-primary">
              {attempt.score}%
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {attempt.passed ? (
            <p className="text-green-600 font-semibold">
              Chúc mừng, bạn đã vượt qua! Bài học được đánh dấu hoàn thành.
            </p>
          ) : (
            <p className="text-red-600 font-semibold">
              Bạn chưa đạt. Hãy ôn lại bài và thử lại nhé!
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>
          Hoàn thành các câu hỏi dưới đây và nộp bài để kết thúc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {quiz.questions?.map((q, index) => (
          <div key={q.question_id}>
            <p className="font-semibold mb-3">
              Câu {index + 1}: {q.question_text}
            </p>
            <RadioGroup
              onValueChange={(value) =>
                handleAnswerChange(q.question_id, Number(value))
              }
            >
              {q.options?.map((opt) => (
                <div
                  key={opt.option_id}
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-50"
                >
                  <RadioGroupItem
                    value={String(opt.option_id)}
                    id={`q${q.question_id}-o${opt.option_id}`}
                  />
                  <Label
                    htmlFor={`q${q.question_id}-o${opt.option_id}`}
                    className="cursor-pointer font-normal flex-1"
                  >
                    {opt.option_text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Nộp bài
        </Button>
      </CardFooter>
    </Card>
  );
}
