"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, VIDEOS, type VideoItem, type VideoCategory } from "@/data/videos";
import { Reveal } from "./Reveal";

type CategoryKey = VideoCategory | "Todos";

const FEATURED_VIDEO = VIDEOS.find((v) => v.featured) ?? VIDEOS[0];

// =========================================================
// Card "Comece por aqui" — usado na home.
// =========================================================
export function FeaturedVideo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section id="comece-por-aqui" className="relative scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="glass overflow-hidden rounded-3xl">
            <div className="grid items-stretch lg:grid-cols-2">
              <button
                onClick={() => setOpen(true)}
                className="group relative aspect-video overflow-hidden text-left lg:aspect-auto"
                aria-label={`Assistir: ${FEATURED_VIDEO.title}`}
              >
                <img
                  src={FEATURED_VIDEO.thumbnail}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050a1a] via-[#050a1a]/30 to-transparent lg:bg-gradient-to-r" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff7a18]/95 text-white shadow-[0_8px_40px_rgba(255,122,24,0.6)] transition group-hover:scale-110">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#ff7a18] px-3 py-1 text-xs font-semibold text-black">
                  <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse-dot" />
                  Comece por aqui
                </div>
                <div className="absolute bottom-4 right-4 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                  {FEATURED_VIDEO.duration}
                </div>
              </button>

              <div className="flex flex-col justify-center p-8 sm:p-10">
                <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffb066]">
                  Vídeo introdutório
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {FEATURED_VIDEO.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {FEATURED_VIDEO.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => setOpen(true)} className="btn-primary">
                    Assistir agora
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <a
                    href="/aulas"
                    className="btn-ghost"
                  >
                    Ver todas as aulas
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <VideoModal video={open ? FEATURED_VIDEO : null} onClose={() => setOpen(false)} />
    </section>
  );
}

// =========================================================
// Biblioteca completa — usada na página /aulas.
// =========================================================
export function VideoLibraryFull() {
  const [active, setActive] = useState<CategoryKey>("Todos");
  const [open, setOpen] = useState<VideoItem | null>(null);

  const filtered = useMemo(
    () => (active === "Todos" ? VIDEOS : VIDEOS.filter((v) => v.category === active)),
    [active]
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const featured = FEATURED_VIDEO;

  return (
    <>
      {/* Destaque "Comece por aqui" */}
      <div className="mb-12">
        <Reveal>
          <div className="grid items-stretch gap-6 lg:grid-cols-5">
            <button
              onClick={() => setOpen(featured)}
              className="group relative col-span-1 overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left lg:col-span-3"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={featured.thumbnail}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050a1a] via-[#050a1a]/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff7a18]/95 text-white shadow-[0_8px_40px_rgba(255,122,24,0.6)] transition group-hover:scale-110">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#ff7a18] px-3 py-1 text-xs font-semibold text-black">
                  <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse-dot" />
                  Comece por aqui
                </div>
                <div className="absolute bottom-4 right-4 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                  {featured.duration}
                </div>
              </div>
            </button>
            <div className="col-span-1 flex flex-col justify-center lg:col-span-2">
              <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffb066]">
                Vídeo introdutório
              </div>
              <h3 className="text-2xl font-bold text-white sm:text-3xl">{featured.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{featured.description}</p>
              <button onClick={() => setOpen(featured)} className="btn-primary mt-6 w-fit">
                Assistir agora
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Filtros */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((c) => {
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-[#ff7a18]/60 bg-[#ff7a18]/15 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Grid de vídeos */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v, idx) => (
          <Reveal key={v.id} delayMs={idx * 50}>
            <VideoCard video={v} onPlay={() => setOpen(v)} />
          </Reveal>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
          Nenhum vídeo disponível nesta categoria ainda.
        </div>
      )}

      <VideoModal video={open} onClose={() => setOpen(null)} />
    </>
  );
}

// Compatibilidade retroativa: alguns imports antigos podem ainda apontar para
// VideoLibrary. Mantemos um alias que aponta para a versão completa.
export function VideoLibrary(props: { children?: never }) {
  return <VideoLibraryFull />;
}

function VideoCard({ video, onPlay }: { video: VideoItem; onPlay: () => void }) {
  return (
    <div className="group glass relative flex h-full flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-[#ff7a18]/35">
      <button
        onClick={onPlay}
        className="relative aspect-video w-full overflow-hidden text-left"
        aria-label={`Assistir: ${video.title}`}
      >
        <img
          src={video.thumbnail}
          alt=""
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a1a] via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff7a18] text-white shadow-[0_8px_28px_rgba(255,122,24,0.5)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
          {video.duration}
        </div>
        <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
          {video.category}
        </div>
      </button>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">{video.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">{video.description}</p>
        <button
          onClick={onPlay}
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#ffb066] transition hover:text-white"
        >
          Assistir
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function VideoModal({
  video,
  onClose,
}: {
  video: VideoItem | null;
  onClose: () => void;
}) {
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#04081a]/80 px-3 py-6 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <div
        className="glass-strong relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl animate-slide-up"
        onClick={stopProp}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-[#ffb066]">
              {video.category} · {video.duration}
            </div>
            <h3 className="truncate text-sm font-semibold text-white sm:text-base">{video.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Fechar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={video.videoUrl}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="px-4 py-4 sm:px-6">
          <p className="text-sm leading-relaxed text-slate-300">{video.description}</p>
        </div>
      </div>
    </div>
  );
}