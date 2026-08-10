import { Section } from "./Section";
import { Reveal } from "./Reveal";

const STEPS = [
  { n: "01", t: "Atrair pessoas", d: "Utilizamos tráfego pago para levar pessoas interessadas até a operação." },
  { n: "02", t: "Entrada no grupo", d: "O visitante entra no grupo através de uma estrutura de captação." },
  { n: "03", t: "Retenção", d: "Depois de entrar, o objetivo é fazer com que a pessoa permaneça no grupo." },
  { n: "04", t: "Ofertas", d: "As ofertas são divulgadas de forma estratégica para gerar conversão." },
  { n: "05", t: "Comissão", d: "Os usuários compram através dos links e geram comissão para a operação." },
  { n: "06", t: "Análise", d: "A operação é acompanhada através das métricas que realmente importam." },
];

export function HowItWorks() {
  return (
    <Section
      id="como-funciona"
      eyebrow="Como funciona"
      title="Da atração ao resultado, em um fluxo claro"
      subtitle="Seis etapas que sustentam qualquer operação de grupos lucrativos — independentemente do nicho, do tamanho ou do orçamento."
    >
      <div className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, idx) => (
          <Reveal key={s.n} delayMs={idx * 60} className="group relative">
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
