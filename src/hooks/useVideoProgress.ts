"use client";

// =========================================================
// useVideoProgress
// Estado de "aulas assistidas" persistido em localStorage.
// SSR-safe: antes de hidratar, completedIds está vazio e
// `hydrated` é false (UI pode esconder badges durante SSR).
//
// Storage key: "gl:video-progress"
// Valor: Record<videoId, true>
// =========================================================

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "gl:video-progress";

function safeRead(): Record<string, true> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, true>;
    }
    return {};
  } catch {
    return {};
  }
}

function safeWrite(record: Record<string, true>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Safari private / quota cheia — opera só em memória.
  }
}

export interface ModuleProgress {
  completed: number;
  total: number;
  /** 0–100, inteiro */
  pct: number;
  /** todas as aulas do módulo marcadas (e total > 0) */
  done: boolean;
}

export interface UseVideoProgressApi {
  hydrated: boolean;
  completedIds: Set<string>;
  isComplete: (id: string) => boolean;
  mark: (id: string) => void;
  unmark: (id: string) => void;
  toggle: (id: string) => void;
  reset: () => void;
  moduleProgress: (videoIds: string[]) => ModuleProgress;
}

export function useVideoProgress(): UseVideoProgressApi {
  const [hydrated, setHydrated] = useState(false);
  const [record, setRecord] = useState<Record<string, true>>({});

  // Hidratação: lê do localStorage uma vez.
  useEffect(() => {
    setRecord(safeRead());
    setHydrated(true);
  }, []);

  const completedIds = useMemo(() => new Set(Object.keys(record)), [record]);

  const isComplete = useCallback(
    (id: string) => completedIds.has(id),
    [completedIds],
  );

  const writeAndPersist = useCallback((next: Record<string, true>) => {
    setRecord(next);
    safeWrite(next);
  }, []);

  const mark = useCallback(
    (id: string) => {
      if (!id) return;
      setRecord((prev) => {
        if (prev[id]) return prev;
        const next = { ...prev, [id]: true as const };
        safeWrite(next);
        return next;
      });
    },
    [],
  );

  const unmark = useCallback((id: string) => {
    if (!id) return;
    setRecord((prev) => {
      if (!prev[id]) return prev;
      const { [id]: _omit, ...rest } = prev;
      void _omit;
      safeWrite(rest);
      return rest;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    if (!id) return;
    setRecord((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      safeWrite(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    writeAndPersist({});
  }, [writeAndPersist]);

  const moduleProgress = useCallback(
    (videoIds: string[]): ModuleProgress => {
      const total = videoIds.length;
      let completed = 0;
      for (const id of videoIds) {
        if (completedIds.has(id)) completed += 1;
      }
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        completed,
        total,
        pct,
        done: total > 0 && completed === total,
      };
    },
    [completedIds],
  );

  return {
    hydrated,
    completedIds,
    isComplete,
    mark,
    unmark,
    toggle,
    reset,
    moduleProgress,
  };
}
