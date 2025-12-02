"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { courseService } from "@/lib/api/courseService";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  Save,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { Quiz, Question, QuestionType } from "@/lib/types";

interface QuizEditorDialogProps {
  lessonId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface QuizFormValues {
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
}

interface QuestionFormValues {
  question_id?: number;
  question_text: string;
  question_type: QuestionType;
  points: number;
  explanation: string;
  options: {
    option_text: string;
    is_correct: boolean;
    display_order: number;
  }[];
}

export function QuizEditorDialog({
  lessonId,
  isOpen,
  onClose,
}: QuizEditorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null
  );

  const quizForm = useForm<QuizFormValues>({
    defaultValues: {
      title: "",
      description: "",
      time_limit: 15,
      passing_score: 70,
      max_attempts: 3,
      shuffle_questions: true,
      show_correct_answers: true,
    },
  });

  const questionForm = useForm<QuestionFormValues>({
    defaultValues: {
      question_text: "",
      question_type: "multiple_choice",
      points: 1,
      explanation: "",
      options: [
        { option_text: "", is_correct: false, display_order: 1 },
        { option_text: "", is_correct: false, display_order: 2 },
      ],
    },
  });

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control: questionForm.control,
    name: "options",
  });

  useEffect(() => {
    if (isOpen && lessonId) {
      loadQuiz();
    }
  }, [isOpen, lessonId]);

  const loadQuiz = async () => {
    setIsLoading(true);
    try {
      const quizData = await courseService.upsertQuiz({
        lesson_id: lessonId,
        title: "New Quiz",
      });
      setQuiz(quizData);
      quizForm.reset({
        title: quizData.title,
        description: quizData.description || "",
        time_limit: quizData.time_limit || 15,
        passing_score: Number(quizData.passing_score) || 70,
        max_attempts: quizData.max_attempts || 3,
        shuffle_questions: quizData.shuffle_questions ?? true,
        show_correct_answers: quizData.show_correct_answers ?? true,
      });

      if (quizData.quiz_id) {
        const fullQuiz = await courseService.getQuiz(quizData.quiz_id);
        setQuiz(fullQuiz);
      }
    } catch (error) {
      toast.error("Không thể tải thông tin quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSaveQuiz = async (data: QuizFormValues) => {
    if (!quiz) return;
    setIsLoading(true);
    try {
      const updated = await courseService.upsertQuiz({
        lesson_id: lessonId,
        ...data,
      });
      setQuiz((prev) => (prev ? { ...prev, ...updated } : updated));
      toast.success("Đã lưu thông tin quiz!");
    } catch (error) {
      toast.error("Lưu thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const onEditQuestion = (question?: Question) => {
    if (question) {
      setEditingQuestionId(question.question_id);
      questionForm.reset({
        question_id: question.question_id,
        question_text: question.question_text,
        question_type: question.question_type,
        points: question.points,
        explanation: question.explanation || "",
        options:
          question.options?.map((o) => ({
            option_text: o.option_text,
            is_correct: o.is_correct,
            display_order: o.display_order,
          })) || [],
      });
    } else {
      setEditingQuestionId(null);
      questionForm.reset({
        question_text: "",
        question_type: "multiple_choice",
        points: 1,
        explanation: "",
        options: [
          { option_text: "", is_correct: false, display_order: 1 },
          { option_text: "", is_correct: false, display_order: 2 },
          { option_text: "", is_correct: false, display_order: 3 },
          { option_text: "", is_correct: false, display_order: 4 },
        ],
      });
    }
    setIsEditingQuestion(true);
  };

  const questionType = questionForm.watch("question_type");

  useEffect(() => {
    if (questionType === "true_false") {
      const currentOptions = questionForm.getValues("options");

      if (
        currentOptions.length !== 2 ||
        currentOptions[0].option_text !== "True"
      ) {
        questionForm.setValue("options", [
          { option_text: "True", is_correct: true, display_order: 1 },
          { option_text: "False", is_correct: false, display_order: 2 },
        ]);
      }
    }
  }, [questionType, questionForm]);

  const onSaveQuestion = async (data: QuestionFormValues) => {
    if (!quiz) return;

    const hasCorrect = data.options.some((o) => o.is_correct);
    if (!hasCorrect) {
      questionForm.setError("root", {
        message: "Phải chọn ít nhất một đáp án đúng",
      });
      toast.error("Phải chọn ít nhất một đáp án đúng");
      return;
    }

    setIsLoading(true);
    try {
      await courseService.upsertQuestion(quiz.quiz_id, data);
      toast.success("Đã lưu câu hỏi!");
      setIsEditingQuestion(false);

      const fullQuiz = await courseService.getQuiz(quiz.quiz_id);
      setQuiz(fullQuiz);
    } catch (error) {
      toast.error("Lưu câu hỏi thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteQuestion = async (questionId: number) => {
    if (!quiz || !confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    setIsLoading(true);
    try {
      await courseService.deleteQuestion(quiz.quiz_id, questionId);
      toast.success("Đã xóa câu hỏi.");
      const fullQuiz = await courseService.getQuiz(quiz.quiz_id);
      setQuiz(fullQuiz);
    } catch (error) {
      toast.error("Xóa thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditingQuestion) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingQuestion(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              {editingQuestionId ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
            </DialogTitle>
          </DialogHeader>

          <Form {...questionForm}>
            <form
              onSubmit={questionForm.handleSubmit(onSaveQuestion)}
              className="space-y-4"
            >
              <FormField
                name="question_text"
                control={questionForm.control}
                rules={{ required: "Nội dung câu hỏi là bắt buộc" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung câu hỏi</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Nhập câu hỏi..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="question_type"
                  control={questionForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại câu hỏi</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="multiple_choice">
                            Trắc nghiệm
                          </SelectItem>
                          <SelectItem value="true_false">Đúng / Sai</SelectItem>
                          <SelectItem value="fill_blank">Điền từ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="points"
                  control={questionForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điểm số</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {questionType === "fill_blank"
                      ? "Các đáp án chấp nhận"
                      : "Các lựa chọn trả lời"}
                  </label>
                  {questionType !== "true_false" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendOption({
                          option_text: "",
                          is_correct: questionType === "fill_blank",
                          display_order: optionFields.length + 1,
                        })
                      }
                    >
                      <Plus className="h-3 w-3 mr-1" /> Thêm
                    </Button>
                  )}
                </div>

                {optionFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-2 border p-2 rounded-md"
                  >
                    {questionType !== "fill_blank" && (
                      <div className="mt-3">
                        <FormField
                          name={`options.${index}.is_correct`}
                          control={questionForm.control}
                          render={({ field }) =>
                            questionType === "true_false" ? (
                              <input
                                type="radio"
                                className="h-4 w-4"
                                checked={field.value}
                                onChange={() => {
                                  const options =
                                    questionForm.getValues("options");
                                  options.forEach((_, i) => {
                                    questionForm.setValue(
                                      `options.${i}.is_correct`,
                                      i === index
                                    );
                                  });
                                }}
                              />
                            ) : (
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )
                          }
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <FormField
                        name={`options.${index}.option_text`}
                        control={questionForm.control}
                        rules={{ required: "Không được để trống" }}
                        render={({ field }) => (
                          <Input
                            placeholder={
                              questionType === "fill_blank"
                                ? "Nhập đáp án đúng..."
                                : `Lựa chọn ${index + 1}`
                            }
                            {...field}
                            readOnly={questionType === "true_false"}
                            className={
                              questionType === "true_false"
                                ? "bg-slate-100"
                                : ""
                            }
                          />
                        )}
                      />
                    </div>

                    {questionType !== "true_false" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
                {questionForm.formState.errors.root?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {questionForm.formState.errors.root.message}
                  </p>
                )}
              </div>

              <FormField
                name="explanation"
                control={questionForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giải thích (hiển thị sau khi nộp bài)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Giải thích tại sao đáp án này đúng..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditingQuestion(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Lưu câu hỏi
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quản lý Quiz: {quiz?.title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Edit className="h-4 w-4" /> Cấu hình chung
            </h3>
            <Form {...quizForm}>
              <form
                onSubmit={quizForm.handleSubmit(onSaveQuiz)}
                className="grid grid-cols-2 gap-4"
              >
                <FormField
                  name="title"
                  control={quizForm.control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Tên bài kiểm tra</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="time_limit"
                  control={quizForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian (phút)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="passing_score"
                  control={quizForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điểm đạt (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="col-span-2 flex justify-end">
                  <Button type="submit" size="sm" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Lưu cấu hình
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                Danh sách câu hỏi ({quiz?.questions?.length || 0})
              </h3>
              <Button size="sm" onClick={() => onEditQuestion()}>
                <Plus className="mr-2 h-4 w-4" /> Thêm câu hỏi
              </Button>
            </div>

            <div className="space-y-2">
              {quiz?.questions?.map((q, idx) => (
                <div
                  key={q.question_id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-slate-50"
                >
                  <div>
                    <p className="font-medium">
                      Câu {idx + 1}: {q.question_text}
                    </p>
                    <p className="text-sm text-slate-500">
                      {q.question_type} • {q.points} điểm • {q.options?.length}{" "}
                      lựa chọn
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditQuestion(q)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteQuestion(q.question_id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!quiz?.questions || quiz.questions.length === 0) && (
                <p className="text-center text-slate-500 py-4">
                  Chưa có câu hỏi nào.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
