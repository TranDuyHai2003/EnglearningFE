// app/(protected)/admin/instructors/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { instructorService } from "@/lib/api/instructorService";
import { InstructorProfile } from "@/lib/types";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ProfileDetailSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-5 w-1/3 mt-2" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-1/3" />
      </div>
    </CardContent>
  </Card>
);

export default function InstructorProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = Number(params.id);

  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profileId) return;
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await instructorService.getProfileById(profileId);
        setProfile(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Không thể tải hồ sơ."
        );
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [profileId, router]);

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
      </Button>

      {isLoading ? (
        <ProfileDetailSkeleton />
      ) : (
        profile && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">
                    {profile.user?.full_name}
                  </CardTitle>
                  <CardDescription>{profile.user?.email}</CardDescription>
                </div>
                <Badge variant="secondary" className="capitalize text-base">
                  {profile.approval_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg">Bio</h4>
                <p className="text-muted-foreground mt-1">
                  {profile.bio || "Chưa cung cấp"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Học vấn</h4>
                <p className="text-muted-foreground mt-1">
                  {profile.education || "Chưa cung cấp"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Kinh nghiệm</h4>
                <p className="text-muted-foreground mt-1">
                  {profile.experience || "Chưa cung cấp"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Tài liệu</h4>
                {profile.cv_url ? (
                  <a
                    href={`${baseURL}${profile.cv_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Xem/Tải CV (
                      {decodeURIComponent(profile.cv_file_name || "")})
                    </Button>
                  </a>
                ) : (
                  <p className="text-muted-foreground mt-1">Chưa tải lên CV.</p>
                )}
                {/* Thêm phần hiển thị chứng chỉ ở đây nếu cần */}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
