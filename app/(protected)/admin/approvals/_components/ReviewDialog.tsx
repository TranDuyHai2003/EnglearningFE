import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  title: string;
  children?: React.ReactNode;
  hideApprove?: boolean;
}

export function ReviewDialog({
  isOpen,
  onClose,
  onApprove,
  onReject,
  title,
  children,
  hideApprove = false,
}: ReviewDialogProps) {
  const [isRejecting, setIsRejecting] = useState(hideApprove);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRejecting(hideApprove);
      setReason("");
    }
  }, [isOpen, hideApprove]);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await onApprove();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setIsLoading(true);
    try {
      await onReject(reason);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
            {children}
        </div>

        {isRejecting && (
            <div className="space-y-2 mb-4">
                <Label>Lý do từ chối</Label>
                <Textarea 
                    placeholder="Nhập lý do từ chối..." 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>
        )}

        <DialogFooter>
          {!isRejecting ? (
            <>
                <Button variant="outline" onClick={onClose}>Đóng</Button>
                <Button variant="destructive" onClick={() => setIsRejecting(true)}>Từ chối</Button>
                <Button onClick={handleApprove} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Phê duyệt
                </Button>
            </>
          ) : (
            <>
                <Button variant="ghost" onClick={() => setIsRejecting(false)}>Hủy bỏ</Button>
                <Button variant="destructive" onClick={handleReject} disabled={isLoading || !reason.trim()}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Xác nhận từ chối
                </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
