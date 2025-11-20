// app/(protected)/instructor/profile/page.tsx
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
import { Loader2 } from "lucide-react";
import { ProfilePageSkeleton } from "@/components/skeleton/ProfilePageSkeleton";
import { FileUpload } from "@/components/shared/FileUpload";
import { AxiosError } from "axios";

// =================== THAY ĐỔI COMPONENT NÀY ===================
const InstructorApplication = ({
  profile,
  onProfileUpdate,
}: {
  profile: InstructorProfile | null;
  onProfileUpdate: () => void;
}) => {
  const isUpdate = !!profile;
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

  // State mới để giữ file CV
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: InstructorApplicationForm) => {
    setIsSubmitting(true);
    try {
      // BƯỚC 1: Tạo hoặc cập nhật thông tin profile trước
      let updatedProfile: InstructorProfile;
      if (isUpdate) {
        updatedProfile = await instructorService.updateProfile(data);
      } else {
        updatedProfile = await instructorService.createProfile(data);
      }
      toast.success(
        `Hồ sơ đã được ${isUpdate ? "cập nhật" : "nộp"} thành công.`
      );

      // BƯỚC 2: Nếu có file CV được chọn, tiến hành upload
      if (cvFile) {
        toast.info("Đang tải lên CV...");
        await instructorService.uploadCv(cvFile);
        toast.success("Tải lên CV thành công!");
      }

      // BƯỚC 3: Cập nhật lại toàn bộ trang
      onProfileUpdate();
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
          Điền thông tin và tải lên CV của bạn. Việc nộp hoặc cập nhật sẽ đưa hồ
          sơ vào trạng thái chờ duyệt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form giờ sẽ bao gồm cả upload */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ... các trường Textarea (bio, education...) giữ nguyên ... */}
          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              {...register("bio")}
              rows={3}
              placeholder="Giới thiệu ngắn về bản thân..."
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
              placeholder="Kinh nghiệm giảng dạy..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Chứng chỉ</label>
            <Textarea
              {...register("certificates")}
              rows={2}
              placeholder="Các chứng chỉ chuyên môn..."
            />
          </div>

          {/* === TÍCH HỢP FILE UPLOAD VÀO ĐÂY === */}
          <FileUpload
            label="Tải lên CV (PDF)"
            onFileSelect={(file) => setCvFile(file)}
            acceptedTypes={{ "application/pdf": [".pdf"] }}
          />

          <Button
            type="submit"
            disabled={isSubmitting || (!isDirty && !cvFile)}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isUpdate ? "Cập nhật và Gửi duyệt" : "Nộp hồ sơ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// =================== COMPONENT CHÍNH GIỜ ĐƠN GIẢN HƠN ===================
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
      if (error instanceof AxiosError) {
        if (error.response?.status !== 404) {
          console.error(
            "Failed to fetch instructor profile (Axios Error):",
            error
          );
          toast.error(
            error.response?.data?.message || "Không thể tải hồ sơ của bạn."
          );
        }
      } else {
        console.error(
          "Failed to fetch instructor profile (Generic Error):",
          error
        );
        toast.error("Đã xảy ra lỗi không xác định.");
      }
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

      {/* Component chính giờ đã bao gồm cả upload */}
      <InstructorApplication profile={profile} onProfileUpdate={fetchProfile} />

      {/* KHỐI UPLOAD RIÊNG CÓ THỂ ĐƯỢC XÓA BỎ */}
      {/* 
      <Card>
        ...
      </Card> 
      */}
    </div>
  );
}
