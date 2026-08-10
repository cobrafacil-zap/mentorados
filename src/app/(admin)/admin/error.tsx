"use client";

// =========================================================
// Error boundary para /admin/* — captura exceções lançadas
// em server components da pasta admin. Mostra mensagem
// detalhada com botão "Tentar de novo".
//
// Em PRODUÇÃO o Next.js omite `error.message` por segurança.
// Para conseguir diagnosticar, este componente faz um ping no
// /api/admin/healthcheck e mostra o estado do banco/auth.
// =========================================================

import { useEffect, useState } from "react";
import Link from "next/link";

interface HealthResult {
  ok: boolean;
  timestamp: string;
  checks: Record<string, { ok: boolean; detail?: string }>;
  hint?: string;
}

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

  const [health, setHealth] = useState<HealthResult | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Roda healthcheck sempre que o erro aparecer — pode falhar
  // por banco, auth ou qualquer outra coisa.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/healthcheck", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: HealthResult) => {
        if (!cancelled) setHealth(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setHealthError(e instanceof Error ? e.message : "Falha no healthcheck");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [error.digest]);

  // `error.message` vem vazio em prod, mas `digest` está sempre presente.
  const failedChecks = health
    ? Object.entries(health.checks).filter(([, c]) => !c.ok)
    : [];

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

        {error.message && (
          <pre className="overflow-x-auto rounded-lg border border-[#ff5c7a]/20 bg-black/30 p-3 text-[11px] leading-relaxed text-[#ffb0bf]/80">
{error.message}
          </pre>
        )}

        {/* Diagnóstico automático */}
        {health ? (
          <div className="rounded-lg border border-white/10 bg-black/30 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
              <span className={health.ok ? "text-[#1fd29c]" : "text-[#ffb066]"}>
                {health.ok ? "✓ Tudo OK no servidor" : "⚠ Problemas detectados"}
              </span>
              <span className="text-slate-500">· {new Date(health.timestamp).toLocaleTimeString("pt-BR")}</span>
            </div>
            <div className="space-y-1 font-mono text-[10px]">
              {Object.entries(health.checks).map(([k, c]) => (
                <div key={k} className="flex gap-2">
                  <span className={c.ok ? "text-[#1fd29c]" : "text-[#ff5c7a]"}>
                    {c.ok ? "✓" : "✗"}
                  </span>
                  <span className="min-w-[140px] text-slate-300">{k}</span>
                  <span className="flex-1 text-slate-400">{c.detail ?? "—"}</span>
                </div>
              ))}
            </div>
            {failedChecks.length > 0 && (
              <div className="mt-3 border-t border-white/5 pt-3 text-[11px] text-slate-300">
                <strong className="text-[#ffb066]">Provável causa:</strong>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {failedChecks.map(([k]) => (
                    <li key={k}><code className="font-mono">{k}</code></li>
                  ))}
                </ul>
                {failedChecks.some(([k]) => k.startsWith("tabela.")) && (
                  <p className="mt-2 text-slate-400">
                    Tabela faltando → rode o SQL de migration no Supabase ou{" "}
                    <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-slate-200">
                      npx prisma migrate deploy
                    </code>
                    {" "}no terminal.
                  </p>
                )}
                {failedChecks.some(([k]) => k === "DATABASE_URL") && (
                  <p className="mt-2 text-slate-400">
                    DATABASE_URL ausente → adicione em{" "}
                    <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-slate-200">
                      .env
                    </code>
                    {" "}local ou nas variáveis de ambiente da Vercel.
                  </p>
                )}
                {failedChecks.some(([k]) => k === "NEXTAUTH_SECRET") && (
                  <p className="mt-2 text-slate-400">
                    NEXTAUTH_SECRET ausente → login vai falhar com 401.
                    Adicione em{" "}
                    <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-slate-200">
                      .env
                    </code>
                    {" "}ou Vercel.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : healthError ? (
          <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-[11px] text-slate-400">
            Falha ao consultar diagnóstico: {healthError}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-[11px] text-slate-500">
            Diagnosticando…
          </div>
        )}

        {error.digest && (
          <p className="text-[10px] text-slate-400">
            Digest: <code className="font-mono">{error.digest}</code>
          </p>
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
          <a
            href="/api/admin/healthcheck"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
          >
            Abrir diagnóstico ↗
          </a>
        </div>
      </div>
    </div>
  );
}
