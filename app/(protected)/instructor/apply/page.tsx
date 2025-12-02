"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { instructorService } from "@/lib/api/instructorService";
import { InstructorApplicationForm } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud } from "lucide-react";

export default function InstructorApplyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstructorApplicationForm>();

  const onSubmit = async (data: InstructorApplicationForm) => {
    if (!cvFile) {
      toast.error("Vui lòng tải lên file CV của bạn.");
      return;
    }

    setIsLoading(true);
    try {
      await instructorService.createProfile({
        ...data,
        cv_url: "",
      });

      await instructorService.uploadCv(cvFile);

      toast.success("Nộp hồ sơ thành công! Vui lòng chờ xét duyệt.");
      router.push("/instructor/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Nộp hồ sơ thất bại"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Đăng ký Giảng viên
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Nộp hồ sơ năng lực để gia nhập đội ngũ giảng viên.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="p-5 bg-blue-50 rounded-lg border border-blue-100 space-y-5">
            <h3 className="font-semibold text-blue-900">Tài liệu xét duyệt</h3>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tải lên CV (PDF/Word) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="relative grow">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Chấp nhận định dạng PDF, DOC, DOCX. Tối đa 5MB.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Link Video Dạy thử / Giới thiệu{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("intro_video_url", {
                  required: "Vui lòng nhập link Video",
                })}
                type="url"
                placeholder="https://youtube.com/..."
                className="bg-white"
              />
              {errors.intro_video_url && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.intro_video_url.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Quay một video ngắn (1-2 phút) giới thiệu bản thân và phương
                pháp dạy.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Giới thiệu bản thân (Bio){" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("bio", { required: "Vui lòng nhập giới thiệu" })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.bio && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.bio.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Học vấn
                </label>
                <textarea
                  {...register("education", {
                    required: "Vui lòng nhập học vấn",
                  })}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kinh nghiệm
                </label>
                <textarea
                  {...register("experience", {
                    required: "Vui lòng nhập kinh nghiệm",
                  })}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Chứng chỉ
              </label>
              <textarea
                {...register("certificates", {
                  required: "Vui lòng nhập chứng chỉ",
                })}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="IELTS 8.0, TESOL..."
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải
                lên...
              </>
            ) : (
              "Gửi hồ sơ"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
