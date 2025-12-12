"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface LiveRoomPageProps {
  params: {
    roomId: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
}

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

const LiveRoomPage = ({ params, searchParams }: LiveRoomPageProps) => {
  const roomId = params.roomId;
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<
    RTCPeerConnectionState | "idle"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const participantName =
    typeof searchParams?.name === "string"
      ? searchParams.name
      : "Người tham gia";

  const senderId = useMemo(() => crypto.randomUUID(), []);
  const peerIdRef = useRef<string | null>(null);
  const remotePeerRef = useRef<string | null>(null);
  const isHostRef = useRef(false);

  useEffect(() => {
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsReady(true);
      } catch (err) {
        console.error(err);
        setError(
          "Không thể truy cập microphone/camera. Kiểm tra quyền trình duyệt."
        );
      }
    };
    setupMedia();
  }, []);

  useEffect(() => {
    if (!roomId) {
      setError("Thiếu thông tin phòng.");
      return;
    }

    const peer = new RTCPeerConnection({ iceServers });
    peerRef.current = peer;

    peer.onconnectionstatechange = () => {
      setConnectionState(peer.connectionState);
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && remotePeerRef.current) {
        sendSignal({
          type: "candidate",
          candidate: event.candidate,
          target: remotePeerRef.current,
        });
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current as MediaStream);
      });
    }

    const wsUrl = buildWsUrl(roomId, senderId, participantName);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to signaling server");
    };

    ws.onerror = () => {
      setError("Không thể kết nối máy chủ tín hiệu.");
    };

    ws.onclose = () => {
      setConnectionState("disconnected");
    };

    ws.onmessage = async (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        return;
      }
      if (!data) return;

      switch (data.type) {
        case "connected": {
          peerIdRef.current = data.peerId;
          if (!data.participants || data.participants.length === 0) {
            isHostRef.current = true;
            toast.info("Bạn là người đầu tiên trong phòng. Chờ người tham gia.");
          } else {
            remotePeerRef.current = data.participants[0];
          }
          break;
        }
        case "peer-joined": {
          if (isHostRef.current) {
            remotePeerRef.current = data.peerId;
            startNegotiation(data.peerId);
          }
          break;
        }
        case "offer": {
          remotePeerRef.current = data.sender;
          await peer.setRemoteDescription(
            new RTCSessionDescription(data.sdp)
          );
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          sendSignal({
            type: "answer",
            sdp: answer,
            target: data.sender,
          });
          break;
        }
        case "answer": {
          if (isHostRef.current) {
            await peer.setRemoteDescription(
              new RTCSessionDescription(data.sdp)
            );
          }
          break;
        }
        case "candidate": {
          if (data.candidate) {
            await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
          break;
        }
        case "peer-left": {
          toast.message("Một người tham gia đã rời phòng.");
          remotePeerRef.current = null;
          break;
        }
        default:
          break;
      }
    };

    return () => {
      ws.close();
      peer.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [participantName, roomId, senderId]);

  const buildWsUrl = (roomId: string, peerId: string, name: string) => {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const url = new URL(apiBase);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = url.pathname.replace(/\/api\/?$/, "");
    return `${url.origin}${url.pathname}/ws/live?roomId=${roomId}&peerId=${peerId}&userId=${encodeURIComponent(
      name
    )}`;
  };

  const sendSignal = (payload: Record<string, unknown>) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify(payload));
  };

  const startNegotiation = async (targetPeerId?: string) => {
    if (!peerRef.current) return;
    if (!isReady) {
      toast.error("Vui lòng bật camera/micro trước khi bắt đầu.");
      return;
    }
    const target = targetPeerId || remotePeerRef.current;
    if (!target) return;

    try {
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      remotePeerRef.current = target;
      sendSignal({
        type: "offer",
        sdp: offer,
        target,
      });
      toast.success("Đã gửi lời mời tham gia.");
    } catch (err) {
      console.error(err);
      toast.error("Không thể khởi tạo phòng.");
    }
  };

  const toggleMicrophone = () => {
    if (!localStreamRef.current) return;
    const enabled = !microphoneEnabled;
    localStreamRef.current
      .getAudioTracks()
      .forEach((track) => (track.enabled = enabled));
    setMicrophoneEnabled(enabled);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    const enabled = !cameraEnabled;
    localStreamRef.current
      .getVideoTracks()
      .forEach((track) => (track.enabled = enabled));
    setCameraEnabled(enabled);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Phòng trực tuyến</h1>
            <p className="text-sm text-muted-foreground">
              Mã phòng: <span className="font-mono">{roomId}</span>
            </p>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")}>
            Quay lại Trang chủ
          </Button>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4 text-destructive text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Camera của bạn</CardTitle>
              <p className="text-sm text-muted-foreground">{participantName}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="aspect-video w-full rounded-md bg-black"
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={toggleMicrophone}>
                  {microphoneEnabled ? "Tắt micro" : "Bật micro"}
                </Button>
                <Button variant="outline" onClick={toggleCamera}>
                  {cameraEnabled ? "Tắt camera" : "Bật camera"}
                </Button>
                <Button onClick={() => startNegotiation()}>Bắt đầu</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Màn hình từ học viên</CardTitle>
              <p className="text-sm text-muted-foreground">
                Người tham gia sẽ xuất hiện tại đây.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="aspect-video w-full rounded-md bg-black"
              />
              <div className="rounded-md border p-3 text-sm">
                <p className="font-semibold">Trạng thái kết nối</p>
                <p className="text-muted-foreground">
                  {connectionState === "idle" ? "Chưa bắt đầu" : connectionState}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Hệ thống sử dụng WebRTC + BroadcastChannel để thử nghiệm gọi 1:1
                  trong trình duyệt. Đảm bảo cả giảng viên và học viên mở cùng
                  đường link phòng này.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveRoomPage;
