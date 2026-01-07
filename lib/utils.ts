import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.png";
  
  // Sanitize absolute URLs to replace localhost with 127.0.0.1 to avoid Next.js lookup issues
  if (path.startsWith("http") || path.startsWith("blob:")) {
    return path.replace("http://localhost:5000", "http://127.0.0.1:5000");
  }
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
  const baseUrl = apiUrl.replace("localhost", "127.0.0.1");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}
