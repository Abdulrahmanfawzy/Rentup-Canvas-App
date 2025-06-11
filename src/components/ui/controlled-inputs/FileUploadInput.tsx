"use client";

import { useCallback, useState } from "react";
import { cn } from "@/utils/clsxUtils";
import { Upload } from "lucide-react";

interface FileUploadInputProps {
  label?: string;
  onChange: (file: File | null) => void;
  accept?: string;
  className?: string;
  labelClassName?: string;
  error?: string | null;
  disabled?: boolean;
}

export const FileUploadInput = ({
  label,
  onChange,
  accept = ".ttf",
  className,
  labelClassName,
  error,
  disabled = false,
}: FileUploadInputProps) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      if (file) {
        // Validate file type
        if (accept && !file.name.endsWith(accept)) {
          onChange(null);
          setFileName(null);
          return;
        }
        setFileName(file.name);
        onChange(file);
      } else {
        setFileName(null);
        onChange(null);
      }
    },
    [onChange, accept]
  );

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {label && (
        <label
          className={cn(
            "text-sm font-medium text-foreground",
            error && "text-destructive",
            disabled && "opacity-50",
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={cn(
            "flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer",
            "bg-background text-foreground",
            error && "border-destructive",
            disabled && "opacity-50 cursor-not-allowed",
            "hover:bg-muted"
          )}
        >
          <Upload className="h-4 w-4" />
          <span>{fileName || "Choose a file"}</span>
        </label>
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};
