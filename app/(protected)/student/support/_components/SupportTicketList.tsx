import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SupportTicket } from "@/lib/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface SupportTicketListProps {
  tickets: SupportTicket[];
  isLoading: boolean;
}

const statusMap: Record<string, { label: string; color: string }> = {
  open: { label: "Đang mở", color: "bg-blue-100 text-blue-800" },
  in_progress: { label: "Đang xử lý", color: "bg-yellow-100 text-yellow-800" },
  resolved: { label: "Đã giải quyết", color: "bg-green-100 text-green-800" },
  closed: { label: "Đã đóng", color: "bg-gray-100 text-gray-800" },
};

const priorityMap: Record<string, { label: string; color: string }> = {
  low: { label: "Thấp", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Trung bình", color: "bg-blue-50 text-blue-700" },
  high: { label: "Cao", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Khẩn cấp", color: "bg-red-100 text-red-800" },
};

const categoryMap: Record<string, string> = {
  technical: "Kỹ thuật",
  payment: "Thanh toán",
  content: "Nội dung",
  other: "Khác",
};

export function SupportTicketList({ tickets, isLoading }: SupportTicketListProps) {
  if (isLoading) {
    return <div className="text-center py-8">Đang tải danh sách...</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <p className="text-muted-foreground">Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Mức độ</TableHead>
            <TableHead>Ngày tạo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.ticket_id}>
              <TableCell className="font-medium">{ticket.subject}</TableCell>
              <TableCell>{categoryMap[ticket.category] || ticket.category}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusMap[ticket.status]?.color}
                >
                  {statusMap[ticket.status]?.label || ticket.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                    variant="outline"
                    className={priorityMap[ticket.priority]?.color}
                >
                    {priorityMap[ticket.priority]?.label || ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(ticket.created_at), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
