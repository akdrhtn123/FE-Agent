"use client";

import { Download, FileText, Loader2, Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api/errors";
import type { components } from "@/lib/api/schema";

export type StoredFile = components["schemas"]["FileRead"];

function size(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/** 실행에 딸려 보낼 파일. 고르는 즉시 올리고, 실행할 때는 올린 파일의 ID 만 보낸다. */
export function AttachFiles({
  files,
  onChange,
  disabled,
}: {
  files: StoredFile[];
  onChange: (files: StoredFile[]) => void;
  disabled?: boolean;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (picked: FileList | null) => {
    if (!picked?.length) return;
    setUploading(true);
    const added: StoredFile[] = [];
    for (const file of Array.from(picked)) {
      const body = new FormData();
      body.append("file", file);
      // 본문이 multipart 라 타입 있는 클라이언트(JSON 전용) 대신 fetch 로 보낸다
      const response = await fetch("/api/backend/files", { method: "POST", body });
      const data = await response.json().catch(() => null);
      if (response.ok && data) added.push(data as StoredFile);
      else toast.error(`${file.name}: ${apiErrorMessage(data) ?? "올리지 못했습니다."}`);
    }
    onChange([...files, ...added]);
    setUploading(false);
    if (pickerRef.current) pickerRef.current.value = ""; // 같은 파일을 다시 고를 수 있게
  };

  return (
    <div className="flex flex-col gap-1.5">
      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((file, i) => (
            <li key={file.id} className="bg-muted flex items-center gap-2 rounded-md px-2 py-1 text-xs">
              <code className="text-muted-foreground shrink-0">{`{{file_${i + 1}}}`}</code>
              <span className="min-w-0 flex-1 truncate" title={file.name}>
                {file.name}
              </span>
              <span className="text-muted-foreground shrink-0 tabular-nums">{size(file.size)}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`${file.name} 빼기`}
                disabled={disabled}
                onClick={() => onChange(files.filter((f) => f.id !== file.id))}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={pickerRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => upload(e.target.files)}
        aria-label="실행에 첨부할 파일"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        disabled={disabled || uploading}
        onClick={() => pickerRef.current?.click()}
      >
        {uploading ? <Loader2 className="animate-spin" /> : <Paperclip />}
        {uploading ? "올리는 중" : "파일 첨부"}
      </Button>
    </div>
  );
}

/** 실행에서 노드가 만든 파일. 누르면 내려받는다. */
export function RunFiles({ files }: { files: StoredFile[] }) {
  if (files.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <span className="text-xs font-medium">만든 파일</span>
      <ul className="flex flex-col gap-1">
        {files.map((file) => (
          <li key={file.id}>
            <a
              href={`/api/backend/files/${file.id}/content`}
              download={file.name}
              className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <FileText className="text-muted-foreground size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate" title={file.name}>
                {file.name}
              </span>
              {file.node_id && <span className="text-muted-foreground font-mono text-xs">{file.node_id}</span>}
              <span className="text-muted-foreground text-xs tabular-nums">{size(file.size)}</span>
              <Download className="text-muted-foreground size-3.5 shrink-0" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
