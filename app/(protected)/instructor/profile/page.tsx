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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Lock,
  Calendar,
  FileCheck,
  AlertCircle,
  UploadCloud,
  X,
} from "lucide-react";
import { ProfilePageSkeleton } from "@/components/skeleton/ProfilePageSkeleton";
import { Label } from "@/components/ui/label";

const InstructorApplication = ({
  profile,
  onProfileUpdate,
}: {
  profile: InstructorProfile | null;
  onProfileUpdate: () => void;
}) => {
  const isUpdate = !!profile;

  const isLocked =
    profile?.approval_status === "approved" ||
    profile?.approval_status === "interviewing";

  const {
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<InstructorApplicationForm>({
    defaultValues: {
      bio: profile?.bio || "",
      education: profile?.education || "",
      experience: profile?.experience || "",
      certificates: profile?.certificates || "",
      intro_video_url: profile?.intro_video_url || "",
    },
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: InstructorApplicationForm) => {
    setIsSubmitting(true);
    try {
      if (isUpdate) {
        await instructorService.updateProfile(data);
      } else {
        await instructorService.createProfile(data);
      }

      if (cvFile) {
        toast.info("Đang tải lên CV mới...");
        await instructorService.uploadCv(cvFile);
      }

      toast.success(
        isUpdate ? "Cập nhật thành công!" : "Nộp hồ sơ thành công!"
      );
      onProfileUpdate();
      setCvFile(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Thao tác thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b pb-4">
        <CardTitle>
          {isUpdate ? "Hồ sơ Giảng viên" : "Đăng ký Giảng viên"}
        </CardTitle>
        <CardDescription>
          {isLocked
            ? "Hồ sơ đã được ghi nhận. CV và Video đã bị khóa chỉnh sửa."
            : "Cập nhật thông tin mới nhất để ban quản trị xét duyệt."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div
            className={`p-5 rounded-lg border transition-colors ${
              isLocked
                ? "bg-gray-100 border-gray-200"
                : "bg-blue-50 border-blue-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4
                className={`font-semibold flex items-center gap-2 ${
                  isLocked ? "text-gray-600" : "text-blue-900"
                }`}
              >
                {isLocked ? <Lock className="h-4 w-4" /> : null}
                Tài liệu xét duyệt
              </h4>
              {isLocked && (
                <span className="text-xs font-medium px-2 py-1 bg-gray-200 rounded text-gray-600">
                  Đã khóa
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  File CV
                </label>

                {profile?.cv_file_name && !cvFile && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded border border-green-200 mb-3">
                    <FileCheck className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate font-medium">
                      {profile.cv_file_name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                      (Đã lưu)
                    </span>
                  </div>
                )}

                {cvFile && (
                  <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded border border-blue-200 mb-3">
                    <UploadCloud className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate font-medium">{cvFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setCvFile(null)}
                      className="ml-auto hover:bg-blue-100 p-1 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-blue-500" />
                    </button>
                  </div>
                )}

                {!isLocked && (
                  <div className="mt-2">
                    <Input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor="cv-upload"
                      className={`flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        cvFile
                          ? "border-blue-300 bg-blue-50/50"
                          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                      }`}
                    >
                      <UploadCloud
                        className={`h-5 w-5 ${
                          cvFile ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          cvFile ? "text-blue-600" : "text-gray-600"
                        }`}
                      >
                        {cvFile ? "Chọn file khác" : "Nhấn để tải lên CV"}
                      </span>
                    </Label>
                  </div>
                )}

                {!isLocked && !profile?.cv_file_name && !cvFile && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Chưa có CV, vui lòng tải lên.
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Link Video Demo
                </label>
                <Input
                  {...register("intro_video_url", {
                    required: !isLocked && "Bắt buộc nhập",
                  })}
                  disabled={isLocked || isSubmitting}
                  placeholder="https://youtube.com/..."
                  className="bg-white"
                />
                {errors.intro_video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.intro_video_url.message}
                  </p>
                )}
              </div>
            </div>

            {isLocked && (
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground italic">
                <AlertCircle className="h-3 w-3" />
                Để cập nhật CV hoặc Video sau khi đã duyệt, vui lòng liên hệ
                Admin.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Giới thiệu (Bio)
              </label>
              <Textarea
                {...register("bio")}
                rows={3}
                disabled={isSubmitting}
                placeholder="Giới thiệu ngắn..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Học vấn
                </label>
                <Textarea
                  {...register("education")}
                  rows={2}
                  disabled={isSubmitting}
                  placeholder="Đại học..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Kinh nghiệm
                </label>
                <Textarea
                  {...register("experience")}
                  rows={2}
                  disabled={isSubmitting}
                  placeholder="Năm kinh nghiệm..."
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Chứng chỉ
              </label>
              <Textarea
                {...register("certificates")}
                rows={2}
                disabled={isSubmitting}
                placeholder="IELTS, TESOL..."
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || (!isDirty && !cvFile)}
            className="w-full md:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdate ? "Lưu thay đổi" : "Nộp hồ sơ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

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
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  if (isAuthLoading || (isProfileLoading && user)) {
    return <ProfilePageSkeleton />;
  }
  if (!user) return null;

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-5xl">
      <UserProfile user={user} />

      {profile?.approval_status === "approved" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800 font-medium">
          🎉 Chúc mừng! Hồ sơ của bạn đã được phê duyệt.
        </div>
      )}
      {profile?.approval_status === "pending" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-yellow-800">
          ⏳ Hồ sơ đang chờ duyệt. Vui lòng kiên nhẫn.
        </div>
      )}
      {profile?.approval_status === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-800">
          ❌ Hồ sơ bị từ chối: <strong>{profile.rejection_reason}</strong>.
        </div>
      )}

      {(profile?.approval_status === "interviewing" ||
        profile?.interview_notes) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5" /> Thông tin Phỏng vấn
          </h3>
          <div className="space-y-2 text-blue-800">
            {profile?.interview_date && (
              <p>
                <strong>Thời gian:</strong>{" "}
                {new Date(profile.interview_date).toLocaleString()}
              </p>
            )}
            <p>
              <strong>Ghi chú từ Admin:</strong>{" "}
              {profile?.interview_notes || "Vui lòng chờ Admin liên hệ."}
            </p>
            {profile?.meeting_link && (
              <p>
                <strong>Link cuộc họp:</strong>{" "}
                <a
                  href={profile.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {profile.meeting_link}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      <InstructorApplication profile={profile} onProfileUpdate={fetchProfile} />
    </div>
  );
}
