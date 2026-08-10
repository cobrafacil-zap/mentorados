"use client";

import { useCallback, useEffect, useState } from "react";

// =========================================================
// Toast — feedback leve no canto inferior direito.
// API: useToast() devolve { toast, show(msg, tone) }
// <Toast toast={toast} /> deve ser renderizado uma vez.
// =========================================================

export type ToastTone = "success" | "danger" | "info";

export interface ToastApi {
  show: (message: string, tone?: ToastTone) => void;
  current: ToastState | null;
}

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

export function useToast(): ToastApi {
  const [current, setCurrent] = useState<ToastState | null>(null);

  const show = useCallback((message: string, tone: ToastTone = "info") => {
    setCurrent({ id: Date.now(), message, tone });
  }, []);

  return { show, current };
}

export function Toast({ toast }: { toast: ToastApi }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast.current) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(t);
  }, [toast.current]);

  if (!toast.current) return null;

  const toneClasses: Record<ToastTone, string> = {
    success: "border-[#1fd29c]/40 bg-[#1fd29c]/15 text-[#1fd29c]",
    danger: "border-[#ff5c7a]/40 bg-[#ff5c7a]/15 text-[#ffb0bf]",
    info: "border-white/15 bg-white/[0.06] text-white",
  };

  const icon = (() => {
    switch (toast.current.tone) {
      case "success":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "danger":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  })();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-6 right-6 z-[200] flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur transition-all duration-200 ${
        toneClasses[toast.current.tone]
      } ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
    >
      {icon}
      <span className="font-medium">{toast.current.message}</span>
    </div>
  );
}