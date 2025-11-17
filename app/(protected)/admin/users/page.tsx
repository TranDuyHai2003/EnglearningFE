"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AuthenticatedUser, UserRole, UserStatus } from "@/lib/types";
import { userService } from "@/lib/api/userService";
import { useDebounce } from "use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

// ----------------- Skeleton Table -----------------
const UsersTableSkeleton = () => (
  <TableBody>
    {[...Array(5)].map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        {[...Array(6)].map((_, j) => (
          <TableCell key={j}>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
);

// ----------------- Component chính -----------------
export default function AdminUsersPage() {
  const [users, setUsers] = useState<AuthenticatedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    keyword: "",
    role: undefined as UserRole | undefined,
    status: undefined as UserStatus | undefined,
  });

  const [debouncedKeyword] = useDebounce(filters.keyword, 500);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.listUsers({
        page,
        limit: 10,
        keyword: debouncedKeyword,
        role: filters.role,
        status: filters.status,
      });

      const usersData = res.data || [];
      const meta = res.meta;

      setUsers(usersData);
      setTotal(meta.total || 0);
      setTotalPages(meta.total_pages || 1);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách người dùng.";
      setError(errorMessage);
      toast.error(errorMessage);
      setUsers([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedKeyword, filters.role, filters.status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ----------------- Xử lý thay đổi bộ lọc -----------------
  const handleFilterChange = (key: "role" | "status", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : (value as UserRole | UserStatus),
    }));
    setPage(1);
  };

  // ----------------- Hiển thị bảng -----------------
  const renderTableBody = () => {
    if (isLoading && users.length === 0) return <UsersTableSkeleton />;

    if (error) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24 text-red-600">
              {error}
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    if (!users || users.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24">
              Không tìm thấy người dùng nào.
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell className="font-medium">{user.full_name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge
                variant={
                  user.role.includes("admin") ? "destructive" : "secondary"
                }
              >
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.status === "active" ? "default" : "outline"}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Xem
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  // ----------------- Render chính -----------------
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Quản lý Người dùng</h1>

      {/* Bộ lọc */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Tìm kiếm theo email, họ tên..."
          value={filters.keyword}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, keyword: e.target.value }))
          }
          className="max-w-sm"
        />
        <Select
          value={filters.role || "all"}
          onValueChange={(value) => handleFilterChange("role", value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="student">Học viên</SelectItem>
            <SelectItem value="instructor">Giảng viên</SelectItem>
            <SelectItem value="support_admin">Support Admin</SelectItem>
            <SelectItem value="system_admin">System Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="locked">Locked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bảng hiển thị */}
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Họ và Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          {renderTableBody()}
        </Table>
      </div>

      {/* Phân trang */}
      <div className="flex items-center justify-between py-4">
        <span className="text-sm text-muted-foreground">
          Tổng cộng: {total} người dùng
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
