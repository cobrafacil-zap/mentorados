"use client";

// =========================================================
// Botão "Sincronizar catálogo público"
//
// Chama POST /api/admin/videos/sync-static, que lê o banco,
// gera src/data/videos.ts e commita no GitHub via App.
// Vercel pega o commit e faz deploy automático em ~30s —
// aí /aulas pública reflete cria/editar/excluir do painel.
//
// Importante: NÃO é instantâneo. Cada clique gera um commit
// e um deploy novo. Use com moderação (depois de fazer várias
// edições, ou antes de divulgar uma atualização grande).
// =========================================================

import { useState } from "react";

type Status = "idle" | "checking" | "ready" | "syncing" | "success" | "error";

export function SyncCatalogButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);

  // Detecta se o sync está configurado (chama GET uma vez).
  async function checkConfig() {
    setStatus("checking");
    try {
      const res = await fetch("/api/admin/videos/sync-static", { method: "GET" });
      const data = (await res.json()) as { configured: boolean };
      setConfigured(data.configured);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
      setMessage("Falha ao checar configuração do sync.");
    }
  }

  async function handleSync() {
    setStatus("syncing");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/videos/sync-static", { method: "POST" });
      const data = (await res.json()) as {
        ok?: boolean;
        count?: number;
        commitUrl?: string;
        commitSha?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.detail ?? data.error ?? `Erro ${res.status}`);
        return;
      }
      setStatus("success");
      setMessage(
        `${data.count} aula(s) sincronizadas · commit ${data.commitSha?.slice(0, 7)} · Vercel vai deployar em ~30s`,
      );
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Falha de rede");
    }
  }

  if (status === "idle") {
    return (
      <button
        type="button"
        onClick={checkConfig}
        className="inline-flex items-center gap-2 rounded-lg border border-[#ff7a18]/35 bg-[#ff7a18]/10 px-3 py-1.5 text-xs font-semibold text-[#ffb066] hover:bg-[#ff7a18]/20"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 12a9 9 0 11-3-6.7L21 8m0 0V3m0 5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Sincronizar catálogo público
      </button>
    );
  }

  if (status === "checking") {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
        <Spinner /> Checando configuração…
      </span>
    );
  }

  if (status === "ready" && configured === false) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v4M12 16v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Sync não configurado — adicione GITHUB_APP_* no .env
      </span>
    );
  }

  if (status === "syncing") {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-[#ff7a18]/35 bg-[#ff7a18]/10 px-3 py-1.5 text-xs text-[#ffb066]">
        <Spinner /> Sincronizando catálogo…
      </span>
    );
  }

  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-[#1fd29c]/35 bg-[#1fd29c]/10 px-3 py-1.5 text-xs text-[#1fd29c]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {message ?? "Catálogo sincronizado"}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300">
        ⚠ {message ?? "Falha"}
      </span>
      <button
        type="button"
        onClick={handleSync}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
      >
        Tentar de novo
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}