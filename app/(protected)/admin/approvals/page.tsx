"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PendingCoursesTable } from "./_components/PendingCoursesTable";
import { PendingLessonsTable } from "./_components/PendingLessonsTable";

export default function AdminApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phê duyệt nội dung</h1>
        <p className="text-muted-foreground">
          Quản lý và phê duyệt các khóa học và bài học được gửi từ giảng viên.
        </p>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Khóa học chờ duyệt</TabsTrigger>
          <TabsTrigger value="lessons">Bài học chờ duyệt</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Khóa học đang chờ</CardTitle>
              <CardDescription>
                Danh sách các khóa học đã được gửi và đang chờ phê duyệt công khai.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingCoursesTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Bài học đang chờ</CardTitle>
              <CardDescription>
                Danh sách các bài học mới hoặc cập nhật đang chờ phê duyệt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingLessonsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
