"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { VideoItem } from "@/data/videos.example";
import { MODULES, type ModuleDef } from "@/lib/modules";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { DEFAULT_CONTENT, type HomeFeatured as FeaturedData } from "@/lib/pageContent";
import { Reveal } from "./Reveal";
import { VideoModuleSection } from "./VideoModuleSection";

const FEATURED_DEFAULTS = DEFAULT_CONTENT.home_featured;

/**
 * Empty state compartilhado — quando o banco está vazio
 * ou retorna erro (DB offline, tabela inexistente).
 */
function EmptyState({ message }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#ff7a18]/25 bg-[#ff7a18]/10 text-[#ffb066]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-white">
        {message ?? "Nenhuma aula disponível no momento"}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Estamos preparando o conteúdo. Volte em alguns dias.
      </p>
    </div>
  );
}

// =========================================================
// Card "Comece por aqui" — usado na home.
// Usa o VideoModal em modo lite (sem prev/next/marcar).
//
// Recebe `video` como prop (vem do banco via getFeaturedVideo()).
// Se não houver vídeo, renderiza empty state — nunca quebra.
// =========================================================
export function FeaturedVideo({
  video,
  ...props
}: Partial<FeaturedData> & { video: VideoItem | null }) {
  const {
    eyebrow = FEATURED_DEFAULTS.eyebrow,
    titlePrefix = FEATURED_DEFAULTS.titlePrefix,
    ctaPrimaryLabel = FEATURED_DEFAULTS.ctaPrimaryLabel,
    ctaSecondaryLabel = FEATURED_DEFAULTS.ctaSecondaryLabel,
    ctaSecondaryHref = FEATURED_DEFAULTS.ctaSecondaryHref,
  } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!video) {
    return (
      <section id="comece-por-aqui" className="relative scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EmptyState />
        </div>
      </section>
    );
  }

  return (
    <section id="comece-por-aqui" className="relative scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="glass overflow-hidden rounded-3xl">
            <div className="grid items-stretch lg:grid-cols-2">
              <button
                onClick={() => setOpen(true)}
                className="group relative aspect-video overflow-hidden text-left lg:aspect-auto"
                aria-label={`Assistir: ${video.title}`}
              >
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                )}
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
                  {eyebrow}
                </div>
                <div className="absolute bottom-4 right-4 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                  {video.duration}
                </div>
              </button>

              <div className="flex flex-col justify-center p-8 sm:p-10">
                <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffb066]">
                  {titlePrefix}
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {video.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {video.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => setOpen(true)} className="btn-primary">
                    {ctaPrimaryLabel}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <a href={ctaSecondaryHref} className="btn-ghost">
                    {ctaSecondaryLabel}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <VideoModal video={open ? video : null} onClose={() => setOpen(false)} />
    </section>
  );
}

// =========================================================
// Biblioteca completa — usada na página /aulas.
// 4 módulos (trilhas) com progresso persistido em localStorage.
//
// Recebe `videos` como prop (vem do banco via getPublicVideos()).
// Se o array vier vazio, renderiza empty state — nunca quebra.
// =========================================================
export function VideoLibraryFull({ videos }: { videos: VideoItem[] }) {
  const [open, setOpen] = useState<VideoItem | null>(null);
  const { isComplete, toggle } = useVideoProgress();

  // Vídeos agrupados por módulo, na ordem canônica.
  const grouped = useMemo(() => {
    return MODULES.map((m) => ({
      module: m,
      videos: videos.filter((v) => m.videoCategoryKeys.includes(v.category)),
    }));
  }, [videos]);

  // Vídeo em destaque (hero) — primeiro com `featured=true` ou o primeiro.
  const featured = useMemo(
    () => videos.find((v) => v.featured) ?? videos[0],
    [videos],
  );

  if (!featured) {
    return (
      <div className="mx-auto max-w-7xl">
        <EmptyState />
      </div>
    );
  }

  // Lock do scroll enquanto modal estiver aberto.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Esc fecha o modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lista linearizada para navegação prev/next no modal.
  // Cada vídeo é referenciado pela sua posição na trilha + índice dentro do módulo.
  const flatList = useMemo(() => {
    const list: { module: ModuleDef; indexInModule: number; video: VideoItem }[] = [];
    for (const g of grouped) {
      g.videos.forEach((v, idx) => {
        list.push({ module: g.module, indexInModule: idx, video: v });
      });
    }
    return list;
  }, [grouped]);

  const { prev, next, atModuleEnd, moduleOfOpen, indexInModuleOfOpen, totalInModule } =
    useModalNeighbors(open, flatList);

  return (
    <>
      {/* Destaque "Comece por aqui" */}
      <div className="mb-16">
        <Reveal>
          <div className="grid items-stretch gap-6 lg:grid-cols-5">
            <button
              onClick={() => setOpen(featured)}
              className="group relative col-span-1 overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left lg:col-span-3"
              aria-label={`Assistir: ${featured.title}`}
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

      {/* Módulos */}
      <div className="space-y-20 sm:space-y-24">
        {grouped.map(({ module: m, videos }) => (
          <VideoModuleSection
            key={m.slug}
            module={m}
            videos={videos}
            onPlay={(v) => setOpen(v)}
          />
        ))}
      </div>

      <VideoModal
        video={open}
        onClose={() => setOpen(null)}
        neighbors={open ? { prev, next } : undefined}
        onNavigate={(v) => setOpen(v)}
        isComplete={open ? isComplete(open.id) : false}
        onToggleComplete={open ? () => toggle(open.id) : undefined}
        atModuleEnd={atModuleEnd}
        moduleTitle={moduleOfOpen?.shortTitle}
        positionLabel={
          open && moduleOfOpen && indexInModuleOfOpen !== undefined
            ? `Aula ${indexInModuleOfOpen + 1} de ${totalInModule}`
            : undefined
        }
      />
    </>
  );
}

/**
 * Hook auxiliar: dado o vídeo aberto, devolve prev/next dentro do
 * mesmo módulo, flag de fim de módulo e metadados para o cabeçalho
 * do modal ("Aula 3 de 6", "Módulo Fundamentos").
 */
function useModalNeighbors(
  open: VideoItem | null,
  flatList: { module: ModuleDef; indexInModule: number; video: VideoItem }[],
) {
  return useMemo(() => {
    if (!open) {
      return {
        prev: null as VideoItem | null,
        next: null as VideoItem | null,
        atModuleEnd: false,
        moduleOfOpen: null as ModuleDef | null,
        indexInModuleOfOpen: undefined as number | undefined,
        totalInModule: 0,
      };
    }
    const idx = flatList.findIndex((e) => e.video.id === open.id);
    const entry = idx >= 0 ? flatList[idx] : null;
    const moduleOfOpen = entry?.module ?? null;
    const indexInModuleOfOpen = entry?.indexInModule;
    const moduleVideos = entry
      ? flatList.filter((e) => e.module.slug === entry.module.slug).map((e) => e.video)
      : [];
    const totalInModule = moduleVideos.length;
    const localIdx = entry ? moduleVideos.findIndex((v) => v.id === entry.video.id) : -1;
    const prev = localIdx > 0 ? moduleVideos[localIdx - 1] : null;
    const next = localIdx >= 0 && localIdx < moduleVideos.length - 1 ? moduleVideos[localIdx + 1] : null;
    const atModuleEnd = localIdx === moduleVideos.length - 1;
    return { prev, next, atModuleEnd, moduleOfOpen, indexInModuleOfOpen, totalInModule };
  }, [open, flatList]);
}

// Compatibilidade retroativa: alguns imports antigos podem ainda apontar para
// VideoLibrary. Mantemos um alias que aponta para a versão completa.
export function VideoLibrary({ videos }: { videos: VideoItem[] }) {
  return <VideoLibraryFull videos={videos} />;
}

// =========================================================
// VideoModal — único, exportado.
// Modo lite (sem props de tracking): usado pelo FeaturedVideo.
// Modo trilha (com neighbors/isComplete/...): usado por VideoLibraryFull.
// =========================================================
export function VideoModal({
  video,
  onClose,
  neighbors,
  onNavigate,
  isComplete,
  onToggleComplete,
  atModuleEnd,
  moduleTitle,
  positionLabel,
}: {
  video: VideoItem | null;
  onClose: () => void;
  /** undefined = modo lite (sem prev/next/marcar). */
  neighbors?: { prev: VideoItem | null; next: VideoItem | null };
  onNavigate?: (v: VideoItem) => void;
  isComplete?: boolean;
  onToggleComplete?: () => void;
  atModuleEnd?: boolean;
  moduleTitle?: string;
  positionLabel?: string;
}) {
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  // Travar scroll do body enquanto modal está aberto.
  useEffect(() => {
    document.body.style.overflow = video ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [video]);

  if (!video) return null;

  const isTrackMode = Boolean(neighbors && onNavigate);
  const hasPrev = isTrackMode && neighbors && neighbors.prev;
  const hasNext = isTrackMode && neighbors && neighbors.next;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#04081a]/80 px-3 py-6 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <div
        className="glass-strong relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl shadow-2xl animate-slide-up"
        onClick={stopProp}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-[#ffb066]">
              {moduleTitle && (
                <span className="rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-2 py-0.5 text-[10px] font-semibold">
                  {moduleTitle}
                </span>
              )}
              <span className="text-slate-300">{video.category}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">{video.duration}</span>
              {positionLabel && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">{positionLabel}</span>
                </>
              )}
            </div>
            <h3 className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
              {video.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Fechar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="aspect-video w-full bg-black">
          {video.emAguardo ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0a1230] via-[#050a1a] to-[#050a1a] px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ff7a18]/40 bg-[#ff7a18]/10 text-[#ffb066]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-white">Esta aula ainda não está disponível</p>
                <p className="mx-auto max-w-md text-xs leading-relaxed text-slate-400">
                  Estamos finalizando este conteúdo. Ele já aparece na trilha para você saber que está a caminho.
                </p>
              </div>
            </div>
          ) : (
            <iframe
              src={video.videoUrl}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <p className="text-sm leading-relaxed text-slate-300">{video.description}</p>

          {isTrackMode && !video.emAguardo && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={() => hasPrev && onNavigate && onNavigate(neighbors!.prev!)}
                  className={`btn-ghost ${!hasPrev ? "cursor-not-allowed opacity-40 hover:bg-white/5 hover:border-white/10" : ""}`}
                  aria-label="Aula anterior"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Anterior
                </button>

                {onToggleComplete && (
                  <button
                    type="button"
                    onClick={onToggleComplete}
                    className={
                      isComplete
                        ? "inline-flex items-center justify-center gap-2 rounded-xl border border-[#1fd29c]/45 bg-[#1fd29c]/15 px-4 py-2.5 text-sm font-semibold text-[#1fd29c] transition hover:bg-[#1fd29c]/25"
                        : "btn-ghost"
                    }
                    aria-pressed={Boolean(isComplete)}
                  >
                    {isComplete ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Assistida
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Marcar como assistida
                      </>
                    )}
                  </button>
                )}
              </div>

              {atModuleEnd ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-[#1fd29c]/45 bg-[#1fd29c]/15 px-4 py-2.5 text-sm font-semibold text-[#1fd29c] opacity-90"
                  aria-label="Módulo concluído"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Você concluiu o módulo
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() => hasNext && onNavigate && onNavigate(neighbors!.next!)}
                  className={`btn-primary ${!hasNext ? "cursor-not-allowed opacity-40" : ""}`}
                  aria-label="Próxima aula"
                >
                  Próxima
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
