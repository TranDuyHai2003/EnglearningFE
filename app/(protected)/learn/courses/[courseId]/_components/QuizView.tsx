// app/(protected)/learn/courses/[courseId]/_components/QuizView.tsx
"use client";

import { useState, useEffect } from "react";
import { learningService } from "@/lib/api/learningService";
import { Quiz, QuizAttempt, Question, AnswerOption } from "@/lib/types"; // Import thêm Question và AnswerOption
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

export function QuizView({ lessonId, onQuizPassed }: QuizViewProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy dữ liệu quiz và bắt đầu lượt làm bài mới
  useEffect(() => {
    const initializeQuiz = async () => {
      setIsLoading(true);
      try {
        // NOTE: Backend cần có API để lấy quiz từ lessonId
        // Giả sử API là: GET /api/learning/lessons/{lessonId}/quiz
        // const quizData = await learningService.getQuizByLesson(lessonId);
        // setQuiz(quizData);
        // const newAttempt = await learningService.startQuizAttempt(quizData.quiz_id);
        // setAttempt(newAttempt);

        // --- Dữ liệu giả để test UI trong lúc chờ API ---
        toast.info("QuizView: Using mock data. Waiting for BE API.");
        const mockQuizData: Quiz = {
          quiz_id: 101,
          lesson_id: lessonId,
          title: "Kiểm tra kiến thức bài học",
          description: "Hãy chọn đáp án đúng nhất cho các câu hỏi sau.",
          time_limit: 10,
          passing_score: 70,
          max_attempts: 3,
          shuffle_questions: false,
          show_correct_answers: true,
          created_at: new Date().toISOString(),
          questions: [
            {
              question_id: 1,
              quiz_id: 101,
              question_text: "Đâu là cách chào hỏi phổ biến nhất?",
              question_type: "multiple_choice",
              points: 1,
              display_order: 1,
              options: [
                {
                  option_id: 1,
                  question_id: 1,
                  option_text: "Tạm biệt",
                  is_correct: false,
                  display_order: 1,
                },
                {
                  option_id: 2,
                  question_id: 1,
                  option_text: "Xin chào",
                  is_correct: true,
                  display_order: 2,
                },
                {
                  option_id: 3,
                  question_id: 1,
                  option_text: "Cảm ơn",
                  is_correct: false,
                  display_order: 3,
                },
              ],
            },
            {
              question_id: 2,
              quiz_id: 101,
              question_text: "'Thank you' trong tiếng Việt là gì?",
              question_type: "multiple_choice",
              points: 1,
              display_order: 2,
              options: [
                {
                  option_id: 4,
                  question_id: 2,
                  option_text: "Xin lỗi",
                  is_correct: false,
                  display_order: 1,
                },
                {
                  option_id: 5,
                  question_id: 2,
                  option_text: "Cảm ơn",
                  is_correct: true,
                  display_order: 2,
                },
              ],
            },
          ],
        };
        setQuiz(mockQuizData);
        // Bỏ `as any` vì kiểu Quiz đã chính xác

        // Giả lập một attempt ban đầu (chưa nộp bài)
        const mockAttempt: Partial<QuizAttempt> = {
          attempt_id: 201,
          student_id: 1, // Giả sử user id 1
          quiz_id: mockQuizData.quiz_id,
          started_at: new Date().toISOString(),
        };
        setAttempt(mockAttempt as QuizAttempt); // Bỏ `as any`
        // --- Hết dữ liệu giả ---
      } catch (e) {
        toast.error("Không thể tải bài quiz. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    initializeQuiz();
  }, [lessonId]);

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

      // NOTE: Giả lập kết quả vì chưa có API submit
      // const result = await learningService.submitQuizAttempt(attempt.attempt_id, { answers: answersPayload });
      const mockResult: QuizAttempt = {
        ...attempt,
        submitted_at: new Date().toISOString(),
        score: 100,
        passed: true,
      } as QuizAttempt; // Ép kiểu để đảm bảo đầy đủ
      const result = mockResult;
      // Hết giả lập

      setAttempt(result);
      toast.success(`Bạn đã đạt ${result.score}%!`);

      if (result.passed) {
        onQuizPassed();
      }
    } catch (error) {
      toast.error("Nộp bài thất bại. Vui lòng thử lại.");
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

  // Render kết quả nếu đã nộp bài
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

  // Render giao diện làm bài
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
