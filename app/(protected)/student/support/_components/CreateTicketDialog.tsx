import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminService } from "@/lib/api/adminService";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

interface TicketFormValues {
  category: string;
  subject: string;
  description: string;
  priority: string;
}

interface CreateTicketDialogProps {
  onSuccess: () => void;
}

export function CreateTicketDialog({ onSuccess }: CreateTicketDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TicketFormValues>({
    defaultValues: {
      category: "other",
      subject: "",
      description: "",
      priority: "medium",
    },
  });

  async function onSubmit(values: TicketFormValues) {
    setIsSubmitting(true);
    try {
      await adminService.createSupportTicket(values);
      toast.success("Đã gửi yêu cầu hỗ trợ thành công!");
      setOpen(false);
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Gửi yêu cầu hỗ trợ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gửi yêu cầu hỗ trợ</DialogTitle>
          <DialogDescription>
            Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              rules={{ required: "Vui lòng chọn danh mục" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technical">Kỹ thuật</SelectItem>
                      <SelectItem value="payment">Thanh toán</SelectItem>
                      <SelectItem value="content">Nội dung khóa học</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              rules={{ required: "Vui lòng chọn mức độ ưu tiên" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mức độ ưu tiên</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn mức độ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="urgent">Khẩn cấp</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              rules={{ 
                required: "Vui lòng nhập tiêu đề",
                minLength: { value: 5, message: "Tiêu đề phải có ít nhất 5 ký tự" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Vắn tắt vấn đề của bạn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              rules={{ 
                required: "Vui lòng nhập mô tả",
                minLength: { value: 10, message: "Mô tả chi tiết phải có ít nhất 10 ký tự" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả chi tiết</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Gửi yêu cầu
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
