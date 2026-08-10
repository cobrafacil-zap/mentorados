"use client";

import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { DEFAULT_CONTENT, type MethodExplainerContent as Data } from "@/lib/pageContent";

const STEPS_ICONS: Record<string, React.ReactNode> = {
  trafego: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12l18-8-6 18-3-7-9-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  entrada: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  retencao: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s-7-4.35-7-10a5 5 0 019-3 5 5 0 019 3c0 5.65-7 10-7 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  ofertas: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 12l-8 8-9-9V3h8l9 9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  comissao: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 1v22M5 8a4 4 0 014-4h6a4 4 0 010 8H8a4 4 0 000 8h7a4 4 0 004-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  lucro: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 17l6-6 4 4 8-8M21 7h-5M21 7v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const ICON_FALLBACK = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const DEFAULTS = DEFAULT_CONTENT.page_metodo_explainer;

/** Slugs determinísticos (1, 2, …) usados quando o admin não salva `key`. */
function slugify(title: string, idx: number): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    || `step${idx + 1}`;
}

export function MethodExplainer(props: Partial<Data> = {}) {
  const {
    eyebrow = DEFAULTS.eyebrow,
    titleBefore = DEFAULTS.titleBefore,
    titleHighlight = DEFAULTS.titleHighlight,
    titleAfter = DEFAULTS.titleAfter,
    subtitle = DEFAULTS.subtitle,
    steps = DEFAULTS.steps,
  } = props;

  return (
    <Section
      eyebrow={eyebrow}
      title={
        <>
          {titleBefore}{" "}
          {titleHighlight && <span className="text-gradient-orange">{titleHighlight}</span>}{" "}
          {titleAfter}
        </>
      }
      subtitle={subtitle}
    >
      {/* Fluxo visual */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-[#ff7a18]/30 to-transparent lg:block" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map((s, idx) => {
            const key = slugify(s.title, idx);
            const icon = STEPS_ICONS[key] ?? ICON_FALLBACK;
            return (
              <Reveal key={`${key}-${idx}`} delayMs={idx * 80}>
                <div className="group glass relative h-full rounded-2xl p-5 transition hover:-translate-y-1 hover:border-[#ff7a18]/40">
                  <div className="absolute -top-3 left-5 rounded-full border border-white/10 bg-[#060c25] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-400">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff7a18]/15 text-[#ffb066] ring-1 ring-[#ff7a18]/30 transition group-hover:scale-105">
                    <span className="block h-5 w-5">{icon}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400 opacity-90 transition group-hover:opacity-100">
                    {s.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
