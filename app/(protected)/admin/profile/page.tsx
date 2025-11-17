"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { UserProfile } from "@/components/shared/UserProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfilePageSkeleton } from "@/components/skeleton/ProfilePageSkeleton";

export default function AdminProfilePage() {
  const { user, isLoading } = useAuth({ redirectToLoginIfFail: true });
  console.log(user, "user");
  if (isLoading) return <ProfilePageSkeleton />;
  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">
        Trang cá nhân Admin
      </h1>
      <UserProfile user={user} />
    </div>
  );
}
