"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, Clock, ChevronRight, Star, CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Mock data constants removed


import { speakingApi } from "@/lib/api/speaking";
import { paymentService } from "@/lib/api/paymentService";

// ...

export default function SpeakingClubPage() {
  const router = useRouter();
  const [creditBalance, setCreditBalance] = useState(0);
  const [packages, setPackages] = useState<any[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
     try {
        setLoading(true);
        const [pkgRes, currRes, creditRes] = await Promise.all([
           speakingApi.getPackages(),
           speakingApi.getCurriculum(),
           speakingApi.getMyCredit()
        ]);
        setPackages(pkgRes);
        setCurriculum(currRes);
        setCreditBalance(creditRes.balance);
     } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => {
    fetchData();
  }, []);



  const handleBuyPackage = async (pkg: any) => {
     try {
         const { url } = await paymentService.createPackageCheckout(pkg.package_id);
         window.location.href = url;
     } catch (err: any) {
         toast.error(err.message || "Giao dịch thất bại");
     }
  };


  const handleBookTopic = (topic: any) => {
     if (topic.locked) {
        toast.error("Bạn cần hoàn thành bài trước để mở khóa bài này.");
        return;
     }
     if (creditBalance <= 0) {
        toast.error("Bạn đã hết lượt học. Vui lòng mua thêm gói.");
        return;
     }
     router.push(`/student/speaking/book/${topic.topic_id}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* Header & Wallet */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
         <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
         <div className="relative p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
               <div className="flex items-center gap-3 mb-1">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
                     Live Sessions
                  </span>
               </div>
               <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                  Speaking Club
               </h1>
               <p className="text-emerald-50 max-w-xl text-lg font-medium opacity-95">
                  Luyện tập giao tiếp 1-1 với giảng viên. Tự tin nói tiếng Anh mỗi ngày.
               </p>
            </div>
            
            <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-[200px]">
               <span className="text-white font-semibold text-sm uppercase tracking-wide opacity-90">Số dư hiện tại</span>
               <div className="text-4xl font-black text-white my-1 drop-shadow-sm">
                  {creditBalance}
               </div>
               <span className="text-white/90 text-sm font-medium mb-4">Credits</span>
               <Button 
                  className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold shadow-md border-0"
                  onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
               >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Nạp thêm
               </Button>
            </div>
         </div>
      </div>

      {/* Curriculum Map */}
      <div className="space-y-8">
         <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
               <Calendar className="h-6 w-6" />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-gray-900">Lộ trình học tập</h2>
               <p className="text-gray-600 font-medium">Chọn chủ đề phù hợp để bắt đầu luyện tập</p>
            </div>
         </div>
         
         <div className="grid gap-10">
            {curriculum.map((level) => (
               <div key={level.curriculum_id} className="space-y-5">
                  <div className="flex items-center gap-4">
                     <Badge className="bg-cyan-600 text-white hover:bg-cyan-700 px-4 py-1 text-sm font-bold shadow-sm">
                        {level.name}
                     </Badge>
                     <div className="h-[1px] flex-1 bg-gray-200"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {level.topics.map((topic: any) => (
                        <div 
                           key={topic.topic_id}
                           onClick={() => handleBookTopic(topic)}
                           className={`
                              group relative bg-white rounded-xl border-2 transition-all duration-300
                              ${topic.locked 
                                 ? 'opacity-60 grayscale bg-gray-50 border-gray-100 cursor-not-allowed' 
                                 : 'border-gray-100 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer'
                              }
                           `}
                        >
                           <div className="p-6 flex flex-col h-full">
                              <div className="flex justify-between items-start mb-4">
                                 <div className={`
                                    w-10 h-10 rounded-lg flex items-center justify-center font-bold
                                    ${topic.locked ? 'bg-gray-200 text-gray-500' : 'bg-emerald-100 text-emerald-600'}
                                 `}>
                                    {topic.locked ? <Lock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                 </div>
                                 {!topic.locked && (
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                                       Available
                                    </Badge>
                                 )}
                              </div>
                              
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                 {topic.title}
                              </h3>
                              <p className="text-gray-600 font-medium text-sm line-clamp-2 mb-6 flex-1">
                                 {topic.description}
                              </p>
                              
                              <Button 
                                 disabled={topic.locked}
                                 className={`w-full justify-between font-bold group/btn ${topic.locked ? 'bg-gray-200 text-gray-400' : 'bg-white text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200'}`}
                                 variant={topic.locked ? "ghost" : "outline"}
                              >
                                 {topic.locked ? "Locked" : "Đặt lịch ngay"}
                                 {!topic.locked && <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Packages Section */}
      <div id="packages-section" className="pt-12 mt-12 border-t border-gray-100">
         <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Gói lượt học ưu đãi</h2>
            <p className="text-gray-600 font-medium mt-2">Đầu tư cho tương lai với chi phí hợp lý</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
               <Card 
                  key={pkg.package_id} 
                  className={`
                     relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl
                     ${idx === 1 ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 scale-105 z-10' : 'border-gray-100 hover:border-emerald-300'}
                  `}
               >
                  {idx === 1 && (
                     <div className="absolute top-0 inset-x-0 bg-emerald-500 text-white text-xs font-bold text-center py-1 uppercase tracking-widest">
                        Khuyên dùng
                     </div>
                  )}
                  
                  <CardHeader className={`${idx === 1 ? 'pt-10' : 'pt-6'} text-center pb-2`}>
                     <CardTitle className="text-xl font-bold text-gray-900">{pkg.name}</CardTitle>
                     <p className="text-sm text-gray-500 font-medium">{pkg.description}</p>
                  </CardHeader>
                  
                  <CardContent className="flex flex-col items-center p-6 pt-2">
                     <div className="my-6 text-center">
                        <span className="text-4xl font-extrabold text-gray-900">
                           {new Intl.NumberFormat('vi-VN').format(pkg.price)}
                        </span>
                        <span className="text-gray-400 text-lg font-bold align-top relative top-1">₫</span>
                     </div>
                     
                     <div className="w-full space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                           <span className="text-gray-600 font-medium">Số lượng credits</span>
                           <span className="font-bold text-gray-900">{pkg.credits} buổi</span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                           <span className="text-gray-600 font-medium">Thời hạn sử dụng</span>
                           <span className="font-bold text-gray-900">6 tháng</span>
                        </div>
                     </div>

                     <Button 
                        className={`w-full py-6 text-lg font-bold shadow-lg transition-transform active:scale-95 ${idx === 1 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:to-cyan-600 text-white border-0' : 'bg-white text-emerald-600 border-2 border-emerald-200 hover:bg-emerald-50'}`}
                        onClick={() => handleBuyPackage(pkg)}
                     >
                        Mua gói này
                     </Button>
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>
    </div>
  );

}
