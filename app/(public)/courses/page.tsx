import { Suspense } from "react";
import CoursesClientComponent from "./CoursesClientComponent";
import { Skeleton } from "@/components/ui/skeleton";

const CoursesPageSkeleton = () => (
  <div className="container mx-auto py-12">
    <header className="text-center mb-12">
      <Skeleton className="h-10 w-1/2 mx-auto" />
      <Skeleton className="h-5 w-3/4 mx-auto mt-4" />
    </header>
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <Skeleton className="h-10 grow" />
      <Skeleton className="h-10 w-48" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export default function CoursesPage() {
  return (
    <Suspense fallback={<CoursesPageSkeleton />}>
      <CoursesClientComponent />
    </Suspense>
  );
}
