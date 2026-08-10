"use client";

// =========================================================
// VideoModuleSection
// Header (eyebrow ordem + título + summary) + ModuleProgressBar
// + grid de VideoCardTracked dentro de um módulo.
// =========================================================

import type { ModuleDef } from "@/lib/modules";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { ModuleProgressBar } from "./ModuleProgressBar";
import { VideoCardTracked } from "./VideoCardTracked";
import type { VideoItem } from "@/data/videos";

export function VideoModuleSection({
  module: mod,
  videos,
  onPlay,
}: {
  module: ModuleDef;
  videos: VideoItem[];
  onPlay: (video: VideoItem) => void;
}) {
  const { isComplete, moduleProgress } = useVideoProgress();

  const videoIds = videos.map((v) => v.id);
  const progress = moduleProgress(videoIds);

  return (
    <section
      id={`modulo-${mod.slug}`}
      className="relative scroll-mt-24"
      aria-labelledby={`modulo-${mod.slug}-title`}
    >
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffb066]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff7a18] animate-pulse-dot" />
          Módulo {mod.order} de 4
        </div>
        <h2
          id={`modulo-${mod.slug}-title`}
          className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          <span className="text-gradient-orange">{mod.shortTitle}</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          {mod.summary}
        </p>
      </header>

      <ModuleProgressBar progress={progress} className="mb-8" />

      {videos.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, idx) => (
            <VideoCardTracked
              key={v.id}
              video={v}
              position={idx + 1}
              isComplete={isComplete(v.id)}
              onPlay={() => onPlay(v)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ff7a18]/25 bg-[#ff7a18]/10 text-[#ffb066]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white">Em breve</p>
          <p className="mt-1 text-xs text-slate-400">
            Novas aulas deste módulo estão sendo preparadas. Volte em alguns dias.
          </p>
        </div>
      )}
    </section>
  );
}
