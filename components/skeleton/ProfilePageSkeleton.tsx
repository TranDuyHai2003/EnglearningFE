import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfilePageSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Skeleton className="h-9 w-64 mx-auto mb-8" />
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-24 ml-auto" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/2 ml-4" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/2 ml-4" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/2 ml-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
