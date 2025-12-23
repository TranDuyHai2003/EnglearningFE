"use client";

import { useState } from "react";

interface FlashcardImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

const FALLBACK =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='160' viewBox='0 0 240 160'%3E%3Crect width='240' height='160' rx='12' fill='%23f1f5f9'/%3E%3Ctext x='120' y='85' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2394a3b8'%3ENo image%3C/text%3E%3C/svg%3E";

export function FlashcardImage({ src, alt, className = "" }: FlashcardImageProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = failed || !src;

  if (showFallback) {
    return (
      <div
        className={`bg-slate-100 text-slate-500 text-xs flex items-center justify-center rounded-md ${className}`}
      >
        <img
          src={FALLBACK}
          alt="No image"
          className="h-full w-full object-cover rounded-md"
        />
      </div>
    );
  }

  return (
    <img
      src={src || FALLBACK}
      alt={alt}
      className={`rounded-md object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
