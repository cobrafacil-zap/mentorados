import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { DEFAULT_CONTENT, type DashboardContent as Data } from "@/lib/pageContent";

const DEFAULTS = DEFAULT_CONTENT.page_ferramentas_dashboard;

const METRICS = [
  {
    key: "cpl",
    label: "CPL",
    sub: "Custo por Lead",
    desc: "Quanto você paga, em média, por cada pessoa que entra na operação.",
    color: "#ff7a18",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 1v22M5 8a4 4 0 014-4h6a4 4 0 010 8H8a4 4 0 000 8h7a4 4 0 004-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "taxa",
    label: "Taxa de Entrada",
    sub: "% que entra",
    desc: "Percentual de pessoas que clicam no anúncio e, de fato, entram no grupo.",
    color: "#1d4ed8",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12l5 5L21 4M3 20h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "evasao",
    label: "Evasão",
    sub: "% que sai",
    desc: "Percentual de pessoas que entraram mas não permanecem ativas no grupo.",
    color: "#ff5c7a",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M16 17l5-5-5-5M21 12H9M13 21H5a2 2 0 01-2-2V5a2 2 0 012-2h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "custo-retido",
    label: "Custo por Lead Retido",
    sub: "CPL real",
    desc: "O custo real da pessoa que permanece — sempre maior que o CPL bruto quando há evasão.",
    color: "#ffb066",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h7M16 21l5-5M16 16l5 5M21 16v5h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "comissao",
    label: "Comissão",
    sub: "gerada",
    desc: "Soma das comissões geradas pelos usuários que compraram via link.",
    color: "#1fd29c",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M7 14l3-3 4 4 5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "ltv",
    label: "LTV",
    sub: "valor por pessoa",
    desc: "Quanto cada pessoa gera, em média, ao longo do tempo dentro da operação.",
    color: "#a78bfa",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 8v8M8 12h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function MetricsDashboard(props: Partial<Data> = {}) {
  const {
    eyebrow = DEFAULTS.eyebrow,
    titleBefore = DEFAULTS.titleBefore,
    titleHighlight = DEFAULTS.titleHighlight,
    titleAfter = DEFAULTS.titleAfter,
    subtitle = DEFAULTS.subtitle,
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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((m, idx) => (
          <Reveal key={m.key} delayMs={idx * 60}>
            <div
              className="glass relative h-full overflow-hidden rounded-2xl p-6 transition hover:-translate-y-1"
              style={{ borderColor: "rgba(99,130,200,0.18)" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{
                    background: `color-mix(in srgb, ${m.color} 18%, transparent)`,
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${m.color} 40%, transparent)`,
                  }}
                >
                  <span className="block h-5 w-5" style={{ color: m.color }}>{m.icon}</span>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {m.sub}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white">{m.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{m.desc}</p>
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
                style={{ background: `color-mix(in srgb, ${m.color} 15%, transparent)` }}
              />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
