"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, Users, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/apiClient";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Session {
  session_id: number;
  topic: {
    title: string;
    description: string;
    curriculum: {
      name: string;
    }
  };
  scheduled_start: string;
  scheduled_end: string;
  max_capacity: number;
  bookings: any[];
}

export default function InstructorSpeakingDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await apiClient.get<Session[]>("/speaking/instructor/schedule");
      setSessions(res.data);
    } catch (err) {
      toast.error("Không thể tải lịch dạy");
    } finally {
      setLoading(false);
    }
  };

  const isClassReady = (start: string) => {
    const startTime = new Date(start).getTime();
    const now = new Date().getTime();
    const diff = startTime - now;
    // Allow start 15 mins before
    return diff <= 15 * 60 * 1000;
  };

  const handleStartClass = (sessionId: number) => {
    router.push(`/live/${sessionId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
             <Video className="h-8 w-8 text-indigo-600" />
             Lịch Dạy Speaking Club
          </h1>
          <p className="text-gray-500 mt-2">Quản lý và bắt đầu các lớp học trực tuyến của bạn.</p>
        </div>
      </div>

      <div className="grid gap-6">
         {loading ? (
           <div className="text-center py-10">Đang tải...</div>
         ) : sessions.length === 0 ? (
           <Card className="bg-gray-50 border-dashed">
             <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
               <Calendar className="h-12 w-12 mb-4 opacity-20" />
               <p className="text-lg">Không có lớp học nào sắp tới.</p>
             </CardContent>
           </Card>
         ) : (
           sessions.map((session) => {
             const canStart = isClassReady(session.scheduled_start);
             return (
               <Card key={session.session_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                     {/* Time & Date */}
                     <div className="flex flex-col items-center justify-center min-w-[120px] border-r border-gray-100 pr-6">
                        <span className="text-3xl font-bold text-indigo-600">
                           {format(new Date(session.scheduled_start), "HH:mm")}
                        </span>
                        <span className="text-gray-500 font-medium">
                           {format(new Date(session.scheduled_start), "dd/MM/yyyy")}
                        </span>
                        <Badge variant="outline" className="mt-2">
                           {session.bookings.length} / {session.max_capacity} Students
                        </Badge>
                     </div>

                     {/* Content */}
                     <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                             {session.topic.curriculum.name}
                          </Badge>
                          <h3 className="text-xl font-bold text-gray-900">{session.topic.title}</h3>
                        </div>
                        <p className="text-gray-600 line-clamp-2">{session.topic.description}</p>
                        
                        <div className="flex items-center gap-4 pt-2">
                           <div className="flex -space-x-2 overflow-hidden">
                              {session.bookings.slice(0, 5).map((b, i) => (
                                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500" title={b.student.full_name}>
                                   {b.student.avatar_url ? <img src={b.student.avatar_url} className="h-full w-full rounded-full object-cover" /> : b.student.full_name.charAt(0)}
                                </div>
                              ))}
                              {session.bookings.length > 5 && (
                                <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                                  +{session.bookings.length - 5}
                                </div>
                              )}
                           </div>
                           <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Users className="h-4 w-4" /> Đã đăng ký
                           </span>
                        </div>
                     </div>

                     {/* Actions */}
                     <div className="flex flex-col justify-center min-w-[180px] border-l border-gray-100 pl-6 gap-3">
                        {canStart ? (
                           <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStartClass(session.session_id)}>
                              <Video className="mr-2 h-4 w-4" /> Bắt đầu lớp
                           </Button>
                        ) : (
                           <Button disabled variant="secondary" className="w-full">
                              <Clock className="mr-2 h-4 w-4" /> Chưa đến giờ
                           </Button>
                        )}
                        <Button variant="outline" className="w-full">
                           Xem chi tiết
                        </Button>
                     </div>
                  </CardContent>
               </Card>
             );
           })
         )}
      </div>
    </div>
  );
}
