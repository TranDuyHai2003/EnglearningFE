"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTicketDialog } from "./_components/CreateTicketDialog";
import { SupportTicketList } from "./_components/SupportTicketList";
import { adminService } from "@/lib/api/adminService";
import { SupportTicket } from "@/lib/types";

const faqs = [
  {
    question: "Làm sao để đổi mật khẩu?",
    answer: "Bạn có thể đổi mật khẩu bằng cách truy cập vào trang Hồ sơ cá nhân > Cài đặt tài khoản > Đổi mật khẩu.",
  },
  {
    question: "Tôi đã thanh toán nhưng chưa vào được khóa học?",
    answer: "Hệ thống thường xử lý thanh toán trong vòng 5-15 phút. Nếu sau 30 phút bạn vẫn chưa truy cập được, vui lòng gửi phiếu hỗ trợ kèm mã giao dịch.",
  },
  {
    question: "Tôi có được hoàn tiền không?",
    answer: "Chúng tôi có chính sách hoàn tiền trong vòng 7 ngày nếu bạn chưa học quá 20% thời lượng khóa học. Vui lòng liên hệ hỗ trợ để được xem xét.",
  },
  {
    question: "Khóa học có thời hạn bao lâu?",
    answer: "Hầu hết các khóa học trên EngLearning có giá trị trọn đời. Bạn có thể học lại bất cứ lúc nào.",
  },
  {
    question: "Video bị giật/lag thì làm sao?",
    answer: "Vui lòng kiểm tra kết nối mạng của bạn. Bạn có thể thử giảm chất lượng video hoặc tải lại trang. Nếu vẫn bị lỗi, hãy gửi yêu cầu hỗ trợ kỹ thuật.",
  },
];

export default function StudentSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.listSupportTickets(1, 100); // Fetch recent tickets
      setTickets(res.data);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Trung tâm hỗ trợ</h1>
        <p className="text-muted-foreground">
          Tìm câu trả lời cho các câu hỏi thường gặp hoặc gửi yêu cầu hỗ trợ đến đội ngũ của chúng tôi.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Câu hỏi thường gặp (FAQ)</CardTitle>
              <CardDescription>
                Giải đáp nhanh các thắc mắc phổ biến.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lịch sử yêu cầu hỗ trợ</CardTitle>
                <CardDescription>
                  Theo dõi trạng thái các phiếu hỗ trợ bạn đã gửi.
                </CardDescription>
              </div>
              <CreateTicketDialog onSuccess={fetchTickets} />
            </CardHeader>
            <CardContent>
              <SupportTicketList tickets={tickets} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Liên hệ trực tiếp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-blue-800">
              <div>
                <p className="font-semibold">Hotline:</p>
                <p>1900 1234 (8:00 - 17:30)</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>support@englearning.com</p>
              </div>
              <div>
                <p className="font-semibold">Địa chỉ:</p>
                <p>Tòa nhà Tech, Quận 1, TP.HCM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
