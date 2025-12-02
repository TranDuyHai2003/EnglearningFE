"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { adminService } from "@/lib/api/adminService";
import { SupportTicket } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const SupportTicketsSkeleton = () => (
  <TableBody>
    {[...Array(5)].map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        <TableCell>
          <Skeleton className="h-5 w-10" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-48" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-32" />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.listSupportTickets(page);
      setTickets(data.data);
      setTotalPages(data.meta.total_pages);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải danh sách ticket.";
      setError(errorMessage);
      toast.error(errorMessage);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const renderTableBody = () => {
    if (isLoading && tickets === null) {
      return <SupportTicketsSkeleton />;
    }

    if (error) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24 text-red-600">
              {error}
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    if (!tickets || tickets.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24">
              Không có ticket hỗ trợ nào.
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.ticket_id}>
            <TableCell>{ticket.ticket_id}</TableCell>
            <TableCell className="font-medium">{ticket.subject}</TableCell>
            <TableCell>{ticket.user?.full_name || "N/A"}</TableCell>
            <TableCell>
              <Badge>{ticket.status}</Badge>
            </TableCell>
            <TableCell>
              {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Quản lý Hỗ trợ</h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Người gửi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
            </TableRow>
          </TableHeader>
          {renderTableBody()}
        </Table>
      </div>
    </div>
  );
}
