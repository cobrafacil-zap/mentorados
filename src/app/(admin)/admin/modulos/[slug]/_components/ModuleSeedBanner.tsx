"use client";

import { useState } from "react";

/**
 * Banner exibido em `/admin/modulos/<slug>` quando o banco de vídeos
 * está vazio. Botão "Importar exemplo" chama `/api/admin/videos/seed`,
 * que popula as 10 aulas de `data/videos.ts`. `onSeeded` é chamado
 * após sucesso para o pai recarregar.
 */
export function ModuleSeedBanner({ onSeeded }: { onSeeded: () => void }) {
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const run = async () => {
    setSeeding(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/videos/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha no seed");
      setFeedback(`Importados ${data.created} vídeos · ${data.updated} já existiam.`);
      onSeeded();
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Erro ao importar");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ff7a18]/30 bg-[#ff7a18]/[0.06] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ff7a18]/30 bg-[#ff7a18]/15 text-[#ffb066]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 4v12M6 10l6 6 6-6M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <div className="text-sm font-semibold text-white">Nenhuma aula neste módulo ainda</div>
          <div className="text-xs text-slate-300">
            {feedback ?? "Importe o pacote inicial de vídeos para começar a preencher as trilhas."}
          </div>
        </div>
      </div>
      <button
        onClick={run}
        disabled={seeding}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {seeding ? "Importando…" : "Importar exemplo"}
      </button>
    </div>
  );
}
