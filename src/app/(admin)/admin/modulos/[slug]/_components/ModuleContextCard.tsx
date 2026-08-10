import Link from "next/link";
import type { Video } from "@prisma/client";
import type { ModuleDef } from "@/lib/modules";
import { videoCategoryLabel } from "@/lib/videoCategories";

/**
 * Card lateral que mostra em qual módulo a aula editada está
 * e lista as outras aulas do mesmo módulo (atual destacada).
 * Cada item leva à edição daquela aula.
 *
 * Aceita `slug` para apontar os links internos para a nova
 * hierarquia `/admin/modulos/<slug>/aulas/<id>`.
 */
export function ModuleContextCard({
  module: mod,
  videos,
  currentId,
  slug,
}: {
  module: ModuleDef;
  videos: Video[];
  currentId: string;
  slug: string;
}) {
  return (
    <aside className="glass-strong rounded-2xl p-5">
      <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff7a18] animate-pulse-dot" />
        Módulo {mod.order} de 4
      </div>
      <h2 className="text-lg font-bold text-white">
        <span className="text-gradient-orange">{mod.shortTitle}</span>
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">{mod.summary}</p>

      <div className="mt-5 border-t border-white/5 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Aulas do módulo
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] tabular-nums text-slate-300">
            {videos.length}
          </span>
        </div>

        {videos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-slate-400">
            Nenhuma aula neste módulo ainda.
          </p>
        ) : (
          <ol className="space-y-1">
            {videos.map((v, idx) => {
              const isCurrent = v.id === currentId;
              return (
                <li key={v.id}>
                  <Link
                    href={`/admin/modulos/${slug}/aulas/${v.id}`}
                    className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-xs transition ${
                      isCurrent
                        ? "border-[#ff7a18]/45 bg-[#ff7a18]/10 text-white"
                        : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                    }`}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    <span
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                        isCurrent
                          ? "bg-[#ff7a18] text-black"
                          : "bg-white/[0.06] text-slate-400"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{v.title}</span>
                    <span
                      className={`rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
                        v.published
                          ? "border-[#1fd29c]/35 bg-[#1fd29c]/15 text-[#1fd29c]"
                          : "border-white/10 bg-white/[0.04] text-slate-400"
                      }`}
                    >
                      {v.published ? "Pub" : "Rasc"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="mt-4 border-t border-white/5 pt-4">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Categorias no módulo
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {mod.videoCategoryKeys.map((c) => (
            <span
              key={c}
              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-200"
            >
              {videoCategoryLabel(c)}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
