"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Clock } from "lucide-react";
import { getStoredUser } from "@/lib/auth";

export default function StudentDashboard() {
  const user = getStoredUser();

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Chào mừng, {user.full_name}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Hãy bắt đầu hành trình học tập của bạn hôm nay
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Khóa học đang học
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
            <CardTitle className="text-sm font-medium">
              Khóa học hoàn thành
            </CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-xs text-gray-600 mt-1">khóa học</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng thời gian học
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-xs text-gray-600 mt-1">giờ</p>
          </CardContent>
        </Card>
      </div>

      {/* Featured courses */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Khóa học nổi bật
        </h2>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 mb-4">
                Chưa có khóa học nào. Hãy khám phá các khóa học mới!
              </p>
              <Button>Xem tất cả khóa học</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My courses section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Khóa học của tôi
        </h2>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 mb-4">
                Bạn chưa đăng ký khóa học nào
              </p>
              <Button variant="outline">Tìm kiếm khóa học</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
