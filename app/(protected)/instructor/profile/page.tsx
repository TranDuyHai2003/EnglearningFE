"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserProfile } from "@/components/shared/UserProfile";
import { instructorService } from "@/lib/api/instructorService";
import { useForm } from "react-hook-form";
import { InstructorApplicationForm, InstructorProfile } from "@/lib/types";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { ProfilePageSkeleton } from "@/components/skeleton/ProfilePageSkeleton";

// Form nộp/cập nhật hồ sơ
const InstructorApplication = ({
  profile,
  onProfileUpdate,
}: {
  profile: InstructorProfile | null;
  onProfileUpdate: () => void;
}) => {
  const isUpdate = !!profile; // Nếu có profile là update, không thì là create
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<InstructorApplicationForm>({
    defaultValues: {
      bio: profile?.bio || "",
      education: profile?.education || "",
      experience: profile?.experience || "",
      certificates: profile?.certificates || "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: InstructorApplicationForm) => {
    setIsSubmitting(true);
    try {
      if (isUpdate) {
        await instructorService.updateProfile(data);
      } else {
        await instructorService.createProfile(data);
      }
      toast.success(
        `Hồ sơ đã được ${
          isUpdate ? "cập nhật" : "nộp"
        } thành công và đang chờ duyệt lại.`
      );
      onProfileUpdate(); // Tải lại dữ liệu ở component cha
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Thao tác thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isUpdate ? "Cập nhật hồ sơ giảng viên" : "Nộp hồ sơ giảng viên"}
        </CardTitle>
        <CardDescription>
          Cung cấp thông tin để chúng tôi có thể xem xét và phê duyệt tài khoản
          của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              {...register("bio")}
              rows={3}
              placeholder="Giới thiệu ngắn về bản thân và chuyên môn của bạn..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Học vấn</label>
            <Textarea
              {...register("education")}
              rows={2}
              placeholder="Các bằng cấp, trường đại học..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Kinh nghiệm</label>
            <Textarea
              {...register("experience")}
              rows={2}
              placeholder="Kinh nghiệm giảng dạy hoặc làm việc liên quan..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Chứng chỉ</label>
            <Textarea
              {...register("certificates")}
              rows={2}
              placeholder="Các chứng chỉ chuyên môn (IELTS, TESOL...)"
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isUpdate ? "Cập nhật hồ sơ" : "Nộp hồ sơ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Trang Profile chính
export default function InstructorProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth({
    redirectToLoginIfFail: true,
  });
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const myProfile = await instructorService.getMyProfile();
      setProfile(myProfile);
    } catch (error) {
      console.error("Failed to fetch instructor profile:", error);
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  if (isAuthLoading || (isProfileLoading && !profile && user)) {
    return <ProfilePageSkeleton />;
  }
  if (!user) return null;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <UserProfile user={user} />
      {profile?.approval_status === "approved" && (
        <p className="text-center p-4 bg-green-100 rounded-md text-green-800 font-medium">
          Hồ sơ của bạn đã được phê duyệt!
        </p>
      )}
      {profile?.approval_status === "pending" && (
        <p className="text-center p-4 bg-yellow-100 rounded-md text-yellow-800">
          Hồ sơ của bạn đang chờ duyệt.
        </p>
      )}
      {profile?.approval_status === "rejected" && (
        <p className="text-center p-4 bg-red-100 rounded-md text-red-800">
          Hồ sơ bị từ chối. Lý do: {profile.rejection_reason}
        </p>
      )}

      <InstructorApplication profile={profile} onProfileUpdate={fetchProfile} />
    </div>
  );
}
