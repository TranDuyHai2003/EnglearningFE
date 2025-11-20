"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { Header } from "../page";

const PublicFooter = () => (
  <footer className="bg-gray-800 text-gray-400 py-8">
    <div className="container mx-auto text-center text-sm">
      <p>© 2025 EngBreaking. Nền tảng học tiếng Anh trực tuyến.</p>
    </div>
  </footer>
);

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow">{children}</main>{" "}
      {/* Sửa lại className từ 'flex-grow' thành 'grow' cho tailwindcss v4 */}
      <PublicFooter />
    </div>
  );
}
