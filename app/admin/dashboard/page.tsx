"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, BarChart3 } from "lucide-react";
import { getStoredUser } from "@/lib/auth";

export default function InstructorDashboard() {
  const user = getStoredUser();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Xin chào, {user.full_name}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Bạn là một giảng viên tuyệt vời. Hãy tiếp tục tạo những khóa học chất
          lượng
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Khóa học của tôi
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-xs text-gray-600 mt-1">khóa học</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học viên</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-xs text-gray-600 mt-1">học viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu tháng này
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">$0</p>
            <p className="text-xs text-gray-600 mt-1">doanh thu</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Khóa học gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Chưa có khóa học nào. Tạo khóa học đầu tiên của bạn!
              </p>
              <Button>Tạo khóa học mới</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng bài giảng:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bài giảng hoàn thành:</span>
                <span className="font-medium">0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rating trung bình:</span>
                <span className="font-medium">★ 0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to action */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Bắt đầu tạo khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Chia sẻ kiến thức của bạn với hàng nghìn học viên trên nền tảng của
            chúng tôi. Tạo khóa học chất lượng cao và kiếm doanh thu từ việc
            giảng dạy.
          </p>
          <Button>Tạo khóa học đầu tiên</Button>
        </CardContent>
      </Card>
    </div>
  );
}
