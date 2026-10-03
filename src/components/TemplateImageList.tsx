"use client";

import { useRef, useState } from "react";
import { supabaseToR2 } from "@/lib/storage-url";

interface TemplateImageListProps {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  tall?: boolean;
}

/** Editor de lista de imagens: upload + URL manual + remover. */
export function TemplateImageList({ label, hint, values, onChange, tall }: TemplateImageListProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro no upload");
        uploaded.push(data.url);
      }
      onChange([...values, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addUrl() {
    const v = url.trim();
    if (!v) return;
    onChange([...values, v]);
    setUrl("");
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...values];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label} <span className="text-zinc-500">({values.length})</span>
      </label>
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}

      {values.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {values.map((src, i) => (
            <div key={`${src}-${i}`} className="group relative overflow-hidden rounded border border-zinc-700 bg-zinc-950">
              <img
                src={supabaseToR2(src)}
                alt={`${label} ${i + 1}`}
                className={`w-full object-cover ${tall ? "h-32" : "h-20"}`}
              />
              <div className="flex items-center justify-between bg-zinc-900 px-1 py-0.5 text-[11px]">
                <span className="text-zinc-400">#{i + 1}</span>
                <span className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-zinc-300 hover:text-white disabled:opacity-30" title="Mover para esquerda">←</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === values.length - 1} className="text-zinc-300 hover:text-white disabled:opacity-30" title="Mover para direita">→</button>
                  <button type="button" onClick={() => removeAt(i)} className="text-red-400 hover:text-red-300" title="Remover">✕</button>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded border border-dashed border-zinc-700 px-3 py-2 text-xs text-zinc-500">
          Nenhuma imagem — a página exibe um espaço reservado até você adicionar.
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
          placeholder="https://... (ou suba um arquivo)"
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={addUrl}
          className="shrink-0 rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Adicionar
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-white"
      />
      {uploading ? <p className="text-xs text-zinc-400">Enviando...</p> : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
