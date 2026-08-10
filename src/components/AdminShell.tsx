"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

type NavKey = "dashboard" | "mentorados" | "videos" | "modulos" | "conteudo";

interface NavItem {
  key: NavKey;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV: NavItem[] = [
  {
    key: "dashboard",
    label: "Visão geral",
    href: "/admin",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12L12 4l9 8M5 10v10h5v-6h4v6h5V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "videos",
    label: "Vídeos",
    href: "/admin/videos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 9.5l4 2.5-4 2.5v-5z" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "modulos",
    label: "Módulos",
    href: "/admin/modulos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    key: "conteudo",
    label: "Conteúdo",
    href: "/admin/conteudo",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 5h16v3H4zM4 11h16v3H4zM4 17h10v3H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "mentorados",
    label: "Mentorados",
    href: "/admin",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

/** Acha o item de nav ativo dado o pathname. */
function activeKey(pathname: string | null): NavKey {
  if (!pathname) return "dashboard";
  if (pathname.startsWith("/admin/videos")) return "videos";
  if (pathname.startsWith("/admin/modulos")) return "modulos";
  if (pathname.startsWith("/admin/conteudo")) return "conteudo";
  if (pathname.startsWith("/admin/mentorados")) return "mentorados";
  return "dashboard";
}

/**
 * Layout do painel admin — sidebar à esquerda + área principal.
 * Visual consistente com o site público (paleta azul profundo + laranja).
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = activeKey(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o menu mobile ao trocar de rota.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-2 pb-6 pt-1">
        <Logo />
        <div className="ml-auto rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
          Admin
        </div>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Navegação do painel">
        {NAV.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "border border-[#ff7a18]/35 bg-[#ff7a18]/10 text-white"
                  : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={isActive ? "text-[#ffb066]" : "text-slate-400"}>{item.icon}</span>
              {item.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ff7a18] animate-pulse-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-xs text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M14 4h6v6M20 4l-8 8M10 6H4v14h14v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Ver site
        </Link>
        <LogoutButton />
      </div>
    </>
  );

  return (
    <div className="min-h-screen text-white">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[#050a1a]/90 px-4 py-3 backdrop-blur md:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-white/5 bg-[#050a1a]/80 px-4 py-5 backdrop-blur md:flex md:flex-col">
          <SidebarContent />
        </aside>

        {/* Sidebar (mobile drawer) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-[#04081a]/70 backdrop-blur"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-white/10 bg-[#050a1a] px-4 py-5">
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Conteúdo */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}