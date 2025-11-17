"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { UserProfile } from "@/components/shared/UserProfile"; // Import component chung
import { Skeleton } from "@/components/ui/skeleton"; // Có thể dùng lại skeleton
import { ProfilePageSkeleton } from "@/components/skeleton/ProfilePageSkeleton";

export default function StudentProfilePage() {
  const { user, isLoading } = useAuth({ redirectToLoginIfFail: true });

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Trang cá nhân</h1>
      <UserProfile user={user} />
    </div>
  );
}
