import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { DEFAULT_CONTENT, type HowItWorksContent as Data } from "@/lib/pageContent";

const DEFAULTS = DEFAULT_CONTENT.page_metodo_how;

export function HowItWorks(props: Partial<Data> = {}) {
  const {
    eyebrow = DEFAULTS.eyebrow,
    title = DEFAULTS.title,
    subtitle = DEFAULTS.subtitle,
    steps = DEFAULTS.steps,
  } = props;

  return (
    <Section eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, idx) => (
          <Reveal key={`${s.n}-${idx}`} delayMs={idx * 60} className="group relative">
            <div className="glass relative h-full overflow-hidden rounded-2xl p-6 transition hover:-translate-y-1 hover:border-[#ff7a18]/35">
              <div className="mb-4 flex items-center gap-3">
                <div className="font-mono text-2xl font-bold text-[#ff7a18]">{s.n}</div>
                <div className="h-px flex-1 bg-gradient-to-r from-[#ff7a18]/40 to-transparent" />
              </div>
              <h3 className="text-lg font-semibold text-white">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.d}</p>
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#ff7a18]/5 blur-2xl transition group-hover:bg-[#ff7a18]/15" />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
