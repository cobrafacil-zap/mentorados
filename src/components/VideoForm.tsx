"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VIDEO_CATEGORY_KEYS, videoCategoryLabel } from "@/lib/videoCategories";
import type { Video, VideoCategory } from "@prisma/client";

interface Props {
  initial?: Video;
  mode: "create" | "edit";
}

interface UploadState {
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

export function VideoForm({ initial, mode }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<VideoCategory>(initial?.category ?? "COMECE_POR_AQUI");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [order, setOrder] = useState<number>(initial?.order ?? 0);
  const [published, setPublished] = useState<boolean>(initial?.published ?? true);
  const [featured, setFeatured] = useState<boolean>(initial?.featured ?? false);
  const [videoUrl, setVideoUrl] = useState<string>(initial?.videoUrl ?? "");
  const [thumbnail, setThumbnail] = useState<string>(initial?.thumbnail ?? "");

  const [videoUpload, setVideoUpload] = useState<UploadState>({ status: "idle", progress: 0 });
  const [thumbUpload, setThumbUpload] = useState<UploadState>({ status: "idle", progress: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Garante que a duração seja sempre "MM:SS"
  useEffect(() => {
    if (mode === "create" && !duration) {
      setDuration("00:00");
    }
  }, [mode, duration]);

  const uploadFile = async (
    file: File,
    kind: "video" | "thumbnail",
    setState: (s: UploadState) => void
  ) => {
    setState({ status: "uploading", progress: 0 });

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const promise = new Promise<string>((resolve, reject) => {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setState({ status: "uploading", progress: Math.round((e.loaded / e.total) * 100) });
        }
      };
      xhr.onerror = () => reject(new Error("Falha de rede no upload"));
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url as string);
          } catch {
            reject(new Error("Resposta inválida do servidor"));
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error ?? `Erro HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`Erro HTTP ${xhr.status}`));
          }
        }
      };
      xhr.open("POST", "/api/admin/videos/upload");
      xhr.send(formData);
    });

    try {
      const url = await promise;
      setState({ status: "done", progress: 100 });
      return url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro no upload";
      setState({ status: "error", progress: 0, error: msg });
      throw e;
    }
  };

  const handleVideoPick = async (file: File) => {
    try {
      const url = await uploadFile(file, "video", setVideoUpload);
      setVideoUrl(url);
      // Se o usuário não preencheu duração, tenta extrair via <video>
      if (!duration || duration === "00:00") {
        const detected = await getVideoDuration(file);
        if (detected) setDuration(detected);
      }
    } catch { /* error já está em videoUpload */ }
  };

  const handleThumbPick = async (file: File) => {
    try {
      const url = await uploadFile(file, "thumbnail", setThumbUpload);
      setThumbnail(url);
    } catch { /* error já está em thumbUpload */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Informe o título do vídeo.");
    if (!videoUrl) return setError("Faça o upload do arquivo de vídeo antes de salvar.");
    if (!duration || !/^\d{1,2}:\d{2}$/.test(duration)) {
      return setError("Informe a duração no formato MM:SS.");
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        videoUrl,
        thumbnail: thumbnail || null,
        duration,
        order: Number(order) || 0,
        published,
        featured,
      };

      const url = mode === "create" ? "/api/admin/videos" : `/api/admin/videos/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao salvar vídeo");
      }
      router.push("/admin/videos");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/videos" className="text-xs text-zinc-400 hover:text-white">
            ← Voltar para a lista
          </Link>
          <h2 className="mt-1 text-2xl font-bold">
            {mode === "create" ? "Novo vídeo" : "Editar vídeo"}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {mode === "create"
              ? "Faça upload do arquivo e preencha os metadados."
              : "Atualize as informações e o arquivo do vídeo."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/videos"
            className="rounded-md border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-md bg-[#ff7a18] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Salvando…" : mode === "create" ? "Publicar vídeo" : "Salvar alterações"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-5 lg:col-span-2">
          <Card title="Arquivo de vídeo">
            <VideoDropzone
              videoUrl={videoUrl}
              upload={videoUpload}
              onPick={handleVideoPick}
              inputRef={fileInputRef}
              onClear={() => { setVideoUrl(""); setVideoUpload({ status: "idle", progress: 0 }); }}
            />
          </Card>

          <Card title="Thumbnail (opcional)">
            <ThumbDropzone
              thumbnail={thumbnail}
              upload={thumbUpload}
              onPick={handleThumbPick}
              inputRef={thumbInputRef}
              onClear={() => { setThumbnail(""); setThumbUpload({ status: "idle", progress: 0 }); }}
            />
          </Card>

          <Card title="Metadados">
            <div className="space-y-4">
              <Field label="Título" required>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Como estruturar sua primeira campanha"
                  className="gl-input"
                  maxLength={140}
                />
              </Field>
              <Field label="Descrição" hint={`${description.length}/500`}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="Sobre o que é esse vídeo? O que o aluno vai aprender?"
                  className="gl-input resize-none"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Categoria" required>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VideoCategory)}
                    className="gl-input"
                  >
                    {VIDEO_CATEGORY_KEYS.map((c) => (
                      <option key={c} value={c}>
                        {videoCategoryLabel(c)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Duração" required hint="formato MM:SS">
                  <input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="12:34"
                    className="gl-input font-mono"
                    pattern="^\d{1,2}:\d{2}$"
                  />
                </Field>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card title="Publicação">
            <div className="space-y-4">
              <Switch
                label="Publicado"
                description="Vídeos publicados aparecem na plataforma."
                checked={published}
                onChange={setPublished}
              />
              <Switch
                label="Vídeo em destaque"
                description="Aparece no card principal 'Comece por aqui'."
                checked={featured}
                onChange={setFeatured}
              />
              <Field label="Ordem de exibição" hint="menor = primeiro">
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="gl-input"
                  min={0}
                />
              </Field>
            </div>
          </Card>

          <Card title="Dicas">
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex gap-2">
                <span className="mt-1 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-[#ff7a18]" />
                Limite de <strong className="text-zinc-200">200 MB</strong> por vídeo.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-[#ff7a18]" />
                Formatos: MP4, WebM, MOV.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-[#ff7a18]" />
                A duração é detectada automaticamente quando possível.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-[#ff7a18]" />
                Use a ordem para controlar a sequência de exibição.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/60">
      <header className="border-b border-zinc-800 px-5 py-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-zinc-300">
        <span>
          {label}
          {required && <span className="ml-1 text-[#ff7a18]">*</span>}
        </span>
        {hint && <span className="text-zinc-500">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-left transition hover:border-zinc-700"
    >
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-[11px] text-zinc-500">{description}</div>
      </div>
      <div
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition ${
          checked ? "bg-[#ff7a18]" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </div>
    </button>
  );
}

function VideoDropzone({
  videoUrl,
  upload,
  onPick,
  inputRef,
  onClear,
}: {
  videoUrl: string;
  upload: UploadState;
  onPick: (f: File) => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  onClear: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const hasFile = !!videoUrl;

  return (
    <div>
      {hasFile ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-black">
            <video src={videoUrl} controls className="max-h-[420px] w-full" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <a href={videoUrl} target="_blank" rel="noreferrer" className="truncate text-zinc-400 hover:text-white">
              {videoUrl}
            </a>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md border border-zinc-800 px-3 py-1.5 text-zinc-200 hover:bg-white/5"
              >
                Substituir
              </button>
              <button
                type="button"
                onClick={onClear}
                className="rounded-md border border-red-900/60 bg-red-950/30 px-3 py-1.5 text-red-300 hover:bg-red-950/60"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) onPick(file);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
            dragging
              ? "border-[#ff7a18] bg-[#ff7a18]/5"
              : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-[#ffb066] ring-1 ring-[#ff7a18]/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 16V4M12 4l-4 4M12 4l4 4M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-white">Arraste o vídeo ou clique para selecionar</div>
          <div className="mt-1 text-xs text-zinc-500">MP4, WebM ou MOV · até 200 MB</div>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
              e.target.value = "";
            }}
          />
        </label>
      )}

      {upload.status === "uploading" && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-300">
            <span>Enviando…</span>
            <span className="font-mono">{upload.progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-[#ff7a18] to-[#ffb066] transition-all"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
        </div>
      )}
      {upload.status === "error" && (
        <div className="mt-3 rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {upload.error ?? "Erro no upload"}
        </div>
      )}
    </div>
  );
}

function ThumbDropzone({
  thumbnail,
  upload,
  onPick,
  inputRef,
  onClear,
}: {
  thumbnail: string;
  upload: UploadState;
  onPick: (f: File) => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  onClear: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      {thumbnail ? (
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnail} alt="" className="h-28 w-48 flex-shrink-0 rounded-md border border-zinc-800 object-cover" />
          <div className="flex-1 space-y-2 text-xs">
            <a href={thumbnail} target="_blank" rel="noreferrer" className="block truncate text-zinc-400 hover:text-white">
              {thumbnail}
            </a>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md border border-zinc-800 px-3 py-1.5 text-zinc-200 hover:bg-white/5"
              >
                Substituir
              </button>
              <button
                type="button"
                onClick={onClear}
                className="rounded-md border border-red-900/60 bg-red-950/30 px-3 py-1.5 text-red-300 hover:bg-red-950/60"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onPick(f);
          }}
          className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed px-4 py-4 transition ${
            dragging ? "border-[#ff7a18] bg-[#ff7a18]/5" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
          }`}
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-zinc-900 text-zinc-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="9" cy="11" r="1.5" fill="currentColor" />
              <path d="M21 17l-5-5-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">Adicionar thumbnail</div>
            <div className="text-[11px] text-zinc-500">PNG, JPG ou WebP · até 10 MB</div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
              e.target.value = "";
            }}
          />
        </label>
      )}

      {upload.status === "uploading" && (
        <div className="mt-2">
          <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full bg-gradient-to-r from-[#ff7a18] to-[#ffb066] transition-all" style={{ width: `${upload.progress}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">Enviando {upload.progress}%</div>
        </div>
      )}
      {upload.status === "error" && (
        <div className="mt-2 rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {upload.error ?? "Erro no upload"}
        </div>
      )}
    </div>
  );
}

async function getVideoDuration(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.src = url;
    v.onloadedmetadata = () => {
      const total = Math.floor(v.duration);
      const m = Math.floor(total / 60);
      const s = total % 60;
      URL.revokeObjectURL(url);
      resolve(`${m}:${s.toString().padStart(2, "0")}`);
    };
    v.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
  });
}
