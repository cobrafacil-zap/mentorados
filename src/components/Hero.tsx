"use client";

import Link from "next/link";
import { DEFAULT_CONTENT, type HomeHero as HomeHeroData } from "@/lib/pageContent";

const HERO_DEFAULTS = DEFAULT_CONTENT.home_hero;

export function Hero(props: Partial<HomeHeroData> = {}) {
  const {
    eyebrow = HERO_DEFAULTS.eyebrow,
    titleBefore = HERO_DEFAULTS.titleBefore,
    titleHighlight = HERO_DEFAULTS.titleHighlight,
    titleAfter = HERO_DEFAULTS.titleAfter,
    subtitle = HERO_DEFAULTS.subtitle,
    ctaPrimaryLabel = HERO_DEFAULTS.ctaPrimaryLabel,
    ctaPrimaryHref = HERO_DEFAULTS.ctaPrimaryHref,
    ctaSecondaryLabel = HERO_DEFAULTS.ctaSecondaryLabel,
    ctaSecondaryHref = HERO_DEFAULTS.ctaSecondaryHref,
    bullets = HERO_DEFAULTS.bullets,
  } = props;

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-24">
      {/* grid sutil de fundo */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      {/* blobs */}
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#1d4ed8]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-[#ff7a18]/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:gap-10 lg:px-8">
        {/* Coluna texto */}
        <div className="animate-slide-up lg:col-span-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffb066]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff7a18] animate-pulse-dot" />
            {eyebrow}
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {titleBefore}{" "}
            {titleHighlight && (
              <span className="text-gradient-orange">{titleHighlight}</span>
            )}{" "}
            {titleAfter}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={ctaPrimaryHref} className="btn-primary">
              {ctaPrimaryLabel}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href={ctaSecondaryHref} className="btn-ghost">
              {ctaSecondaryLabel}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-400">
            {bullets.map((b) => (
              <div key={b} className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="#1fd29c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Visual: preview compacto de uma aula */}
        <div className="relative animate-slide-up delay-200 lg:col-span-2">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-[#1d4ed8]/30 via-transparent to-[#ff7a18]/25 blur-2xl" />
      <div className="glass-strong relative overflow-hidden rounded-2xl shadow-2xl animate-float">
        {/* Thumbnail simulando vídeo */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=70"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050a1a] via-[#050a1a]/30 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff7a18]/95 text-white shadow-[0_8px_40px_rgba(255,122,24,0.6)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#ff7a18] px-3 py-1 text-xs font-semibold text-black">
            <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse-dot" />
            Aula em destaque
          </div>
        </div>
        {/* Rodapé do card */}
        <div className="p-5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
            Comece por aqui
          </div>
          <div className="mt-1 text-base font-semibold text-white">
            Bem-vindo ao Método GL
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1fd29c]" />
              Conteúdo gratuito
            </span>
            <span>12:34</span>
          </div>
        </div>
      </div>
    </div>
  );
}