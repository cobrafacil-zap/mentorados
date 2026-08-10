"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Header compartilhado para as páginas novo/[id] do admin de vídeos.
 * Breadcrumb (Admin > Vídeos > Novo/Editar) + título + ações opcionais.
 */
export function VideoFormHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <nav aria-label="breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/admin" className="hover:text-white">Admin</Link>
          <span>/</span>
          <Link href="/admin/videos" className="hover:text-white">Vídeos</Link>
          <span>/</span>
          <span className="text-slate-300">{title}</span>
        </nav>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}