"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { courseService } from "@/lib/api/courseService";
import { Category, CourseForm, CourseTag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, PlusCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<CourseTag[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseForm>({
    defaultValues: {
      title: "",
      description: "",
      language: "Tiếng Việt",
      level: "beginner",
      price: 0,
      duration_hours: 1,
      tag_ids: [],
    },
  });

  useEffect(() => {
    async function fetchMetaData() {
      setIsLoadingMeta(true);
      try {
        const [categoriesData, tagsData] = await Promise.all([
          courseService.listCategories(),
          courseService.listTags(),
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu cho form. Vui lòng thử lại.");
      } finally {
        setIsLoadingMeta(false);
      }
    }
    fetchMetaData();
  }, []);

  const onSubmit = async (data: CourseForm) => {
    setIsSubmitting(true);
    try {
      const payload: CourseForm = {
        ...data,
        category_id: Number(data.category_id),
        price: Number(data.price),
        duration_hours: Number(data.duration_hours),
        discount_price: data.discount_price
          ? Number(data.discount_price)
          : undefined,
      };

      const newCourse = await courseService.createCourse(payload);
      toast.success("Tạo khóa học thành công!");
      router.push(`/instructor/my-courses`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Tạo khóa học thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMeta) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Đang tải dữ liệu form...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Tạo khóa học mới</CardTitle>
          <CardDescription>
            Điền các thông tin cơ bản về khóa học của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                rules={{
                  required: "Tiêu đề không được để trống.",
                  minLength: {
                    value: 5,
                    message: "Tiêu đề phải có ít nhất 5 ký tự.",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề khóa học</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Luyện thi IELTS 7.0 cấp tốc"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                rules={{
                  required: "Mô tả không được để trống.",
                  minLength: {
                    value: 20,
                    message: "Mô tả phải có ít nhất 20 ký tự.",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Mô tả về những gì học viên sẽ học được..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category_id"
                  rules={{ required: "Vui lòng chọn danh mục." }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem
                              key={c.category_id}
                              value={String(c.category_id)}
                            >
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  rules={{ required: "Vui lòng chọn trình độ." }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trình độ</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trình độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">
                            Người mới bắt đầu
                          </SelectItem>
                          <SelectItem value="intermediate">
                            Trung cấp
                          </SelectItem>
                          <SelectItem value="advanced">Nâng cao</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  rules={{
                    required: "Giá không được để trống.",
                    min: { value: 0, message: "Giá không thể là số âm." },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá (VND)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration_hours"
                  rules={{
                    required: "Thời lượng không được để trống.",
                    min: { value: 1, message: "Thời lượng phải lớn hơn 0." },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời lượng (giờ)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="language"
                rules={{ required: "Ngôn ngữ không được để trống." }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngôn ngữ</FormLabel>
                    <FormControl>
                      <Input placeholder="Tiếng Việt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tag_ids"
                render={() => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 rounded-md border p-4">
                      {tags.map((tag) => (
                        <FormField
                          key={tag.tag_id}
                          control={form.control}
                          name="tag_ids"
                          render={({ field }) => {
                            const currentValue = field.value || [];
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={currentValue.includes(tag.tag_id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([
                                          ...currentValue,
                                          tag.tag_id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter(
                                            (value) => value !== tag.tag_id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {tag.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Tạo khóa học
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
