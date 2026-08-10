"use client";

// =========================================================
// ModuleProgressBar
// Barra + contador "X/N · NN%". Quando completo, barra fica
// verde (#1fd29c) e label vira "Módulo concluído ✓".
// =========================================================

import type { ModuleProgress } from "@/hooks/useVideoProgress";

export function ModuleProgressBar({
  progress,
  className = "",
}: {
  progress: ModuleProgress;
  className?: string;
}) {
  const { completed, total, pct, done } = progress;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="bar-track flex-1">
        <div
          className="bar-fill"
          style={{
            width: `${pct}%`,
            background: done
              ? "linear-gradient(90deg,#1fd29c,#3ce4b4)"
              : undefined,
          }}
        />
      </div>
      <div
        className={`min-w-[180px] text-right text-xs font-medium tabular-nums ${
          done ? "text-[#1fd29c]" : "text-slate-300"
        }`}
      >
        {done && total > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Módulo concluído
          </span>
        ) : (
          <>
            <span className="text-white">{completed}</span>
            <span className="text-slate-500">/{total} aulas</span>
            <span className="ml-2 inline-block rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-slate-300">
              {pct}%
            </span>
          </>
        )}
      </div>
    </div>
  );
}
