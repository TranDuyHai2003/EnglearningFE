"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Mic, MicOff, Video, VideoOff, Users, Info, MessageSquare, Share } from "lucide-react";
interface LiveRoomPageProps {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

const LiveRoomPage = ({ params, searchParams }: LiveRoomPageProps) => {
  const { roomId } = use(params);
  const searchParamsValue = use(searchParams);
  const router = useRouter();
  
  // Local Media Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Connection Refs
  const wsRef = useRef<WebSocket | null>(null);
  const peerIdRef = useRef<string | null>(null);
  
  // Use a Map to store peer connections: peerId -> RTCPeerConnection
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Store candidates for peers that haven't finished connecting
  const candidatesQueueRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // State
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [participantNames, setParticipantNames] = useState<Map<string, string>>(new Map());
  const [participantStates, setParticipantStates] = useState<Map<string, { mic: boolean, cam: boolean }>>(new Map());
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [activeSidebar, setActiveSidebar] = useState<"none" | "participants" | "chat">("none");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string, text: string, time: string, isMe: boolean }>>([]);
  const [chatInput, setChatInput] = useState("");

  const [participantName, setParticipantName] = useState<string>("Người tham gia");
  const [isNameReady, setIsNameReady] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Priority: Search Param -> LocalStorage -> Default
    const resolveName = () => {
       if (typeof searchParamsValue?.name === "string") {
          setParticipantName(searchParamsValue.name);
          setIsNameReady(true);
          return;
       }
       
       try {
          const authUser = localStorage.getItem("authUser");
          if (authUser) {
             const parsed = JSON.parse(authUser);
             if (parsed.full_name) {
                setParticipantName(parsed.full_name);
                setIsHost(parsed.role === "instructor"); // Assume instructor is host
                setIsNameReady(true);
                return;
             }
          }
       } catch (error) {
          console.error("Error parsing authUser:", error);
       }
       
       setIsNameReady(true); // Fallback to default
    };
    
    resolveName();
  }, [searchParamsValue]);



  // --- 1. Setup Local Media ---
  useEffect(() => {
    const setupMedia = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           throw new Error("Media devices not supported (HTTP?)");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setPermissionsGranted(true);
      } catch (err) {
        console.error("Media Error:", err);
        setError("Không thể truy cập camera/micro. Vui lòng kiểm tra quyền.");
      }
    };

    setupMedia();

    return () => {
      // Cleanup local tracks on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // --- 2. WebSocket & Peer Management ---
  useEffect(() => {
    if (!permissionsGranted || !roomId || !isNameReady) return;

    const wsUrl = buildWsUrl(roomId, participantName);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log("Connected to Signal Server");
    ws.onerror = () => setError("Lỗi kết nối máy chủ tín hiệu (Websocket).");

    ws.onmessage = async (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        return;
      }
      if (!data) return;

      switch (data.type) {
        case "connected":
          console.log("My PeerID:", data.peerId);
          peerIdRef.current = data.peerId;
          
          // Broadcast initial state to server so it knows about us
           if (ws.readyState === 1) {
             ws.send(JSON.stringify({
                type: "peer-update",
                mediaState: localMediaStateRef.current
             }));
          }
          
          // data.participants is now Array<{ peerId, userId, mediaState }>
          
          // Initialize local user role
          if (data.role) {
             setUserRole(data.role);
             if (data.role === 'observer') {
                // Auto-mute for observers
                console.log("[Role] You are an observer. Muting...");
                setMicrophoneEnabled(false);
                setCameraEnabled(false);
                localMediaStateRef.current = { mic: false, cam: false };
                if (localStreamRef.current) {
                   localStreamRef.current.getTracks().forEach(t => t.enabled = false);
                }
             }
          }

          if (data.participants && data.participants.length > 0) {
             const namesMap = new Map<string, string>();
             const statesMap = new Map<string, { mic: boolean, cam: boolean }>();

             data.participants.forEach((p: any) => {
                namesMap.set(p.peerId, decodeURIComponent(p.userId));
                if (p.mediaState) {
                   statesMap.set(p.peerId, p.mediaState);
                }
             });
             
             setParticipantNames(prev => new Map([...prev, ...namesMap]));
             setParticipantStates(prev => new Map([...prev, ...statesMap]));

             // Initiate connections
             data.participants.forEach((p: any) => {
                 createPeerConnection(p.peerId, true); 
             });
          } else {
             toast.info("Bạn là người đầu tiên trong phòng.");
          }
          break;

        case "chat-message":
           setChatMessages(prev => [...prev, {
              sender: data.sender || "Unknown",
              text: data.text,
              time: data.time,
              isMe: false
           }]);
           if (activeSidebar !== 'chat') {
              toast(`${data.sender}: ${data.text}`);
           }
           break;

        case "mute-forced":
           toast.warning("Bạn đã bị chủ phòng tắt tiếng.");
           
           // Always update state and broadcast
           setMicrophoneEnabled(false);
           localMediaStateRef.current.mic = false;
           
           // Disable tracks if they exist
           if (localStreamRef.current) {
              localStreamRef.current.getAudioTracks().forEach(t => t.enabled = false);
           }
           
           // Broadcast new state
           if (ws.readyState === 1) {
              ws.send(JSON.stringify({
                 type: "peer-update",
                 mediaState: localMediaStateRef.current
              }));
           }
           break;

        case "banned":
           toast.error("Bạn đã bị mời ra khỏi phòng.");
           // Cleanup and redirect
           ws.close();
           router.push("/");
           break;

        case "peer-update":
           setParticipantStates(prev => {
              const newMap = new Map(prev);
              newMap.set(data.peerId, data.mediaState);
              return newMap;
           });
           break;

        case "peer-joined":
          console.log("New peer joined:", data.peerId);
          toast.info(`${decodeURIComponent(data.userId)} đã tham gia.`);
          setParticipantNames(prev => new Map(prev).set(data.peerId, decodeURIComponent(data.userId)));
          
          if (data.mediaState) {
             setParticipantStates(prev => new Map(prev).set(data.peerId, data.mediaState));
          }
          // Store peer role if needed for UI, e.g. participantRoles map
          break;

        case "offer":
          await handleOffer(data.sender, data.sdp);
          break;

        case "answer":
          await handleAnswer(data.sender, data.sdp);
          break;

        case "candidate":
          await handleCandidate(data.sender, data.candidate);
          break;
          
        case "peer-left":
          handlePeerLeft(data.peerId);
          break;
      }
    };

    return () => {
      // Cleanup WS and all peers
      ws.close();
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
    };
  }, [permissionsGranted, roomId, participantName, isNameReady]); // Removed activeSidebar from dependency.

  // --- Chat Logic ---
  const sendChatMessage = (e?: React.FormEvent) => {
     e?.preventDefault();
     if (!chatInput.trim()) return;
     
     const msg = {
        type: "chat-message",
        sender: participantName,
        text: chatInput,
        time: new Date().toISOString()
     };
     
     sendSignal(msg);
     
     setChatMessages(prev => [...prev, {
        sender: "Me",
        text: chatInput,
        time: msg.time,
        isMe: true
     }]);
     setChatInput("");
  };

  // ... (keep helper functions like buildWsUrl, createMockStream if needed but simplify for brevity) ...
  // Re-implementing helper functions to ensure context is correct

  const buildWsUrl = (roomId: string, name: string) => {
     const apiBase = `${process.env.NEXT_PUBLIC_API_URL}`;
     const url = new URL(apiBase);
     url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
     let basePath = url.pathname.replace(/\/api\/?$/, "");
     if (basePath.endsWith("/")) basePath = basePath.slice(0, -1);
     return `${url.origin}${basePath}/ws/live?roomId=${roomId}&userId=${encodeURIComponent(name)}`;
  };

  const createPeerConnection = async (targetPeerId: string, initiator: boolean) => {
     if (peersRef.current.has(targetPeerId)) {
       return peersRef.current.get(targetPeerId);
     }

     const pc = new RTCPeerConnection({ iceServers });
     
     if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
           pc.addTrack(track, localStreamRef.current!);
        });
     }

     pc.onicecandidate = (event) => {
        if (event.candidate) {
           sendSignal({ type: "candidate", candidate: event.candidate, target: targetPeerId });
        }
     };

     pc.ontrack = (event) => {
        setRemoteStreams((prev) => {
           const newMap = new Map(prev);
           newMap.set(targetPeerId, event.streams[0]);
           return newMap;
        });
     };
     
     peersRef.current.set(targetPeerId, pc);

     if (initiator) {
        try {
           const offer = await pc.createOffer();
           await pc.setLocalDescription(offer);
           sendSignal({ type: "offer", sdp: offer, target: targetPeerId });
        } catch (err) {
           console.error(`Error creating offer for ${targetPeerId}`, err);
        }
     }
     
     return pc;
  };

  const handleOffer = async (senderId: string, sdp: RTCSessionDescriptionInit) => {
     const pc = await createPeerConnection(senderId, false); 
     if (!pc) return;

     await pc.setRemoteDescription(new RTCSessionDescription(sdp));
     
     const queue = candidatesQueueRef.current.get(senderId) || [];
     if (queue.length > 0) {
        for (const cans of queue) {
           await pc.addIceCandidate(new RTCIceCandidate(cans));
        }
        candidatesQueueRef.current.delete(senderId);
     }

     const answer = await pc.createAnswer();
     await pc.setLocalDescription(answer);
     sendSignal({ type: "answer", sdp: answer, target: senderId });
  };

  const handleAnswer = async (senderId: string, sdp: RTCSessionDescriptionInit) => {
     const pc = peersRef.current.get(senderId);
     if (!pc) return;
     
     // Robust answer handling
     if (pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const queue = candidatesQueueRef.current.get(senderId) || [];
        if (queue.length > 0) {
           for (const cans of queue) {
              await pc.addIceCandidate(new RTCIceCandidate(cans));
           }
           candidatesQueueRef.current.delete(senderId);
        }
     }
  };

  const handleCandidate = async (senderId: string, candidate: RTCIceCandidateInit) => {
     const pc = peersRef.current.get(senderId);
     if (!pc || !pc.remoteDescription) {
        const currentQueue = candidatesQueueRef.current.get(senderId) || [];
        currentQueue.push(candidate);
        candidatesQueueRef.current.set(senderId, currentQueue);
        return;
     }
     try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
     } catch (err) {
        console.error(err);
     }
  };

  const handlePeerLeft = (peerId: string) => {
     const name = participantNames.get(peerId) || "Người tham gia";
     toast.info(`${name} đã rời phòng.`);
     
     if (peersRef.current.has(peerId)) {
        peersRef.current.get(peerId)?.close();
        peersRef.current.delete(peerId);
     }
     setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        newMap.delete(peerId);
        return newMap;
     });
     setParticipantNames((prev) => {
        const newMap = new Map(prev);
        newMap.delete(peerId);
        return newMap;
     });
  };

  const sendSignal = (payload: any) => {
     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
     }
  };
  
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localMediaStateRef = useRef({ mic: true, cam: true });
  const [userRole, setUserRole] = useState<'host' | 'speaker' | 'observer'>('speaker');

  // ...

  const toggleMicrophone = () => {
    if (!localStreamRef.current) return;
    const enabled = !microphoneEnabled;
    localStreamRef.current
      .getAudioTracks()
      .forEach((track) => (track.enabled = enabled));
    setMicrophoneEnabled(enabled);
    localMediaStateRef.current.mic = enabled;

    if (wsRef.current?.readyState === 1) {
       wsRef.current.send(JSON.stringify({
          type: "peer-update",
          mediaState: localMediaStateRef.current
       }));
    }
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    const enabled = !cameraEnabled;
    localStreamRef.current
      .getVideoTracks()
      .forEach((track) => (track.enabled = enabled));
    setCameraEnabled(enabled);
    localMediaStateRef.current.cam = enabled;

    if (wsRef.current?.readyState === 1) {
       wsRef.current.send(JSON.stringify({
          type: "peer-update",
          mediaState: localMediaStateRef.current
       }));
    }
  };
  
  const startScreenShare = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
         toast.error("Thiết bị này không hỗ trợ chia sẻ màn hình.");
         return;
      }
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      
      // Handle "Stop sharing" via browser UI
      screenTrack.onended = () => {
         stopScreenShare();
      };
      
      // Replace video track in local stream (keep audio)
      if (localStreamRef.current) {
         const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
         if (oldVideoTrack) {
            localStreamRef.current.removeTrack(oldVideoTrack);
            // Don't stop old track immediately if we want to resume? 
            // Actually, we usually re-acquire camera on stop. 
            // Let's stop it to be safe and turn off prompt light.
            oldVideoTrack.stop(); 
         }
         localStreamRef.current.addTrack(screenTrack);
      }
      
      // Update Local Video
      if (localVideoRef.current) {
         localVideoRef.current.srcObject = localStreamRef.current;
      }
      
      // Replace in all PeerConnections
      peersRef.current.forEach((pc) => {
         const sender = pc.getSenders().find(s => s.track?.kind === 'video');
         if (sender) {
            sender.replaceTrack(screenTrack);
         }
      });
      
      setIsScreenSharing(true);
      setCameraEnabled(true); // Screen is "on"
      
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };

  const stopScreenShare = async () => {
     try {
       // Stop screen track if running
       const currentScreenTrack = localStreamRef.current?.getVideoTracks()[0];
       if (currentScreenTrack && currentScreenTrack.label.includes("screen")) { // heuristic or just track id
          currentScreenTrack.stop();
       }
       
       // Re-acquire Camera
       const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
       const cameraTrack = cameraStream.getVideoTracks()[0];
       
       // Replace in local stream
       if (localStreamRef.current) {
           const oldTrack = localStreamRef.current.getVideoTracks()[0];
           if (oldTrack) localStreamRef.current.removeTrack(oldTrack);
           localStreamRef.current.addTrack(cameraTrack);
       }
       
       // Update Local Video
       if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
       }

       // Replace in all PeerConnections
       peersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
             sender.replaceTrack(cameraTrack);
          }
       });
       
       setIsScreenSharing(false);
     } catch (err) {
       console.error("Error stopping screen share:", err);
       // If camera fails, we might be left with no video. 
       setIsScreenSharing(false);
       setCameraEnabled(false);
     }
  };
  
  const handleShareClick = () => {
     if (isScreenSharing) {
        stopScreenShare();
     } else {
        startScreenShare();
     }
  };

  const handleHostAction = (action: "mute" | "ban", targetId: string) => {
     if (!wsRef.current) return;
     if (action === "mute") {
        wsRef.current.send(JSON.stringify({ type: "mute-user", target: targetId }));
        
        // Optimistic UI Update
        setParticipantStates(prev => {
           const newMap = new Map(prev);
           const oldState = newMap.get(targetId) || { mic: true, cam: true };
           newMap.set(targetId, { ...oldState, mic: false });
           return newMap;
        });
        
        toast.info("Đã gửi yêu cầu tắt tiếng.");
     } else if (action === "ban") {
        if(confirm("Bạn có chắc chắn muốn mời người này ra khỏi phòng?")) {
            wsRef.current.send(JSON.stringify({ type: "ban-user", target: targetId }));
            toast.info("Đã mời người dùng ra khỏi phòng.");
        }
     }
  };

  const toggleSidebar = (mode: "participants" | "chat") => {
     if (activeSidebar === mode) {
        setActiveSidebar("none");
     } else {
        setActiveSidebar(mode);
     }
  };

  // --- UI ---
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Đã sao chép mã phòng");
  };

  // Convert Map keys to array for rendering
  const remoteStreamArray = Array.from(remoteStreams.entries());
  const totalParticipants = remoteStreamArray.length + 1; // +1 for local

  // Dynamic grid cols based on participant count
  const getGridClass = (count: number) => {
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 4) return "grid-cols-1 md:grid-cols-2";
    if (count <= 9) return "grid-cols-2 md:grid-cols-3";
    return "grid-cols-3 md:grid-cols-4";
  };

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Top Bar (Info Overlay) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4 rounded-md bg-zinc-900/50 p-2 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-green-500" />
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase text-zinc-400">Meeting Room</span>
            <span className="text-sm font-semibold">{roomId.slice(0, 8)}...</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          onClick={copyToClipboard}
          title="Sao chép ID"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className={`grid w-full max-w-7xl gap-4 ${getGridClass(totalParticipants)} transition-all duration-300 ${activeSidebar !== 'none' ? 'pr-80' : ''}`}>
          
          {/* Local Video */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl">
             <video
               ref={localVideoRef}
               autoPlay
               playsInline
               muted
               className="h-full w-full object-cover"
             />
             <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold backdrop-blur-md">
               Bạn ({participantName})
             </div>
             {!microphoneEnabled && (
                <div className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5">
                   <MicOff className="h-3 w-3 text-white" />
                </div>
             )}
          </div>

          {/* Remote Videos */}
          {remoteStreamArray.map(([peerId, stream]) => (
             <RemoteVideo 
                key={peerId} 
                peerId={peerId} 
                stream={stream} 
                name={participantNames.get(peerId) || `User ${peerId.slice(0,4)}`} 
                micEnabled={participantStates.get(peerId)?.mic ?? true}
             />
          ))}
          
          {/* Waiting Placeholder */}
          {totalParticipants === 1 && (
            <div className="col-span-1 flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-900/50">
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <Users className="h-10 w-10" />
                <p>Đang chờ người tham gia...</p>
                <div className="text-xs">Chia sẻ mã phòng: {roomId}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar (Participants OR Chat) */}
        {activeSidebar !== "none" && (
           <div className="fixed top-0 left-0 right-0 bottom-16 md:absolute md:top-4 md:right-4 md:bottom-24 md:left-auto md:w-80 bg-zinc-900 border-l md:border border-zinc-800 md:rounded-lg shadow-2xl flex flex-col z-[45]">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 rounded-t-lg">
                 <h3 className="font-semibold">{activeSidebar === "participants" ? `Participants (${totalParticipants})` : "Chat"}</h3>
                 <Button variant="ghost" size="sm" onClick={() => setActiveSidebar("none")}>✕</Button>
              </div>
              
              <div className="flex-1 overflow-hidden p-0 bg-zinc-900/95 relative">
                 {/* PARTICIPANTS CONTENT */}
                 {activeSidebar === "participants" && (
                     <div className="h-full overflow-y-auto p-2 space-y-2">
                        {/* Me */}
                        <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-800/50 group">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                                {participantName.slice(0,2).toUpperCase()}
                                </div>
                                <div className="text-sm">
                                {participantName} <span className="text-zinc-500">(Me)</span>
                                </div>
                            </div>
                            {/* User requested to hide Mic status for themselves */}
                        </div>

                        {/* Others */}
                        {Array.from(participantNames.entries()).map(([id, name]) => {
                            const state = participantStates.get(id);
                            const isMicOn = state ? state.mic : true;

                            return (
                                <div key={id} className="flex items-center justify-between p-2 rounded hover:bg-zinc-800/50 group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-900 flex items-center justify-center text-xs font-bold">
                                            {name.slice(0,2).toUpperCase()}
                                        </div>
                                        <div className="text-sm">{name}</div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        {/* Mic Status Icon / Toggle */}
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className={`h-8 w-8 ${isMicOn ? 'text-zinc-400' : 'text-red-500 hover:text-red-400'}`}
                                            onClick={isHost && isMicOn ? () => handleHostAction("mute", id) : undefined}
                                            title={isHost ? "Mute User" : "Mic Status"}
                                            disabled={!isHost}
                                            style={{ opacity: 1, pointerEvents: isHost ? 'auto' : 'none' }}
                                        >
                                            {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                        </Button>

                                        {/* Ban Button (Host Only) */}
                                        {isHost && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                                                title="Remove User"
                                                onClick={() => handleHostAction("ban", id)}
                                            >
                                                <Users className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 )}

                 {/* CHAT CONTENT */}
                 {activeSidebar === "chat" && (
                    <div className="flex flex-col h-full">
                       <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full">
                          {chatMessages.length === 0 && <p className="text-center text-zinc-600 text-sm mt-10">Chưa có tin nhắn nào</p>}
                          {chatMessages.map((msg, i) => (
                             <div key={i} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-baseline gap-2">
                                   <span className="text-xs font-bold text-zinc-400">{msg.sender}</span>
                                   <span className="text-[10px] text-zinc-600">{new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className={`p-2 rounded-lg text-sm max-w-[90%] break-words ${msg.isMe ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-100'}`}>
                                   {msg.text}
                                </div>
                             </div>
                          ))}
                       </div>
                       <form onSubmit={sendChatMessage} className="p-3 border-t border-zinc-800 bg-zinc-900">
                          <div className="flex gap-2">
                             <input 
                                className="flex-1 bg-zinc-800 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                placeholder="Nhập tin nhắn..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                             />
                             <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">Gửi</Button>
                          </div>
                       </form>
                    </div>
                 )}
              </div>
           </div>
        )}
      </div>

      {/* Bottom Control Bar - Fixed & Responsive */}
      <div className="fixed bottom-0 left-0 right-0 h-16 md:h-24 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 z-50 flex items-center justify-between px-2 md:px-8 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        
        {/* Left: Audio/Video */}
        <div className="flex items-center gap-1 md:gap-2">
           <ControlBtn 
             icon={microphoneEnabled ? Mic : MicOff} 
             label={microphoneEnabled ? "Mute" : "Unmute"} 
             active={microphoneEnabled}
             onClick={userRole === 'observer' ? undefined : toggleMicrophone} 
             className={`w-12 md:min-w-[70px] ${userRole === 'observer' ? 'opacity-50 cursor-not-allowed' : ''}`}
             hideLabelMobile
           />
           <ControlBtn 
             icon={cameraEnabled ? Video : VideoOff} 
             label={cameraEnabled ? "Stop Video" : "Start Video"}
             active={cameraEnabled} 
             onClick={userRole === 'observer' ? undefined : toggleCamera} 
             className={`w-12 md:min-w-[70px] ${userRole === 'observer' ? 'opacity-50 cursor-not-allowed' : ''}`}
             hideLabelMobile
           />
        </div>

        {/* Center: Generic Actions - Scrollable on very small screens? No, just squeeze */}
        <div className="flex items-center gap-1 md:gap-2">
           <ControlBtn 
              icon={Users} 
              label="Participants" 
              active={activeSidebar === "participants"} 
              onClick={() => toggleSidebar("participants")} 
              badge={totalParticipants} 
              className="w-12 md:min-w-[70px]"
              hideLabelMobile
           />
           <ControlBtn 
              icon={MessageSquare} 
              label="Chat" 
              active={activeSidebar === "chat"} 
              onClick={() => toggleSidebar("chat")} 
              className="w-12 md:min-w-[70px]"
              hideLabelMobile
           />
           <ControlBtn 
              icon={Share} 
              label={isScreenSharing ? "Stop" : "Share"} 
              active={isScreenSharing} 
              onClick={handleShareClick} 
              className={`w-12 md:min-w-[70px] ${isScreenSharing ? "text-red-500" : "text-green-500"}`}
              hideLabelMobile
            />
        </div>

        {/* Right: End Call */}
        <div>
           <Button 
             variant="destructive" 
             className="bg-red-600 hover:bg-red-700 font-bold px-4 md:px-8 h-9 md:h-12 text-xs md:text-base whitespace-nowrap rounded-xl shadow-lg shadow-red-900/20"
             onClick={() => router.push("/")}
           >
             End
           </Button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual remote videos
const RemoteVideo = ({ peerId, stream, name, micEnabled = true }: { peerId: string, stream: MediaStream, name: string, micEnabled?: boolean }) => {
   const videoRef = useRef<HTMLVideoElement>(null);
   
   useEffect(() => {
      if (videoRef.current && stream) {
         videoRef.current.srcObject = stream;
      }
   }, [stream]);

   return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl">
         <video
           ref={videoRef}
           autoPlay
           playsInline
           controls={false}
           className="h-full w-full object-cover"
         />
         <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold backdrop-blur-md">
            {name}
         </div>
         {!micEnabled && (
             <div className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 sh-mic-icon">
                <MicOff className="h-3 w-3 text-white" />
             </div>
         )}
      </div>
   );
};

// Helper Control Button Component
const ControlBtn = ({ icon: Icon, label, active, onClick, className = "", badge, hideLabelMobile }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center gap-1 p-1 md:p-3 rounded-xl hover:bg-zinc-800 transition-colors ${className} ${!active && label !== 'Participants' && label !== 'Chat' && label !== 'Share' && label !== 'Stop' ? 'bg-zinc-900' : ''}`}
  >
    <div className={`relative p-2 md:p-3 rounded-2xl ${!active && label !== 'Participants' && label !== 'Chat' && label !== 'Share' && label !== 'Stop' ? 'bg-red-500/10 text-red-500' : 'text-zinc-300'}`}>
       <Icon className={`h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 ${!active && label !== 'Participants' && label !== 'Chat' && label !== 'Share' && label !== 'Stop' ? 'text-red-500' : ''}`} />
       {badge && <span className="absolute -top-1 -right-1 flex h-3 w-3 md:h-5 md:w-5 items-center justify-center rounded-full bg-zinc-700 text-[9px] md:text-xs font-bold ring-2 ring-zinc-900">{badge}</span>}
    </div>
    <span className={`text-[9px] md:text-xs lg:text-sm text-zinc-400 font-medium ${hideLabelMobile ? 'hidden md:block' : ''}`}>{label}</span>
  </button>
);

export default LiveRoomPage;
