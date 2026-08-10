"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { DEFAULT_CONTENT, type GlobalNavbar as NavbarData } from "@/lib/pageContent";

const NAVBAR_DEFAULTS = DEFAULT_CONTENT.global_navbar;

export function Navbar(props: Partial<NavbarData> = {}) {
  const links = props.links ?? NAVBAR_DEFAULTS.links;
  const ctaLabel = props.ctaLabel ?? NAVBAR_DEFAULTS.ctaLabel;
  const ctaHref = props.ctaHref ?? NAVBAR_DEFAULTS.ctaHref;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // trava o scroll quando o menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // fecha o menu mobile ao trocar de rota
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050a1a]/85 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Método GL">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu principal">
          {links.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link href={ctaHref} className="btn-primary text-sm">
            {ctaLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Botão hambúrguer (mobile) */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-200 hover:bg-white/5 lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <div className="relative h-5 w-6">
            <span
              className={`absolute left-0 top-1 block h-0.5 w-6 rounded bg-current transition ${
                open ? "translate-y-1.5 rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 rounded bg-current transition ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute bottom-1 left-0 block h-0.5 w-6 rounded bg-current transition ${
                open ? "-translate-y-1.5 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden border-b border-white/5 bg-[#060c25]/95 backdrop-blur-xl transition-[max-height] duration-300 ${
          open ? "max-h-[480px]" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Menu mobile">
          {links.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href={ctaHref} className="btn-primary mt-2 text-sm">
            {ctaLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}