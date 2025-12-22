"use client";

import { useCallback, useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpeechButtonProps {
  text: string;
  lang?: string;
  className?: string;
}

export function SpeechButton({ text, lang = "en-US", className }: SpeechButtonProps) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }
  }, []);

  const speak = useCallback(() => {
    if (!supported || !text) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    synth.speak(utterance);
  }, [supported, text, lang]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={speak}
      disabled={!supported || !text}
      className={className}
      title="Phát âm"
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  );
}
