"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// =========================================================
// ConfirmDialog — diálogo de confirmação acessível.
// API: useConfirm() devolve { confirm, ask(opts) } que retorna Promise<boolean>.
// <ConfirmDialog confirm={confirm} /> deve ser renderizado uma vez.
// =========================================================

interface AskOpts {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
}

export interface ConfirmApi {
  ask: (opts: AskOpts) => Promise<boolean>;
  current: AskOpts | null;
  resolve: ((v: boolean) => void) | null;
}

export function useConfirm(): ConfirmApi {
  const [current, setCurrent] = useState<AskOpts | null>(null);
  const [resolve, setResolve] = useState<((v: boolean) => void) | null>(null);

  const ask = useCallback((opts: AskOpts) => {
    setCurrent(opts);
    return new Promise<boolean>((res) => setResolve(() => res));
  }, []);

  const close = useCallback(
    (answer: boolean) => {
      if (resolve) resolve(answer);
      setResolve(null);
      setCurrent(null);
    },
    [resolve],
  );

  return { ask, current, resolve: close };
}

export function ConfirmDialog({ confirm }: { confirm: ConfirmApi }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Fechar com Esc.
  useEffect(() => {
    if (!confirm.current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") confirm.resolve?.(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm]);

  if (!mounted || !confirm.current) return null;

  const opts = confirm.current;
  const isDanger = opts.tone === "danger";

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-[#04081a]/75 px-3 py-6 backdrop-blur-md animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="glass-strong w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-up">
        <div className="mb-3 flex items-start gap-3">
          <span
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${
              isDanger
                ? "bg-[#ff5c7a]/15 text-[#ff5c7a] ring-[#ff5c7a]/30"
                : "bg-[#ff7a18]/15 text-[#ffb066] ring-[#ff7a18]/30"
            }`}
          >
            {isDanger ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3l10 18H2L12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 10v4M12 17v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </span>
          <div className="min-w-0">
            <h3 id="confirm-title" className="text-base font-semibold text-white">
              {opts.title}
            </h3>
            <p className="mt-1 text-sm text-slate-300">{opts.message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => confirm.resolve?.(false)}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            {opts.cancelLabel ?? "Cancelar"}
          </button>
          <button
            type="button"
            onClick={() => confirm.resolve?.(true)}
            className={
              isDanger
                ? "rounded-lg border border-[#ff5c7a]/40 bg-[#ff5c7a]/15 px-4 py-2 text-sm font-semibold text-[#ffb0bf] hover:bg-[#ff5c7a]/25"
                : "btn-primary"
            }
          >
            {opts.confirmLabel ?? "Confirmar"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
