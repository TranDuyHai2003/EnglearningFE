import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function CoursePlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      {/* Header này có thể được loại bỏ hoặc tùy biến nếu bạn muốn header chung
          cho tất cả các trang, nhưng chúng ta sẽ tạo một header riêng cho trang player
          để có nhiều chức năng hơn. Hiện tại cứ để nguyên. */}
      <header className="sticky top-0 z-50 flex items-center h-16 px-4 border-b bg-background shadow-sm md:px-6">
        <Link
          href="/student/my-courses"
          className="flex items-center gap-2 font-semibold"
        >
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline text-lg">Khóa học của tôi</span>
        </Link>
      </header>
      <div className="flex-1 flex overflow-hidden">{children}</div>
    </div>
  );
}
