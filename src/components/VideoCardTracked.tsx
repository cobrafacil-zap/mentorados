"use client";

// =========================================================
// VideoCardTracked
// Igual ao card de vídeo do VideoLibrary, mas:
//  - aceita `isComplete` + `position` para exibir estado de
//    progresso (badge ✓ Assistida, badge "Aula N", dim);
//  - aceita `onPlay` para abrir o modal;
//  - aceita `isPlayable` (false = card mostra "Em breve").
// =========================================================

import type { VideoItem } from "@/data/videos";

export function VideoCardTracked({
  video,
  position,
  isComplete,
  onPlay,
}: {
  video: VideoItem;
  /** 1-based. Mostra "Aula N" no canto superior esquerdo. */
  position?: number;
  isComplete: boolean;
  onPlay: () => void;
}) {
  return (
    <div
      className={`group glass relative flex h-full flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-[#ff7a18]/35 ${
        isComplete ? "card-checked" : ""
      }`}
    >
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
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
          {position !== undefined && <span>Aula {position}</span>}
          {position !== undefined && <span className="opacity-50">·</span>}
          <span>{video.category}</span>
        </div>

        {isComplete && (
          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-[#1fd29c]/40 bg-[#1fd29c]/15 px-2.5 py-1 text-[11px] font-semibold text-[#1fd29c]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Assistida
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">{video.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
          {video.description}
        </p>
        <button
          onClick={onPlay}
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#ffb066] transition hover:text-white"
        >
          {isComplete ? "Reassistir" : "Assistir"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
