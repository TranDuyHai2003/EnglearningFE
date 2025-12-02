"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { courseService } from "@/lib/api/courseService";
import { Course, Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useDebounce } from "use-debounce";
import Image from "next/image";

const CourseCard = ({ course }: { course: Course }) => (
  <Link href={`/courses/${course.course_id}`}>
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative w-full h-40">
          <Image
            src={course.thumbnail_url || "/placeholder.png"}
            alt={course.title}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-t-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <Badge variant="secondary" className="mb-2">
          {course.category?.name || "Uncategorized"}
        </Badge>
        <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(course.price)}
        </p>
        <Badge variant="outline" className="capitalize">
          {course.level}
        </Badge>
      </CardFooter>
    </Card>
  </Link>
);

const CourseGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <Card key={i}>
        <div className="flex flex-col space-y-3 p-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </Card>
    ))}
  </div>
);

export default function CoursesPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<Course[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category_id") || ""
  );

  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsLoading(true);
    setSelectedCategory(e.target.value);
  };

  useEffect(() => {
    courseService
      .listCategories()
      .then(setCategories)
      .catch(() => toast.error("Không thể tải danh mục."));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("category_id", selectedCategory);

    const newUrl = `${pathname}?${params.toString()}`;
    window.history.pushState(null, "", newUrl);

    courseService
      .listCourses({
        search: debouncedSearch,
        category_id: selectedCategory ? Number(selectedCategory) : undefined,
        status: "published",
        approval_status: "approved",
      })
      .then((response) => setCourses(response.data))
      .catch((err) => {
        toast.error(err.message || "Lỗi khi tải khóa học.");
        setCourses([]);
      })
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, selectedCategory, pathname]);

  return (
    <div className="container mx-auto py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold">Khám phá Khóa học</h1>
        <p className="text-muted-foreground mt-2">
          Tìm kiếm khóa học phù hợp với bạn từ hàng trăm lựa chọn.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Tìm kiếm khóa học..."
          className="flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded-md bg-background"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <CourseGridSkeleton />
      ) : courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.course_id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">Không tìm thấy khóa học nào</h2>
          <p className="text-muted-foreground mt-2">
            Vui lòng thử lại với từ khóa hoặc bộ lọc khác.
          </p>
        </div>
      )}
    </div>
  );
}
