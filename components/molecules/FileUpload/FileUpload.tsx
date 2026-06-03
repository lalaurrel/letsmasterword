"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/cn";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  /** 최대 파일 크기 (MB). 기본 10. */
  maxSize?: number;
  /** 빈 상태에서 표시할 안내 텍스트. */
  placeholder?: string;
  /** 최대 크기 표시 텍스트 포맷. 기본 "최대 {n}MB". 인자로 maxSize를 받음. */
  maxSizeLabel?: (maxSize: number) => string;
  /** 초기 표시할 파일 (예: 이미 업로드된 상태 / Storybook 시각 확인용). */
  defaultFile?: File | null;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept = "*",
  maxSize = 10,
  placeholder = "파일을 드래그하거나 클릭하여 업로드",
  maxSizeLabel = (n) => `최대 ${n}MB`,
  defaultFile = null,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(defaultFile);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > maxSize * 1024 * 1024) {
        return;
      }
      setSelectedFile(file);
      onFileSelect?.(file);
    },
    [maxSize, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div
      className={cn(
        "border border-dashed border-[var(--color-border-default)] rounded-[16px] p-8 text-center cursor-pointer transition-colors duration-200",
        isDragOver && "border-[var(--color-border-brand)] bg-[var(--color-bg-accent-subtle)]",
        className,
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {selectedFile ? (
        <div className="flex items-center justify-center gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M11.6667 1.66669H5.00004C4.55801 1.66669 4.13409 1.84228 3.82153 2.15484C3.50897 2.4674 3.33337 2.89133 3.33337 3.33335V16.6667C3.33337 17.1087 3.50897 17.5326 3.82153 17.8452C4.13409 18.1578 4.55801 18.3334 5.00004 18.3334H15C15.4421 18.3334 15.866 18.1578 16.1786 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V6.66669L11.6667 1.66669Z"
              stroke="var(--color-text-tertiary)"
              strokeWidth="1.33"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[14px] text-[var(--color-text-primary)] font-medium font-[family-name:var(--font-primary)]">
            {selectedFile.name}
          </span>
          <span className="text-[12px] text-[var(--color-text-disabled)] font-[family-name:var(--font-primary)]">
            {formatSize(selectedFile.size)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="ml-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M9 3L3 9M3 3L9 9"
                stroke="var(--color-icon-secondary)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M16 22V10M16 10L11 15M16 10L21 15"
              stroke="var(--color-icon-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 22V24C6 25.1046 6.89543 26 8 26H24C25.1046 26 26 25.1046 26 24V22"
              stroke="var(--color-icon-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-[14px] text-[var(--color-text-tertiary)] font-[family-name:var(--font-primary)]">
            {placeholder}
          </p>
          <p className="text-[12px] text-[var(--color-text-disabled)] font-[family-name:var(--font-primary)]">
            {maxSizeLabel(maxSize)}
          </p>
        </div>
      )}
    </div>
  );
}
