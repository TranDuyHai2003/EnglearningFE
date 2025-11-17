"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getStoredUser } from "@/lib/auth/utils";

export default function AdminDashboard() {
  // ✅ Get user directly - no useState
  const user = getStoredUser();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Chào mừng, {user.full_name}! 👋
        </h1>
        <p className="text-lg text-gray-600">Quản lý hệ thống e-learning</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng người dùng
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-xs text-gray-600 mt-1">người dùng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khóa học</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-xs text-gray-600 mt-1">khóa học</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">$0</p>
            <p className="text-xs text-gray-600 mt-1">doanh thu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tăng trưởng</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">0%</p>
            <p className="text-xs text-gray-600 mt-1">tháng này</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Alert className="bg-green-50 border-green-200">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          ✓ Hệ thống hoạt động bình thường
        </AlertDescription>
      </Alert>

      {/* Main sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chờ duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">
                  Không có yêu cầu chờ duyệt
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">Chưa có hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Xem và quản lý tất cả người dùng trong hệ thống
            </p>
            <Button variant="outline" className="w-full">
              Xem người dùng
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quản lý khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Duyệt và quản lý các khóa học
            </p>
            <Button variant="outline" className="w-full">
              Xem khóa học
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quản lý giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Xem và quản lý các giao dịch thanh toán
            </p>
            <Button variant="outline" className="w-full">
              Xem giao dịch
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Phiên bản</p>
              <p className="text-lg font-semibold">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Ngôn ngữ</p>
              <p className="text-lg font-semibold">Tiếng Việt</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Thời gian khởi động</p>
              <p className="text-lg font-semibold">
                {new Date().toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
