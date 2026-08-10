"use client";

// =========================================================
// Error boundary para /admin/* — captura exceções lançadas
// em server components da pasta admin. Mostra mensagem
// detalhada com botão "Tentar de novo".
// =========================================================

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin error]", error);
  }, [error]);

  const isDbError =
    error.message?.toLowerCase().includes("does not exist") ||
    error.message?.toLowerCase().includes("relation") ||
    error.message?.toLowerCase().includes("connect") ||
    error.message?.toLowerCase().includes("database") ||
    error.message?.toLowerCase().includes("econnrefused");

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-2xl border border-[#ff5c7a]/40 bg-[#ff5c7a]/10 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#ffb0bf]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Algo deu errado ao carregar essa página
        </div>
        <pre className="overflow-x-auto rounded-lg border border-[#ff5c7a]/20 bg-black/30 p-3 text-[11px] leading-relaxed text-[#ffb0bf]/80">
{error.message || "Erro desconhecido"}
        </pre>
        {error.digest && (
          <p className="text-[10px] text-slate-400">Digest: {error.digest}</p>
        )}
        {isDbError && (
          <div className="rounded-lg border border-[#ffb066]/30 bg-[#ffb066]/5 p-3 text-xs text-slate-200">
            <strong className="text-[#ffb066]">Provavelmente o banco não tem as tabelas.</strong>
            <br />
            Rode <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px]">npx prisma migrate deploy</code>
            {" "}no servidor (ou{" "}
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px]">npx prisma db push</code>
            {" "}em dev). A migration{" "}
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px]">20260810172159_add_page_content</code>
            {" "}cria todas as tabelas (User, Mentorado, Video, VideoCategory, PageContent).
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-[#ff5c7a]/30 bg-[#ff5c7a]/10 px-3 py-1.5 text-xs font-medium text-[#ffb0bf] hover:bg-[#ff5c7a]/20"
          >
            Tentar de novo
          </button>
          <Link
            href="/admin"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
          >
            Voltar para o admin
          </Link>
        </div>
      </div>
    </div>
  );
}
