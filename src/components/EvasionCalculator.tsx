"use client";

import { useMemo, useState } from "react";
import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { NumberField } from "./NumberField";
import { EvasionChart } from "./EvasionChart";
import { BRL, INT, PCT, calculate } from "@/lib/calc";

const SIMULATOR_VALUES = [0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50] as const;
const DEFAULT_INPUTS = {
  investimento: 1000,
  pessoasEntraram: 500,
  evasao: 0.40,
  comissaoMedia: 15,
};

export function EvasionCalculator() {
  const [investimento, setInvestimento] = useState(DEFAULT_INPUTS.investimento);
  const [pessoasEntraram, setPessoasEntraram] = useState(DEFAULT_INPUTS.pessoasEntraram);
  const [evasao, setEvasao] = useState(DEFAULT_INPUTS.evasao);
  const [comissaoMedia, setComissaoMedia] = useState(DEFAULT_INPUTS.comissaoMedia);

  const inputs = { investimento, pessoasEntraram, evasao, comissaoMedia };
  const result = useMemo(() => calculate(inputs), [investimento, pessoasEntraram, evasao, comissaoMedia]);

  const investimentoInvalid = investimento < 0;
  const pessoasInvalid = pessoasEntraram <= 0;
  const comissaoInvalid = comissaoMedia < 0;
  const hasError = investimentoInvalid || pessoasInvalid || comissaoInvalid;

  // Cenários do simulador
  const cenarios = useMemo(
    () =>
      SIMULATOR_VALUES.map((e) => ({
        evasao: e,
        ...calculate({ ...inputs, evasao: e }),
      })),
    [investimento, pessoasEntraram, comissaoMedia]
  );

  const sliderPct = Math.round(((evasao - 0.1) / (0.7 - 0.1)) * 100);

  return (
    <Section
      id="calculadora"
      eyebrow="Ferramenta"
      title={<>Calculadora de <span className="text-gradient-orange">Evasão</span></>}
      subtitle="Descubra quanto realmente custa cada pessoa que permanece na sua operação."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <Reveal className="lg:col-span-2">
          <div className="glass h-full rounded-2xl p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff7a18]/15 text-[#ffb066] ring-1 ring-[#ff7a18]/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              Dados da operação
            </div>

            <div className="space-y-4">
              <NumberField
                label="Investimento em tráfego"
                hint="valor total"
                value={investimento}
                onChange={setInvestimento}
                prefix="R$"
                decimals={2}
                invalid={investimentoInvalid}
                invalidMessage="Informe um valor maior ou igual a zero."
              />
              <NumberField
                label="Pessoas que entraram"
                hint="quantidade"
                value={pessoasEntraram}
                onChange={setPessoasEntraram}
                decimals={0}
                invalid={pessoasInvalid}
                invalidMessage="Informe uma quantidade maior que zero."
              />
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-300">
                  <span>Evasão</span>
                  <span className="text-[#ffb066]">{PCT(evasao, 0)}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={70}
                  step={1}
                  value={Math.round(evasao * 100)}
                  onChange={(e) => setEvasao(Number(e.target.value) / 100)}
                  className="gl-range"
                  style={{ ["--pct" as string]: `${sliderPct}%` }}
                />
                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                  <span>10%</span>
                  <span>40%</span>
                  <span>70%</span>
                </div>
              </div>
              <NumberField
                label="Comissão média por pessoa"
                hint="R$"
                value={comissaoMedia}
                onChange={setComissaoMedia}
                prefix="R$"
                decimals={2}
                invalid={comissaoInvalid}
                invalidMessage="Informe uma comissão maior ou igual a zero."
              />
            </div>

            <button
              onClick={() => {
                setInvestimento(DEFAULT_INPUTS.investimento);
                setPessoasEntraram(DEFAULT_INPUTS.pessoasEntraram);
                setEvasao(DEFAULT_INPUTS.evasao);
                setComissaoMedia(DEFAULT_INPUTS.comissaoMedia);
              }}
              className="mt-5 text-xs font-medium text-slate-400 transition hover:text-white"
            >
              Restaurar exemplo
            </button>
          </div>
        </Reveal>

        {/* Resultados principais */}
        <Reveal delayMs={100} className="lg:col-span-3">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                label="CPL"
                description="Custo por entrada"
                value={BRL(result.cpl)}
                accent="orange"
              />
              <ResultCard
                label="Pessoas que permaneceram"
                description={`${INT(pessoasEntraram)} × ${PCT(1 - evasao, 0)}`}
                value={INT(result.pessoasPermaneceram)}
                accent="blue"
              />
              <ResultCard
                label="Custo por pessoa retida"
                description="O CPL real da operação"
                value={BRL(result.custoPorPessoaRetida)}
                accent="orange-strong"
                highlight
              />
              <ResultCard
                label="Pessoas perdidas"
                description={`${INT(pessoasEntraram)} × ${PCT(evasao, 0)}`}
                value={INT(result.pessoasPerdidas)}
                accent="danger"
              />
              <ResultCard
                label="Comissão potencial"
                description="Permaneceram × comissão"
                value={BRL(result.comissaoPotencial)}
                accent="success"
              />
              <ResultCard
                label="Resultado estimado"
                description="Comissão − investimento"
                value={BRL(result.resultadoEstimado)}
                accent={result.resultadoEstimado >= 0 ? "success" : "danger"}
                highlight
              />
            </div>

            {/* Conceito de Lead Final */}
            <div className="glass relative overflow-hidden rounded-2xl p-6">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#ff7a18]/15 blur-2xl" />
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
                Conceito-chave
              </div>
              <h3 className="text-lg font-semibold text-white">
                Custo por Lead Retido
              </h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300">
                O CPL mostra quanto você paga para trazer alguém para dentro da operação.
                Mas, se parte dessas pessoas sai, o custo real daquela pessoa que permanece
                é maior.
              </p>

              <div className="mt-5 grid items-center gap-3 sm:grid-cols-3">
                <FlowStep
                  label="CPL"
                  value={BRL(result.cpl)}
                  tone="muted"
                />
                <Arrow />
                <FlowStep
                  label="Evasão"
                  value={PCT(evasao, 0)}
                  tone="muted"
                />
                <Arrow hideOnMobile />
                <FlowStep
                  label="Custo por Lead Retido"
                  value={BRL(result.custoPorPessoaRetida)}
                  tone="orange"
                />
              </div>

              <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                <p>
                  Você paga <span className="font-semibold text-white">{BRL(result.cpl)}</span> por entrada.
                </p>
                <p>
                  Com <span className="font-semibold text-white">{PCT(evasao, 0)}</span> de evasão.
                </p>
                <p>
                  Custo real por pessoa retida:{" "}
                  <span className="font-semibold text-[#ffb066]">{BRL(result.custoPorPessoaRetida)}</span>.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Simulador + Gráfico */}
      <Reveal delayMs={150}>
        <div className="mt-10">
          <div className="mb-6 max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
              Simulador
            </div>
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              E se minha evasão fosse menor?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Compare cenários e veja como a evasão impacta o custo real de cada
              pessoa que permanece — e o resultado final da operação.
            </p>
          </div>

          {/* Slider grande */}
          <div className="glass mb-6 rounded-2xl p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Arraste para simular
              </div>
              <div className="rounded-md border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-sm font-semibold text-[#ffb066]">
                {PCT(evasao, 0)} de evasão
              </div>
            </div>
            <input
              type="range"
              min={20}
              max={50}
              step={1}
              value={Math.round(evasao * 100)}
              onChange={(e) => setEvasao(Number(e.target.value) / 100)}
              className="gl-range"
              style={{ ["--pct" as string]: `${sliderPct}%` }}
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-500">
              {SIMULATOR_VALUES.map((v) => (
                <span key={v}>{Math.round(v * 100)}%</span>
              ))}
            </div>
          </div>

          {/* Cards de cenários */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cenarios.map((c) => {
              const isCurrent = Math.abs(c.evasao - evasao) < 0.001;
              return (
                <div
                  key={c.evasao}
                  className={`relative overflow-hidden rounded-2xl border p-5 transition ${
                    isCurrent
                      ? "border-[#ff7a18]/50 bg-[#ff7a18]/5 ring-orange"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute right-3 top-3 rounded-full bg-[#ff7a18] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                      Atual
                    </div>
                  )}
                  <div className="text-xs uppercase tracking-wider text-slate-400">
                    Com {PCT(c.evasao, 0)} de evasão
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Entraram</span>
                      <span className="font-semibold text-white">{INT(pessoasEntraram)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Permaneceram</span>
                      <span className="font-semibold text-white">{INT(c.pessoasPermaneceram)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Custo / retida</span>
                      <span className="font-semibold text-[#ffb066]">{BRL(c.custoPorPessoaRetida)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Resultado</span>
                      <span
                        className={`font-semibold ${
                          c.resultadoEstimado >= 0 ? "text-[#1fd29c]" : "text-[#ff5c7a]"
                        }`}
                      >
                        {BRL(c.resultadoEstimado)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-5 rounded-xl border border-[#1fd29c]/20 bg-[#1fd29c]/5 px-4 py-3 text-sm text-slate-200">
            <span className="font-semibold text-[#1fd29c]">Conclusão:</span>{" "}
            quanto menor a evasão, menor o custo real de aquisição de cada pessoa
            que permanece — e maior o resultado da operação.
          </p>
        </div>
      </Reveal>

      {/* Gráfico */}
      <Reveal delayMs={200}>
        <div className="mt-10">
          <EvasionChart
            investimento={investimento}
            pessoasEntraram={pessoasEntraram}
            comissaoMedia={comissaoMedia}
            evasaoAtual={evasao}
          />
        </div>
      </Reveal>
    </Section>
  );
}

function ResultCard({
  label,
  description,
  value,
  accent,
  highlight,
}: {
  label: string;
  description: string;
  value: string;
  accent: "orange" | "orange-strong" | "blue" | "success" | "danger";
  highlight?: boolean;
}) {
  const accentMap: Record<typeof accent, string> = {
    orange: "text-[#ffb066]",
    "orange-strong": "text-[#ff7a18]",
    blue: "text-[#a3b8ff]",
    success: "text-[#1fd29c]",
    danger: "text-[#ff5c7a]",
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        highlight
          ? "border-[#ff7a18]/35 bg-[#ff7a18]/[0.06]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold ${accentMap[accent]}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-500">{description}</div>
      {highlight && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#ff7a18]/15 blur-2xl" />
      )}
    </div>
  );
}

function FlowStep({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "orange";
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border px-4 py-3 text-center ${
        tone === "orange"
          ? "border-[#ff7a18]/40 bg-[#ff7a18]/10"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div
        className={`mt-0.5 text-base font-bold ${
          tone === "orange" ? "text-[#ffb066]" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Arrow({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${hideOnMobile ? "hidden sm:flex" : ""}`}>
      <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-hidden="true">
        <path
          d="M2 10h26M22 4l6 6-6 6"
          stroke="#ff7a18"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
