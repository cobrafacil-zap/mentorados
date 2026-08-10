"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Header compartilhado para as páginas nova/[id] do admin de aulas.
 * Breadcrumb (Admin > <parentLabel> > <title>) + título + ações opcionais.
 *
 * Aceita `parentHref` e `parentLabel` para que a hierarquia de pão
 * acompanhe a rota: `/admin/modulos/<slug>/aulas/...` usa
 * `parentHref="/admin/modulos/<slug>" parentLabel="Fundamentos"`.
 *
 * Default: `/admin/modulos` (a página `/admin/videos` foi removida
 * — agora redireciona para `/admin/modulos`).
 */
export function VideoFormHeader({
  title,
  subtitle,
  parentHref,
  parentLabel,
  right,
}: {
  title: string;
  subtitle?: string;
  parentHref?: string;
  parentLabel?: string;
  right?: ReactNode;
}) {
  const parent = parentHref ?? "/admin/modulos";
  const label = parentLabel ?? "Módulos";

  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <nav aria-label="breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/admin" className="hover:text-white">Admin</Link>
          <span>/</span>
          <Link href={parent} className="hover:text-white">{label}</Link>
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
