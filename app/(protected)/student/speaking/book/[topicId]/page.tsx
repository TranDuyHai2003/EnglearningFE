"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { speakingApi } from "@/lib/api/speaking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, ArrowLeft, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = Number(params.topicId);

  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    if (!topicId) return;
    fetchSlots();
  }, [topicId]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await speakingApi.getSchedule(topicId);
      setSlots(data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải lịch học");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (sessionId: number) => {
    if (!confirm("Bạn có chắc chắn muốn đặt lịch học này? 1 Credit sẽ bị trừ.")) return;
    
    try {
      setProcessing(sessionId);
      await speakingApi.bookSlot(sessionId);
      toast.success("Đặt lịch thành công!");
      // Don't redirect immediately. Just refresh the list to show updated status.
      // Optionally redirect to a "My Schedule" page or just stay here.
      fetchSlots(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đặt lịch thất bại");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Lịch học sắp tới</h1>
        <p className="text-zinc-400">Chọn khung giờ phù hợp với bạn để tham gia lớp Speaking.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
           <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : slots.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800 p-8 text-center text-zinc-400">
           Currently no open slots for this topic. Please check back later.
        </Card>
      ) : (
        <div className="grid gap-4">
           {slots.map((slot) => {
              const isFull = slot.booked >= slot.capacity;
              return (
                 <Card key={slot.session_id} className="bg-zinc-900 border-zinc-800 hover:border-indigo-500/30 transition-colors">
                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                       <div className="space-y-2">
                          <div className="flex items-center gap-2 text-indigo-300 font-medium">
                             <Calendar className="w-4 h-4" />
                             {format(new Date(slot.start), "EEEE, dd/MM/yyyy", { locale: vi })}
                          </div>
                          <div className="flex items-center gap-2 text-2xl font-bold text-white">
                             <Clock className="w-5 h-5 text-zinc-500" />
                             {format(new Date(slot.start), "HH:mm")} - {format(new Date(slot.end), "HH:mm")}
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400">
                             <User className="w-4 h-4" />
                             Instructor: <span className="text-white">{slot.instructor}</span>
                          </div>
                       </div>

                       <div className="flex flex-col items-end gap-3 min-w-[140px]">
                          <Badge variant={isFull ? "destructive" : "outline"} className={!isFull ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}>
                             {isFull ? `Full (${slot.booked}/${slot.capacity})` : `${slot.booked} / ${slot.capacity} Students`}
                          </Badge>
                          
                          <Button 
                             className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                             disabled={isFull || processing === slot.session_id}
                             onClick={() => handleBook(slot.session_id)}
                          >
                             {processing === slot.session_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                             ) : isFull ? (
                                "Đã đầy" 
                             ) : (
                                "Đặt Chỗ"
                             )}
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
              );
           })}
        </div>
      )}
    </div>
  );
}
