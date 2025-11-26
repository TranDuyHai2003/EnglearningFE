"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import { ReportDialog } from "./ReportDialog";

interface ReportButtonProps {
  contentType: "discussion" | "reply" | "review";
  contentId: number;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ReportButton({
  contentType,
  contentId,
  variant = "ghost",
  size = "sm",
}: ReportButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={(e) => {
          e.stopPropagation();
          setShowDialog(true);
        }}
        className="text-muted-foreground hover:text-destructive"
      >
        <Flag className="h-4 w-4 mr-1" />
        Báo cáo
      </Button>

      <ReportDialog
        contentType={contentType}
        contentId={contentId}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}
