// components/shared/FileUpload.tsx
"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void; // <-- THAY ĐỔI: Thay onUpload thành onFileSelect
  acceptedTypes?: Record<string, string[]>;
  label: string;
}

export function FileUpload({
  onFileSelect,
  acceptedTypes = { "application/pdf": [".pdf"] },
  label,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles.length > 0 ? acceptedFiles[0] : null;
    setFile(selectedFile);
    onFileSelect(selectedFile); // <-- THAY ĐỔI: Gọi callback để báo cho component cha
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    onFileSelect(null); // <-- THAY ĐỔI: Báo cho component cha là đã xóa file
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">{label}</label>
      <div
        {...getRootProps()}
        className={`flex justify-center w-full rounded-md border-2 border-dashed p-10 cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {isDragActive
              ? "Thả file vào đây..."
              : "Kéo & thả file hoặc nhấn để chọn"}
          </p>
        </div>
      </div>

      {/* THAY ĐỔI: Giao diện hiển thị file đã chọn đơn giản hơn */}
      {file && (
        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="flex items-center gap-2">
            <File className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={removeFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
