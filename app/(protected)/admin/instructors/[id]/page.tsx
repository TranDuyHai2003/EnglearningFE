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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  FileSignature,
  FileText,
  Phone,
  Video,
  XCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function InstructorProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = Number(params.id);

  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    type: "interviewing" | "rejected" | null;
  }>({
    isOpen: false,
    type: null,
  });
  const [reviewNote, setReviewNote] = useState("");
  const [reviewLink, setReviewLink] = useState("");

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await instructorService.getProfileById(profileId);
      setProfile(data);
    } catch (error) {
      toast.error("Không thể tải hồ sơ.");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) fetchProfile();
  }, [profileId]);

  const openReviewModal = (type: "interviewing" | "rejected") => {
    setReviewModal({ isOpen: true, type });
    if (type === "interviewing" && profile) {
      setReviewNote(profile.interview_notes || "");
      setReviewLink(profile.meeting_link || "");
    } else {
      setReviewNote("");
      setReviewLink("");
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal.type || !profile) return;

    if (reviewModal.type === "rejected" && !reviewNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    setIsMutating(true);
    try {
      await instructorService.reviewProfile(
        profile.profile_id,
        reviewModal.type === "interviewing" ? "interviewing" : "rejected",
        reviewModal.type === "rejected" ? reviewNote : undefined,
        reviewModal.type === "interviewing" ? reviewNote : undefined,
        reviewModal.type === "interviewing" ? reviewLink : undefined
      );
      toast.success("Cập nhật trạng thái thành công!");
      setReviewModal({ isOpen: false, type: null });
      fetchProfile();
    } catch (error) {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleApprove = async () => {
    if (profile?.approval_status !== "interviewing") {
      if (
        !confirm(
          "Xác nhận: Bạn muốn PHÊ DUYỆT giảng viên này mà không qua phỏng vấn?"
        )
      )
        return;
    }

    setIsMutating(true);
    try {
      await instructorService.reviewProfile(profileId, "approved");
      toast.success("Đã phê duyệt giảng viên!");
      fetchProfile();
    } catch (error) {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading)
    return (
      <div className="container py-10 text-center">Đang tải dữ liệu...</div>
    );

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
      </Button>

      {profile && (
        <Card className="shadow-md border-slate-200">
          <CardHeader className="bg-slate-50/50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-primary">
                  {profile.user?.full_name}
                </CardTitle>
                <CardDescription className="text-lg mt-1">
                  {profile.user?.email} • {profile.user?.phone || "Chưa có SĐT"}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  className={`text-base px-4 py-1 capitalize shadow-sm ${
                    profile.approval_status === "approved"
                      ? "bg-green-600 hover:bg-green-700"
                      : profile.approval_status === "rejected"
                      ? "bg-red-600 hover:bg-red-700"
                      : profile.approval_status === "interviewing"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  {profile.approval_status === "interviewing"
                    ? "Đang phỏng vấn"
                    : profile.approval_status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ID Hồ sơ: {profile.profile_id}
                </span>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-slate-800">
                  <FileSignature className="h-5 w-5 text-blue-600" /> Hồ sơ CV
                </h4>
                {profile.cv_url ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm bg-slate-100 p-2 rounded text-slate-600">
                      <FileText className="h-4 w-4" />
                      <span className="truncate">
                        {profile.cv_file_name || "cv.pdf"}
                      </span>
                    </div>
                    <a
                      href={`${baseURL}${profile.cv_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Download className="mr-2 h-4 w-4" /> Tải xuống / Xem
                      </Button>
                    </a>
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500 py-2">
                    Chưa tải lên CV.
                  </p>
                )}
              </div>

              <div className="p-5 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-slate-800">
                  <Video className="h-5 w-5 text-red-600" /> Video Giới thiệu
                </h4>
                {profile.intro_video_url ? (
                  <div className="flex flex-col gap-3">
                    <a
                      href={profile.intro_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Video className="mr-2 h-4 w-4" /> Xem trên
                        YouTube/Drive
                      </Button>
                    </a>
                    <p className="text-xs text-muted-foreground truncate bg-slate-50 p-2 rounded">
                      {profile.intro_video_url}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500 py-2">
                    Chưa cung cấp video.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg border-b pb-2 mb-3 text-slate-800">
                  Giới thiệu
                </h4>
                <p className="text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-lg border">
                  {profile.bio || "Chưa cập nhật."}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg border-b pb-2 mb-3 text-slate-800">
                    Học vấn
                  </h4>
                  <p className="text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-lg border">
                    {profile.education || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg border-b pb-2 mb-3 text-slate-800">
                    Kinh nghiệm
                  </h4>
                  <p className="text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-lg border">
                    {profile.experience || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg border-b pb-2 mb-3 text-slate-800">
                  Chứng chỉ
                </h4>
                <p className="text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-lg border">
                  {profile.certificates || "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {(profile.approval_status === "interviewing" ||
                profile.interview_notes) && (
                <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5" /> Thông tin Phỏng vấn
                  </h4>
                  {profile.interview_date && (
                    <p className="text-sm mb-1 text-blue-900">
                      <strong>Ngày cập nhật:</strong>{" "}
                      {new Date(profile.interview_date).toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-blue-900">
                    <strong>Ghi chú Admin:</strong>{" "}
                    {profile.interview_notes || "Không có ghi chú"}
                  </p>
                  {profile.meeting_link && (
                    <p className="text-sm text-blue-900 mt-1">
                      <strong>Link cuộc họp:</strong>{" "}
                      <a
                        href={profile.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-700"
                      >
                        {profile.meeting_link}
                      </a>
                    </p>
                  )}
                </div>
              )}

              {profile.approval_status === "rejected" &&
                profile.rejection_reason && (
                  <div className="p-5 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-1 flex items-center gap-2">
                      <XCircle className="h-5 w-5" /> Lý do từ chối
                    </h4>
                    <p className="text-red-700 mt-2">
                      {profile.rejection_reason}
                    </p>
                  </div>
                )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 bg-slate-50 p-6 rounded-b-xl border-t">
            {profile.approval_status !== "approved" && (
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => openReviewModal("interviewing")}
                disabled={isMutating}
              >
                <Phone className="mr-2 h-4 w-4" />
                {profile.approval_status === "interviewing"
                  ? "Cập nhật PV"
                  : "Mời Phỏng vấn"}
              </Button>
            )}

            {profile.approval_status !== "rejected" && (
              <Button
                variant="destructive"
                onClick={() => openReviewModal("rejected")}
                disabled={isMutating}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {profile.approval_status === "approved"
                  ? "Hủy duyệt / Thu hồi"
                  : "Từ chối"}
              </Button>
            )}

            {profile.approval_status !== "approved" && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={isMutating}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {profile.approval_status === "rejected"
                  ? "Duyệt lại"
                  : "Phê duyệt Chính thức"}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      <Dialog
        open={reviewModal.isOpen}
        onOpenChange={(open) =>
          !open && setReviewModal((prev) => ({ ...prev, isOpen: false }))
        }
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {reviewModal.type === "interviewing"
                ? "Gửi lời mời Phỏng vấn"
                : "Từ chối Hồ sơ"}
            </DialogTitle>
            <DialogDescription>
              {reviewModal.type === "interviewing"
                ? "Nhập thông tin lịch hẹn, link họp online hoặc hướng dẫn tiếp theo."
                : "Vui lòng nhập lý do từ chối."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {reviewModal.type === "interviewing" && (
              <div className="grid gap-2">
                <Label htmlFor="link">Link cuộc họp (Google Meet / Zoom)</Label>
                <Input
                  id="link"
                  value={reviewLink}
                  onChange={(e) => setReviewLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="note">
                {reviewModal.type === "interviewing"
                  ? "Ghi chú / Lịch hẹn"
                  : "Lý do từ chối"}
              </Label>
              <Textarea
                id="note"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={
                  reviewModal.type === "interviewing"
                    ? "VD: 10:00 AM ngày 20/11..."
                    : "VD: Hồ sơ thiếu thông tin..."
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setReviewModal((prev) => ({ ...prev, isOpen: false }))
              }
            >
              Hủy bỏ
            </Button>
            <Button
              variant={
                reviewModal.type === "rejected" ? "destructive" : "default"
              }
              onClick={handleSubmitReview}
              disabled={isMutating}
            >
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reviewModal.type === "interviewing"
                ? "Gửi lời mời"
                : "Xác nhận Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
