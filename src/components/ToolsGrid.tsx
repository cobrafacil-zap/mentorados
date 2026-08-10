"use client";

import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { DEFAULT_CONTENT, type ToolsContent as Data, type ToolItem } from "@/lib/pageContent";

const TOOLS_ICONS: React.ReactNode[] = [
  // 0: calculadora
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0M8 19h2M12 19h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>,
  // 1: CPL
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 12l4-4M3 12l4 4M3 12h12a6 6 0 016 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // 2: comissão
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>,
  // 3: simulador
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 20h16M4 14l5-5 4 4 7-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

const ICON_FALLBACK = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const DEFAULTS = DEFAULT_CONTENT.page_ferramentas_tools;

export function ToolsGrid(props: Partial<Data> = {}) {
  const {
    eyebrow = DEFAULTS.eyebrow,
    title = DEFAULTS.title,
    subtitle = DEFAULTS.subtitle,
    tools = DEFAULTS.tools,
  } = props;

  // Se nenhum header foi configurado, renderiza sem Section (compat com a versão atual)
  const hasHeader = Boolean(eyebrow || title || subtitle);

  const grid = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {(tools as ToolItem[]).map((t, idx) => (
        <Reveal key={`${t.name}-${idx}`} delayMs={idx * 60}>
          <a
            href={t.accent ? t.href : undefined}
            onClick={(e) => !t.accent && e.preventDefault()}
            className={`group relative block h-full overflow-hidden rounded-2xl border border-white/10 p-5 transition ${
              t.accent
                ? "glass hover:-translate-y-1 hover:border-[#ff7a18]/40"
                : "bg-white/[0.02] opacity-90 hover:opacity-100"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  t.accent
                    ? "bg-[#ff7a18]/15 text-[#ffb066] ring-1 ring-[#ff7a18]/30"
                    : "bg-white/5 text-slate-400"
                }`}
              >
                <span className="block h-5 w-5">{TOOLS_ICONS[idx] ?? ICON_FALLBACK}</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  t.accent
                    ? "bg-[#1fd29c]/15 text-[#1fd29c]"
                    : "bg-white/5 text-slate-500"
                }`}
              >
                {t.status}
              </span>
            </div>
            <h3 className="text-base font-semibold text-white">{t.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{t.description}</p>
            <div
              className={`mt-4 inline-flex items-center gap-2 text-xs font-semibold ${
                t.accent ? "text-[#ffb066] group-hover:text-white" : "text-slate-500"
              }`}
            >
              {t.cta}
              {t.accent && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {t.accent && (
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#ff7a18]/10 blur-2xl" />
            )}
          </a>
        </Reveal>
      ))}
    </div>
  );

  if (!hasHeader) return grid;

  return (
    <Section eyebrow={eyebrow} title={title} subtitle={subtitle}>
      {grid}
    </Section>
  );
}
