"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStoredUser } from "@/lib/auth/utils";
import { Award, BookOpenCheck, Clock } from "lucide-react";

const featuredCourses = [
  {
    id: 1,
    title: "IELTS Foundation: Xây gốc vững chắc cho người mới",
    instructor: "Ms. Anna",
    price: 3500000,
    imageUrl:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop",
    level: "Beginner",
  },
  {
    id: 2,
    title: "Giao tiếp thành thạo: Tự tin nói chuyện trong 3 tháng",
    instructor: "Mr. David",
    price: 2800000,
    imageUrl:
      "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=800&auto=format&fit=crop",
    level: "Intermediate",
  },
  {
    id: 3,
    title: "TOEIC Master: Chinh phục mục tiêu 800+",
    instructor: "Ms. Jenny",
    price: 4200000,
    imageUrl:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop",
    level: "Advanced",
  },
];

const testimonials = [
  {
    name: "Minh Anh",
    role: "Sinh viên",
    quote:
      "Lộ trình học rất rõ ràng và giảng viên cực kỳ tâm huyết. Em đã tăng 1.5 band IELTS chỉ sau một khóa học!",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  },
  {
    name: "Hoàng Long",
    role: "Nhân viên văn phòng",
    quote:
      "Các bài học giao tiếp rất thực tế, giúp tôi tự tin hơn hẳn trong các cuộc họp với đối tác nước ngoài. Rất đáng tiền!",
    avatarUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
  },
  {
    name: "Thùy Chi",
    role: "Du học sinh",
    quote:
      "Nền tảng học linh hoạt, em có thể học mọi lúc mọi nơi. Nhờ EngBreaking mà em đã chuẩn bị tốt cho hành trình du học của mình.",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
  },
];

export const Logo = () => (
  <Link
    href="/"
    className="flex items-center gap-2 lg:text-lg xl:text-2xl  font-bold text-gray-800"
  >
    <div className="flex -space-x-2.5">
      <div className="w-5 h-7 bg-green-300 rounded-md rotate-[-20deg]"></div>
      <div className="w-5 h-7 bg-blue-300 rounded-md rotate-[-20deg] opacity-90"></div>
    </div>
    <span>EngBreaking</span>
  </Link>
);

import { Header } from "@/components/layout/Header";
import { useAuth } from "@/lib/hooks/useAuth";

const HeroSection = () => {
  const { user } = useAuth({ redirectToLoginIfFail: false });
  const [mounted, setMounted] = useState(false);

  // Đánh dấu đã mount thành công lên trình duyệt
  useEffect(() => {
    setMounted(true);
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/courses";
    if (user.role.includes("admin")) return "/admin/dashboard";
    return `/${user.role}/dashboard`;
  };

  // Logic hiển thị: Nếu chưa mounted (đang SSR), luôn hiển thị trạng thái mặc định (Guest)
  const buttonLink = mounted && user ? getDashboardLink() : "/courses";
  const buttonText = mounted && user ? "Vào Dashboard" : "Khám phá khóa học";

  return (
    <section className="flex flex-col md:flex-row min-h-[calc(100vh-68px)]">
      <div className="w-full md:w-1/3 flex items-center justify-center p-8 lg:p-12 bg-green-300">
        <div className="max-w-md w-full text-center md:text-left">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Chinh phục Tiếng Anh Toàn diện, Tự tin Vươn xa
          </h1>
          <p className="text-base text-gray-600 mb-8">
            Nền tảng học trực tuyến với lộ trình cá nhân hóa, phương pháp thực
            tế giúp bạn giao tiếp lưu loát và đạt điểm số mơ ước.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href={buttonLink}>
              <Button size="lg" className="w-full sm:w-auto">
                {buttonText}
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Tìm hiểu thêm
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="relative w-full md:w-2/3">
        <Image
          src="/banner.png"
          alt="Online English Academy Banner"
          fill
          style={{ objectFit: "cover" }}
          className="z-0"
          priority
        />
      </div>
    </section>
  );
};

const FeaturesSection = () => (
  <section id="features" className="py-20 bg-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">Tại sao chọn EngBreaking?</h2>
      <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
        Chúng tôi không chỉ dạy ngôn ngữ, chúng tôi trao cho bạn sự tự tin để sử
        dụng nó trong đời thực.
      </p>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-6">
          <Award className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Giảng viên Chuyên môn</h3>
          <p className="text-muted-foreground">
            Đội ngũ giảng viên IELTS 8.0+, TESOL, có nhiều năm kinh nghiệm giảng
            dạy thực chiến.
          </p>
        </div>
        <div className="p-6">
          <BookOpenCheck className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Lộ trình Cá nhân hóa</h3>
          <p className="text-muted-foreground">
            Bài kiểm tra đầu vào chi tiết, thiết kế lộ trình học riêng biệt phù
            hợp với mục tiêu và trình độ của bạn.
          </p>
        </div>
        <div className="p-6">
          <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Học tập Linh hoạt</h3>
          <p className="text-muted-foreground">
            Truy cập bài giảng, tài liệu và luyện tập mọi lúc, mọi nơi trên mọi
            thiết bị.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const FeaturedCoursesSection = () => (
  <section className="py-20 bg-gray-50">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Khóa học Nổi bật</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
          >
            <Link href={`/courses`}>
              <div className="relative h-56 w-full">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-primary font-semibold mb-2">
                  {course.instructor}
                </p>
                <h3 className="text-lg font-bold mb-4 line-clamp-2 h-14">
                  {course.title}
                </h3>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(course.price)}
                  </p>
                  <Button size="sm" asChild>
                    <div className="cursor-pointer">Xem chi tiết</div>
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const TestimonialsSection = () => (
  <section className="py-20 bg-white">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">
        Học viên nói gì về chúng tôi
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <Card
            key={t.name}
            className="p-6 flex flex-col items-center text-center bg-gray-50 border-gray-200"
          >
            <Avatar className="w-20 h-20 mb-4 border-2 border-primary">
              <AvatarImage src={t.avatarUrl} alt={t.name} />
              <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-muted-foreground italic mb-4 grow">{t.quote}</p>
            <div className="mt-auto">
              <h4 className="font-semibold">{t.name}</h4>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const StatsBanner = () => (
  <div className="bg-primary text-primary-foreground py-12">
    <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div>
        <p className="text-4xl font-bold">10,000+</p>
        <p className="opacity-80">Học viên</p>
      </div>
      <div>
        <p className="text-4xl font-bold">50+</p>
        <p className="opacity-80">Khóa học</p>
      </div>
      <div>
        <p className="text-4xl font-bold">20+</p>
        <p className="opacity-80">Giảng viên</p>
      </div>
      <div>
        <p className="text-4xl font-bold">4.8/5</p>
        <p className="opacity-80">Đánh giá</p>
      </div>
    </div>
  </div>
);

const FinalCTASection = () => {
  const { user } = useAuth({ redirectToLoginIfFail: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Chỉ hiển thị nội dung cá nhân hóa sau khi đã mount
  const isUserLoggedIn = mounted && !!user;

  return (
    <section className="py-20 text-center bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">
          {isUserLoggedIn
            ? "Tiếp tục hành trình học tập của bạn"
            : "Sẵn sàng để bắt đầu hành trình của bạn?"}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          {isUserLoggedIn
            ? "Khám phá thêm nhiều khóa học thú vị và nâng cao kỹ năng ngay hôm nay!"
            : "Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt và bắt đầu chinh phục mục tiêu tiếng Anh của bạn!"}
        </p>
        <Link href={isUserLoggedIn ? "/courses" : "/register"}>
          <Button size="lg" className="px-10 py-6 text-base">
            {isUserLoggedIn ? "Xem thêm khóa học" : "Đăng ký ngay"}
          </Button>
        </Link>
      </div>
    </section>
  );
};


const Footer = () => (
  <footer className="bg-gray-900 text-gray-400">
    <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">EngBreaking</h3>
        <p className="text-sm">
          Nền tảng học tập trực tuyến chuyên nghiệp, giúp bạn chinh phục tiếng
          Anh một cách hiệu quả.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-4">Khóa học</h4>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/courses" className="hover:text-white">
              IELTS
            </Link>
          </li>
          <li>
            <Link href="/courses" className="hover:text-white">
              TOEIC
            </Link>
          </li>
          <li>
            <Link href="/courses" className="hover:text-white">
              Giao tiếp
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-4">Về chúng tôi</h4>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="#features" className="hover:text-white">
              Giới thiệu
            </a>
          </li>
          <li>
            <Link href="#" className="hover:text-white">
              Liên hệ
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-white">
              Điều khoản dịch vụ
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-4">Kết nối với chúng tôi</h4>
        <p className="text-sm">contact@engbreaking.com</p>
      </div>
    </div>
    <div className="border-t border-gray-800 py-4">
      <p className="container mx-auto text-center text-sm">
        &copy; {new Date().getFullYear()} EngBreaking. All rights reserved.
      </p>
    </div>
  </footer>
);

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <FeaturedCoursesSection />
        <TestimonialsSection />
        <StatsBanner />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
