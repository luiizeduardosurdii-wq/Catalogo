"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type ProductImageUploadProps = {
  currentImageUrl: string | null;
  onChange: (value: { file: File | null; remove: boolean }) => void;
};

export function ProductImageUpload({
  currentImageUrl,
  onChange,
}: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  const displayUrl = removed ? null : previewUrl ?? currentImageUrl;

  function handleFileSelect(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setRemoved(false);
    setPreviewUrl(URL.createObjectURL(file));
    onChange({ file, remove: false });
  }

  function handleRemove() {
    setRemoved(true);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange({ file: null, remove: true });
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Foto do produto</label>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        A foto aparece no catálogo para os clientes. JPG, PNG ou WebP — até 5 MB.
      </p>

      {displayUrl ? (
        <div className="relative inline-block">
          <div className="relative h-52 w-52 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <Image
              src={displayUrl}
              alt="Prévia da foto do produto"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Trocar foto
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              Remover foto
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0] ?? null;
            handleFileSelect(file);
          }}
          className="flex h-52 w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 transition hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-700 dark:border-zinc-600 dark:bg-zinc-950 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm font-medium">Clique para adicionar foto</span>
          <span className="text-xs">ou arraste uma imagem aqui</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          handleFileSelect(file);
        }}
      />
    </div>
  );
}
